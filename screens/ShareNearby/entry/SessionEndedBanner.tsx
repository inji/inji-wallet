import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {Pressable, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Text} from '../../../components/ui';
import Info from '../../../assets/Info.svg';
import Close from '../../../assets/shareNearby/close.svg';

const styles = Theme.ShareNearbyStyles;
const entryStyles = Theme.ShareNearbyEntryStyles;

export function SessionEndedBanner({onDismiss}: {onDismiss: () => void}) {
  const {t} = useTranslation('ShareNearby');
  return (
    <View
      accessibilityRole="alert"
      style={entryStyles.banner}
      testID="mdocSessionEndedBanner">
      <Info
        width={16}
        height={16}
        color1={Theme.ShareNearbyColors.secondary}
        color2={Theme.ShareNearbyColors.secondary}
      />
      <Text style={[styles.flexible, entryStyles.bannerText]}>
        {t('entry.sessionEnded')}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('close')}
        onPress={onDismiss}
        style={({pressed}) => [
          entryStyles.bannerClose,
          pressed && styles.pressed,
        ]}>
        <Close width={14} height={14} />
      </Pressable>
    </View>
  );
}
