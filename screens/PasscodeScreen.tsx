import React, {useContext, useEffect, useState} from 'react';
import {BackHandler, ScrollView, StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useSelector} from '@xstate/react';
import {MAX_PIN, PasscodeVerify} from '../components/PasscodeVerify';
import {PinInput} from '../components/PinInput';
import {PasscodeRouteProps} from '../routes';
import {usePasscodeScreen} from './PasscodeScreenController';
import {hashData} from '../shared/commonUtil';
import {argon2iConfig} from '../shared/constants';
import {
  getEndEventData,
  getEventType,
  getImpressionEventData,
  incrementRetryCount,
  resetRetryCount,
  sendEndEvent,
  sendImpressionEvent,
} from '../shared/telemetry/TelemetryUtils';
import {TelemetryConstants} from '../shared/telemetry/TelemetryConstants';
import {GlobalContext} from '../shared/GlobalContext';
import {selectBiometrics} from '../machines/auth';
import {selectBiometricUnlockEnabled} from '../machines/settings';
import {
  FieldError,
  Page,
  PageButton,
  PageHeader,
  PageHeading,
} from '../components/revamp/Page';
import {BiometricsIcon} from '../components/revamp/Icons';
import {useRevampTheme} from '../components/revamp/useRevampTheme';
import InjiHomeLogo from '../assets/InjiHomeLogo.svg';

export const PasscodeScreen: React.FC<PasscodeRouteProps> = props => {
  const {t} = useTranslation('PasscodeScreen');
  const controller = usePasscodeScreen(props);
  const isSettingUp = props.route.params?.setup;
  // Remounts the boxes, which clears them and puts the cursor back in the first one.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    sendImpressionEvent(
      getImpressionEventData(
        getEventType(isSettingUp),
        TelemetryConstants.Screens.passcode,
      ),
    );
  }, [isSettingUp]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        sendEndEvent(
          getEndEventData(
            getEventType(isSettingUp),
            TelemetryConstants.EndEventStatus.failure,
            {
              errorId: TelemetryConstants.ErrorId.userCancel,
              errorMessage:
                TelemetryConstants.ErrorMessage.authenticationCancelled,
            },
          ),
        );
        return false;
      },
    );
    return () => backHandler.remove();
  }, []);

  const setPasscode = async (passcode: string) => {
    const data = await hashData(passcode, controller.storedSalt, argon2iConfig);
    controller.setError('');
    controller.setPasscode(data);
  };

  const onMismatch = (error: string) => {
    incrementRetryCount(
      getEventType(isSettingUp),
      TelemetryConstants.Screens.passcode,
    );
    controller.setError(isSettingUp ? t('confirmMismatch') : error);
    setAttempt(a => a + 1);
  };

  return isSettingUp ? (
    <SetupPasscode
      step={controller.passcode === '' ? 'choose' : 'confirm'}
      hint={
        controller.passcode === ''
          ? controller.toggleUnlock
            ? t('enterAlternateNewPassword')
            : t('chooseHint')
          : controller.toggleUnlock
          ? t('reEnterAlternatePassword')
          : t('confirmHint')
      }
      error={controller.error}
      onBack={() => {
        if (controller.passcode !== '') {
          controller.setPasscode('');
          controller.setError('');
        } else {
          props.navigation.goBack();
        }
      }}>
      {controller.passcode === '' ? (
        <PinInput
          key="choose"
          testID="setPasscodePin"
          length={MAX_PIN}
          onDone={setPasscode}
          autosubmit={true}
        />
      ) : (
        <PasscodeVerify
          key={`confirm-${attempt}`}
          testID="confirmPasscodePin"
          onSuccess={() => {
            resetRetryCount();
            controller.SETUP_PASSCODE();
          }}
          onError={onMismatch}
          passcode={controller.passcode}
          salt={controller.storedSalt}
        />
      )}
    </SetupPasscode>
  ) : (
    <UnlockPasscode
      error={controller.error}
      onBiometrics={() =>
        props.navigation.navigate('Biometric', {setup: false})
      }>
      <PasscodeVerify
        key={`unlock-${attempt}`}
        testID="enterPasscodePin"
        onSuccess={() => {
          resetRetryCount();
          controller.LOGIN();
        }}
        onError={onMismatch}
        passcode={controller.storedPasscode}
        salt={controller.storedSalt}
      />
    </UnlockPasscode>
  );
};

const SetupPasscode: React.FC<{
  step: 'choose' | 'confirm';
  hint: string;
  error: string;
  onBack: () => void;
  children: React.ReactNode;
}> = ({step, hint, error, onBack, children}) => {
  const {t} = useTranslation('PasscodeScreen');
  return (
    <Page
      testID="setPasscode"
      header={<PageHeader title={t('header')} onBack={onBack} />}>
      <ScrollView
        keyboardShouldPersistTaps="always"
        contentContainerStyle={styles.setup}>
        <StepDots current={step === 'choose' ? 0 : 1} />
        <PageHeading
          testID={
            step === 'choose' ? 'setPasscodeHeader' : 'confirmPasscodeHeader'
          }
          size="medium"
          title={step === 'choose' ? t('chooseTitle') : t('confirmTitle')}
          body={hint}
        />
        <View style={styles.pins}>{children}</View>
        <FieldError testID="PasscodeError" message={error} />
      </ScrollView>
    </Page>
  );
};

const UnlockPasscode: React.FC<{
  error: string;
  onBiometrics: () => void;
  children: React.ReactNode;
}> = ({error, onBiometrics, children}) => {
  const {t} = useTranslation('PasscodeScreen');
  const biometricT = useTranslation('BiometricScreen').t;
  const {appService} = useContext(GlobalContext);
  const biometrics = useSelector(
    appService.children.get('auth')!,
    selectBiometrics,
  );
  const biometricEnabled = useSelector(
    appService.children.get('settings')!,
    selectBiometricUnlockEnabled,
  );
  return (
    <Page testID="unlockPasscode">
      <ScrollView
        keyboardShouldPersistTaps="always"
        contentContainerStyle={styles.unlock}>
        <InjiHomeLogo width={64} height={64} />
        <PageHeading
          testID="enterPasscode"
          size="medium"
          title={t('enterPasscode')}
        />
        <View style={styles.pins}>{children}</View>
        <FieldError testID="PasscodeError" message={error} />
        {biometricEnabled && biometrics !== '' ? (
          <PageButton
            testID="unlockWithBiometrics"
            variant="link"
            title={biometricT('unlock')}
            icon={colour => <BiometricsIcon color={colour} size={18} />}
            onPress={onBiometrics}
          />
        ) : null}
      </ScrollView>
    </Page>
  );
};

const StepDots: React.FC<{current: number}> = ({current}) => {
  const {c} = useRevampTheme();
  return (
    <View style={styles.dots} accessible={false}>
      {[0, 1].map(i => (
        <View
          key={i}
          style={[
            styles.dot,
            {backgroundColor: c.ink, opacity: i === current ? 1 : 0.3},
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  setup: {paddingTop: 20, paddingBottom: 24, gap: 18},
  unlock: {paddingTop: 48, paddingBottom: 24, gap: 18, alignItems: 'center'},
  pins: {marginTop: 18, alignSelf: 'stretch', alignItems: 'center'},
  dots: {flexDirection: 'row', gap: 8, alignSelf: 'center'},
  dot: {width: 7, height: 7, borderRadius: 4},
});
