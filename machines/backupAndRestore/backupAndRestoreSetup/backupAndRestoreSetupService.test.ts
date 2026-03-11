jest.mock('../../../shared/CloudBackupAndRestoreUtils', () => ({
  isSignedInAlready: jest.fn(),
  signIn: jest.fn(),
}));
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
}));

import {backupAndRestoreSetupService} from './backupAndRestoreSetupService';
import Cloud from '../../../shared/CloudBackupAndRestoreUtils';
import NetInfo from '@react-native-community/netinfo';

describe('backupAndRestoreSetupService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return an object with service functions', () => {
    const services = backupAndRestoreSetupService();
    expect(services).toHaveProperty('isUserSignedAlready');
    expect(services).toHaveProperty('signIn');
    expect(services).toHaveProperty('checkInternet');
  });

  describe('isUserSignedAlready', () => {
    it('should return an async function that calls Cloud.isSignedInAlready', async () => {
      (Cloud.isSignedInAlready as jest.Mock).mockResolvedValue(true);
      const services = backupAndRestoreSetupService();
      const outerFn = services.isUserSignedAlready();
      const result = await outerFn();
      expect(Cloud.isSignedInAlready).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when user is not signed in', async () => {
      (Cloud.isSignedInAlready as jest.Mock).mockResolvedValue(false);
      const services = backupAndRestoreSetupService();
      const result = await services.isUserSignedAlready()();
      expect(result).toBe(false);
    });
  });

  describe('signIn', () => {
    it('should return an async function that calls Cloud.signIn', async () => {
      (Cloud.signIn as jest.Mock).mockResolvedValue({success: true});
      const services = backupAndRestoreSetupService();
      const result = await services.signIn()();
      expect(Cloud.signIn).toHaveBeenCalled();
      expect(result).toEqual({success: true});
    });
  });

  describe('checkInternet', () => {
    it('should call NetInfo.fetch', async () => {
      const mockNetState = {isConnected: true, isInternetReachable: true};
      (NetInfo.fetch as jest.Mock).mockResolvedValue(mockNetState);
      const services = backupAndRestoreSetupService();
      const result = await services.checkInternet();
      expect(NetInfo.fetch).toHaveBeenCalled();
      expect(result).toEqual(mockNetState);
    });

    it('should return disconnected state', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({isConnected: false});
      const services = backupAndRestoreSetupService();
      const result = await services.checkInternet();
      expect(result.isConnected).toBe(false);
    });
  });
});
