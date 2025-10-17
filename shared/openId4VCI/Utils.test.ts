import {
  Protocols,
  Issuers,
  isActivationNeeded,
  ACTIVATION_NEEDED,
  Issuers_Key_Ref,
} from './Utils';

describe('openId4VCI Utils', () => {
  describe('Protocols', () => {
    it('should have OpenId4VCI protocol defined', () => {
      expect(Protocols.OpenId4VCI).toBe('OpenId4VCI');
    });

    it('should have OTP protocol defined', () => {
      expect(Protocols.OTP).toBe('OTP');
    });
  });

  describe('Issuers', () => {
    it('should have MosipOtp issuer defined', () => {
      expect(Issuers.MosipOtp).toBe('MosipOtp');
    });

    it('should have Mosip issuer defined', () => {
      expect(Issuers.Mosip).toBe('Mosip');
    });
  });

  describe('ACTIVATION_NEEDED', () => {
    it('should contain Mosip', () => {
      expect(ACTIVATION_NEEDED).toContain(Issuers.Mosip);
    });

    it('should contain MosipOtp', () => {
      expect(ACTIVATION_NEEDED).toContain(Issuers.MosipOtp);
    });

    it('should have exactly 2 issuers', () => {
      expect(ACTIVATION_NEEDED).toHaveLength(2);
    });
  });

  describe('isActivationNeeded', () => {
    it('should return true for Mosip issuer', () => {
      expect(isActivationNeeded('Mosip')).toBe(true);
    });

    it('should return true for MosipOtp issuer', () => {
      expect(isActivationNeeded('MosipOtp')).toBe(true);
    });

    it('should return false for other issuers', () => {
      expect(isActivationNeeded('SomeOtherIssuer')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isActivationNeeded('')).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isActivationNeeded(undefined as any)).toBe(false);
    });

    it('should be case sensitive', () => {
      expect(isActivationNeeded('mosip')).toBe(false);
      expect(isActivationNeeded('MOSIP')).toBe(false);
    });
  });

  describe('Issuers_Key_Ref', () => {
    it('should have correct key reference', () => {
      expect(Issuers_Key_Ref).toBe('OpenId4VCI_KeyPair');
    });
  });
});
