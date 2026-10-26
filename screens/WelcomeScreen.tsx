import React from 'react';
import {useTranslation} from 'react-i18next';
import {Button, HorizontallyCentered, Column} from '../components/ui';
import {Theme} from '../components/ui/styleUtils';
import {RootRouteProps} from '../routes';
import {useWelcomeScreen} from './WelcomeScreenController';
import {useBiometricScreen} from './BiometricScreenController';
import {Passcode} from '../components/Passcode';
import {
  getEventType,
  incrementRetryCount,
  resetRetryCount,
} from '../shared/telemetry/TelemetryUtils';
import {TelemetryConstants} from '../shared/telemetry/TelemetryConstants';
// Rendered directly (rather than via SvgImage.InjiLogo/Theme.HomeScreenLogo) because that
// theme key now points at the horizontal icon+wordmark lockup used in the Home header, while
// this unlock screen keeps the icon-only mark.
import CredIssuerMark from '../assets/CredIssuerMark.svg';

export const WelcomeScreen: React.FC<RootRouteProps> = props => {
  const {t} = useTranslation('WelcomeScreen');
  const controller = useWelcomeScreen(props);
  return (
    <Column
      fill
      padding="32 32 0"
      backgroundColor={Theme.Colors.whiteBackgroundColor}>
      <HorizontallyCentered fill>
        <CredIssuerMark {...Theme.Styles.welcomeLogo} />
      </HorizontallyCentered>
      {controller.isBiometricUnlock ? (
        <BiometricUnlockButton {...props} />
      ) : (
        <Button
          testID="unlockApplication"
          margin="0 0 32"
          type="gradient"
          title={t('unlockApplication')}
          onPress={controller.unlockPage}
        />
      )}
    </Column>
  );
};

/**
 * iOS unlock button for users with biometric unlock enabled. It runs the same biometric flow as
 * the Biometric screen (success → Main, unavailable or unenrolled → Passcode, and the passcode
 * re-enable prompt), started by the tap instead of by navigating to a second page.
 *
 * It's a separate component so the biometrics machine is created only for these users: the
 * machine checks availability as soon as it's created and redirects to Passcode when biometrics
 * are unavailable, which must never happen to a passcode-only user on this screen.
 */
const BiometricUnlockButton: React.FC<RootRouteProps> = props => {
  const {t} = useTranslation('WelcomeScreen');
  const controller = useBiometricScreen(props, {autoStart: false});

  const handlePasscodeMismatch = (error: string) => {
    incrementRetryCount(
      // Always a login, never setup: this button only exists when isSettingUp is false.
      getEventType(false),
      TelemetryConstants.Screens.passcode,
    );
    controller.onError(error);
  };

  const handleOnSuccess = () => {
    resetRetryCount();
    controller.onSuccess();
  };

  return (
    <>
      <Button
        testID="unlockApplication"
        margin="0 0 32"
        type="gradient"
        title={t('unlockApplication')}
        onPress={controller.unlock}
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
    </>
  );
};
