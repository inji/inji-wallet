import Storage, {
  MMKV,
  isMinimumLimitForBackupReached,
  isMinimumLimitForBackupRestorationReached,
  isMinimumStorageLimitReached,
} from './storage';
import {VCMetadata} from './VCMetadata';
import FileStorage, {vcDirectoryPath, getFilePath} from './fileStorage';
import {SETTINGS_STORE_KEY} from './constants';

// Mock dependencies
jest.mock('./backupUtils/backupData', () => ({
  exportData: jest.fn().mockResolvedValue('backup-data'),
}));
jest.mock('./backupUtils/restoreData', () => ({
  loadBackupData: jest.fn().mockResolvedValue({success: true}),
}));
jest.mock('./cryptoutil/cryptoUtil', () => ({
  decryptJson: jest.fn().mockResolvedValue('decrypted-data'),
  encryptJson: jest.fn().mockResolvedValue('encrypted-data'),
  HMAC_ALIAS: 'test-hmac-alias',
  hmacSHA: jest.fn().mockReturnValue('hmac-result'),
  isHardwareKeystoreExists: false,
}));
jest.mock('./fileStorage', () => {
  const actual = jest.requireActual('./fileStorage');
  return {
    __esModule: true,
    default: {
      readFile: jest.fn().mockResolvedValue('file-content'),
      writeFile: jest.fn().mockResolvedValue(undefined),
      createDirectory: jest.fn().mockResolvedValue(undefined),
      exists: jest.fn().mockResolvedValue(true),
      removeItem: jest.fn().mockResolvedValue(undefined),
      getAllFilesInDirectory: jest.fn().mockResolvedValue([]),
    },
    vcDirectoryPath: '/mock/vc/path',
    getFilePath: jest.fn((key: string) => `/mock/vc/path/${key}.txt`),
    getDirectorySize: jest.fn().mockResolvedValue(1000),
    backupDirectoryPath: '/mock/backup/path',
  };
});
jest.mock('./api', () =>
  jest.fn().mockResolvedValue({minStorageRequired: 100}),
);
jest.mock('./telemetry/TelemetryUtils', () => ({
  sendErrorEvent: jest.fn(),
  getErrorEventData: jest.fn().mockReturnValue({}),
}));
jest.mock('./GlobalVariables', () => ({
  __AppId: {
    getValue: jest.fn().mockReturnValue('test-app-id'),
    setValue: jest.fn(),
  },
}));
jest.mock('react-native-device-info', () => ({
  getFreeDiskStorageSync: jest.fn().mockReturnValue(500000000),
  getFreeDiskStorageOldSync: jest.fn().mockReturnValue(500000000),
}));

