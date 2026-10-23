import React, {useContext, useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {BackHandler, Modal, Pressable, StyleSheet, View} from 'react-native';
import {initialWindowMetrics} from 'react-native-safe-area-context';
import {useSelector} from '@xstate/react';
import * as LocalAuthentication from 'expo-local-authentication';
import RNFingerprintChange from 'react-native-biometrics-changed';
import {GlobalContext} from '../shared/GlobalContext';
import {
  selectBiometrics,
  selectPasscode,
  selectPasscodeSalt,
} from '../machines/auth';
import {selectBiometricUnlockEnabled} from '../machines/settings';
import {APP_EVENTS, selectIsBiometricCancelled} from '../machines/app';
import {PasscodeVerify} from '../components/PasscodeVerify';
import {ScaledText} from '../components/revamp/ScaledText';
import {fonts, radii} from '../components/revamp/tokens';
import {useRevampTheme} from '../components/revamp/useRevampTheme';
import {isAndroid} from '../shared/constants';
import {useAutoLock} from './Settings/autoLock';
import InjiHomeLogo from '../assets/InjiHomeLogo.svg';

/**
 * Covers the app after auto-lock until the holder unlocks it, leaving every screen beneath as it
 * was, so unlocking returns them to where they left off. Also covers it while the wallet's storage
 * waits for a fingerprint the holder cancelled.
 */
export const AppLock: React.FC<{isAuthorized: boolean}> = ({isAuthorized}) => {
  const [locked, unlock] = useAutoLock();
  const {appService} = useContext(GlobalContext);
  const storageLocked = useSelector(appService, selectIsBiometricCancelled);
  // The fingerprint that opens the storage also counts for auto-lock.
  const retrying = useRef(false);
  useEffect(() => {
    if (retrying.current && !storageLocked) {
      retrying.current = false;
      unlock();
    }
  }, [storageLocked]);

  if (storageLocked)
    return (
      <StorageLockScreen
        onRetry={() => {
          retrying.current = true;
          appService.send(APP_EVENTS.RETRY_BIOMETRIC());
        }}
      />
    );
  if (!locked || !isAuthorized) return null;
  return <LockScreen onUnlock={unlock} />;
};

const StorageLockScreen: React.FC<{onRetry: () => void}> = ({onRetry}) => {
  const biometricT = useTranslation('BiometricScreen').t;
  const {t} = useTranslation('SettingScreen');
  const {c} = useRevampTheme();
  return (
    <Modal
      visible
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => undefined}>
      <View
        style={[
          styles.screen,
          {
            backgroundColor: c.canvas,
            paddingTop: (initialWindowMetrics?.insets.top ?? 0) + 64,
          },
        ]}>
        <InjiHomeLogo width={72} height={72} />
        <Pressable
          testID="storageUnlockBiometrics"
          accessibilityRole="button"
          onPress={onRetry}
          style={[styles.button, {backgroundColor: c.primary}]}>
          <ScaledText style={[styles.buttonText, {color: c.onPrimary}]}>
            {biometricT('unlock')}
          </ScaledText>
        </Pressable>
        <Pressable
          testID="storageLockCloseApp"
          accessibilityRole="button"
          onPress={() => BackHandler.exitApp()}
          style={styles.textButton}>
          <ScaledText style={[styles.textButtonText, {color: c.ink}]}>
            {t('closeApp')}
          </ScaledText>
        </Pressable>
      </View>
    </Modal>
  );
};

const LockScreen: React.FC<{onUnlock: () => void}> = ({onUnlock}) => {
  const passcodeT = useTranslation('PasscodeScreen').t;
  const biometricT = useTranslation('BiometricScreen').t;
  const {c} = useRevampTheme();
  const {appService} = useContext(GlobalContext);
  const authService = appService.children.get('auth')!;
  const settingsService = appService.children.get('settings')!;
  const passcode = useSelector(authService, selectPasscode);
  const salt = useSelector(authService, selectPasscodeSalt);
  const biometrics = useSelector(authService, selectBiometrics);
  const biometricEnabled = useSelector(
    settingsService,
    selectBiometricUnlockEnabled,
  );
  const [canUseBiometrics, setCanUseBiometrics] = useState(false);
  const [error, setError] = useState('');
  // Remounts the boxes after a wrong PIN, which clears them.
  const [attempt, setAttempt] = useState(0);
  // Mounted once the page is up, so the PIN box can take focus and open the keyboard.
  const [shown, setShown] = useState(false);

  const askBiometrics = async () => {
    try {
      if (isAndroid()) await LocalAuthentication.cancelAuthenticate();
      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: biometricT('unlock'),
        // The device's own PIN stays available, so a wallet without a passcode always has a way in.
        disableDeviceFallback: false,
      });
      if (res.success) onUnlock();
    } catch (e) {
      console.error('App lock biometrics failed', e);
    }
  };

  useEffect(() => {
    // A wallet set up with biometrics only has no passcode to fall back on.
    if (!passcode) {
      setCanUseBiometrics(true);
      askBiometrics();
      return;
    }
    if (!biometricEnabled || biometrics === '') return;
    // New fingerprints on the device mean the passcode is needed, as on the unlock screen.
    const changed: Promise<boolean> = isAndroid()
      ? RNFingerprintChange.hasFingerPrintChanged().catch(() => true)
      : Promise.resolve(false);
    changed.then(hasChanged => {
      if (hasChanged) return;
      setCanUseBiometrics(true);
      askBiometrics();
    });
  }, []);

  return (
    <Modal
      visible
      animationType="none"
      statusBarTranslucent
      onShow={() => setShown(true)}
      onRequestClose={() => undefined}>
      <View
        style={[
          styles.screen,
          {
            backgroundColor: c.canvas,
            paddingTop: (initialWindowMetrics?.insets.top ?? 0) + 64,
          },
        ]}>
        <InjiHomeLogo width={72} height={72} />
        {passcode && shown ? (
          <View style={styles.pin}>
            <ScaledText style={[styles.prompt, {color: c.ink}]}>
              {passcodeT('enterPasscode')}
            </ScaledText>
            <PasscodeVerify
              key={attempt}
              testID="appLockPasscode"
              passcode={passcode}
              salt={salt}
              onSuccess={onUnlock}
              onError={message => {
                setError(message);
                setAttempt(a => a + 1);
              }}
            />
            {error ? (
              <ScaledText style={[styles.error, {color: c.fail}]}>
                {error}
              </ScaledText>
            ) : null}
          </View>
        ) : null}
        {canUseBiometrics ? (
          <Pressable
            testID="appLockBiometrics"
            accessibilityRole="button"
            onPress={askBiometrics}
            style={[styles.button, {backgroundColor: c.primary}]}>
            <ScaledText style={[styles.buttonText, {color: c.onPrimary}]}>
              {biometricT('unlock')}
            </ScaledText>
          </Pressable>
        ) : null}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 32,
  },
  pin: {alignSelf: 'stretch', alignItems: 'center', gap: 32},
  prompt: {
    fontFamily: fonts.medium,
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
  },
  error: {fontFamily: fonts.regular, fontSize: 14, textAlign: 'center'},
  button: {
    alignSelf: 'stretch',
    height: 52,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {fontFamily: fonts.semibold, fontSize: 16},
  textButton: {paddingVertical: 12, paddingHorizontal: 24},
  textButtonText: {fontFamily: fonts.medium, fontSize: 16},
});
