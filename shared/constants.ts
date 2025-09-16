import {Dimensions, Platform} from 'react-native';
import {
  DEBUG_MODE,
  ESIGNET_HOST,
  MIMOTO_HOST,
  LIVENESS_DETECTION,
} from 'react-native-dotenv';
import {Argon2iConfig} from './commonUtil';
import {VcIdType} from '../machines/VerifiableCredential/VCMetaMachine/vc';
import {KeyTypes} from './cryptoutil/KeyTypes';

export let MIMOTO_BASE_URL = MIMOTO_HOST;
export let ESIGNET_BASE_URL = ESIGNET_HOST;
export let DEBUG_MODE_ENABLED = DEBUG_MODE === 'true';
export let CACHE_TTL = 60 * 60 * 1000;

export const LIVENESS_CHECK = LIVENESS_DETECTION === 'true';
export const LIVENESS_THRESHOLD = 0.4;

export const changeCrendetialRegistry = (host: string) =>
  (MIMOTO_BASE_URL = host);
export const changeEsignetUrl = (host: string) => (ESIGNET_BASE_URL = host);

export const updateCacheTTL = (ttl: number) => {
  console.info(`Updated CACHE_TTL as per config: ${ttl} ms`);
  CACHE_TTL = ttl;
};

export const COMMON_PROPS_KEY: string =
  'CommonPropsKey-' + '6964d04a-9268-11ed-a1eb-0242ac120002';

export const MY_VCS_STORE_KEY = 'myVCs';

export const RECEIVED_VCS_STORE_KEY = 'receivedVCs';

export const MY_LOGIN_STORE_KEY = 'myLogins';

export const BACKUP_ENC_KEY = 'backupEncKey';

export const BACKUP_ENC_KEY_TYPE = 'backupEncKeyType';

export const BACKUP_ENC_TYPE_VAL_PASSWORD = 'password';

export const BACKUP_ENC_TYPE_VAL_PHONE = 'phone';
export const UPLOAD_MAX_RETRY = 2;

export let individualId = {id: '', idType: 'UIN' as VcIdType};

export const GET_INDIVIDUAL_ID = (currentIndividualId: IndividualId) => {
  individualId = currentIndividualId;
};

export const ACTIVITY_LOG_STORE_KEY = 'activityLog';

export const SETTINGS_STORE_KEY = 'settings';

export const APP_ID_LENGTH = 12;

export const SHOW_FACE_AUTH_CONSENT_SHARE_FLOW = 'showFaceAuthConsentShareFlow';

export const SHOW_FACE_AUTH_CONSENT_QR_LOGIN_FLOW =
  'showFaceAuthConsentQrLoginFlow';

// Numbers and Upper case Alphabets without confusing characters like 0, 1, 2, I, O, Z
// prettier-ignore
export const APP_ID_DICTIONARY = [
    '3', '4', '5', '6', '7', '8', '9',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L',
    'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y',
];

export const API_CACHED_STORAGE_KEYS = {
  fetchIssuers: 'CACHE_FETCH_ISSUERS',
  fetchIssuerWellknownConfig: (issuerId: string) =>
    `CACHE_FETCH_ISSUER_WELLKNOWN_CONFIG_${issuerId}`,
  fetchIssuerAuthorizationServerMetadata: (authorizationServerUrl: string) =>
    `CACHE_FETCH_ISSUER_AUTHORIZATION_SERVER_METADATA_${authorizationServerUrl}`,
  fetchTrustedVerifiers: 'CACHE_FETCH_TRUSTED_VERIFIERS',
};

export function isIOS(): boolean {
  return Platform.OS === 'ios';
}
export const SUPPORTED_KEY_TYPES = {
  ED25519: KeyTypes.ED25519,
  'ECC K1': KeyTypes.ES256K,
  'ECC R1': KeyTypes.ES256,
  RSA: KeyTypes.RS256,
};
export const KEY_TYPE_TO_JWT_ALG = {
  [KeyTypes.ED25519]: 'EdDSA',
  [KeyTypes.ES256K]: 'ES256K',
  [KeyTypes.ES256]: 'ES256',
  [KeyTypes.RS256]: 'RS256',
};

