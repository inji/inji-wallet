import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('./IssuerScreenController', () => {
  const defaultValues = {
    issuers: [],
    selectedIssuer: null,
    selectedCredentialType: null,
    isDownloading: false,
    isIdle: true,
    isError: false,
    isStoring: false,
    isBiometricCancelled: false,
    isVerificationFailed: false,
    errorMessage: '',
    loadingReason: '',
    selectedIssuerId: '',
    selectedCredentialTypeId: '',
    credentialTypes: [],
    isCredentialTypeSelection: false,
    isQrScanner: false,
    isQrScannerVisible: false,
    isConsent: false,
    isTransactionCode: false,
    isOVPPresentation: false,
    isDownloadSuccessful: false,
    isVerified: false,
    flowType: '',
    verificationErrorMessage: '',
    isFullScreenError: false,
    fullScreenErrorDetails: null,
    hasTokenExpired: false,
    isSavingFailed: false,
    authRequest: null,
    credentials: [],
    isLoading: false,
    supportedCredentialTypes: [],
    SELECT_ISSUER: jest.fn(),
    SELECT_CREDENTIAL_TYPE: jest.fn(),
    CANCEL: jest.fn(),
    DISMISS: jest.fn(),
    RESET_ERROR: jest.fn(),
    TRY_AGAIN: jest.fn(),
    GO_BACK: jest.fn(),
    DOWNLOAD_ID: jest.fn(),
    VERIFY: jest.fn(),
    ACCEPT: jest.fn(),
    CONFIRM: jest.fn(),
    DOWNLOAD: jest.fn(),
    SCAN: jest.fn(),
    GOTO_HOME: jest.fn(),
    TRUST: jest.fn(),
    DECLINE_TRUST: jest.fn(),
    consentAction: jest.fn(),
    handleNavigation: jest.fn(),
    errorMessageType: '',
    isQrScanning: false,
    isPresentationAuthorization: false,
    isPresentationAuthorizationInProgress: false,
    isDownloadSuccess: false,
    isAuthorizationSuccess: false,
    authorizationType: '',
    isAuthEndpointToOpen: false,
    authEndpoint: '',
    isSelectingCredentialType: false,
    isConsentRequested: false,
    isTxCodeRequested: false,
    txCodeDisplayDetails: {},
    TX_CODE_RECEIVED: jest.fn(),
    isBiometricsCancelled: false,
    QR_CODE_SCANNED: jest.fn(),
    SCAN_CREDENTIAL_OFFER_QR_CODE: jest.fn(),
    SELECTED_ISSUER: jest.fn(),
    issuerLogo: null,
    issuerName: '',
    ON_CONSENT_GIVEN: jest.fn(),
    trustedIssuerConsentStatus: null,
    RESET_VERIFY_ERROR: jest.fn(),
    ovpMachine: null,
  };
  let overrides = {};
  return {
    __setMockOverrides: (o: any) => {
      overrides = o;
    },
    __resetMockOverrides: () => {
      overrides = {};
    },
    useIssuerScreenController: () => ({...defaultValues, ...overrides}),
  };
});

jest.mock('../../shared/hooks/UseTimer', () => ({
  useTimer: () => [0, jest.fn()],
}));

jest.mock('react-native-elements', () => {
  const {View, TouchableOpacity, Text: RNText} = require('react-native');
  const MockListItem = (props: any) => <View {...props}>{props.children}</View>;
  MockListItem.Content = (props: any) => (
    <View {...props}>{props.children}</View>
  );
  MockListItem.Title = (props: any) => <View {...props}>{props.children}</View>;
  return {
    Icon: (props: any) => <View testID="icon" />,
    ListItem: MockListItem,
    Button: (props: any) => (
      <TouchableOpacity testID={props.testID} onPress={props.onPress}>
        <RNText>{props.title}</RNText>
      </TouchableOpacity>
    ),
  };
});

jest.mock('../../components/openId4VCI/Issuer', () => ({
  Issuer: () => null,
}));

jest.mock('../../components/ui/Header', () => ({
  Header: ({children}: any) => {
    const {View} = require('react-native');
    return <View testID="header">{children}</View>;
  },
}));

jest.mock('../../components/ui/Loader', () => ({
  Loader: () => null,
}));

jest.mock('../../assets/scanIcon.svg', () => 'ScanIcon');

jest.mock('../../shared/commonUtil', () => {
  const fn = jest.fn(() => ({}));
  fn.isTranslationKeyFound = jest.fn(() => false);
  fn.removeWhiteSpace = jest.fn((s: string) => s);
  return {
    __esModule: true,
    default: fn,
    isTranslationKeyFound: jest.fn(() => false),
    removeWhiteSpace: jest.fn((s: string) => s),
  };
});

jest.mock('../../shared/openId4VCI/Utils', () => ({
  ErrorMessage: {},
  getDisplayObjectForCurrentLanguage: jest.fn(() => ({
    name: 'Test',
    logo: {url: ''},
  })),
  Protocols: {OpenId4VCI: 'OpenId4VCI'},
}));

