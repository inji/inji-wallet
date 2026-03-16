/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Protocols,
  Issuers,
  isActivationNeeded,
  ACTIVATION_NEEDED,
  Issuers_Key_Ref,
  getDisplayObjectForCurrentLanguage,
  removeBottomSectionFields,
  getMatchingCredentialIssuerMetadata,
  selectCredentialRequestKey,
  updateCredentialInformation,
  getVcVerificationDetails,
  OIDCErrors,
  ErrorMessage,
  formattedDate,
  hasKeyPair,
  getJWK,
  vcDownloadTimeout,
  verifyCredentialData,
  constructProofJWT,
  getCredentialIssuersWellKnownConfig,
  getDetailedViewFields,
} from './Utils';
import {VCFormat} from '../VCFormat';

// Mock VCProcessor
jest.mock('../../components/VC/common/VCProcessor', () => ({
  VCProcessor: {
    processForRendering: jest.fn().mockResolvedValue({
      processedData: 'mocked-processed-credential',
    }),
  },
}));

jest.mock('react-native', () => ({
  NativeModules: {
    RNSecureKeystoreModule: {
      hasAlias: jest.fn(async (keyType: string) => keyType === 'existing-key'),
    },
  },
}));

jest.mock('node-jose', () => ({
  JWK: {
    asKey: jest.fn(async () => ({
      toJSON: () => ({kty: 'RSA', n: 'n-val', e: 'e-val'}),
    })),
  },
}));

jest.mock('../vcjs/verifyCredential', () => ({
  verifyCredential: jest.fn(async () => ({isVerified: true})),
}));

jest.mock('../api', () => {
  const actual = jest.requireActual('../api');
  return {
    __esModule: true,
    default: jest.fn(async () => ({openId4VCIDownloadVCTimeout: '60000'})),
    CACHED_API: {
      fetchIssuerWellknownConfig: jest.fn(),
    },
    API_URLS: actual.API_URLS,
  };
});

jest.mock('../constants', () => ({
  ED25519_PROOF_SIGNING_ALGO: 'EdDSA',
  isAndroid: jest.fn(() => false),
  isIOS: jest.fn(() => false),
  JWT_ALG_TO_KEY_TYPE: {
    RS256: 'RS256',
    ES256: 'ES256',
    ES256K: 'ES256K',
    EdDSA: 'Ed25519',
  },
  KEY_TYPE_TO_JWT_ALG: {
    RS256: 'RS256',
    ES256: 'ES256',
    ES256K: 'ES256K',
    Ed25519: 'EdDSA',
  },
}));

jest.mock('../cryptoutil/KeyTypes', () => ({
  KeyTypes: {
    RS256: 'RS256',
    ES256: 'ES256',
    ES256K: 'ES256K',
    ED25519: 'Ed25519',
  },
}));

jest.mock('base64url', () =>
  jest.fn((input: any) =>
    Buffer.from(
      typeof input === 'string' ? input : JSON.stringify(input),
    ).toString('base64url'),
  ),
);

jest.mock('../cryptoutil/cryptoUtil', () => ({
  getJWT: jest.fn(async () => 'mock-jwt-token'),
}));

jest.mock('../telemetry/TelemetryUtils', () => ({
  getErrorEventData: jest.fn(),
  sendErrorEvent: jest.fn(),
}));

jest.mock('../telemetry/TelemetryConstants', () => ({
  TelemetryConstants: {
    FlowType: {wellknownConfig: 'wellknownConfig'},
    ErrorId: {mismatch: 'mismatch'},
    ErrorMessage: {wellknownConfigMismatch: 'mismatch'},
  },
}));

