import {backupGaurds} from './backupGaurds';

describe('backupGaurds', () => {
  const guards = backupGaurds();

  describe('isInternetConnected', () => {
    it('should return true when connected', () => {
      const event = {data: {isConnected: true}};
      expect(guards.isInternetConnected({}, event)).toBe(true);
    });

    it('should return false when not connected', () => {
      const event = {data: {isConnected: false}};
      expect(guards.isInternetConnected({}, event)).toBe(false);
    });

    it('should return false when isConnected is null', () => {
      const event = {data: {isConnected: null}};
      expect(guards.isInternetConnected({}, event)).toBe(false);
    });
  });

  describe('isMinimumStorageRequiredForBackupAvailable', () => {
    it('should return true when event data is falsy (storage available)', () => {
      expect(
        guards.isMinimumStorageRequiredForBackupAvailable({}, {data: false}),
      ).toBe(true);
      expect(
        guards.isMinimumStorageRequiredForBackupAvailable({}, {data: null}),
      ).toBe(true);
      expect(
        guards.isMinimumStorageRequiredForBackupAvailable({}, {data: 0}),
      ).toBe(true);
    });

    it('should return false when event data is truthy (storage not available)', () => {
      expect(
        guards.isMinimumStorageRequiredForBackupAvailable({}, {data: true}),
      ).toBe(false);
    });
  });

  describe('checkIfAutoBackup', () => {
    it('should return true when isAutoBackUp is true', () => {
      expect(guards.checkIfAutoBackup({isAutoBackUp: true})).toBe(true);
    });

    it('should return false when isAutoBackUp is false', () => {
      expect(guards.checkIfAutoBackup({isAutoBackUp: false})).toBe(false);
    });
  });

  describe('isVCFound', () => {
    it('should return true when response has items', () => {
      const event = {response: [{id: 'vc1'}]};
      expect(guards.isVCFound({}, event)).toBe(true);
    });

    it('should return false when response is empty', () => {
      const event = {response: []};
      expect(guards.isVCFound({}, event)).toBe(false);
    });

    it('should return false when response is null', () => {
      const event = {response: null};
      expect(guards.isVCFound({}, event)).toBe(false);
    });
  });

  describe('isNetworkError', () => {
    it('should return true for network request failed error', () => {
      const event = {data: 'Error: Network request failed'};
      expect(guards.isNetworkError({}, event)).toBe(true);
    });

    it('should return false for other errors', () => {
      const event = {data: 'Error: timeout'};
      expect(guards.isNetworkError({}, event)).toBe(false);
    });
  });
});
