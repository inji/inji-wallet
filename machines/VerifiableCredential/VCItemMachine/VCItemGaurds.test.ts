import {VCItemGaurds} from './VCItemGaurds';

jest.mock('../../../shared/cryptoutil/cryptoUtil', () => ({
  isHardwareKeystoreExists: true,
}));

jest.mock('../../../shared/vcjs/verifyCredential', () => ({
  VerificationErrorType: {
    NETWORK_ERROR: 'NETWORK_ERROR',
  },
}));

describe('VCItemGaurds', () => {
  const guards = VCItemGaurds();

  describe('hasCredentialAndWellknown', () => {
    it('should return true when both credential and wellKnown exist', () => {
      const context = {verifiableCredential: {wellKnown: {issuer: 'test'}}};
      const event = {response: {verifiableCredential: {id: 'vc1'}}};
      expect(guards.hasCredentialAndWellknown(context, event)).toBe(true);
    });

    it('should return false when credential is null', () => {
      const context = {verifiableCredential: {wellKnown: {issuer: 'test'}}};
      const event = {response: {verifiableCredential: null}};
      expect(guards.hasCredentialAndWellknown(context, event)).toBe(false);
    });

    it('should return false when wellKnown is missing', () => {
      const context = {verifiableCredential: {}};
      const event = {response: {verifiableCredential: {id: 'vc1'}}};
      expect(guards.hasCredentialAndWellknown(context, event)).toBe(false);
    });
  });

  describe('hasCredential', () => {
    it('should return true when verifiableCredential exists', () => {
      const event = {response: {verifiableCredential: {id: 'vc1'}}};
      expect(guards.hasCredential({}, event)).toBe(true);
    });

    it('should return false when verifiableCredential is null', () => {
      const event = {response: {verifiableCredential: null}};
      expect(guards.hasCredential({}, event)).toBe(false);
    });
  });

  describe('hasKeyPair', () => {
    it('should return true when publicKey exists in event data', () => {
      const event = {data: {publicKey: 'key123'}};
      expect(guards.hasKeyPair({}, event)).toBe(true);
    });

    it('should return false when publicKey is empty', () => {
      const event = {data: {publicKey: ''}};
      expect(guards.hasKeyPair({}, event)).toBe(false);
    });
  });

  describe('isSignedIn', () => {
    it('should return true when isSignedIn is true', () => {
      const event = {data: {isSignedIn: true}};
      expect(guards.isSignedIn({}, event)).toBe(true);
    });

    it('should return false when isSignedIn is false', () => {
      const event = {data: {isSignedIn: false}};
      expect(guards.isSignedIn({}, event)).toBe(false);
    });
  });

  describe('isDownloadAllowed', () => {
    it('should return true when downloadCounter <= maxDownloadCount', () => {
      expect(
        guards.isDownloadAllowed({downloadCounter: 3, maxDownloadCount: 5}),
      ).toBe(true);
    });

    it('should return false when downloadCounter > maxDownloadCount', () => {
      expect(
        guards.isDownloadAllowed({downloadCounter: 6, maxDownloadCount: 5}),
      ).toBe(false);
    });
  });

  describe('isCustomSecureKeystore', () => {
    it('should return the value of isHardwareKeystoreExists', () => {
      expect(guards.isCustomSecureKeystore()).toBe(true);
    });
  });

  describe('isVerificationPendingBecauseOfNetworkIssue', () => {
    it('should return true for NETWORK_ERROR', () => {
      const event = {data: new Error('NETWORK_ERROR')};
      expect(guards.isVerificationPendingBecauseOfNetworkIssue({}, event)).toBe(
        true,
      );
    });

    it('should return false for other errors', () => {
      const event = {data: new Error('other')};
      expect(guards.isVerificationPendingBecauseOfNetworkIssue({}, event)).toBe(
        false,
      );
    });
  });

  describe('hasVcStatusChangedAfterReverification', () => {
    it('should return true when statusChangedDuringVerification is true', () => {
      expect(
        guards.hasVcStatusChangedAfterReverification({
          statusChangedDuringVerification: true,
        }),
      ).toBe(true);
    });

    it('should return false when statusChangedDuringVerification is false', () => {
      expect(
        guards.hasVcStatusChangedAfterReverification({
          statusChangedDuringVerification: false,
        }),
      ).toBe(false);
    });
  });
});
