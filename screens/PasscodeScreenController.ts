import {useSelector} from '@xstate/react';
import {useContext, useEffect, useState} from 'react';
import {
  AuthEvents,
  selectAuthorized,
  selectPasscode,
  selectPasscodeSalt,
  selectIsBiometricToggleFromSettings,
} from '../machines/auth';
import {PasscodeRouteProps} from '../routes';
import {GlobalContext} from '../shared/GlobalContext';
import {
  getEndEventData,
  getEventType,
  sendEndEvent,
} from '../shared/telemetry/TelemetryUtils';
import {TelemetryConstants} from '../shared/telemetry/TelemetryConstants';
import {SettingsEvents} from '../machines/settings';

export function usePasscodeScreen(props: PasscodeRouteProps) {
  const {appService} = useContext(GlobalContext);
  const authService = appService.children.get('auth');
  const settingsService = appService.children.get('settings');
  const isAuthorized = useSelector(authService, selectAuthorized);
  const isPasscodeSet = () => !!passcode;
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthorized) {
      sendEndEvent(
        getEndEventData(
          getEventType(props.route.params?.setup),
          TelemetryConstants.EndEventStatus.success,
        ),
      );
      props.navigation.reset({
        index: 0,
        routes: [{name: 'Main'}],
      });
    }
  }, [isAuthorized]);

  return {
    isPasscodeSet,
    passcode,
    setPasscode,
    error,
    setError,

    storedPasscode: useSelector(authService, selectPasscode),
    toggleUnlock: useSelector(authService, selectIsBiometricToggleFromSettings),

    LOGIN: () => {
      authService.send(AuthEvents.LOGIN());
    },

    SETUP_PASSCODE: () => {
      authService.send(AuthEvents.SETUP_PASSCODE(passcode));
      settingsService?.send(
        SettingsEvents.TOGGLE_BIOMETRIC_UNLOCK(false, true),
      );
    },

    UPGRADE_PASSCODE_HASH: (newHash: string) => {
      authService.send(AuthEvents.UPGRADE_PASSCODE_HASH(newHash));
    },

    storedSalt: useSelector(authService, selectPasscodeSalt),
  };
}
