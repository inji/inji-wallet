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
  ACCEPT_REQUEST: (
    selectedVCs: Record<string, VC[]>,
    selectedDisclosuresByVc: any,
  ) => ({
    selectedVCs,
    selectedDisclosuresByVc,
  }),
  VERIFIER_TRUST_CONSENT_GIVEN: () => ({}),
  VERIFY_AND_ACCEPT_REQUEST: (
    selectedVCs: Record<string, VC[]>,
    selectedDisclosuresByVc,
  ) => ({
    selectedVCs,
    selectedDisclosuresByVc,
  }),
  CONFIRM: () => ({}),
  CHECK_FOR_CONSENT: () => ({}),
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
  AUTHENTICATE_VIA_PRESENTATION: (
    presentationRequest: string,
    flowType: string,
    selectedVC: any,
    isOVPViaDeepLink: boolean,
  ) => ({presentationRequest, flowType, selectedVC, isOVPViaDeepLink}),
  SIGN_VP: (data: any) => ({data}),
};

export const openID4VPModel = createModel(
  {
    serviceRefs: {} as AppServices,
    urlEncodedAuthorizationRequest: '' as string,
    presentationRequest: {} as object,
    authenticationResponse: {},
    vcsMatchingAuthRequest: {} as Record<string, VC[]>,
    checkedAll: false as boolean,
    selectedVCs: {} as Record<string, VC[]>,
    selectedDisclosuresByVc: {} as Record<string, string[]>,
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
    showTrustConsentModal: false as boolean,
    unsignedVPToken: {} as object,
    hasNoMatchingVCs: false as boolean,
  },
  {events: openID4VPEvents},
);

interface VerifierType {
  client_id: string;
  redirect_uri: string;
  response_uri: string;
  client_metadata?: object;
}
