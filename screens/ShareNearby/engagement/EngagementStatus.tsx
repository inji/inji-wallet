import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Text} from '../../../components/ui';
import Clock from '../../../assets/shareNearby/clock.svg';
import Bluetooth from '../../../assets/shareNearby/bluetooth.svg';
import Lock from '../../../assets/shareNearby/lock.svg';
import type {EngagementStage, EngagementCountdown} from './types';

const styles = Theme.ShareNearbyStyles;
const engagementStyles = Theme.ShareNearbyEngagementStyles;

export function EngagementStatus({
  stage,
  expiresAt,
  countdown,
}: {
  stage: EngagementStage;
  expiresAt?: number;
  countdown: EngagementCountdown;
}) {
  const {t} = useTranslation('ShareNearby');
  const isShowingQrCode = stage === 'showingCode';

  return (
    <>
      <View style={styles.row}>
        <View style={engagementStyles.waitDot} />
        <Text weight="semibold" style={styles.body}>
          {t(`engagement.${stage}.status`)}
        </Text>
      </View>
      {isShowingQrCode && expiresAt !== undefined && (
        <View style={engagementStyles.metadata}>
          <View style={styles.row}>
            <Clock />
            <Text style={styles.small}>
              {t(
                countdown.remainingSeconds
                  ? 'engagement.expires'
                  : 'engagement.expiring',
                {time: countdown.formattedTime},
              )}
            </Text>
          </View>
          <View style={styles.row}>
            <Bluetooth />
            <Text style={styles.small}>{t('engagement.bluetooth')}</Text>
          </View>
        </View>
      )}
      <View style={styles.row}>
        <Lock />
        <Text style={[styles.small, styles.centeredText]}>
          {t('engagement.private')}
        </Text>
      </View>
    </>
  );
}
