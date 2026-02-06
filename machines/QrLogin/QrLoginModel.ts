import {createModel} from 'xstate/lib/model';
import {AppServices} from '../../shared/GlobalContext';
import {VCShareFlowType} from '../../shared/Utils';
import {VCMetadata} from '../../shared/VCMetadata';
import {
  VC,
  linkTransactionResponse,
} from '../VerifiableCredential/VCMetaMachine/vc';

const QrLoginEvents = {
  SELECT_VC: (vc: VC) => ({vc}),
  SCANNING_DONE: (params: string) => ({params}),
  STORE_RESPONSE: (response: unknown) => ({response}),
  STORE_ERROR: (error: Error) => ({error}),
  TOGGLE_CONSENT_CLAIM: (enable: boolean, claim: string) => ({
    enable,
    claim,
  }),
  DISMISS: () => ({}),
  CONFIRM: () => ({}),
  GET: (
    linkCode: string,
    flowType: string,
    selectedVc: VC,
    faceAuthConsentGiven: boolean,
  ) => ({
    linkCode,
    flowType,
    selectedVc,
    faceAuthConsentGiven,
  }),
  VERIFY: () => ({}),
  CANCEL: () => ({}),
  FACE_VALID: () => ({}),
  FACE_INVALID: () => ({}),
  RETRY_VERIFICATION: () => ({}),
  FACE_VERIFICATION_CONSENT: (isDoNotAskAgainChecked: boolean) => ({
    isDoNotAskAgainChecked,
  }),
};

export const QrLoginmodel = createModel(
  {
    serviceRefs: {} as AppServices,
    selectedVc: {} as VC,
    linkCode: '',
    flowType: VCShareFlowType.SIMPLE_SHARE,
    myVcs: [] as VCMetadata[],
    thumbprint: '',
    linkTransactionResponse: {} as linkTransactionResponse,
    authFactors: [],
    authorizeScopes: null,
    clientName: {},
    configs: {},
    essentialClaims: [],
    linkTransactionId: '',
    logoUrl: '',
    voluntaryClaims: [],
    selectedVoluntaryClaims: [],
    errorMessage: '',
    domainName: '',
    consentClaims: ['name', 'picture'],
    isSharing: {},
    linkedTransactionId: '',
    showFaceAuthConsent: true as boolean,
    isQrLoginViaDeepLink: false,
  },
  {
    events: QrLoginEvents,
  },
);
