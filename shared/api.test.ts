import {API_URLS} from './api';

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
