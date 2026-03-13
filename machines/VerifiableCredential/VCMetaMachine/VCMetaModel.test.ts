import {VCMetamodel} from './VCMetaModel';

describe('VCMetaModel', () => {
  describe('Initial Context', () => {
    const initialContext = VCMetamodel.initialContext;

    it('should have serviceRefs as empty object', () => {
      expect(initialContext.serviceRefs).toEqual({});
    });

    it('should have myVcsMetadata as empty array', () => {
      expect(initialContext.myVcsMetadata).toEqual([]);
    });

    it('should have receivedVcsMetadata as empty array', () => {
      expect(initialContext.receivedVcsMetadata).toEqual([]);
    });

    it('should have myVcs as empty object', () => {
      expect(initialContext.myVcs).toEqual({});
    });

    it('should have receivedVcs as empty object', () => {
      expect(initialContext.receivedVcs).toEqual({});
    });

    it('should have inProgressVcDownloads as empty Set', () => {
      expect(initialContext.inProgressVcDownloads).toBeInstanceOf(Set);
      expect(initialContext.inProgressVcDownloads.size).toBe(0);
    });

    it('should have areAllVcsDownloaded as false', () => {
      expect(initialContext.areAllVcsDownloaded).toBe(false);
    });

    it('should have walletBindingSuccess as false', () => {
      expect(initialContext.walletBindingSuccess).toBe(false);
    });

    it('should have tamperedVcs as empty array', () => {
      expect(initialContext.tamperedVcs).toEqual([]);
    });

    it('should have downloadingFailedVcs as empty array', () => {
      expect(initialContext.downloadingFailedVcs).toEqual([]);
    });

    it('should have verificationErrorMessage as empty string', () => {
      expect(initialContext.verificationErrorMessage).toBe('');
    });

    it('should have verificationStatus as null', () => {
      expect(initialContext.verificationStatus).toBeNull();
    });

    it('should have DownloadingCredentialsFailed as false', () => {
      expect(initialContext.DownloadingCredentialsFailed).toBe(false);
    });

    it('should have DownloadingCredentialsSuccess as false', () => {
      expect(initialContext.DownloadingCredentialsSuccess).toBe(false);
    });
  });
});
