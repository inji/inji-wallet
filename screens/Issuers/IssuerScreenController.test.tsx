jest.mock('@xstate/react', () => ({
  useSelector: jest.fn(() => undefined),
}));

jest.mock('../../machines/Issuers/IssuersSelectors', () => ({
  selectSupportedCredentialTypes: jest.fn(),
  selectErrorMessageType: jest.fn(),
  selectIsBiometricCancelled: jest.fn(),
  selectIsDownloadCredentials: jest.fn(),
  selectIsIdle: jest.fn(),
  selectIssuers: jest.fn(),
  selectIsError: jest.fn(),
  selectLoadingReason: jest.fn(),
  selectSelectedIssuer: jest.fn(),
  selectSelectingCredentialType: jest.fn(),
  selectStoring: jest.fn(),
  selectVerificationErrorMessage: jest.fn(),
  selectIsQrScanning: jest.fn(),
  selectAuthWebViewStatus: jest.fn(),
  selectAuthEndPoint: jest.fn(),
  selectIsTxCodeRequested: jest.fn(),
  selectIsConsentRequested: jest.fn(),
  selectIssuerLogo: jest.fn(),
  selectIssuerName: jest.fn(),
  selectTxCodeDisplayDetails: jest.fn(),
  selectIsPresentationAuthorization: jest.fn(),
  selectOVPMachine: jest.fn(),
  selectIsPresentationAuthorizationInProgress: jest.fn(),
  selectAuthorizationType: jest.fn(),
  selectIsAuthorizationSuccess: jest.fn(),
  selectSelectedCredentialType: jest.fn(),
  selectTrustedIssuerConsentStatus: jest.fn(),
}));

jest.mock('../../machines/Issuers/IssuersMachine', () => ({
  IssuerScreenTabEvents: {
    CANCEL: jest.fn(() => ({type: 'CANCEL'})),
    SELECTED_ISSUER: jest.fn(id => ({type: 'SELECTED_ISSUER', id})),
    TRY_AGAIN: jest.fn(() => ({type: 'TRY_AGAIN'})),
    RESET_ERROR: jest.fn(() => ({type: 'RESET_ERROR'})),
    DOWNLOAD_ID: jest.fn(() => ({type: 'DOWNLOAD_ID'})),
    SELECTED_CREDENTIAL_TYPE: jest.fn(ct => ({
      type: 'SELECTED_CREDENTIAL_TYPE',
      ct,
    })),
    RESET_VERIFY_ERROR: jest.fn(() => ({type: 'RESET_VERIFY_ERROR'})),
    QR_CODE_SCANNED: jest.fn(qr => ({type: 'QR_CODE_SCANNED', qr})),
    SCAN_CREDENTIAL_OFFER_QR_CODE: jest.fn(() => ({
      type: 'SCAN_CREDENTIAL_OFFER_QR_CODE',
    })),
    TX_CODE_RECEIVED: jest.fn(code => ({type: 'TX_CODE_RECEIVED', code})),
    ON_CONSENT_GIVEN: jest.fn(() => ({type: 'ON_CONSENT_GIVEN'})),
  },
}));

jest.mock('../../routes/routesConstants', () => ({
  BOTTOM_TAB_ROUTES: {home: 'Home'},
}));

jest.mock('../../shared/commonUtil', () => ({
  logState: jest.fn(),
}));

jest.mock('../../shared/constants', () => {
  const actual = jest.requireActual('../../shared/constants');
  return {
    ...actual,
    isIOS: jest.fn(() => false),
    isAndroid: jest.fn(() => true),
  };
});

import {useIssuerScreenController} from './IssuerScreenController';

