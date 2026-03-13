jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => {
  return jest.fn().mockImplementation(() => ({
    addListener: jest.fn(),
    removeAllListeners: jest.fn(),
    removeSubscription: jest.fn(),
  }));
});

jest.mock('../../../shared/tuvali', () => ({
  wallet: {startConnection: jest.fn()},
  verifier: {startAdvertisement: jest.fn(), sendVerificationStatus: jest.fn()},
  EventTypes: {onDataReceived: 'DATA_EVENT'},
  VerificationStatus: {ACCEPTED: 0, REJECTED: 1},
}));
jest.mock('../../../shared/tuvali/types/events', () => ({
  VerifierDataEvent: {},
}));
jest.mock('../../../shared/openIdBLE/verifierEventHandler', () => ({
  subscribe: jest.fn(),
}));

import {
  RequestEvents,
  requestMachine,
  createRequestMachine,
  selectIsMinimumStorageLimitReached,
} from './requestMachine';

describe('requestMachine', () => {
  describe('exports', () => {
    it('requestMachine is defined', () => {
      expect(requestMachine).toBeDefined();
    });

    it('createRequestMachine is a function', () => {
      expect(typeof createRequestMachine).toBe('function');
    });

    it('RequestEvents is defined', () => {
      expect(RequestEvents).toBeDefined();
    });

    it('selectIsMinimumStorageLimitReached is a function', () => {
      expect(typeof selectIsMinimumStorageLimitReached).toBe('function');
    });
  });

  describe('selectIsMinimumStorageLimitReached', () => {
    it('returns true when state matches storageLimitReached', () => {
      const mockState = {
        matches: (v: string) => v === 'storageLimitReached',
      } as any;
      expect(selectIsMinimumStorageLimitReached(mockState)).toBe(true);
    });

    it('returns false when state does not match', () => {
      const mockState = {matches: (v: string) => false} as any;
      expect(selectIsMinimumStorageLimitReached(mockState)).toBe(false);
    });
  });

  describe('RequestEvents', () => {
    it('ACCEPT', () => {
      expect(RequestEvents.ACCEPT().type).toBe('ACCEPT');
    });

    it('ACCEPT_AND_VERIFY', () => {
      expect(RequestEvents.ACCEPT_AND_VERIFY().type).toBe('ACCEPT_AND_VERIFY');
    });

    it('GO_TO_RECEIVED_VC_TAB', () => {
      expect(RequestEvents.GO_TO_RECEIVED_VC_TAB().type).toBe(
        'GO_TO_RECEIVED_VC_TAB',
      );
    });

    it('REJECT', () => {
      expect(RequestEvents.REJECT().type).toBe('REJECT');
    });

    it('CANCEL', () => {
      expect(RequestEvents.CANCEL().type).toBe('CANCEL');
    });

    it('RESET', () => {
      expect(RequestEvents.RESET().type).toBe('RESET');
    });

    it('DISMISS', () => {
      expect(RequestEvents.DISMISS().type).toBe('DISMISS');
    });

    it('VC_RECEIVED', () => {
      const e = RequestEvents.VC_RECEIVED({} as any);
      expect(e.type).toBe('VC_RECEIVED');
    });

    it('ADV_STARTED', () => {
      const e = RequestEvents.ADV_STARTED('addr');
      expect(e.type).toBe('ADV_STARTED');
    });

    it('CONNECTED', () => {
      expect(RequestEvents.CONNECTED().type).toBe('CONNECTED');
    });

    it('DISCONNECT', () => {
      expect(RequestEvents.DISCONNECT().type).toBe('DISCONNECT');
    });

    it('BLE_ERROR', () => {
      const e = RequestEvents.BLE_ERROR({
        code: 'TVW_CON_001',
        message: 'err',
      } as any);
      expect(e.type).toBe('BLE_ERROR');
    });

    it('EXCHANGE_DONE', () => {
      const e = RequestEvents.EXCHANGE_DONE('addr');
      expect(e.type).toBe('EXCHANGE_DONE');
    });

    it('SCREEN_FOCUS', () => {
      expect(RequestEvents.SCREEN_FOCUS().type).toBe('SCREEN_FOCUS');
    });

    it('SCREEN_BLUR', () => {
      expect(RequestEvents.SCREEN_BLUR().type).toBe('SCREEN_BLUR');
    });

    it('BLUETOOTH_STATE_ENABLED', () => {
      expect(RequestEvents.BLUETOOTH_STATE_ENABLED().type).toBe(
        'BLUETOOTH_STATE_ENABLED',
      );
    });

    it('BLUETOOTH_STATE_DISABLED', () => {
      expect(RequestEvents.BLUETOOTH_STATE_DISABLED().type).toBe(
        'BLUETOOTH_STATE_DISABLED',
      );
    });

    it('STORE_READY', () => {
      expect(RequestEvents.STORE_READY().type).toBe('STORE_READY');
    });

    it('STORE_RESPONSE', () => {
      const e = RequestEvents.STORE_RESPONSE({});
      expect(e.type).toBe('STORE_RESPONSE');
    });

    it('STORE_ERROR', () => {
      const e = RequestEvents.STORE_ERROR(new Error('err'));
      expect(e.type).toBe('STORE_ERROR');
    });

    it('RECEIVE_DEVICE_INFO', () => {
      const e = RequestEvents.RECEIVE_DEVICE_INFO({} as any);
      expect(e.type).toBe('RECEIVE_DEVICE_INFO');
    });

    it('RECEIVED_VCS_UPDATED', () => {
      const e = RequestEvents.RECEIVED_VCS_UPDATED([]);
      expect(e.type).toBe('RECEIVED_VCS_UPDATED');
    });

    it('VC_RESPONSE', () => {
      const e = RequestEvents.VC_RESPONSE({} as any);
      expect(e.type).toBe('VC_RESPONSE');
    });

    it('GOTO_SETTINGS', () => {
      expect(RequestEvents.GOTO_SETTINGS().type).toBe('GOTO_SETTINGS');
    });

    it('APP_ACTIVE', () => {
      expect(RequestEvents.APP_ACTIVE().type).toBe('APP_ACTIVE');
    });

    it('FACE_VALID', () => {
      expect(RequestEvents.FACE_VALID().type).toBe('FACE_VALID');
    });

    it('FACE_INVALID', () => {
      expect(RequestEvents.FACE_INVALID().type).toBe('FACE_INVALID');
    });

    it('RETRY_VERIFICATION', () => {
      expect(RequestEvents.RETRY_VERIFICATION().type).toBe(
        'RETRY_VERIFICATION',
      );
    });

    it('GOTO_HOME', () => {
      expect(RequestEvents.GOTO_HOME().type).toBe('GOTO_HOME');
    });

    it('NEARBY_ENABLED', () => {
      expect(RequestEvents.NEARBY_ENABLED().type).toBe('NEARBY_ENABLED');
    });

    it('NEARBY_DISABLED', () => {
      expect(RequestEvents.NEARBY_DISABLED().type).toBe('NEARBY_DISABLED');
    });
  });
});
