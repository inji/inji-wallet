import React from 'react';
import {render} from '@testing-library/react-native';
import {WalletVerified, WalletBinding} from './WalletBinding';

jest.mock('../../../components/KebabPopUpController', () => ({
  useKebabPopUp: () => ({
    isBindingWarning: false,
    isAcceptingOtpInput: false,
    isWalletBindingError: false,
    walletBindingInProgress: false,
    walletBindingError: '',
    otpError: '',
    communicationDetails: {phoneNumber: '', emailId: ''},
    CONFIRM: jest.fn(),
    CANCEL: jest.fn(),
    DISMISS: jest.fn(),
    INPUT_OTP: jest.fn(),
    RESEND_OTP: jest.fn(),
  }),
}));

jest.mock('./BindingVcWarningOverlay', () => ({
  BindingVcWarningOverlay: () => 'BindingVcWarningOverlay',
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

describe('WalletVerified', () => {
  it('should match snapshot', () => {
    const {toJSON} = render(<WalletVerified />);
    expect(toJSON()).toMatchSnapshot();
  });
});

describe('WalletBinding', () => {
  const defaultProps = {
    service: {} as any,
    vcMetadata: {} as any,
  };

  it('should match snapshot', () => {
    const {toJSON} = render(<WalletBinding {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
