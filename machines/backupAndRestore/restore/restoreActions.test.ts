jest.mock('xstate', () => ({
  send: jest.fn((event, opts) => ({type: 'xstate.send', event, opts})),
}));
jest.mock('../../../shared/CloudBackupAndRestoreUtils', () => ({
  __esModule: true,
  default: {
    downloadUnSyncedBackupFiles: jest.fn(),
    NO_BACKUP_FILE: 'no_backup_file',
  },
}));
jest.mock('../../../shared/constants', () => ({
  NETWORK_REQUEST_FAILED: 'Network request failed',
  TECHNICAL_ERROR: 'Technical error',
}));
jest.mock('../../../shared/fileStorage', () => ({
  cleanupLocalBackups: jest.fn(),
}));
jest.mock('../../../shared/telemetry/TelemetryConstants', () => ({
  TelemetryConstants: {
    FlowType: {dataRestore: 'dataRestore'},
    Screens: {dataRestoreScreen: 'dataRestoreScreen'},
    ErrorId: {failure: 'failure'},
    EndEventStatus: {success: 'success', failure: 'failure'},
  },
}));
jest.mock('../../../shared/telemetry/TelemetryUtils', () => ({
  getStartEventData: jest.fn(),
  getEndEventData: jest.fn(),
  getErrorEventData: jest.fn(),
  getImpressionEventData: jest.fn(),
  sendStartEvent: jest.fn(),
  sendEndEvent: jest.fn(),
  sendErrorEvent: jest.fn(),
  sendImpressionEvent: jest.fn(),
}));
jest.mock('../../VerifiableCredential/VCMetaMachine/VCMetaMachine', () => ({
  VcMetaEvents: {REFRESH_MY_VCS: {type: 'REFRESH_MY_VCS'}},
}));
jest.mock('../../store', () => ({
  StoreEvents: {
    RESTORE_BACKUP: jest.fn(data => ({type: 'RESTORE_BACKUP', data})),
  },
}));

import {restoreActions} from './restoreActions';
import Cloud from '../../../shared/CloudBackupAndRestoreUtils';
import {cleanupLocalBackups} from '../../../shared/fileStorage';
import {
  sendStartEvent,
  sendEndEvent,
  sendErrorEvent,
} from '../../../shared/telemetry/TelemetryUtils';

