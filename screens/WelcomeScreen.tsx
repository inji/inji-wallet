import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
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
import {Page, PageButton} from '../components/revamp/Page';
import {BiometricsIcon} from '../components/revamp/Icons';
import {ScaledText} from '../components/revamp/ScaledText';
import {fonts} from '../components/revamp/tokens';
import {useRevampTheme} from '../components/revamp/useRevampTheme';
import InjiHomeLogo from '../assets/InjiHomeLogo.svg';

export const WelcomeScreen: React.FC<RootRouteProps> = props => {
  const {t} = useTranslation('WelcomeScreen');
  const controller = useWelcomeScreen(props);
  const biometricIcon = controller.hasBiometricUnlock
    ? (colour: string) => <BiometricsIcon color={colour} size={20} />
    : undefined;

  return (
    <Page
      testID="welcome"
      footer={
        <>
          {controller.isBiometricUnlock ? (
            <BiometricUnlockButton {...props} />
          ) : (
            <PageButton
              testID="unlockApplication"
              title={t('unlock')}
              icon={biometricIcon}
              onPress={controller.unlockPage}
            />
          )}
          {controller.hasBiometricUnlock ? (
            <PageButton
              testID="usePasscodeInstead"
              variant="link"
              title={t('usePasscode')}
              onPress={controller.usePasscode}
            />
          ) : null}
        </>
      }>
      <LockedBrand />
    </Page>
  );
};

/** The logo, the app's name and "Your cards are locked", centred on the page. */
export const LockedBrand: React.FC = () => {
  const {t} = useTranslation('WelcomeScreen');
  const {c} = useRevampTheme();
  return (
    <View style={styles.brand}>
      <InjiHomeLogo width={96} height={96} />
      <ScaledText
        accessibilityRole="header"
        style={[styles.name, {color: c.ink}]}>
        {t('appName')}
      </ScaledText>
      <ScaledText style={[styles.locked, {color: c.inkMuted}]}>
        {t('locked')}
      </ScaledText>
    </View>
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
      <PageButton
        testID="unlockApplication"
        title={t('unlock')}
        icon={colour => <BiometricsIcon color={colour} size={20} />}
        onPress={controller.unlock}
        disabled={controller.isSuccessBio}
      />
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
    </>
  );
};

const styles = StyleSheet.create({
  brand: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12},
  name: {
    fontFamily: fonts.semibold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
    marginTop: 8,
    textAlign: 'center',
  },
  locked: {fontFamily: fonts.regular, fontSize: 15, lineHeight: 20},
});
