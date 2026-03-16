import {
  BackupAndRestoreSetupEvents,
  backupAndRestoreSetupMachine,
} from './backupAndRestoreSetupMachine';

describe('backupAndRestoreSetupMachine', () => {
  describe('BackupAndRestoreSetupEvents', () => {
    it('HANDLE_BACKUP_AND_RESTORE', () => {
      const e = BackupAndRestoreSetupEvents.HANDLE_BACKUP_AND_RESTORE(
        {} as any,
      );
      expect(e.type).toBe('HANDLE_BACKUP_AND_RESTORE');
    });

    it('PROCEED', () => {
      expect(BackupAndRestoreSetupEvents.PROCEED().type).toBe('PROCEED');
    });

    it('GO_BACK', () => {
      expect(BackupAndRestoreSetupEvents.GO_BACK().type).toBe('GO_BACK');
    });

    it('TRY_AGAIN', () => {
      expect(BackupAndRestoreSetupEvents.TRY_AGAIN().type).toBe('TRY_AGAIN');
    });

    it('RECONFIGURE_ACCOUNT', () => {
      expect(BackupAndRestoreSetupEvents.RECONFIGURE_ACCOUNT().type).toBe(
        'RECONFIGURE_ACCOUNT',
      );
    });

    it('OPEN_SETTINGS', () => {
      expect(BackupAndRestoreSetupEvents.OPEN_SETTINGS().type).toBe(
        'OPEN_SETTINGS',
      );
    });

    it('DISMISS', () => {
      expect(BackupAndRestoreSetupEvents.DISMISS().type).toBe('DISMISS');
    });

    it('STORE_RESPONSE', () => {
      const e = BackupAndRestoreSetupEvents.STORE_RESPONSE({});
      expect(e.type).toBe('STORE_RESPONSE');
    });
  });
});
