import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('expo-camera', () => ({
  Camera: (props: any) => {
    const {View} = require('react-native');
    return <View testID="camera" />;
  },
  CameraType: {front: 'front', back: 'back'},
}));

jest.mock('react-native-spinkit', () => {
  const {View} = require('react-native');
  return (props: any) => <View testID="spinner" />;
});

jest.mock('react-native-svg', () => {
  const {View} = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => <View testID="svg">{props.children}</View>,
    Svg: (props: any) => <View testID="svg">{props.children}</View>,
    Defs: (props: any) => <View>{props.children}</View>,
    Mask: (props: any) => <View>{props.children}</View>,
    Rect: () => <View />,
    Ellipse: () => <View />,
  };
});

jest.mock('../../shared/commonUtil', () => {
  const fn = jest.fn(() => ({}));
  return {__esModule: true, default: fn};
});
jest.mock('./FaceScannerHelper', () => ({FaceDetectorConfig: {}}));

import LivenessDetection from './LivenessDetection';

describe('LivenessDetection', () => {
  const defaultProps = {
    screenColor: '#0000ff',
    infoText: 'Place your face in the guide',
    whichCamera: 'front' as any,
    setCameraRef: jest.fn(),
    handleFacesDetected: jest.fn(),
    faceDetectorConfig: {},
    handleOnCancel: jest.fn(),
    opacity: 1,
    setOpacity: jest.fn(),
    t: (key: string) => key,
  };

  it('should render liveness detection view', () => {
    const {toJSON} = render(<LivenessDetection {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
