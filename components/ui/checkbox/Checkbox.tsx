import React from 'react';
import {CheckBox, Icon} from 'react-native-elements';
import {SvgImage} from '../svg';
import {Theme} from '../styleUtils';
import testIDProps from '../../../shared/commonUtil';

interface CheckboxProps {
  testId: string;
  selectionType?: 'single' | 'multiple';
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
        <Icon name="check-circle" type="material" color={Theme.Colors.Icon} />
      }
      uncheckedIcon={
        <Icon
          name="radio-button-unchecked"
          color={Theme.Colors.uncheckedIcon}
        />
      }
      onPress={onPress}
    />
  );
};
