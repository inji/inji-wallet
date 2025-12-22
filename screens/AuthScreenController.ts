import {useMachine, useSelector} from '@xstate/react';
import {useContext, useEffect, useState} from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

import {AuthEvents, selectSettingUp, selectAuthorized} from '../machines/auth';
import {RootRouteProps} from '../routes';
import {GlobalContext} from '../shared/GlobalContext';
import {
  biometricsMachine,
  selectError,
  selectIsEnabled,
  selectIsSuccess,
  selectIsUnvailable,
  selectUnenrolledNotice,
  selectErrorResponse,
} from '../machines/biometrics';
import {SettingsEvents} from '../machines/settings';
import {useTranslation} from 'react-i18next';
import {
  sendStartEvent,
  sendImpressionEvent,
  sendInteractEvent,
  getStartEventData,
  getInteractEventData,
  getImpressionEventData,
  getEndEventData,
  sendEndEvent,
} from '../shared/telemetry/TelemetryUtils';
import {TelemetryConstants} from '../shared/telemetry/TelemetryConstants';

export function useAuthScreen(props: RootRouteProps) {
  const {appService} = useContext(GlobalContext);
  const authService = appService.children.get('auth');
  const settingsService = appService.children.get('settings');

  const isSettingUp = useSelector(authService, selectSettingUp);
  const isAuthorized = useSelector(authService, selectAuthorized);

  const [alertMsg, setHasAlertMsg] = useState('');
  const [isBiometricsAvailable, setIsBiometricsAvailable] = useState(false);
  const [biometricState, biometricSend, bioService] =
    useMachine(biometricsMachine);

  const isEnabledBio = useSelector(bioService, selectIsEnabled);
  const isUnavailableBio = useSelector(bioService, selectIsUnvailable);
  const isSuccessBio = useSelector(bioService, selectIsSuccess);
  const errorMsgBio = useSelector(bioService, selectError);
  const unEnrolledNoticeBio = useSelector(bioService, selectUnenrolledNotice);
  const errorResponse = useSelector(bioService, selectErrorResponse);

  const navigateToPasscode = () => {
    props.navigation.navigate('Passcode', {setup: isSettingUp});
  };

  const {t} = useTranslation('AuthScreen');

  const fetchIsAvailable = async () => {
    const result = await LocalAuthentication.hasHardwareAsync();
    setIsBiometricsAvailable(result);
  };
  fetchIsAvailable();

  useEffect(() => {
    if (isAuthorized) {
      sendEndEvent(
        getEndEventData(
          TelemetryConstants.FlowType.appOnboarding,
          TelemetryConstants.EndEventStatus.success,
        ),
      );
      props.navigation.reset({
        index: 0,
        routes: [{name: 'Main'}],
      });
      sendImpressionEvent(
        getImpressionEventData(
          TelemetryConstants.FlowType.appOnboarding,
          TelemetryConstants.Screens.home,
        ),
      );
      return;
    }

    // if biometic state is success then lets send auth service BIOMETRICS
    if (isSuccessBio) {
      authService.send(AuthEvents.SETUP_BIOMETRICS('true'));
      settingsService.send(SettingsEvents.TOGGLE_BIOMETRIC_UNLOCK(true, false));
      // setup passcode aswell
      navigateToPasscode();

      // handle biometric failure unknown error
    } else if (errorMsgBio) {
      sendEndEvent(
        getEndEventData(
          TelemetryConstants.FlowType.appOnboarding,
          TelemetryConstants.EndEventStatus.failure,
          {
            errorId: errorResponse.res.error,
            errorMessage: errorResponse.res.warning,
            stackTrace: errorResponse.stacktrace,
          },
        ),
      );
      // show alert message whenever biometric state gets failure
      if (errorResponse.res.error !== 'user_cancel') {
        setHasAlertMsg(t(errorMsgBio));
      }

      // handle any unenrolled notice
    } else if (unEnrolledNoticeBio) {
      setHasAlertMsg(t(unEnrolledNoticeBio));

      // we dont need to see this page to user once biometric is unavailable on its device
    } else if (isUnavailableBio) {
      sendStartEvent(
        getStartEventData(TelemetryConstants.FlowType.appOnboarding),
      );
      navigateToPasscode();
    }
  }, [isSuccessBio, isUnavailableBio, errorMsgBio, unEnrolledNoticeBio]);

  const useBiometrics = async () => {
    const isBiometricsEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (isBiometricsEnrolled) {
      sendStartEvent(
        getStartEventData(TelemetryConstants.FlowType.appOnboarding),
      );
      sendInteractEvent(
        getInteractEventData(
          TelemetryConstants.FlowType.appOnboarding,
          TelemetryConstants.InteractEventSubtype.click,
          'Use Biometrics Button',
        ),
      );

      if (biometricState.matches({failure: 'unenrolled'})) {
        biometricSend({type: 'RETRY_AUTHENTICATE'});
        return;
      }

      biometricSend({type: 'AUTHENTICATE'});
    } else {
      setHasAlertMsg(t('errors.unenrolled'));
    }
  };

  const hideAlert = () => {
    setHasAlertMsg('');
  };

  return {
    isBiometricsAvailable,
    isSettingUp,
    alertMsg,
    isEnabledBio,

    hideAlert,
    useBiometrics,
    navigateToPasscode,
  };
}
