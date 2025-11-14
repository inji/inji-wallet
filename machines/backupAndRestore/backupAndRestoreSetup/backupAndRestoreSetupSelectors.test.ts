/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  selectIsLoading,
  selectProfileInfo,
  selectIsNetworkError,
  selectShouldTriggerAutoBackup,
  selectShowAccountSelectionConfirmation,
  selectIsSigningIn,
  selectIsSigningInSuccessful,
  selectIsSigningFailure,
  selectIsCloudSignedInFailed,
} from './backupAndRestoreSetupSelectors';

describe('backupAndRestoreSetupSelectors', () => {
  const mockProfileInfo = {
    email: 'test@example.com',
    name: 'Test User',
    id: 'user123',
  };

  const mockState: any = {
    context: {
      isLoading: false,
      profileInfo: mockProfileInfo,
      shouldTriggerAutoBackup: true,
    },
    matches: jest.fn(() => false),
  };

  describe('selectIsLoading', () => {
    it('should return loading status from context', () => {
      const result = selectIsLoading(mockState);
      expect(result).toBe(false);
    });

    it('should return true when loading', () => {
      const state: any = {
        ...mockState,
        context: {...mockState.context, isLoading: true},
      };
      const result = selectIsLoading(state);
      expect(result).toBe(true);
    });
  });

  describe('selectProfileInfo', () => {
    it('should return profile info from context', () => {
      const result = selectProfileInfo(mockState);
      expect(result).toEqual(mockProfileInfo);
    });

    it('should return profile with all properties', () => {
      const result = selectProfileInfo(mockState);
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('id');
    });

    it('should handle null profile info', () => {
      const state: any = {
        ...mockState,
        context: {...mockState.context, profileInfo: null},
      };
      const result = selectProfileInfo(state);
      expect(result).toBeNull();
    });
  });

  describe('selectIsNetworkError', () => {
    it('should return true when in init.noInternet state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'init.noInternet'),
      };
      const result = selectIsNetworkError(state);
      expect(result).toBe(true);
    });

    it('should return true when in checkSignIn.noInternet state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'checkSignIn.noInternet'),
      };
      const result = selectIsNetworkError(state);
      expect(result).toBe(true);
    });

    it('should return true when in signIn.noInternet state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'signIn.noInternet'),
      };
      const result = selectIsNetworkError(state);
      expect(result).toBe(true);
    });

    it('should return false when not in any noInternet state', () => {
      const result = selectIsNetworkError(mockState);
      expect(result).toBe(false);
    });

    it('should call matches with all three network error states', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn(() => false),
      };
      selectIsNetworkError(state);
      expect(state.matches).toHaveBeenCalledWith('init.noInternet');
      expect(state.matches).toHaveBeenCalledWith('checkSignIn.noInternet');
      expect(state.matches).toHaveBeenCalledWith('signIn.noInternet');
    });
  });

  describe('selectShouldTriggerAutoBackup', () => {
    it('should return auto backup trigger flag', () => {
      const result = selectShouldTriggerAutoBackup(mockState);
      expect(result).toBe(true);
    });

    it('should return false when auto backup should not trigger', () => {
      const state: any = {
        ...mockState,
        context: {...mockState.context, shouldTriggerAutoBackup: false},
      };
      const result = selectShouldTriggerAutoBackup(state);
      expect(result).toBe(false);
    });
  });

  describe('selectShowAccountSelectionConfirmation', () => {
    it('should return true when in selectCloudAccount state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'selectCloudAccount'),
      };
      const result = selectShowAccountSelectionConfirmation(state);
      expect(result).toBe(true);
    });

    it('should call matches with selectCloudAccount', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn(() => false),
      };
      selectShowAccountSelectionConfirmation(state);
      expect(state.matches).toHaveBeenCalledWith('selectCloudAccount');
    });

    it('should return false when not in selectCloudAccount state', () => {
      const result = selectShowAccountSelectionConfirmation(mockState);
      expect(result).toBe(false);
    });
  });

  describe('selectIsSigningIn', () => {
    it('should return true when in signIn state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'signIn'),
      };
      const result = selectIsSigningIn(state);
      expect(result).toBe(true);
    });

    it('should call matches with signIn', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn(() => false),
      };
      selectIsSigningIn(state);
      expect(state.matches).toHaveBeenCalledWith('signIn');
    });

    it('should return false when not signing in', () => {
      const result = selectIsSigningIn(mockState);
      expect(result).toBe(false);
    });
  });

  describe('selectIsSigningInSuccessful', () => {
    it('should return true when in backupAndRestore state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'backupAndRestore'),
      };
      const result = selectIsSigningInSuccessful(state);
      expect(result).toBe(true);
    });

    it('should call matches with backupAndRestore', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn(() => false),
      };
      selectIsSigningInSuccessful(state);
      expect(state.matches).toHaveBeenCalledWith('backupAndRestore');
    });

    it('should return false when sign in not successful', () => {
      const result = selectIsSigningInSuccessful(mockState);
      expect(result).toBe(false);
    });
  });

  describe('selectIsSigningFailure', () => {
    it('should return true when in signIn.error state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'signIn.error'),
      };
      const result = selectIsSigningFailure(state);
      expect(result).toBe(true);
    });

    it('should return true when in checkSignIn.error state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'checkSignIn.error'),
      };
      const result = selectIsSigningFailure(state);
      expect(result).toBe(true);
    });

    it('should return false when not in error state', () => {
      const result = selectIsSigningFailure(mockState);
      expect(result).toBe(false);
    });

    it('should call matches with both error states', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn(() => false),
      };
      selectIsSigningFailure(state);
      expect(state.matches).toHaveBeenCalledWith('signIn.error');
      expect(state.matches).toHaveBeenCalledWith('checkSignIn.error');
    });
  });

  describe('selectIsCloudSignedInFailed', () => {
    it('should return true when in checkSignIn.error state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'checkSignIn.error'),
      };
      const result = selectIsCloudSignedInFailed(state);
      expect(result).toBe(true);
    });

    it('should call matches with checkSignIn.error', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn(() => false),
      };
      selectIsCloudSignedInFailed(state);
      expect(state.matches).toHaveBeenCalledWith('checkSignIn.error');
    });

    it('should return false when cloud sign in did not fail', () => {
      const result = selectIsCloudSignedInFailed(mockState);
      expect(result).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty profile info', () => {
      const state: any = {
        ...mockState,
        context: {...mockState.context, profileInfo: {}},
      };
      const result = selectProfileInfo(state);
      expect(result).toEqual({});
    });

    it('should handle undefined values', () => {
      const state: any = {
        ...mockState,
        context: {
          isLoading: undefined,
          profileInfo: undefined,
          shouldTriggerAutoBackup: undefined,
        },
      };
      expect(selectIsLoading(state)).toBeUndefined();
      expect(selectProfileInfo(state)).toBeUndefined();
      expect(selectShouldTriggerAutoBackup(state)).toBeUndefined();
    });
  });
});
