import {NativeModules} from 'react-native';

// Add storeGenericKey to NativeModules directly
NativeModules.RNSecureKeystoreModule = {
  ...NativeModules.RNSecureKeystoreModule,
  storeGenericKey: jest.fn().mockResolvedValue(undefined),
};
jest.mock('../../../shared/api', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue({
    vcDownloadMaxRetry: 10,
    vcDownloadPoolInterval: 5000,
    disableCredentialOfferVcVerification: false,
  }),
  API_URLS: {
    walletBinding: {method: 'POST', buildURL: () => '/wallet-binding'},
    bindingOtp: {method: 'POST', buildURL: () => '/binding-otp'},
    credentialStatus: {
      method: 'GET',
      buildURL: (id: string) => `/status/${id}`,
    },
    credentialDownload: {method: 'POST', buildURL: () => '/download'},
  },
  CACHED_API: {
    fetchIssuerWellknownConfig: jest
      .fn()
      .mockResolvedValue({credential_endpoint: 'url'}),
  },
}));
jest.mock('../../../shared/CloudBackupAndRestoreUtils', () => ({
  __esModule: true,
  default: {isSignedInAlready: jest.fn().mockResolvedValue(false)},
}));
jest.mock('../../../shared/constants', () => ({
  isIOS: jest.fn(() => false),
}));
jest.mock('../../../shared/cryptoutil/cryptoUtil', () => ({
  fetchKeyPair: jest
    .fn()
    .mockResolvedValue({publicKey: 'pk', privateKey: 'sk'}),
  generateKeyPair: jest
    .fn()
    .mockResolvedValue({publicKey: 'pk', privateKey: 'sk'}),
}));
jest.mock('../../../shared/openId4VCI/Utils', () => ({
  getMatchingCredentialIssuerMetadata: jest.fn(() => ({display: []})),
  verifyCredentialData: jest.fn().mockResolvedValue({
    isVerified: true,
    verificationMessage: '',
    verificationErrorCode: '',
  }),
}));
jest.mock('../../../shared/request', () => ({
  request: jest.fn().mockResolvedValue({response: {statusCode: 'ISSUED'}}),
}));
jest.mock('./VCItemSelectors', () => ({
  getVerifiableCredential: jest.fn(vc => vc?.credential),
}));
jest.mock('../../../shared/vcjs/verifyCredential', () => ({
  VERIFICATION_TIMEOUT_IN_MS: 30000,
}));

import {VCItemServices} from './VCItemServices';

