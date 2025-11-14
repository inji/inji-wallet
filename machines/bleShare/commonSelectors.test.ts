/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  selectIsCancelling,
  selectIsReviewing,
  selectIsAccepted,
  selectIsRejected,
  selectIsVerifyingIdentity,
  selectIsInvalidIdentity,
  selectIsDisconnected,
  selectIsBluetoothDenied,
  selectBleError,
  selectIsExchangingDeviceInfo,
  selectIsExchangingDeviceInfoTimeout,
  selectIsOffline,
  selectIsHandlingBleError,
  selectReadyForBluetoothStateCheck,
  selectIsNearByDevicesPermissionDenied,
  selectIsBluetoothPermissionDenied,
  selectIsStartPermissionCheck,
  selectIsLocationPermissionRationale,
} from './commonSelectors';

describe('commonSelectors', () => {
  const mockState: any = {
    context: {
      bleError: null,
      readyForBluetoothStateCheck: false,
    },
    matches: jest.fn(() => false),
  };

  describe('selectIsCancelling', () => {
    it('should return true when in cancelling state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'cancelling'),
      };
      expect(selectIsCancelling(state)).toBe(true);
    });

    it('should return false when not cancelling', () => {
      expect(selectIsCancelling(mockState)).toBe(false);
    });
  });

  describe('selectIsReviewing', () => {
    it('should return true when in reviewing state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'reviewing'),
      };
      expect(selectIsReviewing(state)).toBe(true);
    });

    it('should return false when not reviewing', () => {
      expect(selectIsReviewing(mockState)).toBe(false);
    });
  });

  describe('selectIsAccepted', () => {
    it('should return true when in reviewing.accepted state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'reviewing.accepted'),
      };
      expect(selectIsAccepted(state)).toBe(true);
    });

    it('should call matches with reviewing.accepted', () => {
      selectIsAccepted(mockState);
      expect(mockState.matches).toHaveBeenCalledWith('reviewing.accepted');
    });
  });

  describe('selectIsRejected', () => {
    it('should return true when in reviewing.rejected state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'reviewing.rejected'),
      };
      expect(selectIsRejected(state)).toBe(true);
    });

    it('should call matches with reviewing.rejected', () => {
      selectIsRejected(mockState);
      expect(mockState.matches).toHaveBeenCalledWith('reviewing.rejected');
    });
  });

  describe('selectIsVerifyingIdentity', () => {
    it('should return true when in reviewing.verifyingIdentity state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'reviewing.verifyingIdentity'),
      };
      expect(selectIsVerifyingIdentity(state)).toBe(true);
    });

    it('should call matches with reviewing.verifyingIdentity', () => {
      selectIsVerifyingIdentity(mockState);
      expect(mockState.matches).toHaveBeenCalledWith(
        'reviewing.verifyingIdentity',
      );
    });
  });

  describe('selectIsInvalidIdentity', () => {
    it('should return true when in reviewing.invalidIdentity state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'reviewing.invalidIdentity'),
      };
      expect(selectIsInvalidIdentity(state)).toBe(true);
    });

    it('should call matches with reviewing.invalidIdentity', () => {
      selectIsInvalidIdentity(mockState);
      expect(mockState.matches).toHaveBeenCalledWith(
        'reviewing.invalidIdentity',
      );
    });
  });

  describe('selectIsDisconnected', () => {
    it('should return true when in disconnected state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'disconnected'),
      };
      expect(selectIsDisconnected(state)).toBe(true);
    });

    it('should call matches with disconnected', () => {
      selectIsDisconnected(mockState);
      expect(mockState.matches).toHaveBeenCalledWith('disconnected');
    });
  });

  describe('selectIsBluetoothDenied', () => {
    it('should return true when in bluetoothDenied state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'bluetoothDenied'),
      };
      expect(selectIsBluetoothDenied(state)).toBe(true);
    });

    it('should call matches with bluetoothDenied', () => {
      selectIsBluetoothDenied(mockState);
      expect(mockState.matches).toHaveBeenCalledWith('bluetoothDenied');
    });
  });

  describe('selectBleError', () => {
    it('should return BLE error from context', () => {
      const bleError = {code: 'BLE_001', message: 'Connection failed'};
      const state: any = {
        ...mockState,
        context: {...mockState.context, bleError},
      };
      expect(selectBleError(state)).toEqual(bleError);
    });

    it('should return null when no BLE error', () => {
      expect(selectBleError(mockState)).toBeNull();
    });
  });

  describe('TODO selectors (hardcoded)', () => {
    it('selectIsExchangingDeviceInfo should always return false', () => {
      expect(selectIsExchangingDeviceInfo()).toBe(false);
    });

    it('selectIsExchangingDeviceInfoTimeout should always return false', () => {
      expect(selectIsExchangingDeviceInfoTimeout()).toBe(false);
    });

    it('selectIsOffline should always return false', () => {
      expect(selectIsOffline()).toBe(false);
    });
  });

  describe('selectIsHandlingBleError', () => {
    it('should return true when in handlingBleError state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'handlingBleError'),
      };
      expect(selectIsHandlingBleError(state)).toBe(true);
    });

    it('should call matches with handlingBleError', () => {
      selectIsHandlingBleError(mockState);
      expect(mockState.matches).toHaveBeenCalledWith('handlingBleError');
    });
  });

  describe('selectReadyForBluetoothStateCheck', () => {
    it('should return ready status from context', () => {
      expect(selectReadyForBluetoothStateCheck(mockState)).toBe(false);
    });

    it('should return true when ready', () => {
      const state: any = {
        ...mockState,
        context: {...mockState.context, readyForBluetoothStateCheck: true},
      };
      expect(selectReadyForBluetoothStateCheck(state)).toBe(true);
    });
  });

  describe('selectIsNearByDevicesPermissionDenied', () => {
    it('should return true when in nearByDevicesPermissionDenied state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'nearByDevicesPermissionDenied'),
      };
      expect(selectIsNearByDevicesPermissionDenied(state)).toBe(true);
    });

    it('should call matches with nearByDevicesPermissionDenied', () => {
      selectIsNearByDevicesPermissionDenied(mockState);
      expect(mockState.matches).toHaveBeenCalledWith(
        'nearByDevicesPermissionDenied',
      );
    });
  });

  describe('selectIsBluetoothPermissionDenied', () => {
    it('should return true when in bluetoothPermissionDenied state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'bluetoothPermissionDenied'),
      };
      expect(selectIsBluetoothPermissionDenied(state)).toBe(true);
    });

    it('should call matches with bluetoothPermissionDenied', () => {
      selectIsBluetoothPermissionDenied(mockState);
      expect(mockState.matches).toHaveBeenCalledWith(
        'bluetoothPermissionDenied',
      );
    });
  });

  describe('selectIsStartPermissionCheck', () => {
    it('should return true when in startPermissionCheck state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'startPermissionCheck'),
      };
      expect(selectIsStartPermissionCheck(state)).toBe(true);
    });

    it('should call matches with startPermissionCheck', () => {
      selectIsStartPermissionCheck(mockState);
      expect(mockState.matches).toHaveBeenCalledWith('startPermissionCheck');
    });
  });

  describe('selectIsLocationPermissionRationale', () => {
    it('should return true when in checkingLocationState.LocationPermissionRationale state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn(
          (s: string) =>
            s === 'checkingLocationState.LocationPermissionRationale',
        ),
      };
      expect(selectIsLocationPermissionRationale(state)).toBe(true);
    });

    it('should call matches with correct state path', () => {
      selectIsLocationPermissionRationale(mockState);
      expect(mockState.matches).toHaveBeenCalledWith(
        'checkingLocationState.LocationPermissionRationale',
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined bleError', () => {
      const state: any = {
        ...mockState,
        context: {...mockState.context, bleError: undefined},
      };
      expect(selectBleError(state)).toBeUndefined();
    });

    it('should handle empty bleError object', () => {
      const state: any = {
        ...mockState,
        context: {...mockState.context, bleError: {}},
      };
      expect(selectBleError(state)).toEqual({});
    });
  });
});
