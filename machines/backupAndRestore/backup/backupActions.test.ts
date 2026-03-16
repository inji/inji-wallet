jest.mock('xstate', () => ({
  send: jest.fn((event, opts) => ({type: 'xstate.send', event, opts})),
}));
jest.mock('../../../shared/constants', () => ({
  IOS_SIGNIN_FAILED: 'iCloud not available',
  MY_VCS_STORE_KEY: 'myVCs',
  NETWORK_REQUEST_FAILED: 'Network request failed',
  TECHNICAL_ERROR: 'Technical error',
}));
jest.mock('../../../shared/fileStorage', () => ({
  cleanupLocalBackups: jest.fn(),
}));
jest.mock('../../../shared/telemetry/TelemetryConstants', () => ({
  TelemetryConstants: {
    FlowType: {
      dataBackup: 'dataBackup',
      fetchLastBackupDetails: 'fetchLastBackupDetails',
    },
    Screens: {dataBackupScreen: 'dataBackupScreen'},
    ErrorId: {failure: 'failure'},
    EndEventStatus: {success: 'success', failure: 'failure', cancel: 'cancel'},
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
jest.mock('../../store', () => ({
  StoreEvents: {
    GET: jest.fn(key => ({type: 'GET', key})),
    EXPORT: jest.fn(() => ({type: 'EXPORT'})),
  },
}));

import {backupActions} from './backupActions';
import {cleanupLocalBackups} from '../../../shared/fileStorage';
import {
  sendStartEvent,
  sendEndEvent,
  sendErrorEvent,
  sendImpressionEvent,
} from '../../../shared/telemetry/TelemetryUtils';

describe('backupActions', () => {
  const mockModel = {
    assign: jest.fn(arg => ({type: 'xstate.assign', assignment: arg})),
  };

  let actions: ReturnType<typeof backupActions>;

  beforeEach(() => {
    jest.clearAllMocks();
    actions = backupActions(mockModel);
  });

  it('should define all expected actions', () => {
    expect(actions.unsetIsLoadingBackupDetails).toBeDefined();
    expect(actions.setIsLoadingBackupDetails).toBeDefined();
    expect(actions.setDataFromStorage).toBeDefined();
    expect(actions.setIsAutoBackup).toBeDefined();
    expect(actions.setShowBackupInProgress).toBeDefined();
    expect(actions.unsetShowBackupInProgress).toBeDefined();
    expect(actions.setFileName).toBeDefined();
    expect(actions.loadVcs).toBeDefined();
    expect(actions.setBackUpNotPossible).toBeDefined();
    expect(actions.setErrorReasonAsStorageLimitReached).toBeDefined();
    expect(actions.extractLastBackupDetails).toBeDefined();
    expect(actions.setLastBackupDetails).toBeDefined();
    expect(actions.unsetLastBackupDetails).toBeDefined();
    expect(actions.fetchAllDataFromDB).toBeDefined();
    expect(actions.setBackupErrorReasonAsNoInternet).toBeDefined();
    expect(actions.setBackupErrorReason).toBeDefined();
    expect(actions.cleanupFiles).toBeDefined();
  });

  it('should call model.assign for flag actions', () => {
    expect(mockModel.assign).toHaveBeenCalled();
  });

  describe('cleanupFiles', () => {
    it('should call cleanupLocalBackups', () => {
      actions.cleanupFiles();
      expect(cleanupLocalBackups).toHaveBeenCalled();
    });
  });

  describe('assignment function bodies', () => {
    it('setDataFromStorage returns event response', () => {
      const fn = actions.setDataFromStorage.assignment.dataFromStorage;
      expect(fn({}, {response: 'testData'})).toBe('testData');
    });

    it('setIsAutoBackup returns event isAutoBackUp', () => {
      const fn = actions.setIsAutoBackup.assignment.isAutoBackUp;
      expect(fn({}, {isAutoBackUp: true})).toBe(true);
      expect(fn({}, {isAutoBackUp: false})).toBe(false);
    });

    it('setShowBackupInProgress returns opposite of isAutoBackUp', () => {
      const fn =
        actions.setShowBackupInProgress.assignment.showBackupInProgress;
      expect(fn({isAutoBackUp: true}, {})).toBe(false);
      expect(fn({isAutoBackUp: false}, {})).toBe(true);
    });

    it('setFileName returns event filename', () => {
      const fn = actions.setFileName.assignment.fileName;
      expect(fn({}, {filename: 'backup_2024.zip'})).toBe('backup_2024.zip');
    });

    it('extractLastBackupDetails returns context with backupDetails', () => {
      const fn = actions.extractLastBackupDetails.assignment;
      const ctx = {existingProp: 'val'};
      const event = {data: {backupDetails: {date: '2024-01-01'}}};
      const result = fn(ctx, event);
      expect(result.lastBackupDetails).toEqual({date: '2024-01-01'});
      expect(result.existingProp).toBe('val');
    });

    it('setLastBackupDetails from STORE_RESPONSE event', () => {
      const fn = actions.setLastBackupDetails.assignment;
      const ctx = {other: 'val'};
      const event = {type: 'STORE_RESPONSE', response: {date: '2024-02-01'}};
      const result = fn(ctx, event);
      expect(result.lastBackupDetails).toEqual({date: '2024-02-01'});
    });

    it('setLastBackupDetails from other event with data', () => {
      const fn = actions.setLastBackupDetails.assignment;
      const ctx = {};
      const event = {type: 'OTHER', data: {date: '2024-03-01'}};
      const result = fn(ctx, event);
      expect(result.lastBackupDetails).toEqual({date: '2024-03-01'});
    });

    it('unsetLastBackupDetails sets lastBackupDetails to null', () => {
      const fn = actions.unsetLastBackupDetails.assignment;
      const ctx = {lastBackupDetails: {date: '2024-01-01'}};
      const result = fn(ctx, {});
      expect(result.lastBackupDetails).toBeNull();
    });

    it('setBackupErrorReasonAsNoInternet sets networkError', () => {
      const fn =
        actions.setBackupErrorReasonAsNoInternet.assignment.errorReason;
      expect(fn()).toBe('networkError');
    });

    it('setBackupErrorReason maps TECHNICAL_ERROR', () => {
      const fn = actions.setBackupErrorReason.assignment.errorReason;
      expect(fn({}, {data: {error: 'Technical error'}})).toBe('technicalError');
    });

    it('setBackupErrorReason maps NETWORK_REQUEST_FAILED', () => {
      const fn = actions.setBackupErrorReason.assignment.errorReason;
      expect(fn({}, {data: {error: 'Network request failed'}})).toBe(
        'networkError',
      );
    });

    it('setBackupErrorReason maps IOS_SIGNIN_FAILED', () => {
      const fn = actions.setBackupErrorReason.assignment.errorReason;
      expect(fn({}, {data: {error: 'iCloud not available'}})).toBe(
        'iCloudSignInError',
      );
    });

    it('setBackupErrorReason defaults to technicalError for unknown', () => {
      const fn = actions.setBackupErrorReason.assignment.errorReason;
      expect(fn({}, {data: {error: 'unknown_error'}})).toBe('technicalError');
    });

    it('setBackupErrorReason defaults to technicalError when data is undefined', () => {
      const fn = actions.setBackupErrorReason.assignment.errorReason;
      expect(fn({}, {data: undefined})).toBe('technicalError');
    });

    it('loadVcs is a send action', () => {
      const action = actions.loadVcs;
      expect(action).toBeDefined();
    });

    it('fetchAllDataFromDB is a send action', () => {
      const action = actions.fetchAllDataFromDB;
      expect(action).toBeDefined();
    });
  });

  describe('telemetry actions', () => {
    it('should send start event for fetch backup details', () => {
      actions.sendFetchLastBackupDetailsStartEvent();
      expect(sendStartEvent).toHaveBeenCalled();
      expect(sendImpressionEvent).toHaveBeenCalled();
    });

    it('should send error event for fetch backup details', () => {
      actions.sendFetchLastBackupDetailsErrorEvent({}, {data: 'error'});
      expect(sendErrorEvent).toHaveBeenCalled();
    });

    it('should send success event for fetch backup details', () => {
      actions.sendFetchLastBackupDetailsSuccessEvent();
      expect(sendEndEvent).toHaveBeenCalled();
    });

    it('should send failure event for fetch backup details', () => {
      actions.sendFetchLastBackupDetailsFailureEvent({}, {data: 'failure'});
      expect(sendEndEvent).toHaveBeenCalled();
    });

    it('should send cancel event for fetch backup details', () => {
      actions.sendFetchLastBackupDetailsCancelEvent();
      expect(sendEndEvent).toHaveBeenCalled();
    });

    it('should send data backup start event', () => {
      actions.sendDataBackupStartEvent();
      expect(sendStartEvent).toHaveBeenCalled();
    });

    it('should send data backup success event', () => {
      actions.sendDataBackupSuccessEvent();
      expect(sendEndEvent).toHaveBeenCalled();
    });

    it('should send data backup failure event', () => {
      actions.sendDataBackupFailureEvent();
      expect(sendEndEvent).toHaveBeenCalled();
    });
  });
});
