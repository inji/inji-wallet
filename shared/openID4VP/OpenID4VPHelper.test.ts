const mockCreateSignature = jest.fn(() => Promise.resolve('sig'));
const mockCreateSignatureED = jest.fn(() => Promise.resolve('ed-sig'));
const mockEncodeB64 = jest.fn((input: string) =>
  Buffer.from(input).toString('base64'),
);
const mockFetchKeyPair = jest.fn(() =>
  Promise.resolve({privateKey: 'pk', publicKey: 'pub'}),
);

jest.mock('../cryptoutil/cryptoUtil', () => ({
  createSignature: mockCreateSignature,
  createSignatureED: mockCreateSignatureED,
  encodeB64: mockEncodeB64,
  fetchKeyPair: mockFetchKeyPair,
}));

jest.mock('../Utils', () => ({
  base64ToByteArray: jest.fn((s: string) => new Uint8Array([1, 2, 3])),
  canonicalize: jest.fn(() => Promise.resolve('canonicalized')),
}));

const mockGetAllConfigurations = jest.fn(() =>
  Promise.resolve({
    openid4vpClientValidation: 'false',
    walletMetadata: null,
  }),
);

jest.mock('../api', () => mockGetAllConfigurations);

jest.mock('./OpenID4VP', () => ({
  OpenID4VP_Proof_Sign_Algo: 'EdDSA',
}));

jest.mock('../VCFormat', () => ({
  VCFormat: {
    ldp_vc: 'ldp_vc',
    mso_mdoc: 'mso_mdoc',
    vc_sd_jwt: 'vc_sd_jwt',
    dc_sd_jwt: 'dc_sd_jwt',
  },
}));

jest.mock('../constants', () => ({
  isIOS: jest.fn(() => false),
  JWT_ALG_TO_KEY_TYPE: {EdDSA: 'Ed25519'},
}));

jest.mock('../../components/VC/common/VCUtils', () => ({
  getMdocAuthenticationAlorithm: jest.fn(() => 'ES256'),
}));

jest.mock('../cryptoutil/KeyTypes', () => ({
  KeyTypes: {RSA: 'RSA', EC: 'EC', Ed25519: 'Ed25519', ES256: 'ES256'},
}));

jest.mock('../../machines/openID4VP/openID4VPServices', () => ({
  signatureSuite: 'Ed25519Signature2018',
}));

import {
  isClientValidationRequired,
  getWalletMetadata,
  constructDetachedJWT,
  signDataForVpPreparation,
  signDataForVpPreparationV2,
} from './OpenID4VPHelper';

