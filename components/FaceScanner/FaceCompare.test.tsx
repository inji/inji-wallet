import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';

jest.mock('expo-camera', () => ({
  CameraView: (props: any) => {
    const {View} = require('react-native');
    return <View testID="cameraView" />;
  },
  CameraType: {front: 'front', back: 'back'},
}));

jest.mock('../ui/svg', () => ({
  SvgImage: {
    CameraCaptureIcon: () => 'CameraCaptureIcon',
    FlipCameraIcon: () => 'FlipCameraIcon',
  },
}));
jest.mock('../RotatingIcon', () => ({RotatingIcon: () => null}));
jest.mock('../../shared/commonUtil', () => {
  const fn = jest.fn(() => ({}));
  return {__esModule: true, default: fn};
});

import FaceCompare from './FaceCompare';

describe('FaceCompare', () => {
  const defaultProps = {
    whichCamera: 'front' as any,
    setCameraRef: jest.fn(),
    isCapturing: false,
    isVerifying: false,
    flipCamera: jest.fn(),
    service: {send: jest.fn()},
    t: (key: string) => key,
  };

  it('should render camera view with buttons', () => {
    const {toJSON} = render(<FaceCompare {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render rotating icon when capturing', () => {
    const {toJSON} = render(
      <FaceCompare {...defaultProps} isCapturing={true} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render rotating icon when verifying', () => {
    const {toJSON} = render(
      <FaceCompare {...defaultProps} isVerifying={true} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should call service.send(CAPTURE) when capture button is pressed', () => {
    const {getByTestId} = render(<FaceCompare {...defaultProps} />);
    fireEvent.press(getByTestId('captureButton'));
    expect(defaultProps.service.send).toHaveBeenCalledWith('CAPTURE');
  });

  it('should call flipCamera when flip button is pressed', () => {
    const {getByTestId} = render(<FaceCompare {...defaultProps} />);
    fireEvent.press(getByTestId('flipCameraButton'));
    expect(defaultProps.flipCamera).toHaveBeenCalled();
  });
});
