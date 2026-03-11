import {
  RestoreEvents,
  restoreMachine,
  createRestoreMachine,
} from './restoreMachine';

describe('restoreMachine', () => {
  describe('RestoreEvents', () => {
    it('BACKUP_RESTORE', () => {
      expect(RestoreEvents.BACKUP_RESTORE().type).toBe('BACKUP_RESTORE');
    });

    it('DOWNLOAD_UNSYNCED_BACKUP_FILES', () => {
      expect(RestoreEvents.DOWNLOAD_UNSYNCED_BACKUP_FILES().type).toBe(
        'DOWNLOAD_UNSYNCED_BACKUP_FILES',
      );
    });

    it('DISMISS', () => {
      expect(RestoreEvents.DISMISS().type).toBe('DISMISS');
    });

    it('DISMISS_SHOW_RESTORE_IN_PROGRESS', () => {
      expect(RestoreEvents.DISMISS_SHOW_RESTORE_IN_PROGRESS().type).toBe(
        'DISMISS_SHOW_RESTORE_IN_PROGRESS',
      );
    });

    it('STORE_RESPONSE', () => {
      const e = RestoreEvents.STORE_RESPONSE({});
      expect(e.type).toBe('STORE_RESPONSE');
    });

    it('STORE_ERROR', () => {
      const e = RestoreEvents.STORE_ERROR(new Error('test'));
      expect(e.type).toBe('STORE_ERROR');
    });

    it('DATA_FROM_FILE', () => {
      const e = RestoreEvents.DATA_FROM_FILE('data');
      expect(e.type).toBe('DATA_FROM_FILE');
    });
  });
});
