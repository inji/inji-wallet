import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, View} from 'react-native';
import {AccountInformation} from '../../components/AccountInformation';
import {SectionLayout} from '../../components/SectionLayout';
import {Button, Centered, Column, Row, Text} from '../../components/ui';
import {LoaderAnimation} from '../../components/ui/LoaderAnimation';
import {Modal} from '../../components/ui/Modal';
import {Timestamp} from '../../components/ui/Timestamp';
import {Theme} from '../../components/ui/styleUtils';
import {SvgImage} from '../../components/ui/svg';
import {ProfileInfo} from '../../shared/CloudBackupAndRestoreUtils';
import {useBackupScreen} from './BackupController';
import {BannerNotificationContainer} from '../../components/BannerNotificationContainer';
import {useBackupRestoreScreen} from '../Settings/BackupRestoreController';
import {getAccountType, getDriveName} from '../../shared/commonUtil';
import {HelpScreen} from '../../components/HelpScreen';
import {isIOS} from '../../shared/constants';
import {HelpIcon} from '../../components/ui/HelpIcon';

const BackupAndRestoreScreen: React.FC<BackupAndRestoreProps> = props => {
  const backupController = useBackupScreen();
  const restoreController = useBackupRestoreScreen();

  const {t} = useTranslation('BackupAndRestore');

  useEffect(() => {
    if (!props.isSigningIn) {
      backupController.LAST_BACKUP_DETAILS();
    }
  }, [props.isSigningIn]);

  useEffect(() => {
    if (
      !props.isSigningIn &&
      !backupController.isLoadingBackupDetails &&
      props.shouldTriggerAutoBackup
    ) {
      backupController.DATA_BACKUP(props.shouldTriggerAutoBackup);
    }
  }, [
    props.isSigningIn,
    backupController.isLoadingBackupDetails,
    props.shouldTriggerAutoBackup,
  ]);

  function handleRestore() {
    !backupController.isBackupInProgress && restoreController.BACKUP_RESTORE();
  }

  function handleBackup() {
    !restoreController.isBackUpRestoring && backupController.DATA_BACKUP(false);
  }

  const Loading = testID => (
    <Centered fill>
      <LoaderAnimation testID={testID} showLogo={false} />
    </Centered>
  );

  function LastBackupDetails(): React.ReactNode {
    return (
      <View>
        {backupController.lastBackupDetails && (
          <Row>
            <Column>{SvgImage.backUpAndRestoreIcon(34, 24)}</Column>
            <Column margin={'0 0 0 9'} align="center">
              <Timestamp
                testId="lastBackup"
                time={backupController.lastBackupDetails.backupCreationTime}
              />
              <Text
                testID="lastBackupSize"
                style={{
                  fontFamily: 'helvetica-neue-regular',
                  fontWeight: 'normal',
                  fontSize: 12,
                  color: '#707070',
                  lineHeight: 14,
                }}>
                {t('size')}
                {backupController.lastBackupDetails.backupFileSize}MB
              </Text>
            </Column>
          </Row>
        )}
      </View>
    );
  }

  const LastBackupSection = (
    <SectionLayout
      testId="LastBackupSection"
      headerText={
        backupController.isBackupInProgress
          ? t('backupProgressState')
          : t('lastBackupDetails')
      }
      headerIcon={SvgImage.backUpAndRestoreIcon(34, 24)}>
      <Row>
        <View style={{marginBottom: 19}}>
          {backupController.isBackupInProgress ? (
            <Text
              testID="backupInProgress"
              style={Theme.BackupAndRestoreStyles.backupProgressText}>
              {t('backupInProgress')}
            </Text>
          ) : backupController.lastBackupDetails ? (
            LastBackupDetails()
          ) : (
            <Text
              testID="noBackup"
              style={Theme.BackupAndRestoreStyles.backupProgressText}>
              {t('noBackup', {driveName: getDriveName()})}
            </Text>
          )}
        </View>
      </Row>
      <Row style={Theme.BackupAndRestoreStyles.actionOrLoaderContainer}>
        {backupController.isBackupInProgress ? (
          Loading('backup')
        ) : (
          <Button
            testID="backup"
            type="gradient"
            title={t('backup')}
            disabled={restoreController.isBackUpRestoring}
            onPress={handleBackup}
            styles={{flex: 1}}
          />
        )}
      </Row>
    </SectionLayout>
  );

  const AccountSection = (
    <SectionLayout
      testId="AccountSection"
      headerText={isIOS() ? t('') : t('driveSettings')}
      headerIcon={
        isIOS()
          ? SvgImage.ICloudIcon(86, 25)
          : SvgImage.GoogleDriveIconSmall(28, 25)
      }>
      <View style={{marginBottom: 19}}>
        <Text
          testID="storageInfo"
          style={Theme.BackupAndRestoreStyles.backupProgressText}>
          {t('storage', {
            driveName: getDriveName(),
            accountType: getAccountType(),
          })}
        </Text>
      </View>
      <AccountInformation
        email={props.profileInfo?.email}
        picture={props.profileInfo?.picture}
      />
    </SectionLayout>
  );

  const RestoreSection = (
    <SectionLayout
      testId="restoreSection"
      headerText={t('restore')}
      headerIcon={SvgImage.restoreIcon()}
      marginBottom={16}>
      <Row>
        <View style={{marginBottom: 19}}>
          <Text
            style={Theme.BackupAndRestoreStyles.backupProgressText}
            testID={
              restoreController.isBackUpRestoring
                ? 'restoreInProgress'
                : 'restoreInfo'
            }>
            {restoreController.isBackUpRestoring
              ? t('restoreInProgress')
              : t('restoreInfo', {driveName: getDriveName()})}
          </Text>
        </View>
      </Row>
      <Row style={Theme.BackupAndRestoreStyles.actionOrLoaderContainer}>
        {restoreController.isBackUpRestoring ? (
          Loading('restore')
        ) : (
          <Button
            testID="restore"
            type="outline"
            title={t('restore')}
            disabled={backupController.isBackupInProgress}
            onPress={handleRestore}
            styles={{...Theme.MessageOverlayStyles.button, marginTop: 10}}
          />
        )}
      </Row>
    </SectionLayout>
  );

  return (
    <Modal
      isVisible
      headerTitle={t('title')}
      testID="backupAndRestore"
      headerElevation={2}
      arrowLeft={true}
      headerRight={
        <HelpScreen source={'BackUp'} triggerComponent={HelpIcon()} />
      }
      onDismiss={props.onBackPress}>
      <View
        style={{
          backgroundColor: Theme.Colors.lightGreyBackgroundColor,
          flex: 1,
          position: "relative"
        }}>
        <BannerNotificationContainer />
        {props.isSigningIn || backupController.isLoadingBackupDetails ? (
          <Column fill align="center" crossAlign="center">
            <LoaderAnimation testID="backupAndRestoreScreen" />
          </Column>
        ) : (
          <ScrollView>
            {LastBackupSection}
            {AccountSection}
            {RestoreSection}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

export default BackupAndRestoreScreen;

interface BackupAndRestoreProps {
  profileInfo: ProfileInfo | undefined;
  isSigningIn: boolean;
  onBackPress: () => void;
  shouldTriggerAutoBackup: boolean;
}
