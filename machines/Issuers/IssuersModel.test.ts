import {IssuersModel} from './IssuersModel';
import {AuthorizationType} from '../../shared/constants';

describe('IssuersModel', () => {
  describe('Model structure', () => {
    it('should be defined', () => {
      expect(IssuersModel).toBeDefined();
    });

    it('should have initialContext', () => {
      expect(IssuersModel.initialContext).toBeDefined();
    });

    it('should have events', () => {
      expect(IssuersModel.events).toBeDefined();
    });
  });

  describe('Initial Context', () => {
    const initialContext = IssuersModel.initialContext;

    it('should have issuers as empty array', () => {
      expect(initialContext.issuers).toEqual([]);
      expect(Array.isArray(initialContext.issuers)).toBe(true);
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
      expect(Array.isArray(initialContext.supportedCredentialTypes)).toBe(true);
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
      expect(Array.isArray(initialContext.wellknownKeyTypes)).toBe(true);
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

    it('should have all 39 required properties', () => {
      const properties = Object.keys(initialContext);
      expect(properties).toHaveLength(39);
    });
  });

  describe('String properties', () => {
    const context = IssuersModel.initialContext;

    it('all empty string properties should be empty', () => {
      const emptyStrings = [
        context.selectedIssuerId,
        context.qrData,
        context.errorMessage,
        context.verificationErrorMessage,
        context.publicKey,
        context.privateKey,
        context.authEndpoint,
        context.accessToken,
        context.txCode,
        context.cNonce,
        context.issuerLogo,
        context.issuerName,
        context.txCodeInputMode,
        context.txCodeDescription,
        context.credentialConfigurationId,
      ];

      emptyStrings.forEach(str => {
        expect(str).toBe('');
        expect(typeof str).toBe('string');
      });
    });

    it('loadingReason should be displayIssuers', () => {
      expect(context.loadingReason).toBe('displayIssuers');
      expect(typeof context.loadingReason).toBe('string');
    });

    it('keyType should be RS256', () => {
      expect(context.keyType).toBe('RS256');
      expect(typeof context.keyType).toBe('string');
    });
  });

  describe('Array properties', () => {
    const context = IssuersModel.initialContext;

    it('all array properties should be empty arrays', () => {
      const arrays = [
        context.issuers,
        context.supportedCredentialTypes,
        context.wellknownKeyTypes,
      ];

      arrays.forEach(arr => {
        expect(Array.isArray(arr)).toBe(true);
        expect(arr).toHaveLength(0);
      });
    });
  });

  describe('Object properties', () => {
    const context = IssuersModel.initialContext;

    it('all object properties should be empty objects or as specified', () => {
      const emptyObjects = [
        context.selectedIssuer,
        context.selectedIssuerWellknownResponse,
        context.tokenResponse,
        context.selectedCredentialType,
        context.credentialWrapper,
        context.serviceRefs,
        context.vcMetadata,
        context.tokenRequestObject,
        context.OpenId4VPRef,
      ];

      emptyObjects.forEach(obj => {
        expect(typeof obj).toBe('object');
        expect(Object.keys(obj)).toHaveLength(0);
      });
    });
  });

  describe('Boolean properties', () => {
    const context = IssuersModel.initialContext;

    it('all boolean properties should be false initially', () => {
      const booleans = [
        context.authEndpointToOpen,
        context.isTransactionCodeRequested,
        context.isConsentRequested,
        context.isCredentialOfferFlow,
        context.authorizationSuccess,
      ];

      booleans.forEach(bool => {
        expect(bool).toBe(false);
        expect(typeof bool).toBe('boolean');
      });
    });
  });

  describe('Null properties', () => {
    const context = IssuersModel.initialContext;

    it('verifiableCredential should be null', () => {
      expect(context.verifiableCredential).toBeNull();
    });

    it('txCodeLength should be null', () => {
      expect(context.txCodeLength).toBeNull();
    });
  });

  describe('Model events', () => {
    it('should have events object', () => {
      expect(IssuersModel.events).toBeDefined();
      expect(typeof IssuersModel.events).toBe('object');
    });

    it('should have event creators', () => {
      const eventKeys = Object.keys(IssuersModel.events);
      expect(eventKeys.length).toBeGreaterThan(0);
    });
  });

  describe('Property types', () => {
    const context = IssuersModel.initialContext;

    it('should have correct types for all properties', () => {
      expect(typeof context.selectedIssuerId).toBe('string');
      expect(typeof context.qrData).toBe('string');
      expect(typeof context.errorMessage).toBe('string');
      expect(typeof context.loadingReason).toBe('string');
      expect(typeof context.keyType).toBe('string');
      expect(typeof context.authEndpointToOpen).toBe('boolean');
      expect(typeof context.isTransactionCodeRequested).toBe('boolean');
      expect(Array.isArray(context.issuers)).toBe(true);
      expect(typeof context.selectedIssuer).toBe('object');
    });
  });
});
