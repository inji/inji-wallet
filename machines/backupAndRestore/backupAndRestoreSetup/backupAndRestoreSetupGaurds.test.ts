import {backupAndRestoreSetupGaurds} from './backupAndRestoreSetupGaurds';

jest.mock('../../../shared/CloudBackupAndRestoreUtils', () => ({
  __esModule: true,
  default: {
    status: {SUCCESS: 'SUCCESS', FAILURE: 'FAILURE'},
  },
}));

jest.mock('../../../shared/constants', () => ({
  NETWORK_REQUEST_FAILED: 'Network request failed',
  isIOS: jest.fn(() => false),
}));

describe('backupAndRestoreSetupGaurds', () => {
  const guards = backupAndRestoreSetupGaurds();

  describe('isInternetConnected', () => {
    it('should return true when connected', () => {
      const event = {data: {isConnected: true}};
      expect(guards.isInternetConnected({}, event)).toBe(true);
    });

    it('should return false when not connected', () => {
      const event = {data: {isConnected: false}};
      expect(guards.isInternetConnected({}, event)).toBe(false);
    });
  });

  describe('isNetworkError', () => {
    it('should return true for network error', () => {
      const event = {data: {error: 'Network request failed'}};
      expect(guards.isNetworkError({}, event)).toBe(true);
    });

    it('should return false for other errors', () => {
      const event = {data: {error: 'some other error'}};
      expect(guards.isNetworkError({}, event)).toBe(false);
    });
  });

  describe('isSignedIn', () => {
    it('should return true when signed in', () => {
      const event = {data: {isSignedIn: true}};
      expect(guards.isSignedIn({}, event)).toBe(true);
    });

    it('should return false when not signed in', () => {
      const event = {data: {isSignedIn: false}};
      expect(guards.isSignedIn({}, event)).toBe(false);
    });
  });

  describe('isIOSAndSignInFailed', () => {
    const {isIOS} = require('../../../shared/constants');

    it('should return true when iOS and sign in failed', () => {
      (isIOS as jest.Mock).mockReturnValue(true);
      const event = {data: {status: 'FAILURE'}};
      expect(guards.isIOSAndSignInFailed({}, event)).toBe(true);
    });

    it('should return false when sign in succeeded', () => {
      (isIOS as jest.Mock).mockReturnValue(true);
      const event = {data: {status: 'SUCCESS'}};
      expect(guards.isIOSAndSignInFailed({}, event)).toBe(false);
    });

    it('should return false on Android', () => {
      (isIOS as jest.Mock).mockReturnValue(false);
      const event = {data: {status: 'FAILURE'}};
      expect(guards.isIOSAndSignInFailed({}, event)).toBe(false);
    });
  });

  describe('isConfirmationAlreadyShown', () => {
    it('should return true when confirmation was shown', () => {
      const event = {
        response: {encryptedData: {isAccountSelectionConfirmationShown: true}},
      };
      expect(guards.isConfirmationAlreadyShown({}, event)).toBe(true);
    });

    it('should return false when confirmation was not shown', () => {
      const event = {
        response: {encryptedData: {isAccountSelectionConfirmationShown: false}},
      };
      expect(guards.isConfirmationAlreadyShown({}, event)).toBe(false);
    });
  });

  describe('isSignInSuccessful', () => {
    it('should return true when status is SUCCESS', () => {
      const event = {data: {status: 'SUCCESS'}};
      expect(guards.isSignInSuccessful({}, event)).toBe(true);
    });

    it('should return false when status is not SUCCESS', () => {
      const event = {data: {status: 'FAILURE'}};
      expect(guards.isSignInSuccessful({}, event)).toBe(false);
    });
  });

  describe('isAuthorisedAndCloudAccessNotGiven', () => {
    it('should return true when isAuthorised is true', () => {
      const event = {data: {isAuthorised: true}};
      expect(guards.isAuthorisedAndCloudAccessNotGiven({}, event)).toBe(true);
    });

    it('should return false when isAuthorised is false', () => {
      const event = {data: {isAuthorised: false}};
      expect(guards.isAuthorisedAndCloudAccessNotGiven({}, event)).toBe(false);
    });
  });
});