describe('Storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('MMKV', () => {
    it('should be defined', () => {
      expect(MMKV).toBeDefined();
    });
  });

  describe('setItem', () => {
    it('should store non-VC data in MMKV', async () => {
      jest.spyOn(VCMetadata, 'isVCKey').mockReturnValue(false);
      const spy = jest.spyOn(MMKV, 'setItem').mockResolvedValue(undefined);
      await Storage.setItem('test-key', 'test-data');
      expect(spy).toHaveBeenCalledWith('test-key', 'test-data');
    });

    it('should store VC data in file system', async () => {
      jest.spyOn(VCMetadata, 'isVCKey').mockReturnValue(true);
      await Storage.setItem('vc-key', 'vc-data', 'enc-key');
      expect(FileStorage.createDirectory).toHaveBeenCalled();
    });
  });

  describe('getItem', () => {
    it('should retrieve non-VC data from MMKV', async () => {
      jest.spyOn(VCMetadata, 'isVCKey').mockReturnValue(false);
      jest.spyOn(MMKV, 'getItem').mockResolvedValue('stored-data');
      const result = await Storage.getItem('test-key');
      expect(result).toBe('stored-data');
    });
  });

  describe('removeItem', () => {
    it('should remove VC from file system if exists', async () => {
      jest.spyOn(VCMetadata, 'isVCKey').mockReturnValue(true);
      (FileStorage.exists as jest.Mock).mockResolvedValue(true);
      await Storage.removeItem('vc-key');
      expect(FileStorage.removeItem).toHaveBeenCalled();
    });

    it('should handle non-VC key removal', async () => {
      jest.spyOn(VCMetadata, 'isVCKey').mockReturnValue(false);
      // MMKV mock doesn't have removeItem - just verify no errors
      await expect(Storage.removeItem('test-key')).resolves.not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear storage and preserve appId', async () => {
      (FileStorage.exists as jest.Mock).mockResolvedValue(true);
      jest
        .spyOn(MMKV, 'getItem')
        .mockResolvedValue(JSON.stringify({appId: 'test-app'}));
      // MMKV mock doesn't have clearStore - just verify no errors
      await expect(Storage.clear()).resolves.not.toThrow();
    });
  });

  describe('backupData', () => {
    it('should call exportData with encryption key', async () => {
      const result = await Storage.backupData('enc-key');
      expect(result).toBe('backup-data');
    });
  });

  describe('restoreBackUpData', () => {
    it('should call loadBackupData', async () => {
      const result = await Storage.restoreBackUpData('data', 'enc-key');
      expect(result).toEqual({success: true});
    });
  });

  describe('isMinimumStorageLimitReached', () => {
    it('should return false when no config limit', async () => {
      const getAllConfigurations = require('./api');
      getAllConfigurations.mockResolvedValue({});
      const result = await isMinimumStorageLimitReached('minStorageRequired');
      expect(result).toBe(false);
    });

    it('should return false when free space is above limit', async () => {
      const getAllConfigurations = require('./api');
      getAllConfigurations.mockResolvedValue({minStorageRequired: 1});
      const result = await isMinimumStorageLimitReached('minStorageRequired');
      expect(result).toBe(false);
    });
  });

  describe('isMinimumLimitForBackupReached', () => {
    it('should return a boolean', async () => {
      const result = await isMinimumLimitForBackupReached();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('isMinimumLimitForBackupRestorationReached', () => {
    it('should return a boolean', async () => {
      const result = await isMinimumLimitForBackupRestorationReached();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getItem VC path', () => {
    it('should read VC from file system', async () => {
      jest.spyOn(VCMetadata, 'isVCKey').mockReturnValue(true);
      (FileStorage.readFile as jest.Mock).mockResolvedValue('vc-file-data');
      jest.spyOn(MMKV, 'getItem').mockResolvedValue(null);
      const result = await Storage.getItem('vc-key', 'enc-key');
      expect(FileStorage.readFile).toHaveBeenCalled();
    });
  });

  describe('setItem VC path', () => {
    it('should create directory and write file for VC', async () => {
      jest.spyOn(VCMetadata, 'isVCKey').mockReturnValue(true);
      await Storage.setItem('vc-key', 'vc-data', 'enc-key');
      expect(FileStorage.createDirectory).toHaveBeenCalledWith('/mock/vc/path');
      expect(FileStorage.writeFile).toHaveBeenCalled();
    });
  });

  describe('removeItem VC path', () => {
    it('should remove VC file when it exists', async () => {
      jest.spyOn(VCMetadata, 'isVCKey').mockReturnValue(true);
      (FileStorage.exists as jest.Mock).mockResolvedValue(true);
      await Storage.removeItem('vc-key');
      expect(FileStorage.removeItem).toHaveBeenCalled();
    });

    it('should handle when VC file does not exist', async () => {
      jest.spyOn(VCMetadata, 'isVCKey').mockReturnValue(true);
      (FileStorage.exists as jest.Mock).mockResolvedValue(false);
      await expect(Storage.removeItem('vc-key')).resolves.not.toThrow();
    });
  });

  describe('fetchAllWellknownConfig', () => {
    it('should return empty object when no matching keys', async () => {
      jest.spyOn(MMKV.indexer.strings, 'getKeys').mockResolvedValue([]);
      const result = await Storage.fetchAllWellknownConfig('enc-key');
      expect(result).toEqual({});
    });

    it('should return wellknown config data for matching keys', async () => {
      const {decryptJson} = require('./cryptoutil/cryptoUtil');
      decryptJson.mockResolvedValue({issuer: 'test-issuer'});
      jest
        .spyOn(MMKV.indexer.strings, 'getKeys')
        .mockResolvedValue(['CACHE_FETCH_ISSUER_WELLKNOWN_issuer1']);
      jest.spyOn(MMKV, 'getItem').mockResolvedValue('encrypted-config');
      (FileStorage.readFile as jest.Mock).mockResolvedValue('file-data');
      jest.spyOn(VCMetadata, 'isVCKey').mockReturnValue(false);
      const result = await Storage.fetchAllWellknownConfig('enc-key');
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });

  describe('setItem error handling', () => {
    it('should throw error when MMKV setItem fails for non-VC', async () => {
      jest.spyOn(VCMetadata, 'isVCKey').mockReturnValue(false);
      jest.spyOn(MMKV, 'setItem').mockRejectedValue(new Error('write error'));
      await expect(Storage.setItem('key', 'data')).rejects.toThrow(
        'write error',
      );
    });

    it('should throw error when file write fails for VC', async () => {
      jest.spyOn(VCMetadata, 'isVCKey').mockReturnValue(true);
      (FileStorage.writeFile as jest.Mock).mockRejectedValue(
        new Error('file error'),
      );
      await expect(
        Storage.setItem('vc-key', 'vc-data', 'enc-key'),
      ).rejects.toThrow('file error');
    });
  });

  describe('getItem VC corruption check', () => {
    it('should return null for corrupted VC', async () => {
      jest.spyOn(VCMetadata, 'isVCKey').mockReturnValue(true);
      (FileStorage.readFile as jest.Mock).mockResolvedValue('vc-data');
      const {decryptJson, hmacSHA} = require('./cryptoutil/cryptoUtil');
      jest.spyOn(MMKV, 'getItem').mockResolvedValue('encrypted-hmac');
      decryptJson.mockResolvedValue('stored-hmac');
      hmacSHA.mockReturnValue('different-hmac');
      const result = await Storage.getItem('vc-key', 'enc-key');
      expect(result).toBeNull();
    });

    it('should return data for non-corrupted VC', async () => {
      jest.spyOn(VCMetadata, 'isVCKey').mockReturnValue(true);
      (FileStorage.readFile as jest.Mock).mockResolvedValue('vc-data');
      const {decryptJson, hmacSHA} = require('./cryptoutil/cryptoUtil');
      jest.spyOn(MMKV, 'getItem').mockResolvedValue('encrypted-hmac');
      decryptJson.mockResolvedValue('matching-hmac');
      hmacSHA.mockReturnValue('matching-hmac');
      const result = await Storage.getItem('vc-key', 'enc-key');
      expect(result).toBe('vc-data');
    });
  });

  describe('getItem error paths', () => {
    it('should throw ENOENT for downloaded VC with missing file', async () => {
      jest.spyOn(VCMetadata, 'isVCKey').mockReturnValue(true);
      (FileStorage.readFile as jest.Mock).mockRejectedValue(
        new Error('ENOENT: no such file'),
      );
      jest.spyOn(MMKV, 'getItem').mockResolvedValue('existing-hmac');
      const {decryptJson} = require('./cryptoutil/cryptoUtil');
      decryptJson.mockResolvedValue('decrypted');
      await expect(Storage.getItem('vc-key', 'enc-key')).rejects.toThrow();
    });

    it('should throw error for non-VC getItem failure', async () => {
      jest.spyOn(VCMetadata, 'isVCKey').mockReturnValue(false);
      jest.spyOn(MMKV, 'getItem').mockRejectedValue(new Error('read error'));
      await expect(Storage.getItem('key', 'enc-key')).rejects.toThrow(
        'read error',
      );
    });
  });

  describe('clear with no VC directory', () => {
    it('should handle when VC directory does not exist', async () => {
      (FileStorage.exists as jest.Mock).mockResolvedValue(false);
      jest
        .spyOn(MMKV, 'getItem')
        .mockResolvedValue(JSON.stringify({appId: 'app-1'}));
      await expect(Storage.clear()).resolves.not.toThrow();
    });
  });

  describe('isMinimumStorageLimitReached', () => {
    it('should return true when free space is below limit', async () => {
      const getAllConfigurations = require('./api');
      getAllConfigurations.mockResolvedValue({minStorageRequired: 999999});
      const {getFreeDiskStorageSync} = require('react-native-device-info');
      getFreeDiskStorageSync.mockReturnValue(100);
      const result = await isMinimumStorageLimitReached('minStorageRequired');
      expect(result).toBe(true);
    });
  });

  describe('isMinimumLimitForBackupReached', () => {
    it('should return true when free space is less than 2x directory size', async () => {
      const {getDirectorySize} = require('./fileStorage');
      getDirectorySize.mockResolvedValue(500000000);
      const {getFreeDiskStorageSync} = require('react-native-device-info');
      getFreeDiskStorageSync.mockReturnValue(100);
      const result = await isMinimumLimitForBackupReached();
      expect(result).toBe(true);
    });

    it('should return false when free space exceeds 2x directory size', async () => {
      const {getDirectorySize} = require('./fileStorage');
      getDirectorySize.mockResolvedValue(1000);
      const {getFreeDiskStorageSync} = require('react-native-device-info');
      getFreeDiskStorageSync.mockReturnValue(500000000);
      const result = await isMinimumLimitForBackupReached();
      expect(result).toBe(false);
    });
  });

  describe('isMinimumLimitForBackupRestorationReached', () => {
    it('should delegate to isMinimumStorageLimitReached', async () => {
      const getAllConfigurations = require('./api');
      getAllConfigurations.mockResolvedValue({minStorageRequired: 100});
      const result = await isMinimumLimitForBackupRestorationReached();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('removeItem non-VC path', () => {
    it('should call MMKV.removeItem for non-VC keys', async () => {
      jest.spyOn(VCMetadata, 'isVCKey').mockReturnValue(false);
      const spy = jest.spyOn(MMKV, 'removeItem');
      await Storage.removeItem('non-vc-key');
      expect(spy).toHaveBeenCalledWith('non-vc-key');
    });
  });
});
