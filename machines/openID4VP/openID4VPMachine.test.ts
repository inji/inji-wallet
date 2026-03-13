jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => {
  return jest.fn().mockImplementation(() => ({
    addListener: jest.fn(),
    removeAllListeners: jest.fn(),
    removeSubscription: jest.fn(),
  }));
});

jest.mock('./openID4VPServices', () => ({
  openID4VPServices: jest.fn(() => ({})),
}));
jest.mock('./openID4VPActions', () => ({
  openID4VPActions: jest.fn(() => ({})),
}));
jest.mock('./openID4VPGuards', () => ({openID4VPGuards: jest.fn(() => ({}))}));

import {
  OpenID4VPEvents,
  openID4VPMachine,
  createOpenID4VPMachine,
} from './openID4VPMachine';

describe('openID4VPMachine', () => {
  describe('OpenID4VPEvents', () => {
    it('AUTHENTICATE', () => {
      const e = OpenID4VPEvents.AUTHENTICATE('encoded', 'flow', null, false);
      expect(e.type).toBe('AUTHENTICATE');
      expect(e.encodedAuthRequest).toBe('encoded');
      expect(e.flowType).toBe('flow');
    });

    it('DOWNLOADED_VCS', () => {
      const e = OpenID4VPEvents.DOWNLOADED_VCS([]);
      expect(e.type).toBe('DOWNLOADED_VCS');
    });

    it('SELECT_VC', () => {
      const e = OpenID4VPEvents.SELECT_VC('key', 'desc');
      expect(e.type).toBe('SELECT_VC');
      expect(e.vcKey).toBe('key');
    });

    it('ACCEPT_REQUEST', () => {
      const e = OpenID4VPEvents.ACCEPT_REQUEST({} as any, {});
      expect(e.type).toBe('ACCEPT_REQUEST');
    });

    it('VERIFIER_TRUST_CONSENT_GIVEN', () => {
      expect(OpenID4VPEvents.VERIFIER_TRUST_CONSENT_GIVEN().type).toBe(
        'VERIFIER_TRUST_CONSENT_GIVEN',
      );
    });

    it('VERIFY_AND_ACCEPT_REQUEST', () => {
      const e = OpenID4VPEvents.VERIFY_AND_ACCEPT_REQUEST({} as any, {});
      expect(e.type).toBe('VERIFY_AND_ACCEPT_REQUEST');
    });

    it('CONFIRM', () => {
      expect(OpenID4VPEvents.CONFIRM().type).toBe('CONFIRM');
    });

    it('CHECK_FOR_CONSENT', () => {
      expect(OpenID4VPEvents.CHECK_FOR_CONSENT().type).toBe(
        'CHECK_FOR_CONSENT',
      );
    });

    it('CANCEL', () => {
      expect(OpenID4VPEvents.CANCEL().type).toBe('CANCEL');
    });

    it('FACE_VERIFICATION_CONSENT', () => {
      const e = OpenID4VPEvents.FACE_VERIFICATION_CONSENT(true);
      expect(e.type).toBe('FACE_VERIFICATION_CONSENT');
      expect(e.isDoNotAskAgainChecked).toBe(true);
    });

    it('FACE_VALID', () => {
      expect(OpenID4VPEvents.FACE_VALID().type).toBe('FACE_VALID');
    });

    it('FACE_INVALID', () => {
      expect(OpenID4VPEvents.FACE_INVALID().type).toBe('FACE_INVALID');
    });

    it('DISMISS', () => {
      expect(OpenID4VPEvents.DISMISS().type).toBe('DISMISS');
    });

    it('DISMISS_POPUP', () => {
      expect(OpenID4VPEvents.DISMISS_POPUP().type).toBe('DISMISS_POPUP');
    });

    it('RETRY_VERIFICATION', () => {
      expect(OpenID4VPEvents.RETRY_VERIFICATION().type).toBe(
        'RETRY_VERIFICATION',
      );
    });

    it('STORE_RESPONSE', () => {
      const e = OpenID4VPEvents.STORE_RESPONSE({});
      expect(e.type).toBe('STORE_RESPONSE');
    });

    it('GO_BACK', () => {
      expect(OpenID4VPEvents.GO_BACK().type).toBe('GO_BACK');
    });

    it('CHECK_SELECTED_VC', () => {
      expect(OpenID4VPEvents.CHECK_SELECTED_VC().type).toBe(
        'CHECK_SELECTED_VC',
      );
    });

    it('SET_SELECTED_VC', () => {
      expect(OpenID4VPEvents.SET_SELECTED_VC().type).toBe('SET_SELECTED_VC');
    });

    it('CHECK_FOR_IMAGE', () => {
      expect(OpenID4VPEvents.CHECK_FOR_IMAGE().type).toBe('CHECK_FOR_IMAGE');
    });

    it('RETRY', () => {
      expect(OpenID4VPEvents.RETRY().type).toBe('RETRY');
    });

    it('RESET_RETRY_COUNT', () => {
      expect(OpenID4VPEvents.RESET_RETRY_COUNT().type).toBe(
        'RESET_RETRY_COUNT',
      );
    });

    it('RESET_ERROR', () => {
      expect(OpenID4VPEvents.RESET_ERROR().type).toBe('RESET_ERROR');
    });

    it('CLOSE_BANNER', () => {
      expect(OpenID4VPEvents.CLOSE_BANNER().type).toBe('CLOSE_BANNER');
    });

    it('LOG_ACTIVITY', () => {
      const e = OpenID4VPEvents.LOG_ACTIVITY('log-type' as any);
      expect(e.type).toBe('LOG_ACTIVITY');
    });

    it('AUTHENTICATE_VIA_PRESENTATION', () => {
      const e = OpenID4VPEvents.AUTHENTICATE_VIA_PRESENTATION(
        'req',
        'flow',
        null,
        false,
      );
      expect(e.type).toBe('AUTHENTICATE_VIA_PRESENTATION');
    });

    it('SIGN_VP', () => {
      const e = OpenID4VPEvents.SIGN_VP({key: 'val'});
      expect(e.type).toBe('SIGN_VP');
    });
  });
});
