import {VCItemModel} from './VCItemModel';

describe('VCItemModel', () => {
  describe('Initial Context', () => {
    const initialContext = VCItemModel.initialContext;

    it('should have serviceRefs as empty object', () => {
      expect(initialContext.serviceRefs).toEqual({});
    });

    it('should have vcMetadata as empty object', () => {
      expect(initialContext.vcMetadata).toEqual({});
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
    });

    it('should have publicKey as empty string', () => {
      expect(initialContext.publicKey).toBe('');
    });

    it('should have privateKey as empty string', () => {
      expect(initialContext.privateKey).toBe('');
    });

    it('should have OTP as empty string', () => {
      expect(initialContext.OTP).toBe('');
    });

    it('should have error as empty string', () => {
      expect(initialContext.error).toBe('');
    });

    it('should have bindingTransactionId as empty string', () => {
      expect(initialContext.bindingTransactionId).toBe('');
    });

    it('should have requestId as empty string', () => {
      expect(initialContext.requestId).toBe('');
    });

    it('should have downloadCounter as 0', () => {
      expect(initialContext.downloadCounter).toBe(0);
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
    });

    it('should have communicationDetails as null', () => {
      expect(initialContext.communicationDetails).toBeNull();
    });

    it('should have verificationStatus as null', () => {
      expect(initialContext.verificationStatus).toBeNull();
    });

    it('should have showVerificationStatusBanner as false', () => {
      expect(initialContext.showVerificationStatusBanner).toBe(false);
    });

    it('should have wellknownResponse as empty object', () => {
      expect(initialContext.wellknownResponse).toEqual({});
    });
  });
});
