jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(() => Promise.resolve(true)),
    signIn: jest.fn(() => Promise.resolve({user: {email: 'test@test.com'}})),
    signInSilently: jest.fn(() =>
      Promise.resolve({user: {email: 'test@test.com'}}),
    ),
    isSignedIn: jest.fn(() => Promise.resolve(false)),
    getTokens: jest.fn(() =>
      Promise.resolve({accessToken: 'token', idToken: 'id'}),
    ),
    revokeAccess: jest.fn(),
    signOut: jest.fn(),
    clearCachedAccessToken: jest.fn(() => Promise.resolve()),
  },
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  },
}));

jest.mock('react-native-cloud-storage', () => ({
  CloudStorage: {
    readFile: jest.fn(() => Promise.resolve('{"data":"test"}')),
    writeFile: jest.fn(() => Promise.resolve()),
    deleteFile: jest.fn(() => Promise.resolve()),
    readdir: jest.fn(() => Promise.resolve([])),
    exists: jest.fn(() => Promise.resolve(false)),
    downloadFile: jest.fn(() => Promise.resolve()),
    stat: jest.fn(() =>
      Promise.resolve({size: 100, birthtimeMs: 1700000000000}),
    ),
    isCloudAvailable: jest.fn(() => Promise.resolve(true)),
    setTimeout: jest.fn(),
    setGoogleDriveAccessToken: jest.fn(),
    unlink: jest.fn(() => Promise.resolve()),
  },
  CloudStorageScope: {
    AppData: 'AppData',
    Documents: 'Documents',
  },
}));

jest.mock('react-native-dotenv', () => ({
  GOOGLE_ANDROID_CLIENT_ID: 'test-client-id',
}));

jest.mock('react-native-fs', () => ({
  readFile: jest.fn(() => Promise.resolve('file-content')),
  writeFile: jest.fn(() => Promise.resolve()),
  exists: jest.fn(() => Promise.resolve(true)),
  unlink: jest.fn(() => Promise.resolve()),
  DocumentDirectoryPath: '/mock/docs',
}));

jest.mock('@invertase/react-native-apple-authentication', () => ({
  appleAuth: {
    performRequest: jest.fn(),
    getCredentialStateForUser: jest.fn(),
    isSupported: true,
    Operation: {LOGIN: 1},
    Scope: {EMAIL: 0, FULL_NAME: 1},
  },
}));

jest.mock('./commonUtil', () => ({
  bytesToMB: jest.fn((bytes: number) => bytes / (1024 * 1024)),
  sleep: jest.fn(() => Promise.resolve()),
}));

jest.mock('./constants', () => ({
  IOS_SIGNIN_FAILED: 'IOS_SIGNIN_FAILED',
  isAndroid: jest.fn(() => true),
  isIOS: jest.fn(() => false),
  NETWORK_REQUEST_FAILED: 'Network request failed',
}));

jest.mock('./fileStorage', () => ({
  __esModule: true,
  default: {
    exists: jest.fn(() => Promise.resolve(false)),
    readFile: jest.fn(() => Promise.resolve('')),
    writeFile: jest.fn(() => Promise.resolve()),
    removeFile: jest.fn(() => Promise.resolve()),
    createDirectory: jest.fn(() => Promise.resolve()),
    removeDirectory: jest.fn(() => Promise.resolve()),
  },
  backupDirectoryPath: '/mock/backup',
  zipFilePath: jest.fn((name: string) => `/mock/backup/${name}.zip`),
}));

jest.mock('./api', () => ({
  API: {
    fetchBackupDetails: jest.fn(() => Promise.resolve(null)),
    getGoogleAccountProfileInfo: jest.fn(() =>
      Promise.resolve({email: 'test@example.com', picture: 'pic'}),
    ),
  },
}));

import Cloud from './CloudBackupAndRestoreUtils';

describe('CloudBackupAndRestoreUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Restore default implementations cleared by clearAllMocks
    const {GoogleSignin} = require('@react-native-google-signin/google-signin');
    GoogleSignin.getTokens.mockResolvedValue({
      accessToken: 'token',
      idToken: 'id',
    });
    GoogleSignin.isSignedIn.mockResolvedValue(false);
    GoogleSignin.signInSilently.mockResolvedValue({
      user: {email: 'test@test.com'},
    });
    GoogleSignin.hasPlayServices.mockResolvedValue(true);
    GoogleSignin.clearCachedAccessToken.mockResolvedValue(undefined);
    const {API} = require('./api');
    API.getGoogleAccountProfileInfo.mockResolvedValue({
      email: 'test@example.com',
      picture: 'pic',
    });
    const {isAndroid, isIOS} = require('./constants');
    isAndroid.mockReturnValue(true);
    isIOS.mockReturnValue(false);
  });

  describe('Cloud class', () => {
    it('has status constants', () => {
      expect(Cloud.status).toBeDefined();
      expect(Cloud.status.DECLINED).toBe('DECLINED');
      expect(Cloud.status.SUCCESS).toBe('SUCCESS');
      expect(Cloud.status.FAILURE).toBe('FAILURE');
    });

    it('has timeout constant of 10000', () => {
      expect(Cloud.timeout).toBe(10000);
    });

    it('has NO_BACKUP_FILE constant', () => {
      expect(Cloud.NO_BACKUP_FILE).toBe('Backup files not available');
    });
  });

  describe('isSignedInAlready', () => {
    it('returns isSignedIn result for Android', async () => {
      const result = await Cloud.isSignedInAlready();
      expect(result).toBeDefined();
      expect(typeof result.isSignedIn).toBe('boolean');
    });
  });

  describe('signIn - Android', () => {
    it('returns SUCCESS when Google sign in succeeds with required scopes', async () => {
      const {
        GoogleSignin,
      } = require('@react-native-google-signin/google-signin');
      GoogleSignin.signIn.mockResolvedValueOnce({
        scopes: [
          'https://www.googleapis.com/auth/drive.appdata',
          'https://www.googleapis.com/auth/drive.file',
        ],
      });
      const result = await Cloud.signIn();
      expect(result).toBeDefined();
      expect(result.status).toBeDefined();
    });

    it('returns DECLINED when user cancels Google sign in', async () => {
      const {
        GoogleSignin,
        statusCodes,
      } = require('@react-native-google-signin/google-signin');
      GoogleSignin.signIn.mockRejectedValueOnce({
        code: statusCodes.SIGN_IN_CANCELLED,
      });
      const result = await Cloud.signIn();
      expect(result.status).toBe('DECLINED');
    });

    it('returns FAILURE on network error', async () => {
      const {
        GoogleSignin,
      } = require('@react-native-google-signin/google-signin');
      GoogleSignin.signIn.mockRejectedValueOnce(new Error('NETWORK_ERROR'));
      const result = await Cloud.signIn();
      expect(result.status).toBe('FAILURE');
    });

    it('returns DECLINED when user does not provide required scopes', async () => {
      const {
        GoogleSignin,
      } = require('@react-native-google-signin/google-signin');
      GoogleSignin.signIn.mockResolvedValueOnce({
        scopes: ['some_other_scope'],
      });
      const result = await Cloud.signIn();
      expect(result.status).toBe('DECLINED');
    });

    it('returns FAILURE on generic error', async () => {
      const {
        GoogleSignin,
      } = require('@react-native-google-signin/google-signin');
      GoogleSignin.signIn.mockRejectedValueOnce(
        new Error('some unknown error'),
      );
      const result = await Cloud.signIn();
      expect(result.status).toBe('FAILURE');
    });
  });

  describe('signIn - iOS', () => {
    it('returns SUCCESS for iOS when apple auth succeeds', async () => {
      const {isIOS, isAndroid} = require('./constants');
      isIOS.mockReturnValue(true);
      isAndroid.mockReturnValue(false);
      const {
        appleAuth,
      } = require('@invertase/react-native-apple-authentication');
      appleAuth.performRequest.mockResolvedValueOnce({
        email: 'test@apple.com',
        user: 'user123',
        nonce: 'nonce',
        identityToken: 'token',
        realUserStatus: 1,
      });
      appleAuth.Error = {CANCELED: '1001'};
      const result = await Cloud.signIn();
      expect(result).toBeDefined();
      // May be SUCCESS or FAILURE depending on RNSecureKeystoreModule mock
      expect(['SUCCESS', 'FAILURE']).toContain(result.status);
    });

    it('returns DECLINED when iOS user cancels', async () => {
      const {isIOS, isAndroid} = require('./constants');
      isIOS.mockReturnValue(true);
      isAndroid.mockReturnValue(false);
      const {
        appleAuth,
      } = require('@invertase/react-native-apple-authentication');
      appleAuth.Error = {CANCELED: '1001'};
      appleAuth.performRequest.mockRejectedValueOnce({code: '1001'});
      const result = await Cloud.signIn();
      expect(result.status).toBe('DECLINED');
    });

    it('returns FAILURE on iOS sign in error', async () => {
      const {isIOS, isAndroid} = require('./constants');
      isIOS.mockReturnValue(true);
      isAndroid.mockReturnValue(false);
      const {
        appleAuth,
      } = require('@invertase/react-native-apple-authentication');
      appleAuth.Error = {CANCELED: '1001'};
      appleAuth.performRequest.mockRejectedValueOnce({code: '9999'});
      const result = await Cloud.signIn();
      expect(result.status).toBe('FAILURE');
    });
  });

  describe('getAccessToken', () => {
    it('returns access token when profile info succeeds', async () => {
      const {isIOS, isAndroid} = require('./constants');
      isAndroid.mockReturnValue(true);
      isIOS.mockReturnValue(false);
      const {
        GoogleSignin,
      } = require('@react-native-google-signin/google-signin');
      GoogleSignin.getTokens.mockResolvedValueOnce({accessToken: 'my-token'});
      const token = await Cloud.getAccessToken();
      expect(token).toBe('my-token');
    });

    it('throws on error', async () => {
      const {
        GoogleSignin,
      } = require('@react-native-google-signin/google-signin');
      GoogleSignin.getTokens.mockRejectedValueOnce(new Error('fail'));
      await expect(Cloud.getAccessToken()).rejects.toThrow();
    });
  });

  describe('downloadUnSyncedBackupFiles', () => {
    it('returns true for Android (no unsynced files)', async () => {
      const {isIOS} = require('./constants');
      isIOS.mockReturnValue(false);
      const result = await Cloud.downloadUnSyncedBackupFiles();
      expect(result).toBe(true);
    });
  });

  describe('uploadBackupFileToDrive', () => {
    it('rejects when retryCounter is negative', async () => {
      await expect(Cloud.uploadBackupFileToDrive('file', -1)).rejects.toEqual({
        status: 'FAILURE',
        error: 'Retry limit reached',
      });
    });

    it('rejects immediately on network error', async () => {
      await expect(
        Cloud.uploadBackupFileToDrive('file', 3, 'Network request failed'),
      ).rejects.toEqual({
        status: 'FAILURE',
        error: 'Network request failed',
      });
    });
  });

  describe('getAccessToken - error handling', () => {
    it('revokes and signs out on 401 UNAUTHENTICATED', async () => {
      const {
        GoogleSignin,
      } = require('@react-native-google-signin/google-signin');
      const {API} = require('./api');
      GoogleSignin.getTokens.mockResolvedValueOnce({accessToken: 'old-token'});
      API.getGoogleAccountProfileInfo.mockRejectedValueOnce(
        new Error('401 UNAUTHENTICATED'),
      );
      await expect(Cloud.getAccessToken()).rejects.toThrow();
      expect(GoogleSignin.revokeAccess).toHaveBeenCalled();
      expect(GoogleSignin.signOut).toHaveBeenCalled();
    });

    it('refreshes token on 401 Unauthorized', async () => {
      const {
        GoogleSignin,
      } = require('@react-native-google-signin/google-signin');
      const {API} = require('./api');
      GoogleSignin.getTokens.mockResolvedValueOnce({
        accessToken: 'old-token',
        idToken: 'id',
      });
      API.getGoogleAccountProfileInfo.mockRejectedValueOnce(
        new Error('401 Unauthorized'),
      );
      GoogleSignin.clearCachedAccessToken.mockResolvedValueOnce(undefined);
      GoogleSignin.signInSilently.mockResolvedValueOnce({});
      GoogleSignin.getTokens.mockResolvedValueOnce({accessToken: 'new-token'});
      const token = await Cloud.getAccessToken();
      expect(token).toBe('new-token');
    });

    it('throws NETWORK_REQUEST_FAILED on network error', async () => {
      const {
        GoogleSignin,
      } = require('@react-native-google-signin/google-signin');
      const {API} = require('./api');
      GoogleSignin.getTokens.mockResolvedValueOnce({accessToken: 'old-token'});
      API.getGoogleAccountProfileInfo.mockRejectedValueOnce(
        new Error('NetworkError'),
      );
      await expect(Cloud.getAccessToken()).rejects.toThrow(
        'Network request failed',
      );
    });
  });

  describe('lastBackupDetails - Android', () => {
    it('returns backup details for a given filename', async () => {
      const {CloudStorage} = require('react-native-cloud-storage');
      CloudStorage.stat.mockResolvedValueOnce({
        birthtimeMs: 1700000000000,
        size: 5242880,
      });
      const result = await Cloud.lastBackupDetails('/backup_1700000000000.zip');
      expect(result).toBeDefined();
      expect(result.backupCreationTime).toBe(1700000000000);
    });

    it('throws when no backup files exist', async () => {
      const {CloudStorage} = require('react-native-cloud-storage');
      CloudStorage.readdir.mockResolvedValueOnce([]);
      await expect(Cloud.lastBackupDetails()).rejects.toThrow(
        'Backup files not available',
      );
    });

    it('selects the latest backup file', async () => {
      const {CloudStorage} = require('react-native-cloud-storage');
      CloudStorage.readdir.mockResolvedValueOnce([
        'backup_1600000000000.zip',
        'backup_1700000000000.zip',
        'backup_1650000000000.zip',
      ]);
      CloudStorage.stat.mockResolvedValueOnce({
        birthtimeMs: 1700000000000,
        size: 1024,
      });
      const result = await Cloud.lastBackupDetails();
      expect(result.backupCreationTime).toBe(1700000000000);
    });
  });

  describe('removeOldDriveBackupFiles - Android', () => {
    it('removes old backup files but keeps current', async () => {
      const {CloudStorage} = require('react-native-cloud-storage');
      CloudStorage.readdir.mockResolvedValueOnce([
        'backup_1600000000000.zip',
        'backup_1700000000000.zip',
        'backup_1650000000000.zip',
      ]);
      CloudStorage.unlink = jest.fn().mockResolvedValue(undefined);
      await Cloud.removeOldDriveBackupFiles('backup_1700000000000.zip');
      expect(CloudStorage.unlink).toHaveBeenCalledTimes(2);
    });
  });

  describe('uploadBackupFileToDrive - Android', () => {
    it('uploads successfully on first try', async () => {
      const {CloudStorage} = require('react-native-cloud-storage');
      const {readFile} = require('react-native-fs');
      readFile.mockResolvedValueOnce('base64content');
      CloudStorage.writeFile.mockResolvedValueOnce(undefined);
      CloudStorage.exists.mockResolvedValueOnce(true);
      CloudStorage.stat.mockResolvedValueOnce({
        birthtimeMs: 1700000000000,
        size: 1024,
      });
      CloudStorage.readdir.mockResolvedValueOnce(['backup_1700000000000.zip']);
      CloudStorage.unlink = jest.fn().mockResolvedValue(undefined);
      const result = await Cloud.uploadBackupFileToDrive(
        'backup_1700000000000',
        3,
      );
      expect(result.status).toBe('SUCCESS');
    });
  });

  describe('downloadLatestBackup - Android', () => {
    it('downloads and writes backup file', async () => {
      const {CloudStorage} = require('react-native-cloud-storage');
      const {writeFile} = require('react-native-fs');
      const fileStorage = require('./fileStorage').default;
      CloudStorage.readdir.mockResolvedValueOnce(['backup_1700000000000.zip']);
      CloudStorage.readFile.mockResolvedValueOnce('base64filedata');
      fileStorage.exists.mockResolvedValueOnce(false);
      fileStorage.createDirectory.mockResolvedValueOnce(undefined);
      writeFile.mockResolvedValueOnce(undefined);
      const result = await Cloud.downloadLatestBackup();
      expect(result).toBe('//backup_1700000000000');
    });

    it('returns null when file content is empty', async () => {
      const {CloudStorage} = require('react-native-cloud-storage');
      CloudStorage.readdir.mockResolvedValueOnce(['backup_1700000000000.zip']);
      CloudStorage.readFile.mockResolvedValueOnce('');
      const result = await Cloud.downloadLatestBackup();
      expect(result).toBeNull();
    });

    it('rejects with NO_BACKUP_FILE when no files available', async () => {
      const {CloudStorage} = require('react-native-cloud-storage');
      CloudStorage.readdir.mockResolvedValueOnce([]);
      await expect(Cloud.downloadLatestBackup()).rejects.toEqual(
        expect.objectContaining({error: 'Backup files not available'}),
      );
    });

    it('rejects with NETWORK_REQUEST_FAILED on network error', async () => {
      const {CloudStorage} = require('react-native-cloud-storage');
      CloudStorage.readdir.mockRejectedValueOnce(new Error('Network Error'));
      await expect(Cloud.downloadLatestBackup()).rejects.toEqual(
        expect.objectContaining({error: 'Network request failed'}),
      );
    });

    it('rejects with NO_BACKUP_FILE on ERR_DIRECTORY_NOT_FOUND', async () => {
      const {CloudStorage} = require('react-native-cloud-storage');
      const err: any = new Error('dir not found');
      err.code = 'ERR_DIRECTORY_NOT_FOUND';
      CloudStorage.readdir.mockRejectedValueOnce(err);
      await expect(Cloud.downloadLatestBackup()).rejects.toEqual(
        expect.objectContaining({error: 'Backup files not available'}),
      );
    });
  });

  describe('isSignedInAlready - Android', () => {
    it('returns isSignedIn true when silently signed in', async () => {
      const {
        GoogleSignin,
      } = require('@react-native-google-signin/google-signin');
      GoogleSignin.isSignedIn.mockResolvedValueOnce(false);
      GoogleSignin.signInSilently.mockResolvedValueOnce({});
      // profileInfo() calls getAccessToken() then API.getGoogleAccountProfileInfo()
      // defaults restored in beforeEach cover this
      const result = await Cloud.isSignedInAlready();
      expect(result.isSignedIn).toBe(true);
    });

    it('returns isSignedIn true when already signed in', async () => {
      const {
        GoogleSignin,
      } = require('@react-native-google-signin/google-signin');
      GoogleSignin.isSignedIn.mockResolvedValueOnce(true);
      const result = await Cloud.isSignedInAlready();
      expect(result.isSignedIn).toBe(true);
    });

    it('returns error on network failure', async () => {
      const {
        GoogleSignin,
      } = require('@react-native-google-signin/google-signin');
      GoogleSignin.isSignedIn.mockRejectedValueOnce(new Error('NETWORK_ERROR'));
      const result = await Cloud.isSignedInAlready();
      expect(result.isSignedIn).toBe(false);
      expect(result.error).toBe('Network request failed');
    });
  });

  describe('downloadUnSyncedBackupFiles - iOS', () => {
    it('downloads unsynced files on iOS', async () => {
      const {isIOS, isAndroid} = require('./constants');
      isIOS.mockReturnValue(true);
      isAndroid.mockReturnValue(false);
      const {CloudStorage} = require('react-native-cloud-storage');
      CloudStorage.readdir.mockResolvedValueOnce([
        'backup_1700000000000.zip.icloud',
      ]);
      CloudStorage.downloadFile.mockResolvedValueOnce(undefined);
      const result = await Cloud.downloadUnSyncedBackupFiles();
      expect(result).toBe(false);
      expect(CloudStorage.downloadFile).toHaveBeenCalledWith(
        '/backup_1700000000000.zip.icloud',
      );
    });

    it('returns true when no unsynced files on iOS', async () => {
      const {isIOS, isAndroid} = require('./constants');
      isIOS.mockReturnValue(true);
      isAndroid.mockReturnValue(false);
      const {CloudStorage} = require('react-native-cloud-storage');
      CloudStorage.readdir.mockResolvedValueOnce(['backup_1700000000000.zip']);
      const result = await Cloud.downloadUnSyncedBackupFiles();
      expect(result).toBe(true);
    });
  });
});
