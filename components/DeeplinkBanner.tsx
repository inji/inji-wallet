import React from 'react';
import {View} from 'react-native';
import {BannerNotification, BannerStatusType} from './BannerNotification';
import {UseBannerNotification} from './BannerNotificationController';
import {useTranslation} from 'react-i18next';

export interface DeeplinkBannerProps {
  absolute?: boolean;
}

export const DeeplinkBanner: React.FC<DeeplinkBannerProps> = ({
  absolute = false,
}) => {
  const bannerNotificationController = UseBannerNotification();
  const {t} = useTranslation('BannerNotification');

  const content = (
    <>
      {bannerNotificationController.isCredentialOfferDroppedDueToBusyState && (
        <BannerNotification
          type={BannerStatusType.IN_PROGRESS}
          message={t('MyVcsTab:credentialOfferBusy')}
          onClosePress={
            bannerNotificationController.RESET_CREDENTIAL_OFFER_DROPPED_DUE_TO_BUSY_STATE
          }
          key={'credentialOfferBusyPopup'}
          testId={'credentialOfferBusyPopup'}
        />
      )}
    </>
  );

  if (absolute) {
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
  }

  return content;
};
