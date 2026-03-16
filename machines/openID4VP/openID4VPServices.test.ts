const mockHasAliasVP = jest.fn().mockResolvedValue(true);
const mockStoreDataVP = jest.fn().mockResolvedValue(undefined);

jest.mock('../../shared/api', () => ({
  CACHED_API: {
    fetchTrustedVerifiersList: jest.fn().mockResolvedValue([{id: 'v1'}]),
  },
}));
jest.mock('../../shared/cryptoutil/cryptoUtil', () => ({
  fetchKeyPair: jest
    .fn()
    .mockResolvedValue({publicKey: 'pk', privateKey: 'sk'}),
}));
jest.mock('../../shared/openId4VCI/Utils', () => ({
  getJWK: jest.fn().mockResolvedValue({kty: 'EC'}),
  hasKeyPair: jest.fn().mockResolvedValue(true),
}));
jest.mock('base64url', () => ({
  __esModule: true,
  default: jest.fn(s => Buffer.from(s).toString('base64')),
}));
jest.mock('../../shared/openID4VP/OpenID4VP', () => ({
  __esModule: true,
  default: {
    authenticateVerifier: jest.fn().mockResolvedValue({response: 'auth'}),
    sendErrorToVerifier: jest.fn().mockResolvedValue(undefined),
    constructUnsignedVPToken: jest.fn(() => 'vpToken'),
    shareVerifiablePresentation: jest.fn().mockResolvedValue(undefined),
  },
}));
jest.mock('../../shared/constants', () => ({
  OVP_ERROR_CODE: {DECLINED: 'declined'},
  OVP_ERROR_MESSAGES: {DECLINED: 'User declined'},
}));
jest.mock('../../shared/Utils', () => ({
  getVerifierKey: jest.fn(() => 'verifierKey'),
  VCShareFlowType: {
    OPENID4VP: 'openid4vp',
    OPENID4VP_AUTHORIZATION: 'openid4vp_auth',
  },
}));
jest.mock('../../shared/openID4VP/OpenID4VPHelper', () => ({
  isClientValidationRequired: jest.fn().mockResolvedValue(true),
  signDataForVpPreparation: jest.fn().mockResolvedValue('signed'),
  signDataForVpPreparationV2: jest.fn().mockResolvedValue('signed-v2'),
}));
jest.mock('../../shared/vciClient/VciClient', () => ({
  __esModule: true,
  default: {
    getInstance: jest.fn(() => ({
      sendSelectedCredentialsForVPSharing: jest
        .fn()
        .mockResolvedValue(undefined),
    })),
  },
}));

import {openID4VPServices, signatureSuite} from './openID4VPServices';

