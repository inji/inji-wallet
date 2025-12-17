import React from 'react';
import {useTranslation} from 'react-i18next';
import {Pressable} from 'react-native';
import {Icon, ListItem} from 'react-native-elements';
import {Row, Text} from '../../components/ui';
import {ErrorView} from '../../components/ui/Error';
import {Loader} from '../../components/ui/Loader';
import {Theme} from '../../components/ui/styleUtils';
import {SvgImage} from '../../components/ui/svg';
import {AccountSelectionConfirmation} from '../backupAndRestore/AccountSelectionConfirmation';
import {useBackupAndRestoreSetup} from '../backupAndRestore/BackupAndRestoreSetupController';
import BackupAndRestoreScreen from '../backupAndRestore/BackupAndRestoreScreen';
import testIDProps, {getDriveName} from '../../shared/commonUtil';
import {useOverlayVisibleAfterTimeout} from '../../shared/hooks/useOverlayVisibleAfterTimeout';
import {isAndroid, isIOS} from '../../shared/constants';

export const DataBackupAndRestore: React.FC = () => {
  const controller = useBackupAndRestoreSetup();
  const delay = isAndroid() ? 0 : 1000;
  const {t} = useTranslation('DataBackupScreen');
  const accountSelectionModalVisible = useOverlayVisibleAfterTimeout(
    controller.showAccountSelectionConfirmation,
    delay,
  );
  const isLoaderVisible = useOverlayVisibleAfterTimeout(
    controller.isLoading,
    delay,
  );
  const isSigningInSuccessful = useOverlayVisibleAfterTimeout(
    controller.isSigningInSuccessful,
    delay,
  );
  const isSigningIn = useOverlayVisibleAfterTimeout(
    controller.isSigningIn,
    delay,
  );
  return (
    <React.Fragment>
      <Pressable
        accessible={false}
        {...testIDProps('dataBackupAndRestore')}
        onPress={controller.BACKUP_AND_RESTORE}>
        <ListItem topDivider bottomDivider>
          {SvgImage.backUpAndRestoreIcon(24, 24)}
          <ListItem.Content>
            <ListItem.Title
              accessible={false}
              {...testIDProps('dataBackupAndRestoreText')}>
              <Row>
                <Text
                  testID="dataBackupAndRestoreText"
                  weight="semibold"
                  color={Theme.Colors.settingsLabel}
                  style={{paddingRight: 10, paddingTop: 10}}>
                  {t('dataBackupAndRestore')}
                </Text>
              </Row>
            </ListItem.Title>
          </ListItem.Content>
          <Icon
            name="chevron-right"
            size={21}
            {...testIDProps('dataBackupAndRestoreChevronRight')}
            color={Theme.Colors.chevronRightColor}
            style={{marginRight: 15}}
          />
        </ListItem>
      </Pressable>

      {((controller.isSigningInFailed && !isIOS()) ||
        controller.isCloudSignInFailed) && (
        <ErrorView
          isModal
          alignActionsOnEnd
          showClose={false}
          isVisible={controller.isSigningInFailed}
          title={t('errors.permissionDenied.title')}
          message={t('errors.permissionDenied.message', {
            driveName: getDriveName(),
          })}
          helpText={t('errors.permissionDenied.helpText')}
          image={SvgImage.PermissionDenied()}
          primaryButtonText={
            'DataBackupScreen:errors.permissionDenied.actions.allowAccess'
          }
          primaryButtonEvent={
            isAndroid()
              ? controller.RECONFIGURE_ACCOUNT
              : controller.OPEN_SETTINGS
          }
          textButtonText={
            'DataBackupScreen:errors.permissionDenied.actions.notNow'
          }
          textButtonEvent={controller.GO_BACK}
          onDismiss={controller.GO_BACK}
          primaryButtonTestID="allowAccess"
          textButtonTestID="notNow"
          customImageStyles={{paddingBottom: 0, marginBottom: -6}}
          customStyles={{marginTop: '20%'}}
          testID="CloudBackupConsentDenied"
        />
      )}

      {controller.isNetworkError && (
        <ErrorView
          testID="networkOffError"
          primaryButtonTestID="tryAgain"
          primaryButtonText="tryAgain"
          primaryButtonEvent={controller.TRY_AGAIN}
          isVisible={controller.isNetworkError}
          isModal={true}
          showClose
          title={t('errors.noInternetConnection.title')}
          message={t('errors.noInternetConnection.message')}
          onDismiss={controller.DISMISS}
          image={SvgImage.NoInternetConnection()}
        />
      )}

      {(isSigningIn || isSigningInSuccessful) &&
        !controller.isCloudSignInFailed && (
          <BackupAndRestoreScreen
            profileInfo={controller.profileInfo}
            onBackPress={controller.GO_BACK}
            isSigningIn={controller.isSigningIn}
            shouldTriggerAutoBackup={controller.shouldTriggerAutoBackup}
          />
        )}
      {isLoaderVisible && <Loader title={t('loadingSubtitle')} isModal />}

      <AccountSelectionConfirmation
        isVisible={accountSelectionModalVisible}
        onProceed={controller.PROCEED_ACCOUNT_SELECTION}
        goBack={controller.GO_BACK}
      />
    </React.Fragment>
  );
};
