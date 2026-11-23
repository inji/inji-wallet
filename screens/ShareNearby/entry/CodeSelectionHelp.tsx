import React from 'react';
import {Text as RNText, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Text} from '../../../components/ui';
import {Theme} from '../../../components/ui/styleUtils';
import Info from '../../../assets/Info.svg';

const styles = Theme.ShareNearbyStyles;
const entryStyles = Theme.ShareNearbyEntryStyles;

export function CodeSelectionHelp({onHelp}: {onHelp: () => void}) {
  const {t} = useTranslation('ShareNearby');
  return (
    <View style={entryStyles.hint}>
      <Info
        width={16}
        height={16}
        color1={Theme.ShareNearbyColors.secondary}
        color2={Theme.ShareNearbyColors.secondary}
      />
      <Text style={[styles.small, styles.flexible, entryStyles.hintText]}>
        {t('entry.chooseHint')}{' '}
        <RNText
          accessibilityRole="link"
          onPress={onHelp}
          style={[Theme.TextStyles.semibold, entryStyles.hintLink]}>
          {t('entry.compare')}
        </RNText>
      </Text>
    </View>
  );
}
