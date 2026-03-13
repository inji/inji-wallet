import React from 'react';

jest.mock('@xstate/react', () => ({
  useSelector: jest.fn(() => undefined),
  useMachine: jest.fn(() => [{}, jest.fn(), {}]),
}));

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({isConnected: true})),
}));

jest.mock(
  '../../machines/VerifiableCredential/VCItemMachine/VCItemSelectors',
  () => ({
    selectAcceptingBindingOtp: jest.fn(),
    selectBindingAuthFailedError: jest.fn(),
    selectBindingWarning: jest.fn(),
    selectIsCommunicationDetails: jest.fn(),
    selectOtpError: jest.fn(),
    selectShowWalletBindingError: jest.fn(),
    selectVc: jest.fn(),
    selectVerifiableCredentialData: jest.fn(),
    selectWalletBindingError: jest.fn(),
    selectWalletBindingInProgress: jest.fn(),
    selectWalletBindingResponse: jest.fn(),
    selectWalletBindingSuccess: jest.fn(),
    selectVerificationStatus: jest.fn(),
    selectIsVerificationInProgress: jest.fn(),
    selectShowVerificationStatusBanner: jest.fn(),
    selectIsVerificationCompleted: jest.fn(),
    selectCredential: jest.fn(),
    isReverifyingVc: jest.fn(),
  }),
);

jest.mock('../../machines/auth', () => ({
  selectPasscode: jest.fn(),
}));

jest.mock('../../machines/biometrics', () => ({
  biometricsMachine: {},
  selectIsSuccess: jest.fn(),
}));

jest.mock(
  '../../machines/VerifiableCredential/VCItemMachine/VCItemMachine',
  () => ({
    VCItemEvents: {
      ADD_WALLET_BINDING_ID: jest.fn(() => ({type: 'ADD_WALLET_BINDING_ID'})),
      INPUT_OTP: jest.fn(otp => ({type: 'INPUT_OTP', otp})),
      DISMISS: jest.fn(() => ({type: 'DISMISS'})),
      RESEND_OTP: jest.fn(() => ({type: 'RESEND_OTP'})),
      CANCEL: jest.fn(() => ({type: 'CANCEL'})),
      CONFIRM: jest.fn(() => ({type: 'CONFIRM'})),
      REFRESH: jest.fn(() => ({type: 'REFRESH'})),
      RESET_VERIFICATION_STATUS: jest.fn(() => ({
        type: 'RESET_VERIFICATION_STATUS',
      })),
    },
  }),
);

jest.mock('./MyVcs/AddVcModalMachine', () => ({
  selectIsAcceptingOtpInput: jest.fn(),
}));

jest.mock('../../components/BannerNotification', () => ({
  BannerStatusType: {IN_PROGRESS: 'IN_PROGRESS'},
}));

jest.mock('../../shared/GlobalContext', () => ({
  GlobalContext: React.createContext(null),
}));

import {useViewVcModal} from './ViewVcModalController';

describe('useViewVcModal', () => {
  const mockVcSend = jest.fn();
  const mockVcItemActor = {send: mockVcSend} as any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(React, 'useContext').mockReturnValue({
      appService: {
        children: new Map([['auth', {send: jest.fn()}]]),
      },
    });
  });

  it('initial error should be empty string', () => {
    const result = useViewVcModal({
      vcItemActor: mockVcItemActor,
      isVisible: true,
    } as any);
    expect(result.error).toBe('');
  });

  it('initial message should be empty string', () => {
    const result = useViewVcModal({
      vcItemActor: mockVcItemActor,
      isVisible: true,
    } as any);
    expect(result.message).toBe('');
  });

  it('toastVisible should be false initially', () => {
    const result = useViewVcModal({
      vcItemActor: mockVcItemActor,
      isVisible: true,
    } as any);
    expect(result.toastVisible).toBe(false);
  });

  it('reAuthenticating should be empty string initially', () => {
    const result = useViewVcModal({
      vcItemActor: mockVcItemActor,
      isVisible: true,
    } as any);
    expect(result.reAuthenticating).toBe('');
  });

  it('addtoWallet sends ADD_WALLET_BINDING_ID', () => {
    const result = useViewVcModal({
      vcItemActor: mockVcItemActor,
      isVisible: true,
    } as any);
    result.addtoWallet();
    expect(mockVcSend).toHaveBeenCalledWith({type: 'ADD_WALLET_BINDING_ID'});
  });

  it('DISMISS sends event to vcItemActor', () => {
    const result = useViewVcModal({
      vcItemActor: mockVcItemActor,
      isVisible: true,
    } as any);
    result.DISMISS();
    expect(mockVcSend).toHaveBeenCalledWith({type: 'DISMISS'});
  });

  it('INPUT_OTP sends event to vcItemActor', () => {
    const result = useViewVcModal({
      vcItemActor: mockVcItemActor,
      isVisible: true,
    } as any);
    result.INPUT_OTP('123456');
    expect(mockVcSend).toHaveBeenCalledWith({type: 'INPUT_OTP', otp: '123456'});
  });

  it('RESEND_OTP sends event to vcItemActor', () => {
    const result = useViewVcModal({
      vcItemActor: mockVcItemActor,
      isVisible: true,
    } as any);
    result.RESEND_OTP();
    expect(mockVcSend).toHaveBeenCalledWith({type: 'RESEND_OTP'});
  });

  it('CANCEL sends event to vcItemActor', () => {
    const result = useViewVcModal({
      vcItemActor: mockVcItemActor,
      isVisible: true,
    } as any);
    result.CANCEL();
    expect(mockVcSend).toHaveBeenCalledWith({type: 'CANCEL'});
  });

  it('CONFIRM sends event to vcItemActor', () => {
    const result = useViewVcModal({
      vcItemActor: mockVcItemActor,
      isVisible: true,
    } as any);
    result.CONFIRM();
    expect(mockVcSend).toHaveBeenCalledWith({type: 'CONFIRM'});
  });

  it('RESET_VERIFICATION_STATUS sends event', () => {
    const result = useViewVcModal({
      vcItemActor: mockVcItemActor,
      isVisible: true,
    } as any);
    result.RESET_VERIFICATION_STATUS();
    expect(mockVcSend).toHaveBeenCalledWith({
      type: 'RESET_VERIFICATION_STATUS',
    });
  });

  it('SHOW_VERIFICATION_STATUS_BANNER sends event', () => {
    const result = useViewVcModal({
      vcItemActor: mockVcItemActor,
      isVisible: true,
    } as any);
    result.SHOW_VERIFICATION_STATUS_BANNER();
    expect(mockVcSend).toHaveBeenCalledWith({
      type: 'SHOW_VERIFICATION_STATUS_BANNER',
      response: {statusType: 'IN_PROGRESS'},
    });
  });
});
