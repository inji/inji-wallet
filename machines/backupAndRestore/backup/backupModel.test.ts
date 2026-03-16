import {backupModel} from './backupModel';

describe('backupModel', () => {
  describe('Initial Context', () => {
    const initialContext = backupModel.initialContext;

    it('should have serviceRefs as empty object', () => {
      expect(initialContext.serviceRefs).toEqual({});
    });

    it('should have dataFromStorage as empty object', () => {
      expect(initialContext.dataFromStorage).toEqual({});
    });

    it('should have fileName as empty string', () => {
      expect(initialContext.fileName).toBe('');
    });

    it('should have lastBackupDetails as null', () => {
      expect(initialContext.lastBackupDetails).toBeNull();
    });

    it('should have errorReason as empty string', () => {
      expect(initialContext.errorReason).toBe('');
    });

    it('should have isAutoBackUp as true', () => {
      expect(initialContext.isAutoBackUp).toBe(true);
    });

    it('should have isLoadingBackupDetails as true', () => {
      expect(initialContext.isLoadingBackupDetails).toBe(true);
    });

    it('should have showBackupInProgress as false', () => {
      expect(initialContext.showBackupInProgress).toBe(false);
    });
  });
});
