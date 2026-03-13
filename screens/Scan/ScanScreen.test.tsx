import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('./SendVcScreenController', () => ({
  useSendVcScreen: () => ({
    isFaceVerificationConsent: false,
    FACE_VERIFICATION_CONSENT: jest.fn(),
    DISMISS: jest.fn(),
  }),
}));

jest.mock('./SendVPScreenController', () => ({
  useSendVPScreen: () => ({
    isFaceVerificationConsent: false,
    isVerifyingIdentity: false,
    isInvalidIdentity: false,
    error: null,
    noCredentialsMatchingVPRequest: false,
    requestedClaimsByVerifier: null,
    scanScreenError: false,
    flowType: '',
    overlayDetails: null,
    credentials: null,
    verifiableCredentialsData: [],
    openID4VPRetryCount: 0,
    isOVPViaDeepLink: false,
    getAdditionalMessage: jest.fn(),
    generateAndStoreLogMessage: jest.fn(),
    FACE_VERIFICATION_CONSENT: jest.fn(),
    DISMISS_POPUP: jest.fn(),
    CANCEL: jest.fn(),
    FACE_VALID: jest.fn(),
    FACE_INVALID: jest.fn(),
    GO_TO_HOME: jest.fn(),
    RETRY_VERIFICATION: jest.fn(),
    RETRY: jest.fn(),
    RESET_RETRY_COUNT: jest.fn(),
  }),
}));

jest.mock('../../shared/hooks/useOvpErrorModal', () => ({
  useOvpErrorModal: () => [
    {show: false, title: '', message: '', showRetryButton: false},
  ],
}));

jest.mock('../../shared/constants', () => ({
  isIOS: () => false,
  isAndroid: () => true,
  LIVENESS_CHECK: false,
}));

jest.mock('react-native-bluetooth-state-manager', () => ({
  onStateChange: jest.fn(),
}));

jest.mock('../../shared/GlobalContext', () => {
  const React = require('react');
  return {
    GlobalContext: React.createContext({
      appService: {send: jest.fn()},
    }),
  };
});

jest.mock('../../machines/app', () => ({
  APP_EVENTS: {RESET_LINKCODE: () => ({type: 'RESET_LINKCODE'})},
}));

jest.mock('../../components/QrScanner', () => ({
  QrScanner: () => null,
}));

jest.mock('../QrLogin/QrLogin', () => ({
  QrLogin: () => null,
}));

jest.mock('../../components/MessageOverlay', () => ({
  MessageOverlay: () => null,
  ErrorMessageOverlay: () => null,
}));

jest.mock('../../components/BannerNotificationContainer', () => ({
  BannerNotificationContainer: () => null,
}));

jest.mock('./SharingStatusModal', () => ({
  SharingStatusModal: () => null,
}));

jest.mock('../../components/ui/svg', () => ({
  SvgImage: {
    ErrorLogo: () => 'ErrorLogo',
    PermissionDenied: () => 'PermissionDenied',
    SuccessLogo: () => 'SuccessLogo',
  },
}));

jest.mock('./LocationPermissionRational', () => ({
  LocationPermissionRational: () => null,
}));

jest.mock('./FaceVerificationAlertOverlay', () => ({
  FaceVerificationAlertOverlay: () => null,
}));

jest.mock('./VPShareOverlay', () => ({
  VPShareOverlay: () => null,
}));

jest.mock('../VerifyIdentityOverlay', () => ({
  VerifyIdentityOverlay: () => null,
}));

jest.mock('../../components/ui/Error', () => ({
  ErrorView: () => null,
}));

jest.mock('../../shared/Utils', () => ({
  VCShareFlowType: {
    OPENID4VP: 'OpenID4VP',
    MINI_VIEW_SHARE_OPENID4VP: 'OpenID4VP_MINI_VIEW_SHARE',
    MINI_VIEW_SHARE_WITH_SELFIE_OPENID4VP:
      'OpenID4VP_MINI_VIEW_SHARE_WITH_SELFIE',
  },
}));

jest.mock('../../shared/commonUtil', () => jest.fn(() => ({})));

const defaultScanControllerValues = {
  isStartPermissionCheck: false,
  isQuickShareDone: false,
  isNoSharableVCs: false,
  isScanning: false,
  isQrLogin: false,
  isQrLoginstoring: false,
  isQrRef: null,
  selectIsInvalid: false,
  isNearByDevicesPermissionDenied: false,
  isBluetoothDenied: false,
  isReadyForBluetoothStateCheck: false,
  isLocalPermissionRational: false,
  isLocationDisabled: false,
  isLocationDenied: false,
  isBluetoothPermissionDenied: false,
  isMinimumStorageRequiredForAuditEntryLimitReached: false,
  authorizationRequest: '',
  linkcode: '',
  locationError: {message: '', button: ''},
  SCAN: jest.fn(),
  GOTO_HOME: jest.fn(),
  ALLOWED: jest.fn(),
  DENIED: jest.fn(),
  LOCATION_REQUEST: jest.fn(),
  DISMISS: jest.fn(),
  START_PERMISSION_CHECK: jest.fn(),
};

let mockScanOverrides: any = {};

jest.mock('./ScanScreenController', () => ({
  useScanScreen: () => ({
    ...defaultScanControllerValues,
    ...mockScanOverrides,
  }),
}));

import {ScanScreen} from './ScanScreen';

describe('ScanScreen', () => {
  beforeEach(() => {
    mockScanOverrides = {};
  });

  it('should render default state', () => {
    const {toJSON} = render(<ScanScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render scanning state', () => {
    mockScanOverrides = {isScanning: true};
    const {toJSON} = render(<ScanScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render no sharable VCs state', () => {
    mockScanOverrides = {isNoSharableVCs: true};
    const {toJSON} = render(<ScanScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render bluetooth denied state', () => {
    mockScanOverrides = {isBluetoothDenied: true};
    const {toJSON} = render(<ScanScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render nearby devices permission denied', () => {
    mockScanOverrides = {isNearByDevicesPermissionDenied: true};
    const {toJSON} = render(<ScanScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render location disabled state', () => {
    mockScanOverrides = {
      isLocationDisabled: true,
      locationError: {message: 'Location off', button: 'Enable'},
    };
    const {toJSON} = render(<ScanScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render location denied state', () => {
    mockScanOverrides = {
      isLocationDenied: true,
      locationError: {message: 'Location denied', button: 'Settings'},
    };
    const {toJSON} = render(<ScanScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render QR login state', () => {
    mockScanOverrides = {isQrLogin: true, isQrRef: {}};
    const {toJSON} = render(<ScanScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render invalid QR state', () => {
    mockScanOverrides = {selectIsInvalid: true};
    const {toJSON} = render(<ScanScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render quick share done state', () => {
    mockScanOverrides = {isQuickShareDone: true};
    const {toJSON} = render(<ScanScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render bluetooth permission denied state', () => {
    mockScanOverrides = {isBluetoothPermissionDenied: true};
    const {toJSON} = render(<ScanScreen />);
    expect(toJSON()).toMatchSnapshot();
  });
});
