import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Dimensions, Image, KeyboardAvoidingView} from 'react-native';
import {MAX_PIN, PasscodeVerify} from '../components/PasscodeVerify';
import {PinInput} from '../components/PinInput';
import {Column, Text} from '../components/ui';
import {Theme} from '../components/ui/styleUtils';
import {PasscodeRouteProps} from '../routes';
import {usePasscodeScreen} from './PasscodeScreenController';
import {hashData} from '../shared/commonUtil';
import {argon2iConfig, isIOS} from '../shared/constants';
import {
  getEndEventData,
  getEventType,
  getImpressionEventData,
  resetRetryCount,
  sendEndEvent,
  sendImpressionEvent,
} from '../shared/telemetry/TelemetryUtils';
import {TelemetryConstants} from '../shared/telemetry/TelemetryConstants';

import {BackHandler} from 'react-native';
import {incrementRetryCount} from '../shared/telemetry/TelemetryUtils';
import {SvgImage} from '../components/ui/svg';

export const PasscodeScreen: React.FC<PasscodeRouteProps> = props => {
  const {t} = useTranslation('PasscodeScreen');
  const controller = usePasscodeScreen(props);
  const isSettingUp = props.route.params?.setup;

  useEffect(() => {
    sendImpressionEvent(
      getImpressionEventData(
        getEventType(isSettingUp),
        TelemetryConstants.Screens.passcode,
      ),
    );
  }, [isSettingUp]);

  const handleBackButtonPress = () => {
    sendEndEvent(
      getEndEventData(
        getEventType(isSettingUp),
        TelemetryConstants.EndEventStatus.failure,
        {
          errorId: TelemetryConstants.ErrorId.userCancel,
          errorMessage: TelemetryConstants.ErrorMessage.authenticationCancelled,
        },
      ),
    );
    return false;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackButtonPress,
    );

    return () => {
      backHandler.remove();
    };
  }, []);

  const setPasscode = async (passcode: string) => {
    const data = await hashData(passcode, controller.storedSalt, argon2iConfig);
    controller.setPasscode(data);
  };

  const handlePasscodeMismatch = (error: string) => {
    incrementRetryCount(
      getEventType(isSettingUp),
      TelemetryConstants.Screens.passcode,
    );
    controller.setError(error);
  };

  const passcodeSetup =
    controller.passcode === '' ? (
      <Column align="space-between">
        <Text
          testID="setPasscodeHeader"
          align="center"
          size={'large'}
          style={{...Theme.TextStyles.header, paddingTop: 27}}>
          {t('header')}
        </Text>
        <Text
          testID="setPasscodeDescription"
          align="center"
          style={{
            paddingTop: 3,
            marginTop: 6,
            marginBottom: Dimensions.get('screen').height * 0.1,
          }}
          size={'mediumExtraSmall'}
          weight="semibold"
          color={Theme.Colors.GrayText}>
          {controller.toggleUnlock
            ? t('enterAlternateNewPassword')
            : t('enterNewPassword')}
        </Text>
        <PinInput
          testID="setPasscodePin"
          length={MAX_PIN}
          onDone={setPasscode}
          autosubmit={true}
        />
      </Column>
    ) : (
      <Column align="space-between">
        <Text
          testID="confirmPasscodeHeader"
          align="center"
          size={'large'}
          style={{...Theme.TextStyles.header, paddingTop: 27}}>
          {t('confirmPasscode')}
        </Text>
        <Text
          testID="confirmPasscodeDescription"
          align="center"
          size={'mediumExtraSmall'}
          style={{
            paddingTop: 3,
            marginTop: 6,
            marginBottom: Dimensions.get('screen').height * 0.1,
          }}
          weight="semibold"
          color={Theme.Colors.GrayText}>
          {controller.toggleUnlock
            ? t('reEnterAlternatePassword')
            : t('reEnterPassword')}
        </Text>
        <PasscodeVerify
          testID="confirmPasscodePin"
          onSuccess={() => {
            resetRetryCount();
            controller.SETUP_PASSCODE();
          }}
          onError={handlePasscodeMismatch}
          passcode={controller.passcode}
          salt={controller.storedSalt}
        />
      </Column>
    );

  const unlockPasscode = (
    <Column align="space-between">
      <Text
        testID="enterPasscode"
        style={{
          paddingTop: 3,
          marginTop: 6,
          marginBottom: Dimensions.get('screen').height * 0.1,
        }}
        size={'large'}
        align="center"
        weight="semibold"
        color={Theme.Colors.GrayText}>
        {t('enterPasscode')}
      </Text>
      <PasscodeVerify
        testID="enterPasscodePin"
        onSuccess={() => {
          resetRetryCount();
          controller.LOGIN();
        }}
        onError={handlePasscodeMismatch}
        passcode={controller.storedPasscode}
        salt={controller.storedSalt}
      />
    </Column>
  );

  return (
    <KeyboardAvoidingView
      style={Theme.Styles.passwordKeyboardAvoidStyle}
      behavior={isIOS() ? 'padding' : 'height'}>
      {SvgImage.LockIcon()}
      <Column>
        {isSettingUp ? passcodeSetup : unlockPasscode}
        <Text
          testID="PasscodeError"
          align="center"
          color={Theme.Colors.errorMessage}>
          {controller.error}
        </Text>
      </Column>
    </KeyboardAvoidingView>
  );
};
