import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('../../shared/GlobalContext', () => {
  const React = require('react');
  return {
    GlobalContext: React.createContext({
      appService: {
        getSnapshot: () => ({context: {}}),
        children: {get: () => ({})},
        send: jest.fn(),
      },
    }),
  };
});

jest.mock('@xstate/react', () => {
  let selectorReturnValue = false;
  return {
    useInterpret: () => ({send: jest.fn(), getSnapshot: () => ({})}),
    useSelector: jest.fn((service, selector) => selectorReturnValue),
    __setSelectorReturn: (val: any) => {
      selectorReturnValue = val;
    },
  };
});

jest.mock('expo-camera', () => ({
  CameraView: 'CameraView',
  Camera: 'Camera',
  CameraType: {front: 'front', back: 'back'},
}));

jest.mock('../../machines/faceScanner', () => ({
  createFaceScannerMachine: jest.fn(() => ({})),
  FaceScannerEvents: {
    READY: jest.fn(),
    APP_FOCUSED: jest.fn(),
    OPEN_SETTINGS: jest.fn(),
  },
  selectCameraRef: jest.fn(),
  selectIsCapturing: jest.fn(),
  selectIsCheckingPermission: jest.fn(() => true),
  selectIsInvalid: jest.fn(),
  selectIsPermissionDenied: jest.fn(),
  selectIsScanning: jest.fn(),
  selectIsValid: jest.fn(),
  selectIsVerifying: jest.fn(),
}));

jest.mock('../../machines/app', () => ({selectIsActive: jest.fn()}));
jest.mock('../../shared/commonUtil', () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
  getRandomInt: jest.fn(() => 1),
}));
jest.mock('./FaceScannerHelper', () => ({
  cropEyeAreaFromFace: jest.fn(),
  faceDetectorConfig: {},
  getFaceBounds: jest.fn(() => [true, true, true, true]),
  imageCaptureConfig: {},
}));
jest.mock('./LivenessDetection', () => () => null);
jest.mock('./FaceCompare', () => () => null);
jest.mock('../../shared/constants', () => ({
  LIVENESS_CHECK: false,
  isAndroid: () => true,
  isIOS: () => false,
}));
jest.mock('../../shared/Utils', () => ({
  CameraPosition: {FRONT: 'front', BACK: 'back'},
}));

jest.mock('react-native-elements', () => {
  const {View, TouchableOpacity, Text: RNText} = require('react-native');
  return {
    Button: (props: any) => (
      <TouchableOpacity testID={props.testID} onPress={props.onPress}>
        <RNText>{props.title}</RNText>
      </TouchableOpacity>
    ),
  };
});

import {FaceScanner} from './FaceScanner';

describe('FaceScanner', () => {
  const defaultProps = {
    vcImages: ['base64image'],
    onValid: jest.fn(),
    onInvalid: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render checking permission state', () => {
    const {toJSON} = render(<FaceScanner {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with multiple VC images', () => {
    const {toJSON} = render(
      <FaceScanner {...defaultProps} vcImages={['img1', 'img2', 'img3']} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with empty VC images', () => {
    const {toJSON} = render(<FaceScanner {...defaultProps} vcImages={[]} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
