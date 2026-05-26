import React from 'react';
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
}

export const Checkbox: React.FC<CheckboxProps> = ({
  testId,
  disabled = false,
  selectionType = 'single',
  checked,
  onPress,
  size,
}) => {
  if (selectionType === 'multiple') {
    return (
      <CheckBox
        {...testIDProps(`checkbox-multiple-${testId}`)}
        checked={checked}
        checkedIcon={SvgImage.selectedCheckBox(
          disabled ? '#667085' : undefined,
        )}
        uncheckedIcon={
          <Icon
            name="check-box-outline-blank"
            color={Theme.Colors.uncheckedIcon}
            size={22}
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
      checked={checked}
      checkedIcon={
        <Icon          
          name="radio-button-checked"
          color={disabled ? '#667085' : Theme.Colors.secondaryText}
        />
      }
      uncheckedIcon={
        <Icon
          name="radio-button-unchecked"
          color={Theme.Colors.uncheckedIcon}
        />
      }
      onPress={() => !disabled && onPress()}
      disabled={disabled}
    />
  );
};