describe('openID4VPServices', () => {
  let services: ReturnType<typeof openID4VPServices>;

  beforeAll(() => {
    const {NativeModules} = require('react-native');
    NativeModules.RNSecureKeystoreModule.hasAlias = mockHasAliasVP;
    NativeModules.RNSecureKeystoreModule.storeData = mockStoreDataVP;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockHasAliasVP.mockResolvedValue(true);
    mockStoreDataVP.mockResolvedValue(undefined);
    services = openID4VPServices();
  });

  it('should export signatureSuite constant', () => {
    expect(signatureSuite).toBe('JsonWebSignature2020');
  });

  it('should return all expected service definitions', () => {
    const expectedServices = [
      'fetchTrustedVerifiers',
      'shouldValidateClient',
      'getAuthenticationResponse',
      'isVerifierTrusted',
      'storeTrustedVerifier',
      'getKeyPair',
      'getSelectedKey',
      'shareDeclineStatus',
      'sendSelectedCredentialsForVP',
      'signVP',
      'sendVP',
    ];
    for (const name of expectedServices) {
      expect(services).toHaveProperty(name);
    }
  });

  it('fetchTrustedVerifiers returns verifiers', async () => {
    const result = await services.fetchTrustedVerifiers();
    expect(result).toEqual([{id: 'v1'}]);
  });

  it('shouldValidateClient returns boolean', async () => {
    const result = await services.shouldValidateClient();
    expect(result).toBe(true);
  });

  it('getKeyPair fetches key pair', async () => {
    const result = await services.getKeyPair({keyType: 'ES256'});
    expect(result).toEqual({publicKey: 'pk', privateKey: 'sk'});
  });

  it('shareDeclineStatus sends error', async () => {
    const OpenID4VP = require('../../shared/openID4VP/OpenID4VP').default;
    await services.shareDeclineStatus();
    expect(OpenID4VP.sendErrorToVerifier).toHaveBeenCalled();
  });

  it('getAuthenticationResponse calls authenticateVerifier', async () => {
    const context = {
      urlEncodedAuthorizationRequest: 'request-data',
      trustedVerifiers: [{id: 'v1'}],
    };
    const fn = services.getAuthenticationResponse(context);
    const result = await fn();
    expect(result).toEqual({response: 'auth'});
  });

  it('isVerifierTrusted returns true for OPENID4VP_AUTHORIZATION flow', async () => {
    const context = {
      flowType: 'openid4vp_auth',
      authenticationResponse: {client_id: 'verifier1'},
    };
    const fn = services.isVerifierTrusted(context);
    const result = await fn();
    expect(result).toBe(true);
  });

  it('isVerifierTrusted checks keystore for non-AUTHORIZATION flow', async () => {
    const context = {
      flowType: 'openid4vp',
      authenticationResponse: {client_id: 'verifier1'},
    };
    const fn = services.isVerifierTrusted(context);
    const result = await fn();
    expect(result).toBe(true);
  });

  it('isVerifierTrusted returns false on keystore error', async () => {
    mockHasAliasVP.mockRejectedValueOnce(new Error('fail'));
    const context = {
      flowType: 'openid4vp',
      authenticationResponse: {client_id: 'verifier1'},
    };
    const fn = services.isVerifierTrusted(context);
    const result = await fn();
    expect(result).toBe(false);
  });

  it('storeTrustedVerifier stores verifier data', async () => {
    const context = {authenticationResponse: {client_id: 'verifier1'}};
    const fn = services.storeTrustedVerifier(context);
    await fn();
    expect(mockStoreDataVP).toHaveBeenCalled();
  });

  it('storeTrustedVerifier returns false on error', async () => {
    mockStoreDataVP.mockRejectedValueOnce(new Error('fail'));
    const context = {authenticationResponse: {client_id: 'verifier1'}};
    const fn = services.storeTrustedVerifier(context);
    const result = await fn();
    expect(result).toBe(false);
  });

  it('getSelectedKey fetches key pair for given type', async () => {
    const result = await services.getSelectedKey({keyType: 'ES256'});
    expect(result).toEqual({publicKey: 'pk', privateKey: 'sk'});
  });

  it('signVP calls signDataForVpPreparationV2', async () => {
    const context = {
      unsignedVPToken: 'token',
      publicKey: 'pk',
      keyType: 'ES256',
    };
    const fn = services.signVP(context);
    const result = await fn();
    expect(result).toBe('signed-v2');
  });

  it('sendVP constructs and shares VP', async () => {
    const OpenID4VP = require('../../shared/openID4VP/OpenID4VP').default;
    OpenID4VP.shareVerifiablePresentation.mockResolvedValueOnce({
      status_code: 200,
    });
    const context = {
      selectedVCs: [{id: 'vc1'}],
      selectedDisclosuresByVc: {},
      publicKey: 'pk',
      keyType: 'ES256',
    };
    const fn = services.sendVP(context);
    const result = await fn();
    expect(result).toEqual({status_code: 200});
  });

  it('sendVP throws on non-200 verifier response', async () => {
    const OpenID4VP = require('../../shared/openID4VP/OpenID4VP').default;
    OpenID4VP.shareVerifiablePresentation.mockResolvedValueOnce({
      status_code: 400,
    });
    const context = {
      selectedVCs: [{id: 'vc1'}],
      selectedDisclosuresByVc: {},
      publicKey: 'pk',
      keyType: 'ES256',
    };
    const fn = services.sendVP(context);
    await expect(fn()).rejects.toThrow('VERIFIER_RESPONSE_ERROR');
  });

  it('getKeyPair returns undefined when no key pair exists', async () => {
    const {hasKeyPair} = require('../../shared/openId4VCI/Utils');
    hasKeyPair.mockResolvedValueOnce(false);
    const result = await services.getKeyPair({keyType: 'ES256'});
    expect(result).toBeUndefined();
  });

  it('sendSelectedCredentialsForVP prepares and sends credentials', async () => {
    const OpenID4VP = require('../../shared/openID4VP/OpenID4VP').default;
    OpenID4VP.prepareCredentialsForVPSharing = jest
      .fn()
      .mockResolvedValue([{id: 'vc1'}]);
    const context = {selectedVCs: [{id: 'vc1'}], selectedDisclosuresByVc: {}};
    const fn = services.sendSelectedCredentialsForVP(context);
    await fn();
    expect(OpenID4VP.prepareCredentialsForVPSharing).toHaveBeenCalled();
  });
});
