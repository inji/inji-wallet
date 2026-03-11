jest.mock('./constants', () => ({
  ...jest.requireActual('./constants'),
  isIOS: () => false,
  APP_ID_LENGTH: 10,
}));

import {
  __AppId,
  __TuvaliVersion,
  __InjiVersion,
  __SessionId,
} from './GlobalVariables';

describe('GlobalVariables', () => {
  describe('__AppId', () => {
    it('should set and get value', () => {
      __AppId.setValue('test-app-id');
      expect(__AppId.getValue()).toBe('test-app-id');
    });

    it('should update value', () => {
      __AppId.setValue('first-id');
      __AppId.setValue('second-id');
      expect(__AppId.getValue()).toBe('second-id');
    });
  });

  describe('__TuvaliVersion', () => {
    it('getValue should delegate to getpackageVersion', () => {
      expect(__TuvaliVersion.getValue()).toBe(
        __TuvaliVersion.getpackageVersion(),
      );
    });
  });

  describe('__InjiVersion', () => {
    it('should return a value', () => {
      const version = __InjiVersion.getValue();
      expect(version).toBeDefined();
    });
  });

  describe('__SessionId', () => {
    it('should return a value', () => {
      const id = __SessionId.getValue();
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });
  });
});
