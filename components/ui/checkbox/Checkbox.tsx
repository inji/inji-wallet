import React from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import {CheckBox, Icon} from 'react-native-elements';
import {SvgImage} from '../svg';
import {Theme} from '../styleUtils';
import testIDProps from '../../../shared/commonUtil';

export enum CheckboxSelectionType {
  SINGLE = 'single',
  MULTIPLE = 'multiple',
}

interface CheckboxProps {
  testId: string;
  selectionType?: CheckboxSelectionType;
  checked: boolean;
  disabled?: boolean;
  onPress: () => void;
  size?: number;
  accessibilityLabel?: string;
  title?: React.ReactElement;
  containerStyle?: StyleProp<ViewStyle>;
  wrapperStyle?: StyleProp<ViewStyle>;
  checkedColor?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  testId,
  disabled = false,
  selectionType = 'single',
  checked,
  onPress,
  size,
  accessibilityLabel,
  title,
  containerStyle,
  wrapperStyle,
  checkedColor,
}) => {
  const additionalProps = {
    ...(accessibilityLabel
      ? {
          accessible: true,
          accessibilityLabel,
          accessibilityRole:
            selectionType === 'multiple'
              ? ('checkbox' as const)
              : ('radio' as const),
          accessibilityState: {checked, disabled},
        }
      : {}),
    ...(title ? {title} : {}),
    ...(containerStyle ? {containerStyle} : {}),
    ...(wrapperStyle ? {wrapperStyle} : {}),
  };
  if (selectionType === 'multiple') {
    return (
      <CheckBox
        {...testIDProps(`checkbox-multiple-${testId}`)}
        {...additionalProps}
        checked={checked}
        checkedIcon={SvgImage.selectedCheckBox(
          disabled ? '#667085' : checkedColor,
          size,
        )}
        uncheckedIcon={
          <Icon
            name="check-box-outline-blank"
            color={Theme.Colors.uncheckedIcon}
            size={size ?? 22}
          />
        }
        onPress={() => !disabled && onPress()}
        size={size}
        disabled={disabled}
      />
    );
  }

  return (
    <CheckBox
      {...testIDProps(`checkbox-single-${testId}`)}
      {...additionalProps}
      checked={checked}
      checkedIcon={
        <Icon
          name="radio-button-checked"
          color={
            disabled ? '#667085' : checkedColor ?? Theme.Colors.secondaryText
          }
          size={size}
        />
      }
      uncheckedIcon={
        <Icon
          name="radio-button-unchecked"
          color={Theme.Colors.uncheckedIcon}
          size={size}
        />
      }
      onPress={() => !disabled && onPress()}
      disabled={disabled}
    />
  );
};
