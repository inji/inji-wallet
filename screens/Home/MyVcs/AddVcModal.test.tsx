import React from 'react';
import {render} from '@testing-library/react-native';
import {AddVcModal} from './AddVcModal';

jest.mock('./AddVcModalController', () => ({
  useAddVcModal: () => ({
    isAcceptingUinInput: false,
    isAcceptingOtpInput: false,
    isRequestingCredential: false,
    isDownloadCancelled: false,
    otpError: '',
    isPhoneNumber: false,
    isEmail: false,
    DISMISS: jest.fn(),
    INPUT_OTP: jest.fn(),
    RESEND_OTP: jest.fn(),
  }),
}));

jest.mock('./IdInputModal', () => ({
  IdInputModal: () => 'IdInputModal',
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

jest.mock('../../../shared/constants', () => ({
  GET_INDIVIDUAL_ID: jest.fn(),
}));

describe('AddVcModal', () => {
  const defaultProps = {
    isVisible: true,
    onDismiss: jest.fn(),
    service: {} as any,
    onPress: jest.fn(),
  };

  it('should match snapshot', () => {
    const {toJSON} = render(<AddVcModal {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
