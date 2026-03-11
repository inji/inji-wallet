jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn().mockResolvedValue({isConnected: true}),
}));
jest.mock('../../../shared/CloudBackupAndRestoreUtils', () => ({
  __esModule: true,
  default: {
    downloadLatestBackup: jest.fn(),
    NO_BACKUP_FILE: 'no_backup_file',
  },
}));
jest.mock('../../../shared/storage', () => ({
  isMinimumStorageLimitReached: jest.fn().mockResolvedValue(false),
}));
jest.mock('../../../shared/fileStorage', () => ({
  __esModule: true,
  default: {
    readFile: jest.fn().mockResolvedValue('{"key":"value"}'),
  },
  getBackupFilePath: jest.fn(name => `/mock/path/${name}.injibackup`),
  unZipAndRemoveFile: jest.fn().mockResolvedValue('/mock/unzipped'),
}));

import {restoreService} from './restoreService';
import NetInfo from '@react-native-community/netinfo';
import Cloud from '../../../shared/CloudBackupAndRestoreUtils';
import {isMinimumStorageLimitReached} from '../../../shared/storage';
import fileStorage, {unZipAndRemoveFile} from '../../../shared/fileStorage';

describe('restoreService', () => {
  const mockModel = {
    events: {
      DATA_FROM_FILE: jest.fn(data => ({
        type: 'DATA_FROM_FILE',
        dataFromBackupFile: data,
      })),
    },
  };

  let services: ReturnType<typeof restoreService>;

  beforeEach(() => {
    jest.clearAllMocks();
    services = restoreService(mockModel);
  });

  describe('checkInternet', () => {
    it('should call NetInfo.fetch', async () => {
      const result = await services.checkInternet();
      expect(NetInfo.fetch).toHaveBeenCalled();
      expect(result).toEqual({isConnected: true});
    });
  });

  describe('checkStorageAvailability', () => {
    it('should check minimum storage', async () => {
      const checker = services.checkStorageAvailability();
      const result = await checker();
      expect(isMinimumStorageLimitReached).toHaveBeenCalledWith(
        'minStorageRequired',
      );
      expect(result).toBe(false);
    });
  });

  describe('downloadLatestBackup', () => {
    it('should download latest backup', async () => {
      (Cloud.downloadLatestBackup as jest.Mock).mockResolvedValue('backup_123');
      const downloader = services.downloadLatestBackup();
      const result = await downloader();
      expect(Cloud.downloadLatestBackup).toHaveBeenCalled();
      expect(result).toBe('backup_123');
    });

    it('should return error when backup is null', async () => {
      (Cloud.downloadLatestBackup as jest.Mock).mockResolvedValue(null);
      const downloader = services.downloadLatestBackup();
      const result = await downloader();
      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('unzipBackupFile', () => {
    it('should unzip backup file', async () => {
      const context = {fileName: 'backup_123'};
      const unzipper = services.unzipBackupFile(context, {});
      const result = await unzipper();
      expect(unZipAndRemoveFile).toHaveBeenCalledWith('backup_123');
    });
  });

  describe('readBackupFile', () => {
    it('should read backup file and send event', async () => {
      const context = {fileName: 'backup_123'};
      const callback = jest.fn();
      const reader = services.readBackupFile(context, {});
      await reader(callback);
      expect(fileStorage.readFile).toHaveBeenCalled();
      expect(callback).toHaveBeenCalled();
    });

    it('should strip .injibackup extension from fileName', async () => {
      const context = {fileName: 'backup_123.injibackup'};
      const callback = jest.fn();
      const reader = services.readBackupFile(context, {});
      await reader(callback);
      expect(context.fileName).toBe('backup_123');
    });
  });
});
