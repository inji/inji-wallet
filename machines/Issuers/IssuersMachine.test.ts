jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => {
  return jest.fn().mockImplementation(() => ({
    addListener: jest.fn(),
    removeAllListeners: jest.fn(),
    removeSubscription: jest.fn(),
  }));
});

jest.mock('./IssuersActions', () => ({IssuersActions: jest.fn(() => ({}))}));
jest.mock('./IssuersService', () => ({IssuersService: jest.fn(() => ({}))}));
jest.mock('./IssuersGuards', () => ({IssuersGuards: jest.fn(() => ({}))}));
jest.mock('../openID4VP/openID4VPMachine', () => ({
  openID4VPMachine: {},
  OpenID4VPEvents: {},
}));

import {
  IssuerScreenTabEvents,
  Issuer_Tab_Ref_Id,
  IssuersMachine,
} from './IssuersMachine';

describe('IssuersMachine', () => {
  describe('IssuerScreenTabEvents', () => {
    it('SELECTED_ISSUER', () => {
      const e = IssuerScreenTabEvents.SELECTED_ISSUER('issuer-1');
      expect(e.type).toBe('SELECTED_ISSUER');
      expect(e.id).toBe('issuer-1');
    });

    it('DOWNLOAD_ID', () => {
      expect(IssuerScreenTabEvents.DOWNLOAD_ID().type).toBe('DOWNLOAD_ID');
    });

    it('BIOMETRIC_CANCELLED', () => {
      const e = IssuerScreenTabEvents.BIOMETRIC_CANCELLED('req');
      expect(e.type).toBe('BIOMETRIC_CANCELLED');
    });

    it('COMPLETED', () => {
      expect(IssuerScreenTabEvents.COMPLETED().type).toBe('COMPLETED');
    });

    it('TRY_AGAIN', () => {
      expect(IssuerScreenTabEvents.TRY_AGAIN().type).toBe('TRY_AGAIN');
    });

    it('RESET_ERROR', () => {
      expect(IssuerScreenTabEvents.RESET_ERROR().type).toBe('RESET_ERROR');
    });

    it('SHOW_ERROR', () => {
      const e = IssuerScreenTabEvents.SHOW_ERROR({msg: 'err'});
      expect(e.type).toBe('SHOW_ERROR');
    });

    it('CHECK_KEY_PAIR', () => {
      expect(IssuerScreenTabEvents.CHECK_KEY_PAIR().type).toBe(
        'CHECK_KEY_PAIR',
      );
    });

    it('CANCEL', () => {
      expect(IssuerScreenTabEvents.CANCEL().type).toBe('CANCEL');
    });

    it('STORE_RESPONSE', () => {
      const e = IssuerScreenTabEvents.STORE_RESPONSE({key: 'val'});
      expect(e.type).toBe('STORE_RESPONSE');
    });

    it('STORE_ERROR', () => {
      const e = IssuerScreenTabEvents.STORE_ERROR(new Error('test'));
      expect(e.type).toBe('STORE_ERROR');
    });

    it('RESET_VERIFY_ERROR', () => {
      expect(IssuerScreenTabEvents.RESET_VERIFY_ERROR().type).toBe(
        'RESET_VERIFY_ERROR',
      );
    });

    it('SELECTED_CREDENTIAL_TYPE', () => {
      const e = IssuerScreenTabEvents.SELECTED_CREDENTIAL_TYPE({} as any);
      expect(e.type).toBe('SELECTED_CREDENTIAL_TYPE');
    });

    it('SCAN_CREDENTIAL_OFFER_QR_CODE', () => {
      expect(IssuerScreenTabEvents.SCAN_CREDENTIAL_OFFER_QR_CODE().type).toBe(
        'SCAN_CREDENTIAL_OFFER_QR_CODE',
      );
    });

    it('QR_CODE_SCANNED', () => {
      const e = IssuerScreenTabEvents.QR_CODE_SCANNED('data');
      expect(e.type).toBe('QR_CODE_SCANNED');
      expect(e.data).toBe('data');
    });

    it('AUTH_ENDPOINT_RECEIVED', () => {
      const e = IssuerScreenTabEvents.AUTH_ENDPOINT_RECEIVED('endpoint');
      expect(e.type).toBe('AUTH_ENDPOINT_RECEIVED');
      expect(e.authEndpoint).toBe('endpoint');
    });

    it('PROOF_REQUEST', () => {
      const e = IssuerScreenTabEvents.PROOF_REQUEST(
        'token',
        'nonce',
        {},
        {} as any,
        {} as any,
      );
      expect(e.type).toBe('PROOF_REQUEST');
    });

    it('TX_CODE_REQUEST', () => {
      expect(IssuerScreenTabEvents.TX_CODE_REQUEST().type).toBe(
        'TX_CODE_REQUEST',
      );
    });

    it('TX_CODE_RECEIVED', () => {
      const e = IssuerScreenTabEvents.TX_CODE_RECEIVED('1234');
      expect(e.type).toBe('TX_CODE_RECEIVED');
      expect(e.txCode).toBe('1234');
    });

    it('ON_CONSENT_GIVEN', () => {
      expect(IssuerScreenTabEvents.ON_CONSENT_GIVEN().type).toBe(
        'ON_CONSENT_GIVEN',
      );
    });

    it('TRUST_ISSUER_CONSENT_REQUEST', () => {
      const e = IssuerScreenTabEvents.TRUST_ISSUER_CONSENT_REQUEST({});
      expect(e.type).toBe('TRUST_ISSUER_CONSENT_REQUEST');
    });

    it('TOKEN_REQUEST', () => {
      const e = IssuerScreenTabEvents.TOKEN_REQUEST({});
      expect(e.type).toBe('TOKEN_REQUEST');
    });

    it('PRESENTATION_REQUEST', () => {
      const e = IssuerScreenTabEvents.PRESENTATION_REQUEST({});
      expect(e.type).toBe('PRESENTATION_REQUEST');
    });

    it('VP_CONSENT_REJECT', () => {
      expect(IssuerScreenTabEvents.VP_CONSENT_REJECT().type).toBe(
        'VP_CONSENT_REJECT',
      );
    });

    it('DISMISS', () => {
      expect(IssuerScreenTabEvents.DISMISS().type).toBe('DISMISS');
    });

    it('IN_PROGRESS', () => {
      expect(IssuerScreenTabEvents.IN_PROGRESS().type).toBe('IN_PROGRESS');
    });

    it('RETRY', () => {
      expect(IssuerScreenTabEvents.RETRY().type).toBe('RETRY');
    });

    it('STAY_IN_PROGRESS', () => {
      expect(IssuerScreenTabEvents.STAY_IN_PROGRESS().type).toBe(
        'STAY_IN_PROGRESS',
      );
    });

    it('SIGN_PRESENTATION', () => {
      const e = IssuerScreenTabEvents.SIGN_PRESENTATION({});
      expect(e.type).toBe('SIGN_PRESENTATION');
    });

    it('SIGNED_DATA_FOR_VP', () => {
      const e = IssuerScreenTabEvents.SIGNED_DATA_FOR_VP({key: 'val'});
      expect(e.type).toBe('SIGNED_DATA_FOR_VP');
    });
  });
});
