import hexRgb, {RgbaObject} from 'hex-rgb';
import {LIVENESS_THRESHOLD, isAndroid} from '../../shared/constants';
import {closest} from 'color-diff';
import * as FaceDetector from 'expo-face-detector';
import ImageEditor from '@react-native-community/image-editor';
import {getColors} from 'react-native-image-colors';
// import {faceCompare} from '@iriscan/biometric-sdk-react-native';

let FaceCropPicArray: any[] = new Array();
let EyeCropPicArray: any[] = new Array();
let predictedColorResults: any[] = new Array();
let facePoints;
let calculatedThreshold;
let faceCompareOuptut;
let capturedFaceImage;
let leftEyeWasClosed = false;
let rightEyeWasClosed = false;
let lastBlinkTimestamp = 0;
let blinkCounter = 0;

const offsetX = 200;
const offsetY = 350;
const captureInterval = 650;
const eyeOpenProbability = 0.85;
const blinkConfidenceScore = 0.1;
const blinkThreshold = 0.4;
const blinkTimeInterval = 900;
const eyeCropHeightConst = 50;
const XAndYBoundsMax = 280;
const XAndYBoundsMin = 300;
const rollAngleThreshold = 10;
const yawAngleThreshold = 3;
const colorFiltered = ['background', 'dominant'];
const rxDataURI = /data:(?<mime>[\w/\-.]+);(?<encoding>\w+),(?<data>.*)/;
const colorComparePalette = [
  {R: 255, G: 0, B: 0},
  {R: 0, G: 255, B: 0},
  {R: 0, G: 0, B: 255},
];

export enum ImageType {
  jpg = 'jpg',
}

export const imageCaptureConfig = {
  base64: true,
  quality: 1,
  imageType: ImageType.jpg,
};

export const faceDetectorConfig: FaceDetectorConfig = {
  mode: FaceDetector.FaceDetectorMode.accurate,
  detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
  runClassifications: FaceDetector.FaceDetectorClassifications.all,
  contourMode: FaceDetector.FaceDetectorClassifications.all,
  minDetectionInterval: captureInterval,
  tracking: true,
};

export const checkBlink = face => {
  const leftEyeOpenProbability = face.leftEyeOpenProbability;
  const rightEyeOpenProbability = face.rightEyeOpenProbability;

  const currentTime = new Date().getTime();

  const leftEyeClosed = leftEyeOpenProbability < blinkThreshold;
  const rightEyeClosed = rightEyeOpenProbability < blinkThreshold;

  if (leftEyeClosed && rightEyeClosed) {
    leftEyeWasClosed = true;
    rightEyeWasClosed = true;
  }

  if (
    leftEyeWasClosed &&
    rightEyeWasClosed &&
    !leftEyeClosed &&
    !rightEyeClosed
  ) {
    if (
      lastBlinkTimestamp === 0 ||
      currentTime - lastBlinkTimestamp > blinkTimeInterval
    ) {
      blinkCounter = blinkCounter + 1;
      lastBlinkTimestamp = currentTime;
    }
    leftEyeWasClosed = false;
    rightEyeWasClosed = false;
  }
};

export const getFaceBounds = face => {
  const {bounds, yawAngle, rollAngle} = face;

  const withinXBounds =
    bounds.origin.x + bounds.size.width >= XAndYBoundsMax &&
    bounds.origin.x <= XAndYBoundsMin;
  const withinYBounds =
    bounds.origin.y + bounds.size.height >= XAndYBoundsMax &&
    bounds.origin.y <= XAndYBoundsMin;
  const withinYawAngle =
    yawAngle > -yawAngleThreshold && yawAngle < yawAngleThreshold;
  const withinRollAngle =
    rollAngle > -rollAngleThreshold && rollAngle < rollAngleThreshold;

  return [withinXBounds, withinYBounds, withinYawAngle, withinRollAngle];
};

export const getNormalizedFacePoints = (facePoints: any): number[] => {
  return isAndroid()
    ? [
        facePoints.LEFT_EYE.x,
        facePoints.LEFT_EYE.y,
        facePoints.RIGHT_EYE.x,
        facePoints.RIGHT_EYE.y,
      ]
    : [
        facePoints.leftEyePosition.x,
        facePoints.leftEyePosition.y,
        facePoints.rightEyePosition.x,
        facePoints.rightEyePosition.y,
      ];
};

