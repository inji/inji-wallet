import React from 'react';
import {Pressable, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Text} from '../../../components/ui';
import {Theme} from '../../../components/ui/styleUtils';
import Qr from '../../../assets/shareNearby/qr.svg';
import Chevron from '../../../assets/shareNearby/chevron.svg';

const styles = Theme.ShareNearbyStyles;
const entryStyles = Theme.ShareNearbyEntryStyles;

export function CodeOption({
  title,
  badge,
  description,
  disabled,
  onPress,
  icon,
  testID,
}: {
  title: string;
  badge: string;
  description: string;
  disabled?: boolean;
  onPress: () => void;
  icon: React.ReactNode;
  testID: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{disabled: !!disabled}}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={({pressed}) => [
        styles.card,
        entryStyles.option,
        disabled && entryStyles.disabled,
        pressed && styles.pressed,
      ]}>
      {/* The badge sits outside the rounded gradient, which clips its children natively. */}
      <View style={entryStyles.qrIconFrame}>
        <LinearGradient
          colors={Theme.Colors.GradientColorsLight}
          start={Theme.LinearGradientDirection.start}
          end={Theme.LinearGradientDirection.end}
          style={entryStyles.qrIcon}>
          <Qr />
        </LinearGradient>
        <LinearGradient
          colors={Theme.Colors.GradientColors}
          style={entryStyles.badge}>
          {icon}
        </LinearGradient>
      </View>
      <View style={[styles.flexible, entryStyles.optionText]}>
        <View style={entryStyles.titleRow}>
          <Text weight="semibold" style={entryStyles.optionTitle}>
            {title}
          </Text>
          <Text style={entryStyles.tag}>{badge}</Text>
        </View>
        <Text style={entryStyles.description}>{description}</Text>
      </View>
      <Chevron />
    </Pressable>
  );
}
