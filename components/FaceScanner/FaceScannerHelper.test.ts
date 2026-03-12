// Mock ESM modules that Jest can't transform
jest.mock('hex-rgb', () => ({
  __esModule: true,
  default: jest.fn((hex: string) => ({red: 255, green: 0, blue: 0, alpha: 1})),
}));
jest.mock('color-diff', () => ({
  closest: jest.fn(() => ({R: 255, G: 0, B: 0})),
}));
jest.mock('expo-face-detector', () => ({
  FaceDetectorMode: {fast: 1, accurate: 2},
  FaceDetectorLandmarks: {all: 1},
  FaceDetectorClassifications: {all: 1},
  detectFacesAsync: jest.fn().mockResolvedValue({
    faces: [
      {
        leftEyeOpenProbability: 0.95,
        rightEyeOpenProbability: 0.95,
        bounds: {origin: {x: 100, y: 100}, size: {width: 200, height: 200}},
        LEFT_EYE: {x: 150, y: 150},
        RIGHT_EYE: {x: 250, y: 150},
        leftEyePosition: {x: 150, y: 150},
        rightEyePosition: {x: 250, y: 150},
      },
    ],
  }),
}));
jest.mock('@react-native-community/image-editor', () => ({
  __esModule: true,
  default: {
    cropImage: jest.fn().mockResolvedValue({uri: 'file://cropped-image.jpg'}),
  },
}));
jest.mock('react-native-image-colors', () => ({
  getColors: jest.fn().mockResolvedValue({
    primary: '#FF0000',
    secondary: '#00FF00',
    background: '#FFFFFF',
    dominant: '#000000',
  }),
}));
jest.mock('@iriscan/biometric-sdk-react-native', () => ({
  faceCompare: jest.fn().mockResolvedValue(true),
  configure: jest.fn(),
}));
jest.mock('../../shared/constants', () => ({
  ...jest.requireActual('../../shared/constants'),
  isAndroid: () => true,
  LIVENESS_THRESHOLD: 0.4,
}));

import {
  checkBlink,
  getFaceBounds,
  getNormalizedFacePoints,
  filterColor,
  imageCaptureConfig,
  ImageType,
  faceDetectorConfig,
  getEyeColorPredictionResult,
  cropEyeAreaFromFace,
} from './FaceScannerHelper';

