// Mock ESM modules that Jest can't transform
jest.mock('hex-rgb', () => ({
  __esModule: true,
  default: jest.fn(() => ({red: 255, green: 0, blue: 0, alpha: 1})),
}));
jest.mock('color-diff', () => ({
  closest: jest.fn(() => ({R: 255, G: 0, B: 0})),
}));
jest.mock('expo-face-detector', () => ({
  FaceDetectorMode: {fast: 1},
  FaceDetectorLandmarks: {all: 1},
  FaceDetectorClassifications: {all: 1},
}));
jest.mock('@react-native-community/image-editor', () => ({
  cropImage: jest.fn(),
}));
jest.mock('react-native-image-colors', () => ({
  getColors: jest.fn(),
}));
jest.mock('@iriscan/biometric-sdk-react-native', () => ({
  faceCompare: jest.fn(),
  configure: jest.fn(),
}));

import {
  FaceScannerEvents,
  selectCameraRef,
  selectCapturedImage,
  selectIsCheckingPermission,
  selectIsPermissionDenied,
  selectIsScanning,
  selectIsCapturing,
  selectIsVerifying,
  selectIsValid,
  selectIsInvalid,
  createFaceScannerMachine,
} from './faceScanner';

const mockState = (ctx: any = {}, matchVal?: string) => ({
  context: {
    cameraRef: null,
    faceBounds: {minWidth: 280, minHeight: 280},
    capturedImage: null,
    captureError: '',
    ...ctx,
  },
  matches: (v: string) => v === matchVal,
});

describe('faceScanner selectors', () => {
  it('selectCameraRef', () => {
    const ref = {takePictureAsync: jest.fn()};
    expect(selectCameraRef(mockState({cameraRef: ref}) as any)).toBe(ref);
  });
  it('selectCapturedImage', () => {
    const img = {uri: 'file://img', base64: 'abc'};
    expect(selectCapturedImage(mockState({capturedImage: img}) as any)).toBe(
      img,
    );
  });
  it('selectIsCheckingPermission', () =>
    expect(
      selectIsCheckingPermission(
        mockState({}, 'init.checkingPermission') as any,
      ),
    ).toBe(true));
  it('selectIsPermissionDenied', () =>
    expect(
      selectIsPermissionDenied(mockState({}, 'init.permissionDenied') as any),
    ).toBe(true));
  it('selectIsScanning', () =>
    expect(selectIsScanning(mockState({}, 'scanning') as any)).toBe(true));
  it('selectIsCapturing', () =>
    expect(selectIsCapturing(mockState({}, 'capturing') as any)).toBe(true));
  it('selectIsVerifying', () =>
    expect(selectIsVerifying(mockState({}, 'verifying') as any)).toBe(true));
  it('selectIsValid', () =>
    expect(selectIsValid(mockState({}, 'valid') as any)).toBe(true));
  it('selectIsInvalid', () =>
    expect(selectIsInvalid(mockState({}, 'invalid') as any)).toBe(true));
  it('selectIsScanning false', () =>
    expect(selectIsScanning(mockState({}, 'idle') as any)).toBe(false));
  it('createFaceScannerMachine is a function', () =>
    expect(typeof createFaceScannerMachine).toBe('function'));
});

describe('FaceScannerEvents', () => {
  it('should create READY event', () => {
    const cameraRef = {takePictureAsync: jest.fn()};
    const event = FaceScannerEvents.READY(cameraRef as any);
    expect(event.type).toBe('READY');
    expect(event.cameraRef).toBe(cameraRef);
  });

  it('should create CAPTURE event', () => {
    expect(FaceScannerEvents.CAPTURE()).toEqual({type: 'CAPTURE'});
  });

  it('should create DENIED event', () => {
    const response = {
      granted: false,
      canAskAgain: true,
      status: 'denied',
      expires: 'never',
    };
    const event = FaceScannerEvents.DENIED(response as any);
    expect(event.type).toBe('DENIED');
    expect(event.response).toBe(response);
  });

  it('should create GRANTED event', () => {
    expect(FaceScannerEvents.GRANTED()).toEqual({type: 'GRANTED'});
  });

  it('should create OPEN_SETTINGS event', () => {
    expect(FaceScannerEvents.OPEN_SETTINGS()).toEqual({type: 'OPEN_SETTINGS'});
  });

  it('should create APP_FOCUSED event', () => {
    expect(FaceScannerEvents.APP_FOCUSED()).toEqual({type: 'APP_FOCUSED'});
  });
});

