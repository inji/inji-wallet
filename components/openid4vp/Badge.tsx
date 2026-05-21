import React from 'react';
import { View } from 'react-native';
import { Icon } from 'react-native-elements';
import { Text } from '../ui';
import { Theme } from '../ui/styleUtils';

interface BadgeProps {
  text: string;
  textColor?: string;
  borderColor?: string;
  bgColor: string;
  addInfoIcon?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ text, textColor, borderColor, bgColor, addInfoIcon = false }) => {
  const badgeTextColor = textColor ?? borderColor ?? Theme.Colors.secondaryText;

  const badgeStyles = [Theme.DcqlStyles.badge, { backgroundColor: bgColor }];
  if (borderColor) {
    badgeStyles.push({ borderColor });
  } else {
    badgeStyles.push({borderWidth: 0});
  }

  return (<View
    style={badgeStyles}>
    <Text style={[Theme.DcqlStyles.badgeText, { color: badgeTextColor }]}>
      {text}
    </Text>
    {addInfoIcon &&
      <Icon
        name="info-outline"
        type="material"
        size={10}
        color={badgeTextColor}
        containerStyle={Theme.DcqlStyles.badgeInfoIcon}
      />
      }
  </View>)
};
