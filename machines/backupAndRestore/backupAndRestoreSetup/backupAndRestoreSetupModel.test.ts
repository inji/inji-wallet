import {backupAndRestoreSetupModel} from './backupAndRestoreSetupModel';

describe('backupAndRestoreSetupModel', () => {
  describe('Initial Context', () => {
    const initialContext = backupAndRestoreSetupModel.initialContext;

    it('should have isLoading as false', () => {
      expect(initialContext.isLoading).toBe(false);
    });

    it('should have profileInfo as undefined', () => {
      expect(initialContext.profileInfo).toBeUndefined();
    });

    it('should have errorMessage as empty string', () => {
      expect(initialContext.errorMessage).toBe('');
    });

    it('should have serviceRefs as empty object', () => {
      expect(initialContext.serviceRefs).toEqual({});
    });

    it('should have shouldTriggerAutoBackup as false', () => {
      expect(initialContext.shouldTriggerAutoBackup).toBe(false);
    });

    it('should have isCloudSignedIn as false', () => {
      expect(initialContext.isCloudSignedIn).toBe(false);
    });
  });
});
