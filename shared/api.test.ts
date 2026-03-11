import {API_URLS, API, CACHED_API, initializeFaceModel} from './api';
import getAllConfigurations from './api';

// Mock dependencies
const mockRequest = jest.fn();
jest.mock('./request', () => ({
  request: (...args: any[]) => mockRequest(...args),
}));

const mockGetItem = jest.fn();
const mockSetItem = jest.fn();
jest.mock('../machines/store', () => ({
  getItem: (...args: any[]) => mockGetItem(...args),
  setItem: (...args: any[]) => mockSetItem(...args),
}));

jest.mock('./constants', () => ({
  API_CACHED_STORAGE_KEYS: {
    fetchTrustedVerifiers: 'cache_trustedVerifiers',
    fetchIssuers: 'cache_issuers',
    fetchIssuerWellknownConfig: (key: string) => `cache_wellknown_${key}`,
    fetchIssuerAuthorizationServerMetadata: (key: string) =>
      `cache_authServer_${key}`,
  },
  changeCrendetialRegistry: jest.fn(),
  COMMON_PROPS_KEY: 'COMMON_PROPS',
  CACHE_TTL: 86400000,
  updateCacheTTL: jest.fn(),
}));

jest.mock('./InitialConfig', () => ({
  INITIAL_CONFIG: {
    allProperties: {minStorageRequired: 100},
  },
}));

jest.mock('./commonUtil', () => ({
  faceMatchConfig: jest.fn(() => ({model: 'face-model-config'})),
}));

jest.mock('@iriscan/biometric-sdk-react-native', () => ({
  configure: jest.fn(),
}));

jest.mock('./telemetry/TelemetryUtils', () => ({
  getErrorEventData: jest.fn((...args: any[]) => ({type: 'error', args})),
  getImpressionEventData: jest.fn((...args: any[]) => ({
    type: 'impression',
    args,
  })),
  sendErrorEvent: jest.fn(),
  sendImpressionEvent: jest.fn(),
}));

jest.mock('./telemetry/TelemetryConstants', () => ({
  TelemetryConstants: {
    FlowType: {faceModelInit: 'faceModelInit'},
    Screens: {home: 'home'},
    EndEventStatus: {success: 'success'},
    ErrorId: {failure: 'failure'},
    ErrorMessage: {faceModelInitFailed: 'Face model init failed'},
  },
}));

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(async () => ({isConnected: true})),
}));

jest.mock('./Utils', () => ({
  createCacheObject: jest.fn((response: any) => ({
    response,
    cachedTime: Date.now(),
  })),
}));

