import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {PasscodeVerify} from '../components/PasscodeVerify';
import {
  FieldError,
  Page,
  PageHeader,
  PageHeading,
  PageModal,
} from './revamp/Page';
import {
  getImpressionEventData,
  sendImpressionEvent,
} from '../shared/telemetry/TelemetryUtils';
import {TelemetryConstants} from '../shared/telemetry/TelemetryConstants';
import InjiHomeLogo from '../assets/InjiHomeLogo.svg';

/** Asks for the passcode over the current screen, e.g. to turn biometrics back on. */
export const Passcode: React.FC<PasscodeProps> = props => {
  const {t} = useTranslation('PasscodeScreen');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    sendImpressionEvent(
      getImpressionEventData(
        TelemetryConstants.FlowType.appLogin,
        TelemetryConstants.Screens.passcode,
      ),
    );
  }, []);

  return (
    <PageModal visible={true} onRequestClose={props.onDismiss}>
      <Page
        testID="passcodePrompt"
        header={<PageHeader onClose={props.onDismiss} />}>
        <ScrollView
          keyboardShouldPersistTaps="always"
          contentContainerStyle={styles.content}>
          <InjiHomeLogo width={64} height={64} />
          <PageHeading
            testID="passcodePromptTitle"
            size="medium"
            title={t('enterPasscode')}
            body={props.message ?? t('reEnableBiometrics')}
          />
          <View style={styles.pins}>
            <PasscodeVerify
              testID="passcodePromptPin"
              clearKey={attempt}
              onSuccess={props.onSuccess}
              onError={message => {
                props.onError(message);
                setAttempt(a => a + 1);
              }}
              passcode={props.storedPasscode}
              salt={props.salt}
            />
          </View>
          <FieldError testID="passcodePromptError" message={props.error} />
        </ScrollView>
      </Page>
    </PageModal>
  );
};

interface PasscodeProps {
  message?: string;
  error: string;
  storedPasscode: string;
  salt: string;
  onSuccess: () => void;
  onError: (value: string) => void;
  onDismiss: () => void;
}

const styles = StyleSheet.create({
  content: {paddingTop: 24, paddingBottom: 24, gap: 18, alignItems: 'center'},
  pins: {marginTop: 18, alignSelf: 'stretch', alignItems: 'center'},
});
