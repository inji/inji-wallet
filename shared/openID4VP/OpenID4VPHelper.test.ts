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
  base64ToByteArray: jest.fn((_: string) => new Uint8Array([1, 2, 3])),
  canonicalize: jest.fn(() => Promise.resolve('canonicalized')),
}));

const mockGetAllConfigurations = jest.fn(
  (): Promise<{
    openid4vpClientValidation: string;
    walletConfig?: string | null;
  }> =>
    Promise.resolve({
      openid4vpClientValidation: 'false',
      walletConfig: null,
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
  getWalletConfig,
  signDataForVpPreparation,
  claimPathPointersToJsonPath,
} from './OpenID4VPHelper';

describe('OpenID4VPHelper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllConfigurations.mockResolvedValue({
      openid4vpClientValidation: 'false',
      walletConfig: null,
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
      const result = await getWalletConfig();
      expect(result).toBeNull();
    });

    it('returns parsed wallet metadata when present', async () => {
      mockGetAllConfigurations.mockResolvedValue({
        openid4vpClientValidation: 'true',
        walletConfig: '{"name":"test-wallet"}',
      });
      const result = await getWalletConfig();
      expect(result).toEqual({name: 'test-wallet'});
    });
  });

  describe('signDataForVpPreparation', () => {
    it('should sign ldp_vc format data', async () => {
      const unSignedVpTokens = {
        ldp_vc: {dataToSign: 'base64-data'},
      };

      const result = await signDataForVpPreparation(unSignedVpTokens);
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

      const result = await signDataForVpPreparation(unSignedVpTokens);
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

      await expect(signDataForVpPreparation(unSignedVpTokens)).rejects.toThrow(
        'Canonicalized data to sign is undefined',
      );
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

      const result = await signDataForVpPreparation(unSignedVpTokens);
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

      await expect(signDataForVpPreparation(unSignedVpTokens)).rejects.toThrow(
        'Failed to create signature for UUID',
      );
    });

    it('should handle mso_mdoc format', async () => {
      const unSignedVpTokens = {
        mso_mdoc: {
          docTypeToDeviceAuthenticationBytes: {
            'org.iso.18013.5.1.mDL': 'auth-bytes',
          },
        },
      };
      const result = await signDataForVpPreparation(unSignedVpTokens);
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

      const result = await signDataForVpPreparation(tokens);
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

      const result = await signDataForVpPreparation(tokens);
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

      await expect(signDataForVpPreparation(tokens)).rejects.toThrow(
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

      await expect(signDataForVpPreparation(tokens)).rejects.toThrow(
        'Unsupported VP Token format',
      );
    });
  });

  describe('claimPathPointersToJsonPath', () => {
    it.each([
      {input: ['name'], expected: ['name']},
      {input: ['a', 'b', 'c', 'd'], expected: ['a.b.c.d']},
      {
        input: ['credentialSubject', null, 'givenName'],
        expected: ['credentialSubject[*].givenName'],
      },
      {input: ['items', null], expected: ['items[*]']},
      {input: [null], expected: ['[*]']},
      {input: [null, 'name'], expected: ['[*].name']},
      {
        input: ['credentialSubject', 0, 'givenName'],
        expected: ['credentialSubject[0].givenName'],
      },
      {input: ['items', 0], expected: ['items[0]']},
      {input: [0], expected: ['[0]']},
      {input: [0, 'name'], expected: ['[0].name']},
      {input: ['items', 99, 'value'], expected: ['items[99].value']},
      {input: ['a', null, null, 'b'], expected: ['a[*][*].b']},
      {input: ['a', 0, 1, 'b'], expected: ['a[0][1].b']},
      {input: ['a', null, 0, 'b'], expected: ['a[*][0].b']},
      {input: ['a', 0, null, 'b'], expected: ['a[0][*].b']},
      {
        input: ['root', 'child', null, 'item', 0, 'value'],
        expected: ['root.child[*].item[0].value'],
      },
      {input: ['a', null, 'b', 1, 'c'], expected: ['a[*].b[1].c']},
      {input: ['data', 0, null, 'label'], expected: ['data[0][*].label']},
      {input: [], expected: ['']},
      {input: [null, null], expected: ['[*][*]']},
    ])(
      'should convert claim path pointers to JSONPath correctly',
      ({input, expected}) => {
        expect(
          claimPathPointersToJsonPath(input as Array<string | number | null>),
        ).toEqual(expected);
      },
    );
  });
});
