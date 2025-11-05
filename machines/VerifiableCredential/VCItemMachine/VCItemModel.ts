import {createModel} from 'xstate/lib/model';
import {AppServices} from '../../../shared/GlobalContext';
import {VCMetadata} from '../../../shared/VCMetadata';
import {
  Credential,
  DecodedCredential,
  VC,
  WalletBindingResponse,
} from '../VCMetaMachine/vc';
import {CommunicationDetails} from '../../../shared/Utils';
import {vcVerificationBannerDetails} from '../../../components/BannerNotificationContainer';

const VCItemEvents = {
  DISMISS: () => ({}),
  CREDENTIAL_DOWNLOADED: (response: VC) => ({response}),
  STORE_RESPONSE: (response: VC) => ({response}),
  STORE_ERROR: (error: Error) => ({error}),
  POLL: () => ({}),
  DOWNLOAD_READY: () => ({}),
  FAILED: () => ({}),
  GET_VC_RESPONSE: (response: VC) => ({response}),
  INPUT_OTP: (OTP: string) => ({OTP}),
  RESEND_OTP: () => ({}),
  REFRESH: () => ({}),
  ADD_WALLET_BINDING_ID: () => ({}),
  CANCEL: () => ({}),
  CONFIRM: () => ({}),
  PIN_CARD: () => ({}),
  KEBAB_POPUP: () => ({}),
  SHOW_ACTIVITY: () => ({}),
  REVERIFY_VC: () => ({}),
  CLOSE_VC_MODAL: () => ({}),
  REMOVE: (vcMetadata: VCMetadata) => ({vcMetadata}),
  UPDATE_VC_METADATA: (vcMetadata: VCMetadata) => ({vcMetadata}),
  TAMPERED_VC: (key: string) => ({key}),
  SHOW_BINDING_STATUS: () => ({}),
  VERIFY: () => ({}),
  SET_VERIFICATION_STATUS: (response: unknown) => ({response}),
  RESET_VERIFICATION_STATUS: () => ({}),
  REMOVE_VERIFICATION_STATUS_BANNER: () => ({}),
  SHOW_VERIFICATION_STATUS_BANNER: (response: unknown) => ({response}),
  CLOSE_BANNER: () => ({}),
};

export const VCItemModel = createModel(
  {
    serviceRefs: {} as AppServices,
    vcMetadata: {} as VCMetadata,
    generatedOn: new Date() as Date,
    credential: null as unknown as DecodedCredential,
    verifiableCredential: null as unknown as Credential,
    hashedId: '',
    publicKey: '',
    privateKey: '',
    OTP: '',
    error: '',
    bindingTransactionId: '',
    requestId: '',
    downloadCounter: 0,
    maxDownloadCount: null as unknown as number,
    downloadInterval: null as unknown as number,
    walletBindingResponse: null as unknown as WalletBindingResponse,
    isMachineInKebabPopupState: false,
    communicationDetails: null as unknown as CommunicationDetails,
    verificationStatus: null as vcVerificationBannerDetails | null,
    showVerificationStatusBanner: false as boolean,
    wellknownResponse: {} as Object,
    showReverificationSuccessBanner: false as boolean,
    showVerificationFailureBanner: false as boolean,
    statusChangedDuringVerification: false,
  },
  {
    events: VCItemEvents,
  },
);
