/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  selectErrorReason,
  selectIsBackUpRestoring,
  selectIsBackUpRestoreSuccess,
  selectIsBackUpRestoreFailure,
  selectShowRestoreInProgress,
} from './restoreSelector';

describe('restoreSelector', () => {
  describe('selectErrorReason', () => {
    it('should return errorReason from context', () => {
      const mockState: any = {
        context: {
          errorReason: 'Failed to restore backup',
        },
      };
      expect(selectErrorReason(mockState)).toBe('Failed to restore backup');
    });

    it('should return null when no error', () => {
      const mockState: any = {
        context: {
          errorReason: null,
        },
      };
      expect(selectErrorReason(mockState)).toBeNull();
    });
  });

  describe('selectIsBackUpRestoring', () => {
    it('should return true when in restoreBackup state but not success or failure', () => {
      const mockState: any = {
        matches: jest.fn((state: string) => {
          if (state === 'restoreBackup') return true;
          if (state === 'restoreBackup.success') return false;
          if (state === 'restoreBackup.failure') return false;
          return false;
        }),
      };
      expect(selectIsBackUpRestoring(mockState)).toBe(true);
    });

    it('should return false when in restoreBackup.success state', () => {
      const mockState: any = {
        matches: jest.fn((state: string) => {
          if (state === 'restoreBackup') return true;
          if (state === 'restoreBackup.success') return true;
          return false;
        }),
      };
      expect(selectIsBackUpRestoring(mockState)).toBe(false);
    });

    it('should return false when in restoreBackup.failure state', () => {
      const mockState: any = {
        matches: jest.fn((state: string) => {
          if (state === 'restoreBackup') return true;
          if (state === 'restoreBackup.failure') return true;
          return false;
        }),
      };
      expect(selectIsBackUpRestoring(mockState)).toBe(false);
    });

    it('should return false when not in restoreBackup state', () => {
      const mockState: any = {
        matches: jest.fn(() => false),
      };
      expect(selectIsBackUpRestoring(mockState)).toBe(false);
    });
  });

  describe('selectIsBackUpRestoreSuccess', () => {
    it('should return true when in restoreBackup.success state', () => {
      const mockState: any = {
        matches: jest.fn((state: string) => state === 'restoreBackup.success'),
      };
      expect(selectIsBackUpRestoreSuccess(mockState)).toBe(true);
    });

    it('should return false when not in success state', () => {
      const mockState: any = {
        matches: jest.fn(() => false),
      };
      expect(selectIsBackUpRestoreSuccess(mockState)).toBe(false);
    });
  });

  describe('selectIsBackUpRestoreFailure', () => {
    it('should return true when in restoreBackup.failure state', () => {
      const mockState: any = {
        matches: jest.fn((state: string) => state === 'restoreBackup.failure'),
      };
      expect(selectIsBackUpRestoreFailure(mockState)).toBe(true);
    });

    it('should return false when not in failure state', () => {
      const mockState: any = {
        matches: jest.fn(() => false),
      };
      expect(selectIsBackUpRestoreFailure(mockState)).toBe(false);
    });
  });

  describe('selectShowRestoreInProgress', () => {
    it('should return showRestoreInProgress from context', () => {
      const mockState: any = {
        context: {
          showRestoreInProgress: true,
        },
      };
      expect(selectShowRestoreInProgress(mockState)).toBe(true);
    });

    it('should return false when showRestoreInProgress is false', () => {
      const mockState: any = {
        context: {
          showRestoreInProgress: false,
        },
      };
      expect(selectShowRestoreInProgress(mockState)).toBe(false);
    });
  });
});
