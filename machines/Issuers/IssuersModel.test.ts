import {IssuersModel} from './IssuersModel';
import {AuthorizationType} from '../../shared/constants';

describe('IssuersModel', () => {
  describe('Initial Context', () => {
    const initialContext = IssuersModel.initialContext;

    it('should have issuers as empty array', () => {
      expect(initialContext.issuers).toEqual([]);
    });

    it('should have selectedIssuerId as empty string', () => {
      expect(initialContext.selectedIssuerId).toBe('');
    });

    it('should have qrData as empty string', () => {
      expect(initialContext.qrData).toBe('');
    });

    it('should have selectedIssuer as empty object', () => {
      expect(initialContext.selectedIssuer).toEqual({});
    });

    it('should have selectedIssuerWellknownResponse as empty object', () => {
      expect(initialContext.selectedIssuerWellknownResponse).toEqual({});
    });

    it('should have tokenResponse as empty object', () => {
      expect(initialContext.tokenResponse).toEqual({});
    });

    it('should have errorMessage as empty string', () => {
      expect(initialContext.errorMessage).toBe('');
    });

    it('should have loadingReason as displayIssuers', () => {
      expect(initialContext.loadingReason).toBe('displayIssuers');
    });

    it('should have verifiableCredential as null', () => {
      expect(initialContext.verifiableCredential).toBeNull();
    });

    it('should have selectedCredentialType as empty object', () => {
      expect(initialContext.selectedCredentialType).toEqual({});
    });

    it('should have supportedCredentialTypes as empty array', () => {
      expect(initialContext.supportedCredentialTypes).toEqual([]);
    });

    it('should have credentialWrapper as empty object', () => {
      expect(initialContext.credentialWrapper).toEqual({});
    });

    it('should have serviceRefs as empty object', () => {
      expect(initialContext.serviceRefs).toEqual({});
    });

    it('should have verificationErrorMessage as empty string', () => {
      expect(initialContext.verificationErrorMessage).toBe('');
    });

    it('should have publicKey as empty string', () => {
      expect(initialContext.publicKey).toBe('');
    });

    it('should have privateKey as empty string', () => {
      expect(initialContext.privateKey).toBe('');
    });

    it('should have vcMetadata as empty object', () => {
      expect(initialContext.vcMetadata).toEqual({});
    });

    it('should have keyType as RS256', () => {
      expect(initialContext.keyType).toBe('RS256');
    });

    it('should have wellknownKeyTypes as empty array', () => {
      expect(initialContext.wellknownKeyTypes).toEqual([]);
    });

    it('should have authEndpointToOpen as false', () => {
      expect(initialContext.authEndpointToOpen).toBe(false);
    });

    it('should have isTransactionCodeRequested as false', () => {
      expect(initialContext.isTransactionCodeRequested).toBe(false);
    });

    it('should have authEndpoint as empty string', () => {
      expect(initialContext.authEndpoint).toBe('');
    });

    it('should have accessToken as empty string', () => {
      expect(initialContext.accessToken).toBe('');
    });

    it('should have txCode as empty string', () => {
      expect(initialContext.txCode).toBe('');
    });

    it('should have cNonce as empty string', () => {
      expect(initialContext.cNonce).toBe('');
    });

    it('should have isConsentRequested as false', () => {
      expect(initialContext.isConsentRequested).toBe(false);
    });

    it('should have issuerLogo as empty string', () => {
      expect(initialContext.issuerLogo).toBe('');
    });

    it('should have issuerName as empty string', () => {
      expect(initialContext.issuerName).toBe('');
    });

    it('should have txCodeInputMode as empty string', () => {
      expect(initialContext.txCodeInputMode).toBe('');
    });

    it('should have txCodeDescription as empty string', () => {
      expect(initialContext.txCodeDescription).toBe('');
    });

    it('should have txCodeLength as null', () => {
      expect(initialContext.txCodeLength).toBeNull();
    });

    it('should have isCredentialOfferFlow as false', () => {
      expect(initialContext.isCredentialOfferFlow).toBe(false);
    });

    it('should have tokenRequestObject as empty object', () => {
      expect(initialContext.tokenRequestObject).toEqual({});
    });

    it('should have credentialConfigurationId as empty string', () => {
      expect(initialContext.credentialConfigurationId).toBe('');
    });

    it('should have OpenId4VPRef as empty object', () => {
      expect(initialContext.OpenId4VPRef).toEqual({});
    });

    it('should have authorizationType as Implicit', () => {
      expect(initialContext.authorizationType).toBe(AuthorizationType.IMPLICIT);
    });

    it('should have authorizationSuccess as false initially', () => {
      expect(initialContext.authorizationSuccess).toBe(false);
    });
  });
});
