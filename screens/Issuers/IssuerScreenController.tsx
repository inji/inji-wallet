import {useSelector} from '@xstate/react';
import {
  selectSupportedCredentialTypes,
  selectErrorMessageType,
  selectIsBiometricCancelled,
  selectIsDownloadCredentials,
  selectIsIdle,
  selectIssuers,
  selectIsError,
  selectLoadingReason,
  selectSelectedIssuer,
  selectSelectingCredentialType,
  selectStoring,
  selectVerificationErrorMessage,
  selectIsQrScanning,
  selectAuthWebViewStatus,
  selectAuthEndPoint,
  selectIsTxCodeRequested,
  selectIsConsentRequested,
  selectIssuerLogo,
  selectIssuerName,
  selectTxCodeDisplayDetails,
  selectIsPresentationAuthorization,
  selectOVPMachine,
  selectIsPresentationAuthorizationInProgress,
  selectAuthorizationType,
  selectIsAuthorizationSuccess,
  selectSelectedCredentialType,
  selectTrustedIssuerConsentStatus,
} from '../../machines/Issuers/IssuersSelectors';
import {ActorRefFrom} from 'xstate';
import {BOTTOM_TAB_ROUTES} from '../../routes/routesConstants';
import {logState} from '../../shared/commonUtil';
import {isAndroid} from '../../shared/constants';
import {
  IssuerScreenTabEvents,
  IssuersMachine,
} from '../../machines/Issuers/IssuersMachine';
import {CredentialTypes} from '../../machines/VerifiableCredential/VCMetaMachine/vc';

export function useIssuerScreenController({route, navigation}) {
  const service = route.params.service;
  if (__DEV__) service.subscribe(logState);

  return {
    isPresentationAuthorization: useSelector(
      service,
      selectIsPresentationAuthorization,
    ),
    isPresentationAuthorizationInProgress: useSelector(
      service,
      selectIsPresentationAuthorizationInProgress,
    ),
    authorizationType: useSelector(service, selectAuthorizationType),
    isDownloadSuccess: useSelector(service, selectStoring),
    isAuthorizationSuccess: useSelector(service, selectIsAuthorizationSuccess),
    issuers: useSelector(service, selectIssuers),
    ovpMachine: useSelector(service, selectOVPMachine),
    issuerLogo: useSelector(service, selectIssuerLogo),
    issuerName: useSelector(service, selectIssuerName),
    isTxCodeRequested: useSelector(service, selectIsTxCodeRequested),
    txCodeDisplayDetails: useSelector(service, selectTxCodeDisplayDetails),
    authEndpoint: useSelector(service, selectAuthEndPoint),
    selectedIssuer: useSelector(service, selectSelectedIssuer),
    selectedCredentialType: useSelector(service, selectSelectedCredentialType),
    errorMessageType: useSelector(service, selectErrorMessageType),
    isDownloadingCredentials: useSelector(service, selectIsDownloadCredentials),
    isBiometricsCancelled: useSelector(service, selectIsBiometricCancelled),
    isIdle: useSelector(service, selectIsIdle),
    loadingReason: useSelector(service, selectLoadingReason),
    isQrScanning: useSelector(service, selectIsQrScanning),
    isAuthEndpointToOpen: useSelector(service, selectAuthWebViewStatus),
    isSelectingCredentialType: useSelector(
      service,
      selectSelectingCredentialType,
    ),
    isConsentRequested: useSelector(service, selectIsConsentRequested),
    trustedIssuerConsentStatus: useSelector(
      service,
      selectTrustedIssuerConsentStatus,
    ),
    supportedCredentialTypes: useSelector(
      service,
      selectSupportedCredentialTypes,
    ),
    verificationErrorMessage: useSelector(
      service,
      selectVerificationErrorMessage,
    ),
    isError: useSelector(service, selectIsError),

    CANCEL: () => service.send(IssuerScreenTabEvents.CANCEL()),
    SELECTED_ISSUER: id =>
      service.send(IssuerScreenTabEvents.SELECTED_ISSUER(id)),
    TRY_AGAIN: () => service.send(IssuerScreenTabEvents.TRY_AGAIN()),
    RESET_ERROR: () => service.send(IssuerScreenTabEvents.RESET_ERROR()),
    DOWNLOAD_ID: () => {
      service.send(IssuerScreenTabEvents.DOWNLOAD_ID());
      navigation.navigate(BOTTOM_TAB_ROUTES.home, {screen: 'HomeScreen'});
    },
    SELECTED_CREDENTIAL_TYPE: (credType: CredentialTypes) =>
      service.send(IssuerScreenTabEvents.SELECTED_CREDENTIAL_TYPE(credType)),
    RESET_VERIFY_ERROR: () => {
      service.send(IssuerScreenTabEvents.RESET_VERIFY_ERROR());
      if (isAndroid()) {
        navigation.navigate(BOTTOM_TAB_ROUTES.home, {screen: 'HomeScreen'});
      } else {
        setTimeout(
          () =>
            navigation.navigate(BOTTOM_TAB_ROUTES.home, {screen: 'HomeScreen'}),
          0,
        );
      }
    },
    QR_CODE_SCANNED: (qrData: string) => {
      service.send(IssuerScreenTabEvents.QR_CODE_SCANNED(qrData));
    },
    SCAN_CREDENTIAL_OFFER_QR_CODE: () => {
      service.send(IssuerScreenTabEvents.SCAN_CREDENTIAL_OFFER_QR_CODE());
    },
    TX_CODE_RECEIVED: (txCode: string) => {
      service.send(IssuerScreenTabEvents.TX_CODE_RECEIVED(txCode));
    },
    ON_CONSENT_GIVEN: () => {
      service.send(IssuerScreenTabEvents.ON_CONSENT_GIVEN());
    },
  };
}

export interface IssuerModalProps {
  service?: ActorRefFrom<typeof IssuersMachine>;
  onPress?: () => void;
  isVisible?: boolean;
}
