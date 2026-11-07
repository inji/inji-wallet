import React from 'react';
import {Pressable} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Text} from '../../../components/ui';
import {Theme} from '../../../components/ui/styleUtils';
import Help from '../../../assets/Colored_Info.svg';
import {Header} from '../../../components/ui/Header';

const styles = Theme.ShareNearbyStyles;
const shareStyles = Theme.ShareNearbyShareStyles;

export function ShareHeader({onHelp}: {onHelp: () => void}) {
  const {t} = useTranslation('ShareNearby');
  return (
    <Header
      safeArea={false}
      elevation={0}
      title={t('title')}
      containerStyle={shareStyles.header}
      titleStyle={shareStyles.heading}
      titleWeight="bold"
      titleAlign="left"
      headerRight={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('help')}
          onPress={onHelp}
          style={shareStyles.help}>
          <Help
            width={16}
            height={16}
            color1={Theme.Colors.linearIconGradientStart}
            color2={Theme.Colors.linearIconGradientEnd}
          />
          <Text weight="semibold" style={styles.small}>
            {t('help')}
          </Text>
        </Pressable>
      }
    />
  );
}
