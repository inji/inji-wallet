import React from 'react';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {BannerNotification, BannerStatusType} from './BannerNotification';
import {UseBannerNotification} from './BannerNotificationController';

export interface DeeplinkBannerProps {
  absolute?: boolean;
}

export const DeeplinkBanner: React.FC<DeeplinkBannerProps> = ({
  absolute = false,
}) => {
  const controller = UseBannerNotification();
  const {t} = useTranslation('BannerNotification');

  const content = controller.isCredentialOfferDroppedDueToBusyState ? (
    <BannerNotification
      type={BannerStatusType.IN_PROGRESS}
      message={t('MyVcsTab:credentialOfferBusy')}
      onClosePress={controller.RESET_CREDENTIAL_OFFER_DROPPED_DUE_TO_BUSY_STATE}
      testId="credentialOfferBusyPopup"
    />
  ) : null;

  if (!absolute) {
    return content;
  }

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        elevation: 1000,
      }}
      pointerEvents="box-none">
      {content}
    </View>
  );
};
