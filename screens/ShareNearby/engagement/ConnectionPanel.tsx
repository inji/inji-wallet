import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Text} from '../../../components/ui';
import Lock from '../../../assets/shareNearby/lock.svg';
import Clock from '../../../assets/shareNearby/clock.svg';
import Tick from '../../../assets/shareNearby/check.svg';
import {useCountdown} from '../useCountdown';

const styles = Theme.ShareNearbyStyles;
const engagementStyles = Theme.ShareNearbyEngagementStyles;

export function ConnectionPanel({
  isConnected,
  sessionExpiresAt,
}: {
  isConnected: boolean;
  sessionExpiresAt?: number;
}) {
  const {t} = useTranslation('ShareNearby');
  const countdown = useCountdown(sessionExpiresAt);
  const nextSteps = t('engagement.next', {
    returnObjects: true,
    defaultValue: [],
  }) as string[];
  return (
    <View style={engagementStyles.panel}>
      {isConnected ? (
        <>
          <Text weight="semibold" style={engagementStyles.panelTitle}>
            {t('engagement.nextTitle')}
          </Text>
          {Array.isArray(nextSteps) &&
            nextSteps.map(step => (
              <View key={step} style={engagementStyles.panelRow}>
                <Tick color={Theme.ShareNearbyColors.detailTick} />
                <Text style={[styles.flexible, engagementStyles.panelText]}>
                  {step}
                </Text>
              </View>
            ))}
        </>
      ) : (
        <View style={engagementStyles.panelRow}>
          <Lock />
          <Text style={[styles.flexible, engagementStyles.panelText]}>
            {t('engagement.private')}
          </Text>
        </View>
      )}
      {isConnected && sessionExpiresAt !== undefined && (
        <>
          <View style={engagementStyles.panelDivider} />
          <View style={engagementStyles.panelRow} testID="mdocSessionCountdown">
            <Clock />
            <Text weight="semibold" style={engagementStyles.panelTitle}>
              {t('engagement.sessionEnds', {time: countdown.formattedTime})}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}
