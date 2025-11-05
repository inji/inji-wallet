import {StateFrom} from 'xstate';
import {VCMetadata} from '../../../shared/VCMetadata';
import {vcMetaMachine} from './VCMetaMachine';
import {VC} from './vc';

type State = StateFrom<typeof vcMetaMachine>;

export function selectVerificationStatus(state: State) {
  return state.context.verificationStatus;
}

export function selectMyVcsMetadata(state: State): VCMetadata[] {
  return state.context.myVcsMetadata;
}

export function selectShareableVcsMetadata(state: State): VCMetadata[] {
  return state.context.myVcsMetadata.filter(
    vcMetadata =>
      state.context.myVcs[vcMetadata.getVcKey()]?.verifiableCredential != null,
  );
}

export function selectShareableVcs(state: State): VC[] {
  return Object.values(state.context.myVcs).filter(
    vc => vc?.verifiableCredential != null,
  );
}

export function selectReceivedVcsMetadata(state: State): VCMetadata[] {
  return state.context.receivedVcsMetadata;
}

export function selectIsRefreshingMyVcs(state: State) {
  return state.matches('ready.myVcs');
}

export function selectIsRefreshingReceivedVcs(state: State) {
  return state.matches('ready.receivedVcs');
}

export function selectAreAllVcsDownloaded(state: State) {
  return state.context.areAllVcsDownloaded;
}

/*
  this methods returns all the binded vc's in the wallet.
 */
export function selectBindedVcsMetadata(state: State): VCMetadata[] {
  return state.context.myVcsMetadata.filter(vcMetadata => {
    const walletBindingResponse =
      state.context.myVcs[vcMetadata.getVcKey()]?.walletBindingResponse;
    return (
      !isEmpty(walletBindingResponse) &&
      !isEmpty(walletBindingResponse?.walletBindingId)
    );
  });
}

export function selectInProgressVcDownloads(state: State) {
  return state.context.inProgressVcDownloads;
}

function isEmpty(object) {
  return object == null || object == '' || object == undefined;
}

export function selectWalletBindingSuccess(state: State) {
  return state.context.walletBindingSuccess;
}

export function selectIsTampered(state: State) {
  return state.matches('ready.tamperedVCs');
}

export function selectDownloadingFailedVcs(state: State) {
  return state.context.downloadingFailedVcs;
}

export function selectMyVcs(state: State) {
  return state.context.myVcs;
}

export function selectVerificationErrorMessage(state: State) {
  return state.context.verificationErrorMessage;
}

export function selectIsDownloadingFailed(state: State) {
  return state.context.DownloadingCredentialsFailed;
}

export function selectIsDownloadingSuccess(state: State) {
  return state.context.DownloadingCredentialsSuccess;
}

export function selectIsReverificationSuccess(state: State) {
  return state.context.reverificationSuccess;
}

export function selectIsReverificationFailure(state: State) {
  return state.context.reverificationFailed;
}
