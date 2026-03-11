import FileStorage, {
  vcDirectoryPath,
  backupDirectoryPath,
  zipFilePath,
  getFilePath,
  getBackupFilePath,
  getDirectorySize,
  cleanupLocalBackups,
  writeToBackupFile,
  isVCStorageInitialised,
  compressAndRemoveFile,
  unZipAndRemoveFile,
} from './fileStorage';

jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/documents',
  readFile: jest.fn().mockResolvedValue('file-content'),
  writeFile: jest.fn().mockResolvedValue(undefined),
  mkdir: jest.fn().mockResolvedValue(undefined),
  exists: jest.fn().mockResolvedValue(true),
  unlink: jest.fn().mockResolvedValue(undefined),
  readDir: jest.fn().mockResolvedValue([]),
  stat: jest.fn().mockResolvedValue({
    size: 1024,
    isDirectory: () => true,
  }),
}));

jest.mock('react-native-zip-archive', () => ({
  zip: jest.fn().mockResolvedValue('/mock/path.zip'),
  unzip: jest.fn().mockResolvedValue('/mock/unzipped'),
}));

jest.mock('./commonUtil', () => ({
  getBackupFileName: jest.fn().mockReturnValue('backup_12345'),
}));

describe('fileStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('FileStorage instance', () => {
    it('should read file', async () => {
      const result = await FileStorage.readFile('/test/path');
      expect(result).toBe('file-content');
    });

    it('should write file', async () => {
      await expect(
        FileStorage.writeFile('/test/path', 'data'),
      ).resolves.not.toThrow();
    });

    it('should create directory', async () => {
      await expect(
        FileStorage.createDirectory('/test/dir'),
      ).resolves.not.toThrow();
    });

    it('should check if path exists', async () => {
      const result = await FileStorage.exists('/test/path');
      expect(result).toBe(true);
    });

    it('should remove item', async () => {
      await expect(FileStorage.removeItem('/test/path')).resolves.not.toThrow();
    });

    it('should remove item if exists', async () => {
      await FileStorage.removeItemIfExist('/test/path');
    });

    it('should get file info', async () => {
      const result = await FileStorage.getInfo('/test/path');
      expect(result).toHaveProperty('size');
    });

    it('should get all files in directory', async () => {
      const result = await FileStorage.getAllFilesInDirectory('/test/dir');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('path constants', () => {
    it('vcDirectoryPath should be defined', () => {
      expect(vcDirectoryPath).toBeDefined();
      expect(vcDirectoryPath).toContain('inji/VC');
    });

    it('backupDirectoryPath should be defined', () => {
      expect(backupDirectoryPath).toBeDefined();
      expect(backupDirectoryPath).toContain('inji/backup');
    });
  });

  describe('getFilePath', () => {
    it('should return path for vc key', () => {
      const path = getFilePath('test-key');
      expect(path).toContain('test-key.txt');
      expect(path).toContain('inji/VC');
    });
  });

  describe('getBackupFilePath', () => {
    it('should return backup path with default extension', () => {
      const path = getBackupFilePath('backup-key');
      expect(path).toContain('backup-key.injibackup');
    });

    it('should return backup path with custom extension', () => {
      const path = getBackupFilePath('backup-key', '.zip');
      expect(path).toContain('backup-key.zip');
    });
  });

  describe('zipFilePath', () => {
    it('should return zip file path', () => {
      const path = zipFilePath('backup_123');
      expect(path).toContain('backup_123.zip');
    });
  });

  describe('getDirectorySize', () => {
    it('should calculate total size of files in directory', async () => {
      const {readDir} = require('react-native-fs');
      readDir.mockResolvedValue([
        {name: 'file1', size: '100'},
        {name: 'file2', size: '200'},
      ]);
      const size = await getDirectorySize('/test/dir');
      expect(size).toBe(300);
    });
  });

  describe('cleanupLocalBackups', () => {
    it('should cleanup backup files when directory exists', async () => {
      const {exists, readDir, unlink} = require('react-native-fs');
      exists.mockResolvedValue(true);
      readDir.mockResolvedValue([{name: 'backup1.injibackup'}]);
      await cleanupLocalBackups();
    });

    it('should do nothing when directory does not exist', async () => {
      const fs = require('react-native-fs');
      fs.exists.mockResolvedValue(false);
      await cleanupLocalBackups();
    });
  });

  describe('compressAndRemoveFile', () => {
    it('should compress file, remove original, and return stat', async () => {
      const fs = require('react-native-fs');
      const zipArchive = require('react-native-zip-archive');
      zipArchive.zip.mockResolvedValue('/mock/backup/test.zip');
      fs.stat.mockResolvedValue({size: 512, isDirectory: () => false});
      fs.unlink.mockResolvedValue(undefined);
      const result = await compressAndRemoveFile('test');
      expect(zipArchive.zip).toHaveBeenCalled();
      expect(fs.unlink).toHaveBeenCalled();
      expect(result).toHaveProperty('size', 512);
    });
  });

  describe('unZipAndRemoveFile', () => {
    it('should unzip file and remove the zip', async () => {
      const fs = require('react-native-fs');
      const zipArchive = require('react-native-zip-archive');
      zipArchive.unzip.mockResolvedValue('/mock/unzipped');
      fs.unlink.mockResolvedValue(undefined);
      const result = await unZipAndRemoveFile('test');
      expect(zipArchive.unzip).toHaveBeenCalled();
      expect(result).toBe('/mock/unzipped');
    });
  });

  describe('writeToBackupFile', () => {
    it('should write data to backup file', async () => {
      const fs = require('react-native-fs');
      fs.exists.mockResolvedValue(false);
      const result = await writeToBackupFile({test: 'data'});
      expect(typeof result).toBe('string');
    });

    it('should remove existing backup before writing', async () => {
      const fs = require('react-native-fs');
      fs.exists.mockResolvedValue(true);
      fs.readDir.mockResolvedValue([{name: 'old_backup.injibackup'}]);
      fs.unlink.mockResolvedValue(undefined);
      const result = await writeToBackupFile({test: 'data2'});
      expect(fs.unlink).toHaveBeenCalled();
      expect(typeof result).toBe('string');
    });

    it('should handle empty directory gracefully', async () => {
      const fs = require('react-native-fs');
      fs.exists.mockResolvedValue(true);
      fs.readDir.mockResolvedValue([]);
      const result = await writeToBackupFile({x: 1});
      expect(typeof result).toBe('string');
    });
  });

  describe('removeItemIfExist edge cases', () => {
    it('should not remove when file does not exist', async () => {
      const fs = require('react-native-fs');
      fs.exists.mockResolvedValue(false);
      const result = await FileStorage.removeItemIfExist('/nonexistent');
      expect(result).toBeFalsy();
    });
  });

  describe('getDirectorySize edge cases', () => {
    it('should return 0 for empty directory', async () => {
      const fs = require('react-native-fs');
      fs.readDir.mockResolvedValue([]);
      const size = await getDirectorySize('/empty-dir');
      expect(size).toBe(0);
    });

    it('should sum multiple file sizes', async () => {
      const fs = require('react-native-fs');
      fs.readDir.mockResolvedValue([
        {name: 'a', size: '50'},
        {name: 'b', size: '75'},
        {name: 'c', size: '125'},
      ]);
      const size = await getDirectorySize('/dir');
      expect(size).toBe(250);
    });
  });

  describe('isVCStorageInitialised', () => {
    it('should return true when directory exists', async () => {
      const fs = require('react-native-fs');
      fs.stat.mockResolvedValue({size: 1024, isDirectory: () => true});
      const result = await isVCStorageInitialised();
      expect(result).toBe(true);
    });

    it('should return false when error occurs', async () => {
      const {stat} = require('react-native-fs');
      stat.mockRejectedValue(new Error('not found'));
      const result = await isVCStorageInitialised();
      expect(result).toBe(false);
    });
  });
});
