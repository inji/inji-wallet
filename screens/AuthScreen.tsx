import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import {RootRouteProps} from '../routes';
import {useAuthScreen} from './AuthScreenController';
import {
  getStartEventData,
  getInteractEventData,
  sendInteractEvent,
  sendStartEvent,
} from '../shared/telemetry/TelemetryUtils';
import {TelemetryConstants} from '../shared/telemetry/TelemetryConstants';
import {
  AlertSheet,
  ChoiceCards,
  ChoiceRow,
  Page,
  PageButton,
  PageHeading,
} from '../components/revamp/Page';
import {
  AlertCircleIcon,
  BiometricsIcon,
  KeypadIcon,
} from '../components/revamp/Icons';

type Method = 'biometrics' | 'passcode';

export const AuthScreen: React.FC<RootRouteProps> = props => {
  const {t} = useTranslation('AuthScreen');
  const controller = useAuthScreen(props);
  const [method, setMethod] = useState<Method>('passcode');

  useEffect(() => {
    if (controller.isBiometricsAvailable) setMethod('biometrics');
  }, [controller.isBiometricsAvailable]);

  const usePasscode = () => {
    sendStartEvent(
      getStartEventData(TelemetryConstants.FlowType.appOnboarding),
    );
    sendInteractEvent(
      getInteractEventData(
        TelemetryConstants.FlowType.appOnboarding,
        TelemetryConstants.InteractEventSubtype.click,
        'Use Passcode Button',
      ),
    );
    controller.navigateToPasscode();
  };

  return (
    <Page
      testID="selectAppUnlockMethod"
      footer={
        <PageButton
          testID="continue"
          title={t('continue')}
          onPress={
            method === 'biometrics' ? controller.useBiometrics : usePasscode
          }
        />
      }>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <PageHeading align="left" title={t('header')} body={t('Description')} />
        <ChoiceCards>
          {controller.isBiometricsAvailable ? (
            <ChoiceRow
              card
              testID="useBiometrics"
              icon={colour => <BiometricsIcon color={colour} size={20} />}
              label={t('useBiometrics')}
              hint={t('useBiometricsHint')}
              selected={method === 'biometrics'}
              onPress={() => setMethod('biometrics')}
            />
          ) : null}
          <ChoiceRow
            card
            testID="usePasscode"
            icon={colour => <KeypadIcon color={colour} size={20} />}
            label={t('usePasscode')}
            hint={t('usePasscodeHint')}
            selected={method === 'passcode'}
            onPress={() => setMethod('passcode')}
          />
        </ChoiceCards>
      </ScrollView>
      <AlertSheet
        testID="unlockMethodAlert"
        isVisible={controller.alertMsg != ''}
        tone="fail"
        icon={colour => <AlertCircleIcon color={colour} />}
        title={controller.alertMsg}
        primary={{title: t('common:ok'), onPress: controller.hideAlert}}
        onRequestClose={controller.hideAlert}
      />
    </Page>
  );
};

const styles = StyleSheet.create({
  content: {paddingTop: 40, paddingBottom: 16, gap: 24},
});
