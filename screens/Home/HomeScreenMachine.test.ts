jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => {
  return jest.fn().mockImplementation(() => ({
    addListener: jest.fn(),
    removeAllListeners: jest.fn(),
    removeSubscription: jest.fn(),
  }));
});

jest.mock('../../machines/Issuers/IssuersMachine', () => ({
  IssuersMachine: {},
  Issuer_Tab_Ref_Id: 'issuersMachine',
  IssuerScreenTabEvents: {},
}));

import {
  HomeScreenEvents,
  selectTabRefs,
  selectActiveTab,
  selectSelectedVc,
  selectViewingVc,
  selectTabsLoaded,
  selectIsMinimumStorageLimitReached,
} from './HomeScreenMachine';

const ms = (ctx: any = {}, matchVal?: string) => ({
  context: {
    tabRefs: [],
    activeTab: 0,
    selectedVc: null,
    serviceRefs: {},
    ...ctx,
  },
  matches: (v: string) => v === matchVal,
  children: {},
});

describe('HomeScreenMachine', () => {
  describe('selectors', () => {
    it('selectTabRefs returns tab refs', () => {
      const refs = [{id: 't1'}, {id: 't2'}];
      expect(selectTabRefs(ms({tabRefs: refs}) as any)).toEqual(refs);
    });

    it('selectActiveTab returns active tab index', () => {
      expect(selectActiveTab(ms({activeTab: 1}) as any)).toBe(1);
    });

    it('selectActiveTab defaults to 0', () => {
      expect(selectActiveTab(ms() as any)).toBe(0);
    });

    it('selectSelectedVc returns selected vc', () => {
      const vc = {id: 'vc1'};
      expect(selectSelectedVc(ms({selectedVc: vc}) as any)).toEqual(vc);
    });

    it('selectSelectedVc returns null by default', () => {
      expect(selectSelectedVc(ms() as any)).toBeNull();
    });

    it('selectViewingVc returns true when viewing', () => {
      expect(selectViewingVc(ms({}, 'modals.viewingVc') as any)).toBe(true);
    });

    it('selectViewingVc returns false otherwise', () => {
      expect(selectViewingVc(ms({}, 'tabs.myVcsTab') as any)).toBe(false);
    });

    it('selectTabsLoaded returns true when not in init', () => {
      expect(selectTabsLoaded(ms({}, 'tabs.myVcsTab') as any)).toBe(true);
    });

    it('selectTabsLoaded returns false when in init', () => {
      expect(selectTabsLoaded(ms({}, 'tabs.init') as any)).toBe(false);
    });

    it('selectIsMinimumStorageLimitReached', () => {
      expect(
        selectIsMinimumStorageLimitReached(
          ms({}, 'tabs.storageLimitReached') as any,
        ),
      ).toBe(true);
      expect(
        selectIsMinimumStorageLimitReached(ms({}, 'tabs.myVcsTab') as any),
      ).toBe(false);
    });
  });

  describe('events', () => {
    it('SELECT_MY_VCS', () =>
      expect(HomeScreenEvents.SELECT_MY_VCS()).toEqual({
        type: 'SELECT_MY_VCS',
      }));
    it('SELECT_RECEIVED_VCS', () =>
      expect(HomeScreenEvents.SELECT_RECEIVED_VCS()).toEqual({
        type: 'SELECT_RECEIVED_VCS',
      }));
    it('SELECT_HISTORY', () =>
      expect(HomeScreenEvents.SELECT_HISTORY()).toEqual({
        type: 'SELECT_HISTORY',
      }));
    it('VIEW_VC', () => {
      const actor = {id: 'actor1'};
      const e = HomeScreenEvents.VIEW_VC(actor as any);
      expect(e.type).toBe('VIEW_VC');
      expect(e.vcItemActor).toBe(actor);
    });
    it('DISMISS_MODAL', () =>
      expect(HomeScreenEvents.DISMISS_MODAL()).toEqual({
        type: 'DISMISS_MODAL',
      }));
    it('GOTO_ISSUERS', () =>
      expect(HomeScreenEvents.GOTO_ISSUERS()).toEqual({type: 'GOTO_ISSUERS'}));
    it('DOWNLOAD_ID', () =>
      expect(HomeScreenEvents.DOWNLOAD_ID()).toEqual({type: 'DOWNLOAD_ID'}));
    it('DISMISS', () =>
      expect(HomeScreenEvents.DISMISS()).toEqual({type: 'DISMISS'}));
  });
});
