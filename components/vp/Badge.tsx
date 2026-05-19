import React from 'react';
import {View} from 'react-native';
import {Text} from '../ui';
import {Theme} from '../ui/styleUtils';

interface BadgeProps {
  text: string;
  /** Matches the border colour — also used as the text colour to stay on-brand. */
  borderColor: string;
  bgColor: string;
}

export const Badge: React.FC<BadgeProps> = ({text, borderColor, bgColor}) => (
  <View
    style={[Theme.DcqlStyles.badge, {borderColor, backgroundColor: bgColor}]}>
    <Text style={[Theme.DcqlStyles.badgeText, {color: borderColor}]}>
      {text}
    </Text>
  </View>
);
