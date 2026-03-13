import {restoreModel} from './restoreModel';

describe('restoreModel', () => {
  describe('Initial Context', () => {
    const initialContext = restoreModel.initialContext;

    it('should have serviceRefs as empty object', () => {
      expect(initialContext.serviceRefs).toEqual({});
    });

    it('should have fileName as empty string', () => {
      expect(initialContext.fileName).toBe('');
    });

    it('should have dataFromBackupFile as empty object', () => {
      expect(initialContext.dataFromBackupFile).toEqual({});
    });

    it('should have errorReason as empty string', () => {
      expect(initialContext.errorReason).toBe('');
    });

    it('should have showRestoreInProgress as false', () => {
      expect(initialContext.showRestoreInProgress).toBe(false);
    });
  });
});
