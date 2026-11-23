import React from 'react';
import {Pressable, View, StyleProp, TextStyle, ViewStyle} from 'react-native';
import {Icon} from 'react-native-elements';
import {Text} from '../index';
import {Theme} from '../styleUtils';
import testIDProps from '../../../shared/commonUtil';

interface BadgeProps {
  text: string;
  textColor?: string;
  borderColor?: string;
  bgColor: string;
  addInfoIcon?: boolean;
  testId?: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  textColor,
  borderColor,
  bgColor,
  addInfoIcon = false,
  testId,
  onPress,
  icon,
  style,
  textStyle,
}) => {
  const badgeTextColor = textColor ?? borderColor ?? Theme.Colors.secondaryText;

  const badgeStyles: StyleProp<ViewStyle>[] = [
    Theme.DcqlStyles.badge,
    {backgroundColor: bgColor},
  ];
  if (borderColor) {
    badgeStyles.push({borderColor});
  } else {
    badgeStyles.push({borderWidth: 0});
  }
  if (style) badgeStyles.push(style);

  const content = () => {
    return (
      <View
        {...(testId ? testIDProps(`badge-${testId}`) : {})}
        style={badgeStyles}>
        {icon}
        <Text
          style={[
            Theme.DcqlStyles.badgeText,
            {color: badgeTextColor},
            ...(textStyle ? [textStyle] : []),
          ]}>
          {text}
        </Text>
        {addInfoIcon && (
          <Icon
            name="info-outline"
            type="material"
            size={10}
            color={badgeTextColor}
            containerStyle={Theme.DcqlStyles.badgeInfoIcon}
          />
        )}
      </View>
    );
  };

  if (onPress) {
    return (
      <Pressable accessible onPress={onPress}>
        {content()}
      </Pressable>
    );
  }

  return content();
};
