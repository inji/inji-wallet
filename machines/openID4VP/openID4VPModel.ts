import {createModel} from 'xstate/lib/model';
import {AppServices} from '../../shared/GlobalContext';
import {VC} from '../VerifiableCredential/VCMetaMachine/vc';
import {KeyTypes} from '../../shared/cryptoutil/KeyTypes';
import {VPActivityLogType} from '../../components/VPShareActivityLogEvent';

const openID4VPEvents = {
  AUTHENTICATE: (
    encodedAuthRequest: string,
    flowType: string,
    selectedVC: any,
    isOVPViaDeepLink: boolean,
  ) => ({encodedAuthRequest, flowType, selectedVC, isOVPViaDeepLink}),
  DOWNLOADED_VCS: (vcs: VC[]) => ({vcs}),
  SELECT_VC: (vcKey: string, inputDescriptorId: any) => ({
    vcKey,
    inputDescriptorId,
  }),
  ACCEPT_REQUEST: (selectedVCs: Record<string, VC[]>) => ({
    selectedVCs,
  }),
  VERIFY_AND_ACCEPT_REQUEST: (selectedVCs: Record<string, VC[]>) => ({
    selectedVCs,
  }),
  CONFIRM: () => ({}),
  CANCEL: () => ({}),
  FACE_VERIFICATION_CONSENT: (isDoNotAskAgainChecked: boolean) => ({
    isDoNotAskAgainChecked,
  }),
  FACE_VALID: () => ({}),
  FACE_INVALID: () => ({}),
  DISMISS: () => ({}),
  DISMISS_POPUP: () => ({}),
  RETRY_VERIFICATION: () => ({}),
  STORE_RESPONSE: (response: any) => ({response}),
  GO_BACK: () => ({}),
  CHECK_SELECTED_VC: () => ({}),
  SET_SELECTED_VC: () => ({}),
  CHECK_FOR_IMAGE: () => ({}),
  RETRY: () => ({}),
  RESET_RETRY_COUNT: () => ({}),
  RESET_ERROR: () => ({}),
  CLOSE_BANNER: () => ({}),
  LOG_ACTIVITY: (logType: VPActivityLogType) => ({logType}),
};

export const openID4VPModel = createModel(
  {
    serviceRefs: {} as AppServices,
    urlEncodedAuthorizationRequest: '' as string,
    authenticationResponse: {},
    vcsMatchingAuthRequest: {} as Record<string, VC[]>,
    checkedAll: false as boolean,
    selectedVCs: {} as Record<string, VC[]>,
    isShareWithSelfie: false as boolean,
    showFaceAuthConsent: true as boolean,
    purpose: '' as string,
    error: '' as string,
    publicKey: '',
    privateKey: '',
    keyType: KeyTypes.ED25519,
    flowType: '' as string,
    miniViewSelectedVC: {} as VC,
    openID4VPRetryCount: 0,
    trustedVerifiers: [] as VerifierType[],
    showFaceCaptureSuccessBanner: false,
    isFaceVerificationRetryAttempt: false as boolean,
    requestedClaims: '' as string,
    showLoadingScreen: false as boolean,
    isOVPViaDeepLink: false,
  },
  {events: openID4VPEvents},
);

interface VerifierType {
  client_id: string;
  redirect_uri: string;
  response_uri: string;
  client_metadata?: object;
}
