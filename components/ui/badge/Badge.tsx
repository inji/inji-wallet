import React from 'react';
import {Pressable, View} from 'react-native';
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
  onPress?: () => void
}

export const Badge: React.FC<BadgeProps> = ({
                                              text,
                                              textColor,
                                              borderColor,
                                              bgColor,
                                              addInfoIcon = false,
                                              testId,
                                              onPress
                                            }) => {
  const badgeTextColor = textColor ?? borderColor ?? Theme.Colors.secondaryText;

  const badgeStyles = [Theme.DcqlStyles.badge, { backgroundColor: bgColor }];
  if (borderColor) {
    badgeStyles.push({ borderColor });
  } else {
    badgeStyles.push({borderWidth: 0});
  }

  const content = () => {
    return (<View
      {...(testId ? testIDProps(`badge-${testId}`) : {})}
      style={badgeStyles}>
      <Text style={[Theme.DcqlStyles.badgeText, {color: badgeTextColor}]}>
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
    </View>);
  }

  if (onPress) {
    return (
      <Pressable accessible onPress={onPress}>
        {content()}
      </Pressable>
    )
  }

  return content()
};
