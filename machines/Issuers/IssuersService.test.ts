const mockHasAlias = jest.fn().mockResolvedValue(true);
const mockStoreData = jest.fn().mockResolvedValue(undefined);
const mockGetData = jest.fn().mockResolvedValue([null, '["ES256"]']);
const mockStoreGenericKey = jest.fn().mockResolvedValue(undefined);

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn().mockResolvedValue({isConnected: true}),
}));
jest.mock('../../shared/CloudBackupAndRestoreUtils', () => ({
  __esModule: true,
  default: {isSignedInAlready: jest.fn().mockResolvedValue(true)},
}));
jest.mock('../../shared/api', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue({
    disableCredentialOfferVcVerification: false,
    vcDownloadMaxRetry: 5,
    vcDownloadPoolInterval: 3000,
  }),
  CACHED_API: {
    fetchIssuers: jest.fn().mockResolvedValue([{issuer_id: 'iss1'}]),
    fetchIssuerWellknownConfig: jest.fn().mockResolvedValue({}),
  },
}));
jest.mock('../../shared/cryptoutil/cryptoUtil', () => ({
  fetchKeyPair: jest
    .fn()
    .mockResolvedValue({publicKey: 'pk', privateKey: 'sk'}),
  generateKeyPair: jest
    .fn()
    .mockResolvedValue({publicKey: 'pk', privateKey: 'sk'}),
}));
jest.mock('../../shared/openId4VCI/Utils', () => ({
  constructProofJWT: jest.fn().mockResolvedValue('proof-jwt'),
  hasKeyPair: jest.fn().mockResolvedValue(true),
  updateCredentialInformation: jest
    .fn()
    .mockResolvedValue({credential: 'cred'}),
  verifyCredentialData: jest.fn().mockResolvedValue({
    isVerified: true,
    verificationMessage: '',
    verificationErrorCode: '',
  }),
}));
jest.mock('../../shared/vciClient/VciClient', () => {
  const instance = {
    getIssuerMetadata: jest
      .fn()
      .mockResolvedValue({credential_endpoint: 'url'}),
    sendProof: jest.fn().mockResolvedValue(undefined),
    sendTxCode: jest.fn().mockResolvedValue(undefined),
    sendIssuerConsent: jest.fn().mockResolvedValue(undefined),
    sendTokenResponse: jest.fn().mockResolvedValue(undefined),
  };
  return {
    __esModule: true,
    default: {getInstance: jest.fn(() => instance)},
  };
});
jest.mock('./IssuersMachine', () => ({}));
jest.mock('../store', () => ({
  setItem: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../shared/constants', () => ({
  API_CACHED_STORAGE_KEYS: {
    fetchIssuerWellknownConfig: jest.fn(host => `wellknown_${host}`),
  },
  AuthorizationType: {IMPLICIT: 'implicit'},
}));
jest.mock('../../shared/Utils', () => ({
  createCacheObject: jest.fn(data => ({data, timestamp: Date.now()})),
}));
jest.mock('../../shared/vcjs/verifyCredential', () => ({
  VerificationResult: {},
}));
jest.mock('@noble/secp256k1', () => ({
  sign: jest.fn(),
}));

import {IssuersService} from './IssuersService';