describe('openId4VCI Utils', () => {
  describe('Protocols', () => {
    it('should have OpenId4VCI protocol defined', () => {
      expect(Protocols.OpenId4VCI).toBe('OpenId4VCI');
    });

    it('should have OTP protocol defined', () => {
      expect(Protocols.OTP).toBe('OTP');
    });
  });

  describe('Issuers', () => {
    it('should have MosipOtp issuer defined', () => {
      expect(Issuers.MosipOtp).toBe('MosipOtp');
    });

    it('should have Mosip issuer defined', () => {
      expect(Issuers.Mosip).toBe('Mosip');
    });
  });

  describe('ACTIVATION_NEEDED', () => {
    it('should contain Mosip', () => {
      expect(ACTIVATION_NEEDED).toContain(Issuers.Mosip);
    });

    it('should contain MosipOtp', () => {
      expect(ACTIVATION_NEEDED).toContain(Issuers.MosipOtp);
    });

    it('should have exactly 2 issuers', () => {
      expect(ACTIVATION_NEEDED).toHaveLength(2);
    });
  });

  describe('isActivationNeeded', () => {
    it('should return true for Mosip issuer', () => {
      expect(isActivationNeeded('Mosip')).toBe(true);
    });

    it('should return true for MosipOtp issuer', () => {
      expect(isActivationNeeded('MosipOtp')).toBe(true);
    });

    it('should return false for other issuers', () => {
      expect(isActivationNeeded('SomeOtherIssuer')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isActivationNeeded('')).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isActivationNeeded(undefined as any)).toBe(false);
    });

    it('should be case sensitive', () => {
      expect(isActivationNeeded('mosip')).toBe(false);
      expect(isActivationNeeded('MOSIP')).toBe(false);
    });
  });

  describe('Issuers_Key_Ref', () => {
    it('should have correct key reference', () => {
      expect(Issuers_Key_Ref).toBe('OpenId4VCI_KeyPair');
    });
  });

  describe('getDisplayObjectForCurrentLanguage', () => {
    it('should return display object for current language', () => {
      const display = [
        {language: 'en', name: 'English Name', logo: 'en-logo.png'},
        {language: 'hi', name: 'Hindi Name', logo: 'hi-logo.png'},
      ] as any;

      const result = getDisplayObjectForCurrentLanguage(display);
      expect(result).toBeDefined();
      expect(result.name).toBeDefined();
    });

    it('should return first display object when language not found', () => {
      const display = [
        {language: 'fr', name: 'French Name', logo: 'fr-logo.png'},
        {language: 'de', name: 'German Name', logo: 'de-logo.png'},
      ] as any;

      const result = getDisplayObjectForCurrentLanguage(display);
      expect(result).toBeDefined();
      expect(result.name).toBe('French Name');
    });

    it('should return empty object when display array is empty', () => {
      const result = getDisplayObjectForCurrentLanguage([]);
      expect(result).toEqual({});
    });

    it('should return empty object when display is null', () => {
      const result = getDisplayObjectForCurrentLanguage(null as any);
      expect(result).toEqual({});
    });

    it('should handle locale key instead of language key', () => {
      const display = [
        {locale: 'en-US', name: 'English Name', logo: 'en-logo.png'},
        {locale: 'hi-IN', name: 'Hindi Name', logo: 'hi-logo.png'},
      ] as any;

      const result = getDisplayObjectForCurrentLanguage(display);
      expect(result).toBeDefined();
    });

    it('should fallback to en-US when current language not found', () => {
      const display = [
        {language: 'fr', name: 'French Name'},
        {language: 'en-US', name: 'English US Name'},
      ] as any;

      const result = getDisplayObjectForCurrentLanguage(display);
      expect(result.name).toBe('English US Name');
    });
  });

  describe('removeBottomSectionFields', () => {
    it('should remove bottom section fields for SD-JWT format', () => {
      const fields = ['name', 'age', 'photo', 'signature', 'address'];
      const result = removeBottomSectionFields(fields, VCFormat.vc_sd_jwt);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should remove bottom section fields for DC-SD-JWT format', () => {
      const fields = ['name', 'age', 'photo', 'signature'];
      const result = removeBottomSectionFields(fields, VCFormat.dc_sd_jwt);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should remove bottom section fields for JWT-VC-JSON format', () => {
      const fields = ['name', 'age', 'photo', 'signature', 'address'];
      const result = removeBottomSectionFields(fields, VCFormat.jwt_vc_json);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should remove address field for LDP format', () => {
      const fields = ['name', 'age', 'address', 'photo'];
      const result = removeBottomSectionFields(fields, VCFormat.ldp_vc);

      expect(result).toBeDefined();
      expect(result).not.toContain('address');
    });

    it('should handle empty fields array', () => {
      const result = removeBottomSectionFields([], VCFormat.ldp_vc);
      expect(result).toEqual([]);
    });
  });

  describe('getMatchingCredentialIssuerMetadata', () => {
    it('should return matching credential configuration', () => {
      const wellknown = {
        credential_configurations_supported: {
          MOSIPVerifiableCredential: {
            format: 'ldp_vc',
            order: ['name', 'age'],
          },
          AnotherCredential: {
            format: 'jwt_vc',
          },
        },
      };

      const result = getMatchingCredentialIssuerMetadata(
        wellknown,
        'MOSIPVerifiableCredential',
      );

      expect(result).toBeDefined();
      expect(result.format).toBe('ldp_vc');
      expect(result.order).toEqual(['name', 'age']);
    });

    it('should throw error when credential type not found', () => {
      const wellknown = {
        credential_configurations_supported: {
          SomeCredential: {format: 'ldp_vc'},
        },
      };

      expect(() => {
        getMatchingCredentialIssuerMetadata(wellknown, 'NonExistentCredential');
      }).toThrow();
    });

    it('should handle multiple credential configurations', () => {
      const wellknown = {
        credential_configurations_supported: {
          Credential1: {format: 'ldp_vc'},
          Credential2: {format: 'jwt_vc'},
          Credential3: {format: 'mso_mdoc'},
        },
      };

      const result = getMatchingCredentialIssuerMetadata(
        wellknown,
        'Credential2',
      );

      expect(result).toBeDefined();
      expect(result.format).toBe('jwt_vc');
    });
  });

  describe('selectCredentialRequestKey', () => {
    it('should select first supported key type', () => {
      const proofSigningAlgos = ['RS256', 'ES256'];
      const keyOrder = {'0': 'RS256', '1': 'ES256', '2': 'Ed25519'};

      const result = selectCredentialRequestKey(proofSigningAlgos, keyOrder);
      expect(result).toBe('RS256');
    });

    it('should return first key when no match found', () => {
      const proofSigningAlgos = ['UNKNOWN_ALGO'];
      const keyOrder = {'0': 'RS256', '1': 'ES256'};

      const result = selectCredentialRequestKey(proofSigningAlgos, keyOrder);
      expect(result).toBe('RS256');
    });

    it('should handle empty proofSigningAlgos', () => {
      const keyOrder = {'0': 'RS256', '1': 'ES256'};

      const result = selectCredentialRequestKey([], keyOrder);
      expect(result).toBe('RS256');
    });

    it('should select matching key from middle of order', () => {
      const proofSigningAlgos = ['ES256'];
      const keyOrder = {'0': 'RS256', '1': 'ES256', '2': 'Ed25519'};

      const result = selectCredentialRequestKey(proofSigningAlgos, keyOrder);
      expect(result).toBe('ES256');
    });
  });

  describe('updateCredentialInformation', () => {
    it('should update credential information for MSO_MDOC format', async () => {
      const mockContext = {
        selectedCredentialType: {
          id: 'TestCredential',
          format: VCFormat.mso_mdoc,
        },
        selectedIssuer: {
          display: [{language: 'en', logo: 'test-logo.png'}],
        },
        vcMetadata: {
          id: 'test-id',
        },
      };

      const mockCredential = {
        credential: 'test-credential-data',
      } as any;

      const result = await updateCredentialInformation(
        mockContext,
        mockCredential,
      );

      expect(result).toBeDefined();
      expect(result.format).toBe(VCFormat.mso_mdoc);
      expect(result.verifiableCredential).toBeDefined();
      expect(result.verifiableCredential.credentialConfigurationId).toBe(
        'TestCredential',
      );
      expect(result.generatedOn).toBeInstanceOf(Date);
    });

    it('should update credential information for SD-JWT format', async () => {
      const mockContext = {
        selectedCredentialType: {
          id: 'SDJWTCredential',
          format: VCFormat.vc_sd_jwt,
        },
        selectedIssuer: {
          display: [{language: 'en', logo: 'sd-jwt-logo.png'}],
        },
        vcMetadata: {
          id: 'sd-jwt-id',
        },
      };

      const mockCredential = {
        credential: 'sd-jwt-credential-data',
      } as any;

      const result = await updateCredentialInformation(
        mockContext,
        mockCredential,
      );

      expect(result).toBeDefined();
      expect(result.format).toBe(VCFormat.vc_sd_jwt);
      expect(result.vcMetadata.format).toBe(VCFormat.vc_sd_jwt);
    });

    it('should update credential information for DC-SD-JWT format', async () => {
      const mockContext = {
        selectedCredentialType: {
          id: 'DCSDJWTCredential',
          format: VCFormat.dc_sd_jwt,
        },
        selectedIssuer: {
          display: [{language: 'en', logo: 'dc-logo.png'}],
        },
        vcMetadata: {
          id: 'dc-jwt-id',
        },
      };

      const mockCredential = {
        credential: 'dc-sd-jwt-credential-data',
      } as any;

      const result = await updateCredentialInformation(
        mockContext,
        mockCredential,
      );

      expect(result).toBeDefined();
      expect(result.format).toBe(VCFormat.dc_sd_jwt);
    });

    it('should update credential information for JWT-VC-JSON format', async () => {
      const mockContext = {
        selectedCredentialType: {
          id: 'JWTVCCredential',
          format: VCFormat.jwt_vc_json,
        },
        selectedIssuer: {
          display: [{language: 'en', logo: 'jwt-logo.png'}],
        },
        vcMetadata: {id: 'jwt-vc-id'},
      };

      const mockCredential = {credential: 'jwt-vc-credential-data'} as any;
      const result = await updateCredentialInformation(
        mockContext,
        mockCredential,
      );

      expect(result.format).toBe(VCFormat.jwt_vc_json);
      expect(result.vcMetadata.format).toBe(VCFormat.jwt_vc_json);
    });

    it('should handle credential without logo in display', async () => {
      const mockContext = {
        selectedCredentialType: {
          id: 'NoLogoCredential',
          format: VCFormat.ldp_vc,
        },
        selectedIssuer: {
          display: [{language: 'en'}],
        },
        vcMetadata: {},
      };

      const mockCredential = {
        credential: 'no-logo-credential',
      } as any;

      const result = await updateCredentialInformation(
        mockContext,
        mockCredential,
      );

      expect(result).toBeDefined();
      expect(result.verifiableCredential.issuerLogo).toBe('');
    });

    it('should include vcMetadata with format', async () => {
      const mockContext = {
        selectedCredentialType: {
          id: 'MetadataTest',
          format: VCFormat.ldp_vc,
        },
        selectedIssuer: {
          display: [],
        },
        vcMetadata: {
          id: 'metadata-id',
        },
      };

      const mockCredential = {
        credential: 'metadata-test',
      } as any;

      const result = await updateCredentialInformation(
        mockContext,
        mockCredential,
      );

      expect(result.vcMetadata).toBeDefined();
      expect(result.vcMetadata.format).toBe(VCFormat.ldp_vc);
      expect(result.vcMetadata.id).toBe('metadata-id');
    });
  });

  describe('getVcVerificationDetails', () => {
    it('should return verification details', () => {
      const vcMetadata = {
        credentialType: 'NationalID',
        isRevoked: false,
        isExpired: false,
      } as any;
      const result = getVcVerificationDetails('valid', vcMetadata);
      expect(result.statusType).toBe('valid');
      expect(result.isRevoked).toBe(false);
      expect(result.isExpired).toBe(false);
      expect(result.vcType).toBe('NationalID');
    });

    it('should handle revoked credential', () => {
      const vcMetadata = {
        credentialType: 'Passport',
        isRevoked: true,
        isExpired: false,
      } as any;
      const result = getVcVerificationDetails('revoked', vcMetadata);
      expect(result.isRevoked).toBe(true);
    });

    it('should handle expired credential', () => {
      const vcMetadata = {
        credentialType: 'License',
        isRevoked: false,
        isExpired: true,
      } as any;
      const result = getVcVerificationDetails('expired', vcMetadata);
      expect(result.isExpired).toBe(true);
    });
  });

  describe('OIDCErrors', () => {
    it('should have OIDC flow cancelled errors', () => {
      expect(OIDCErrors.OIDC_FLOW_CANCELLED_ANDROID).toBe(
        'User cancelled flow',
      );
      expect(OIDCErrors.OIDC_FLOW_CANCELLED_IOS).toContain(
        'org.openid.appauth',
      );
    });

    it('should have invalid token error', () => {
      expect(OIDCErrors.INVALID_TOKEN_SPECIFIED).toBe(
        'Invalid token specified',
      );
    });

    it('should have config error prefix', () => {
      expect(OIDCErrors.OIDC_CONFIG_ERROR_PREFIX).toBe('Config error');
    });

    it('should have authorization endpoint discovery errors', () => {
      expect(
        OIDCErrors.AUTHORIZATION_ENDPOINT_DISCOVERY.GRANT_TYPE_NOT_SUPPORTED,
      ).toBeDefined();
      expect(
        OIDCErrors.AUTHORIZATION_ENDPOINT_DISCOVERY
          .FAILED_TO_FETCH_AUTHORIZATION_ENDPOINT,
      ).toBeDefined();
    });
  });

  describe('ErrorMessage enum', () => {
    it('should have all error message types', () => {
      expect(ErrorMessage.NO_INTERNET).toBe('noInternetConnection');
      expect(ErrorMessage.GENERIC).toBe('generic');
      expect(ErrorMessage.REQUEST_TIMEDOUT).toBe('technicalDifficulty');
      expect(ErrorMessage.BIOMETRIC_CANCELLED).toBe('biometricCancelled');
      expect(ErrorMessage.TECHNICAL_DIFFICULTIES).toBe('technicalDifficulty');
      expect(ErrorMessage.CREDENTIAL_TYPE_DOWNLOAD_FAILURE).toBe(
        'credentialTypeListDownloadFailure',
      );
      expect(ErrorMessage.AUTHORIZATION_GRANT_TYPE_NOT_SUPPORTED).toBe(
        'authorizationGrantTypeNotSupportedByWallet',
      );
      expect(ErrorMessage.NETWORK_REQUEST_FAILED).toBe('networkRequestFailed');
    });
  });

  describe('formattedDate', () => {
    it('should format a timestamp', () => {
      // Jan 15, 2023 10:30 AM UTC
      const timestamp = new Date(2023, 0, 15, 10, 30, 0).getTime();
      const result = formattedDate(timestamp);
      expect(result).toContain('15');
      expect(result).toContain('January');
      expect(result).toContain('2023');
    });

    it('should format a date string', () => {
      const result = formattedDate('2023-06-15T14:30:00');
      expect(result).toContain('2023');
      expect(result).toContain('June');
    });

    it('should include AM/PM', () => {
      const morningTime = new Date(2023, 5, 15, 9, 15, 0).getTime();
      const result = formattedDate(morningTime) as string;
      expect(result).toContain('AM');
    });

    it('should include PM for afternoon', () => {
      const afternoonTime = new Date(2023, 5, 15, 15, 45, 0).getTime();
      const result = formattedDate(afternoonTime) as string;
      expect(result).toContain('PM');
    });
  });

  describe('hasKeyPair', () => {
    it('should return a boolean', async () => {
      const result = await hasKeyPair('some-key');
      expect(typeof result).toBe('boolean');
    });

    it('should return false for non-existing key', async () => {
      const result = await hasKeyPair('non-existing-key');
      expect(result).toBe(false);
    });
  });

  describe('getJWK', () => {
    it('should return JWK for RS256 key type', async () => {
      const result = await getJWK('public-key-pem', 'RS256');
      expect(result).toBeDefined();
      expect(result.use).toBe('sig');
    });

    it('should return JWK for Ed25519 key type', async () => {
      const result = await getJWK('ed-public-key', 'Ed25519');
      expect(result).toBeDefined();
      expect(result.kty).toBe('OKP');
      expect(result.crv).toBe('Ed25519');
      expect(result.use).toBe('sig');
    });

    it('should return JWK for ES256K key type', async () => {
      const publicKey = new Uint8Array(65);
      publicKey[0] = 0x04;
      const result = await getJWK(publicKey, 'ES256K');
      expect(result).toBeDefined();
      expect(result.kty).toBe('EC');
      expect(result.crv).toBe('secp256k1');
    });

    it('should return undefined for unsupported key type', async () => {
      const result = await getJWK('key', 'UNSUPPORTED');
      expect(result).toBeUndefined();
    });
  });

  describe('vcDownloadTimeout', () => {
    it('should return timeout from configuration', async () => {
      const result = await vcDownloadTimeout();
      expect(result).toBe(60000);
    });
  });

  describe('verifyCredentialData', () => {
    it('should verify credential and return result', async () => {
      const result = await verifyCredentialData(
        {credentialSubject: {name: 'test'}} as any,
        VCFormat.ldp_vc,
      );
      expect(result).toEqual({isVerified: true});
    });
  });

  describe('constructProofJWT', () => {
    it('should construct proof JWT for RS256', async () => {
      const result = await constructProofJWT(
        'rsa-public-key',
        'rsa-private-key',
        'https://issuer.example.com',
        'client-123',
        'RS256',
        ['RS256'],
        false,
        'test-nonce',
      );
      expect(typeof result).toBe('string');
    });

    it('should construct proof JWT for Ed25519', async () => {
      const result = await constructProofJWT(
        'ed-public-key',
        'ed-private-key',
        'https://issuer.example.com',
        'client-123',
        'Ed25519',
        ['EdDSA'],
        true,
        'test-nonce',
      );
      expect(typeof result).toBe('string');
    });

    it('should construct proof JWT without client_id', async () => {
      const result = await constructProofJWT(
        'rsa-public-key',
        'rsa-private-key',
        'https://issuer.example.com',
        null,
        'RS256',
        ['RS256'],
        false,
        'test-nonce',
      );
      expect(typeof result).toBe('string');
    });

    it('should throw for unsupported key type', async () => {
      await expect(
        constructProofJWT(
          'key',
          'key',
          'issuer',
          'client',
          'UNKNOWN',
          [],
          false,
        ),
      ).rejects.toThrow('Unsupported algorithm');
    });
  });

  describe('getCredentialIssuersWellKnownConfig', () => {
    it('should return fields from wellknown order', async () => {
      const {CACHED_API} = require('../api');
      CACHED_API.fetchIssuerWellknownConfig.mockResolvedValue({
        credential_configurations_supported: {
          'test-cred-id': {
            order: ['field1', 'field2', 'field3'],
          },
        },
      });
      const result = await getCredentialIssuersWellKnownConfig(
        'issuer-cache',
        ['default1'],
        'test-cred-id',
        VCFormat.ldp_vc,
        'https://issuer.example.com',
      );
      expect(result.fields).toEqual(['field1', 'field2', 'field3']);
      expect(result.wellknownFieldsFlag).toBe(true);
    });

    it('should return ldp_vc fields from credential_definition', async () => {
      const {CACHED_API} = require('../api');
      CACHED_API.fetchIssuerWellknownConfig.mockResolvedValue({
        credential_configurations_supported: {
          'test-cred-id': {
            order: null,
            credential_definition: {
              credentialSubject: {name: {}, age: {}, email: {}},
            },
          },
        },
      });
      const result = await getCredentialIssuersWellKnownConfig(
        'issuer-cache',
        ['default1'],
        'test-cred-id',
        VCFormat.ldp_vc,
        'https://issuer.example.com',
      );
      expect(result.fields).toEqual(['name', 'age', 'email']);
      expect(result.wellknownFieldsFlag).toBe(true);
    });

    it('should return sd_jwt fields using flattenClaimPaths', async () => {
      const {CACHED_API} = require('../api');
      CACHED_API.fetchIssuerWellknownConfig.mockResolvedValue({
        credential_configurations_supported: {
          'test-cred-id': {
            order: null,
            claims: {
              name: {display: {}},
              address: {street: {display: {}}, city: {display: {}}},
            },
          },
        },
      });
      const result = await getCredentialIssuersWellKnownConfig(
        'issuer-cache',
        ['default1'],
        'test-cred-id',
        VCFormat.vc_sd_jwt,
        'https://issuer.example.com',
      );
      expect(result.fields.length).toBeGreaterThan(0);
      expect(result.wellknownFieldsFlag).toBe(true);
    });

    it('should return default fields when wellknown is null', async () => {
      const {CACHED_API} = require('../api');
      CACHED_API.fetchIssuerWellknownConfig.mockResolvedValue(null);
      const result = await getCredentialIssuersWellKnownConfig(
        'issuer-cache',
        ['default1', 'default2'],
        'test-cred-id',
        VCFormat.ldp_vc,
        'https://issuer.example.com',
      );
      expect(result.fields).toEqual(['default1', 'default2']);
    });

    it('should return default fields on error', async () => {
      const {CACHED_API} = require('../api');
      CACHED_API.fetchIssuerWellknownConfig.mockResolvedValue({
        credential_configurations_supported: {},
      });
      const spy = jest.spyOn(console, 'error').mockImplementation();
      const result = await getCredentialIssuersWellKnownConfig(
        'issuer-cache',
        ['default1'],
        'non-existent-cred',
        VCFormat.ldp_vc,
        'https://issuer.example.com',
      );
      expect(result.wellknownFieldsFlag).toBe(false);
      spy.mockRestore();
    });

    it('should return default fields for unsupported vc format', async () => {
      const {CACHED_API} = require('../api');
      CACHED_API.fetchIssuerWellknownConfig.mockResolvedValue({
        credential_configurations_supported: {
          'test-cred-id': {
            order: null,
            claims: {},
          },
        },
      });
      const spy = jest.spyOn(console, 'error').mockImplementation();
      const result = await getCredentialIssuersWellKnownConfig(
        'issuer-cache',
        ['default1'],
        'test-cred-id',
        'unknown_format',
        'https://issuer.example.com',
      );
      expect(result.fields).toEqual(['default1']);
      expect(result.wellknownFieldsFlag).toBe(false);
      spy.mockRestore();
    });
  });

  describe('getDetailedViewFields', () => {
    it('should return fields with add-on fields', async () => {
      const {CACHED_API} = require('../api');
      CACHED_API.fetchIssuerWellknownConfig.mockResolvedValue({
        credential_configurations_supported: {
          'test-cred-id': {
            order: ['field1', 'field2'],
          },
        },
      });
      const result = await getDetailedViewFields(
        'issuer-cache',
        'test-cred-id',
        ['default1'],
        VCFormat.ldp_vc,
        'https://issuer.example.com',
      );
      expect(result.fields).toBeDefined();
      expect(result.fields.length).toBeGreaterThan(0);
    });
  });

  describe('getJWK edge cases', () => {
    it('should return JWK for ES256 key type on non-Android', async () => {
      const publicKey = new Uint8Array(65);
      publicKey[0] = 0x04;
      const result = await getJWK(publicKey, 'ES256');
      expect(result).toBeDefined();
      expect(result.kty).toBe('EC');
      expect(result.crv).toBe('P-256');
    });
  });
});
