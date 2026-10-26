import React from 'react';
import {useTranslation} from 'react-i18next';
import {RootRouteProps} from '../routes';
import {useBiometricScreen} from './BiometricScreenController';
import {Passcode} from '../components/Passcode';
import {
  getEventType,
  incrementRetryCount,
  resetRetryCount,
} from '../shared/telemetry/TelemetryUtils';
import {TelemetryConstants} from '../shared/telemetry/TelemetryConstants';
import {Page, PageButton} from '../components/revamp/Page';
import {BiometricsIcon} from '../components/revamp/Icons';
import {LockedBrand} from './WelcomeScreen';

/** Android's biometric prompt opens over this page by itself; the button asks again. */
export const BiometricScreen: React.FC<RootRouteProps> = props => {
  const {t} = useTranslation('WelcomeScreen');
  const controller = useBiometricScreen(props);

  const handlePasscodeMismatch = (error: string) => {
    incrementRetryCount(
      getEventType(props.route.params?.setup),
      TelemetryConstants.Screens.passcode,
    );
    controller.onError(error);
  };

  const handleOnSuccess = () => {
    resetRetryCount();
    controller.onSuccess();
  };

  return (
    <Page
      testID="biometricUnlock"
      footer={
        <>
          <PageButton
            testID="unlockWithBiometrics"
            title={t('unlock')}
            icon={colour => <BiometricsIcon color={colour} size={20} />}
            onPress={controller.useBiometrics}
            disabled={controller.isSuccessBio}
          />
          <PageButton
            testID="usePasscodeInstead"
            variant="link"
            title={t('usePasscode')}
            onPress={() =>
              props.navigation.navigate('Passcode', {setup: false})
            }
          />
        </>
      }>
      <LockedBrand />
      {controller.isReEnabling && (
        <Passcode
          onSuccess={handleOnSuccess}
          onError={handlePasscodeMismatch}
          storedPasscode={controller.storedPasscode}
          onDismiss={() => controller.onDismiss()}
          error={controller.error}
          salt={controller.passcodeSalt}
        />
      )}
    </Page>
  );
};
