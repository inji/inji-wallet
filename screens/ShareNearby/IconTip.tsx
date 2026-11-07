import React from 'react';
import {View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Text} from '../../components/ui';
import {Theme} from '../../components/ui/styleUtils';

const styles = Theme.ShareNearbyStyles;
const engagementStyles = Theme.ShareNearbyEngagementStyles;

/** An icon tile with a short title and line, as the help sheets. */
export function IconTip({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <View style={engagementStyles.tip}>
      <LinearGradient
        colors={Theme.Colors.GradientColorsLight}
        start={Theme.LinearGradientDirection.start}
        end={Theme.LinearGradientDirection.end}
        style={engagementStyles.tipIcon}>
        {icon}
      </LinearGradient>
      <View style={[styles.flexible, engagementStyles.tipText]}>
        <Text weight="semibold" style={engagementStyles.tipTitle}>
          {title}
        </Text>
        <Text style={engagementStyles.tipDescription}>{description}</Text>
      </View>
    </View>
  );
}
