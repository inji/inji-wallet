import {
  changeCrendetialRegistry,
  changeEsignetUrl,
  updateCacheTTL,
  COMMON_PROPS_KEY,
  MY_VCS_STORE_KEY,
  RECEIVED_VCS_STORE_KEY,
  MY_LOGIN_STORE_KEY,
  BACKUP_ENC_KEY,
  BACKUP_ENC_KEY_TYPE,
  BACKUP_ENC_TYPE_VAL_PASSWORD,
  BACKUP_ENC_TYPE_VAL_PHONE,
  UPLOAD_MAX_RETRY,
  ACTIVITY_LOG_STORE_KEY,
  SETTINGS_STORE_KEY,
  APP_ID_LENGTH,
  APP_ID_DICTIONARY,
  API_CACHED_STORAGE_KEYS,
  SUPPORTED_KEY_TYPES,
  KEY_TYPE_TO_JWT_ALG,
  JWT_ALG_TO_KEY_TYPE,
  ED25519_PROOF_SIGNING_ALGO,
  ENOENT,
  argon2iConfig,
  argon2iConfigForUinVid,
  argon2iConfigForBackupFileName,
  argon2iConfigForPasswordAndPhoneNumber,
  argon2iSalt,
  TECHNICAL_ERROR,
  NETWORK_REQUEST_FAILED,
  NO_INTERNET,
  IOS_SIGNIN_FAILED,
  REQUEST_TIMEOUT,
  BIOMETRIC_CANCELLED,
  GOOGLE_DRIVE_NAME,
  GMAIL,
  APPLE,
  ICLOUD_DRIVE_NAME,
  DEFAULT_ECL,
  DEFAULT_QR_HEADER,
  MAX_QR_DATA_LENGTH,
  COPILOT_PRE_FINAL_STEP,
  COPILOT_FINAL_STEP,
  COPILOT_HEIGHT,
  KEY_MANAGEMENT_STEP,
  copilotTestID,
  EXPIRED_VC_ERROR_CODE,
  BASE_36,
  OVP_ERROR_MESSAGES,
  OVP_ERROR_CODE,
  QR_IMAGE_ID,
  AuthorizationType,
  isIOS,
  isAndroid,
  GET_INDIVIDUAL_ID,
  individualId,
  SHOW_FACE_AUTH_CONSENT_SHARE_FLOW,
  SHOW_FACE_AUTH_CONSENT_QR_LOGIN_FLOW,
} from './constants';

jest.mock('react-native', () => ({
  Platform: {OS: 'android', Version: 30},
  Dimensions: {get: () => ({width: 400, height: 800})},
}));

jest.mock('react-native-dotenv', () => ({
  DEBUG_MODE: 'false',
  ESIGNET_HOST: 'https://esignet.test',
  MIMOTO_HOST: 'https://mimoto.test',
  LIVENESS_DETECTION: 'false',
}));

