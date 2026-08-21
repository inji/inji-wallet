import {UnsignedVPToken} from './openid4vp.types';

const mockCreateSignatureRSA = jest.fn(() => Promise.resolve('rsa-sig'));
const mockCreateSignatureECR1 = jest.fn(() => Promise.resolve('es256-sig'));
const mockCreateSignatureECK1 = jest.fn(() => Promise.resolve('es256k-sig'));
const mockCreateSignatureED = jest.fn(() => Promise.resolve('eddsa-sig'));
const mockFetchKeyPair = jest.fn(() =>
  Promise.resolve({privateKey: 'pk', publicKey: 'pub'}),
);

jest.mock('../cryptoutil/cryptoUtil', () => ({
  createSignatureRSA: mockCreateSignatureRSA,
  createSignatureECR1: mockCreateSignatureECR1,
  createSignatureECK1: mockCreateSignatureECK1,
  createSignatureED: mockCreateSignatureED,
  fetchKeyPair: mockFetchKeyPair,
}));

jest.mock('../Utils', () => ({
  base64ToByteArray: jest.fn((_: string) => new Uint8Array([1, 2, 3])),
  canonicalize2: jest.fn(() => Promise.resolve('canonicalized')),
  parseJSON: jest.fn((json: string) => JSON.parse(json)),
}));

const mockGetAllConfigurations = jest.fn(
  (): Promise<{
    openid4vpClientValidation: string;
    openid4vpWalletConfig?: string | null;
  }> =>
    Promise.resolve({
      openid4vpClientValidation: 'false',
      openid4vpWalletConfig: null,
    }),
);

const mockFetchTrustedVerifiersList = jest.fn();

jest.mock('../api', () => ({
  __esModule: true,
  default: mockGetAllConfigurations,
  CACHED_API: {
    fetchTrustedVerifiersList: mockFetchTrustedVerifiersList,
  },
}));

import {
  getWalletConfig,
  signDataForVpPreparation,
  claimPathPointersToJsonPath,
} from './OpenID4VPHelper';
import {defaultWalletConfig} from "./walletConfig/WalletConfig";

