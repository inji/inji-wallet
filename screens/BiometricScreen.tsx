import React from 'react';
import {useTranslation} from 'react-i18next';
import {TouchableOpacity} from 'react-native';
import {Button, Centered, Column} from '../components/ui';
import {Theme} from '../components/ui/styleUtils';
import {RootRouteProps} from '../routes';
import {useBiometricScreen} from './BiometricScreenController';
import {Passcode} from '../components/Passcode';
import {
  getEventType,
  incrementRetryCount,
  resetRetryCount,
} from '../shared/telemetry/TelemetryUtils';
import {TelemetryConstants} from '../shared/telemetry/TelemetryConstants';
import {SvgImage} from '../components/ui/svg';

export const BiometricScreen: React.FC<RootRouteProps> = props => {
  const {t} = useTranslation('BiometricScreen');
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
    <Column
      fill
      pY={32}
      pX={32}
      backgroundColor={Theme.Colors.whiteBackgroundColor}>
      <Centered fill>
        <TouchableOpacity onPress={controller.useBiometrics}>
          {SvgImage.fingerprintIcon(180)}
        </TouchableOpacity>
      </Centered>

      <Button
        title={t('unlock')}
        margin="8 0"
        type="gradient"
        onPress={controller.useBiometrics}
        disabled={controller.isSuccessBio}
      />
      {controller.isReEnabling && (
        <Passcode
          message="Enter your passcode to re-enable biometrics authentication."
          onSuccess={handleOnSuccess}
          onError={handlePasscodeMismatch}
          storedPasscode={controller.storedPasscode}
          onDismiss={() => controller.onDismiss()}
          error={controller.error}
          salt={controller.passcodeSalt}
        />
      )}
    </Column>
  );
};
