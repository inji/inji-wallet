import React, {useEffect} from 'react';
import i18n, {SUPPORTED_LANGUAGES} from '../i18n';
import {useTranslation} from 'react-i18next';
import {SetupPicker} from '../components/ui/SetupPicker';
import {Button, Column, Text} from '../components/ui';
import {Theme} from '../components/ui/styleUtils';
import {RootRouteProps} from '../routes';
import {useWelcomeScreen} from './WelcomeScreenController';
import {changeLanguage} from '../components/LanguageSelector';
import {BackHandler, Dimensions} from 'react-native';
import {useBackupRestoreScreen} from './Settings/BackupRestoreController';
import {SvgImage} from '../components/ui/svg';

export const SetupLanguageScreen: React.FC<RootRouteProps> = props => {
  const {t} = useTranslation('SetupLanguage');
  const controller = useWelcomeScreen(props);
  const backupRestoreController = useBackupRestoreScreen();
  const languages = Object.entries(SUPPORTED_LANGUAGES).map(
    ([value, label]) => ({label, value}),
  );

  useEffect(() => {
    backupRestoreController.DOWNLOAD_UNSYNCED_BACKUP_FILES();
  }, []);

  useEffect(() => {
    const backAction = () => {
      BackHandler.exitApp();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  return (
    <Column style={Theme.SetupLanguageScreenStyle.columnStyle}>
      {SvgImage.settingsLanguageIcon(58)}
      <Column crossAlign="center" width={Dimensions.get('window').width * 0.8}>
        <Text
          testID="chooseLanguage"
          style={{paddingTop: 3}}
          margin="10 0 10 0"
          size="large"
          weight="semibold">
          {t('header')}
        </Text>
        <Text
          weight="semibold"
          style={{paddingTop: 3}}
          align="center"
          size="mediumSmall"
          color={Theme.Colors.GrayText}>
          {t('description')}
        </Text>
      </Column>

      <SetupPicker
        testID="languagePicker"
        items={languages}
        selectedValue={i18n.language}
        onValueChange={language => changeLanguage(i18n, language)}
      />

      <Button
        testID="savePreference"
        type="gradient"
        title={t('save')}
        onPress={() => {
          controller.SELECT(), controller.unlockPage;
        }}
      />
    </Column>
  );
};