export const filterColor = color => {
  return (
    typeof color === 'string' &&
    color.startsWith('#') &&
    !colorFiltered.includes(color)
  );
};

export const getEyeColorPredictionResult = async (
  LeftrgbaColors: RgbaObject[],
  color: RgbaObject,
) => {
  LeftrgbaColors.forEach(colorRGBA => {
    let colorRGB = {};
    colorRGB['R'] = colorRGBA.red;
    colorRGB['G'] = colorRGBA.green;
    colorRGB['B'] = colorRGBA.blue;

    const closestColor = closest(colorRGB, colorComparePalette);

    const result =
      color.red === closestColor.R &&
      color.blue === closestColor.B &&
      color.green === closestColor.G;

    predictedColorResults.push(result);
  });
};

export const cropEyeAreaFromFace = async (picArray, vcImage, capturedImage) => {
  try {
    await Promise.all(
      picArray.map(async pic => {
        facePoints = (
          await FaceDetector.detectFacesAsync(pic.image.uri, faceDetectorConfig)
        ).faces[0];

        if (
          facePoints.leftEyeOpenProbability > eyeOpenProbability &&
          facePoints.rightEyeOpenProbability > eyeOpenProbability
        ) {
          capturedFaceImage = await ImageEditor.cropImage(pic.image.uri, {
            offset: {
              x: facePoints.bounds.origin.x,
              y: facePoints.bounds.origin.y,
            },
            size: {
              width: facePoints.bounds.size.width,
              height: facePoints.bounds.size.height,
            },
          });

          FaceCropPicArray.push({color: pic.color, image: capturedFaceImage});
        }
      }),
    );

    await Promise.all(
      FaceCropPicArray.map(async pic => {
        let [leftEyeX, leftEyeY, rightEyeX, rightEyeY] =
          getNormalizedFacePoints(facePoints);

        const leftCroppedImage = await ImageEditor.cropImage(pic.image.uri, {
          offset: {
            x: leftEyeX - offsetX,
            y: leftEyeY - offsetY,
          },
          size: {
            width: offsetX * 2,
            height: offsetY / 2 - eyeCropHeightConst,
          },
        });

        const rightCroppedImage = await ImageEditor.cropImage(pic.image.uri, {
          offset: {
            x: rightEyeX - offsetX,
            y: rightEyeY - offsetY,
          },
          size: {
            width: offsetX * 2,
            height: offsetY / 2 - eyeCropHeightConst,
          },
        });

        EyeCropPicArray.push({
          color: pic.color,
          leftEye: leftCroppedImage,
          rightEye: rightCroppedImage,
        });
      }),
    );

    await Promise.all(
      EyeCropPicArray.map(async pic => {
        const leftEyeColors = await getColors(pic.leftEye.uri);
        const rightEyeColors = await getColors(pic.rightEye.uri);

        const leftRGBAColors = Object.values(leftEyeColors)
          .filter(filterColor)
          .map(color => hexRgb(color));

        const rightRGBAColors = Object.values(rightEyeColors)
          .filter(filterColor)
          .map(color => hexRgb(color));

        const rgbColor = hexRgb(pic.color);
        await getEyeColorPredictionResult(leftRGBAColors, rgbColor);
        await getEyeColorPredictionResult(rightRGBAColors, rgbColor);
      }),
    );
  } catch (err) {
    console.error('Unable to crop the images::', err);
    return false;
  }

  calculatedThreshold =
    predictedColorResults.filter(element => element).length /
    predictedColorResults.length;

  if (blinkCounter > 0) {
    calculatedThreshold = calculatedThreshold + blinkConfidenceScore;
  }

  if (calculatedThreshold > LIVENESS_THRESHOLD) {
    return true;
  } else {
    return false;
  }
};
export interface FaceDetectorConfig {
  mode: FaceDetector.FaceDetectorMode;
  detectLandmarks: FaceDetector.FaceDetectorLandmarks;
  runClassifications: FaceDetector.FaceDetectorClassifications;
  contourMode: FaceDetector.FaceDetectorClassifications;
  minDetectionInterval: number;
  tracking: boolean;
}
