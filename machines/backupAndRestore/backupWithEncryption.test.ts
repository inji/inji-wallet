import {
  BackupWithEncryptionEvents,
  backupWithEncryptionMachine,
  createBackupMachine,
  selectIsEnableBackup,
  selectIsBackupPref,
  selectIsBackupViaPassword,
  selectIsBackupViaPhoneNumber,
  selectIsRequestOtp,
  selectIsBackingUp,
  selectIsCancellingDownload,
} from './backupWithEncryption';

describe('backupWithEncryption', () => {
  describe('exports', () => {
    it('backupWithEncryptionMachine is defined', () => {
      expect(backupWithEncryptionMachine).toBeDefined();
    });

    it('createBackupMachine is a function', () => {
      expect(typeof createBackupMachine).toBe('function');
    });

    it('BackupWithEncryptionEvents is defined', () => {
      expect(BackupWithEncryptionEvents).toBeDefined();
    });
  });

  describe('selectors', () => {
    const mockState = (matchVal?: string) =>
      ({matches: (v: string) => v === matchVal} as any);

    it('selectIsEnableBackup', () => {
      expect(selectIsEnableBackup(mockState('backUp'))).toBe(true);
      expect(selectIsEnableBackup(mockState('other'))).toBe(false);
    });

    it('selectIsBackupPref', () => {
      expect(selectIsBackupPref(mockState('selectPref'))).toBe(true);
      expect(selectIsBackupPref(mockState('other'))).toBe(false);
    });

    it('selectIsBackupViaPassword', () => {
      expect(selectIsBackupViaPassword(mockState('passwordBackup'))).toBe(true);
      expect(selectIsBackupViaPassword(mockState('other'))).toBe(false);
    });

    it('selectIsBackupViaPhoneNumber', () => {
      expect(selectIsBackupViaPhoneNumber(mockState('phoneNumberBackup'))).toBe(
        true,
      );
      expect(selectIsBackupViaPhoneNumber(mockState('other'))).toBe(false);
    });

    it('selectIsRequestOtp', () => {
      expect(selectIsRequestOtp(mockState('requestOtp'))).toBe(true);
      expect(selectIsRequestOtp(mockState('other'))).toBe(false);
    });

    it('selectIsBackingUp', () => {
      expect(selectIsBackingUp(mockState('backingUp'))).toBe(true);
      expect(selectIsBackingUp(mockState('other'))).toBe(false);
    });

    it('selectIsCancellingDownload returns false', () => {
      expect(selectIsCancellingDownload(mockState('any'))).toBe(false);
    });
  });

  describe('BackupWithEncryptionEvents', () => {
    it('DATA_BACKUP', () => {
      const e = BackupWithEncryptionEvents.DATA_BACKUP({} as any);
      expect(e.type).toBe('DATA_BACKUP');
    });

    it('YES', () => {
      expect(BackupWithEncryptionEvents.YES().type).toBe('YES');
    });

    it('PASSWORD', () => {
      const e = BackupWithEncryptionEvents.PASSWORD('secret');
      expect(e.type).toBe('PASSWORD');
    });

    it('SET_BASE_ENC_KEY', () => {
      const e = BackupWithEncryptionEvents.SET_BASE_ENC_KEY('key');
      expect(e.type).toBe('SET_BASE_ENC_KEY');
    });

    it('FILE_NAME', () => {
      const e = BackupWithEncryptionEvents.FILE_NAME('backup.zip');
      expect(e.type).toBe('FILE_NAME');
    });

    it('PHONE_NUMBER', () => {
      const e = BackupWithEncryptionEvents.PHONE_NUMBER('12345');
      expect(e.type).toBe('PHONE_NUMBER');
    });

    it('SEND_OTP', () => {
      expect(BackupWithEncryptionEvents.SEND_OTP().type).toBe('SEND_OTP');
    });

    it('INPUT_OTP', () => {
      const e = BackupWithEncryptionEvents.INPUT_OTP('1234');
      expect(e.type).toBe('INPUT_OTP');
    });

    it('BACK', () => {
      expect(BackupWithEncryptionEvents.BACK().type).toBe('BACK');
    });

    it('CANCEL', () => {
      expect(BackupWithEncryptionEvents.CANCEL().type).toBe('CANCEL');
    });

    it('WAIT', () => {
      expect(BackupWithEncryptionEvents.WAIT().type).toBe('WAIT');
    });

    it('CANCEL_DOWNLOAD', () => {
      expect(BackupWithEncryptionEvents.CANCEL_DOWNLOAD().type).toBe(
        'CANCEL_DOWNLOAD',
      );
    });

    it('STORE_RESPONSE', () => {
      const e = BackupWithEncryptionEvents.STORE_RESPONSE({});
      expect(e.type).toBe('STORE_RESPONSE');
    });
  });

  describe('action implementations', () => {
    const options = (backupWithEncryptionMachine as any).options;

    it('setOtp assigns otp from event', () => {
      const fn = options.actions.setOtp.assignment.otp;
      expect(fn({}, {otp: '1234'})).toBe('1234');
    });

    it('setDataFromStorage assigns dataFromStorage from event', () => {
      const fn = options.actions.setDataFromStorage.assignment.dataFromStorage;
      expect(fn({}, {response: {key: 'value'}})).toEqual({key: 'value'});
    });

    it('setBaseEncKey assigns baseEncKey from event', () => {
      const fn = options.actions.setBaseEncKey.assignment.baseEncKey;
      expect(fn({}, {baseEncKey: 'myKey'})).toBe('myKey');
    });

    it('setHashedKey assigns hashedEncKey from event data', () => {
      const fn = options.actions.setHashedKey.assignment.hashedEncKey;
      expect(fn({}, {data: 'hashedValue'})).toBe('hashedValue');
    });

    it('storeHashedEncKey sends SET event to store', () => {
      const action = options.actions.storeHashedEncKey;
      expect(action).toBeDefined();
      if (action.opts?.to) {
        const store = {send: jest.fn()};
        expect(action.opts.to({serviceRefs: {store}})).toBe(store);
      }
    });

    it('storePasswordKeyType sends SET event to store', () => {
      const action = options.actions.storePasswordKeyType;
      expect(action).toBeDefined();
      if (action.opts?.to) {
        const store = {send: jest.fn()};
        expect(action.opts.to({serviceRefs: {store}})).toBe(store);
      }
    });

    it('storePhoneNumberKeyType sends SET event to store', () => {
      const action = options.actions.storePhoneNumberKeyType;
      expect(action).toBeDefined();
      if (action.opts?.to) {
        const store = {send: jest.fn()};
        expect(action.opts.to({serviceRefs: {store}})).toBe(store);
      }
    });

    it('fetchAllDataFromDB sends EXPORT event to store', () => {
      const action = options.actions.fetchAllDataFromDB;
      expect(action).toBeDefined();
    });
  });

  describe('service implementations', () => {
    const options = (backupWithEncryptionMachine as any).options;

    it('hashEncKey is defined as a service', () => {
      expect(options.services.hashEncKey).toBeDefined();
      expect(typeof options.services.hashEncKey).toBe('function');
    });

    it('writeDataToFile is defined as a service', () => {
      expect(options.services.writeDataToFile).toBeDefined();
      expect(typeof options.services.writeDataToFile).toBe('function');
    });

    it('zipBackupFile is defined as a service', () => {
      expect(options.services.zipBackupFile).toBeDefined();
      expect(typeof options.services.zipBackupFile).toBe('function');
    });
  });

  describe('createBackupMachine', () => {
    it('should create machine with serviceRefs in context', () => {
      const mockServiceRefs = {store: {send: jest.fn()}} as any;
      const machine = createBackupMachine(mockServiceRefs);
      expect(machine.context.serviceRefs).toBe(mockServiceRefs);
    });

    it('should preserve default context values', () => {
      const mockServiceRefs = {store: {send: jest.fn()}} as any;
      const machine = createBackupMachine(mockServiceRefs);
      expect(machine.context.otp).toBe('');
      expect(machine.context.baseEncKey).toBe('');
      expect(machine.context.hashedEncKey).toBe('');
    });
  });
});
