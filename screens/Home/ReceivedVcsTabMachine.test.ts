import {
  ReceivedVcsTabEvents,
  ReceivedVcsTabMachine,
  createReceivedVcsTabMachine,
} from './ReceivedVcsTabMachine';

describe('ReceivedVcsTabMachine', () => {
  describe('ReceivedVcsTabEvents', () => {
    it('VIEW_VC', () => {
      const e = ReceivedVcsTabEvents.VIEW_VC({} as any);
      expect(e.type).toBe('VIEW_VC');
    });

    it('REFRESH', () => {
      expect(ReceivedVcsTabEvents.REFRESH().type).toBe('REFRESH');
    });

    it('DISMISS', () => {
      expect(ReceivedVcsTabEvents.DISMISS().type).toBe('DISMISS');
    });

    it('STORE_RESPONSE', () => {
      const e = ReceivedVcsTabEvents.STORE_RESPONSE({});
      expect(e.type).toBe('STORE_RESPONSE');
    });

    it('STORE_ERROR', () => {
      const e = ReceivedVcsTabEvents.STORE_ERROR(new Error('test'));
      expect(e.type).toBe('STORE_ERROR');
    });

    it('ERROR', () => {
      const e = ReceivedVcsTabEvents.ERROR(new Error('test'));
      expect(e.type).toBe('ERROR');
    });

    it('GET_RECEIVED_VCS_RESPONSE', () => {
      const e = ReceivedVcsTabEvents.GET_RECEIVED_VCS_RESPONSE([]);
      expect(e.type).toBe('GET_RECEIVED_VCS_RESPONSE');
    });
  });
});
