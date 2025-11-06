import {VCItemModel} from './VCItemModel';

describe('VCItemModel', () => {
  describe('Model structure', () => {
    it('should be defined', () => {
      expect(VCItemModel).toBeDefined();
    });

    it('should have initialContext', () => {
      expect(VCItemModel.initialContext).toBeDefined();
    });

    it('should have events', () => {
      expect(VCItemModel.events).toBeDefined();
    });
  });

  describe('Initial Context', () => {
    const initialContext = VCItemModel.initialContext;

    it('should have serviceRefs as empty object', () => {
      expect(initialContext.serviceRefs).toEqual({});
      expect(typeof initialContext.serviceRefs).toBe('object');
    });

    it('should have vcMetadata as empty object', () => {
      expect(initialContext.vcMetadata).toEqual({});
      expect(typeof initialContext.vcMetadata).toBe('object');
    });

    it('should have generatedOn as Date instance', () => {
      expect(initialContext.generatedOn).toBeInstanceOf(Date);
    });

    it('should have credential as null', () => {
      expect(initialContext.credential).toBeNull();
    });

    it('should have verifiableCredential as null', () => {
      expect(initialContext.verifiableCredential).toBeNull();
    });

    it('should have hashedId as empty string', () => {
      expect(initialContext.hashedId).toBe('');
      expect(typeof initialContext.hashedId).toBe('string');
    });

    it('should have publicKey as empty string', () => {
      expect(initialContext.publicKey).toBe('');
      expect(typeof initialContext.publicKey).toBe('string');
    });

    it('should have privateKey as empty string', () => {
      expect(initialContext.privateKey).toBe('');
      expect(typeof initialContext.privateKey).toBe('string');
    });

    it('should have OTP as empty string', () => {
      expect(initialContext.OTP).toBe('');
      expect(typeof initialContext.OTP).toBe('string');
    });

    it('should have error as empty string', () => {
      expect(initialContext.error).toBe('');
      expect(typeof initialContext.error).toBe('string');
    });

    it('should have bindingTransactionId as empty string', () => {
      expect(initialContext.bindingTransactionId).toBe('');
      expect(typeof initialContext.bindingTransactionId).toBe('string');
    });

    it('should have requestId as empty string', () => {
      expect(initialContext.requestId).toBe('');
      expect(typeof initialContext.requestId).toBe('string');
    });

    it('should have downloadCounter as 0', () => {
      expect(initialContext.downloadCounter).toBe(0);
      expect(typeof initialContext.downloadCounter).toBe('number');
    });

    it('should have maxDownloadCount as null', () => {
      expect(initialContext.maxDownloadCount).toBeNull();
    });

    it('should have downloadInterval as null', () => {
      expect(initialContext.downloadInterval).toBeNull();
    });

    it('should have walletBindingResponse as null', () => {
      expect(initialContext.walletBindingResponse).toBeNull();
    });

    it('should have isMachineInKebabPopupState as false', () => {
      expect(initialContext.isMachineInKebabPopupState).toBe(false);
      expect(typeof initialContext.isMachineInKebabPopupState).toBe('boolean');
    });

    it('should have communicationDetails as null', () => {
      expect(initialContext.communicationDetails).toBeNull();
    });

    it('should have verificationStatus as null', () => {
      expect(initialContext.verificationStatus).toBeNull();
    });

    it('should have showVerificationStatusBanner as false', () => {
      expect(initialContext.showVerificationStatusBanner).toBe(false);
      expect(typeof initialContext.showVerificationStatusBanner).toBe(
        'boolean',
      );
    });

    it('should have wellknownResponse as empty object', () => {
      expect(initialContext.wellknownResponse).toEqual({});
      expect(typeof initialContext.wellknownResponse).toBe('object');
    });

    it('should have all 24 required properties', () => {
      const properties = Object.keys(initialContext);
      expect(properties).toHaveLength(24);
    });
  });

  describe('String properties', () => {
    const context = VCItemModel.initialContext;

    it('all empty string properties should be empty', () => {
      const emptyStrings = [
        context.hashedId,
        context.publicKey,
        context.privateKey,
        context.OTP,
        context.error,
        context.bindingTransactionId,
        context.requestId,
      ];

      emptyStrings.forEach(str => {
        expect(str).toBe('');
        expect(typeof str).toBe('string');
      });
    });
  });

  describe('Object properties', () => {
    const context = VCItemModel.initialContext;

    it('empty object properties should be empty objects', () => {
      const emptyObjects = [
        context.serviceRefs,
        context.vcMetadata,
        context.wellknownResponse,
      ];

      emptyObjects.forEach(obj => {
        expect(typeof obj).toBe('object');
        expect(Object.keys(obj)).toHaveLength(0);
      });
    });
  });

  describe('Boolean properties', () => {
    const context = VCItemModel.initialContext;

    it('isMachineInKebabPopupState should be false', () => {
      expect(context.isMachineInKebabPopupState).toBe(false);
      expect(typeof context.isMachineInKebabPopupState).toBe('boolean');
    });

    it('showVerificationStatusBanner should be false', () => {
      expect(context.showVerificationStatusBanner).toBe(false);
      expect(typeof context.showVerificationStatusBanner).toBe('boolean');
    });

    it('all boolean properties should be false initially', () => {
      const booleans = [
        context.isMachineInKebabPopupState,
        context.showVerificationStatusBanner,
      ];

      booleans.forEach(bool => {
        expect(bool).toBe(false);
        expect(typeof bool).toBe('boolean');
      });
    });
  });

  describe('Null properties', () => {
    const context = VCItemModel.initialContext;

    it('credential should be null', () => {
      expect(context.credential).toBeNull();
    });

    it('verifiableCredential should be null', () => {
      expect(context.verifiableCredential).toBeNull();
    });

    it('maxDownloadCount should be null', () => {
      expect(context.maxDownloadCount).toBeNull();
    });

    it('downloadInterval should be null', () => {
      expect(context.downloadInterval).toBeNull();
    });

    it('walletBindingResponse should be null', () => {
      expect(context.walletBindingResponse).toBeNull();
    });

    it('communicationDetails should be null', () => {
      expect(context.communicationDetails).toBeNull();
    });

    it('verificationStatus should be null', () => {
      expect(context.verificationStatus).toBeNull();
    });

    it('all null properties should be null initially', () => {
      const nullProps = [
        context.credential,
        context.verifiableCredential,
        context.maxDownloadCount,
        context.downloadInterval,
        context.walletBindingResponse,
        context.communicationDetails,
        context.verificationStatus,
      ];

      nullProps.forEach(prop => {
        expect(prop).toBeNull();
      });
    });
  });

  describe('Number properties', () => {
    const context = VCItemModel.initialContext;

    it('downloadCounter should be 0', () => {
      expect(context.downloadCounter).toBe(0);
      expect(typeof context.downloadCounter).toBe('number');
    });
  });

  describe('Date properties', () => {
    const context = VCItemModel.initialContext;

    it('generatedOn should be a Date instance', () => {
      expect(context.generatedOn).toBeInstanceOf(Date);
    });

    it('generatedOn should be a valid date', () => {
      expect(context.generatedOn.getTime()).not.toBeNaN();
    });
  });

  describe('Model events', () => {
    it('should have events object', () => {
      expect(VCItemModel.events).toBeDefined();
      expect(typeof VCItemModel.events).toBe('object');
    });

    it('should have event creators', () => {
      const eventKeys = Object.keys(VCItemModel.events);
      expect(eventKeys.length).toBeGreaterThan(0);
    });
  });

  describe('Property types validation', () => {
    const context = VCItemModel.initialContext;

    it('should have correct types for all properties', () => {
      expect(typeof context.hashedId).toBe('string');
      expect(typeof context.publicKey).toBe('string');
      expect(typeof context.privateKey).toBe('string');
      expect(typeof context.OTP).toBe('string');
      expect(typeof context.error).toBe('string');
      expect(typeof context.bindingTransactionId).toBe('string');
      expect(typeof context.requestId).toBe('string');
      expect(typeof context.downloadCounter).toBe('number');
      expect(typeof context.isMachineInKebabPopupState).toBe('boolean');
      expect(typeof context.showVerificationStatusBanner).toBe('boolean');
      expect(typeof context.serviceRefs).toBe('object');
      expect(typeof context.vcMetadata).toBe('object');
      expect(context.generatedOn).toBeInstanceOf(Date);
    });
  });
});
