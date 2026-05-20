import React from 'react';
import { View } from 'react-native';
import { Icon } from 'react-native-elements';
import { Text } from '../ui';
import { Theme } from '../ui/styleUtils';

interface BadgeProps {
  text: string;
  borderColor: string;
  bgColor: string;
  addInfoIcon?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ text, borderColor, bgColor, addInfoIcon = false }) => (
  <View
    style={[Theme.DcqlStyles.badge, { borderColor, backgroundColor: bgColor }]}>
    <Text style={[Theme.DcqlStyles.badgeText, { color: borderColor }]}>
      {text}
    </Text>
    {addInfoIcon &&
      <Icon
        name="info-outline"
        type="material"
        size={10}
        color={borderColor}
        containerStyle={Theme.DcqlStyles.badgeInfoIcon}
      />
      }
  </View>
);
