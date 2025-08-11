import {StateFrom} from 'xstate';
import {VCMetadata} from '../../../shared/VCMetadata';
import {VCItemMachine} from './VCItemMachine';
import {
  getFaceField,
  getMosipLogo,
} from '../../../components/VC/common/VCUtils';
import {
  Credential,
  VerifiableCredential,
  VerifiableCredentialData,
} from '../VCMetaMachine/vc';
import {VCFormat} from '../../../shared/VCFormat';

type State = StateFrom<typeof VCItemMachine>;

export function selectVerificationStatus(state: State) {
  return state.context.verificationStatus;
}

export function selectIsVerificationInProgress(state: State) {
  return state.matches('verifyState.verifyingCredential');
}

export function selectIsVerificationCompleted(state: State) {
  return state.matches('verifyState.verificationCompleted');
}

export function selectShowVerificationStatusBanner(state: State) {
  return state.context.showVerificationStatusBanner;
}

export function selectVerifiableCredential(state: State) {
  return state.context.verifiableCredential;
}

export function getVerifiableCredential(
  verifiableCredential: VerifiableCredential | Credential,
): Credential {
  return verifiableCredential?.credential || verifiableCredential;
}

export function selectCredential(state: State): VerifiableCredential {
  return state.context.verifiableCredential;
}

export function selectVerifiableCredentialData(
  state: State,
): VerifiableCredentialData {
  const vcMetadata = new VCMetadata(state.context.vcMetadata);
  const verifiableCredential = state.context.verifiableCredential;
  let credentialSubject = {};
  if (state.context?.format === VCFormat.ldp_vc) {
    credentialSubject =
      verifiableCredential?.credential?.credentialSubject ?? {};
  } else if (state.context?.format === VCFormat.mso_mdoc) {
    const nameSpaces =
      verifiableCredential?.processedCredential?.issuerSigned?.nameSpaces ??
      verifiableCredential?.processedCredential?.nameSpaces ??
      {};
    credentialSubject = Object.values(nameSpaces)
      .flat()
      .reduce((acc, item) => {
        const key = item.elementIdentifier;
        const value = item.elementValue;
        acc[key] = value;
        return acc;
      }, {} as Record<string, any>);
  } else if (state.context?.format === VCFormat.vc_sd_jwt || state.context?.format === VCFormat.dc_sd_jwt) {
    credentialSubject =
      verifiableCredential?.processedCredential?.fullResolvedPayload ?? {};
  }
  const faceField =
    getFaceField(credentialSubject) ??
    state.context.credential?.biometrics?.face;

  return {
    vcMetadata: vcMetadata,
    format: vcMetadata.format,
    face: faceField,
    issuerLogo:
      state.context.verifiableCredential?.issuerLogo ?? getMosipLogo(),
    wellKnown: state.context.verifiableCredential?.wellKnown,
    credentialConfigurationId:
      state.context.verifiableCredential?.credentialConfigurationId,
    issuer: vcMetadata.issuer,
  };
}

export function selectKebabPopUp(state: State) {
  return state.context.isMachineInKebabPopupState;
}

export function selectContext(state: State) {
  return state.context;
}

export function selectGeneratedOn(state: State) {
  return state.context.generatedOn;
}

export function selectWalletBindingSuccess(state: State) {
  return state.context.walletBindingResponse;
}

export function selectWalletBindingResponse(state: State) {
  return state.context.walletBindingResponse;
}

export function selectIsCommunicationDetails(state: State) {
  return state.context.communicationDetails;
}

export function selectWalletBindingError(state: State) {
  return state.context.error;
}

export function selectBindingAuthFailedError(state: State) {
  return state.context.error;
}

export function selectAcceptingBindingOtp(state: State) {
  return state.matches('vcUtilitiesState.walletBinding.acceptingBindingOTP');
}

export function selectWalletBindingInProgress(state: State) {
  return (
    state.matches('vcUtilitiesState.walletBinding.requestingBindingOTP') ||
    state.matches('vcUtilitiesState.walletBinding.addingWalletBindingId') ||
    state.matches('vcUtilitiesState.walletBinding.addKeyPair') ||
    state.matches('vcUtilitiesState.walletBinding.updatingPrivateKey')
  );
}

export function selectBindingWarning(state: State) {
  return state.matches('vcUtilitiesState.walletBinding.showBindingWarning');
}

export function selectRemoveWalletWarning(state: State) {
  return state.matches('vcUtilitiesState.kebabPopUp.removeWallet');
}

export function selectIsPinned(state: State) {
  return state.context.vcMetadata.isPinned;
}

export function selectOtpError(state: State) {
  return state.context.error;
}

export function selectShowActivities(state: State) {
  return state.matches('vcUtilitiesState.kebabPopUp.showActivities');
}

export function selectShowWalletBindingError(state: State) {
  return state.matches(
    'vcUtilitiesState.walletBinding.showingWalletBindingError',
  );
}

export function selectVc(state: State) {
  const {serviceRefs, ...data} = state.context;
  return data;
}
