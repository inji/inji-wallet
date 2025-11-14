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

describe('BannerNotificationContainer Component', () => {
  it('should match snapshot with no banners visible', () => {
    const {toJSON} = render(<BannerNotificationContainer />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with verification banner enabled', () => {
    const {toJSON} = render(
      <BannerNotificationContainer showVerificationStatusBanner={true} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with verification banner disabled', () => {
    const {toJSON} = render(
      <BannerNotificationContainer showVerificationStatusBanner={false} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
