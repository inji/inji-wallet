import React from 'react';
import {render} from '@testing-library/react-native';
import {GetVcModal} from './GetVcModal';

jest.mock('./GetVcModalController', () => ({
  useGetVcModal: () => ({
    isAcceptingUinInput: false,
    isAcceptingOtpInput: false,
    isRequestingCredential: false,
    otpError: '',
    phoneNumber: '',
    email: '',
    DISMISS: jest.fn(),
    INPUT_OTP: jest.fn(),
    RESEND_OTP: jest.fn(),
  }),
}));

jest.mock('./GetIdInputModal', () => ({
  GetIdInputModal: () => 'GetIdInputModal',
}));

jest.mock('./OtpVerificationModal', () => ({
  OtpVerificationModal: () => 'OtpVerificationModal',
}));

jest.mock('../../../components/MessageOverlay', () => ({
  MessageOverlay: (props: any) => {
    const {View} = require('react-native');
    return props.isVisible ? <View testID="messageOverlay" /> : null;
  },
}));

describe('GetVcModal', () => {
  const defaultProps = {
    isVisible: true,
    onDismiss: jest.fn(),
    service: {} as any,
  };

  it('should match snapshot', () => {
    const {toJSON} = render(<GetVcModal {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
