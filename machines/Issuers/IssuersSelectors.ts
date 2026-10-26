import {ErrorMessage} from '../../shared/openId4VCI/Utils';
import {ActorRefFrom, StateFrom} from 'xstate';
import {IssuersMachine} from './IssuersMachine';
import {openID4VPMachine} from '../openID4VP/openID4VPMachine';

type State = StateFrom<typeof IssuersMachine>;

export function selectIssuers(state: State) {
  return state.context.issuers;
}

export function selectSelectedIssuer(state: State) {
  return state.context.selectedIssuer;
}

export function selectAuthWebViewStatus(state: State) {
  return state.context.authEndpointToOpen;
}

export function selectAuthEndPoint(state: State) {
  return state.context.authEndpoint;
}

export function selectErrorMessageType(state: State) {
  return state.context.errorMessage;
}

export function selectLoadingReason(state: State) {
  return state.context.loadingReason;
}

export function selectIsDownloadCredentials(state: State) {
  return state.matches('downloadCredentials');
}

export function selectIsTxCodeRequested(state: State) {
  return state.context.isTransactionCodeRequested;
}

export function selectIsConsentRequested(state: State) {
  return state.context.isConsentRequested;
}
export function selectIssuerLogo(state: State) {
  return state.context.issuerLogo;
}

export function selectIssuerName(state: State) {
  return state.context.issuerName;
}

export function selectOfferedCredentialTypeNames(state: State) {
  return state.context.offeredCredentialTypeNames;
}

export function selectTxCodeDisplayDetails(state: State) {
  const context = state.context;
  return {
    inputMode: context.txCodeInputMode,
    description: context.txCodeDescription,
    length: context.txCodeLength,
  };
}

export function selectIsBiometricCancelled(state: State) {
  return (
    state.matches('downloadCredentials.userCancelledBiometric') ||
    state.matches('downloadCredentials.keyManagement.userCancelledBiometric') ||
    state.matches(
      'credentialDownloadFromOffer.keyManagement.userCancelledBiometric',
    )
  );
}

export function selectIsNonGenericError(state: State) {
  return (
    state.context.errorMessage !== ErrorMessage.GENERIC &&
    state.context.errorMessage !== ''
  );
}

export function selectIsDone(state: State) {
  return state.matches('done');
}

export function selectIsIdle(state: State) {
  return state.matches('idle');
}

export function selectStoring(state: State) {
  return state.matches('storing');
}

// CANCEL is only handled while the offer is still being worked through; once the issuer has
// sent the card, the remaining steps finish on their own.
export function selectCanCancelDownload(state: State) {
  return (
    state.matches('credentialDownloadFromOffer') ||
    state.matches('downloadCredentials')
  );
}

/** The metadata of the credential being saved; set on entering `storing`. */
export function selectDownloadedVcMetadata(state: State) {
  return state.context.vcMetadata;
}

export function selectIsError(state: State) {
  return state.matches('error');
}

export function selectVerificationErrorMessage(state: State) {
  return state.context.verificationErrorMessage;
}

export function selectIsCredentialAlreadyExists(state: State) {
  return state.matches('credentialAlreadyExists');
}

export function selectIsSelectingCredentialsToReplace(state: State) {
  return state.matches('selectingCredentialsToReplace');
}

export function selectDuplicateVcMetadatas(state: State) {
  return state.context.duplicateVcMetadatas;
}

export function selectSelectedDuplicateVcKeys(state: State) {
  return state.context.selectedDuplicateVcKeys;
}

export function selectSelectingCredentialType(state: State) {
  return state.matches('selectingCredentialType');
}

export function selectSupportedCredentialTypes(state: State) {
  return state.context.supportedCredentialTypes;
}

export function selectIsQrScanning(state: State) {
  return state.matches('waitingForQrScan');
}

export function selectIsSelectingIssuer(state: State) {
  return state.matches('selectingIssuer');
}

export function selectTrustedIssuerConsentStatus(state: State) {
  return state.context.trustedIssuerConsentStatus;
}

export function selectOVPMachine(state: State) {
  return state.context.OpenId4VPRef as ActorRefFrom<typeof openID4VPMachine>;
}

export function selectIsPresentationAuthorization(state: State) {
  return (
    state.matches('credentialDownloadFromOffer.presentationAuthorization') ||
    state.matches('downloadCredentials.presentationAuthorization')
  );
}
export function selectIsPresentationAuthorizationInProgress(state: State) {
  return (
    state.matches(
      'credentialDownloadFromOffer.presentationAuthorization.inProgress',
    ) ||
    state.matches('downloadCredentials.presentationAuthorization.inProgress')
  );
}

export function selectAuthorizationType(state: State) {
  return state.context.authorizationType;
}

export function selectSelectedCredentialType(state: State) {
  return state.context.selectedCredentialType;
}

export function selectIsAuthorizationSuccess(state: State) {
  return state.context.authorizationSuccess;
}
