jest.mock('react-native', () => ({
  Linking: {
    openURL: jest.fn(),
  },
}));

jest.mock('xstate', () => ({
  assign: jest.fn(arg => ({type: 'xstate.assign', assignment: arg})),
  send: jest.fn((eventOrFn, opts) => ({
    type: 'xstate.send',
    event: typeof eventOrFn === 'function' ? eventOrFn : eventOrFn,
    opts,
  })),
}));

jest.mock('../../../shared/constants', () => ({
  SETTINGS_STORE_KEY: 'settings',
}));

jest.mock('../../../shared/telemetry/TelemetryConstants', () => ({
  TelemetryConstants: {
    FlowType: {
      dataBackupAndRestoreSetup: 'dataBackupAndRestoreSetup',
    },
    EndEventStatus: {
      cancel: 'cancel',
      success: 'success',
    },
    ErrorId: {
      failure: 'failure',
    },
    Screens: {
      dataBackupAndRestoreSetupScreen: 'dataBackupAndRestoreSetupScreen',
    },
  },
}));

jest.mock('../../../shared/telemetry/TelemetryUtils', () => ({
  getEndEventData: jest.fn((...args: any[]) => ({args})),
  getErrorEventData: jest.fn((...args: any[]) => ({args})),
  getImpressionEventData: jest.fn((...args: any[]) => ({args})),
  getStartEventData: jest.fn((...args: any[]) => ({args})),
  sendEndEvent: jest.fn(),
  sendErrorEvent: jest.fn(),
  sendImpressionEvent: jest.fn(),
  sendStartEvent: jest.fn(),
}));

jest.mock('../../settings', () => ({
  SettingsEvents: {
    SHOWN_ACCOUNT_SELECTION_CONFIRMATION: jest.fn(() => ({
      type: 'SHOWN_ACCOUNT_SELECTION_CONFIRMATION',
    })),
  },
}));

jest.mock('../../store', () => ({
  StoreEvents: {
    GET: jest.fn((key: string) => ({type: 'GET', key})),
  },
}));

import {backupAndRestoreSetupActions} from './backupAndRestoreSetupActions';
import {Linking} from 'react-native';

const {
  sendStartEvent,
  sendEndEvent,
  sendErrorEvent,
  sendImpressionEvent,
} = require('../../../shared/telemetry/TelemetryUtils');

describe('backupAndRestoreSetupActions', () => {
  const mockModel = {
    assign: jest.fn(arg => ({type: 'model.assign', assignment: arg})),
  };

  const actions = backupAndRestoreSetupActions(mockModel);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setIsLoading', () => {
    it('assigns isLoading to true', () => {
      expect(actions.setIsLoading).toEqual({
        type: 'model.assign',
        assignment: {isLoading: true},
      });
    });
  });

  describe('unsetIsLoading', () => {
    it('assigns isLoading to false', () => {
      expect(actions.unsetIsLoading).toEqual({
        type: 'model.assign',
        assignment: {isLoading: false},
      });
    });
  });

  describe('setProfileInfo', () => {
    it('extracts profileInfo from event.data', () => {
      const fn = actions.setProfileInfo.assignment.profileInfo;
      expect(typeof fn).toBe('function');
      const result = fn({}, {data: {profileInfo: {name: 'test'}}});
      expect(result).toEqual({name: 'test'});
    });

    it('returns undefined when data has no profileInfo', () => {
      const fn = actions.setProfileInfo.assignment.profileInfo;
      expect(fn({}, {data: {}})).toBeUndefined();
    });
  });

  describe('sendDataBackupAndRestoreSetupStartEvent', () => {
    it('sends start and impression events', () => {
      actions.sendDataBackupAndRestoreSetupStartEvent();
      expect(sendStartEvent).toHaveBeenCalled();
      expect(sendImpressionEvent).toHaveBeenCalled();
    });
  });

  describe('sendBackupAndRestoreSetupCancelEvent', () => {
    it('sends end event with cancel status', () => {
      actions.sendBackupAndRestoreSetupCancelEvent();
      expect(sendEndEvent).toHaveBeenCalled();
    });
  });

  describe('sendBackupAndRestoreSetupErrorEvent', () => {
    it('sends error event with event data', () => {
      actions.sendBackupAndRestoreSetupErrorEvent({}, {data: 'some error'});
      expect(sendErrorEvent).toHaveBeenCalled();
    });
  });

  describe('sendBackupAndRestoreSetupSuccessEvent', () => {
    it('sends end event with success status', () => {
      actions.sendBackupAndRestoreSetupSuccessEvent();
      expect(sendEndEvent).toHaveBeenCalled();
    });
  });

  describe('setShouldTriggerAutoBackup', () => {
    it('assigns shouldTriggerAutoBackup to true', () => {
      expect(actions.setShouldTriggerAutoBackup).toEqual({
        type: 'model.assign',
        assignment: {shouldTriggerAutoBackup: true},
      });
    });
  });

  describe('unsetShouldTriggerAutoBackup', () => {
    it('assigns shouldTriggerAutoBackup to false', () => {
      expect(actions.unsetShouldTriggerAutoBackup).toEqual({
        type: 'model.assign',
        assignment: {shouldTriggerAutoBackup: false},
      });
    });
  });

  describe('openSettings', () => {
    it('opens iOS settings URL', () => {
      actions.openSettings();
      expect(Linking.openURL).toHaveBeenCalledWith('App-Prefs:CASTLE');
    });
  });

  describe('setAccountSelectionConfirmationShown', () => {
    it('is defined (send action)', () => {
      expect(actions.setAccountSelectionConfirmationShown).toBeDefined();
    });
  });

  describe('fetchShowConfirmationInfo', () => {
    it('is defined (send action)', () => {
      expect(actions.fetchShowConfirmationInfo).toBeDefined();
    });
  });
});
