import {backupModel} from './backupModel';

describe('backupModel', () => {
  describe('Model structure', () => {
    it('should be defined', () => {
      expect(backupModel).toBeDefined();
    });

    it('should have initialContext', () => {
      expect(backupModel.initialContext).toBeDefined();
    });

    it('should have events', () => {
      expect(backupModel.events).toBeDefined();
    });
  });

  describe('Initial Context', () => {
    const initialContext = backupModel.initialContext;

    it('should have serviceRefs as empty object', () => {
      expect(initialContext.serviceRefs).toEqual({});
      expect(typeof initialContext.serviceRefs).toBe('object');
    });

    it('should have dataFromStorage as empty object', () => {
      expect(initialContext.dataFromStorage).toEqual({});
      expect(typeof initialContext.dataFromStorage).toBe('object');
    });

    it('should have fileName as empty string', () => {
      expect(initialContext.fileName).toBe('');
      expect(typeof initialContext.fileName).toBe('string');
    });

    it('should have lastBackupDetails as null', () => {
      expect(initialContext.lastBackupDetails).toBeNull();
    });

    it('should have errorReason as empty string', () => {
      expect(initialContext.errorReason).toBe('');
      expect(typeof initialContext.errorReason).toBe('string');
    });

    it('should have isAutoBackUp as true', () => {
      expect(initialContext.isAutoBackUp).toBe(true);
      expect(typeof initialContext.isAutoBackUp).toBe('boolean');
    });

    it('should have isLoadingBackupDetails as true', () => {
      expect(initialContext.isLoadingBackupDetails).toBe(true);
      expect(typeof initialContext.isLoadingBackupDetails).toBe('boolean');
    });

    it('should have showBackupInProgress as false', () => {
      expect(initialContext.showBackupInProgress).toBe(false);
      expect(typeof initialContext.showBackupInProgress).toBe('boolean');
    });

    it('should have all 8 required properties', () => {
      const properties = Object.keys(initialContext);
      expect(properties).toHaveLength(8);
    });
  });

  describe('String properties', () => {
    const context = backupModel.initialContext;

    it('all empty string properties should be empty', () => {
      const emptyStrings = [context.fileName, context.errorReason];

      emptyStrings.forEach(str => {
        expect(str).toBe('');
        expect(typeof str).toBe('string');
      });
    });
  });

  describe('Object properties', () => {
    const context = backupModel.initialContext;

    it('all empty object properties should be empty objects', () => {
      const emptyObjects = [context.serviceRefs, context.dataFromStorage];

      emptyObjects.forEach(obj => {
        expect(typeof obj).toBe('object');
        expect(Object.keys(obj)).toHaveLength(0);
      });
    });
  });

  describe('Boolean properties', () => {
    const context = backupModel.initialContext;

    it('isAutoBackUp should be true', () => {
      expect(context.isAutoBackUp).toBe(true);
      expect(typeof context.isAutoBackUp).toBe('boolean');
    });

    it('isLoadingBackupDetails should be true', () => {
      expect(context.isLoadingBackupDetails).toBe(true);
      expect(typeof context.isLoadingBackupDetails).toBe('boolean');
    });

    it('showBackupInProgress should be false', () => {
      expect(context.showBackupInProgress).toBe(false);
      expect(typeof context.showBackupInProgress).toBe('boolean');
    });

    it('should have correct initial values for boolean properties', () => {
      expect(context.isAutoBackUp).toBe(true);
      expect(context.isLoadingBackupDetails).toBe(true);
      expect(context.showBackupInProgress).toBe(false);
    });
  });

  describe('Null properties', () => {
    const context = backupModel.initialContext;

    it('lastBackupDetails should be null', () => {
      expect(context.lastBackupDetails).toBeNull();
    });
  });

  describe('Model events', () => {
    it('should have events object', () => {
      expect(backupModel.events).toBeDefined();
      expect(typeof backupModel.events).toBe('object');
    });

    it('should have event creators', () => {
      const eventKeys = Object.keys(backupModel.events);
      expect(eventKeys.length).toBeGreaterThan(0);
    });
  });

  describe('Property types validation', () => {
    const context = backupModel.initialContext;

    it('should have correct types for all properties', () => {
      expect(typeof context.serviceRefs).toBe('object');
      expect(typeof context.dataFromStorage).toBe('object');
      expect(typeof context.fileName).toBe('string');
      expect(context.lastBackupDetails).toBeNull();
      expect(typeof context.errorReason).toBe('string');
      expect(typeof context.isAutoBackUp).toBe('boolean');
      expect(typeof context.isLoadingBackupDetails).toBe('boolean');
      expect(typeof context.showBackupInProgress).toBe('boolean');
    });
  });
});