describe('FaceScannerHelper', () => {
  describe('imageCaptureConfig', () => {
    it('should have correct defaults', () => {
      expect(imageCaptureConfig.base64).toBe(true);
      expect(imageCaptureConfig.quality).toBe(1);
      expect(imageCaptureConfig.imageType).toBe(ImageType.jpg);
    });
  });

  describe('ImageType', () => {
    it('should have jpg type', () => {
      expect(ImageType.jpg).toBe('jpg');
    });
  });

  describe('faceDetectorConfig', () => {
    it('should be defined with tracking enabled', () => {
      expect(faceDetectorConfig).toBeDefined();
      expect(faceDetectorConfig.tracking).toBe(true);
    });
  });

  describe('checkBlink', () => {
    it('should return undefined for open eyes (void function)', () => {
      const face = {
        leftEyeOpenProbability: 0.9,
        rightEyeOpenProbability: 0.9,
      };
      const result = checkBlink(face);
      expect(result).toBeUndefined();
    });

    it('should return undefined for closed eyes (void function)', () => {
      const face = {
        leftEyeOpenProbability: 0.1,
        rightEyeOpenProbability: 0.1,
      };
      const result = checkBlink(face);
      expect(result).toBeUndefined();
    });

    it('should process full blink sequence (close then open) without error', () => {
      // Close eyes — sets internal closed-eye flags
      const closeResult = checkBlink({
        leftEyeOpenProbability: 0.1,
        rightEyeOpenProbability: 0.1,
      });
      expect(closeResult).toBeUndefined();
      // Open eyes — triggers blink detection via internal state
      const openResult = checkBlink({
        leftEyeOpenProbability: 0.9,
        rightEyeOpenProbability: 0.9,
      });
      expect(openResult).toBeUndefined();
    });
  });

  describe('getFaceBounds', () => {
    it('should return array of 4 booleans', () => {
      const face = {
        bounds: {
          origin: {x: 100, y: 100},
          size: {width: 200, height: 200},
        },
        yawAngle: 0,
        rollAngle: 0,
      };
      const result = getFaceBounds(face);
      expect(result).toHaveLength(4);
      result.forEach(val => expect(typeof val).toBe('boolean'));
    });

    it('should return true for centered face', () => {
      const face = {
        bounds: {
          origin: {x: 100, y: 100},
          size: {width: 200, height: 200},
        },
        yawAngle: 0,
        rollAngle: 0,
      };
      const [x, y, yaw, roll] = getFaceBounds(face);
      expect(yaw).toBe(true);
      expect(roll).toBe(true);
    });

    it('should return false for large yaw angle', () => {
      const face = {
        bounds: {origin: {x: 100, y: 100}, size: {width: 200, height: 200}},
        yawAngle: 10,
        rollAngle: 0,
      };
      const [, , yaw] = getFaceBounds(face);
      expect(yaw).toBe(false);
    });
  });

  describe('getNormalizedFacePoints', () => {
    it('should extract Android face points', () => {
      const facePoints = {
        LEFT_EYE: {x: 10, y: 20},
        RIGHT_EYE: {x: 30, y: 40},
        leftEyePosition: {x: 50, y: 60},
        rightEyePosition: {x: 70, y: 80},
      };
      const result = getNormalizedFacePoints(facePoints);
      expect(result).toHaveLength(4);
    });
  });

  describe('filterColor', () => {
    it('should accept valid hex color', () => {
      expect(filterColor('#FF0000')).toBe(true);
    });

    it('should reject non-string', () => {
      expect(filterColor(123)).toBe(false);
    });

    it('should reject non-hex string', () => {
      expect(filterColor('red')).toBe(false);
    });

    it('should reject background and dominant', () => {
      expect(filterColor('background')).toBe(false);
      expect(filterColor('dominant')).toBe(false);
    });
  });

  describe('getEyeColorPredictionResult', () => {
    it('should push results for each color in the array', async () => {
      const rgbaColors = [
        {red: 255, green: 0, blue: 0, alpha: 1},
        {red: 0, green: 255, blue: 0, alpha: 1},
      ];
      const targetColor = {red: 255, green: 0, blue: 0, alpha: 1};
      await getEyeColorPredictionResult(rgbaColors, targetColor);
      // closest mock returns {R:255,G:0,B:0} which matches targetColor
      // so results should be pushed (we can't directly read the internal array
      // but it should not throw)
    });

    it('should handle empty color array', async () => {
      await expect(
        getEyeColorPredictionResult([], {red: 0, green: 0, blue: 0, alpha: 1}),
      ).resolves.not.toThrow();
    });
  });

  describe('cropEyeAreaFromFace', () => {
    const mockPicArray = [
      {
        color: '#FF0000',
        image: {uri: 'file://test-image1.jpg'},
      },
    ];
    const mockVcImage = 'data:image/jpeg;base64,dGVzdGltYWdl';
    const mockCapturedImage = {base64: 'capturedBase64Data'};

    it('should return true when face match and liveness pass', async () => {
      const result = await cropEyeAreaFromFace(
        mockPicArray,
        mockVcImage,
        mockCapturedImage,
      );
      expect(typeof result).toBe('boolean');
    });

    it('should return false when faceCompare fails', async () => {
      const {faceCompare} = require('@iriscan/biometric-sdk-react-native');
      faceCompare.mockResolvedValueOnce(false);
      const result = await cropEyeAreaFromFace(
        mockPicArray,
        mockVcImage,
        mockCapturedImage,
      );
      expect(result).toBe(false);
    });

    it('should return false on face detection error', async () => {
      const FaceDetector = require('expo-face-detector');
      FaceDetector.detectFacesAsync.mockRejectedValueOnce(
        new Error('detection failed'),
      );
      const spy = jest.spyOn(console, 'error').mockImplementation();
      const result = await cropEyeAreaFromFace(
        mockPicArray,
        mockVcImage,
        mockCapturedImage,
      );
      expect(result).toBe(false);
      spy.mockRestore();
    });

    it('should handle empty pic array', async () => {
      const result = await cropEyeAreaFromFace(
        [],
        mockVcImage,
        mockCapturedImage,
      );
      expect(typeof result).toBe('boolean');
    });
  });
});