export const ED25519_PROOF_SIGNING_ALGO = 'Ed25519';

export const JWT_ALG_TO_KEY_TYPE = {
  EdDSA: KeyTypes.ED25519,
  Ed25519: KeyTypes.ED25519,
  ES256K: KeyTypes.ES256K,
  ES256: KeyTypes.ES256,
  RS256: KeyTypes.RS256,
};

export function isAndroid(): boolean {
  return Platform.OS === 'android';
}

export const ENOENT = 'No such file or directory';

export const androidVersion: number = Number(Platform.Version);

// Configuration for argon2i hashing algorithm
export const argon2iConfig: Argon2iConfig = {
  iterations: 5,
  memory: 16 * 1024,
  parallelism: 2,
  hashLength: 20,
  mode: 'argon2i',
};

export const argon2iConfigForUinVid: Argon2iConfig = {
  iterations: 5,
  memory: 16 * 1024,
  parallelism: 2,
  hashLength: 5,
  mode: 'argon2i',
};

export const argon2iConfigForBackupFileName: Argon2iConfig = {
  iterations: 5,
  memory: 16 * 1024,
  parallelism: 2,
  hashLength: 8,
  mode: 'argon2id',
};
export const argon2iConfigForPasswordAndPhoneNumber: Argon2iConfig = {
  // TODO: expected iterations for hashing password and phone Number is 600000
  iterations: 500,
  memory: 16 * 1024,
  parallelism: 2,
  hashLength: 30,
  mode: 'argon2id',
};

export const argon2iSalt =
  '1234567891011121314151617181920212223242526272829303132333435363';

export type IndividualId = {
  id: string;
  idType: VcIdType;
};

export const TECHNICAL_ERROR = 'Technical error';
export const NETWORK_REQUEST_FAILED = 'Network request failed';
export const NO_INTERNET = 'No internet connection';
export const IOS_SIGNIN_FAILED = 'iCloud not available';
export const REQUEST_TIMEOUT = 'request timeout';
export const BIOMETRIC_CANCELLED = 'User has cancelled biometric';
export const GOOGLE_DRIVE_NAME = 'Google Drive';
export const GMAIL = 'gmail';
export const APPLE = 'Apple';
export const ICLOUD_DRIVE_NAME = 'iCloud';
export const DEFAULT_ECL = 'L';
export const DEFAULT_QR_HEADER = 'INJIQUICKSHARE://';
export const MAX_QR_DATA_LENGTH = 4296;

export const INTRO_SLIDER_LOGO_MARGIN = Dimensions.get('screen').width * 0.45;

export const COPILOT_PRE_FINAL_STEP: number = 5;
export const COPILOT_FINAL_STEP: number = 6;
export const COPILOT_HEIGHT: number = 0.22;
export const KEY_MANAGEMENT_STEP = 7;
export const copilotTestID = {
  '1': 'help',
  '2': 'download',
  '3': 'scan',
  '4': 'history',
  '5': 'settings',
  '6': 'cardView',
};

export const FACE_SDK_MODEL_PATH = isAndroid()
  ? 'assets:faceModel.tflite'
  : 'bundle:/faceModel.tflite';
export const FACE_SDK_MODEL_CHECKSUM =
  '797b4d99794965749635352d55da38d4748c28c659ee1502338badee4614ed06';

export const EXPIRED_VC_ERROR_CODE = 'ERR_VC_EXPIRED';

export const BASE_36 = 36;

export const OVP_ERROR_MESSAGES = {
  NO_MATCHING_VCS: 'No matching credentials found to fulfill the request.',
  DECLINED: 'The user has declined to share their credentials at this time.',
};

export const OVP_ERROR_CODE = {
  NO_MATCHING_VCS: 'invalid_transaction_data',
  DECLINED: 'access_denied',
};

export const QR_IMAGE_ID = 'qrCodeImage';