describe('IssuersService', () => {
  let services: ReturnType<typeof IssuersService>;

  beforeAll(() => {
    const {NativeModules} = require('react-native');
    NativeModules.RNSecureKeystoreModule.hasAlias = mockHasAlias;
    NativeModules.RNSecureKeystoreModule.storeData = mockStoreData;
    NativeModules.RNSecureKeystoreModule.getData = mockGetData;
    NativeModules.RNSecureKeystoreModule.storeGenericKey = mockStoreGenericKey;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockHasAlias.mockResolvedValue(true);
    mockStoreData.mockResolvedValue(undefined);
    mockGetData.mockResolvedValue([null, '["ES256"]']);
    mockStoreGenericKey.mockResolvedValue(undefined);
    services = IssuersService();
  });

  it('should return all expected service definitions', () => {
    const expectedServices = [
      'isUserSignedAlready',
      'downloadIssuersList',
      'checkInternet',
      'downloadIssuerWellknown',
      'getCredentialTypes',
      'downloadCredential',
      'sendTxCode',
      'sendConsentGiven',
      'sendConsentNotGiven',
      'checkIssuerIdInStoredTrustedIssuers',
      'addIssuerToTrustedIssuers',
      'downloadCredentialFromOffer',
      'sendTokenRequest',
      'sendTokenResponse',
      'updateCredential',
      'cacheIssuerWellknown',
      'constructProof',
      'constructAndSendProofForTrustedIssuers',
      'getKeyOrderList',
      'generateKeyPair',
      'getKeyPair',
      'getSelectedKey',
      'verifyCredential',
    ];
    for (const name of expectedServices) {
      expect(services).toHaveProperty(name);
    }
  });

  it('downloadIssuersList returns issuers', async () => {
    const result = await services.downloadIssuersList();
    expect(result).toEqual([{issuer_id: 'iss1'}]);
  });

  it('downloadIssuersList returns empty list when fetchIssuers fails', async () => {
    const {CACHED_API} = require('../../shared/api');
    CACHED_API.fetchIssuers.mockRejectedValueOnce(new Error('network error'));
    await expect(services.downloadIssuersList()).resolves.toEqual([]);
  });

  it('checkInternet returns connection info', async () => {
    const result = await services.checkInternet();
    expect(result).toEqual({isConnected: true});
  });

  it('getCredentialTypes extracts types from selectedIssuer', async () => {
    const context = {
      selectedIssuer: {
        issuer_id: 'iss1',
        credential_configurations_supported: {
          mDL: {format: 'mso_mdoc'},
          IDCard: {format: 'ldp_vc'},
        },
      },
    };
    const result = await services.getCredentialTypes(context);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('mDL');
  });

  it('getCredentialTypes throws if no types', async () => {
    const context = {
      selectedIssuer: {
        issuer_id: 'iss1',
        credential_configurations_supported: {},
      },
    };
    await expect(services.getCredentialTypes(context)).rejects.toThrow(
      'No credential type found',
    );
  });

  it('sendTxCode calls VciClient', async () => {
    const instance =
      require('../../shared/vciClient/VciClient').default.getInstance();
    instance.sendTxCode.mockClear();
    await services.sendTxCode({txCode: '1234'});
    expect(instance.sendTxCode).toHaveBeenCalledWith('1234');
  });

  it('generateKeyPair calls cryptoUtil', async () => {
    const result = await services.generateKeyPair({keyType: 'ES256'});
    expect(result).toEqual({publicKey: 'pk', privateKey: 'sk'});
  });

  it('getSelectedKey returns keyType from context', async () => {
    const result = await services.getSelectedKey({keyType: 'RS256'});
    expect(result).toBe('RS256');
  });

  it('sendConsentGiven calls VciClient', async () => {
    const instance =
      require('../../shared/vciClient/VciClient').default.getInstance();
    instance.sendIssuerConsent.mockClear();
    await services.sendConsentGiven();
    expect(instance.sendIssuerConsent).toHaveBeenCalledWith(true);
  });

  it('isUserSignedAlready calls Cloud.isSignedInAlready', async () => {
    const fn = services.isUserSignedAlready();
    const result = await fn();
    expect(result).toBe(true);
  });

  it('downloadIssuerWellknown fetches metadata and caches it', async () => {
    const context = {
      selectedIssuer: {credential_issuer_host: 'https://issuer.example.com'},
    };
    const result = await services.downloadIssuerWellknown(context);
    expect(result).toEqual({credential_endpoint: 'url'});
    const {setItem} = require('../store');
    expect(setItem).toHaveBeenCalledWith(
      'wellknown_https://issuer.example.com',
      expect.objectContaining({data: {credential_endpoint: 'url'}}),
      '',
    );
  });

  it('downloadIssuerWellknown returns null when metadata is falsy', async () => {
    const instance =
      require('../../shared/vciClient/VciClient').default.getInstance();
    instance.getIssuerMetadata.mockResolvedValueOnce(null);
    const context = {
      selectedIssuer: {credential_issuer_host: 'https://issuer.example.com'},
    };
    const result = await services.downloadIssuerWellknown(context);
    expect(result).toBeNull();
  });

  it('sendConsentNotGiven calls VciClient with false', async () => {
    const instance =
      require('../../shared/vciClient/VciClient').default.getInstance();
    instance.sendIssuerConsent.mockClear();
    await services.sendConsentNotGiven();
    expect(instance.sendIssuerConsent).toHaveBeenCalledWith(false);
  });

  it('checkIssuerIdInStoredTrustedIssuers returns true when alias exists', async () => {
    const context = {credentialOfferCredentialIssuer: 'issuer1'};
    const result = await services.checkIssuerIdInStoredTrustedIssuers(context);
    expect(result).toBe(true);
  });

  it('checkIssuerIdInStoredTrustedIssuers returns false on error', async () => {
    mockHasAlias.mockRejectedValueOnce(new Error('fail'));
    const context = {credentialOfferCredentialIssuer: 'issuer1'};
    const result = await services.checkIssuerIdInStoredTrustedIssuers(context);
    expect(result).toBe(false);
  });

  it('addIssuerToTrustedIssuers stores data in keystore', async () => {
    const context = {credentialOfferCredentialIssuer: 'issuer1'};
    await services.addIssuerToTrustedIssuers(context);
    expect(mockStoreData).toHaveBeenCalledWith('issuer1', 'trusted');
  });

  it('addIssuerToTrustedIssuers throws on error', async () => {
    mockStoreData.mockRejectedValueOnce(new Error('fail'));
    const context = {credentialOfferCredentialIssuer: 'issuer1'};
    await expect(services.addIssuerToTrustedIssuers(context)).rejects.toThrow(
      'Error adding issuer to trusted issuers',
    );
  });

  it('updateCredential calls updateCredentialInformation', async () => {
    const context = {credential: {id: 'vc1'}};
    const result = await services.updateCredential(context);
    expect(result).toEqual({credential: 'cred'});
  });

  it('cacheIssuerWellknown fetches and caches metadata', async () => {
    const context = {credentialOfferCredentialIssuer: 'https://issuer.com'};
    const result = await services.cacheIssuerWellknown(context);
    expect(result).toEqual({credential_endpoint: 'url'});
    const {setItem} = require('../store');
    expect(setItem).toHaveBeenCalled();
  });

  it('cacheIssuerWellknown returns null when no metadata', async () => {
    const instance =
      require('../../shared/vciClient/VciClient').default.getInstance();
    instance.getIssuerMetadata.mockResolvedValueOnce(null);
    const context = {credentialOfferCredentialIssuer: 'https://issuer.com'};
    const result = await services.cacheIssuerWellknown(context);
    expect(result).toBeNull();
  });

  it('constructProof builds and sends proof JWT', async () => {
    const context = {
      publicKey: 'pk',
      privateKey: 'sk',
      credentialOfferCredentialIssuer: 'issuer',
      keyType: 'ES256',
      wellknownKeyTypes: ['ES256'],
      cNonce: 'nonce1',
    };
    const result = await services.constructProof(context);
    expect(result).toBe('proof-jwt');
    const instance =
      require('../../shared/vciClient/VciClient').default.getInstance();
    expect(instance.sendProof).toHaveBeenCalledWith('proof-jwt');
  });

  it('constructAndSendProofForTrustedIssuers builds proof', async () => {
    const context = {
      publicKey: 'pk',
      privateKey: 'sk',
      selectedIssuer: {credential_issuer_host: 'host', client_id: 'client'},
      keyType: 'ES256',
      wellknownKeyTypes: ['ES256'],
      cNonce: 'nonce2',
    };
    const result = await services.constructAndSendProofForTrustedIssuers(
      context,
    );
    expect(result).toBe('proof-jwt');
  });

  it('getKeyOrderList returns parsed key order', async () => {
    mockGetData.mockResolvedValueOnce([null, '["ES256"]']);
    const result = await services.getKeyOrderList();
    expect(result).toEqual(['ES256']);
  });

  it('getKeyPair returns key pair when it exists', async () => {
    const result = await services.getKeyPair({keyType: 'ES256'});
    expect(result).toEqual({publicKey: 'pk', privateKey: 'sk'});
  });

  it('getKeyPair throws when keyType is empty', async () => {
    await expect(services.getKeyPair({keyType: ''})).rejects.toThrow(
      'key type not found',
    );
  });

  it('sendTokenResponse calls VciClient with stringified response', async () => {
    const context = {tokenResponse: {access_token: 'tok'}};
    const instance =
      require('../../shared/vciClient/VciClient').default.getInstance();
    await services.sendTokenResponse(context);
    expect(instance.sendTokenResponse).toHaveBeenCalledWith(
      JSON.stringify({access_token: 'tok'}),
    );
  });

  it('sendTokenResponse throws when tokenResponse is null', async () => {
    const context = {tokenResponse: null};
    await expect(services.sendTokenResponse(context)).rejects.toThrow(
      'Could not send token response',
    );
  });

  it('verifyCredential returns verified result', async () => {
    const context = {
      isCredentialOfferFlow: false,
      verifiableCredential: {credential: 'cred-data'},
      selectedCredentialType: {format: 'ldp_vc'},
    };
    const result = await services.verifyCredential(context);
    expect(result.isVerified).toBe(true);
  });

  it('verifyCredential skips verification when disabled in offer flow config', async () => {
    const getAllConfigurations = require('../../shared/api').default;
    getAllConfigurations.mockResolvedValueOnce({
      disableCredentialOfferVcVerification: true,
    });
    const context = {
      isCredentialOfferFlow: true,
      verifiableCredential: {credential: 'cred-data'},
      selectedCredentialType: {format: 'ldp_vc'},
    };
    const result = await services.verifyCredential(context);
    expect(result.isVerified).toBe(true);
    expect(result.verificationMessage).toBe('');
  });

  it('verifyCredential throws when verification fails', async () => {
    const {verifyCredentialData} = require('../../shared/openId4VCI/Utils');
    verifyCredentialData.mockResolvedValueOnce({
      isVerified: false,
      verificationErrorCode: 'ERR_INVALID_CREDENTIAL',
      verificationMessage: 'fail',
    });
    const context = {
      isCredentialOfferFlow: false,
      verifiableCredential: {credential: 'bad-cred'},
      selectedCredentialType: {format: 'ldp_vc'},
    };
    await expect(services.verifyCredential(context)).rejects.toThrow(
      'ERR_INVALID_CREDENTIAL',
    );
  });

  it('sendTokenRequest calls fetch with form body', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({access_token: 'new-tok'}),
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse) as any;
    const context = {
      tokenRequestObject: {
        tokenEndpoint: 'https://token.example.com/token',
        grantType: 'authorization_code',
        authCode: 'code123',
        clientId: 'client1',
        redirectUri: 'https://redirect.example.com',
        codeVerifier: 'verifier',
      },
      authorizationType: 'other',
    };
    const result = await services.sendTokenRequest(context);
    expect(result).toEqual({access_token: 'new-tok'});
    expect(global.fetch).toHaveBeenCalledWith(
      'https://token.example.com/token',
      expect.objectContaining({method: 'POST'}),
    );
  });

  it('sendTokenRequest uses proxy token endpoint for implicit auth', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({access_token: 'tok'}),
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse) as any;
    const context = {
      tokenRequestObject: {
        tokenEndpoint: 'https://original.example.com/token',
        grantType: 'authorization_code',
      },
      authorizationType: 'implicit',
      selectedIssuer: {token_endpoint: 'https://proxy.example.com/token'},
    };
    const result = await services.sendTokenRequest(context);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://proxy.example.com/token',
      expect.anything(),
    );
  });

  it('sendTokenRequest throws structured error on non-ok response', async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      text: jest
        .fn()
        .mockResolvedValue(
          '{"error":"invalid_request","error_description":"Bad Request"}',
        ),
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse) as any;
    const context = {
      tokenRequestObject: {
        tokenEndpoint: 'https://token.example.com/token',
        grantType: 'authorization_code',
      },
      authorizationType: 'other',
    };
    await expect(services.sendTokenRequest(context)).rejects.toMatchObject({
      serverErrorCode: 'invalid_request',
      serverErrorMessage: 'Bad Request',
    });
  });

  it('sendTokenRequest throws when tokenEndpoint is missing', async () => {
    const context = {
      tokenRequestObject: {grantType: 'code'},
      authorizationType: 'other',
    };
    await expect(services.sendTokenRequest(context)).rejects.toThrow(
      'tokenEndpoint is required',
    );
  });

  it('sendTokenRequest includes correct Content-Type header', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({access_token: 'tok'}),
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse) as any;
    const context = {
      tokenRequestObject: {
        tokenEndpoint: 'https://token.example.com/token',
        grantType: 'authorization_code',
      },
      authorizationType: 'other',
    };
    await services.sendTokenRequest(context);
    const [, opts] = (global.fetch as jest.Mock).mock.calls[0];
    expect(opts.headers['Content-Type']).toBe(
      'application/x-www-form-urlencoded',
    );
  });

  it('sendTokenRequest includes pre-authorized code and tx_code', async () => {
    const mockResponse = {ok: true, json: jest.fn().mockResolvedValue({})};
    global.fetch = jest.fn().mockResolvedValue(mockResponse) as any;
    const context = {
      tokenRequestObject: {
        tokenEndpoint: 'https://token.example.com/token',
        grantType: 'urn:ietf:params:oauth:grant-type:pre-authorized_code',
        preAuthCode: 'pre-auth-123',
        txCode: 'tx-456',
      },
      authorizationType: 'other',
    };
    await services.sendTokenRequest(context);
    const callBody = (global.fetch as jest.Mock).mock.calls[0][1].body;
    expect(callBody).toContain('pre-authorized_code=pre-auth-123');
    expect(callBody).toContain('tx_code=tx-456');
  });

  describe('downloadCredential callback service', () => {
    it('is a function returning an async callback service', () => {
      expect(typeof services.downloadCredential).toBe('function');
      const context = {
        selectedIssuer: {
          credential_issuer_host: 'https://host.com',
          client_id: 'c1',
          redirect_uri: 'redir',
        },
        selectedCredentialType: {id: 'mDL'},
      };
      const service = services.downloadCredential(context);
      expect(typeof service).toBe('function');
    });

    it('inner callbacks send correct events to sendBack', async () => {
      const VciClientMock = require('../../shared/vciClient/VciClient').default;
      const instance = VciClientMock.getInstance();

      // Make requestCredentialFromTrustedIssuer call all the inner callbacks
      instance.requestCredentialFromTrustedIssuer = jest.fn(
        async (
          host,
          credType,
          config,
          getProofJwt,
          navigateToAuth,
          getTokenResp,
          handlePresentation,
          signPresentation,
        ) => {
          navigateToAuth('https://auth.example.com');
          await getProofJwt('issuer1', 'nonce', ['ES256']);
          getTokenResp({endpoint: 'tok'});
          handlePresentation({request: 'pres'});
          signPresentation({request: 'sign'});
          return {credential: 'new-cred'};
        },
      );

      const sendBack = jest.fn();
      const context = {
        selectedIssuer: {
          credential_issuer_host: 'https://host.com',
          client_id: 'c1',
          redirect_uri: 'redir',
        },
        selectedCredentialType: {id: 'mDL'},
      };

      await services.downloadCredential(context)(sendBack);

      expect(sendBack).toHaveBeenCalledWith(
        expect.objectContaining({type: 'AUTH_ENDPOINT_RECEIVED'}),
      );
      expect(sendBack).toHaveBeenCalledWith(
        expect.objectContaining({type: 'PROOF_REQUEST', cNonce: 'nonce'}),
      );
      expect(sendBack).toHaveBeenCalledWith(
        expect.objectContaining({type: 'TOKEN_REQUEST'}),
      );
      expect(sendBack).toHaveBeenCalledWith(
        expect.objectContaining({type: 'PRESENTATION_REQUEST'}),
      );
      expect(sendBack).toHaveBeenCalledWith(
        expect.objectContaining({type: 'SIGN_PRESENTATION'}),
      );
    });
  });

  describe('downloadCredentialFromOffer callback service', () => {
    it('is a function returning an async callback service', () => {
      expect(typeof services.downloadCredentialFromOffer).toBe('function');
      const context = {qrData: 'qr-data'};
      const service = services.downloadCredentialFromOffer(context);
      expect(typeof service).toBe('function');
    });

    it('inner callbacks send correct events to sendBack', async () => {
      const VciClientMock = require('../../shared/vciClient/VciClient').default;
      const instance = VciClientMock.getInstance();

      instance.requestCredentialByOffer = jest.fn(
        async (
          qrData,
          getTxCode,
          getSignedProofJwt,
          navigateToAuth,
          getTokenResp,
          requestTrustConsent,
          handlePresentation,
          signPresentation,
        ) => {
          navigateToAuth('https://auth.example.com/offer');
          await getSignedProofJwt('issuer2', 'nonce2', ['ES256']);
          await getTxCode('numeric', 'Enter code', 6);
          await requestTrustConsent('issuer2', [{name: 'Issuer'}]);
          getTokenResp({endpoint: 'tok2'});
          handlePresentation({request: 'pres2'});
          signPresentation({request: 'sign2'});
          return {credential: 'offer-cred'};
        },
      );

      const sendBack = jest.fn();
      const context = {qrData: 'qr-data'};

      const result = await services.downloadCredentialFromOffer(context)(
        sendBack,
      );

      expect(sendBack).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'AUTH_ENDPOINT_RECEIVED',
          authEndpoint: 'https://auth.example.com/offer',
        }),
      );
      expect(sendBack).toHaveBeenCalledWith(
        expect.objectContaining({type: 'PROOF_REQUEST', cNonce: 'nonce2'}),
      );
      expect(sendBack).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'TX_CODE_REQUEST',
          inputMode: 'numeric',
          length: 6,
        }),
      );
      expect(sendBack).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'TRUST_ISSUER_CONSENT_REQUEST',
          issuer: 'issuer2',
        }),
      );
      expect(sendBack).toHaveBeenCalledWith(
        expect.objectContaining({type: 'TOKEN_REQUEST'}),
      );
      expect(sendBack).toHaveBeenCalledWith(
        expect.objectContaining({type: 'PRESENTATION_REQUEST'}),
      );
      expect(sendBack).toHaveBeenCalledWith(
        expect.objectContaining({type: 'SIGN_PRESENTATION'}),
      );
      expect(result).toEqual({credential: 'offer-cred'});
    });
  });
});
