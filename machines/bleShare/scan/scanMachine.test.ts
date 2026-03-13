jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => {
  return jest.fn().mockImplementation(() => ({
    addListener: jest.fn(),
    removeAllListeners: jest.fn(),
    removeSubscription: jest.fn(),
  }));
});

jest.mock('./scanServices', () => ({ScanServices: jest.fn(() => ({}))}));
jest.mock('./scanActions', () => ({ScanActions: jest.fn(() => ({}))}));
jest.mock('./scanGuards', () => ({ScanGuards: jest.fn(() => ({}))}));
jest.mock('../../QrLogin/QrLoginMachine', () => ({
  qrLoginMachine: {},
}));
jest.mock('../../openID4VP/openID4VPMachine', () => ({
  openID4VPMachine: {},
  OpenID4VPEvents: {},
}));

import {ScanEvents, scanMachine, createScanMachine} from './scanMachine';

describe('scanMachine', () => {
  describe('ScanEvents', () => {
    it('SCAN', () => {
      const e = ScanEvents.SCAN('qr-code-data');
      expect(e.type).toBe('SCAN');
      expect(e.params).toBe('qr-code-data');
    });

    it('ACCEPT_REQUEST', () => {
      expect(ScanEvents.ACCEPT_REQUEST().type).toBe('ACCEPT_REQUEST');
    });

    it('VERIFY_AND_ACCEPT_REQUEST', () => {
      expect(ScanEvents.VERIFY_AND_ACCEPT_REQUEST().type).toBe(
        'VERIFY_AND_ACCEPT_REQUEST',
      );
    });

    it('VC_ACCEPTED', () => {
      expect(ScanEvents.VC_ACCEPTED().type).toBe('VC_ACCEPTED');
    });

    it('VC_REJECTED', () => {
      expect(ScanEvents.VC_REJECTED().type).toBe('VC_REJECTED');
    });

    it('VC_SENT', () => {
      expect(ScanEvents.VC_SENT().type).toBe('VC_SENT');
    });

    it('CANCEL', () => {
      expect(ScanEvents.CANCEL().type).toBe('CANCEL');
    });

    it('CLOSE_BANNER', () => {
      expect(ScanEvents.CLOSE_BANNER().type).toBe('CLOSE_BANNER');
    });

    it('STAY_IN_PROGRESS', () => {
      expect(ScanEvents.STAY_IN_PROGRESS().type).toBe('STAY_IN_PROGRESS');
    });

    it('RETRY', () => {
      expect(ScanEvents.RETRY().type).toBe('RETRY');
    });

    it('DISMISS', () => {
      expect(ScanEvents.DISMISS().type).toBe('DISMISS');
    });

    it('DISMISS_QUICK_SHARE_BANNER', () => {
      expect(ScanEvents.DISMISS_QUICK_SHARE_BANNER().type).toBe(
        'DISMISS_QUICK_SHARE_BANNER',
      );
    });

    it('GOTO_HISTORY', () => {
      expect(ScanEvents.GOTO_HISTORY().type).toBe('GOTO_HISTORY');
    });

    it('CONNECTED', () => {
      expect(ScanEvents.CONNECTED().type).toBe('CONNECTED');
    });

    it('DISCONNECT', () => {
      expect(ScanEvents.DISCONNECT().type).toBe('DISCONNECT');
    });

    it('BLE_ERROR', () => {
      const e = ScanEvents.BLE_ERROR({
        code: 'TVW_CON_001',
        message: 'error',
      } as any);
      expect(e.type).toBe('BLE_ERROR');
    });

    it('CONNECTION_DESTROYED', () => {
      expect(ScanEvents.CONNECTION_DESTROYED().type).toBe(
        'CONNECTION_DESTROYED',
      );
    });

    it('SCREEN_BLUR', () => {
      expect(ScanEvents.SCREEN_BLUR().type).toBe('SCREEN_BLUR');
    });

    it('SCREEN_FOCUS', () => {
      expect(ScanEvents.SCREEN_FOCUS().type).toBe('SCREEN_FOCUS');
    });

    it('BLUETOOTH_PERMISSION_ENABLED', () => {
      expect(ScanEvents.BLUETOOTH_PERMISSION_ENABLED().type).toBe(
        'BLUETOOTH_PERMISSION_ENABLED',
      );
    });

    it('BLUETOOTH_STATE_ENABLED', () => {
      expect(ScanEvents.BLUETOOTH_STATE_ENABLED().type).toBe(
        'BLUETOOTH_STATE_ENABLED',
      );
    });

    it('BLUETOOTH_STATE_DISABLED', () => {
      expect(ScanEvents.BLUETOOTH_STATE_DISABLED().type).toBe(
        'BLUETOOTH_STATE_DISABLED',
      );
    });

    it('NEARBY_ENABLED', () => {
      expect(ScanEvents.NEARBY_ENABLED().type).toBe('NEARBY_ENABLED');
    });

    it('NEARBY_DISABLED', () => {
      expect(ScanEvents.NEARBY_DISABLED().type).toBe('NEARBY_DISABLED');
    });

    it('GOTO_SETTINGS', () => {
      expect(ScanEvents.GOTO_SETTINGS().type).toBe('GOTO_SETTINGS');
    });

    it('START_PERMISSION_CHECK', () => {
      expect(ScanEvents.START_PERMISSION_CHECK().type).toBe(
        'START_PERMISSION_CHECK',
      );
    });

    it('LOCATION_ENABLED', () => {
      expect(ScanEvents.LOCATION_ENABLED().type).toBe('LOCATION_ENABLED');
    });

    it('LOCATION_DISABLED', () => {
      expect(ScanEvents.LOCATION_DISABLED().type).toBe('LOCATION_DISABLED');
    });

    it('LOCATION_REQUEST', () => {
      expect(ScanEvents.LOCATION_REQUEST().type).toBe('LOCATION_REQUEST');
    });

    it('CHECK_FLOW_TYPE', () => {
      expect(ScanEvents.CHECK_FLOW_TYPE().type).toBe('CHECK_FLOW_TYPE');
    });

    it('UPDATE_VC_NAME', () => {
      const e = ScanEvents.UPDATE_VC_NAME('name');
      expect(e.type).toBe('UPDATE_VC_NAME');
      expect(e.vcName).toBe('name');
    });

    it('STORE_RESPONSE', () => {
      const e = ScanEvents.STORE_RESPONSE({key: 'val'});
      expect(e.type).toBe('STORE_RESPONSE');
    });

    it('APP_ACTIVE', () => {
      expect(ScanEvents.APP_ACTIVE().type).toBe('APP_ACTIVE');
    });

    it('FACE_VALID', () => {
      expect(ScanEvents.FACE_VALID().type).toBe('FACE_VALID');
    });

    it('FACE_INVALID', () => {
      expect(ScanEvents.FACE_INVALID().type).toBe('FACE_INVALID');
    });

    it('RETRY_VERIFICATION', () => {
      expect(ScanEvents.RETRY_VERIFICATION().type).toBe('RETRY_VERIFICATION');
    });

    it('RESET', () => {
      expect(ScanEvents.RESET().type).toBe('RESET');
    });

    it('FACE_VERIFICATION_CONSENT', () => {
      const e = ScanEvents.FACE_VERIFICATION_CONSENT(true);
      expect(e.type).toBe('FACE_VERIFICATION_CONSENT');
      expect(e.isDoNotAskAgainChecked).toBe(true);
    });

    it('ALLOWED', () => {
      expect(ScanEvents.ALLOWED().type).toBe('ALLOWED');
    });

    it('DENIED', () => {
      expect(ScanEvents.DENIED().type).toBe('DENIED');
    });

    it('QRLOGIN_VIA_DEEP_LINK', () => {
      const e = ScanEvents.QRLOGIN_VIA_DEEP_LINK('link-code');
      expect(e.type).toBe('QRLOGIN_VIA_DEEP_LINK');
      expect(e.linkCode).toBe('link-code');
    });

    it('OVP_VIA_DEEP_LINK', () => {
      const e = ScanEvents.OVP_VIA_DEEP_LINK('auth-request');
      expect(e.type).toBe('OVP_VIA_DEEP_LINK');
      expect(e.authorizationRequest).toBe('auth-request');
    });

    it('SELECT_VC', () => {
      const e = ScanEvents.SELECT_VC({} as any, 'flow');
      expect(e.type).toBe('SELECT_VC');
    });

    it('SHOW_ERROR', () => {
      expect(ScanEvents.SHOW_ERROR().type).toBe('SHOW_ERROR');
    });

    it('SUCCESS', () => {
      expect(ScanEvents.SUCCESS().type).toBe('SUCCESS');
    });

    it('IN_PROGRESS', () => {
      expect(ScanEvents.IN_PROGRESS().type).toBe('IN_PROGRESS');
    });

    it('TIMEOUT', () => {
      expect(ScanEvents.TIMEOUT().type).toBe('TIMEOUT');
    });
  });
});
