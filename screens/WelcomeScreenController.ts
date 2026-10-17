import {useSelector} from '@xstate/react';
import {useContext} from 'react';
import {
  AuthEvents,
  selectBiometrics,
  selectLanguagesetup,
  selectPasscode,
  selectSettingUp,
} from '../machines/auth';
import {
  SettingsEvents,
  selectBiometricUnlockEnabled,
} from '../machines/settings';
import {RootRouteProps} from '../routes';
import {GlobalContext} from '../shared/GlobalContext';
import {
  getStartEventData,
  getInteractEventData,
  sendInteractEvent,
  sendStartEvent,
} from '../shared/telemetry/TelemetryUtils';
import {TelemetryConstants} from '../shared/telemetry/TelemetryConstants';
import {PLATFORM_SPECIFIC} from '../shared/iosPlatform';

export function useWelcomeScreen(props: RootRouteProps) {
  const {appService} = useContext(GlobalContext);
  const authService = appService.children.get('auth');
  const settingsService = appService.children.get('settings');

  const isSettingUp = useSelector(authService, selectSettingUp);
  const passcode = useSelector(authService, selectPasscode);

  const isPasscodeSet = () => !!passcode;

  const biometrics = useSelector(authService, selectBiometrics);
  const isLanguagesetup = useSelector(authService, selectLanguagesetup);
  const isBiometricUnlockEnabled = useSelector(
    settingsService,
    selectBiometricUnlockEnabled,
  );

  // See PLATFORM_SPECIFIC.welcome: on iOS the biometric unlock runs on this screen itself (see
  // WelcomeScreen); Android keeps navigating to the Biometric screen in unlockPage below.
  const isBiometricUnlock =
    PLATFORM_SPECIFIC.welcome.unlocksBiometricsInPlace &&
    !isSettingUp &&
    isBiometricUnlockEnabled &&
    biometrics !== '';

  return {
    isSettingUp,
    isLanguagesetup,
    isPasscodeSet,
    isBiometricUnlock,
    // The language screen then opens the unlock setup once the auth machine is ready for it.
    SELECT: () => {
      authService.send(AuthEvents.SELECT());
    },
    BACK: () => {
      settingsService.send(SettingsEvents.BACK()),
        props.navigation.navigate('Main');
    },
    unlockPage: () => {
      // prioritize biometrics
      if (!isSettingUp && isBiometricUnlockEnabled && biometrics !== '') {
        props.navigation.navigate('Biometric', {setup: isSettingUp});
      } else if (!isSettingUp && passcode !== '') {
        sendStartEvent(getStartEventData(TelemetryConstants.FlowType.appLogin));
        sendInteractEvent(
          getInteractEventData(
            TelemetryConstants.FlowType.appLogin,
            TelemetryConstants.InteractEventSubtype.click,
            'Unlock application button',
          ),
        );
        props.navigation.navigate('Passcode', {setup: isSettingUp});
      } else {
        props.navigation.navigate('Auth');
      }
    },
  };
}