describe('restoreActions', () => {
  const mockModel = {
    assign: jest.fn(arg => ({type: 'xstate.assign', assignment: arg})),
  };

  let actions: ReturnType<typeof restoreActions>;

  beforeEach(() => {
    jest.clearAllMocks();
    actions = restoreActions(mockModel);
  });

  it('should define all expected actions', () => {
    expect(actions.downloadUnsyncedBackupFiles).toBeDefined();
    expect(actions.setShowRestoreInProgress).toBeDefined();
    expect(actions.unsetShowRestoreInProgress).toBeDefined();
    expect(actions.setRestoreTechnicalError).toBeDefined();
    expect(actions.setBackupFileName).toBeDefined();
    expect(actions.setRestoreErrorReason).toBeDefined();
    expect(actions.setRestoreErrorReasonAsNetworkError).toBeDefined();
    expect(actions.loadDataToMemory).toBeDefined();
    expect(actions.refreshVCs).toBeDefined();
    expect(actions.setDataFromBackupFile).toBeDefined();
    expect(actions.cleanupFiles).toBeDefined();
  });

  describe('downloadUnsyncedBackupFiles', () => {
    it('should call Cloud.downloadUnSyncedBackupFiles', () => {
      actions.downloadUnsyncedBackupFiles();
      expect(Cloud.downloadUnSyncedBackupFiles).toHaveBeenCalled();
    });
  });

  describe('cleanupFiles', () => {
    it('should call cleanupLocalBackups', () => {
      actions.cleanupFiles();
      expect(cleanupLocalBackups).toHaveBeenCalled();
    });
  });

  describe('telemetry actions', () => {
    it('should send start event', () => {
      actions.sendDataRestoreStartEvent();
      expect(sendStartEvent).toHaveBeenCalled();
    });

    it('should send success event', () => {
      actions.sendDataRestoreSuccessEvent();
      expect(sendEndEvent).toHaveBeenCalled();
    });

    it('should send error event', () => {
      actions.sendDataRestoreErrorEvent({}, {data: 'err'});
      expect(sendErrorEvent).toHaveBeenCalled();
    });

    it('should send failure event', () => {
      actions.sendDataRestoreFailureEvent();
      expect(sendEndEvent).toHaveBeenCalled();
    });
  });

  describe('assignment function bodies', () => {
    it('setRestoreTechnicalError assigns errorReason technicalError', () => {
      const assignment = actions.setRestoreTechnicalError.assignment;
      expect(assignment.errorReason).toBe('technicalError');
    });

    it('setShowRestoreInProgress assigns true', () => {
      const assignment = actions.setShowRestoreInProgress.assignment;
      expect(assignment.showRestoreInProgress).toBe(true);
    });

    it('unsetShowRestoreInProgress assigns false', () => {
      const assignment = actions.unsetShowRestoreInProgress.assignment;
      expect(assignment.showRestoreInProgress).toBe(false);
    });

    it('setBackupFileName returns event.data', () => {
      const fn = actions.setBackupFileName.assignment.fileName;
      expect(fn({}, {data: 'backup_2024.zip'})).toBe('backup_2024.zip');
    });

    it('setRestoreErrorReason maps NO_BACKUP_FILE', () => {
      const fn = actions.setRestoreErrorReason.assignment.errorReason;
      expect(fn({}, {data: {error: 'no_backup_file'}})).toBe('noBackupFile');
    });

    it('setRestoreErrorReason maps NETWORK_REQUEST_FAILED', () => {
      const fn = actions.setRestoreErrorReason.assignment.errorReason;
      expect(fn({}, {data: {error: 'Network request failed'}})).toBe(
        'networkError',
      );
    });

    it('setRestoreErrorReason maps TECHNICAL_ERROR', () => {
      const fn = actions.setRestoreErrorReason.assignment.errorReason;
      expect(fn({}, {data: {error: 'Technical error'}})).toBe('technicalError');
    });

    it('setRestoreErrorReason defaults to technicalError for unknown', () => {
      const fn = actions.setRestoreErrorReason.assignment.errorReason;
      expect(fn({}, {data: {error: 'something_else'}})).toBe('technicalError');
    });

    it('setRestoreErrorReasonAsNetworkError assigns networkError', () => {
      const assignment = actions.setRestoreErrorReasonAsNetworkError.assignment;
      expect(assignment.errorReason).toBe('networkError');
    });

    it('setDataFromBackupFile returns event.dataFromBackupFile', () => {
      const fn = actions.setDataFromBackupFile.assignment.dataFromBackupFile;
      const data = {vcs: ['vc1']};
      expect(fn({}, {dataFromBackupFile: data})).toEqual(data);
    });

    it('loadDataToMemory is a send action with opts.to', () => {
      const {send} = require('xstate');
      expect(send).toHaveBeenCalled();
      const loadAction = actions.loadDataToMemory;
      expect(loadAction.opts).toBeDefined();
      const storeRef = {id: 'store'};
      const toFn = loadAction.opts.to;
      expect(toFn({serviceRefs: {store: storeRef}})).toBe(storeRef);
    });

    it('loadDataToMemory event calls RESTORE_BACKUP with context data', () => {
      const {StoreEvents} = require('../../store');
      const loadAction = actions.loadDataToMemory;
      const ctx = {dataFromBackupFile: {key: 'val'}};
      loadAction.event(ctx, {});
      expect(StoreEvents.RESTORE_BACKUP).toHaveBeenCalledWith({key: 'val'});
    });

    it('refreshVCs opts.to returns vcMeta serviceRef', () => {
      const refreshAction = actions.refreshVCs;
      expect(refreshAction.opts).toBeDefined();
      const vcMetaRef = {id: 'vcMeta'};
      expect(
        refreshAction.opts.to({serviceRefs: {vcMeta: vcMetaRef}}, {}),
      ).toBe(vcMetaRef);
    });
  });
});
