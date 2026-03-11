const mockSettingsSend = jest.fn();
const mockVcMetaSend = jest.fn();

jest.mock('@xstate/react', () => ({
  useSelector: jest.fn(() => undefined),
}));
jest.mock('../machines/settings', () => ({
  selectIsPasscodeUnlock: jest.fn(),
  selectIsBiometricUnlock: jest.fn(),
  SettingsEvents: {
    DISMISS: jest.fn(() => ({type: 'DISMISS'})),
  },
}));
jest.mock(
  '../machines/VerifiableCredential/VCMetaMachine/VCMetaMachine',
  () => ({
    VcMetaEvents: {
      RESET_WALLET_BINDING_SUCCESS: jest.fn(() => ({
        type: 'RESET_WALLET_BINDING_SUCCESS',
      })),
      RESET_VERIFICATION_STATUS: jest.fn((v: any) => ({
        type: 'RESET_VERIFICATION_STATUS',
        value: v,
      })),
      RESET_DOWNLOADING_FAILED: jest.fn(() => ({
        type: 'RESET_DOWNLOADING_FAILED',
      })),
      RESET_DOWNLOADING_SUCCESS: jest.fn(() => ({
        type: 'RESET_DOWNLOADING_SUCCESS',
      })),
      RESET_REVERIFY_VC_SUCCESS: jest.fn(() => ({
        type: 'RESET_REVERIFY_VC_SUCCESS',
      })),
      RESET_REVERIFY_VC_FAILED: jest.fn(() => ({
        type: 'RESET_REVERIFY_VC_FAILED',
      })),
    },
  }),
);
jest.mock(
  '../machines/VerifiableCredential/VCMetaMachine/VCMetaSelectors',
  () => ({
    selectIsDownloadingFailed: jest.fn(),
    selectIsDownloadingSuccess: jest.fn(),
    selectIsReverificationFailure: jest.fn(),
    selectIsReverificationSuccess: jest.fn(),
    selectWalletBindingSuccess: jest.fn(),
  }),
);
jest.mock(
  '../machines/VerifiableCredential/VCItemMachine/VCItemSelectors',
  () => ({
    selectVerificationStatus: jest.fn(),
  }),
);
jest.mock('../shared/GlobalContext', () => ({
  GlobalContext: {_currentValue: {appService: {children: new Map()}}},
}));

const React = require('react');
jest.spyOn(React, 'useContext').mockReturnValue({
  appService: {
    children: new Map([
      ['settings', {send: mockSettingsSend}],
      ['vcMeta', {send: mockVcMetaSend}],
    ]),
  },
});

import {UseBannerNotification} from './BannerNotificationController';

describe('BannerNotificationController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(React, 'useContext').mockReturnValue({
      appService: {
        children: new Map([
          ['settings', {send: mockSettingsSend}],
          ['vcMeta', {send: mockVcMetaSend}],
        ]),
      },
    });
  });

  it('DISMISS sends settings DISMISS', () => {
    const result = UseBannerNotification();
    result.DISMISS();
    expect(mockSettingsSend).toHaveBeenCalled();
  });

  it('RESET_WALLET_BINDING_SUCCESS sends event', () => {
    const result = UseBannerNotification();
    result.RESET_WALLET_BINDING_SUCCESS();
    expect(mockVcMetaSend).toHaveBeenCalled();
  });

  it('RESET_VERIFICATION_STATUS sends event with null', () => {
    const result = UseBannerNotification();
    result.RESET_VERIFICATION_STATUS();
    expect(mockVcMetaSend).toHaveBeenCalled();
  });

  it('RESET_DOWNLOADING_FAILED sends event', () => {
    const result = UseBannerNotification();
    result.RESET_DOWNLOADING_FAILED();
    expect(mockVcMetaSend).toHaveBeenCalled();
  });

  it('RESET_DOWNLOADING_SUCCESS sends event', () => {
    const result = UseBannerNotification();
    result.RESET_DOWNLOADING_SUCCESS();
    expect(mockVcMetaSend).toHaveBeenCalled();
  });

  it('RESET_REVIRIFICATION_SUCCESS sends event', () => {
    const result = UseBannerNotification();
    result.RESET_REVIRIFICATION_SUCCESS();
    expect(mockVcMetaSend).toHaveBeenCalled();
  });

  it('RESET_REVERIFICATION_FAILURE sends event', () => {
    const result = UseBannerNotification();
    result.RESET_REVERIFICATION_FAILURE();
    expect(mockVcMetaSend).toHaveBeenCalled();
  });
});
