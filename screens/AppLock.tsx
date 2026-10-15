import React, {useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Modal, Pressable, StyleSheet, View} from 'react-native';
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
import {PasscodeVerify} from '../components/PasscodeVerify';
import {ScaledText} from '../components/revamp/ScaledText';
import {fonts, radii} from '../components/revamp/tokens';
import {useRevampTheme} from '../components/revamp/useRevampTheme';
import {isAndroid} from '../shared/constants';
import {useAutoLock} from './Settings/autoLock';
import InjiHomeLogo from '../assets/InjiHomeLogo.svg';

/**
 * Covers the app after auto-lock until the holder unlocks it, leaving every screen beneath as it
 * was, so unlocking returns them to where they left off.
 */
export const AppLock: React.FC = () => {
  const [locked, unlock] = useAutoLock();
  if (!locked) return null;
  return <LockScreen onUnlock={unlock} />;
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

  const askBiometrics = async () => {
    if (isAndroid()) await LocalAuthentication.cancelAuthenticate();
    const res = await LocalAuthentication.authenticateAsync({
      promptMessage: biometricT('unlock'),
    });
    if (res.success) onUnlock();
  };

  useEffect(() => {
    if (!biometricEnabled || biometrics === '') return;
    // New fingerprints on the device mean the passcode is needed, as on the unlock screen.
    const changed: Promise<boolean> = isAndroid()
      ? RNFingerprintChange.hasFingerPrintChanged()
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
      onRequestClose={() => undefined}>
      <View style={[styles.screen, {backgroundColor: c.canvas}]}>
        <InjiHomeLogo width={96} height={96} />
        {passcode ? (
          <View style={styles.pin}>
            <ScaledText style={[styles.prompt, {color: c.ink}]}>
              {passcodeT('enterPasscode')}
            </ScaledText>
            <PasscodeVerify
              testID="appLockPasscode"
              passcode={passcode}
              salt={salt}
              onSuccess={onUnlock}
              onError={setError}
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
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 40,
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
});