describe('OpenID4VPHelper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllConfigurations.mockResolvedValue({
      openid4vpClientValidation: 'false',
      walletMetadata: null,
    });
  });

  describe('isClientValidationRequired', () => {
    it('returns false when config says false', async () => {
      const result = await isClientValidationRequired();
      expect(result).toBe(false);
    });

    it('returns true when config says true', async () => {
      mockGetAllConfigurations.mockResolvedValue({
        openid4vpClientValidation: 'true',
      });
      const result = await isClientValidationRequired();
      expect(result).toBe(true);
    });
  });

  describe('getWalletMetadata', () => {
    it('returns null when no wallet metadata in config', async () => {
      const result = await getWalletMetadata();
      expect(result).toBeNull();
    });

    it('returns parsed wallet metadata when present', async () => {
      mockGetAllConfigurations.mockResolvedValue({
        walletMetadata: '{"name":"test-wallet"}',
      });
      const result = await getWalletMetadata();
      expect(result).toEqual({name: 'test-wallet'});
    });
  });

  describe('constructDetachedJWT', () => {
    it('constructs a detached JWT with .. separator', async () => {
      const result = await constructDetachedJWT(
        'privateKey',
        'vpToken',
        'Ed25519',
      );
      expect(typeof result).toBe('string');
      expect(result).toContain('..');
    });

    it('calls createSignatureED with correct params', async () => {
      await constructDetachedJWT('myKey', 'tokenBytes', 'Ed25519');
      expect(mockCreateSignatureED).toHaveBeenCalledWith(
        'myKey',
        expect.any(Uint8Array),
      );
    });

    it('encodes header as base64', async () => {
      await constructDetachedJWT('key', 'token', 'Ed25519');
      expect(mockEncodeB64).toHaveBeenCalledWith(
        expect.stringContaining('"alg":"EdDSA"'),
      );
    });
  });

  describe('signDataForVpPreparation', () => {
    it('should sign ldp_vc format data', async () => {
      const unSignedVpTokens = {
        ldp_vc: {dataToSign: 'base64-data'},
      };
      const context = {privateKey: 'priv', keyType: 'Ed25519'};
      const result = await signDataForVpPreparation(unSignedVpTokens, context);
      expect(result).toHaveProperty('ldp_vc');
      expect(result.ldp_vc).toHaveProperty('jws');
      expect(result.ldp_vc.signatureAlgorithm).toBe('Ed25519Signature2018');
    });

    it('should sign ldp_vc on iOS with canonicalization', async () => {
      const {isIOS} = require('../constants');
      isIOS.mockReturnValue(true);

      const unSignedVpTokens = {
        ldp_vc: {dataToSign: '{"key":"value"}'},
      };
      const context = {privateKey: 'priv', keyType: 'Ed25519'};
      const result = await signDataForVpPreparation(unSignedVpTokens, context);
      expect(result).toHaveProperty('ldp_vc');
      isIOS.mockReturnValue(false);
    });

    it('should throw on iOS when canonicalization returns undefined', async () => {
      const {isIOS} = require('../constants');
      const {canonicalize} = require('../Utils');
      isIOS.mockReturnValue(true);
      canonicalize.mockResolvedValueOnce(undefined);

      const unSignedVpTokens = {
        ldp_vc: {dataToSign: '{"key":"value"}'},
      };
      const context = {privateKey: 'priv', keyType: 'Ed25519'};
      await expect(
        signDataForVpPreparation(unSignedVpTokens, context),
      ).rejects.toThrow('Canonicalized data to sign is undefined');
      isIOS.mockReturnValue(false);
    });

    it('should sign vc_sd_jwt format with Ed25519 key', async () => {
      const unSignedVpTokens = {
        vc_sd_jwt: {
          uuidToUnsignedKBT: {
            'uuid-1': btoa(JSON.stringify({alg: 'EdDSA'})) + '.payload.nosig',
          },
        },
      };
      const context = {privateKey: 'ed-priv', keyType: 'Ed25519'};
      const result = await signDataForVpPreparation(unSignedVpTokens, context);
      expect(result).toHaveProperty('vc_sd_jwt');
      expect(result.vc_sd_jwt).toHaveProperty('uuid-1');
    });

    it('should throw when signature creation fails for vc_sd_jwt', async () => {
      mockCreateSignature.mockResolvedValueOnce(null);
      const unSignedVpTokens = {
        vc_sd_jwt: {
          uuidToUnsignedKBT: {
            'uuid-1': btoa(JSON.stringify({alg: 'EdDSA'})) + '.payload.nosig',
          },
        },
      };
      const context = {privateKey: 'ed-priv', keyType: 'Ed25519'};
      await expect(
        signDataForVpPreparation(unSignedVpTokens, context),
      ).rejects.toThrow('Failed to create signature for UUID');
    });

    it('should handle mso_mdoc format', async () => {
      const unSignedVpTokens = {
        mso_mdoc: {
          docTypeToDeviceAuthenticationBytes: {
            'org.iso.18013.5.1.mDL': 'auth-bytes',
          },
        },
      };
      const context = {
        privateKey: 'priv',
        keyType: 'ES256',
        selectedVCs: {
          'inp-1': [
            {
              format: 'mso_mdoc',
              verifiableCredential: {
                processedCredential: {
                  docType: 'org.iso.18013.5.1.mDL',
                  issuerSigned: {issuerAuth: [null, null, {alg: 'ES256'}]},
                },
              },
            },
          ],
        },
      };
      const result = await signDataForVpPreparation(unSignedVpTokens, context);
      expect(result).toHaveProperty('mso_mdoc');
    });
  });

  describe('signDataForVpPreparationV2', () => {
    it('should sign ldp_vc format tokens', async () => {
      const tokens = [
        {
          format: 'ldp_vc',
          holderKeyReference: 'key-ref',
          signatureAlgorithm: 'EdDSA',
          dataToSign: 'data',
        },
      ];
      const context = {privateKey: 'priv'};
      const result = await signDataForVpPreparationV2(tokens, context);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('signedData');
    });

    it('should sign mso_mdoc format tokens with ES256', async () => {
      const tokens = [
        {
          format: 'mso_mdoc',
          holderKeyReference: 'key-ref',
          signatureAlgorithm: 'ES256',
          dataToSign: 'mdoc-data',
        },
      ];
      const context = {privateKey: 'priv'};
      const result = await signDataForVpPreparationV2(tokens, context);
      expect(result).toHaveLength(1);
      expect(result[0].signedData).toBeDefined();
    });

    it('should throw for unsupported mso_mdoc algorithm', async () => {
      const tokens = [
        {
          format: 'mso_mdoc',
          holderKeyReference: 'key-ref',
          signatureAlgorithm: 'RS256',
          dataToSign: 'data',
        },
      ];
      const context = {privateKey: 'priv'};
      await expect(signDataForVpPreparationV2(tokens, context)).rejects.toThrow(
        'Unsupported algorithm',
      );
    });

    it('should throw for unsupported format', async () => {
      const tokens = [
        {
          format: 'unknown_format',
          holderKeyReference: 'key-ref',
          signatureAlgorithm: 'EdDSA',
          dataToSign: 'data',
        },
      ];
      const context = {privateKey: 'priv'};
      await expect(signDataForVpPreparationV2(tokens, context)).rejects.toThrow(
        'Unsupported VP Token format',
      );
    });
  });
});
