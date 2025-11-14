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
});
