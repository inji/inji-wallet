import {StateFrom} from 'xstate';
import {openID4VPMachine} from './openID4VPMachine';
import {VCMetadata} from '../../shared/VCMetadata';
import {getMosipLogo} from '../../components/VC/common/VCUtils';
import {
  Credential,
  VerifiableCredentialData,
} from '../VerifiableCredential/VCMetaMachine/vc';
import {VCShareFlowType} from '../../shared/Utils';

type State = StateFrom<typeof openID4VPMachine>;

export function selectIsGetVCsSatisfyingAuthRequest(state: State) {
  return state.matches('getVCsSatisfyingAuthRequest');
}

export function selectVCsMatchingAuthRequest(state: State) {
  return state.context.vcsMatchingAuthRequest;
}

export function selectSelectedVCs(state: State) {
  return state.context.selectedVCs;
}

export function selectAreAllVCsChecked(state: State) {
  return state.context.checkedAll;
}

export function selectIsGetVPSharingConsent(state: State) {
  return (
    state.matches('getConsentForVPSharing') &&
    state.context.flowType !== VCShareFlowType.OPENID4VP_AUTHORIZATION
  );
}

export function selectIsFaceVerificationConsent(state: State) {
  return state.matches('faceVerificationConsent');
}

export function selectIsVerifyingIdentity(state: State) {
  return state.matches('verifyingIdentity');
}

export function selectIsInvalidIdentity(state: State) {
  return state.matches('invalidIdentity');
}

export function selectIsSharingVP(state: State) {
  return state.matches('sendingVP');
}

export function selectIsShowLoadingScreen(state: State) {
  return state.context.showLoadingScreen;
}

export function selectCredentials(state: State) {
  const processCredential = (vcData: any) =>
    vcData?.verifiableCredential?.credential || vcData?.verifiableCredential;
  let selectedCredentials: Credential[] = Object.values(
    state.context.selectedVCs,
  )
    .flatMap(innerMap => Object.values(innerMap)) // Extract arrays
    .flat()
    .map(processCredential);
  return selectCredentials.length === 0 ? undefined : selectedCredentials;
}

export function selectVerifiableCredentialsData(state: State) {
  let verifiableCredentialsData: VerifiableCredentialData[] = [];
  let selectedCredentials: Credential[] = Object.values(
    state.context.selectedVCs,
  )
    .flatMap(innerMap => Object.values(innerMap))
    .flat();
  selectedCredentials.map(vcData => {
    const vcMetadata = new VCMetadata(vcData.vcMetadata);
    verifiableCredentialsData.push({
      vcMetadata: vcMetadata,
      issuer: vcMetadata.issuer,
      issuerLogo: vcData?.verifiableCredential?.issuerLogo || getMosipLogo(),
      face:
        vcData?.verifiableCredential?.credential?.credentialSubject?.face ||
        vcData?.credential?.biometrics?.face,
      wellKnown: vcData?.verifiableCredential?.wellKnown,
      credentialTypes: vcData?.verifiableCredential?.credentialTypes,
    });
    return verifiableCredentialsData;
  });

  return verifiableCredentialsData;
}

export function selectPurpose(state: State) {
  return state.context.purpose;
}

export function selectShowConfirmationPopup(state: State) {
  return state.matches('showConfirmationPopup');
}

export function selectIsSelectingVcs(state: State) {
  return state.matches('selectingVCs');
}

export function selectIsError(state: State) {
  return state.context.error;
}

export function selectOpenID4VPRetryCount(state: State) {
  return state.context.openID4VPRetryCount;
}

export function selectIsOVPViaDeeplink(state: State) {
  return state.context.isOVPViaDeepLink;
}

export function selectIsFaceVerifiedInVPSharing(state: State) {
  return (
    state.matches('sendingVP') && state.context.showFaceCaptureSuccessBanner
  );
}

export function selectVerifierNameInVPSharing(state: State) {
  return (
    state.context.authenticationResponse['client_metadata']?.['client_name'] ??
    state.context.authenticationResponse['client_id']
  );
}

export function selectRequestedClaimsByVerifier(state: State) {
  return state.context.requestedClaims;
}

export function selectshowTrustConsentModal(state: State) {
  return state.context.showTrustConsentModal;
}

export function selectVerifierNameInTrustModal(state: State) {
  return state.context.authenticationResponse['client_metadata']?.[
    'client_name'
  ];
}

export function selectVerifierLogoInTrustModal(state: State) {
  return state.context.authenticationResponse['client_metadata']?.['logo_uri'];
}

export function selectIsAuthorization(state: State) {
  return state.context.flowType === VCShareFlowType.OPENID4VP_AUTHORIZATION;
}