describe('faceScanner machine transitions', () => {
  let machine: ReturnType<typeof createFaceScannerMachine>;

  beforeEach(() => {
    machine = createFaceScannerMachine(['data:image/png;base64,abc123']);
  });

  it('creates machine with initial state init.checkingPermission', () => {
    expect(machine).toBeDefined();
    expect(machine.id).toBe('faceScanner');
    expect(machine.initialState.value).toEqual({init: 'checkingPermission'});
  });

  it('has correct initial context', () => {
    const ctx = machine.initialState.context;
    expect(ctx.cameraRef).toEqual({});
    expect(ctx.faceBounds).toEqual({minWidth: 280, minHeight: 280});
    expect(ctx.capturedImage).toEqual({});
    expect(ctx.captureError).toBe('');
  });

  it('init.checkingPermission transitions to requestingPermission on DENIED with canAskAgain', () => {
    const stubMachine = machine.withConfig({
      services: {
        checkPermission: () => () => {},
        requestPermission: () => () => {},
      } as any,
    });
    const next = stubMachine.transition({init: 'checkingPermission'}, {
      type: 'DENIED',
      response: {
        granted: false,
        canAskAgain: true,
        status: 'denied',
        expires: 'never',
      },
    } as any);
    expect(next.value).toEqual({init: 'requestingPermission'});
  });

  it('init.checkingPermission transitions to permissionDenied on DENIED without canAskAgain', () => {
    const stubMachine = machine.withConfig({
      services: {
        checkPermission: () => () => {},
        requestPermission: () => () => {},
      } as any,
    });
    const next = stubMachine.transition({init: 'checkingPermission'}, {
      type: 'DENIED',
      response: {
        granted: false,
        canAskAgain: false,
        status: 'denied',
        expires: 'never',
      },
    } as any);
    expect(next.value).toEqual({init: 'permissionDenied'});
  });

  it('init.checkingPermission transitions to permissionGranted on GRANTED', () => {
    const stubMachine = machine.withConfig({
      services: {
        checkPermission: () => () => {},
        requestPermission: () => () => {},
      } as any,
    });
    const next = stubMachine.transition({init: 'checkingPermission'}, {
      type: 'GRANTED',
    } as any);
    expect(next.value).toEqual({init: 'permissionGranted'});
  });

  it('init.permissionDenied transitions to checkingPermission on APP_FOCUSED', () => {
    const stubMachine = machine.withConfig({
      services: {
        checkPermission: () => () => {},
        requestPermission: () => () => {},
      } as any,
    });
    const next = stubMachine.transition({init: 'permissionDenied'}, {
      type: 'APP_FOCUSED',
    } as any);
    expect(next.value).toEqual({init: 'checkingPermission'});
  });

  it('init.requestingPermission transitions to permissionGranted on GRANTED', () => {
    const stubMachine = machine.withConfig({
      services: {
        checkPermission: () => () => {},
        requestPermission: () => () => {},
      } as any,
    });
    const next = stubMachine.transition({init: 'requestingPermission'}, {
      type: 'GRANTED',
    } as any);
    expect(next.value).toEqual({init: 'permissionGranted'});
  });

  it('init.requestingPermission transitions to permissionDenied on DENIED', () => {
    const stubMachine = machine.withConfig({
      services: {
        checkPermission: () => () => {},
        requestPermission: () => () => {},
      } as any,
    });
    const next = stubMachine.transition({init: 'requestingPermission'}, {
      type: 'DENIED',
      response: {granted: false, canAskAgain: false},
    } as any);
    expect(next.value).toEqual({init: 'permissionDenied'});
  });

  it('init state transitions to scanning on READY event', () => {
    const stubMachine = machine.withConfig({
      services: {
        checkPermission: () => () => {},
        requestPermission: () => () => {},
      } as any,
    });
    const cameraRef = {takePictureAsync: jest.fn()};
    const next = stubMachine.transition({init: 'checkingPermission'}, {
      type: 'READY',
      cameraRef,
    } as any);
    expect(next.value).toBe('scanning');
    expect(next.context.cameraRef).toBe(cameraRef);
  });

  it('scanning transitions to capturing on CAPTURE', () => {
    const stubMachine = machine.withConfig({
      services: {
        captureImage: () => Promise.resolve({uri: '', base64: 'abc'}),
      } as any,
    });
    const next = stubMachine.transition('scanning', {type: 'CAPTURE'});
    expect(next.value).toBe('capturing');
  });

  it('capturing transitions to verifying on done with capture data', () => {
    const stubMachine = machine.withConfig({
      services: {verifyImage: () => Promise.resolve(true)} as any,
    });
    const next = stubMachine.transition('capturing', {
      type: 'done.invoke.faceScanner.capturing:invocation[0]',
      data: {uri: 'f', base64: 'abc'},
    } as any);
    expect(next.value).toBe('verifying');
    expect(next.context.capturedImage).toEqual({uri: 'f', base64: 'abc'});
  });

  it('capturing transitions to scanning on error', () => {
    const next = machine.transition('capturing', {
      type: 'error.platform.faceScanner.capturing:invocation[0]',
      data: new Error('fail'),
    } as any);
    expect(next.value).toBe('scanning');
    expect(next.context.captureError).toBe('Failed to capture image.');
  });

  it('verifying transitions to valid when doesFaceMatch guard is true', () => {
    const stubMachine = machine.withConfig({
      services: {} as any,
      guards: {
        canRequestPermission: () => false,
        doesFaceMatch: () => true,
      },
    });
    const next = stubMachine.transition('verifying', {
      type: 'done.invoke.faceScanner.verifying:invocation[0]',
      data: true,
    } as any);
    expect(next.value).toBe('valid');
  });

  it('verifying transitions to invalid when doesFaceMatch guard is false', () => {
    const stubMachine = machine.withConfig({
      services: {} as any,
      guards: {
        canRequestPermission: () => false,
        doesFaceMatch: () => false,
      },
    });
    const next = stubMachine.transition('verifying', {
      type: 'done.invoke.faceScanner.verifying:invocation[0]',
      data: false,
    } as any);
    expect(next.value).toBe('invalid');
  });

  it('verifying transitions to invalid on error', () => {
    const next = machine.transition('verifying', {
      type: 'error.platform.faceScanner.verifying:invocation[0]',
      data: new Error('fail'),
    } as any);
    expect(next.value).toBe('invalid');
  });
});