describe('shared/constants', () => {
  describe('URL mutation functions', () => {
    it('changeCrendetialRegistry should update MIMOTO_BASE_URL', () => {
      changeCrendetialRegistry('https://new-host.com');
      const constants = require('./constants');
      expect(constants.MIMOTO_BASE_URL).toBe('https://new-host.com');
    });

    it('changeEsignetUrl should update ESIGNET_BASE_URL', () => {
      changeEsignetUrl('https://new-esignet.com');
      const constants = require('./constants');
      expect(constants.ESIGNET_BASE_URL).toBe('https://new-esignet.com');
    });

    it('updateCacheTTL should update CACHE_TTL', () => {
      updateCacheTTL(5000);
      const constants = require('./constants');
      expect(constants.CACHE_TTL).toBe(5000);
    });
  });

  describe('store keys', () => {
    it('should have correct store key values', () => {
      expect(MY_VCS_STORE_KEY).toBe('myVCs');
      expect(RECEIVED_VCS_STORE_KEY).toBe('receivedVCs');
      expect(MY_LOGIN_STORE_KEY).toBe('myLogins');
      expect(ACTIVITY_LOG_STORE_KEY).toBe('activityLog');
      expect(SETTINGS_STORE_KEY).toBe('settings');
      expect(BACKUP_ENC_KEY).toBe('backupEncKey');
      expect(BACKUP_ENC_KEY_TYPE).toBe('backupEncKeyType');
    });
  });

  describe('backup encryption type values', () => {
    it('should have correct values', () => {
      expect(BACKUP_ENC_TYPE_VAL_PASSWORD).toBe('password');
      expect(BACKUP_ENC_TYPE_VAL_PHONE).toBe('phone');
    });
  });

  describe('platform checks', () => {
    it('isAndroid should return true for android platform', () => {
      expect(isAndroid()).toBe(true);
    });

    it('isIOS should return false for android platform', () => {
      expect(isIOS()).toBe(false);
    });
  });

  describe('COMMON_PROPS_KEY', () => {
    it('should contain UUID', () => {
      expect(COMMON_PROPS_KEY).toContain('CommonPropsKey-');
    });
  });

  describe('APP_ID config', () => {
    it('APP_ID_LENGTH should be 12', () => {
      expect(APP_ID_LENGTH).toBe(12);
    });

    it('APP_ID_DICTIONARY should not contain confusing characters', () => {
      expect(APP_ID_DICTIONARY).not.toContain('0');
      expect(APP_ID_DICTIONARY).not.toContain('1');
      expect(APP_ID_DICTIONARY).not.toContain('2');
      expect(APP_ID_DICTIONARY).not.toContain('I');
      expect(APP_ID_DICTIONARY).not.toContain('O');
      expect(APP_ID_DICTIONARY).not.toContain('Z');
    });
  });

  describe('API_CACHED_STORAGE_KEYS', () => {
    it('fetchIssuers should be a string', () => {
      expect(API_CACHED_STORAGE_KEYS.fetchIssuers).toBe('CACHE_FETCH_ISSUERS');
    });

    it('fetchIssuerWellknownConfig should return key with issuer id', () => {
      expect(
        API_CACHED_STORAGE_KEYS.fetchIssuerWellknownConfig('issuer1'),
      ).toBe('CACHE_FETCH_ISSUER_WELLKNOWN_CONFIG_issuer1');
    });

    it('fetchIssuerAuthorizationServerMetadata should return key with url', () => {
      expect(
        API_CACHED_STORAGE_KEYS.fetchIssuerAuthorizationServerMetadata(
          'https://auth.test',
        ),
      ).toBe(
        'CACHE_FETCH_ISSUER_AUTHORIZATION_SERVER_METADATA_https://auth.test',
      );
    });

    it('fetchTrustedVerifiers should be a string', () => {
      expect(API_CACHED_STORAGE_KEYS.fetchTrustedVerifiers).toBe(
        'CACHE_FETCH_TRUSTED_VERIFIERS',
      );
    });
  });

  describe('SUPPORTED_KEY_TYPES', () => {
    it('should map key type names to enums', () => {
      expect(SUPPORTED_KEY_TYPES).toHaveProperty('ED25519');
      expect(SUPPORTED_KEY_TYPES).toHaveProperty('RSA');
    });
  });

  describe('KEY_TYPE_TO_JWT_ALG', () => {
    it('should map key types to JWT algorithms', () => {
      expect(Object.values(KEY_TYPE_TO_JWT_ALG)).toContain('EdDSA');
      expect(Object.values(KEY_TYPE_TO_JWT_ALG)).toContain('RS256');
    });
  });

  describe('JWT_ALG_TO_KEY_TYPE', () => {
    it('should map JWT algorithms to key types', () => {
      expect(JWT_ALG_TO_KEY_TYPE).toHaveProperty('EdDSA');
      expect(JWT_ALG_TO_KEY_TYPE).toHaveProperty('RS256');
      expect(JWT_ALG_TO_KEY_TYPE).toHaveProperty('ES256');
    });
  });

  describe('argon2i configs', () => {
    it('argon2iConfig should have correct structure', () => {
      expect(argon2iConfig.iterations).toBe(5);
      expect(argon2iConfig.memory).toBe(16 * 1024);
      expect(argon2iConfig.parallelism).toBe(2);
      expect(argon2iConfig.hashLength).toBe(20);
      expect(argon2iConfig.mode).toBe('argon2i');
    });

    it('argon2iConfigForUinVid should have hashLength 5', () => {
      expect(argon2iConfigForUinVid.hashLength).toBe(5);
    });

    it('argon2iConfigForBackupFileName should use argon2id mode', () => {
      expect(argon2iConfigForBackupFileName.mode).toBe('argon2id');
      expect(argon2iConfigForBackupFileName.hashLength).toBe(8);
    });

    it('argon2iConfigForPasswordAndPhoneNumber should have high iterations', () => {
      expect(argon2iConfigForPasswordAndPhoneNumber.iterations).toBe(500);
      expect(argon2iConfigForPasswordAndPhoneNumber.mode).toBe('argon2id');
    });

    it('argon2iSalt should be defined', () => {
      expect(argon2iSalt).toBeDefined();
      expect(argon2iSalt.length).toBeGreaterThan(0);
    });
  });

  describe('error strings', () => {
    it('should have correct error message constants', () => {
      expect(TECHNICAL_ERROR).toBe('Technical error');
      expect(NETWORK_REQUEST_FAILED).toBe('Network request failed');
      expect(NO_INTERNET).toBe('No internet connection');
      expect(IOS_SIGNIN_FAILED).toBe('iCloud not available');
      expect(REQUEST_TIMEOUT).toBe('request timeout');
      expect(BIOMETRIC_CANCELLED).toBe('User has cancelled biometric');
    });
  });

  describe('cloud service names', () => {
    it('should have correct names', () => {
      expect(GOOGLE_DRIVE_NAME).toBe('Google Drive');
      expect(GMAIL).toBe('gmail');
      expect(APPLE).toBe('Apple');
      expect(ICLOUD_DRIVE_NAME).toBe('iCloud');
    });
  });

  describe('QR constants', () => {
    it('should have correct values', () => {
      expect(DEFAULT_ECL).toBe('L');
      expect(DEFAULT_QR_HEADER).toBe('INJIQUICKSHARE://');
      expect(MAX_QR_DATA_LENGTH).toBe(4296);
    });
  });

  describe('Copilot constants', () => {
    it('should have correct step values', () => {
      expect(COPILOT_PRE_FINAL_STEP).toBe(5);
      expect(COPILOT_FINAL_STEP).toBe(6);
      expect(COPILOT_HEIGHT).toBe(0.22);
      expect(KEY_MANAGEMENT_STEP).toBe(7);
    });

    it('copilotTestID should have correct mappings', () => {
      expect(copilotTestID['1']).toBe('help');
      expect(copilotTestID['2']).toBe('download');
      expect(copilotTestID['3']).toBe('scan');
    });
  });

  describe('OVP constants', () => {
    it('OVP_ERROR_MESSAGES should have correct values', () => {
      expect(OVP_ERROR_MESSAGES.NO_MATCHING_VCS).toBeDefined();
      expect(OVP_ERROR_MESSAGES.DECLINED).toBeDefined();
    });

    it('OVP_ERROR_CODE should have correct values', () => {
      expect(OVP_ERROR_CODE.NO_MATCHING_VCS).toBe('access_denied');
      expect(OVP_ERROR_CODE.DECLINED).toBe('access_denied');
    });
  });

  describe('AuthorizationType', () => {
    it('should have OPENID4VP_PRESENTATION and IMPLICIT', () => {
      expect(AuthorizationType.OPENID4VP_PRESENTATION).toBe(0);
      expect(AuthorizationType.IMPLICIT).toBe(1);
    });
  });

  describe('other constants', () => {
    it('UPLOAD_MAX_RETRY should be 2', () => {
      expect(UPLOAD_MAX_RETRY).toBe(2);
    });

    it('ENOENT should have correct value', () => {
      expect(ENOENT).toBe('No such file or directory');
    });

    it('ED25519_PROOF_SIGNING_ALGO should be Ed25519', () => {
      expect(ED25519_PROOF_SIGNING_ALGO).toBe('Ed25519');
    });

    it('EXPIRED_VC_ERROR_CODE should be ERR_VC_EXPIRED', () => {
      expect(EXPIRED_VC_ERROR_CODE).toBe('ERR_VC_EXPIRED');
    });

    it('BASE_36 should be 36', () => {
      expect(BASE_36).toBe(36);
    });

    it('QR_IMAGE_ID should be qrCodeImage', () => {
      expect(QR_IMAGE_ID).toBe('qrCodeImage');
    });

    it('SHOW_FACE_AUTH_CONSENT keys should be defined', () => {
      expect(SHOW_FACE_AUTH_CONSENT_SHARE_FLOW).toBe(
        'showFaceAuthConsentShareFlow',
      );
      expect(SHOW_FACE_AUTH_CONSENT_QR_LOGIN_FLOW).toBe(
        'showFaceAuthConsentQrLoginFlow',
      );
    });
  });

  describe('GET_INDIVIDUAL_ID', () => {
    it('should update individualId', () => {
      GET_INDIVIDUAL_ID({id: '12345', idType: 'UIN'});
      const constants = require('./constants');
      expect(constants.individualId.id).toBe('12345');
      expect(constants.individualId.idType).toBe('UIN');
    });
  });
});
