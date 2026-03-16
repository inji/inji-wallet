import {
  MyVcsTabEvents,
  selectIsRequestSuccessful,
  selectIsSavingFailedInIdle,
  selectIsNetworkOff,
  createMyVcsTabMachine,
} from './MyVcsTabMachine';

const ms = (ctx: any = {}, matchVal?: string) => ({
  context: {isVcItemStoredSuccessfully: false, serviceRefs: {}, ...ctx},
  matches: (v: string) => v === matchVal,
  children: {},
});

describe('MyVcsTabMachine', () => {
  describe('selectors', () => {
    it('selectIsRequestSuccessful returns false by default', () => {
      expect(selectIsRequestSuccessful(ms() as any)).toBe(false);
    });

    it('selectIsRequestSuccessful returns true when stored', () => {
      expect(
        selectIsRequestSuccessful(
          ms({isVcItemStoredSuccessfully: true}) as any,
        ),
      ).toBe(true);
    });

    it('selectIsSavingFailedInIdle', () => {
      expect(
        selectIsSavingFailedInIdle(ms({}, 'addingVc.savingFailed.idle') as any),
      ).toBe(true);
      expect(selectIsSavingFailedInIdle(ms({}, 'idle') as any)).toBe(false);
    });

    it('selectIsNetworkOff', () => {
      expect(selectIsNetworkOff(ms({}, 'addVc.networkOff') as any)).toBe(true);
      expect(selectIsNetworkOff(ms({}, 'idle') as any)).toBe(false);
    });
  });

  describe('events', () => {
    it('VIEW_VC', () => {
      const actor = {id: 'vc1'};
      const e = MyVcsTabEvents.VIEW_VC(actor as any);
      expect(e.type).toBe('VIEW_VC');
      expect(e.vcItemActor).toBe(actor);
    });

    it('DISMISS', () =>
      expect(MyVcsTabEvents.DISMISS()).toEqual({type: 'DISMISS'}));
    it('TRY_AGAIN', () =>
      expect(MyVcsTabEvents.TRY_AGAIN()).toEqual({type: 'TRY_AGAIN'}));

    it('STORE_RESPONSE', () => {
      const e = MyVcsTabEvents.STORE_RESPONSE({data: 'x'});
      expect(e.type).toBe('STORE_RESPONSE');
      expect(e.response).toEqual({data: 'x'});
    });

    it('STORE_ERROR', () => {
      const e = MyVcsTabEvents.STORE_ERROR(new Error('fail'));
      expect(e.type).toBe('STORE_ERROR');
    });

    it('ADD_VC', () =>
      expect(MyVcsTabEvents.ADD_VC()).toEqual({type: 'ADD_VC'}));
    it('GET_VC', () =>
      expect(MyVcsTabEvents.GET_VC()).toEqual({type: 'GET_VC'}));
    it('STORAGE_AVAILABLE', () =>
      expect(MyVcsTabEvents.STORAGE_AVAILABLE()).toEqual({
        type: 'STORAGE_AVAILABLE',
      }));
    it('STORAGE_UNAVAILABLE', () =>
      expect(MyVcsTabEvents.STORAGE_UNAVAILABLE()).toEqual({
        type: 'STORAGE_UNAVAILABLE',
      }));
    it('SET_STORE_VC_ITEM_STATUS', () =>
      expect(MyVcsTabEvents.SET_STORE_VC_ITEM_STATUS()).toEqual({
        type: 'SET_STORE_VC_ITEM_STATUS',
      }));
    it('RESET_STORE_VC_ITEM_STATUS', () =>
      expect(MyVcsTabEvents.RESET_STORE_VC_ITEM_STATUS()).toEqual({
        type: 'RESET_STORE_VC_ITEM_STATUS',
      }));
    it('DOWNLOAD_VIA_ID', () =>
      expect(MyVcsTabEvents.DOWNLOAD_VIA_ID()).toEqual({
        type: 'DOWNLOAD_VIA_ID',
      }));
  });
});
