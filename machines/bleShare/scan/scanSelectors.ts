import {StateFrom} from 'xstate';
import {scanMachine} from './scanMachine';
import {VCMetadata} from '../../../shared/VCMetadata';
import {getMosipLogo, getFaceAttribute} from '../../../components/VC/common/VCUtils';

type State = StateFrom<typeof scanMachine>;

export function selectFlowType(state: State) {
  return state.context.flowType;
}

export function selectOpenID4VPFlowType(state: State) {
  return state.context.openID4VPFlowType;
}

export function selectReceiverInfo(state: State) {
  return state.context.receiverInfo;
}

export function selectVcName(state: State) {
  return state.context.vcName;
}

export function selectCredential(state: State) {
  const credential =
    state.context.selectedVc?.verifiableCredential?.credential ||
    state.context.selectedVc?.verifiableCredential;
  return credential ? [credential] : credential;
}

export function selectVerifiableCredentialData(state: State) {
  const vcMetadata = new VCMetadata(state.context.selectedVc?.vcMetadata);
  const faceField =
    getFaceAttribute(state.context.selectedVc,state.context.selectedVc?.format) ??
      state.context.selectedVc?.credential?.biometrics?.face;
  return [
    {
      vcMetadata: vcMetadata,
      issuer: vcMetadata.issuer,
      issuerLogo:
        state.context.selectedVc?.verifiableCredential?.issuerLogo ||
        getMosipLogo(),
      face:faceField,
      wellKnown: state.context.selectedVc?.verifiableCredential?.wellKnown,
    },
  ];
}

export function selectQrLoginRef(state: State) {
  return state.context.QrLoginRef;
}

export function selectIsScanning(state: State) {
  return state.matches('findingConnection');
}

export function selectIsQuickShareDone(state: State) {
  return state.matches('loadVCS.navigatingToHome');
}

export function selectShowQuickShareSuccessBanner(state: State) {
  return state.context.showQuickShareSuccessBanner;
}
export function selectIsConnecting(state: State) {
  return state.matches('connecting.inProgress');
}

export function selectIsConnectingTimeout(state: State) {
  return state.matches('connecting.timeout');
}

export function selectIsSelectingVc(state: State) {
  return state.matches('reviewing.selectingVc');
}

export function selectIsSendingVc(state: State) {
  return state.matches('reviewing.sendingVc.inProgress');
}

export function selectIsSendingVP(state: State) {
  return state.matches('startVPSharing.inProgress');
}

export function selectIsSendingVPError(state: State) {
  return state.matches('startVPSharing.showError');
}

export function selectIsSendingVPSuccess(state: State) {
  return state.matches('startVPSharing.success');
}

export function selectIsFaceIdentityVerified(state: State) {
  return (
    state.matches('reviewing.sendingVc.inProgress') &&
    state.context.showFaceCaptureSuccessBanner
  );
}

export function selectIsSendingVcTimeout(state: State) {
  return state.matches('reviewing.sendingVc.timeout');
}

export function selectIsSendingVPTimeout(state: State) {
  return state.matches('startVPSharing.timeout');
}

export function selectIsSent(state: State) {
  return state.matches('reviewing.sendingVc.sent');
}

export function selectIsInvalid(state: State) {
  return state.matches('invalid');
}

export function selectIsLocationDenied(state: State) {
  return state.matches('checkingLocationState.denied');
}

export function selectIsLocationDisabled(state: State) {
  return state.matches('checkingLocationState.disabled');
}

export function selectIsShowQrLogin(state: State) {
  return state.matches('showQrLogin');
}

export function selectIsQrLoginDone(state: State) {
  return state.matches('showQrLogin.navigatingToHistory');
}

export function selectIsQrLoginDoneViaDeeplink(state: State) {
  return state.matches('showQrLogin.navigatingToHome');
}

export function selectIsQrLoginStoring(state: State) {
  return state.matches('showQrLogin.storing');
}

export function selectIsDone(state: State) {
  return state.matches('reviewing.disconnect');
}

export function selectIsMinimumStorageRequiredForAuditEntryLimitReached(
  state: State,
) {
  return state.matches('restrictSharingVc');
}

export function selectIsFaceVerificationConsent(state: State) {
  return state.matches('reviewing.faceVerificationConsent');
}

export function selectIsOVPViaDeepLink(state: State) {
  return state.context.isOVPViaDeepLink;
}
