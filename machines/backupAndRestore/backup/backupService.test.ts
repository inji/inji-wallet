jest.mock('../../../shared/CloudBackupAndRestoreUtils', () => ({
  __esModule: true,
  default: {
    lastBackupDetails: jest.fn(() => Promise.resolve({date: '2024-01-01'})),
    uploadBackupFileToDrive: jest.fn(() => Promise.resolve({success: true})),
  },
}));

jest.mock('../../../shared/constants', () => ({
  UPLOAD_MAX_RETRY: 3,
}));

jest.mock('../../../shared/fileStorage', () => ({
  compressAndRemoveFile: jest.fn(() => Promise.resolve('/compressed/file.zip')),
  writeToBackupFile: jest.fn(() => Promise.resolve('backup-file.json')),
}));

jest.mock('../../../shared/storage', () => ({
  __esModule: true,
  default: {},
  isMinimumLimitForBackupReached: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({isConnected: true, type: 'wifi'})),
}));

import {backupService} from './backupService';
import Cloud from '../../../shared/CloudBackupAndRestoreUtils';
import {
  compressAndRemoveFile,
  writeToBackupFile,
} from '../../../shared/fileStorage';
import {isMinimumLimitForBackupReached} from '../../../shared/storage';
import NetInfo from '@react-native-community/netinfo';

describe('backupService', () => {
  const mockModel = {
    events: {
      FILE_NAME: jest.fn((name: string) => ({type: 'FILE_NAME', data: name})),
    },
  };

  let services: ReturnType<typeof backupService>;

  beforeEach(() => {
    jest.clearAllMocks();
    services = backupService(mockModel);
  });

  it('should return an object with all service functions', () => {
    expect(services).toHaveProperty('checkInternet');
    expect(services).toHaveProperty('getLastBackupDetailsFromCloud');
    expect(services).toHaveProperty('checkStorageAvailability');
    expect(services).toHaveProperty('writeDataToFile');
    expect(services).toHaveProperty('zipBackupFile');
    expect(services).toHaveProperty('uploadBackupFile');
  });

  describe('checkInternet', () => {
    it('should call NetInfo.fetch', async () => {
      const result = await services.checkInternet();
      expect(NetInfo.fetch).toHaveBeenCalled();
      expect(result).toEqual({isConnected: true, type: 'wifi'});
    });
  });

  describe('getLastBackupDetailsFromCloud', () => {
    it('should return a function that gets last backup details', async () => {
      const innerFn = services.getLastBackupDetailsFromCloud();
      const result = await innerFn();
      expect(Cloud.lastBackupDetails).toHaveBeenCalled();
      expect(result).toEqual({date: '2024-01-01'});
    });
  });

  describe('checkStorageAvailability', () => {
    it('should return true when storage is available', async () => {
      const innerFn = services.checkStorageAvailability();
      const result = await innerFn();
      expect(isMinimumLimitForBackupReached).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should throw on error', async () => {
      (isMinimumLimitForBackupReached as jest.Mock).mockRejectedValueOnce(
        new Error('storage err'),
      );
      const innerFn = services.checkStorageAvailability();
      await expect(innerFn()).rejects.toThrow('storage err');
    });
  });

  describe('writeDataToFile', () => {
    it('should write data and send callback with filename', async () => {
      const mockCallback = jest.fn();
      const context = {dataFromStorage: {key: 'value'}};
      await services.writeDataToFile(context, {})(mockCallback);
      expect(writeToBackupFile).toHaveBeenCalledWith({key: 'value'});
      expect(mockModel.events.FILE_NAME).toHaveBeenCalledWith(
        'backup-file.json',
      );
      expect(mockCallback).toHaveBeenCalled();
    });
  });

  describe('zipBackupFile', () => {
    it('should compress backup file', async () => {
      const context = {fileName: 'backup.json'};
      const innerFn = services.zipBackupFile(context, {});
      const result = await innerFn();
      expect(compressAndRemoveFile).toHaveBeenCalledWith('backup.json');
      expect(result).toBe('/compressed/file.zip');
    });
  });

  describe('uploadBackupFile', () => {
    it('should upload backup file to cloud', async () => {
      const context = {fileName: 'backup.zip'};
      const innerFn = services.uploadBackupFile(context, {});
      const result = await innerFn();
      expect(Cloud.uploadBackupFileToDrive).toHaveBeenCalledWith(
        'backup.zip',
        3,
      );
      expect(result).toEqual({success: true});
    });
  });
});
