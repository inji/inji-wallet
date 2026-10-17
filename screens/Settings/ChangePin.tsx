import React, {useContext, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {useSelector} from '@xstate/react';
import {Modal} from '../../components/ui/Modal';
import {MAX_PIN, PasscodeVerify} from '../../components/PasscodeVerify';
import {PinInput} from '../../components/PinInput';
import {ScaledText} from '../../components/revamp/ScaledText';
import {fonts} from '../../components/revamp/tokens';
import {useRevampTheme} from '../../components/revamp/useRevampTheme';
import {GlobalContext} from '../../shared/GlobalContext';
import {
  AuthEvents,
  selectPasscode,
  selectPasscodeSalt,
} from '../../machines/auth';
import {hashData} from '../../shared/commonUtil';
import {argon2iConfig} from '../../shared/constants';

type Step = 'current' | 'new' | 'confirm';

/** Confirm the current PIN, then enter the new one twice. */
export const ChangePin: React.FC<{
  isVisible: boolean;
  onDone: (changed: boolean) => void;
}> = ({isVisible, onDone}) => {
  const {t} = useTranslation('SettingScreen');
  const {c} = useRevampTheme();
  const {appService} = useContext(GlobalContext);
  const authService = appService.children.get('auth')!;
  const storedPasscode = useSelector(authService, selectPasscode);
  const salt = useSelector(authService, selectPasscodeSalt);
  const [step, setStep] = useState<Step>('current');
  const [newPasscode, setNewPasscode] = useState('');
  const [error, setError] = useState('');
  // Remounts the new-PIN boxes, which clears them.
  const [attempt, setAttempt] = useState(0);
  // The PIN boxes focus themselves when they mount, so they mount once the page is up and the
  // keyboard opens with it.
  const [shown, setShown] = useState(false);

  const close = (changed: boolean) => {
    setStep('current');
    setNewPasscode('');
    setError('');
    setShown(false);
    onDone(changed);
  };

  const prompt =
    step === 'current'
      ? t('enterCurrentPin')
      : step === 'new'
      ? t('enterNewPin')
      : t('confirmNewPin');

  return (
    <Modal
      testID="changePin"
      isVisible={isVisible}
      headerTitle={t('changePin')}
      arrowLeft={true}
      onShow={() => setShown(true)}
      onDismiss={() => close(false)}>
      <View style={styles.body}>
        <ScaledText style={[styles.prompt, {color: c.ink}]}>
          {prompt}
        </ScaledText>
        {shown && step === 'current' && (
          <PasscodeVerify
            key="current"
            testID="currentPin"
            passcode={storedPasscode}
            salt={salt}
            onSuccess={() => {
              setError('');
              setStep('new');
            }}
            onError={setError}
          />
        )}
        {shown && step === 'new' && (
          <PinInput
            key={'new' + attempt}
            testID="newPin"
            length={MAX_PIN}
            autosubmit={true}
            onDone={async (value: string) => {
              try {
                const hashed = await hashData(value, salt, argon2iConfig);
                if (hashed === storedPasscode) {
                  setError(t('samePin'));
                  setAttempt(a => a + 1);
                  return;
                }
                setNewPasscode(hashed);
                setError('');
                setStep('confirm');
              } catch (e) {
                console.error('Hashing the new PIN failed', e);
                setError(t('pinChangeFailed'));
              }
            }}
          />
        )}
        {shown && step === 'confirm' && (
          <PasscodeVerify
            key="confirm"
            testID="confirmNewPin"
            passcode={newPasscode}
            salt={salt}
            onSuccess={() => {
              authService.send(AuthEvents.CHANGE_PASSCODE(newPasscode));
              close(true);
            }}
            onError={() => {
              // Back to the new PIN, so a typo in either entry can be fixed.
              setNewPasscode('');
              setError(t('pinsDontMatch'));
              setStep('new');
            }}
          />
        )}
        {error ? (
          <ScaledText style={[styles.error, {color: c.fail}]}>
            {error}
          </ScaledText>
        ) : null}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  body: {paddingHorizontal: 24, paddingTop: 48, gap: 32, alignItems: 'center'},
  prompt: {
    fontFamily: fonts.medium,
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
  },
  error: {fontFamily: fonts.regular, fontSize: 14, textAlign: 'center'},
});