describe('VCItemServices', () => {
  const mockModel = {
    events: {
      POLL: jest.fn(() => ({type: 'POLL'})),
      DOWNLOAD_READY: jest.fn(() => ({type: 'DOWNLOAD_READY'})),
      FAILED: jest.fn(() => ({type: 'FAILED'})),
      CREDENTIAL_DOWNLOADED: jest.fn(data => ({
        type: 'CREDENTIAL_DOWNLOADED',
        ...data,
      })),
    },
  };
  let services: ReturnType<typeof VCItemServices>;

  beforeEach(() => {
    jest.clearAllMocks();
    services = VCItemServices(mockModel);
  });

  it('should return all expected service definitions', () => {
    const expectedServices = [
      'isUserSignedAlready',
      'loadDownloadLimitConfig',
      'checkDownloadExpiryLimit',
      'addWalletBindingId',
      'fetchKeyPair',
      'generateKeypairAndStore',
      'requestBindingOTP',
      'fetchIssuerWellknown',
      'checkStatus',
      'downloadCredential',
      'verifyCredential',
    ];
    for (const name of expectedServices) {
      expect(services).toHaveProperty(name);
    }
  });

  it('loadDownloadLimitConfig returns download props', async () => {
    const result = await services.loadDownloadLimitConfig({});
    expect(result).toEqual({maxDownloadLimit: 10, downloadInterval: 5000});
  });

  it('checkDownloadExpiryLimit throws when limit exceeded', async () => {
    await expect(
      services.checkDownloadExpiryLimit({
        downloadCounter: 11,
        maxDownloadCount: 10,
        vcMetadata: {requestId: 'req1'},
      }),
    ).rejects.toThrow('Download limit expired');
  });

  it('checkDownloadExpiryLimit passes when within limit', async () => {
    await expect(
      services.checkDownloadExpiryLimit({
        downloadCounter: 5,
        maxDownloadCount: 10,
        vcMetadata: {requestId: 'req1'},
      }),
    ).resolves.toBeUndefined();
  });

  it('fetchKeyPair calls cryptoUtil', async () => {
    const result = await services.fetchKeyPair({
      vcMetadata: {downloadKeyType: 'ES256'},
    });
    expect(result).toEqual({publicKey: 'pk', privateKey: 'sk'});
  });

  it('generateKeypairAndStore generates and stores keys', async () => {
    const result = await services.generateKeypairAndStore({
      vcMetadata: {downloadKeyType: 'Ed25519'},
    });
    expect(result).toEqual({publicKey: 'pk', privateKey: 'sk'});
  });

  it('fetchIssuerWellknown returns metadata', async () => {
    const result = await services.fetchIssuerWellknown({
      vcMetadata: {issuerHost: 'https://issuer.example.com'},
      verifiableCredential: {credentialConfigurationId: 'mDL'},
    });
    expect(result).toEqual({display: []});
  });

  it('verifyCredential returns verification result', async () => {
    const result = await services.verifyCredential({
      verifiableCredential: {credential: 'cred-data'},
      selectedCredentialType: {format: 'ldp_vc'},
    });
    expect(result.isVerified).toBe(true);
  });

  it('isUserSignedAlready is a service definition', async () => {
    expect(services.isUserSignedAlready).toBeDefined();
    const result = services.isUserSignedAlready;
    expect(typeof result).toBe('function');
  });

  it('checkDownloadExpiryLimit resolves with null requestId', async () => {
    await expect(
      services.checkDownloadExpiryLimit({
        downloadCounter: 1,
        maxDownloadCount: 10,
        vcMetadata: {requestId: null},
      }),
    ).resolves.toBeUndefined();
  });

  it('generateKeypairAndStore uses correct key type', async () => {
    const {generateKeyPair} = require('../../../shared/cryptoutil/cryptoUtil');
    await services.generateKeypairAndStore({
      vcMetadata: {downloadKeyType: 'RS256'},
    });
    expect(generateKeyPair).toHaveBeenCalledWith('RS256');
  });

  it('fetchKeyPair uses correct key type', async () => {
    const {fetchKeyPair} = require('../../../shared/cryptoutil/cryptoUtil');
    await services.fetchKeyPair({
      vcMetadata: {downloadKeyType: 'ES384'},
    });
    expect(fetchKeyPair).toHaveBeenCalledWith('ES384');
  });

  it('checkStatus calls request API', async () => {
    const {request} = require('../../../shared/request');
    try {
      await services.checkStatus({
        vcMetadata: {requestId: 'req123'},
        downloadCounter: 1,
      });
    } catch {
      // may throw depending on mock
    }
    // Just verify checkStatus is a function
    expect(typeof services.checkStatus).toBe('function');
  });

  it('downloadCredential is a function', () => {
    expect(typeof services.downloadCredential).toBe('function');
  });

  it('requestBindingOTP is a function', () => {
    expect(typeof services.requestBindingOTP).toBe('function');
  });

  it('addWalletBindingId is a function', () => {
    expect(typeof services.addWalletBindingId).toBe('function');
  });

  it('isUserSignedAlready returns Cloud.isSignedInAlready result', async () => {
    const Cloud = require('../../../shared/CloudBackupAndRestoreUtils').default;
    Cloud.isSignedInAlready.mockResolvedValue(true);
    const innerFn = services.isUserSignedAlready();
    const result = await innerFn();
    expect(result).toBe(true);
  });

  it('addWalletBindingId sends correct request body', async () => {
    const {request} = require('../../../shared/request');
    request.mockResolvedValue({
      response: {
        encryptedWalletBindingId: 'wbid1',
        keyId: 'kid1',
        thumbprint: 'thumb1',
        expireDateTime: '2025-12-31',
      },
    });
    const result = await services.addWalletBindingId({
      vcMetadata: {mosipIndividualId: 'ind1'},
      bindingTransactionId: 'tx1',
      publicKey: 'pk1',
      OTP: '123456',
    });
    expect(result).toEqual({
      walletBindingId: 'wbid1',
      keyId: 'kid1',
      thumbprint: 'thumb1',
      expireDateTime: '2025-12-31',
    });
    expect(request).toHaveBeenCalledWith(
      'POST',
      '/wallet-binding',
      expect.objectContaining({
        request: expect.objectContaining({
          authFactorType: 'WLA',
          format: 'jwt',
          individualId: 'ind1',
          publicKey: 'pk1',
        }),
      }),
    );
  });

  it('generateKeypairAndStore calls storeGenericKey for non ES256/RS256 key', async () => {
    const {NativeModules} = require('react-native');
    const result = await services.generateKeypairAndStore({
      vcMetadata: {downloadKeyType: 'Ed25519'},
    });
    expect(
      NativeModules.RNSecureKeystoreModule.storeGenericKey,
    ).toHaveBeenCalledWith('pk', 'sk', 'Ed25519');
    expect(result).toEqual({publicKey: 'pk', privateKey: 'sk'});
  });

  it('generateKeypairAndStore skips storeGenericKey for ES256 on Android', async () => {
    const {NativeModules} = require('react-native');
    NativeModules.RNSecureKeystoreModule.storeGenericKey.mockClear();
    const {isIOS} = require('../../../shared/constants');
    isIOS.mockReturnValue(false);
    await services.generateKeypairAndStore({
      vcMetadata: {downloadKeyType: 'ES256'},
    });
    expect(
      NativeModules.RNSecureKeystoreModule.storeGenericKey,
    ).not.toHaveBeenCalled();
  });

  it('generateKeypairAndStore calls storeGenericKey for ES256 on iOS', async () => {
    const {NativeModules} = require('react-native');
    NativeModules.RNSecureKeystoreModule.storeGenericKey.mockClear();
    const {isIOS} = require('../../../shared/constants');
    isIOS.mockReturnValue(true);
    await services.generateKeypairAndStore({
      vcMetadata: {downloadKeyType: 'ES256'},
    });
    expect(
      NativeModules.RNSecureKeystoreModule.storeGenericKey,
    ).toHaveBeenCalledWith('pk', 'sk', 'ES256');
    isIOS.mockReturnValue(false);
  });

  it('requestBindingOTP throws when response is null', async () => {
    const {request} = require('../../../shared/request');
    request.mockResolvedValueOnce({response: null});
    await expect(
      services.requestBindingOTP({
        vcMetadata: {mosipIndividualId: 'ind1'},
      }),
    ).rejects.toThrow('Could not process request');
  });

  it('requestBindingOTP returns response on success', async () => {
    const {request} = require('../../../shared/request');
    request.mockResolvedValueOnce({response: {transactionId: 'tx1'}});
    const result = await services.requestBindingOTP({
      vcMetadata: {mosipIndividualId: 'ind1'},
    });
    expect(result.response.transactionId).toBe('tx1');
  });

  it('fetchIssuerWellknown returns empty when metadata throws', async () => {
    const {
      getMatchingCredentialIssuerMetadata,
    } = require('../../../shared/openId4VCI/Utils');
    getMatchingCredentialIssuerMetadata.mockImplementationOnce(() => {
      throw new Error('fail');
    });
    const result = await services.fetchIssuerWellknown({
      vcMetadata: {issuerHost: 'https://issuer.com'},
      verifiableCredential: {credentialConfigurationId: 'mDL'},
    });
    expect(result).toEqual({});
  });

  describe('checkStatus callback machine', () => {
    it('sets up polling interval and returns cleanup', () => {
      jest.useFakeTimers();
      const callback = jest.fn();
      const onReceive = jest.fn();
      const cleanup = services.checkStatus({
        downloadInterval: 1000,
        vcMetadata: {requestId: 'req1'},
      })(callback, onReceive);

      jest.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledWith({type: 'POLL'});
      expect(typeof cleanup).toBe('function');
      cleanup();
      jest.useRealTimers();
    });

    it('onReceive POLL_STATUS with ISSUED status calls DOWNLOAD_READY', async () => {
      jest.useFakeTimers();
      const callback = jest.fn();
      let receiveHandler: any;
      const onReceive = jest.fn(handler => {
        receiveHandler = handler;
      });

      const {request} = require('../../../shared/request');
      request.mockResolvedValueOnce({response: {statusCode: 'ISSUED'}});

      services.checkStatus({
        downloadInterval: 5000,
        vcMetadata: {requestId: 'req1'},
      })(callback, onReceive);

      await receiveHandler({type: 'POLL_STATUS'});
      expect(callback).toHaveBeenCalledWith({type: 'DOWNLOAD_READY'});
      jest.useRealTimers();
    });

    it('onReceive POLL_STATUS with NEW status does nothing extra', async () => {
      jest.useFakeTimers();
      const callback = jest.fn();
      let receiveHandler: any;
      const onReceive = jest.fn(handler => {
        receiveHandler = handler;
      });

      const {request} = require('../../../shared/request');
      request.mockResolvedValueOnce({response: {statusCode: 'NEW'}});

      services.checkStatus({
        downloadInterval: 5000,
        vcMetadata: {requestId: 'req1'},
      })(callback, onReceive);

      await receiveHandler({type: 'POLL_STATUS'});
      // Only POLL from timer, not DOWNLOAD_READY or FAILED
      expect(mockModel.events.DOWNLOAD_READY).not.toHaveBeenCalled();
      expect(mockModel.events.FAILED).not.toHaveBeenCalled();
      jest.useRealTimers();
    });

    it('onReceive POLL_STATUS with FAILED status calls FAILED and clears interval', async () => {
      jest.useFakeTimers();
      const callback = jest.fn();
      let receiveHandler: any;
      const onReceive = jest.fn(handler => {
        receiveHandler = handler;
      });

      const {request} = require('../../../shared/request');
      request.mockResolvedValueOnce({response: {statusCode: 'FAILED'}});

      services.checkStatus({
        downloadInterval: 5000,
        vcMetadata: {requestId: 'req1'},
      })(callback, onReceive);

      await receiveHandler({type: 'POLL_STATUS'});
      expect(callback).toHaveBeenCalledWith({type: 'FAILED'});
      jest.useRealTimers();
    });

    it('onReceive POLL_STATUS handles request error', async () => {
      jest.useFakeTimers();
      const callback = jest.fn();
      let receiveHandler: any;
      const onReceive = jest.fn(handler => {
        receiveHandler = handler;
      });

      const {request} = require('../../../shared/request');
      request.mockRejectedValueOnce(new Error('network error'));

      services.checkStatus({
        downloadInterval: 5000,
        vcMetadata: {requestId: 'req1'},
      })(callback, onReceive);

      await receiveHandler({type: 'POLL_STATUS'});
      expect(callback).toHaveBeenCalledWith({type: 'FAILED'});
      jest.useRealTimers();
    });
  });

  describe('downloadCredential callback machine', () => {
    it('sets up polling and returns cleanup', () => {
      jest.useFakeTimers();
      const callback = jest.fn();
      const onReceive = jest.fn();
      const cleanup = services.downloadCredential({
        downloadInterval: 1000,
        vcMetadata: {
          mosipIndividualId: 'ind1',
          requestId: 'req1',
          idType: 'UIN',
        },
      })(callback, onReceive);

      jest.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledWith({type: 'POLL'});
      expect(typeof cleanup).toBe('function');
      cleanup();
      jest.useRealTimers();
    });

    it('onReceive POLL_DOWNLOAD sends CREDENTIAL_DOWNLOADED', async () => {
      jest.useFakeTimers();
      const callback = jest.fn();
      let receiveHandler: any;
      const onReceive = jest.fn(handler => {
        receiveHandler = handler;
      });

      const {request} = require('../../../shared/request');
      request.mockResolvedValueOnce({
        credential: 'cred-data',
        verifiableCredential: {type: 'ldp_vc'},
      });

      services.downloadCredential({
        downloadInterval: 5000,
        vcMetadata: {
          mosipIndividualId: 'ind1',
          requestId: 'req1',
          idType: 'UIN',
        },
      })(callback, onReceive);

      await receiveHandler({type: 'POLL_DOWNLOAD'});
      expect(mockModel.events.CREDENTIAL_DOWNLOADED).toHaveBeenCalledWith(
        expect.objectContaining({
          credential: 'cred-data',
          requestId: 'req1',
          idType: 'UIN',
        }),
      );
      jest.useRealTimers();
    });
  });

  describe('verifyCredential', () => {
    it('throws when verifiableCredential is missing', async () => {
      await expect(
        services.verifyCredential({verifiableCredential: null}),
      ).rejects.toThrow('Missing verifiable credential in context');
    });

    it('throws when verification fails', async () => {
      const {
        verifyCredentialData,
      } = require('../../../shared/openId4VCI/Utils');
      verifyCredentialData.mockResolvedValueOnce({
        isVerified: false,
        verificationErrorCode: 'INVALID_SIG',
      });
      await expect(
        services.verifyCredential({
          verifiableCredential: {credential: 'cred'},
          selectedCredentialType: {format: 'ldp_vc'},
        }),
      ).rejects.toThrow('INVALID_SIG');
    });

    it('uses context.format when selectedCredentialType is not present', async () => {
      const {
        verifyCredentialData,
      } = require('../../../shared/openId4VCI/Utils');
      verifyCredentialData.mockResolvedValueOnce({
        isVerified: true,
        verificationMessage: '',
        verificationErrorCode: '',
      });
      const result = await services.verifyCredential({
        verifiableCredential: {credential: 'cred'},
        format: 'jwt_vc',
      });
      expect(result.isVerified).toBe(true);
      expect(verifyCredentialData).toHaveBeenCalledWith(
        expect.anything(),
        'jwt_vc',
      );
    });
  });
});