describe('OpenID4VPHelper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllConfigurations.mockResolvedValue({
      openid4vpClientValidation: 'true',
      walletConfig: null,
    });
    mockFetchTrustedVerifiersList.mockResolvedValue({
      response: {
        verifiers: [],
      },
    });
  });

  describe('getWalletConfig', () => {
    it('returns null when no wallet metadata in config', async () => {
      const result = await getWalletConfig();
      expect(result).toEqual(defaultWalletConfig);
    });

    it('returns parsed wallet metadata when present', async () => {
      mockGetAllConfigurations.mockResolvedValue({
        openid4vpClientValidation: 'true',
        openid4vpWalletConfig: '{"name":"test-wallet"}',
      });
      const result = await getWalletConfig();
      expect(result).toEqual({name: 'test-wallet', "validate_trusted_verifier": true, "trusted_verifiers": []});
    });

    it('returns wallet config with populated wallet config, trusted verifiers and validate pre-registered verifier as per the config', async () => {
      const mockVerifiers = [
        {
          client_id: 'mock-client',
          redirect_uris: ['https://example.com/redirect'],
          response_uris: ['https://example.com/verifier/vp-response'],
          jwks_uri: 'https://example.com/.well-known/jwks.json',
          allow_unsigned_request: true,
          spec_version: 'v1',
        },
      ];

      mockGetAllConfigurations.mockResolvedValue({
        openid4vpClientValidation: 'true',
        openid4vpWalletConfig: '{"name":"test-wallet"}',
      });

      mockFetchTrustedVerifiersList.mockResolvedValue({
        response: {
          verifiers: mockVerifiers,
        },
      });

      const result = await getWalletConfig();

      expect(result).toEqual({
        name: 'test-wallet',
        validate_trusted_verifier: true,
        trusted_verifiers: mockVerifiers,
      });
      expect(mockFetchTrustedVerifiersList).toHaveBeenCalled();
    })
  });

  describe('signDataForVpPreparation', () => {
    const buildToken = (
      signatureAlgorithm: string,
      format: string = 'ldp_vc',
      dataToSign: string = 'data',
    ): UnsignedVPToken => ({
      format,
      holderKeyReference: 'key-ref',
      signatureAlgorithm,
      dataToSign,
    });

    it.each([
      {
        signatureAlgorithm: 'EdDSA',
        expectedSignedData: 'eddsa-sig',
        expectedKeyType: 'Ed25519',
        expectedSigner: mockCreateSignatureED,
        nonExpectedSigners: [
          mockCreateSignatureRSA,
          mockCreateSignatureECR1,
          mockCreateSignatureECK1,
        ],
      },
      {
        signatureAlgorithm: 'ES256',
        expectedSignedData: 'es256-sig',
        expectedKeyType: 'ES256',
        expectedSigner: mockCreateSignatureECR1,
        nonExpectedSigners: [
          mockCreateSignatureRSA,
          mockCreateSignatureED,
          mockCreateSignatureECK1,
        ],
      },
      {
        signatureAlgorithm: 'ES256K',
        expectedSignedData: 'es256k-sig',
        expectedKeyType: 'ES256K',
        expectedSigner: mockCreateSignatureECK1,
        nonExpectedSigners: [
          mockCreateSignatureRSA,
          mockCreateSignatureED,
          mockCreateSignatureECR1,
        ],
      },
      {
        signatureAlgorithm: 'RS256',
        expectedSignedData: 'rsa-sig',
        expectedKeyType: 'RS256',
        expectedSigner: mockCreateSignatureRSA,
        nonExpectedSigners: [
          mockCreateSignatureED,
          mockCreateSignatureECR1,
          mockCreateSignatureECK1,
        ],
      },
    ])(
      'calls the correct signer for $signatureAlgorithm',
      async ({
        signatureAlgorithm,
        expectedSignedData,
        expectedKeyType,
        expectedSigner,
        nonExpectedSigners,
      }) => {
        const result = await signDataForVpPreparation([
          buildToken(signatureAlgorithm, 'ldp_vc'),
        ]);

        expect(result).toEqual([{signedData: expectedSignedData}]);
        expect(mockFetchKeyPair).toHaveBeenCalledWith(expectedKeyType);
        expect(expectedSigner).toHaveBeenCalledTimes(1);
        nonExpectedSigners.forEach(signer =>
          expect(signer).not.toHaveBeenCalled(),
        );
      },
    );

    it('uses algorithm-driven signing regardless of format with cached keys', async () => {
      const result = await signDataForVpPreparation([
        buildToken('EdDSA', 'ldp_vc', 'data-1'),
        buildToken('EdDSA', 'mso_mdoc', 'data-2'),
        buildToken('EdDSA', 'dc+sd_jwt', 'data-3'),
      ]);

      expect(result).toEqual([
        {signedData: 'eddsa-sig'},
        {signedData: 'eddsa-sig'},
        {signedData: 'eddsa-sig'},
      ]);
      expect(mockCreateSignatureED).toHaveBeenCalledTimes(3);
      expect(mockFetchKeyPair).toHaveBeenCalledTimes(1);
      expect(mockFetchKeyPair).toHaveBeenCalledWith('Ed25519');
      expect(mockCreateSignatureRSA).not.toHaveBeenCalled();
      expect(mockCreateSignatureECR1).not.toHaveBeenCalled();
      expect(mockCreateSignatureECK1).not.toHaveBeenCalled();
    });
  });

  describe('claimPathPointersToJsonPath', () => {
    it.each([
      {input: ['name'], expected: 'name'},
      {input: ['a', 'b', 'c', 'd'], expected: 'a.b.c.d'},
      {
        input: ['credentialSubject', null, 'givenName'],
        expected: 'credentialSubject[*].givenName',
      },
      {input: ['items', null], expected: 'items[*]'},
      {input: [null], expected: '[*]'},
      {input: [null, 'name'], expected: '[*].name'},
      {
        input: ['credentialSubject', 0, 'givenName'],
        expected: 'credentialSubject[0].givenName',
      },
      {input: ['items', 0], expected: 'items[0]'},
      {input: [0], expected: '[0]'},
      {input: [0, 'name'], expected: '[0].name'},
      {input: ['items', 99, 'value'], expected: 'items[99].value'},
      {input: ['a', null, null, 'b'], expected: 'a[*][*].b'},
      {input: ['a', 0, 1, 'b'], expected: 'a[0][1].b'},
      {input: ['a', null, 0, 'b'], expected: 'a[*][0].b'},
      {input: ['a', 0, null, 'b'], expected: 'a[0][*].b'},
      {
        input: ['root', 'child', null, 'item', 0, 'value'],
        expected: 'root.child[*].item[0].value',
      },
      {input: ['a', null, 'b', 1, 'c'], expected: 'a[*].b[1].c'},
      {input: ['data', 0, null, 'label'], expected: 'data[0][*].label'},
      {input: [], expected: ''},
      {input: [null, null], expected: '[*][*]'},
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
