import {QrLoginmodel} from './QrLoginModel';
import {VCShareFlowType} from '../../shared/Utils';

describe('QrLoginModel', () => {
  describe('Model structure', () => {
    it('should be defined', () => {
      expect(QrLoginmodel).toBeDefined();
    });

    it('should have initialContext', () => {
      expect(QrLoginmodel.initialContext).toBeDefined();
    });

    it('should have events', () => {
      expect(QrLoginmodel.events).toBeDefined();
    });
  });

  describe('Initial Context', () => {
    const initialContext = QrLoginmodel.initialContext;

    it('should have serviceRefs as empty object', () => {
      expect(initialContext.serviceRefs).toEqual({});
      expect(typeof initialContext.serviceRefs).toBe('object');
    });

    it('should have selectedVc as empty object', () => {
      expect(initialContext.selectedVc).toEqual({});
      expect(typeof initialContext.selectedVc).toBe('object');
    });

    it('should have linkCode as empty string', () => {
      expect(initialContext.linkCode).toBe('');
      expect(typeof initialContext.linkCode).toBe('string');
    });

    it('should have flowType as SIMPLE_SHARE', () => {
      expect(initialContext.flowType).toBe(VCShareFlowType.SIMPLE_SHARE);
    });

    it('should have myVcs as empty array', () => {
      expect(initialContext.myVcs).toEqual([]);
      expect(Array.isArray(initialContext.myVcs)).toBe(true);
      expect(initialContext.myVcs).toHaveLength(0);
    });

    it('should have thumbprint as empty string', () => {
      expect(initialContext.thumbprint).toBe('');
      expect(typeof initialContext.thumbprint).toBe('string');
    });

    it('should have linkTransactionResponse as empty object', () => {
      expect(initialContext.linkTransactionResponse).toEqual({});
      expect(typeof initialContext.linkTransactionResponse).toBe('object');
    });

    it('should have authFactors as empty array', () => {
      expect(initialContext.authFactors).toEqual([]);
      expect(Array.isArray(initialContext.authFactors)).toBe(true);
    });

    it('should have authorizeScopes as null', () => {
      expect(initialContext.authorizeScopes).toBeNull();
    });

    it('should have clientName as empty object', () => {
      expect(initialContext.clientName).toEqual({});
      expect(typeof initialContext.clientName).toBe('object');
    });

    it('should have configs as empty object', () => {
      expect(initialContext.configs).toEqual({});
      expect(typeof initialContext.configs).toBe('object');
    });

    it('should have essentialClaims as empty array', () => {
      expect(initialContext.essentialClaims).toEqual([]);
      expect(Array.isArray(initialContext.essentialClaims)).toBe(true);
    });

    it('should have linkTransactionId as empty string', () => {
      expect(initialContext.linkTransactionId).toBe('');
      expect(typeof initialContext.linkTransactionId).toBe('string');
    });

    it('should have logoUrl as empty string', () => {
      expect(initialContext.logoUrl).toBe('');
      expect(typeof initialContext.logoUrl).toBe('string');
    });

    it('should have voluntaryClaims as empty array', () => {
      expect(initialContext.voluntaryClaims).toEqual([]);
      expect(Array.isArray(initialContext.voluntaryClaims)).toBe(true);
    });

    it('should have selectedVoluntaryClaims as empty array', () => {
      expect(initialContext.selectedVoluntaryClaims).toEqual([]);
      expect(Array.isArray(initialContext.selectedVoluntaryClaims)).toBe(true);
    });

    it('should have errorMessage as empty string', () => {
      expect(initialContext.errorMessage).toBe('');
      expect(typeof initialContext.errorMessage).toBe('string');
    });

    it('should have domainName as empty string', () => {
      expect(initialContext.domainName).toBe('');
      expect(typeof initialContext.domainName).toBe('string');
    });

    it('should have consentClaims with name and picture', () => {
      expect(initialContext.consentClaims).toEqual(['name', 'picture']);
      expect(Array.isArray(initialContext.consentClaims)).toBe(true);
      expect(initialContext.consentClaims).toHaveLength(2);
      expect(initialContext.consentClaims).toContain('name');
      expect(initialContext.consentClaims).toContain('picture');
    });

    it('should have isSharing as empty object', () => {
      expect(initialContext.isSharing).toEqual({});
      expect(typeof initialContext.isSharing).toBe('object');
    });

    it('should have linkedTransactionId as empty string', () => {
      expect(initialContext.linkedTransactionId).toBe('');
      expect(typeof initialContext.linkedTransactionId).toBe('string');
    });

    it('should have showFaceAuthConsent as true', () => {
      expect(initialContext.showFaceAuthConsent).toBe(true);
      expect(typeof initialContext.showFaceAuthConsent).toBe('boolean');
    });

    it('should have isQrLoginViaDeepLink as false', () => {
      expect(initialContext.isQrLoginViaDeepLink).toBe(false);
      expect(typeof initialContext.isQrLoginViaDeepLink).toBe('boolean');
    });

    it('should have all required properties', () => {
      const requiredProps = [
        'serviceRefs',
        'selectedVc',
        'linkCode',
        'flowType',
        'myVcs',
        'thumbprint',
        'linkTransactionResponse',
        'authFactors',
        'authorizeScopes',
        'clientName',
        'configs',
        'essentialClaims',
        'linkTransactionId',
        'logoUrl',
        'voluntaryClaims',
        'selectedVoluntaryClaims',
        'errorMessage',
        'domainName',
        'consentClaims',
        'isSharing',
        'linkedTransactionId',
        'showFaceAuthConsent',
        'isQrLoginViaDeepLink',
      ];

      requiredProps.forEach(prop => {
        expect(initialContext).toHaveProperty(prop);
      });
    });

    it('should have exactly 23 properties in initial context', () => {
      const propertyCount = Object.keys(initialContext).length;
      expect(propertyCount).toBe(23);
    });
  });

  describe('Model events', () => {
    it('should have events object defined', () => {
      expect(QrLoginmodel.events).toBeDefined();
      expect(typeof QrLoginmodel.events).toBe('object');
    });

    it('should have SELECT_VC event', () => {
      expect(QrLoginmodel.events.SELECT_VC).toBeDefined();
      expect(typeof QrLoginmodel.events.SELECT_VC).toBe('function');
    });

    it('should have SCANNING_DONE event', () => {
      expect(QrLoginmodel.events.SCANNING_DONE).toBeDefined();
      expect(typeof QrLoginmodel.events.SCANNING_DONE).toBe('function');
    });

    it('should have STORE_RESPONSE event', () => {
      expect(QrLoginmodel.events.STORE_RESPONSE).toBeDefined();
      expect(typeof QrLoginmodel.events.STORE_RESPONSE).toBe('function');
    });

    it('should have STORE_ERROR event', () => {
      expect(QrLoginmodel.events.STORE_ERROR).toBeDefined();
      expect(typeof QrLoginmodel.events.STORE_ERROR).toBe('function');
    });

    it('should have TOGGLE_CONSENT_CLAIM event', () => {
      expect(QrLoginmodel.events.TOGGLE_CONSENT_CLAIM).toBeDefined();
      expect(typeof QrLoginmodel.events.TOGGLE_CONSENT_CLAIM).toBe('function');
    });

    it('should have DISMISS event', () => {
      expect(QrLoginmodel.events.DISMISS).toBeDefined();
      expect(typeof QrLoginmodel.events.DISMISS).toBe('function');
    });

    it('should have CONFIRM event', () => {
      expect(QrLoginmodel.events.CONFIRM).toBeDefined();
      expect(typeof QrLoginmodel.events.CONFIRM).toBe('function');
    });

    it('should have GET event', () => {
      expect(QrLoginmodel.events.GET).toBeDefined();
      expect(typeof QrLoginmodel.events.GET).toBe('function');
    });

    it('should have VERIFY event', () => {
      expect(QrLoginmodel.events.VERIFY).toBeDefined();
      expect(typeof QrLoginmodel.events.VERIFY).toBe('function');
    });

    it('should have CANCEL event', () => {
      expect(QrLoginmodel.events.CANCEL).toBeDefined();
      expect(typeof QrLoginmodel.events.CANCEL).toBe('function');
    });

    it('should have FACE_VALID event', () => {
      expect(QrLoginmodel.events.FACE_VALID).toBeDefined();
      expect(typeof QrLoginmodel.events.FACE_VALID).toBe('function');
    });

    it('should have FACE_INVALID event', () => {
      expect(QrLoginmodel.events.FACE_INVALID).toBeDefined();
      expect(typeof QrLoginmodel.events.FACE_INVALID).toBe('function');
    });

    it('should have RETRY_VERIFICATION event', () => {
      expect(QrLoginmodel.events.RETRY_VERIFICATION).toBeDefined();
      expect(typeof QrLoginmodel.events.RETRY_VERIFICATION).toBe('function');
    });

    it('should have FACE_VERIFICATION_CONSENT event', () => {
      expect(QrLoginmodel.events.FACE_VERIFICATION_CONSENT).toBeDefined();
      expect(typeof QrLoginmodel.events.FACE_VERIFICATION_CONSENT).toBe(
        'function',
      );
    });
  });

  describe('String properties', () => {
    const context = QrLoginmodel.initialContext;

    it('all string properties should be empty strings initially', () => {
      const stringProps = [
        context.linkCode,
        context.thumbprint,
        context.linkTransactionId,
        context.logoUrl,
        context.errorMessage,
        context.domainName,
        context.linkedTransactionId,
      ];

      stringProps.forEach(prop => {
        expect(prop).toBe('');
        expect(typeof prop).toBe('string');
      });
    });
  });

  describe('Array properties', () => {
    const context = QrLoginmodel.initialContext;

    it('empty array properties should have length 0', () => {
      const emptyArrays = [
        context.myVcs,
        context.authFactors,
        context.essentialClaims,
        context.voluntaryClaims,
        context.selectedVoluntaryClaims,
      ];

      emptyArrays.forEach(arr => {
        expect(Array.isArray(arr)).toBe(true);
        expect(arr).toHaveLength(0);
      });
    });

    it('consentClaims should have length 2', () => {
      expect(context.consentClaims).toHaveLength(2);
      expect(Array.isArray(context.consentClaims)).toBe(true);
    });
  });

  describe('Object properties', () => {
    const context = QrLoginmodel.initialContext;

    it('empty object properties should have no keys', () => {
      const emptyObjects = [
        context.serviceRefs,
        context.selectedVc,
        context.linkTransactionResponse,
        context.clientName,
        context.configs,
        context.isSharing,
      ];

      emptyObjects.forEach(obj => {
        expect(typeof obj).toBe('object');
        expect(Object.keys(obj)).toHaveLength(0);
      });
    });
  });

  describe('Boolean properties', () => {
    const context = QrLoginmodel.initialContext;

    it('showFaceAuthConsent should be true', () => {
      expect(context.showFaceAuthConsent).toBe(true);
    });

    it('isQrLoginViaDeepLink should be false', () => {
      expect(context.isQrLoginViaDeepLink).toBe(false);
    });
  });
});
