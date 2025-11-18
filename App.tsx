import 'react-native-get-random-values';
import React, {useContext, useEffect, useState} from 'react';
import {AppLayout} from './screens/AppLayout';
import {useFont} from './shared/hooks/useFont';
import {GlobalContextProvider} from './components/GlobalContextProvider';
import {GlobalContext} from './shared/GlobalContext';
import {useSelector} from '@xstate/react';
import {useTranslation} from 'react-i18next';
import {
  APP_EVENTS,
  selectIsDecryptError,
  selectIsKeyInvalidateError,
  selectIsDeepLinkDetected,
  selectIsReadError,
  selectIsReady,
} from './machines/app';
import {DualMessageOverlay} from './components/DualMessageOverlay';
import {useApp} from './screens/AppController';
import {Alert, AppState} from 'react-native';
import {
  configureTelemetry,
  getErrorEventData,
  sendErrorEvent,
} from './shared/telemetry/TelemetryUtils';
import {TelemetryConstants} from './shared/telemetry/TelemetryConstants';
import {MessageOverlay} from './components/MessageOverlay';
import {NativeModules} from 'react-native';
import {isHardwareKeystoreExists} from './shared/cryptoutil/cryptoUtil';
import i18n from './i18n';
import {CopilotProvider} from 'react-native-copilot';
import {CopilotTooltip} from './components/CopilotTooltip';
import {Theme} from './components/ui/styleUtils';
import {selectAppSetupComplete} from './machines/auth';
import {SafeAreaProvider} from 'react-native-safe-area-context';

const {RNSecureKeystoreModule} = NativeModules;
// kludge: this is a bad practice but has been done temporarily to surface
//  an occurrence of a bug with minimal residual code changes, this should
//  be removed once the bug cause is determined & fixed, ref: INJI-222
const DecryptErrorAlert = (controller, t) => {
  const heading = t('errors.decryptionFailed');
  const desc = t('errors.decryptionFailed');
  const ignoreBtnTxt = t('ignore');
  Alert.alert(heading, desc, [
    {
      text: ignoreBtnTxt,
      onPress: () => controller.ignoreDecrypt(),
      style: 'cancel',
    },
  ]);
};

const AppLayoutWrapper: React.FC = () => {
  const {appService} = useContext(GlobalContext);
  const isDecryptError = useSelector(appService, selectIsDecryptError);
  const isDeepLinkFlow = useSelector(appService, selectIsDeepLinkDetected);
  const controller = useApp();
  const {t} = useTranslation('WelcomeScreen');

  const authService = appService.children.get('auth');
  const isAppSetupComplete = useSelector(authService, selectAppSetupComplete);

  const [isDeepLinkOverlayVisible, setDeepLinkOverlayVisible] =
    useState(isDeepLinkFlow);

  useEffect(() => {
    if (AppState.currentState === 'active') {
      appService.send(APP_EVENTS.ACTIVE());
    } else {
      appService.send(APP_EVENTS.INACTIVE());
    }
  }, []);

  useEffect(() => {
    setDeepLinkOverlayVisible(isDeepLinkFlow);
  }, [isDeepLinkFlow]);

  if (isDecryptError) {
    DecryptErrorAlert(controller, t);
  }
  configureTelemetry();
  return (
    <>
      <AppLayout />

      <MessageOverlay
        isVisible={isDeepLinkOverlayVisible && !isAppSetupComplete}
        title={t('errors.appSetupIncomplete.title')}
        message={t('errors.appSetupIncomplete.message')}
        onButtonPress={() => {
          setDeepLinkOverlayVisible(false);
        }}
        buttonText={t('common:ok')}
        minHeight={'auto'}
      />
    </>
  );
};

const AppLoadingWrapper: React.FC = () => {
  const {appService} = useContext(GlobalContext);
  const isReadError = useSelector(appService, selectIsReadError);
  const isKeyInvalidateError = useSelector(
    appService,
    selectIsKeyInvalidateError,
  );
  const controller = useApp();
  const {t} = useTranslation('WelcomeScreen');
  useEffect(() => {
    if (isKeyInvalidateError) {
      configureTelemetry();
      sendErrorEvent(
        getErrorEventData(
          TelemetryConstants.FlowType.appLogin,
          TelemetryConstants.ErrorId.appWasReset,
          TelemetryConstants.ErrorMessage.appWasReset,
        ),
      );
    }
  }, [isKeyInvalidateError]);
  return (
    <>
      <MessageOverlay
        isVisible={isKeyInvalidateError}
        title={t('errors.invalidateKeyError.title')}
        message={t('errors.invalidateKeyError.message')}
        onButtonPress={controller.RESET}
        buttonText={t('common:ok')}
        minHeight={'auto'}
      />

      {isReadError ? (
        <DualMessageOverlay
          isVisible={isReadError}
          title={t('failedToReadKeys')}
          message={t('retryRead')}
          onTryAgain={controller.TRY_AGAIN}
          onIgnore={controller.IGNORE}
        />
      ) : null}
    </>
  );
};

const AppInitialization: React.FC = () => {
  const {appService} = useContext(GlobalContext);
  const hasFontsLoaded = useFont();
  const isReady = useSelector(appService, selectIsReady);
  const {t} = useTranslation('common');

  useEffect(() => {
    if (isHardwareKeystoreExists) {
      RNSecureKeystoreModule.updatePopup(
        t('biometricPopup.title'),
        t('biometricPopup.description'),
      );
    }
  }, [i18n.language]);

  return isReady && hasFontsLoaded ? (
    <AppLayoutWrapper />
  ) : (
    <AppLoadingWrapper />
  );
};

export default function App() {
  return (
    <SafeAreaProvider style={{backgroundColor: 'white'}}>
      <GlobalContextProvider>
        <CopilotProvider
          stopOnOutsideClick
          androidStatusBarVisible
          tooltipComponent={CopilotTooltip}
          tooltipStyle={Theme.Styles.copilotStyle}
          stepNumberComponent={() => null}
          animated>
          <AppInitialization />
        </CopilotProvider>
      </GlobalContextProvider>
    </SafeAreaProvider>
  );
}
