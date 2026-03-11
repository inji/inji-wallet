import {
  QrLoginEvents,
  qrLoginMachine,
  createQrLoginMachine,
} from './QrLoginMachine';

describe('QrLoginMachine', () => {
  describe('QrLoginEvents', () => {
    it('SELECT_VC', () => {
      const e = QrLoginEvents.SELECT_VC({} as any);
      expect(e.type).toBe('SELECT_VC');
    });

    it('SCANNING_DONE', () => {
      const e = QrLoginEvents.SCANNING_DONE('params');
      expect(e.type).toBe('SCANNING_DONE');
    });

    it('STORE_RESPONSE', () => {
      const e = QrLoginEvents.STORE_RESPONSE({});
      expect(e.type).toBe('STORE_RESPONSE');
    });

    it('STORE_ERROR', () => {
      const e = QrLoginEvents.STORE_ERROR(new Error('test'));
      expect(e.type).toBe('STORE_ERROR');
    });

    it('TOGGLE_CONSENT_CLAIM', () => {
      const e = QrLoginEvents.TOGGLE_CONSENT_CLAIM(true, 'email');
      expect(e.type).toBe('TOGGLE_CONSENT_CLAIM');
      expect(e.enable).toBe(true);
      expect(e.claim).toBe('email');
    });

    it('DISMISS', () => {
      expect(QrLoginEvents.DISMISS().type).toBe('DISMISS');
    });

    it('CONFIRM', () => {
      expect(QrLoginEvents.CONFIRM().type).toBe('CONFIRM');
    });

    it('GET', () => {
      const e = QrLoginEvents.GET('linkCode123', 'flowType1', {} as any, false);
      expect(e.type).toBe('GET');
      expect(e.linkCode).toBe('linkCode123');
      expect(e.flowType).toBe('flowType1');
      expect(e.faceAuthConsentGiven).toBe(false);
    });

    it('VERIFY', () => {
      expect(QrLoginEvents.VERIFY().type).toBe('VERIFY');
    });

    it('CANCEL', () => {
      expect(QrLoginEvents.CANCEL().type).toBe('CANCEL');
    });

    it('FACE_VALID', () => {
      expect(QrLoginEvents.FACE_VALID().type).toBe('FACE_VALID');
    });

    it('FACE_INVALID', () => {
      expect(QrLoginEvents.FACE_INVALID().type).toBe('FACE_INVALID');
    });

    it('RETRY_VERIFICATION', () => {
      expect(QrLoginEvents.RETRY_VERIFICATION().type).toBe(
        'RETRY_VERIFICATION',
      );
    });

    it('FACE_VERIFICATION_CONSENT', () => {
      const e = QrLoginEvents.FACE_VERIFICATION_CONSENT(true);
      expect(e.type).toBe('FACE_VERIFICATION_CONSENT');
    });
  });
});
