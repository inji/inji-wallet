import {VCMetamodel} from './VCMetaModel';

describe('VCMetaModel', () => {
  describe('Model structure', () => {
    it('should be defined', () => {
      expect(VCMetamodel).toBeDefined();
    });

    it('should have initialContext', () => {
      expect(VCMetamodel.initialContext).toBeDefined();
    });

    it('should have events', () => {
      expect(VCMetamodel.events).toBeDefined();
    });
  });

  describe('Initial Context', () => {
    const initialContext = VCMetamodel.initialContext;

    it('should have serviceRefs as empty object', () => {
      expect(initialContext.serviceRefs).toEqual({});
      expect(typeof initialContext.serviceRefs).toBe('object');
    });

    it('should have myVcsMetadata as empty array', () => {
      expect(initialContext.myVcsMetadata).toEqual([]);
      expect(Array.isArray(initialContext.myVcsMetadata)).toBe(true);
      expect(initialContext.myVcsMetadata).toHaveLength(0);
    });

    it('should have receivedVcsMetadata as empty array', () => {
      expect(initialContext.receivedVcsMetadata).toEqual([]);
      expect(Array.isArray(initialContext.receivedVcsMetadata)).toBe(true);
      expect(initialContext.receivedVcsMetadata).toHaveLength(0);
    });

    it('should have myVcs as empty object', () => {
      expect(initialContext.myVcs).toEqual({});
      expect(typeof initialContext.myVcs).toBe('object');
      expect(Object.keys(initialContext.myVcs)).toHaveLength(0);
    });

    it('should have receivedVcs as empty object', () => {
      expect(initialContext.receivedVcs).toEqual({});
      expect(typeof initialContext.receivedVcs).toBe('object');
      expect(Object.keys(initialContext.receivedVcs)).toHaveLength(0);
    });

    it('should have inProgressVcDownloads as empty Set', () => {
      expect(initialContext.inProgressVcDownloads).toBeInstanceOf(Set);
      expect(initialContext.inProgressVcDownloads.size).toBe(0);
    });

    it('should have areAllVcsDownloaded as false', () => {
      expect(initialContext.areAllVcsDownloaded).toBe(false);
      expect(typeof initialContext.areAllVcsDownloaded).toBe('boolean');
    });

    it('should have walletBindingSuccess as false', () => {
      expect(initialContext.walletBindingSuccess).toBe(false);
      expect(typeof initialContext.walletBindingSuccess).toBe('boolean');
    });

    it('should have tamperedVcs as empty array', () => {
      expect(initialContext.tamperedVcs).toEqual([]);
      expect(Array.isArray(initialContext.tamperedVcs)).toBe(true);
      expect(initialContext.tamperedVcs).toHaveLength(0);
    });

    it('should have downloadingFailedVcs as empty array', () => {
      expect(initialContext.downloadingFailedVcs).toEqual([]);
      expect(Array.isArray(initialContext.downloadingFailedVcs)).toBe(true);
      expect(initialContext.downloadingFailedVcs).toHaveLength(0);
    });

    it('should have verificationErrorMessage as empty string', () => {
      expect(initialContext.verificationErrorMessage).toBe('');
      expect(typeof initialContext.verificationErrorMessage).toBe('string');
    });

    it('should have verificationStatus as null', () => {
      expect(initialContext.verificationStatus).toBeNull();
    });

    it('should have DownloadingCredentialsFailed as false', () => {
      expect(initialContext.DownloadingCredentialsFailed).toBe(false);
      expect(typeof initialContext.DownloadingCredentialsFailed).toBe(
        'boolean',
      );
    });

    it('should have DownloadingCredentialsSuccess as false', () => {
      expect(initialContext.DownloadingCredentialsSuccess).toBe(false);
      expect(typeof initialContext.DownloadingCredentialsSuccess).toBe(
        'boolean',
      );
    });

    it('should have all required properties', () => {
      expect(initialContext).toHaveProperty('serviceRefs');
      expect(initialContext).toHaveProperty('myVcsMetadata');
      expect(initialContext).toHaveProperty('receivedVcsMetadata');
      expect(initialContext).toHaveProperty('myVcs');
      expect(initialContext).toHaveProperty('receivedVcs');
      expect(initialContext).toHaveProperty('inProgressVcDownloads');
      expect(initialContext).toHaveProperty('areAllVcsDownloaded');
      expect(initialContext).toHaveProperty('walletBindingSuccess');
      expect(initialContext).toHaveProperty('tamperedVcs');
      expect(initialContext).toHaveProperty('downloadingFailedVcs');
      expect(initialContext).toHaveProperty('verificationErrorMessage');
      expect(initialContext).toHaveProperty('verificationStatus');
      expect(initialContext).toHaveProperty('DownloadingCredentialsFailed');
      expect(initialContext).toHaveProperty('DownloadingCredentialsSuccess');
    });

    it('should have exactly 16 properties in initial context', () => {
      const propertyCount = Object.keys(initialContext).length;
      expect(propertyCount).toBe(16);
    });
  });

  describe('Model events', () => {
    it('should have events object defined', () => {
      expect(VCMetamodel.events).toBeDefined();
      expect(typeof VCMetamodel.events).toBe('object');
    });

    it('should have non-empty events', () => {
      const eventKeys = Object.keys(VCMetamodel.events);
      expect(eventKeys.length).toBeGreaterThan(0);
    });
  });

  describe('Type validation', () => {
    const context = VCMetamodel.initialContext;

    it('myVcsMetadata should accept VCMetadata array', () => {
      expect(() => {
        const metadata: typeof context.myVcsMetadata = [];
        expect(Array.isArray(metadata)).toBe(true);
      }).not.toThrow();
    });

    it('myVcs should accept Record<string, VC>', () => {
      expect(() => {
        const vcs: typeof context.myVcs = {};
        expect(typeof vcs).toBe('object');
      }).not.toThrow();
    });

    it('inProgressVcDownloads should be a Set', () => {
      expect(context.inProgressVcDownloads).toBeInstanceOf(Set);
      expect(context.inProgressVcDownloads.constructor.name).toBe('Set');
    });
  });

  describe('Boolean flags', () => {
    const context = VCMetamodel.initialContext;

    it('all boolean flags should be false initially', () => {
      const booleanFlags = [
        context.areAllVcsDownloaded,
        context.walletBindingSuccess,
        context.DownloadingCredentialsFailed,
        context.DownloadingCredentialsSuccess,
      ];

      booleanFlags.forEach(flag => {
        expect(flag).toBe(false);
      });
    });
  });

  describe('Array properties', () => {
    const context = VCMetamodel.initialContext;

    it('all array properties should be empty initially', () => {
      const arrays = [
        context.myVcsMetadata,
        context.receivedVcsMetadata,
        context.tamperedVcs,
        context.downloadingFailedVcs,
      ];

      arrays.forEach(arr => {
        expect(Array.isArray(arr)).toBe(true);
        expect(arr).toHaveLength(0);
      });
    });
  });

  describe('Object properties', () => {
    const context = VCMetamodel.initialContext;

    it('all object properties should be empty initially', () => {
      const objects = [context.serviceRefs, context.myVcs, context.receivedVcs];

      objects.forEach(obj => {
        expect(typeof obj).toBe('object');
        expect(Object.keys(obj)).toHaveLength(0);
      });
    });
  });

  describe('Null/undefined properties', () => {
    const context = VCMetamodel.initialContext;

    it('verificationStatus should be null', () => {
      expect(context.verificationStatus).toBeNull();
      expect(context.verificationStatus).not.toBeUndefined();
    });

    it('verificationErrorMessage should be empty string, not null', () => {
      expect(context.verificationErrorMessage).not.toBeNull();
      expect(context.verificationErrorMessage).toBe('');
    });
  });
});
