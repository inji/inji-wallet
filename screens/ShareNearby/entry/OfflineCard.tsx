import React from 'react';
import {View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Theme} from '../../../components/ui/styleUtils';
import {useTranslation} from 'react-i18next';
import {Text} from '../../../components/ui';
import Offline from '../../../assets/shareNearby/offline.svg';

const styles = Theme.ShareNearbyStyles;
const entryStyles = Theme.ShareNearbyEntryStyles;

export function OfflineCard() {
  const {t} = useTranslation('ShareNearby');
  return (
    <View style={[styles.card, entryStyles.offline]}>
      <LinearGradient
        colors={Theme.Colors.GradientColorsLight}
        start={Theme.LinearGradientDirection.start}
        end={Theme.LinearGradientDirection.end}
        style={entryStyles.offlineIcon}>
        <Offline />
      </LinearGradient>
      <View style={styles.flexible}>
        <Text weight="semibold" style={entryStyles.label}>
          {t('entry.offlineTitle')}
        </Text>
        <Text style={styles.small}>{t('entry.offlineDescription')}</Text>
      </View>
    </View>
  );
}
