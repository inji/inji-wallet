/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  selectIsBackupInprogress,
  selectIsLoadingBackupDetails,
  selectIsBackingUpSuccess,
  selectIsBackingUpFailure,
  selectIsNetworkError,
  lastBackupDetails,
  selectBackupErrorReason,
  selectShowBackupInProgress,
} from './backupSelector';

describe('backupSelector', () => {
  describe('selectIsBackupInprogress', () => {
    it('should return true when in checkDataAvailabilityForBackup state', () => {
      const mockState: any = {
        matches: jest.fn(
          (state: string) =>
            state === 'backingUp.checkDataAvailabilityForBackup',
        ),
      };
      expect(selectIsBackupInprogress(mockState)).toBe(true);
    });

    it('should return true when in checkStorageAvailability state', () => {
      const mockState: any = {
        matches: jest.fn(
          (state: string) => state === 'backingUp.checkStorageAvailability',
        ),
      };
      expect(selectIsBackupInprogress(mockState)).toBe(true);
    });

    it('should return true when in fetchDataFromDB state', () => {
      const mockState: any = {
        matches: jest.fn(
          (state: string) => state === 'backingUp.fetchDataFromDB',
        ),
      };
      expect(selectIsBackupInprogress(mockState)).toBe(true);
    });

    it('should return true when in writeDataToFile state', () => {
      const mockState: any = {
        matches: jest.fn(
          (state: string) => state === 'backingUp.writeDataToFile',
        ),
      };
      expect(selectIsBackupInprogress(mockState)).toBe(true);
    });

    it('should return true when in zipBackupFile state', () => {
      const mockState: any = {
        matches: jest.fn(
          (state: string) => state === 'backingUp.zipBackupFile',
        ),
      };
      expect(selectIsBackupInprogress(mockState)).toBe(true);
    });

    it('should return true when in uploadBackupFile state', () => {
      const mockState: any = {
        matches: jest.fn(
          (state: string) => state === 'backingUp.uploadBackupFile',
        ),
      };
      expect(selectIsBackupInprogress(mockState)).toBe(true);
    });

    it('should return false when not in any backup progress state', () => {
      const mockState: any = {
        matches: jest.fn(() => false),
      };
      expect(selectIsBackupInprogress(mockState)).toBe(false);
    });
  });

  describe('selectIsLoadingBackupDetails', () => {
    it('should return isLoadingBackupDetails from context', () => {
      const mockState: any = {
        context: {
          isLoadingBackupDetails: true,
        },
      };
      expect(selectIsLoadingBackupDetails(mockState)).toBe(true);
    });

    it('should return false when isLoadingBackupDetails is false', () => {
      const mockState: any = {
        context: {
          isLoadingBackupDetails: false,
        },
      };
      expect(selectIsLoadingBackupDetails(mockState)).toBe(false);
    });
  });

  describe('selectIsBackingUpSuccess', () => {
    it('should return true when in backingUp.success state', () => {
      const mockState: any = {
        matches: jest.fn((state: string) => state === 'backingUp.success'),
      };
      expect(selectIsBackingUpSuccess(mockState)).toBe(true);
    });

    it('should return false when not in success state', () => {
      const mockState: any = {
        matches: jest.fn(() => false),
      };
      expect(selectIsBackingUpSuccess(mockState)).toBe(false);
    });
  });

  describe('selectIsBackingUpFailure', () => {
    it('should return true when in backingUp.failure state', () => {
      const mockState: any = {
        matches: jest.fn((state: string) => state === 'backingUp.failure'),
      };
      expect(selectIsBackingUpFailure(mockState)).toBe(true);
    });

    it('should return false when not in failure state', () => {
      const mockState: any = {
        matches: jest.fn(() => false),
      };
      expect(selectIsBackingUpFailure(mockState)).toBe(false);
    });
  });

  describe('selectIsNetworkError', () => {
    it('should return true when in fetchLastBackupDetails.noInternet state', () => {
      const mockState: any = {
        matches: jest.fn(
          (state: string) => state === 'fetchLastBackupDetails.noInternet',
        ),
      };
      expect(selectIsNetworkError(mockState)).toBe(true);
    });

    it('should return false when not in network error state', () => {
      const mockState: any = {
        matches: jest.fn(() => false),
      };
      expect(selectIsNetworkError(mockState)).toBe(false);
    });
  });

  describe('lastBackupDetails', () => {
    it('should return lastBackupDetails from context', () => {
      const mockDetails = {
        timestamp: '2024-01-01',
        size: '10MB',
        fileName: 'backup_123.zip',
      };
      const mockState: any = {
        context: {
          lastBackupDetails: mockDetails,
        },
      };
      expect(lastBackupDetails(mockState)).toBe(mockDetails);
    });

    it('should return undefined when lastBackupDetails is not set', () => {
      const mockState: any = {
        context: {
          lastBackupDetails: undefined,
        },
      };
      expect(lastBackupDetails(mockState)).toBeUndefined();
    });
  });

  describe('selectBackupErrorReason', () => {
    it('should return errorReason from context', () => {
      const mockState: any = {
        context: {
          errorReason: 'Insufficient storage space',
        },
      };
      expect(selectBackupErrorReason(mockState)).toBe(
        'Insufficient storage space',
      );
    });

    it('should return null when no error', () => {
      const mockState: any = {
        context: {
          errorReason: null,
        },
      };
      expect(selectBackupErrorReason(mockState)).toBeNull();
    });
  });

  describe('selectShowBackupInProgress', () => {
    it('should return showBackupInProgress from context', () => {
      const mockState: any = {
        context: {
          showBackupInProgress: true,
        },
      };
      expect(selectShowBackupInProgress(mockState)).toBe(true);
    });

    it('should return false when showBackupInProgress is false', () => {
      const mockState: any = {
        context: {
          showBackupInProgress: false,
        },
      };
      expect(selectShowBackupInProgress(mockState)).toBe(false);
    });
  });
});
