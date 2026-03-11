jest.mock('xstate', () => ({
  send: jest.fn((event, opts) => ({type: 'xstate.send', event, opts})),
}));
jest.mock('xstate/lib/actions', () => ({
  respond: jest.fn(fn => ({type: 'xstate.respond', fn})),
}));
jest.mock('../../../components/ActivityLogEvent', () => ({
  VCActivityLog: {getLogFromObject: jest.fn(obj => obj)},
}));
jest.mock('../../../shared/VCMetadata', () => {
  const VCMetadata = jest.fn().mockImplementation(obj => ({
    ...obj,
    getVcKey: () => obj?.id || 'vc-key',
    equals: function (other: any) {
      return this.id === other?.id;
    },
  }));
  (VCMetadata as any).fromVC = jest.fn(vc => ({
    ...vc,
    getVcKey: () => vc?.id || 'vc-key',
  }));
  return {VCMetadata, parseMetadatas: jest.fn(arr => arr)};
});
jest.mock('../../../shared/constants', () => ({
  MY_VCS_STORE_KEY: 'myVCs',
  RECEIVED_VCS_STORE_KEY: 'receivedVCs',
}));
jest.mock('../../activityLog', () => ({
  ActivityLogEvents: {LOG_ACTIVITY: jest.fn()},
}));
jest.mock('../../backupAndRestore/backup/backupMachine', () => ({
  BackupEvents: {DATA_BACKUP: jest.fn(() => ({type: 'DATA_BACKUP'}))},
}));
jest.mock('../../store', () => ({
  StoreEvents: {
    GET_VCS_DATA: jest.fn(key => ({type: 'GET_VCS_DATA', key})),
    SET: jest.fn((key, val) => ({type: 'SET', key, val})),
    REMOVE_ITEMS: jest.fn(),
    REMOVE_VC_METADATA: jest.fn(),
  },
}));
jest.mock('../../../components/BannerNotificationContainer', () => ({}));

import {VCMetaActions} from './VCMetaActions';

