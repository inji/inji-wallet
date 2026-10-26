import React, {useEffect} from 'react';
import {BackHandler, ScrollView, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import i18n, {SUPPORTED_LANGUAGES} from '../i18n';
import {RootRouteProps} from '../routes';
import {useWelcomeScreen} from './WelcomeScreenController';
import {changeLanguage} from '../components/LanguageSelector';
import {useBackupRestoreScreen} from './Settings/BackupRestoreController';
import {
  ChoiceCards,
  ChoiceRow,
  Page,
  PageButton,
  PageHeading,
} from '../components/revamp/Page';

export const SetupLanguageScreen: React.FC<RootRouteProps> = props => {
  const {t} = useTranslation('SetupLanguage');
  const controller = useWelcomeScreen(props);
  const backupRestoreController = useBackupRestoreScreen();

  useEffect(() => {
    backupRestoreController.DOWNLOAD_UNSYNCED_BACKUP_FILES();
  }, []);

  // After Save, the auth machine generates the passcode salt and moves to setting up; the
  // unlock method screen opens only then, so the salt always exists before a passcode is set.
  useEffect(() => {
    if (controller.isSettingUp) {
      props.navigation.navigate('Auth');
    }
  }, [controller.isSettingUp]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        BackHandler.exitApp();
        return true;
      },
    );
    return () => backHandler.remove();
  }, []);

  return (
    <Page
      testID="chooseLanguage"
      footer={
        <PageButton
          testID="savePreference"
          title={t('continue')}
          onPress={controller.SELECT}
        />
      }>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <PageHeading align="left" title={t('header')} body={t('description')} />
        <ChoiceCards>
          {Object.entries(SUPPORTED_LANGUAGES).map(([value, label]) => (
            <ChoiceRow
              key={value}
              testID={`language-${value}`}
              card
              label={label}
              hint={
                ENGLISH_NAMES[value] !== label
                  ? ENGLISH_NAMES[value]
                  : undefined
              }
              selected={i18n.language === value}
              onPress={() => changeLanguage(i18n, value)}
            />
          ))}
        </ChoiceCards>
      </ScrollView>
    </Page>
  );
};

// Shown under each native name so every option can be read in English too.
const ENGLISH_NAMES: Record<string, string> = {
  en: 'English',
  fil: 'Filipino',
  ar: 'Arabic',
  hi: 'Hindi',
  kn: 'Kannada',
  ta: 'Tamil',
};

const styles = StyleSheet.create({
  content: {paddingTop: 40, paddingBottom: 16, gap: 24},
});
