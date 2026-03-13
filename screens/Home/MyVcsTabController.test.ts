const mockServiceSend = jest.fn();
const mockVcMetaSend = jest.fn();
const mockSettingsSend = jest.fn();
const mockAuthSend = jest.fn();

jest.mock('@xstate/react', () => ({
  useSelector: jest.fn(() => undefined),
}));
jest.mock(
  '../../machines/VerifiableCredential/VCMetaMachine/VCMetaSelectors',
  () => ({
    selectAreAllVcsDownloaded: jest.fn(),
    selectDownloadingFailedVcs: jest.fn(),
    selectInProgressVcDownloads: jest.fn(),
    selectIsRefreshingMyVcs: jest.fn(),
    selectIsReverificationFailure: jest.fn(),
    selectIsReverificationSuccess: jest.fn(),
    selectIsTampered: jest.fn(),
    selectMyVcs: jest.fn(),
    selectMyVcsMetadata: jest.fn(),
    selectVerificationErrorMessage: jest.fn(),
    selectWalletBindingSuccess: jest.fn(),
  }),
);
jest.mock(
  '../../machines/VerifiableCredential/VCItemMachine/VCItemSelectors',
  () => ({
    selectWalletBindingError: jest.fn(),
    selectShowWalletBindingError: jest.fn(),
  }),
);
jest.mock('./MyVcsTabMachine', () => ({
  MyVcsTabEvents: {
    SET_STORE_VC_ITEM_STATUS: jest.fn(() => ({
      type: 'SET_STORE_VC_ITEM_STATUS',
    })),
    RESET_STORE_VC_ITEM_STATUS: jest.fn(() => ({
      type: 'RESET_STORE_VC_ITEM_STATUS',
    })),
    DISMISS: jest.fn(() => ({type: 'DISMISS'})),
    TRY_AGAIN: jest.fn(() => ({type: 'TRY_AGAIN'})),
    ADD_VC: jest.fn(() => ({type: 'ADD_VC'})),
    GET_VC: jest.fn(() => ({type: 'GET_VC'})),
    VIEW_VC: jest.fn((vcRef: any) => ({type: 'VIEW_VC', vcRef})),
  },
  MyVcsTabMachine: {},
  selectAddVcModal: jest.fn(),
  selectGetVcModal: jest.fn(),
  selectIsNetworkOff: jest.fn(),
  selectIsRequestSuccessful: jest.fn(),
}));
jest.mock('../../machines/settings', () => ({
  selectShowHardwareKeystoreNotExistsAlert: jest.fn(),
  SettingsEvents: {
    ACCEPT_HARDWARE_SUPPORT_NOT_EXISTS: jest.fn(() => ({type: 'ACCEPT'})),
  },
}));
jest.mock(
  '../../machines/VerifiableCredential/VCItemMachine/VCItemMachine',
  () => ({
    VCItemMachine: {},
  }),
);
jest.mock(
  '../../machines/VerifiableCredential/VCMetaMachine/VCMetaMachine',
  () => ({
    VcMetaEvents: {
      REFRESH_MY_VCS: jest.fn(() => ({type: 'REFRESH_MY_VCS'})),
      RESET_WALLET_BINDING_SUCCESS: jest.fn(() => ({
        type: 'RESET_WALLET_BINDING_SUCCESS',
      })),
      REMOVE_TAMPERED_VCS: jest.fn(() => ({type: 'REMOVE_TAMPERED_VCS'})),
      DELETE_VC: jest.fn(() => ({type: 'DELETE_VC'})),
      RESET_VERIFY_ERROR: jest.fn(() => ({type: 'RESET_VERIFY_ERROR'})),
      RESET_IN_PROGRESS_VCS_DOWNLOADED: jest.fn(() => ({
        type: 'RESET_IN_PROGRESS_VCS_DOWNLOADED',
      })),
      RESET_REVERIFY_VC_FAILED: jest.fn(() => ({
        type: 'RESET_REVERIFY_VC_FAILED',
      })),
      RESET_REVERIFY_VC_SUCCESS: jest.fn(() => ({
        type: 'RESET_REVERIFY_VC_SUCCESS',
      })),
      RESET_HIGHLIGHT: jest.fn(() => ({type: 'RESET_HIGHLIGHT'})),
    },
  }),
);
jest.mock('../../machines/auth', () => ({
  AuthEvents: {
    SET_TOUR_GUIDE: jest.fn((v: any) => ({type: 'SET_TOUR_GUIDE', value: v})),
  },
  selectIsInitialDownload: jest.fn(),
  selectIsOnboarding: jest.fn(),
}));
jest.mock('../../shared/GlobalContext', () => ({
  GlobalContext: {_currentValue: {appService: {children: new Map()}}},
}));

const React = require('react');
jest.spyOn(React, 'useContext').mockReturnValue({
  appService: {
    children: new Map([
      ['vcMeta', {send: mockVcMetaSend}],
      ['settings', {send: mockSettingsSend}],
      ['auth', {send: mockAuthSend}],
    ]),
  },
});

import {useMyVcsTab} from './MyVcsTabController';

