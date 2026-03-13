jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => {
  return jest.fn().mockImplementation(() => ({
    addListener: jest.fn(),
    removeAllListeners: jest.fn(),
    removeSubscription: jest.fn(),
  }));
});

jest.mock('./VCItemActions', () => ({VCItemActions: jest.fn(() => ({}))}));
jest.mock('./VCItemServices', () => ({VCItemServices: jest.fn(() => ({}))}));
jest.mock('./VCItemGaurds', () => ({VCItemGaurds: jest.fn(() => ({}))}));

import {
  VCItemEvents,
  VCItemMachine,
  createVCItemMachine,
} from './VCItemMachine';

describe('VCItemMachine', () => {
  describe('VCItemEvents', () => {
    it('DISMISS', () => {
      expect(VCItemEvents.DISMISS().type).toBe('DISMISS');
    });

    it('CREDENTIAL_DOWNLOADED', () => {
      const e = VCItemEvents.CREDENTIAL_DOWNLOADED({} as any);
      expect(e.type).toBe('CREDENTIAL_DOWNLOADED');
    });

    it('STORE_RESPONSE', () => {
      const e = VCItemEvents.STORE_RESPONSE({} as any);
      expect(e.type).toBe('STORE_RESPONSE');
    });

    it('STORE_ERROR', () => {
      const e = VCItemEvents.STORE_ERROR(new Error('test'));
      expect(e.type).toBe('STORE_ERROR');
    });

    it('POLL', () => {
      expect(VCItemEvents.POLL().type).toBe('POLL');
    });

    it('DOWNLOAD_READY', () => {
      expect(VCItemEvents.DOWNLOAD_READY().type).toBe('DOWNLOAD_READY');
    });

    it('FAILED', () => {
      expect(VCItemEvents.FAILED().type).toBe('FAILED');
    });

    it('GET_VC_RESPONSE', () => {
      const e = VCItemEvents.GET_VC_RESPONSE({} as any);
      expect(e.type).toBe('GET_VC_RESPONSE');
    });

    it('INPUT_OTP', () => {
      const e = VCItemEvents.INPUT_OTP('1234');
      expect(e.type).toBe('INPUT_OTP');
      expect(e.OTP).toBe('1234');
    });

    it('RESEND_OTP', () => {
      expect(VCItemEvents.RESEND_OTP().type).toBe('RESEND_OTP');
    });

    it('REFRESH', () => {
      expect(VCItemEvents.REFRESH().type).toBe('REFRESH');
    });

    it('ADD_WALLET_BINDING_ID', () => {
      expect(VCItemEvents.ADD_WALLET_BINDING_ID().type).toBe(
        'ADD_WALLET_BINDING_ID',
      );
    });

    it('CANCEL', () => {
      expect(VCItemEvents.CANCEL().type).toBe('CANCEL');
    });

    it('CONFIRM', () => {
      expect(VCItemEvents.CONFIRM().type).toBe('CONFIRM');
    });

    it('PIN_CARD', () => {
      expect(VCItemEvents.PIN_CARD().type).toBe('PIN_CARD');
    });

    it('KEBAB_POPUP', () => {
      expect(VCItemEvents.KEBAB_POPUP().type).toBe('KEBAB_POPUP');
    });

    it('SHOW_ACTIVITY', () => {
      expect(VCItemEvents.SHOW_ACTIVITY().type).toBe('SHOW_ACTIVITY');
    });

    it('REVERIFY_VC', () => {
      expect(VCItemEvents.REVERIFY_VC().type).toBe('REVERIFY_VC');
    });

    it('CLOSE_VC_MODAL', () => {
      expect(VCItemEvents.CLOSE_VC_MODAL().type).toBe('CLOSE_VC_MODAL');
    });

    it('REMOVE', () => {
      const e = VCItemEvents.REMOVE({} as any);
      expect(e.type).toBe('REMOVE');
    });

    it('UPDATE_VC_METADATA', () => {
      const e = VCItemEvents.UPDATE_VC_METADATA({} as any);
      expect(e.type).toBe('UPDATE_VC_METADATA');
    });

    it('TAMPERED_VC', () => {
      const e = VCItemEvents.TAMPERED_VC('key');
      expect(e.type).toBe('TAMPERED_VC');
      expect(e.key).toBe('key');
    });

    it('SHOW_BINDING_STATUS', () => {
      expect(VCItemEvents.SHOW_BINDING_STATUS().type).toBe(
        'SHOW_BINDING_STATUS',
      );
    });

    it('VERIFY', () => {
      expect(VCItemEvents.VERIFY().type).toBe('VERIFY');
    });

    it('SET_VERIFICATION_STATUS', () => {
      const e = VCItemEvents.SET_VERIFICATION_STATUS({status: 'ok'});
      expect(e.type).toBe('SET_VERIFICATION_STATUS');
    });

    it('RESET_VERIFICATION_STATUS', () => {
      expect(VCItemEvents.RESET_VERIFICATION_STATUS().type).toBe(
        'RESET_VERIFICATION_STATUS',
      );
    });

    it('REMOVE_VERIFICATION_STATUS_BANNER', () => {
      expect(VCItemEvents.REMOVE_VERIFICATION_STATUS_BANNER().type).toBe(
        'REMOVE_VERIFICATION_STATUS_BANNER',
      );
    });

    it('SHOW_VERIFICATION_STATUS_BANNER', () => {
      const e = VCItemEvents.SHOW_VERIFICATION_STATUS_BANNER({status: 'ok'});
      expect(e.type).toBe('SHOW_VERIFICATION_STATUS_BANNER');
    });

    it('CLOSE_BANNER', () => {
      expect(VCItemEvents.CLOSE_BANNER().type).toBe('CLOSE_BANNER');
    });
  });
});
