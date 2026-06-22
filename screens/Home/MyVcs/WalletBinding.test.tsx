import React from 'react';
import {render} from '@testing-library/react-native';
import {WalletVerified, WalletBinding} from './WalletBinding';
import {useOverlayVisibleAfterTimeout} from '../../../shared/hooks/useOverlayVisibleAfterTimeout';
import {isAndroid} from '../../../shared/constants';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires */

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

jest.mock('../../../shared/hooks/useOverlayVisibleAfterTimeout');
jest.mock('../../../shared/constants');

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

/* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires */

describe('WalletVerified', () => {
  it('should match snapshot', () => {
    const {toJSON} = render(<WalletVerified />);
    expect(toJSON()).toMatchSnapshot();
  });
});

describe('WalletBinding', () => {
  const defaultProps = {
    service: {} as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    vcMetadata: {} as any, // eslint-disable-line @typescript-eslint/no-explicit-any
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useOverlayVisibleAfterTimeout as jest.Mock).mockImplementation((visible) => visible);
    (isAndroid as jest.Mock).mockReturnValue(false);
  });

  describe('useOverlayVisibleAfterTimeout for walletBindingInProgress', () => {
    it('should call useOverlayVisibleAfterTimeout with walletBindingInProgress state', () => {
      render(<WalletBinding {...defaultProps} />);

      expect(useOverlayVisibleAfterTimeout).toHaveBeenCalledWith(
        expect.any(Boolean),
        expect.any(Number)
      );
    });

    it('should pass iOS delay of 200ms when platform is iOS', () => {
      (isAndroid as jest.Mock).mockReturnValue(false);

      render(<WalletBinding {...defaultProps} />);

      const calls = (useOverlayVisibleAfterTimeout as jest.Mock).mock.calls;
      expect(calls[0][1]).toBe(200); // First call: walletBindingInProgress
    });

    it('should pass Android delay of 0ms when platform is Android', () => {
      (isAndroid as jest.Mock).mockReturnValue(true);

      render(<WalletBinding {...defaultProps} />);

      const calls = (useOverlayVisibleAfterTimeout as jest.Mock).mock.calls;
      expect(calls[0][1]).toBe(0); // First call: walletBindingInProgress
    });
  });

  describe('useOverlayVisibleAfterTimeout for walletBindingError', () => {
    it('should pass iOS delay of 200ms when platform is iOS for walletBindingError call', () => {
      (isAndroid as jest.Mock).mockReturnValue(false);

      render(<WalletBinding {...defaultProps} />);

      const calls = (useOverlayVisibleAfterTimeout as jest.Mock).mock.calls;
      expect(calls.length).toBe(2);
      expect(calls[1][1]).toBe(200); // Second call: walletBindingError
    });

    it('should pass Android delay of 0ms when platform is Android for walletBindingError call', () => {
      (isAndroid as jest.Mock).mockReturnValue(true);

      render(<WalletBinding {...defaultProps} />);

      const calls = (useOverlayVisibleAfterTimeout as jest.Mock).mock.calls;
      expect(calls.length).toBe(2);
      expect(calls[1][1]).toBe(0); // Second call: walletBindingError
    });

    it('should pass false for walletBindingError when error is empty', () => {
      render(<WalletBinding {...defaultProps} />);

      const calls = (useOverlayVisibleAfterTimeout as jest.Mock).mock.calls;
      // Second call is for walletBindingError - should have false (no error)
      expect(calls[1][0]).toBe(false);
    });
  });

  it('should match snapshot', () => {
    (useOverlayVisibleAfterTimeout as jest.Mock).mockImplementation((visible) => visible);

    const {toJSON} = render(<WalletBinding {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
