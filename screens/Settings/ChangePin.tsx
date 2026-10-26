import React, {useContext, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, StyleSheet, View} from 'react-native';
import {useSelector} from '@xstate/react';
import {MAX_PIN} from '../../components/PasscodeVerify';
import {PinInput} from '../../components/PinInput';
import {
  FieldError,
  Page,
  PageHeader,
  PageHeading,
  PageModal,
  StepDots,
} from '../../components/revamp/Page';
import {GlobalContext} from '../../shared/GlobalContext';
import {
  AuthEvents,
  selectPasscode,
  selectPasscodeSalt,
} from '../../machines/auth';
import {hashData} from '../../shared/commonUtil';
import {argon2iConfig} from '../../shared/constants';

const STEPS = ['current', 'new', 'confirm'] as const;
type Step = (typeof STEPS)[number];

/** Confirm the current PIN, then enter the new one twice. */
export const ChangePin: React.FC<{
  isVisible: boolean;
  onDone: (changed: boolean) => void;
}> = ({isVisible, onDone}) => {
  const {t} = useTranslation('SettingScreen');
  const {appService} = useContext(GlobalContext);
  const authService = appService.children.get('auth')!;
  const storedPasscode = useSelector(authService, selectPasscode);
  const salt = useSelector(authService, selectPasscodeSalt);
  const [step, setStep] = useState<Step>('current');
  const [newPasscode, setNewPasscode] = useState('');
  const [error, setError] = useState('');
  // One set of boxes serves every step; bumping this empties them without closing the keyboard.
  const [clearKey, setClearKey] = useState(0);
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

  const goTo = (next: Step, message = '') => {
    setStep(next);
    setError(message);
    setClearKey(k => k + 1);
  };

  const onEntered = async (value: string) => {
    let hashed: string;
    try {
      hashed = await hashData(value, salt, argon2iConfig);
    } catch (e) {
      console.error('Hashing the PIN failed', e);
      goTo(step, t('pinChangeFailed'));
      return;
    }
    if (step === 'current') {
      hashed === storedPasscode
        ? goTo('new')
        : goTo('current', t('wrongCurrentPin'));
    } else if (step === 'new') {
      if (hashed === storedPasscode) {
        goTo('new', t('samePin'));
      } else {
        setNewPasscode(hashed);
        goTo('confirm');
      }
    } else if (hashed === newPasscode) {
      authService.send(AuthEvents.CHANGE_PASSCODE(newPasscode));
      close(true);
    } else {
      // Back to the new PIN, so a typo in either entry can be fixed.
      setNewPasscode('');
      goTo('new', t('pinsDontMatch'));
    }
  };

  const title =
    step === 'current'
      ? t('enterCurrentPin')
      : step === 'new'
      ? t('enterNewPin')
      : t('confirmNewPin');

  return (
    <PageModal
      visible={isVisible}
      onShow={() => setShown(true)}
      onRequestClose={() => close(false)}>
      <Page
        testID="changePin"
        header={
          <PageHeader title={t('changePin')} onBack={() => close(false)} />
        }>
        <ScrollView
          keyboardShouldPersistTaps="always"
          contentContainerStyle={styles.content}>
          <StepDots current={STEPS.indexOf(step)} count={STEPS.length} />
          <PageHeading testID="changePinTitle" size="medium" title={title} />
          <View style={styles.pins}>
            {shown && (
              <PinInput
                testID={
                  step === 'current'
                    ? 'currentPin'
                    : step === 'new'
                    ? 'newPin'
                    : 'confirmNewPin'
                }
                length={MAX_PIN}
                autosubmit={true}
                clearKey={clearKey}
                onDone={onEntered}
              />
            )}
          </View>
          <FieldError testID="changePinError" message={error} />
        </ScrollView>
      </Page>
    </PageModal>
  );
};

const styles = StyleSheet.create({
  content: {paddingTop: 20, paddingBottom: 24, gap: 18},
  pins: {marginTop: 18, alignSelf: 'stretch', alignItems: 'center'},
});
