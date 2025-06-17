import React from 'react';
import {View} from 'react-native';
import {
  BannerNotification,
  BannerStatus,
  BannerStatusType,
} from './BannerNotification';
import {BackupAndRestoreBannerNotification} from './BackupAndRestoreBannerNotification';
import {UseBannerNotification} from './BannerNotificationController';
import {useTranslation} from 'react-i18next';
import {useScanScreen} from '../screens/Scan/ScanScreenController';
import {Theme} from './ui/styleUtils';
import {useSettingsScreen} from '../screens/Settings/SettingScreenController';

export const BannerNotificationContainer: React.FC<
  BannerNotificationContainerProps
> = props => {
  const {showVerificationStatusBanner = true} = props;
  const scanScreenController = useScanScreen();
  const settingsScreenController = useSettingsScreen(props);
  const showQuickShareSuccessBanner =
    scanScreenController.showQuickShareSuccessBanner;

  const bannerNotificationController = UseBannerNotification();
  const WalletBindingSuccess = bannerNotificationController.isBindingSuccess;
  const {t} = useTranslation('BannerNotification');
  const rt = useTranslation('RequestScreen').t;
  const verificationStatus = bannerNotificationController.verificationStatus;

  return (
    <>
      <BackupAndRestoreBannerNotification />

      {settingsScreenController.isKeyOrderSet === true && (
        <View style={Theme.BannerStyles.topBanner}>
          <BannerNotification
            type={BannerStatusType.SUCCESS}
            message={t('keyPreferenceSuccess')}
            onClosePress={settingsScreenController.RESET_KEY_ORDER_RESPONSE}
            key={'keyOrderingSuccess'}
            testId={'keyOrderingSuccess'}
          />
        </View>
      )}

      {settingsScreenController.isKeyOrderSet === false && (
        <View style={Theme.BannerStyles.topBanner}>
          <BannerNotification
            type={BannerStatusType.ERROR}
            message={t('keyPreferenceError')}
            onClosePress={settingsScreenController.RESET_KEY_ORDER_RESPONSE}
            key={'keyOrderingError'}
            testId={'keyOrderingError'}
          />
        </View>
      )}

      {WalletBindingSuccess && (
        <View style={Theme.BannerStyles.topBanner}>
          <BannerNotification
            type={BannerStatusType.SUCCESS}
            message={t('activated')}
            onClosePress={
              bannerNotificationController.RESET_WALLET_BINDING_SUCCESS
            }
            key={'activatedVcPopup'}
            testId={'activatedVcPopup'}
          />
        </View>
      )}

      {showQuickShareSuccessBanner && (
        <View style={Theme.BannerStyles.topBanner}>
          <BannerNotification
            type={BannerStatusType.SUCCESS}
            message={rt('status.accepted.message')}
            onClosePress={scanScreenController.DISMISS_QUICK_SHARE_BANNER}
            key={'quickShareSuccessBanner'}
            testId={'quickShareSuccessBanner'}
          />
        </View>
      )}

      {bannerNotificationController.isPasscodeUnlock && (
        <BannerNotification
          type={BannerStatusType.SUCCESS}
          message={t('alternatePasscodeSuccess')}
          onClosePress={bannerNotificationController.DISMISS}
          testId={'alternatePasscodeSuccess'}
          key={'updatePassword'}
        />
      )}

      {bannerNotificationController.isBiometricUnlock && (
        <BannerNotification
          type={BannerStatusType.SUCCESS}
          message={t('alternateBiometricSuccess')}
          onClosePress={bannerNotificationController.DISMISS}
          testId={'alternateBiometricSuccess'}
          key={'updateBiometric'}
        />
      )}

      {verificationStatus !== null && showVerificationStatusBanner && (
        <BannerNotification
          type={verificationStatus.statusType}
          message={t(`VcVerificationBanner:${verificationStatus?.statusType}`, {
            vcDetails: `${verificationStatus.vcType} ${verificationStatus.vcNumber}`,
          })}
          onClosePress={bannerNotificationController.RESET_VERIFICATION_STATUS}
          key={'reVerificationInProgress'}
          testId={'reVerificationInProgress'}
        />
      )}

      {bannerNotificationController.isDownloadingFailed && (
        <BannerNotification
          type={BannerStatusType.ERROR}
          message={t('MyVcsTab:downloadingVcFailed')}
          onClosePress={bannerNotificationController.RESET_DOWNLOADING_FAILED}
          key={'downloadingVcFailedPopup'}
          testId={'downloadingVcFailedPopup'}
        />
      )}
      {bannerNotificationController.isDownloadingSuccess && (
        <BannerNotification
          type={BannerStatusType.SUCCESS}
          message={t('MyVcsTab:downloadingVcSuccess')}
          onClosePress={bannerNotificationController.RESET_DOWNLOADING_SUCCESS}
          key={'downloadingVcSuccessPopup'}
          testId={'downloadingVcSuccessPopup'}
        />
      )}
    </>
  );
};

export type vcVerificationBannerDetails = {
  statusType: BannerStatus;
  vcType: string;
};

export interface BannerNotificationContainerProps {
  showVerificationStatusBanner?: boolean;
}
