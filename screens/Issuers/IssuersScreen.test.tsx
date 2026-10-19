/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {Pressable, Text} from 'react-native';
import {fireEvent, render} from '@testing-library/react-native';
import {IssuersScreen} from './IssuersScreen';

// The shared jest setup stubs out useEffect and useState; this screen's scan flow needs them.
const {useEffect, useState} = jest.requireActual('react');
Object.assign(React, {useEffect, useState});

let mockController: Record<string, any>;

jest.mock('expo-localization', () => ({
  getLocales: () => [{languageTag: 'en-US', languageCode: 'en'}],
}));
jest.mock('react-i18next', () => ({
  initReactI18next: {type: '3rdParty', init: jest.fn()},
  useTranslation: () => ({t: (key: string) => key}),
}));
jest.mock('@react-navigation/native', () => {
  const {useEffect} = jest.requireActual('react');
  return {useFocusEffect: (effect: () => () => void) => useEffect(effect, [])};
});
jest.mock('./IssuerScreenController', () => ({
  useIssuerScreenController: () => mockController,
}));
jest.mock('../../shared/openId4VCI/Utils', () => ({
  ErrorMessage: {
    GENERIC: 'generic',
    TECHNICAL_DIFFICULTIES: 'technicalDifficulty',
    CREDENTIAL_TYPE_DOWNLOAD_FAILURE: 'credentialTypeDownloadFailure',
    AUTHORIZATION_GRANT_TYPE_NOT_SUPPORTED:
      'authorizationGrantTypeNotSupported',
    NETWORK_REQUEST_FAILED: 'networkRequestFailed',
  },
}));
jest.mock('../../shared/telemetry/TelemetryUtils', () => ({}));
jest.mock('../../shared/telemetry/TelemetryConstants', () => ({}));
jest.mock('../../components/ui/svg', () => ({
  SvgImage: new Proxy({}, {get: () => () => null}),
}));
jest.mock('../Scan/SendVPScreen', () => ({SendVPScreen: () => null}));
jest.mock('./CredentialTypeSelectionScreen', () => ({
  CredentialTypeSelectionScreen: () => null,
}));
jest.mock('./ReplaceCredentialSelectionScreen', () => ({
  ReplaceCredentialSelectionScreen: () => null,
}));
jest.mock('./TransactionCodeScreen', () => ({
  TransactionCodeModal: () => null,
}));
jest.mock('../../components/MessageOverlay', () => ({
  MessageOverlay: () => null,
}));
jest.mock('../../components/ui/Loader', () => ({
  Loader: (props: any) => <Text testID="loader">{props.title}</Text>,
}));
jest.mock('../../components/ui/processingScreen/ProcessingModal', () => ({
  ProcessingModal: () => null,
  ProgressIndicator: () => null,
}));
jest.mock('../../components/ui/Error', () => ({
  ErrorView: (props: any) => (
    <Pressable testID="errorView" onPress={props.primaryButtonEvent}>
      <Text>{props.title}</Text>
    </Pressable>
  ),
}));
jest.mock('../../components/addCredential/ScanToAddScreen', () => ({
  ScanToAddScreen: (props: any) => (
    <>
      <Text testID="scanToAddScreen">
        {`camera:${props.isCameraActive} processing:${props.isProcessing}`}
      </Text>
      <Pressable
        testID="scanQr"
        onPress={() => props.onQrFound('openid-credential-offer://?x')}
      />
      <Pressable testID="closeScanner" onPress={props.onClose} />
    </>
  ),
}));
jest.mock('../../components/addCredential/TrustIssuerSheet', () => ({
  TrustIssuerSheet: (props: any) =>
    props.isVisible ? (
      <Pressable testID="trustIssuerSheet" onPress={props.onCancel}>
        <Text>{`${props.name} ${props.credentialTypes.join(',')}`}</Text>
      </Pressable>
    ) : null,
}));

const baseController = () => ({
  isError: false,
  errorMessageType: '',
  verificationErrorMessage: '',
  loadingReason: null,
  isPresentationAuthorization: false,
  isSelectingIssuer: false,
  isQrScanning: false,
  isConsentRequested: false,
  isDownloadSuccess: false,
  isAuthEndpointToOpen: false,
  isSelectingCredentialType: false,
  isCredentialAlreadyExists: false,
  isSelectingCredentialsToReplace: false,
  isTxCodeRequested: false,
  isBiometricsCancelled: false,
  issuerName: 'Ministry of Transport',
  issuerLogo: undefined,
  offeredCredentialTypeNames: ['Driving Licence'],
  trustedIssuerConsentStatus: 'idle',
  SCAN_CREDENTIAL_OFFER_QR_CODE: jest.fn(),
  QR_CODE_SCANNED: jest.fn(),
  ON_CONSENT_GIVEN: jest.fn(),
  CANCEL: jest.fn(),
  TRY_AGAIN: jest.fn(),
  RESET_ERROR: jest.fn(),
});

