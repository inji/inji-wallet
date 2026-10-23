import React, {useEffect} from 'react';
import {BackHandler, ScrollView, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import i18n, {SUPPORTED_LANGUAGES} from '../i18n';
import {RootRouteProps} from '../routes';
import {useWelcomeScreen} from './WelcomeScreenController';
import {changeLanguage, RTL_LANGUAGES} from '../components/LanguageSelector';
import {useBackupRestoreScreen} from './Settings/BackupRestoreController';
import {
  ChoiceList,
  ChoiceRow,
  Glyph,
  Page,
  PageButton,
  PageHeading,
} from '../components/revamp/Page';
import {GlobeIcon} from '../components/revamp/Icons';

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
        <Glyph>{colour => <GlobeIcon color={colour} size={40} />}</Glyph>
        <PageHeading title={t('header')} body={t('description')} />
        <ChoiceList>
          {Object.entries(SUPPORTED_LANGUAGES).map(([value, label]) => (
            <ChoiceRow
              key={value}
              testID={`language-${value}`}
              label={label}
              rtl={RTL_LANGUAGES.includes(value)}
              selected={i18n.language === value}
              onPress={() => changeLanguage(i18n, value)}
            />
          ))}
        </ChoiceList>
      </ScrollView>
    </Page>
  );
};

const styles = StyleSheet.create({
  content: {paddingTop: 40, paddingBottom: 16, gap: 24},
});
