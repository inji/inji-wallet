import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {Dimensions} from 'react-native';

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
  beforeEach(() => {
    jest.spyOn(Dimensions, 'get').mockReturnValue({
      width: 375,
      height: 667,
      scale: 2,
      fontScale: 2,
    } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

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

  it('should call handleOnCancel when cancel is pressed', () => {
    const handleOnCancel = jest.fn();
    const {getByText} = render(
      <LivenessDetection {...defaultProps} handleOnCancel={handleOnCancel} />,
    );
    fireEvent.press(getByText('cancel'));
    expect(handleOnCancel).toHaveBeenCalled();
  });

  it('should display infoText', () => {
    const {getByText} = render(<LivenessDetection {...defaultProps} />);
    expect(getByText('Place your face in the guide')).toBeTruthy();
  });

  it('should render with different screenColor', () => {
    const {toJSON} = render(
      <LivenessDetection {...defaultProps} screenColor="#ff0000" />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
