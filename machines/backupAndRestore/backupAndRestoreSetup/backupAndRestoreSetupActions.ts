import {Linking} from 'react-native';
import {send} from 'xstate';
import {SETTINGS_STORE_KEY} from '../../../shared/constants';
import {TelemetryConstants} from '../../../shared/telemetry/TelemetryConstants';
import {
  getEndEventData,
  getErrorEventData,
  getImpressionEventData,
  getStartEventData,
  sendEndEvent,
  sendErrorEvent,
  sendImpressionEvent,
  sendStartEvent,
} from '../../../shared/telemetry/TelemetryUtils';
import {SettingsEvents} from '../../settings';
import {StoreEvents} from '../../store';

export const backupAndRestoreSetupActions = model => {
  return {
    setIsLoading: model.assign({
      isLoading: true,
    }),
    unsetIsLoading: model.assign({
      isLoading: false,
    }),
    setProfileInfo: model.assign({
      profileInfo: (_context, event) => event.data?.profileInfo,
    }),

    sendDataBackupAndRestoreSetupStartEvent: () => {
      sendStartEvent(
        getStartEventData(
          TelemetryConstants.FlowType.dataBackupAndRestoreSetup,
        ),
      );
      sendImpressionEvent(
        getImpressionEventData(
          TelemetryConstants.FlowType.dataBackupAndRestoreSetup,
          TelemetryConstants.Screens.dataBackupAndRestoreSetupScreen,
        ),
      );
    },

    sendBackupAndRestoreSetupCancelEvent: () => {
      sendEndEvent(
        getEndEventData(
          TelemetryConstants.FlowType.dataBackupAndRestoreSetup,
          TelemetryConstants.EndEventStatus.cancel,
        ),
      );
    },

    sendBackupAndRestoreSetupErrorEvent: (_context, event) => {
      sendErrorEvent(
        getErrorEventData(
          TelemetryConstants.FlowType.dataBackupAndRestoreSetup,
          TelemetryConstants.ErrorId.failure,
          JSON.stringify(event.data),
        ),
      );
    },

    sendBackupAndRestoreSetupSuccessEvent: () => {
      sendEndEvent(
        getEndEventData(
          TelemetryConstants.FlowType.dataBackupAndRestoreSetup,
          TelemetryConstants.EndEventStatus.success,
        ),
      );
    },
    setAccountSelectionConfirmationShown: send(
      () => SettingsEvents.SHOWN_ACCOUNT_SELECTION_CONFIRMATION(),
      {to: (context: any, _event: any) => context.serviceRefs.settings},
    ),
    fetchShowConfirmationInfo: send(() => StoreEvents.GET(SETTINGS_STORE_KEY), {
      to: (context: any, _event: any) => context.serviceRefs.store,
    }),
    setShouldTriggerAutoBackup: model.assign({
      shouldTriggerAutoBackup: true,
    }),
    unsetShouldTriggerAutoBackup: model.assign({
      shouldTriggerAutoBackup: false,
    }),
    openSettings: () => Linking.openSettings(),
  };
};