describe('useIssuerScreenController', () => {
  const mockSend = jest.fn();
  const mockSubscribe = jest.fn();
  const mockGetSnapshot = jest.fn(() => ({
    context: {errorMessage: ''},
  }));
  const mockService = {
    send: mockSend,
    subscribe: mockSubscribe,
    getSnapshot: mockGetSnapshot,
  } as any;
  const mockNavigate = jest.fn();

  const mockRoute = {params: {service: mockService}};
  const mockNavigation = {navigate: mockNavigate};

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSnapshot.mockReturnValue({context: {errorMessage: ''}});
  });

  it('should return expected properties', () => {
    const result = useIssuerScreenController({
      route: mockRoute,
      navigation: mockNavigation,
    });
    expect(result).toHaveProperty('isPresentationAuthorization');
    expect(result).toHaveProperty('isPresentationAuthorizationInProgress');
    expect(result).toHaveProperty('authorizationType');
    expect(result).toHaveProperty('isDownloadSuccess');
    expect(result).toHaveProperty('isAuthorizationSuccess');
    expect(result).toHaveProperty('issuers');
    expect(result).toHaveProperty('ovpMachine');
    expect(result).toHaveProperty('issuerLogo');
    expect(result).toHaveProperty('issuerName');
    expect(result).toHaveProperty('isTxCodeRequested');
    expect(result).toHaveProperty('txCodeDisplayDetails');
    expect(result).toHaveProperty('authEndpoint');
    expect(result).toHaveProperty('selectedIssuer');
    expect(result).toHaveProperty('selectedCredentialType');
    expect(result).toHaveProperty('errorMessageType');
    expect(result).toHaveProperty('isDownloadingCredentials');
    expect(result).toHaveProperty('isBiometricsCancelled');
    expect(result).toHaveProperty('isIdle');
    expect(result).toHaveProperty('loadingReason');
    expect(result).toHaveProperty('isQrScanning');
    expect(result).toHaveProperty('isError');
    expect(result).toHaveProperty('isSelectingCredentialType');
    expect(result).toHaveProperty('isConsentRequested');
    expect(result).toHaveProperty('trustedIssuerConsentStatus');
    expect(result).toHaveProperty('supportedCredentialTypes');
    expect(result).toHaveProperty('verificationErrorMessage');
  });

  it('CANCEL sends event to service', () => {
    const result = useIssuerScreenController({
      route: mockRoute,
      navigation: mockNavigation,
    });
    result.CANCEL();
    expect(mockSend).toHaveBeenCalled();
  });

  it('SELECTED_ISSUER sends event with id', () => {
    const result = useIssuerScreenController({
      route: mockRoute,
      navigation: mockNavigation,
    });
    result.SELECTED_ISSUER('issuer-123');
    expect(mockSend).toHaveBeenCalled();
  });

  it('TRY_AGAIN sends event to service', () => {
    const result = useIssuerScreenController({
      route: mockRoute,
      navigation: mockNavigation,
    });
    result.TRY_AGAIN();
    expect(mockSend).toHaveBeenCalled();
  });

  it('TRY_AGAIN navigates home for go-home errors', () => {
    mockGetSnapshot.mockReturnValue({
      context: {errorMessage: 'invalid_request'},
    });

    const result = useIssuerScreenController({
      route: mockRoute,
      navigation: mockNavigation,
    });

    result.TRY_AGAIN();

    expect(mockSend).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('Home', {screen: 'HomeScreen'});
  });

  it('RESET_ERROR sends event to service', () => {
    const result = useIssuerScreenController({
      route: mockRoute,
      navigation: mockNavigation,
    });
    result.RESET_ERROR();
    expect(mockSend).toHaveBeenCalled();
  });

  it('DOWNLOAD_ID sends event and navigates to home', () => {
    const result = useIssuerScreenController({
      route: mockRoute,
      navigation: mockNavigation,
    });
    result.DOWNLOAD_ID();
    expect(mockSend).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('Home', {screen: 'HomeScreen'});
  });

  it('SELECTED_CREDENTIAL_TYPE sends event', () => {
    const result = useIssuerScreenController({
      route: mockRoute,
      navigation: mockNavigation,
    });
    result.SELECTED_CREDENTIAL_TYPE({type: 'test'} as any);
    expect(mockSend).toHaveBeenCalled();
  });

  it('RESET_VERIFY_ERROR sends event and navigates', () => {
    const result = useIssuerScreenController({
      route: mockRoute,
      navigation: mockNavigation,
    });
    result.RESET_VERIFY_ERROR();
    expect(mockSend).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('Home', {screen: 'HomeScreen'});
  });

  it('QR_CODE_SCANNED sends event with qr data', () => {
    const result = useIssuerScreenController({
      route: mockRoute,
      navigation: mockNavigation,
    });
    result.QR_CODE_SCANNED('qr-data-123');
    expect(mockSend).toHaveBeenCalled();
  });

  it('SCAN_CREDENTIAL_OFFER_QR_CODE sends event', () => {
    const result = useIssuerScreenController({
      route: mockRoute,
      navigation: mockNavigation,
    });
    result.SCAN_CREDENTIAL_OFFER_QR_CODE();
    expect(mockSend).toHaveBeenCalled();
  });

  it('TX_CODE_RECEIVED sends event with code', () => {
    const result = useIssuerScreenController({
      route: mockRoute,
      navigation: mockNavigation,
    });
    result.TX_CODE_RECEIVED('tx-code-456');
    expect(mockSend).toHaveBeenCalled();
  });

  it('ON_CONSENT_GIVEN sends event', () => {
    const result = useIssuerScreenController({
      route: mockRoute,
      navigation: mockNavigation,
    });
    result.ON_CONSENT_GIVEN();
    expect(mockSend).toHaveBeenCalled();
  });
});
