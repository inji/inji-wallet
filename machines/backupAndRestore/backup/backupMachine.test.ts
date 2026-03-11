import {
  BackupEvents,
  backupMachine,
  createBackupMachine,
} from './backupMachine';

describe('backupMachine', () => {
  describe('BackupEvents', () => {
    it('DATA_BACKUP', () => {
      const e = BackupEvents.DATA_BACKUP({} as any);
      expect(e.type).toBe('DATA_BACKUP');
    });

    it('DISMISS', () => {
      expect(BackupEvents.DISMISS().type).toBe('DISMISS');
    });

    it('TRY_AGAIN', () => {
      expect(BackupEvents.TRY_AGAIN().type).toBe('TRY_AGAIN');
    });

    it('DISMISS_SHOW_BACKUP_IN_PROGRESS', () => {
      expect(BackupEvents.DISMISS_SHOW_BACKUP_IN_PROGRESS().type).toBe(
        'DISMISS_SHOW_BACKUP_IN_PROGRESS',
      );
    });

    it('LAST_BACKUP_DETAILS', () => {
      expect(BackupEvents.LAST_BACKUP_DETAILS().type).toBe(
        'LAST_BACKUP_DETAILS',
      );
    });

    it('STORE_RESPONSE', () => {
      const e = BackupEvents.STORE_RESPONSE({});
      expect(e.type).toBe('STORE_RESPONSE');
    });

    it('STORE_ERROR', () => {
      const e = BackupEvents.STORE_ERROR(new Error('test'));
      expect(e.type).toBe('STORE_ERROR');
    });

    it('FILE_NAME', () => {
      const e = BackupEvents.FILE_NAME('backup.zip');
      expect(e.type).toBe('FILE_NAME');
    });
  });
});
