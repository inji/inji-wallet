import React from 'react';
import {render} from '@testing-library/react-native';
import {BannerNotificationContainer} from './BannerNotificationContainer';

// Mock all controllers
jest.mock('./BannerNotificationController', () => ({
  UseBannerNotification: jest.fn(() => ({
    isBindingSuccess: false,
    verificationStatus: null,
    isPasscodeUnlock: false,
    isBiometricUnlock: false,
    isDownloadingFailed: false,
    isDownloadingSuccess: false,
    isReverificationSuccess: {status: false},
    isReverificationFailed: {status: false},
    RESET_WALLET_BINDING_SUCCESS: jest.fn(),
    RESET_VERIFICATION_STATUS: jest.fn(),
    RESET_DOWNLOADING_FAILED: jest.fn(),
    RESET_DOWNLOADING_SUCCESS: jest.fn(),
    RESET_REVIRIFICATION_SUCCESS: jest.fn(),
    RESET_REVERIFICATION_FAILURE: jest.fn(),
    DISMISS: jest.fn(),
  })),
}));

jest.mock('../screens/Scan/ScanScreenController', () => ({
  useScanScreen: jest.fn(() => ({
    showQuickShareSuccessBanner: false,
    DISMISS_QUICK_SHARE_BANNER: jest.fn(),
  })),
}));

jest.mock('../screens/Settings/SettingScreenController', () => ({
  useSettingsScreen: jest.fn(() => ({
    isKeyOrderSet: null,
    RESET_KEY_ORDER_RESPONSE: jest.fn(),
  })),
}));

jest.mock('./BackupAndRestoreBannerNotification', () => ({
  BackupAndRestoreBannerNotification: jest.fn(() => null),
}));

jest.mock('./BannerNotification', () => ({
  BannerNotification: jest.fn(() => null),
  BannerStatusType: {
    IN_PROGRESS: 'inProgress',
    SUCCESS: 'success',
    ERROR: 'error',
  },
}));

const {BannerNotification} = require('./BannerNotification');
const {UseBannerNotification} = require('./BannerNotificationController');
const {useScanScreen} = require('../screens/Scan/ScanScreenController');
const {
  useSettingsScreen,
} = require('../screens/Settings/SettingScreenController');

const defaultBannerState = {
  isBindingSuccess: false,
  verificationStatus: null,
  isPasscodeUnlock: false,
  isBiometricUnlock: false,
  isDownloadingFailed: false,
  isDownloadingSuccess: false,
  isReverificationSuccess: {status: false},
  isReverificationFailed: {status: false},
  RESET_WALLET_BINDING_SUCCESS: jest.fn(),
  RESET_VERIFICATION_STATUS: jest.fn(),
  RESET_DOWNLOADING_FAILED: jest.fn(),
  RESET_DOWNLOADING_SUCCESS: jest.fn(),
  RESET_REVIRIFICATION_SUCCESS: jest.fn(),
  RESET_REVERIFICATION_FAILURE: jest.fn(),
  DISMISS: jest.fn(),
};

describe('BannerNotificationContainer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should match snapshot with default props', () => {
    const {toJSON} = render(<BannerNotificationContainer />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render wallet binding success banner', () => {
    (UseBannerNotification as jest.Mock).mockReturnValueOnce({
      ...defaultBannerState,
      isBindingSuccess: true,
    });
    render(<BannerNotificationContainer />);
    expect(BannerNotification).toHaveBeenCalledWith(
      expect.objectContaining({testId: 'activatedVcPopup', type: 'success'}),
      expect.anything(),
    );
  });

  it('should render downloading failed banner', () => {
    (UseBannerNotification as jest.Mock).mockReturnValueOnce({
      ...defaultBannerState,
      isDownloadingFailed: true,
    });
    render(<BannerNotificationContainer />);
    expect(BannerNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        testId: 'downloadingVcFailedPopup',
        type: 'error',
      }),
      expect.anything(),
    );
  });

  it('should render downloading success banner', () => {
    (UseBannerNotification as jest.Mock).mockReturnValueOnce({
      ...defaultBannerState,
      isDownloadingSuccess: true,
    });
    render(<BannerNotificationContainer />);
    expect(BannerNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        testId: 'downloadingVcSuccessPopup',
        type: 'success',
      }),
      expect.anything(),
    );
  });

  it('should render passcode unlock success banner', () => {
    (UseBannerNotification as jest.Mock).mockReturnValueOnce({
      ...defaultBannerState,
      isPasscodeUnlock: true,
    });
    render(<BannerNotificationContainer />);
    expect(BannerNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        testId: 'alternatePasscodeSuccess',
        type: 'success',
      }),
      expect.anything(),
    );
  });

  it('should render biometric unlock success banner', () => {
    (UseBannerNotification as jest.Mock).mockReturnValueOnce({
      ...defaultBannerState,
      isBiometricUnlock: true,
    });
    render(<BannerNotificationContainer />);
    expect(BannerNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        testId: 'alternateBiometricSuccess',
        type: 'success',
      }),
      expect.anything(),
    );
  });

  it('should render reverification success banner', () => {
    (UseBannerNotification as jest.Mock).mockReturnValueOnce({
      ...defaultBannerState,
      isReverificationSuccess: {
        status: true,
        statusValue: 'valid',
        vcType: 'TestVC',
      },
    });
    render(<BannerNotificationContainer />);
    expect(BannerNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        testId: 'reverifiedSuccessfullyPopup',
        type: 'success',
      }),
      expect.anything(),
    );
  });

  it('should render reverification failure banner', () => {
    (UseBannerNotification as jest.Mock).mockReturnValueOnce({
      ...defaultBannerState,
      isReverificationFailed: {
        status: true,
        statusValue: 'expired',
        vcType: 'TestVC',
      },
    });
    render(<BannerNotificationContainer />);
    expect(BannerNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        testId: 'reverificationFailedPopup',
        type: 'error',
      }),
      expect.anything(),
    );
  });

  it('should render quick share success banner', () => {
    (useScanScreen as jest.Mock).mockReturnValueOnce({
      showQuickShareSuccessBanner: true,
      DISMISS_QUICK_SHARE_BANNER: jest.fn(),
    });
    render(<BannerNotificationContainer />);
    expect(BannerNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        testId: 'quickShareSuccessBanner',
        type: 'success',
      }),
      expect.anything(),
    );
  });

  it('should render key order success banner', () => {
    (useSettingsScreen as jest.Mock).mockReturnValueOnce({
      isKeyOrderSet: true,
      RESET_KEY_ORDER_RESPONSE: jest.fn(),
    });
    render(<BannerNotificationContainer />);
    expect(BannerNotification).toHaveBeenCalledWith(
      expect.objectContaining({testId: 'keyOrderingSuccess', type: 'success'}),
      expect.anything(),
    );
  });

  it('should render key order error banner', () => {
    (useSettingsScreen as jest.Mock).mockReturnValueOnce({
      isKeyOrderSet: false,
      RESET_KEY_ORDER_RESPONSE: jest.fn(),
    });
    render(<BannerNotificationContainer />);
    expect(BannerNotification).toHaveBeenCalledWith(
      expect.objectContaining({testId: 'keyOrderingError', type: 'error'}),
      expect.anything(),
    );
  });
});
