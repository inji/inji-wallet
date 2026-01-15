import React from 'react';
import {ScrollView, TouchableOpacity, View} from 'react-native';
import {AccountInformation} from '../../components/AccountInformation';
import {SectionLayout} from '../../components/SectionLayout';
import {Button, Column, Row, Text} from '../../components/ui';
import {Theme} from '../../components/ui/styleUtils';
import {SvgImage} from '../../components/ui/svg';
import {BackButton} from '../../components/ui/backButton/BackButton';
import {HelpScreen} from '../../components/HelpScreen';
import LinearGradient from 'react-native-linear-gradient';
import {useTranslation} from 'react-i18next';
import {GMAIL, GOOGLE_DRIVE_NAME} from '../../shared/constants';
import {Icon} from 'react-native-elements';

const StaticBackupAndRestoreScreen: React.FC = () => {
  const {t} = useTranslation('BackupAndRestore');
  const lastBackupDetails = {
    backupCreationTime: '20 January 2021, 10:00 AM',
    backupFileSize: '15.4',
  };

  const profileInfo = {
    email: 'user@example.com',
    picture: null,
  };

  return (
    <View style={Theme.IntroSliderStyles.backupRestoreIntroOuterView}>
      <View style={Theme.IntroSliderStyles.introScreenNotch}></View>
      <View style={Theme.IntroSliderStyles.backupRestoreIntroScaleStyle}>
        <View style={Theme.IntroSliderStyles.backupRestoreIntroView}>
          <TouchableOpacity onPress={() => {}}>
            <BackButton onPress={() => {}} />
          </TouchableOpacity>
          <Text
            weight="bold"
            style={{
              fontSize: 16,
              color: Theme.Colors.blackIcon,
              paddingTop: 5,
              maxWidth: 185,
            }}
            testID="screenTitle">
            {t('title')}
          </Text>
          <TouchableOpacity onPress={() => {}}>
            <HelpScreen
              source={'Inji'}
              isDisabled={true}
              triggerComponent={
                <LinearGradient
                  style={{borderRadius: 8}}
                  colors={Theme.Colors.GradientColorsLight}
                  start={Theme.LinearGradientDirection.start}
                  end={Theme.LinearGradientDirection.end}>
                  <View testID="help" style={Theme.HelpScreenStyle.viewStyle}>
                    <Row
                      crossAlign="center"
                      style={Theme.HelpScreenStyle.rowStyle}>
                      <Icon
                        name="help"
                        type="material-community"
                        size={20}
                        color={Theme.Colors.Icon}
                        containerStyle={{paddingHorizontal: 1}}
                      />
                    </Row>
                  </View>
                </LinearGradient>
              }
            />
          </TouchableOpacity>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 16}}>
          <SectionLayout
            testId="LastBackupSection"
            headerText={t('lastBackupDetails')}
            headerIcon={SvgImage.backUpAndRestoreIcon(34, 24)}>
            <Row>
              <Column>{SvgImage.backUpAndRestoreIcon(34, 24)}</Column>
              <Column margin="0 0 0 9">
                <Text testID="backupCreationTime">
                  {lastBackupDetails.backupCreationTime}
                </Text>
                <Text color="grey" testID="backupFileSize">
                  {t('size')} {lastBackupDetails.backupFileSize} MB
                </Text>
              </Column>
            </Row>
            <Row style={{marginTop: 16}}>
              <Button title={t('backup')} type="gradient" onPress={() => {}} />
            </Row>
          </SectionLayout>
          <SectionLayout
            testId="AccountSection"
            headerText={t('driveSettings')}
            headerIcon={SvgImage.GoogleDriveIconSmall(28, 25)}>
            <View style={{marginBottom: 19}}>
              <Text
                testID="storageInfoText"
                style={Theme.BackupAndRestoreStyles.backupProgressText}>
                {t('storage', {
                  driveName: GOOGLE_DRIVE_NAME,
                  accountType: GMAIL,
                })}
              </Text>
            </View>
            <AccountInformation email={profileInfo.email} picture={undefined} />
          </SectionLayout>
          <SectionLayout
            testId="RestoreSection"
            headerText={t('restore')}
            headerIcon={SvgImage.restoreIcon()}>
            <Row>
              <View style={{marginBottom: 19}}>
                <Text
                  style={Theme.BackupAndRestoreStyles.backupProgressText}
                  testID="restoreInfoText">
                  {t('restoreInfo', {driveName: GMAIL})}
                </Text>
                <Row style={{marginTop: 16}}>
                  <Button
                    title={t('restore')}
                    type="outline"
                    onPress={() => {}}
                  />
                </Row>
              </View>
            </Row>
          </SectionLayout>
          {/* height increased to enable force scroll */}
          <View style={{height: 200}}></View>
        </ScrollView>
      </View>
    </View>
  );
};

export default StaticBackupAndRestoreScreen;
