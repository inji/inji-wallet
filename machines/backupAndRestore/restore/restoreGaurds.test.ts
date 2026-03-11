import {restoreGaurd} from './restoreGaurds';

describe('restoreGaurd', () => {
  const guards = restoreGaurd();

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

  describe('isMinimumStorageRequiredForBackupRestorationReached', () => {
    it('should return true when event data is truthy', () => {
      expect(
        guards.isMinimumStorageRequiredForBackupRestorationReached(
          {},
          {data: true},
        ),
      ).toBe(true);
    });

    it('should return false when event data is falsy', () => {
      expect(
        guards.isMinimumStorageRequiredForBackupRestorationReached(
          {},
          {data: false},
        ),
      ).toBe(false);
      expect(
        guards.isMinimumStorageRequiredForBackupRestorationReached(
          {},
          {data: null},
        ),
      ).toBe(false);
    });
  });
});