jest.mock('../../shared/telemetry/TelemetryUtils', () => ({
  getInteractEventData: jest.fn(),
  getStartEventData: jest.fn(),
  sendInteractEvent: jest.fn(),
  sendStartEvent: jest.fn(),
  getImpressionEventData: jest.fn(),
  sendImpressionEvent: jest.fn(),
}));

jest.mock('../../shared/telemetry/TelemetryConstants', () => ({
  TelemetryConstants: {FlowType: {}, Screens: {}, InteractEventSubtype: {}},
}));

jest.mock('../../components/MessageOverlay', () => ({
  MessageOverlay: () => null,
  ErrorMessageOverlay: () => null,
}));

jest.mock('../../components/ui/SearchBar', () => ({
  SearchBar: () => null,
}));

jest.mock('../../components/ui/svg', () => ({
  SvgImage: {
    SomethingWentWrong: () => 'SomethingWentWrong',
    ErrorOccurred: () => 'ErrorOccurred',
    NoInternetConnection: () => 'NoInternetConnection',
    PermissionDenied: () => 'PermissionDenied',
  },
}));

jest.mock('../../components/BannerNotificationContainer', () => ({
  BannerNotificationContainer: () => null,
}));

jest.mock('./CredentialTypeSelectionScreen', () => ({
  CredentialTypeSelectionScreen: () => null,
}));

jest.mock('../../components/QrScanner', () => ({
  QrScanner: () => null,
}));

jest.mock('../../routes/routesConstants', () => ({
  AUTH_ROUTES: {AuthWebView: 'AuthWebView'},
}));

jest.mock('./TransactionCodeScreen', () => ({
  TransactionCodeModal: () => null,
}));

jest.mock('../../components/TrustModal', () => ({
  TrustModal: () => null,
}));

jest.mock('../Scan/SendVPScreen', () => ({
  SendVPScreen: () => null,
}));

jest.mock('../../shared/constants', () => ({
  isIOS: () => false,
  isAndroid: () => true,
  AuthorizationType: {presentation: 'presentation'},
}));

jest.mock('../../machines/Issuers/IssuersMachine', () => ({
  issuerType: {MOSIP: 'MOSIP'},
}));

jest.mock('../../components/ui/processingScreen/ProcessingModal', () => ({
  ProcessingModal: () => null,
  ProgressIndicator: () => null,
}));

jest.mock('../../components/ui/Error', () => ({
  ErrorView: () => null,
}));

import {IssuersScreen} from './IssuersScreen';

const mockIssuerController = require('./IssuerScreenController');

describe('IssuersScreen', () => {
  const defaultProps = {
    navigation: {navigate: jest.fn(), setOptions: jest.fn(), goBack: jest.fn()},
    route: {params: {}},
  } as any;

  beforeEach(() => {
    mockIssuerController.__resetMockOverrides();
    jest.clearAllMocks();
  });

  it('should render idle state', () => {
    const {toJSON} = render(<IssuersScreen {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with issuers list', () => {
    mockIssuerController.__setMockOverrides({
      issuers: [
        {
          issuer_id: 'iss1',
          display: [{name: 'Issuer One', locale: 'en'}],
          protocol: 'OpenId4VCI',
        },
        {
          issuer_id: 'iss2',
          display: [{name: 'Issuer Two', locale: 'en'}],
          protocol: 'OTP',
        },
      ],
    });
    const {toJSON} = render(<IssuersScreen {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render loading state', () => {
    mockIssuerController.__setMockOverrides({
      loadingReason: 'displayIssuers',
    });
    const {toJSON} = render(<IssuersScreen {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render error state with generic error', () => {
    mockIssuerController.__setMockOverrides({
      isError: true,
      errorMessageType: 'GENERIC',
    });
    const {toJSON} = render(<IssuersScreen {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render error state with backend error', () => {
    mockIssuerController.__setMockOverrides({
      isError: true,
      errorMessageType: 'TECHNICAL_DIFFICULTIES',
    });
    const {toJSON} = render(<IssuersScreen {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render biometrics cancelled state', () => {
    mockIssuerController.__setMockOverrides({
      isBiometricsCancelled: true,
    });
    const {toJSON} = render(<IssuersScreen {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render verification failed state', () => {
    mockIssuerController.__setMockOverrides({
      verificationErrorMessage: 'ERR_GENERIC',
    });
    const {toJSON} = render(<IssuersScreen {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render consent requested state', () => {
    mockIssuerController.__setMockOverrides({
      isConsentRequested: true,
      issuerName: 'Test Issuer',
    });
    const {toJSON} = render(<IssuersScreen {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render transaction code requested state', () => {
    mockIssuerController.__setMockOverrides({
      isTxCodeRequested: true,
      txCodeDisplayDetails: {
        inputMode: 'numeric',
        length: 4,
        description: 'Enter code',
      },
    });
    const {toJSON} = render(<IssuersScreen {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render presentation authorization in progress', () => {
    mockIssuerController.__setMockOverrides({
      authorizationType: 'presentation',
      isPresentationAuthorizationInProgress: true,
    });
    const {toJSON} = render(<IssuersScreen {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