describe('API_URLS configuration', () => {
  describe('trustedVerifiersList', () => {
    it('should have GET method', () => {
      expect(API_URLS.trustedVerifiersList.method).toBe('GET');
    });

    it('should build correct URL', () => {
      expect(API_URLS.trustedVerifiersList.buildURL()).toBe(
        '/v1/mimoto/verifiers',
      );
    });
  });

  describe('issuersList', () => {
    it('should have GET method', () => {
      expect(API_URLS.issuersList.method).toBe('GET');
    });

    it('should build correct URL', () => {
      expect(API_URLS.issuersList.buildURL()).toBe('/v1/mimoto/issuers');
    });
  });

  describe('issuerConfig', () => {
    it('should have GET method', () => {
      expect(API_URLS.issuerConfig.method).toBe('GET');
    });

    it('should build correct URL with issuer id', () => {
      expect(API_URLS.issuerConfig.buildURL('test-issuer')).toBe(
        '/v1/mimoto/issuers/test-issuer',
      );
    });
  });

  describe('issuerWellknownConfig', () => {
    it('should have GET method', () => {
      expect(API_URLS.issuerWellknownConfig.method).toBe('GET');
    });

    it('should build correct URL with credential issuer', () => {
      expect(
        API_URLS.issuerWellknownConfig.buildURL('https://example.com'),
      ).toBe('https://example.com/.well-known/openid-credential-issuer');
    });
  });

  describe('authorizationServerMetadataConfig', () => {
    it('should have GET method', () => {
      expect(API_URLS.authorizationServerMetadataConfig.method).toBe('GET');
    });

    it('should build correct URL with authorization server URL', () => {
      expect(
        API_URLS.authorizationServerMetadataConfig.buildURL(
          'https://auth.example.com',
        ),
      ).toBe('https://auth.example.com/.well-known/oauth-authorization-server');
    });
  });

  describe('allProperties', () => {
    it('should have GET method', () => {
      expect(API_URLS.allProperties.method).toBe('GET');
    });

    it('should build correct URL', () => {
      expect(API_URLS.allProperties.buildURL()).toBe(
        '/v1/mimoto/allProperties',
      );
    });
  });

  describe('getIndividualId', () => {
    it('should have POST method', () => {
      expect(API_URLS.getIndividualId.method).toBe('POST');
    });

    it('should build correct URL', () => {
      expect(API_URLS.getIndividualId.buildURL()).toBe(
        '/v1/mimoto/aid/get-individual-id',
      );
    });
  });

  describe('reqIndividualOTP', () => {
    it('should have POST method', () => {
      expect(API_URLS.reqIndividualOTP.method).toBe('POST');
    });

    it('should build correct URL', () => {
      expect(API_URLS.reqIndividualOTP.buildURL()).toBe(
        '/v1/mimoto/req/individualId/otp',
      );
    });
  });

  describe('walletBinding', () => {
    it('should have POST method', () => {
      expect(API_URLS.walletBinding.method).toBe('POST');
    });

    it('should build correct URL', () => {
      expect(API_URLS.walletBinding.buildURL()).toBe(
        '/v1/mimoto/wallet-binding',
      );
    });
  });

  describe('bindingOtp', () => {
    it('should have POST method', () => {
      expect(API_URLS.bindingOtp.method).toBe('POST');
    });

    it('should build correct URL', () => {
      expect(API_URLS.bindingOtp.buildURL()).toBe('/v1/mimoto/binding-otp');
    });
  });

  describe('requestOtp', () => {
    it('should have POST method', () => {
      expect(API_URLS.requestOtp.method).toBe('POST');
    });

    it('should build correct URL', () => {
      expect(API_URLS.requestOtp.buildURL()).toBe('/v1/mimoto/req/otp');
    });
  });

  describe('credentialRequest', () => {
    it('should have POST method', () => {
      expect(API_URLS.credentialRequest.method).toBe('POST');
    });

    it('should build correct URL', () => {
      expect(API_URLS.credentialRequest.buildURL()).toBe(
        '/v1/mimoto/credentialshare/request',
      );
    });
  });

  describe('credentialStatus', () => {
    it('should have GET method', () => {
      expect(API_URLS.credentialStatus.method).toBe('GET');
    });

    it('should build correct URL with id', () => {
      expect(API_URLS.credentialStatus.buildURL('request-123')).toBe(
        '/v1/mimoto/credentialshare/request/status/request-123',
      );
    });
  });

  describe('credentialDownload', () => {
    it('should have POST method', () => {
      expect(API_URLS.credentialDownload.method).toBe('POST');
    });

    it('should build correct URL', () => {
      expect(API_URLS.credentialDownload.buildURL()).toBe(
        '/v1/mimoto/credentialshare/download',
      );
    });
  });

  describe('linkTransaction', () => {
    it('should have POST method', () => {
      expect(API_URLS.linkTransaction.method).toBe('POST');
    });

    it('should build correct URL', () => {
      expect(API_URLS.linkTransaction.buildURL()).toBe(
        '/v1/esignet/linked-authorization/v2/link-transaction',
      );
    });
  });

  describe('authenticate', () => {
    it('should have POST method', () => {
      expect(API_URLS.authenticate.method).toBe('POST');
    });

    it('should build correct URL', () => {
      expect(API_URLS.authenticate.buildURL()).toBe(
        '/v1/esignet/linked-authorization/v2/authenticate',
      );
    });
  });

  describe('sendConsent', () => {
    it('should have POST method', () => {
      expect(API_URLS.sendConsent.method).toBe('POST');
    });

    it('should build correct URL', () => {
      expect(API_URLS.sendConsent.buildURL()).toBe(
        '/v1/esignet/linked-authorization/v2/consent',
      );
    });
  });

  describe('googleAccountProfileInfo', () => {
    it('should have GET method', () => {
      expect(API_URLS.googleAccountProfileInfo.method).toBe('GET');
    });

    it('should build correct URL with access token', () => {
      const accessToken = 'test-token-123';
      expect(API_URLS.googleAccountProfileInfo.buildURL(accessToken)).toBe(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`,
      );
    });
  });
});

describe('API object', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchTrustedVerifiersList', () => {
    it('should call request with correct params', async () => {
      mockRequest.mockResolvedValueOnce({response: {verifiers: ['v1']}});
      const result = await API.fetchTrustedVerifiersList();
      expect(mockRequest).toHaveBeenCalledWith('GET', '/v1/mimoto/verifiers');
      expect(result).toEqual({response: {verifiers: ['v1']}});
    });
  });

  describe('fetchIssuers', () => {
    it('should return issuers array from response', async () => {
      mockRequest.mockResolvedValueOnce({
        response: {issuers: [{id: 'issuer1'}, {id: 'issuer2'}]},
      });
      const result = await API.fetchIssuers();
      expect(result).toEqual([{id: 'issuer1'}, {id: 'issuer2'}]);
    });

    it('should return empty array if no issuers', async () => {
      mockRequest.mockResolvedValueOnce({response: {}});
      const result = await API.fetchIssuers();
      expect(result).toEqual([]);
    });
  });

  describe('fetchIssuerConfig', () => {
    it('should call request with issuer id and return response', async () => {
      mockRequest.mockResolvedValueOnce({response: {id: 'test', name: 'Test'}});
      const result = await API.fetchIssuerConfig('test');
      expect(mockRequest).toHaveBeenCalledWith(
        'GET',
        '/v1/mimoto/issuers/test',
      );
      expect(result).toEqual({id: 'test', name: 'Test'});
    });
  });

  describe('fetchIssuerWellknownConfig', () => {
    it('should call request with wellknown URL', async () => {
      mockRequest.mockResolvedValueOnce({
        credential_issuer: 'https://example.com',
      });
      const result = await API.fetchIssuerWellknownConfig(
        'https://example.com',
      );
      expect(mockRequest).toHaveBeenCalledWith(
        'GET',
        'https://example.com/.well-known/openid-credential-issuer',
      );
      expect(result).toEqual({credential_issuer: 'https://example.com'});
    });
  });

  describe('fetchAllProperties', () => {
    it('should return response properties', async () => {
      mockRequest.mockResolvedValueOnce({response: {prop1: 'val1'}});
      const result = await API.fetchAllProperties();
      expect(result).toEqual({prop1: 'val1'});
    });
  });

  describe('getGoogleAccountProfileInfo', () => {
    it('should call request with access token', async () => {
      mockRequest.mockResolvedValueOnce({
        name: 'Test User',
        email: 'test@test.com',
      });
      const result = await API.getGoogleAccountProfileInfo('token123');
      expect(mockRequest).toHaveBeenCalledWith(
        'GET',
        'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=token123',
        undefined,
        '',
      );
      expect(result).toEqual({name: 'Test User', email: 'test@test.com'});
    });
  });
});

describe('CACHED_API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetItem.mockResolvedValue(undefined);
  });

  describe('fetchTrustedVerifiersList', () => {
    it('should fetch from API when cache not preferred', async () => {
      mockRequest.mockResolvedValueOnce({verifiers: ['v1']});
      const result = await CACHED_API.fetchTrustedVerifiersList(false);
      expect(mockRequest).toHaveBeenCalled();
      expect(result).toEqual({verifiers: ['v1']});
    });

    it('should use cache when available and preferred', async () => {
      mockGetItem.mockResolvedValueOnce({
        response: {verifiers: ['cached']},
        cachedTime: Date.now(),
      });
      const result = await CACHED_API.fetchTrustedVerifiersList(true);
      expect(result).toEqual({verifiers: ['cached']});
      expect(mockRequest).not.toHaveBeenCalled();
    });
  });

  describe('fetchIssuers', () => {
    it('should fetch issuers and cache result', async () => {
      mockRequest.mockResolvedValueOnce({
        response: {issuers: [{id: 'i1'}]},
      });
      const result = await CACHED_API.fetchIssuers();
      expect(result).toBeDefined();
    });
  });

  describe('fetchIssuerWellknownConfig', () => {
    it('should fetch wellknown config', async () => {
      mockRequest.mockResolvedValueOnce({
        credential_issuer: 'https://example.com',
      });
      const result = await CACHED_API.fetchIssuerWellknownConfig(
        'issuer1',
        'https://example.com',
        false,
      );
      expect(result).toBeDefined();
    });
  });

  describe('getAllProperties', () => {
    it('should fetch with cache preference', async () => {
      mockGetItem.mockResolvedValueOnce({
        response: {minStorageRequired: 100},
        cachedTime: Date.now(),
      });
      const result = await CACHED_API.getAllProperties(true);
      expect(result).toEqual({minStorageRequired: 100});
    });

    it('should fallback to hardcoded value on error', async () => {
      mockGetItem.mockResolvedValueOnce(null);
      mockRequest.mockRejectedValueOnce(new Error('Network error'));

      // With cache preferred, should try cache first, then API, then fallback
      const result = await CACHED_API.getAllProperties(true);
      expect(result).toEqual({minStorageRequired: 100});
    });
  });
});

describe('getAllConfigurations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetItem.mockResolvedValue(undefined);
  });

  it('should call CACHED_API.getAllProperties with cache preference', async () => {
    mockGetItem.mockResolvedValueOnce({
      response: {prop: 'value'},
      cachedTime: Date.now(),
    });
    const result = await getAllConfigurations(undefined, true);
    expect(result).toEqual({prop: 'value'});
  });

  it('should change credential registry when host provided', async () => {
    const {changeCrendetialRegistry} = require('./constants');
    mockGetItem.mockResolvedValueOnce({
      response: {prop: 'val'},
      cachedTime: Date.now(),
    });
    await getAllConfigurations('https://new-host.com', true);
    expect(changeCrendetialRegistry).toHaveBeenCalledWith(
      'https://new-host.com',
    );
  });
});

describe('initializeFaceModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send impression event on success', async () => {
    const {configure} = require('@iriscan/biometric-sdk-react-native');
    const {sendImpressionEvent} = require('./telemetry/TelemetryUtils');
    configure.mockResolvedValueOnce(true);

    await initializeFaceModel();
    expect(configure).toHaveBeenCalled();
    expect(sendImpressionEvent).toHaveBeenCalled();
  });

  it('should send error event on failure', async () => {
    const {configure} = require('@iriscan/biometric-sdk-react-native');
    const {sendErrorEvent} = require('./telemetry/TelemetryUtils');
    configure.mockResolvedValueOnce(false);

    await initializeFaceModel();
    expect(sendErrorEvent).toHaveBeenCalled();
  });
});
