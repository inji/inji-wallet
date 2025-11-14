import {IssuersEvents} from './IssuersEvents';
import {CredentialTypes} from '../VerifiableCredential/VCMetaMachine/vc';

describe('IssuersEvents', () => {
  describe('SELECTED_ISSUER', () => {
    it('should create event with id', () => {
      const result = IssuersEvents.SELECTED_ISSUER('issuer-123');
      expect(result).toEqual({id: 'issuer-123'});
    });

    it('should handle empty id', () => {
      const result = IssuersEvents.SELECTED_ISSUER('');
      expect(result).toEqual({id: ''});
    });
  });

  describe('DOWNLOAD_ID', () => {
    it('should create empty event', () => {
      const result = IssuersEvents.DOWNLOAD_ID();
      expect(result).toEqual({});
    });
  });

  describe('BIOMETRIC_CANCELLED', () => {
    it('should create event with requester', () => {
      const result = IssuersEvents.BIOMETRIC_CANCELLED('login');
      expect(result).toEqual({requester: 'login'});
    });

    it('should create event without requester', () => {
      const result = IssuersEvents.BIOMETRIC_CANCELLED();
      expect(result).toEqual({requester: undefined});
    });
  });

  describe('COMPLETED', () => {
    it('should create empty event', () => {
      const result = IssuersEvents.COMPLETED();
      expect(result).toEqual({});
    });
  });

  describe('TRY_AGAIN', () => {
    it('should create empty event', () => {
      const result = IssuersEvents.TRY_AGAIN();
      expect(result).toEqual({});
    });
  });

  describe('RESET_ERROR', () => {
    it('should create empty event', () => {
      const result = IssuersEvents.RESET_ERROR();
      expect(result).toEqual({});
    });
  });

  describe('CHECK_KEY_PAIR', () => {
    it('should create empty event', () => {
      const result = IssuersEvents.CHECK_KEY_PAIR();
      expect(result).toEqual({});
    });
  });

  describe('CANCEL', () => {
    it('should create empty event', () => {
      const result = IssuersEvents.CANCEL();
      expect(result).toEqual({});
    });
  });

  describe('STORE_RESPONSE', () => {
    it('should create event with response', () => {
      const response = {data: 'test'};
      const result = IssuersEvents.STORE_RESPONSE(response);
      expect(result).toEqual({response: {data: 'test'}});
    });

    it('should create event without response', () => {
      const result = IssuersEvents.STORE_RESPONSE();
      expect(result).toEqual({response: undefined});
    });
  });

  describe('STORE_ERROR', () => {
    it('should create event with error and requester', () => {
      const error = new Error('Test error');
      const result = IssuersEvents.STORE_ERROR(error, 'test-requester');
      expect(result.error).toBe(error);
      expect(result.requester).toBe('test-requester');
    });

    it('should create event with error only', () => {
      const error = new Error('Test error');
      const result = IssuersEvents.STORE_ERROR(error);
      expect(result.error).toBe(error);
      expect(result.requester).toBeUndefined();
    });
  });

  describe('RESET_VERIFY_ERROR', () => {
    it('should create empty event', () => {
      const result = IssuersEvents.RESET_VERIFY_ERROR();
      expect(result).toEqual({});
    });
  });

  describe('SELECTED_CREDENTIAL_TYPE', () => {
    it('should create event with credential type', () => {
      const credType = {} as unknown as CredentialTypes;
      const result = IssuersEvents.SELECTED_CREDENTIAL_TYPE(credType);
      expect(result).toEqual({credType});
    });
  });

  describe('SCAN_CREDENTIAL_OFFER_QR_CODE', () => {
    it('should create empty event', () => {
      const result = IssuersEvents.SCAN_CREDENTIAL_OFFER_QR_CODE();
      expect(result).toEqual({});
    });
  });

  describe('QR_CODE_SCANNED', () => {
    it('should create event with data', () => {
      const result = IssuersEvents.QR_CODE_SCANNED('qr-code-data');
      expect(result).toEqual({data: 'qr-code-data'});
    });

    it('should handle JSON data', () => {
      const jsonData = '{"key": "value"}';
      const result = IssuersEvents.QR_CODE_SCANNED(jsonData);
      expect(result).toEqual({data: jsonData});
    });
  });

  describe('AUTH_ENDPOINT_RECEIVED', () => {
    it('should create event with auth endpoint', () => {
      const result = IssuersEvents.AUTH_ENDPOINT_RECEIVED(
        'https://auth.example.com',
      );
      expect(result).toEqual({authEndpoint: 'https://auth.example.com'});
    });
  });

  describe('PROOF_REQUEST', () => {
    it('should create event with all parameters', () => {
      const accessToken = 'token-123';
      const cNonce = 'nonce-456';
      const issuerMetadata = {name: 'Test Issuer'};
      const issuer = {id: 'issuer-1'} as unknown as any;
      const credentialtypes = {} as unknown as CredentialTypes;

      const result = IssuersEvents.PROOF_REQUEST(
        accessToken,
        cNonce,
        issuerMetadata,
        issuer,
        credentialtypes,
      );

      expect(result.accessToken).toBe('token-123');
      expect(result.cNonce).toBe('nonce-456');
      expect(result.issuerMetadata).toEqual({name: 'Test Issuer'});
      expect(result.issuer).toEqual({id: 'issuer-1'});
      expect(result.credentialtypes).toBeDefined();
    });

    it('should handle undefined cNonce', () => {
      const result = IssuersEvents.PROOF_REQUEST(
        'token',
        undefined,
        {},
        {} as unknown as any,
        {} as unknown as CredentialTypes,
      );

      expect(result.cNonce).toBeUndefined();
    });
  });

  describe('TX_CODE_REQUEST', () => {
    it('should create empty event', () => {
      const result = IssuersEvents.TX_CODE_REQUEST();
      expect(result).toEqual({});
    });
  });

  describe('TX_CODE_RECEIVED', () => {
    it('should create event with txCode', () => {
      const result = IssuersEvents.TX_CODE_RECEIVED('TX123456');
      expect(result).toEqual({txCode: 'TX123456'});
    });

    it('should handle empty txCode', () => {
      const result = IssuersEvents.TX_CODE_RECEIVED('');
      expect(result).toEqual({txCode: ''});
    });
  });

  describe('ON_CONSENT_GIVEN', () => {
    it('should create empty event', () => {
      const result = IssuersEvents.ON_CONSENT_GIVEN();
      expect(result).toEqual({});
    });
  });

  describe('TRUST_ISSUER_CONSENT_REQUEST', () => {
    it('should create event with issuerMetadata', () => {
      const issuerMetadata = {
        name: 'Trusted Issuer',
        url: 'https://issuer.example.com',
      };
      const result = IssuersEvents.TRUST_ISSUER_CONSENT_REQUEST(issuerMetadata);
      expect(result).toEqual({issuerMetadata});
    });

    it('should handle empty issuerMetadata', () => {
      const result = IssuersEvents.TRUST_ISSUER_CONSENT_REQUEST({});
      expect(result).toEqual({issuerMetadata: {}});
    });
  });

  describe('TOKEN_REQUEST', () => {
    it('should create event with tokenRequest', () => {
      const tokenRequest = {
        grant_type: 'authorization_code',
        code: 'auth-code-123',
      };
      const result = IssuersEvents.TOKEN_REQUEST(tokenRequest);
      expect(result).toEqual({tokenRequest});
    });

    it('should handle empty tokenRequest', () => {
      const result = IssuersEvents.TOKEN_REQUEST({});
      expect(result).toEqual({tokenRequest: {}});
    });
  });

  describe('IssuersEvents object structure', () => {
    it('should have all expected event creators', () => {
      expect(IssuersEvents.SELECTED_ISSUER).toBeDefined();
      expect(IssuersEvents.DOWNLOAD_ID).toBeDefined();
      expect(IssuersEvents.BIOMETRIC_CANCELLED).toBeDefined();
      expect(IssuersEvents.COMPLETED).toBeDefined();
      expect(IssuersEvents.TRY_AGAIN).toBeDefined();
      expect(IssuersEvents.RESET_ERROR).toBeDefined();
      expect(IssuersEvents.CHECK_KEY_PAIR).toBeDefined();
      expect(IssuersEvents.CANCEL).toBeDefined();
      expect(IssuersEvents.STORE_RESPONSE).toBeDefined();
      expect(IssuersEvents.STORE_ERROR).toBeDefined();
      expect(IssuersEvents.RESET_VERIFY_ERROR).toBeDefined();
      expect(IssuersEvents.SELECTED_CREDENTIAL_TYPE).toBeDefined();
      expect(IssuersEvents.SCAN_CREDENTIAL_OFFER_QR_CODE).toBeDefined();
      expect(IssuersEvents.QR_CODE_SCANNED).toBeDefined();
      expect(IssuersEvents.AUTH_ENDPOINT_RECEIVED).toBeDefined();
      expect(IssuersEvents.PROOF_REQUEST).toBeDefined();
      expect(IssuersEvents.TX_CODE_REQUEST).toBeDefined();
      expect(IssuersEvents.TX_CODE_RECEIVED).toBeDefined();
      expect(IssuersEvents.ON_CONSENT_GIVEN).toBeDefined();
      expect(IssuersEvents.TRUST_ISSUER_CONSENT_REQUEST).toBeDefined();
      expect(IssuersEvents.TOKEN_REQUEST).toBeDefined();
    });

    it('should have all event creators be functions', () => {
      expect(typeof IssuersEvents.SELECTED_ISSUER).toBe('function');
      expect(typeof IssuersEvents.DOWNLOAD_ID).toBe('function');
      expect(typeof IssuersEvents.BIOMETRIC_CANCELLED).toBe('function');
      expect(typeof IssuersEvents.COMPLETED).toBe('function');
      expect(typeof IssuersEvents.TRY_AGAIN).toBe('function');
    });
  });
});