describe('MyVcsTabController', () => {
  const mockService = {send: mockServiceSend} as any;
  const mockProps = {service: mockService} as any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(React, 'useContext').mockReturnValue({
      appService: {
        children: new Map([
          ['vcMeta', {send: mockVcMetaSend}],
          ['settings', {send: mockSettingsSend}],
          ['auth', {send: mockAuthSend}],
        ]),
      },
    });
  });

  it('returns expected properties', () => {
    const result = useMyVcsTab(mockProps);
    expect(result).toHaveProperty('service');
    expect(result).toHaveProperty('vcMetadatas');
    expect(result).toHaveProperty('isRefreshingVcs');
    expect(result).toHaveProperty('isRequestSuccessful');
    expect(result).toHaveProperty('isBindingError');
    expect(result).toHaveProperty('isBindingSuccess');
    expect(result).toHaveProperty('isNetworkOff');
    expect(result).toHaveProperty('areAllVcsLoaded');
    expect(result).toHaveProperty('isTampered');
    expect(result).toHaveProperty('downloadFailedVcs');
    expect(result).toHaveProperty('DISMISS');
    expect(result).toHaveProperty('TRY_AGAIN');
    expect(result).toHaveProperty('DOWNLOAD_ID');
    expect(result).toHaveProperty('GET_VC');
    expect(result).toHaveProperty('REFRESH');
    expect(result).toHaveProperty('VIEW_VC');
    expect(result).toHaveProperty('DELETE_VC');
    expect(result).toHaveProperty('REMOVE_TAMPERED_VCS');
  });

  it('DISMISS sends event to service', () => {
    const result = useMyVcsTab(mockProps);
    result.DISMISS();
    expect(mockServiceSend).toHaveBeenCalled();
  });

  it('TRY_AGAIN sends event to service', () => {
    const result = useMyVcsTab(mockProps);
    result.TRY_AGAIN();
    expect(mockServiceSend).toHaveBeenCalled();
  });

  it('DOWNLOAD_ID sends ADD_VC event', () => {
    const result = useMyVcsTab(mockProps);
    result.DOWNLOAD_ID();
    expect(mockServiceSend).toHaveBeenCalled();
  });

  it('GET_VC sends GET_VC event', () => {
    const result = useMyVcsTab(mockProps);
    result.GET_VC();
    expect(mockServiceSend).toHaveBeenCalled();
  });

  it('REFRESH sends to vcMetaService', () => {
    const result = useMyVcsTab(mockProps);
    result.REFRESH();
    expect(mockVcMetaSend).toHaveBeenCalled();
  });

  it('VIEW_VC sends VIEW_VC event', () => {
    const mockVcRef = {} as any;
    const result = useMyVcsTab(mockProps);
    result.VIEW_VC(mockVcRef);
    expect(mockServiceSend).toHaveBeenCalled();
  });

  it('DISMISS_WALLET_BINDING_NOTIFICATION_BANNER sends event', () => {
    const result = useMyVcsTab(mockProps);
    result.DISMISS_WALLET_BINDING_NOTIFICATION_BANNER();
    expect(mockVcMetaSend).toHaveBeenCalled();
  });

  it('ACCEPT_HARDWARE_SUPPORT_NOT_EXISTS sends settings event', () => {
    const result = useMyVcsTab(mockProps);
    result.ACCEPT_HARDWARE_SUPPORT_NOT_EXISTS();
    expect(mockSettingsSend).toHaveBeenCalled();
  });

  it('REMOVE_TAMPERED_VCS sends vcMeta event', () => {
    const result = useMyVcsTab(mockProps);
    result.REMOVE_TAMPERED_VCS();
    expect(mockVcMetaSend).toHaveBeenCalled();
  });

  it('DELETE_VC sends vcMeta event', () => {
    const result = useMyVcsTab(mockProps);
    result.DELETE_VC();
    expect(mockVcMetaSend).toHaveBeenCalled();
  });

  it('RESET_VERIFY_ERROR sends vcMeta event', () => {
    const result = useMyVcsTab(mockProps);
    result.RESET_VERIFY_ERROR();
    expect(mockVcMetaSend).toHaveBeenCalled();
  });

  it('SET_STORE_VC_ITEM_STATUS sends event', () => {
    const result = useMyVcsTab(mockProps);
    result.SET_STORE_VC_ITEM_STATUS();
    expect(mockServiceSend).toHaveBeenCalled();
  });

  it('RESET_STORE_VC_ITEM_STATUS sends event', () => {
    const result = useMyVcsTab(mockProps);
    result.RESET_STORE_VC_ITEM_STATUS();
    expect(mockServiceSend).toHaveBeenCalled();
  });

  it('RESET_IN_PROGRESS_VCS_DOWNLOADED sends event', () => {
    const result = useMyVcsTab(mockProps);
    result.RESET_IN_PROGRESS_VCS_DOWNLOADED();
    expect(mockVcMetaSend).toHaveBeenCalled();
  });

  it('SET_TOUR_GUIDE sends auth event', () => {
    const result = useMyVcsTab(mockProps);
    result.SET_TOUR_GUIDE(true);
    expect(mockAuthSend).toHaveBeenCalled();
  });

  it('RESET_REVERIFICATION_FAILURE sends vcMeta event', () => {
    const result = useMyVcsTab(mockProps);
    result.RESET_REVERIFICATION_FAILURE();
    expect(mockVcMetaSend).toHaveBeenCalled();
  });

  it('RESET_REVERIFICATION_SUCCESS sends vcMeta event', () => {
    const result = useMyVcsTab(mockProps);
    result.RESET_REVERIFICATION_SUCCESS();
    expect(mockVcMetaSend).toHaveBeenCalled();
  });

  it('RESET_HIGHLIGHT sends vcMeta event', () => {
    const result = useMyVcsTab(mockProps);
    result.RESET_HIGHLIGHT();
    expect(mockVcMetaSend).toHaveBeenCalled();
  });
});
