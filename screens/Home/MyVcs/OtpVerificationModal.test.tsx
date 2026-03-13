import React from 'react';
import {render} from '@testing-library/react-native';
import {OtpVerificationModal} from './OtpVerificationModal';

jest.mock('../../../components/ui/Modal', () => ({
  Modal: ({children, ...props}: any) => {
    const {View} = require('react-native');
    return (
      <View testID="modal" {...props}>
        {children}
      </View>
    );
  },
}));

jest.mock('./OtpVerificationModalController', () => ({
  useOtpVerificationModal: () => ({
    otp: '',
    otpError: '',
    INPUT_OTP: jest.fn(),
    isInvalidOtp: false,
  }),
}));

jest.mock('../../../components/PinInput', () => ({
  PinInput: () => 'PinInput',
}));

jest.mock('../../../components/MessageOverlay', () => ({
  MessageOverlay: (props: any) => {
    const {View} = require('react-native');
    return props.isVisible ? <View testID="messageOverlay" /> : null;
  },
}));

jest.mock('../../../shared/telemetry/TelemetryUtils', () => ({
  getImpressionEventData: jest.fn(),
  incrementRetryCount: jest.fn(),
  resetRetryCount: jest.fn(),
  sendImpressionEvent: jest.fn(),
}));

jest.mock('../../../shared/constants', () => ({
  GET_INDIVIDUAL_ID: jest.fn(),
  isIOS: () => false,
  isAndroid: () => true,
}));

jest.mock('../../../components/ui/svg', () => ({
  SvgImage: {
    OtpVerificationIcon: () => 'OtpVerificationIcon',
  },
}));

jest.mock('../../../shared/hooks/useScreenHeight', () => ({
  useScreenHeight: () => ({isSmallScreen: false, screenHeight: 800}),
}));

describe('OtpVerificationModal', () => {
  const defaultProps = {
    isVisible: true,
    onDismiss: jest.fn(),
    onInputDone: jest.fn(),
    error: '',
    resend: jest.fn(),
    phone: '',
    email: '',
    flow: 'vcDownload',
    service: {} as any,
  };

  it('should match snapshot', () => {
    const {toJSON} = render(<OtpVerificationModal {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with error', () => {
    const {toJSON} = render(
      <OtpVerificationModal {...defaultProps} error="Invalid OTP" />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with phone and email', () => {
    const {toJSON} = render(
      <OtpVerificationModal
        {...defaultProps}
        phone="1234567890"
        email="test@example.com"
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
