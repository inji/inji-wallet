import {QrLoginmodel} from './QrLoginModel';
import {VCShareFlowType} from '../../shared/Utils';

describe('QrLoginModel', () => {
  describe('Initial Context', () => {
    const initialContext = QrLoginmodel.initialContext;

    it('should have serviceRefs as empty object', () => {
      expect(initialContext.serviceRefs).toEqual({});
    });

    it('should have selectedVc as empty object', () => {
      expect(initialContext.selectedVc).toEqual({});
    });

    it('should have linkCode as empty string', () => {
      expect(initialContext.linkCode).toBe('');
    });

    it('should have flowType as SIMPLE_SHARE', () => {
      expect(initialContext.flowType).toBe(VCShareFlowType.SIMPLE_SHARE);
    });

    it('should have myVcs as empty array', () => {
      expect(initialContext.myVcs).toEqual([]);
    });

    it('should have thumbprint as empty string', () => {
      expect(initialContext.thumbprint).toBe('');
    });

    it('should have linkTransactionResponse as empty object', () => {
      expect(initialContext.linkTransactionResponse).toEqual({});
    });

    it('should have authFactors as empty array', () => {
      expect(initialContext.authFactors).toEqual([]);
    });

    it('should have authorizeScopes as null', () => {
      expect(initialContext.authorizeScopes).toBeNull();
    });

    it('should have clientName as empty object', () => {
      expect(initialContext.clientName).toEqual({});
    });

    it('should have configs as empty object', () => {
      expect(initialContext.configs).toEqual({});
    });

    it('should have essentialClaims as empty array', () => {
      expect(initialContext.essentialClaims).toEqual([]);
    });

    it('should have linkTransactionId as empty string', () => {
      expect(initialContext.linkTransactionId).toBe('');
    });

    it('should have logoUrl as empty string', () => {
      expect(initialContext.logoUrl).toBe('');
    });

    it('should have voluntaryClaims as empty array', () => {
      expect(initialContext.voluntaryClaims).toEqual([]);
    });

    it('should have selectedVoluntaryClaims as empty array', () => {
      expect(initialContext.selectedVoluntaryClaims).toEqual([]);
    });

    it('should have errorMessage as empty string', () => {
      expect(initialContext.errorMessage).toBe('');
    });

    it('should have domainName as empty string', () => {
      expect(initialContext.domainName).toBe('');
    });

    it('should have consentClaims with name and picture', () => {
      expect(initialContext.consentClaims).toEqual(['name', 'picture']);
      expect(initialContext.consentClaims).toContain('name');
      expect(initialContext.consentClaims).toContain('picture');
    });

    it('should have isSharing as empty object', () => {
      expect(initialContext.isSharing).toEqual({});
    });

    it('should have linkedTransactionId as empty string', () => {
      expect(initialContext.linkedTransactionId).toBe('');
    });

    it('should have showFaceAuthConsent as true', () => {
      expect(initialContext.showFaceAuthConsent).toBe(true);
    });

    it('should have isQrLoginViaDeepLink as false', () => {
      expect(initialContext.isQrLoginViaDeepLink).toBe(false);
    });
  });
});