describe('IssuersScreen scan flow', () => {
  const tabs = {setOptions: jest.fn()};
  const navigation = {
    setOptions: jest.fn(),
    getParent: () => tabs,
    goBack: jest.fn(),
    navigate: jest.fn(),
  };
  const renderScreen = () =>
    render(<IssuersScreen navigation={navigation as any} route={{} as any} />);

  beforeEach(() => {
    jest.clearAllMocks();
    mockController = baseController();
  });

  it('starts the scanner as soon as the screen opens', () => {
    mockController.isSelectingIssuer = true;

    const {getByTestId} = renderScreen();

    expect(getByTestId('scanToAddScreen')).toBeTruthy();
    expect(mockController.SCAN_CREDENTIAL_OFFER_QR_CODE).toHaveBeenCalledTimes(
      1,
    );
  });

  it('hides the bottom tab bar while open and brings it back on leaving', () => {
    mockController.isQrScanning = true;

    const {unmount} = renderScreen();
    expect(tabs.setOptions).toHaveBeenLastCalledWith({
      tabBarStyle: {display: 'none'},
    });

    unmount();
    expect(tabs.setOptions).toHaveBeenLastCalledWith({
      tabBarStyle: expect.objectContaining({display: 'flex'}),
    });
  });

  it('passes a scanned QR code to the issuers machine', () => {
    mockController.isQrScanning = true;

    const {getByTestId} = renderScreen();
    expect(getByTestId('scanToAddScreen')).toHaveTextContent(
      'camera:true processing:false',
    );
    fireEvent.press(getByTestId('scanQr'));

    expect(mockController.QR_CODE_SCANNED).toHaveBeenCalledWith(
      'openid-credential-offer://?x',
    );
  });

  it('closes back to Home from the scanner', () => {
    mockController.isQrScanning = true;

    const {getByTestId} = renderScreen();
    fireEvent.press(getByTestId('closeScanner'));

    expect(navigation.goBack).toHaveBeenCalledTimes(1);
  });

  it('shows the trust sheet over the scanner, and cancelling it goes back to scanning', () => {
    mockController.isConsentRequested = true;
    mockController.loadingReason = 'preparingRequest';

    const {getByTestId, getByText} = renderScreen();

    expect(getByTestId('scanToAddScreen')).toHaveTextContent(
      'camera:false processing:false',
    );
    expect(getByText('Ministry of Transport Driving Licence')).toBeTruthy();
    fireEvent.press(getByTestId('trustIssuerSheet'));
    expect(mockController.CANCEL).toHaveBeenCalledTimes(1);
  });

  it('resumes scanning after a QR code that is not a credential offer', () => {
    mockController.isError = true;
    mockController.errorMessageType = 'generic';

    const {getByTestId, queryByTestId, rerender} = renderScreen();
    expect(getByTestId('errorView')).toBeTruthy();
    expect(queryByTestId('scanToAddScreen')).toBeNull();

    fireEvent.press(getByTestId('errorView'));
    expect(mockController.TRY_AGAIN).toHaveBeenCalledTimes(1);

    mockController = {
      ...mockController,
      isError: false,
      errorMessageType: '',
      isSelectingIssuer: true,
    };
    rerender(
      <IssuersScreen navigation={navigation as any} route={{} as any} />,
    );

    expect(getByTestId('scanToAddScreen')).toBeTruthy();
    expect(mockController.SCAN_CREDENTIAL_OFFER_QR_CODE).toHaveBeenCalledTimes(
      1,
    );
  });
});

describe('IssuersScreen opened from an Add to Wallet link', () => {
  const tabs = {setOptions: jest.fn()};
  const navigation = {
    setOptions: jest.fn(),
    getParent: () => tabs,
    goBack: jest.fn(),
    navigate: jest.fn(),
  };
  const route = {params: {isCredentialOfferLink: true}} as any;
  const renderScreen = () =>
    render(<IssuersScreen navigation={navigation as any} route={route} />);

  beforeEach(() => {
    jest.clearAllMocks();
    mockController = baseController();
  });

  it('reads the offer without opening the scanner', () => {
    mockController.loadingReason = 'preparingRequest';

    const {getByTestId, queryByTestId} = renderScreen();

    expect(getByTestId('loader')).toBeTruthy();
    expect(queryByTestId('scanToAddScreen')).toBeNull();
    expect(mockController.SCAN_CREDENTIAL_OFFER_QR_CODE).not.toHaveBeenCalled();
  });

  it('asks to trust a new issuer without opening the scanner', () => {
    mockController.isConsentRequested = true;
    mockController.loadingReason = 'preparingRequest';

    const {getByText, queryByTestId} = renderScreen();

    expect(queryByTestId('scanToAddScreen')).toBeNull();
    expect(getByText('Ministry of Transport Driving Licence')).toBeTruthy();
  });

  it('closes instead of starting the scanner once the offer is declined or fails', () => {
    mockController.isSelectingIssuer = true;

    renderScreen();

    expect(navigation.goBack).toHaveBeenCalledTimes(1);
    expect(mockController.SCAN_CREDENTIAL_OFFER_QR_CODE).not.toHaveBeenCalled();
  });
});