describe('faceScanner services and guards', () => {
  let machine: ReturnType<typeof createFaceScannerMachine>;

  beforeEach(() => {
    jest.clearAllMocks();
    machine = createFaceScannerMachine(['data:image/png;base64,abc123']);
  });

  it('checkPermission service calls Camera.getCameraPermissionsAsync - granted', async () => {
    const {Camera} = require('expo-camera');
    Camera.getCameraPermissionsAsync = jest
      .fn()
      .mockResolvedValue({granted: true});

    const services = (machine as any).options.services;
    const serviceFactory = services.checkPermission;
    const outerFn = serviceFactory({});
    const callback = jest.fn();
    await outerFn(callback);
    expect(Camera.getCameraPermissionsAsync).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({type: 'GRANTED'}),
    );
  });

  it('checkPermission service calls Camera.getCameraPermissionsAsync - denied', async () => {
    const {Camera} = require('expo-camera');
    const deniedResponse = {
      granted: false,
      canAskAgain: true,
      status: 'denied',
    };
    Camera.getCameraPermissionsAsync = jest
      .fn()
      .mockResolvedValue(deniedResponse);

    const services = (machine as any).options.services;
    const serviceFactory = services.checkPermission;
    const outerFn = serviceFactory({});
    const callback = jest.fn();
    await outerFn(callback);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({type: 'DENIED'}),
    );
  });

  it('requestPermission service calls Camera.requestCameraPermissionsAsync - granted', async () => {
    const {Camera} = require('expo-camera');
    Camera.requestCameraPermissionsAsync = jest
      .fn()
      .mockResolvedValue({granted: true});

    const services = (machine as any).options.services;
    const serviceFactory = services.requestPermission;
    const outerFn = serviceFactory({});
    const callback = jest.fn();
    await outerFn(callback);
    expect(Camera.requestCameraPermissionsAsync).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({type: 'GRANTED'}),
    );
  });

  it('requestPermission service calls Camera.requestCameraPermissionsAsync - denied', async () => {
    const {Camera} = require('expo-camera');
    const deniedResponse = {
      granted: false,
      canAskAgain: false,
      status: 'denied',
    };
    Camera.requestCameraPermissionsAsync = jest
      .fn()
      .mockResolvedValue(deniedResponse);

    const services = (machine as any).options.services;
    const serviceFactory = services.requestPermission;
    const outerFn = serviceFactory({});
    const callback = jest.fn();
    await outerFn(callback);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({type: 'DENIED'}),
    );
  });

  it('captureImage service calls takePictureAsync on camera ref', async () => {
    const mockTakePicture = jest
      .fn()
      .mockResolvedValue({uri: 'file://img.jpg', base64: 'base64data'});
    const context = {cameraRef: {takePictureAsync: mockTakePicture}};

    const services = (machine as any).options.services;
    const result = await services.captureImage(context);
    expect(mockTakePicture).toHaveBeenCalledWith({
      base64: true,
      imageType: 'jpg',
    });
    expect(result).toEqual({uri: 'file://img.jpg', base64: 'base64data'});
  });

  it('verifyImage service throws when no image captured', async () => {
    const services = (machine as any).options.services;
    const context = {capturedImage: null};

    await expect(services.verifyImage(context)).rejects.toThrow(
      'No image captured',
    );
  });

  it('verifyImage service throws when image has no base64', async () => {
    const services = (machine as any).options.services;
    const context = {capturedImage: {uri: 'file://img.jpg'}};

    await expect(services.verifyImage(context)).rejects.toThrow(
      'No image captured',
    );
  });

  it('verifyImage service returns true when face matches', async () => {
    const {faceCompare} = require('@iriscan/biometric-sdk-react-native');
    faceCompare.mockResolvedValue(true);

    const services = (machine as any).options.services;
    const context = {
      capturedImage: {base64: 'capturedBase64', uri: 'file://img.jpg'},
    };

    const result = await services.verifyImage(context);
    expect(result).toBe(true);
    expect(faceCompare).toHaveBeenCalledWith('capturedBase64', 'abc123');
  });

  it('verifyImage service returns false when face does not match', async () => {
    const {faceCompare} = require('@iriscan/biometric-sdk-react-native');
    faceCompare.mockResolvedValue(false);

    const services = (machine as any).options.services;
    const context = {
      capturedImage: {base64: 'capturedBase64', uri: 'file://img.jpg'},
    };

    const result = await services.verifyImage(context);
    expect(result).toBe(false);
  });

  it('verifyImage service skips non-dataURI vcImages', async () => {
    const {faceCompare} = require('@iriscan/biometric-sdk-react-native');
    faceCompare.mockResolvedValue(false);

    const machineWithBadImage = createFaceScannerMachine(['not-a-data-uri']);
    const services = (machineWithBadImage as any).options.services;
    const context = {
      capturedImage: {base64: 'capturedBase64', uri: 'file://img.jpg'},
    };

    const result = await services.verifyImage(context);
    expect(result).toBe(false);
    expect(faceCompare).not.toHaveBeenCalled();
  });

  it('verifyImage service rethrows faceCompare errors', async () => {
    const {faceCompare} = require('@iriscan/biometric-sdk-react-native');
    faceCompare.mockRejectedValue(new Error('comparison failed'));

    const services = (machine as any).options.services;
    const context = {
      capturedImage: {base64: 'capturedBase64', uri: 'file://img.jpg'},
    };

    await expect(services.verifyImage(context)).rejects.toThrow(
      'comparison failed',
    );
  });

  it('verifyImage breaks on first match with multiple vcImages', async () => {
    const {faceCompare} = require('@iriscan/biometric-sdk-react-native');
    faceCompare.mockResolvedValueOnce(false).mockResolvedValueOnce(true);

    const machineMulti = createFaceScannerMachine([
      'data:image/png;base64,img1',
      'data:image/jpeg;base64,img2',
      'data:image/png;base64,img3',
    ]);
    const services = (machineMulti as any).options.services;
    const context = {
      capturedImage: {base64: 'captured', uri: 'file://img.jpg'},
    };

    const result = await services.verifyImage(context);
    expect(result).toBe(true);
    expect(faceCompare).toHaveBeenCalledTimes(2);
  });

  it('canRequestPermission guard returns true when canAskAgain is true', () => {
    const guards = (machine as any).options.guards;
    expect(
      guards.canRequestPermission({}, {response: {canAskAgain: true}}),
    ).toBe(true);
  });

  it('canRequestPermission guard returns false when canAskAgain is false', () => {
    const guards = (machine as any).options.guards;
    expect(
      guards.canRequestPermission({}, {response: {canAskAgain: false}}),
    ).toBe(false);
  });

  it('doesFaceMatch guard returns true when event.data is true', () => {
    const guards = (machine as any).options.guards;
    expect(guards.doesFaceMatch({}, {data: true})).toBe(true);
  });

  it('doesFaceMatch guard returns false when event.data is false', () => {
    const guards = (machine as any).options.guards;
    expect(guards.doesFaceMatch({}, {data: false})).toBe(false);
  });

  it('openSettings action calls Linking.openSettings', () => {
    const {Linking} = require('react-native');
    if (!Linking.openSettings) {
      Linking.openSettings = jest.fn();
    }
    const actions = (machine as any).options.actions;
    actions.openSettings();
    expect(Linking.openSettings).toHaveBeenCalled();
  });
});