describe('VCMetaActions', () => {
  const mockModel = {
    assign: jest.fn(arg => ({type: 'model.assign', assignment: arg})),
  };
  let actions: ReturnType<typeof VCMetaActions>;

  beforeEach(() => {
    jest.clearAllMocks();
    actions = VCMetaActions(mockModel);
  });

  it('should return all expected action definitions', () => {
    const expectedActions = [
      'resetVerificationStatus',
      'setVerificationStatus',
      'setReverificationSuccess',
      'resetReverificationSuccess',
      'resetHighlightVcKey',
      'setReverificationFailed',
      'resetReverificationFailed',
      'sendBackupEvent',
      'getVcItemResponse',
      'loadMyVcs',
      'loadReceivedVcs',
      'setMyVcs',
      'setReceivedVcs',
      'resetTamperedVcs',
      'setDownloadingFailedVcs',
      'setVerificationErrorMessage',
      'resetVerificationErrorMessage',
      'resetDownloadFailedVcs',
      'setDownloadedVc',
      'addVcToInProgressDownloads',
      'removeVcFromInProgressDownlods',
      'resetInProgressVcsDownloaded',
      'setUpdatedVcMetadatas',
      'prependToMyVcsMetadata',
      'removeVcFromMyVcsMetadata',
      'removeDownloadingFailedVcsFromMyVcs',
      'removeDownloadFailedVcsFromStorage',
      'logTamperedVCsremoved',
      'updateMyVcsMetadata',
      'updateReceivedVcsMetadata',
      'setUpdatedReceivedVcMetadatas',
      'setWalletBindingSuccess',
      'resetWalletBindingSuccess',
      'setDownloadCreadentialsFailed',
      'resetDownloadCreadentialsFailed',
      'setDownloadCredentialsSuccess',
      'resetDownloadCredentialsSuccess',
    ];
    for (const name of expectedActions) {
      expect(actions).toHaveProperty(name);
    }
  });

  describe('assignment callbacks', () => {
    it('resetVerificationStatus returns null when matching', () => {
      const fn = actions.resetVerificationStatus.assignment.verificationStatus;
      expect(
        fn({verificationStatus: 'abc'}, {verificationStatus: 'abc'}),
      ).toBeNull();
    });

    it('resetVerificationStatus returns null when event is null', () => {
      const fn = actions.resetVerificationStatus.assignment.verificationStatus;
      expect(
        fn({verificationStatus: 'abc'}, {verificationStatus: null}),
      ).toBeNull();
    });

    it('resetVerificationStatus keeps status when different', () => {
      const fn = actions.resetVerificationStatus.assignment.verificationStatus;
      expect(fn({verificationStatus: 'abc'}, {verificationStatus: 'xyz'})).toBe(
        'abc',
      );
    });

    it('setVerificationStatus sets from event', () => {
      const fn = actions.setVerificationStatus.assignment.verificationStatus;
      expect(fn({}, {verificationStatus: 'banner-info'})).toBe('banner-info');
    });

    it('setReverificationSuccess sets status true with values', () => {
      const fn =
        actions.setReverificationSuccess.assignment.reverificationSuccess;
      const result = fn(
        {},
        {statusValue: 'VALID', vcKey: 'k1', vcType: 'ldp_vc'},
      );
      expect(result).toEqual({
        status: true,
        statusValue: 'VALID',
        vcKey: 'k1',
        vcType: 'ldp_vc',
      });
    });

    it('resetReverificationSuccess resets to false', () => {
      const fn =
        actions.resetReverificationSuccess.assignment.reverificationSuccess;
      const result = fn();
      expect(result.status).toBe(false);
      expect(result.vcKey).toBe('');
    });

    it('resetHighlightVcKey resets vcKey on both success and failed', () => {
      const asg = actions.resetHighlightVcKey.assignment;
      const ctx = {
        reverificationSuccess: {status: true, vcKey: 'k1'},
        reverificationFailed: {status: false, vcKey: 'k2'},
      };
      expect(asg.reverificationSuccess(ctx).vcKey).toBe('');
      expect(asg.reverificationFailed(ctx).vcKey).toBe('');
    });

    it('setReverificationFailed sets status true', () => {
      const fn =
        actions.setReverificationFailed.assignment.reverificationFailed;
      const result = fn(
        {},
        {statusValue: 'REVOKED', vcKey: 'k1', vcType: 'mso_mdoc'},
      );
      expect(result.status).toBe(true);
    });

    it('resetReverificationFailed sets status false', () => {
      const fn =
        actions.resetReverificationFailed.assignment.reverificationFailed;
      const result = fn({}, {statusValue: 'x', vcKey: 'k1', vcType: 't'});
      expect(result.status).toBe(false);
    });

    it('setMyVcs sets myVcs, tamperedVcs, and myVcsMetadata', () => {
      const asg = actions.setMyVcs.assignment;
      const ctx = {tamperedVcs: ['existing']};
      const event = {
        response: {
          vcsData: {vc1: {id: '1'}},
          tamperedVcsList: ['tampered1'],
          vcsMetadata: [{id: 'meta1'}],
        },
      };
      expect(asg.myVcs(ctx, event)).toEqual({vc1: {id: '1'}});
      expect(asg.tamperedVcs(ctx, event)).toEqual(['existing', 'tampered1']);
      expect(asg.myVcsMetadata(ctx, event)).toBeDefined();
    });

    it('setReceivedVcs sets receivedVcs, tamperedVcs, and receivedVcsMetadata', () => {
      const asg = actions.setReceivedVcs.assignment;
      const ctx = {tamperedVcs: []};
      const event = {
        response: {
          vcsData: {rvc1: {id: 'r1'}},
          tamperedVcsList: [],
          vcsMetadata: [],
        },
      };
      expect(asg.receivedVcs(ctx, event)).toEqual({rvc1: {id: 'r1'}});
      expect(asg.tamperedVcs(ctx, event)).toEqual([]);
    });

    it('resetTamperedVcs returns empty array', () => {
      const fn = actions.resetTamperedVcs.assignment.tamperedVcs;
      expect(fn()).toEqual([]);
    });

    it('setDownloadingFailedVcs appends to existing', () => {
      const fn =
        actions.setDownloadingFailedVcs.assignment.downloadingFailedVcs;
      const ctx = {downloadingFailedVcs: ['v1']};
      expect(fn(ctx, {vcMetadata: 'v2'})).toEqual(['v1', 'v2']);
    });

    it('setVerificationErrorMessage sets from event', () => {
      const fn =
        actions.setVerificationErrorMessage.assignment.verificationErrorMessage;
      expect(fn({}, {errorMessage: 'some error'})).toBe('some error');
    });

    it('resetVerificationErrorMessage returns empty string', () => {
      const fn =
        actions.resetVerificationErrorMessage.assignment
          .verificationErrorMessage;
      expect(fn({}, {})).toBe('');
    });

    it('resetDownloadFailedVcs returns empty array', () => {
      const fn = actions.resetDownloadFailedVcs.assignment.downloadingFailedVcs;
      expect(fn({}, {})).toEqual([]);
    });

    it('setDownloadedVc sets vc in context.myVcs', () => {
      const ctx = {myVcs: {}};
      const event = {vcMetadata: {id: 'vc1'}, vc: {data: 'cred'}};
      actions.setDownloadedVc(ctx, event);
      expect(Object.keys(ctx.myVcs).length).toBeGreaterThan(0);
    });

    it('addVcToInProgressDownloads adds requestId', () => {
      const fn =
        actions.addVcToInProgressDownloads.assignment.inProgressVcDownloads;
      const ctx = {inProgressVcDownloads: new Set()};
      const result = fn(ctx, {requestId: 'req1'});
      expect(result.has('req1')).toBe(true);
    });

    it('removeVcFromInProgressDownlods removes requestId', () => {
      const asg = actions.removeVcFromInProgressDownlods.assignment;
      const ctx = {inProgressVcDownloads: new Set(['req1', 'req2'])};
      const result = asg.inProgressVcDownloads(ctx, {
        vcMetadata: {requestId: 'req1'},
      });
      expect(result.has('req1')).toBe(false);
    });

    it('removeVcFromInProgressDownlods handles null vcMetadata', () => {
      const asg = actions.removeVcFromInProgressDownlods.assignment;
      const ctx = {inProgressVcDownloads: new Set(['req1'])};
      const result = asg.inProgressVcDownloads(ctx, {});
      expect(result.has('req1')).toBe(true);
    });

    it('prependToMyVcsMetadata prepends to array', () => {
      const fn = actions.prependToMyVcsMetadata.assignment.myVcsMetadata;
      const result = fn({myVcsMetadata: ['old']}, {vcMetadata: 'new'});
      expect(result).toEqual(['new', 'old']);
    });

    it('removeVcFromMyVcsMetadata filters out matching vc', () => {
      const fn = actions.removeVcFromMyVcsMetadata.assignment.myVcsMetadata;
      const meta1 = {id: '1', equals: o => o.id === '1', getVcKey: () => 'k1'};
      const meta2 = {id: '2', equals: o => o.id === '2', getVcKey: () => 'k2'};
      const ctx = {myVcsMetadata: [meta1, meta2], myVcs: {}};
      const result = fn(ctx, {vcMetadata: {id: '1'}});
      expect(result.length).toBe(1);
    });

    it('setWalletBindingSuccess sets walletBindingSuccess true', () => {
      const asg = actions.setWalletBindingSuccess.assignment;
      expect(asg.walletBindingSuccess()).toBe(true);
    });

    it('setDownloadCreadentialsFailed returns true', () => {
      const fn =
        actions.setDownloadCreadentialsFailed.assignment
          .DownloadingCredentialsFailed;
      expect(fn()).toBe(true);
    });

    it('resetDownloadCreadentialsFailed returns false', () => {
      const fn =
        actions.resetDownloadCreadentialsFailed.assignment
          .DownloadingCredentialsFailed;
      expect(fn()).toBe(false);
    });

    it('setDownloadCredentialsSuccess returns true', () => {
      const fn =
        actions.setDownloadCredentialsSuccess.assignment
          .DownloadingCredentialsSuccess;
      expect(fn()).toBe(true);
    });

    it('resetDownloadCredentialsSuccess returns false', () => {
      const fn =
        actions.resetDownloadCredentialsSuccess.assignment
          .DownloadingCredentialsSuccess;
      expect(fn()).toBe(false);
    });

    it('removeVcFromMyVcsMetadata also removes from myVcs', () => {
      const fn = actions.removeVcFromMyVcsMetadata.assignment.myVcs;
      const ctx = {myVcsMetadata: [], myVcs: {'vc-key': {data: 'cred'}}};
      const result = fn(ctx, {vcMetadata: {id: 'vc1'}});
      expect(result).toBeDefined();
    });

    it('removeDownloadingFailedVcsFromMyVcs filters out failed VCs', () => {
      const fn =
        actions.removeDownloadingFailedVcsFromMyVcs.assignment.myVcsMetadata;
      const failedVc = {id: '1', equals: (o: any) => o?.id === '1'};
      const goodVc = {id: '2', equals: (o: any) => o?.id === '2'};
      const ctx = {
        myVcsMetadata: [failedVc, goodVc],
        downloadingFailedVcs: [{id: '1', equals: (o: any) => o?.id === '1'}],
      };
      const result = fn(ctx, {});
      expect(result.length).toBe(1);
    });

    it('updateMyVcsMetadata updates matching metadata', () => {
      const fn = actions.updateMyVcsMetadata.assignment.myVcsMetadata;
      const vc1 = {id: '1', equals: (o: any) => o?.id === '1', isPinned: false};
      const vc2 = {id: '2', equals: (o: any) => o?.id === '2', isPinned: false};
      const updatedVc = {
        id: '1',
        equals: (o: any) => o?.id === '1',
        isPinned: true,
      };
      const ctx = {myVcsMetadata: [vc1, vc2]};
      const result = fn(ctx, {vcMetadata: updatedVc});
      expect(result.length).toBe(2);
    });

    it('updateReceivedVcsMetadata updates matching metadata', () => {
      const fn =
        actions.updateReceivedVcsMetadata.assignment.receivedVcsMetadata;
      const vc1 = {id: '1', equals: (o: any) => o?.id === '1', isPinned: false};
      const ctx = {receivedVcsMetadata: [vc1]};
      const updatedVc = {
        id: '1',
        equals: (o: any) => o?.id === '1',
        isPinned: true,
      };
      const result = fn(ctx, {vcMetadata: updatedVc});
      expect(result.length).toBe(1);
    });

    it('areAllVcsDownloaded returns true when set is empty', () => {
      const fn =
        actions.removeVcFromInProgressDownlods.assignment.areAllVcsDownloaded;
      const ctx = {inProgressVcDownloads: new Set()};
      expect(fn(ctx)).toBe(true);
    });

    it('areAllVcsDownloaded returns false when set has entries', () => {
      const fn =
        actions.removeVcFromInProgressDownlods.assignment.areAllVcsDownloaded;
      const ctx = {inProgressVcDownloads: new Set(['req1'])};
      expect(fn(ctx)).toBe(false);
    });

    it('setWalletBindingSuccess updates myVcs with new vc', () => {
      const fn = actions.setWalletBindingSuccess.assignment.myVcs;
      const ctx = {myVcs: {k1: {old: true}}};
      const event = {vcKey: 'k1', vc: {new: true}};
      const result = fn(ctx, event);
      expect(result.k1).toEqual({new: true});
    });

    it('resetWalletBindingSuccess sets to false', () => {
      const val =
        actions.resetWalletBindingSuccess.assignment.walletBindingSuccess;
      expect(val).toBe(false);
    });

    it('setDownloadedVc uses event.vc when vcMetadata is absent', () => {
      const ctx = {myVcs: {}};
      const event = {vc: {id: 'vc2', data: 'cred'}};
      actions.setDownloadedVc(ctx, event);
      expect(Object.keys(ctx.myVcs).length).toBeGreaterThan(0);
    });
  });

  describe('send and respond actions', () => {
    it('sendBackupEvent is a send action', () => {
      expect(actions.sendBackupEvent).toBeDefined();
      expect(actions.sendBackupEvent.type).toBe('xstate.send');
    });

    it('loadMyVcs is a send action', () => {
      expect(actions.loadMyVcs).toBeDefined();
      expect(actions.loadMyVcs.type).toBe('xstate.send');
    });

    it('loadReceivedVcs is a send action', () => {
      expect(actions.loadReceivedVcs).toBeDefined();
      expect(actions.loadReceivedVcs.type).toBe('xstate.send');
    });

    it('setUpdatedVcMetadatas is a send action', () => {
      expect(actions.setUpdatedVcMetadatas).toBeDefined();
      expect(actions.setUpdatedVcMetadatas.type).toBe('xstate.send');
    });

    it('setUpdatedReceivedVcMetadatas is a send action', () => {
      expect(actions.setUpdatedReceivedVcMetadatas).toBeDefined();
      expect(actions.setUpdatedReceivedVcMetadatas.type).toBe('xstate.send');
    });

    it('removeDownloadFailedVcsFromStorage is a send action', () => {
      expect(actions.removeDownloadFailedVcsFromStorage).toBeDefined();
      expect(actions.removeDownloadFailedVcsFromStorage.type).toBe(
        'xstate.send',
      );
    });

    it('logTamperedVCsremoved is a send action', () => {
      expect(actions.logTamperedVCsremoved).toBeDefined();
      expect(actions.logTamperedVCsremoved.type).toBe('xstate.send');
    });

    it('getVcItemResponse is a respond action', () => {
      expect(actions.getVcItemResponse).toBeDefined();
      expect(actions.getVcItemResponse.type).toBe('xstate.respond');
    });

    it('getVcItemResponse callback returns TAMPERED_VC when tampered', () => {
      const responseFn = actions.getVcItemResponse.fn;
      const tamperedVcMeta = {id: 'vc1'};
      const ctx = {
        tamperedVcs: [tamperedVcMeta],
        myVcsMetadata: [],
        myVcs: {},
        receivedVcs: {},
      };
      const result = responseFn(ctx, {vcMetadata: tamperedVcMeta});
      expect(result.type).toBe('TAMPERED_VC');
    });

    it('getVcItemResponse callback returns GET_VC_RESPONSE for my VCs', () => {
      const responseFn = actions.getVcItemResponse.fn;
      const ctx = {
        tamperedVcs: [],
        myVcsMetadata: [{id: 'vc1', getVcKey: () => 'vc-key'}],
        myVcs: {'vc-key': {credential: 'data'}},
        receivedVcs: {},
      };
      const result = responseFn(ctx, {vcMetadata: {id: 'vc1'}});
      expect(result.type).toBe('GET_VC_RESPONSE');
    });

    it('getVcItemResponse callback returns received VC when not in myVcs', () => {
      const responseFn = actions.getVcItemResponse.fn;
      const ctx = {
        tamperedVcs: [],
        myVcsMetadata: [],
        myVcs: {},
        receivedVcs: {'vc-key': {credential: 'received-data'}},
      };
      const result = responseFn(ctx, {vcMetadata: {id: 'vc1'}});
      expect(result.type).toBe('GET_VC_RESPONSE');
    });

    it('resetInProgressVcsDownloaded sets areAllVcsDownloaded false', () => {
      const asg = actions.resetInProgressVcsDownloaded.assignment;
      expect(asg.areAllVcsDownloaded()).toBe(false);
    });

    it('resetInProgressVcsDownloaded creates new empty Set', () => {
      const asg = actions.resetInProgressVcsDownloaded.assignment;
      expect(asg.inProgressVcDownloads).toBeInstanceOf(Set);
      expect(asg.inProgressVcDownloads.size).toBe(0);
    });

    it('setUpdatedVcMetadatas event function sends correct store event', () => {
      const eventFn = actions.setUpdatedVcMetadatas.event;
      expect(typeof eventFn).toBe('function');
      const ctx = {myVcsMetadata: ['meta1', 'meta2'], serviceRefs: {store: {}}};
      const result = eventFn(ctx);
      expect(result).toBeDefined();
    });

    it('removeDownloadFailedVcsFromStorage event function', () => {
      const eventFn = actions.removeDownloadFailedVcsFromStorage.event;
      expect(typeof eventFn).toBe('function');
      const ctx = {
        downloadingFailedVcs: [{getVcKey: () => 'k1'}, {getVcKey: () => 'k2'}],
        serviceRefs: {store: {}},
      };
      eventFn(ctx);
      const {StoreEvents} = require('../../store');
      expect(StoreEvents.REMOVE_ITEMS).toHaveBeenCalled();
    });
  });
});
