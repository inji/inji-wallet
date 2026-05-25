import React from 'react';
import {CheckBox, Icon} from 'react-native-elements';
import {SvgImage} from '../svg';
import {Theme} from '../styleUtils';
import testIDProps from "../../../shared/commonUtil";

interface CheckboxProps {
  testId: string,
  selectionType?: 'single' | 'multiple';
  checked: boolean;
  onPress: () => void;
  size?: number;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  testId,
  selectionType = 'single',
  checked,
  onPress,
  size
}) => {
  if (selectionType === 'multiple') {
    return (
      <CheckBox
        {...testIDProps(`checkbox-multiple-${testId}`)}
        checked={checked}
        checkedIcon={SvgImage.selectedCheckBox()}
        uncheckedIcon={
          <Icon
            name="check-box-outline-blank"
            color={Theme.Colors.uncheckedIcon}
            size={22}
          />
        }
        onPress={onPress}
        size={size}
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
        <Icon name="radio-button-unchecked" color={Theme.Colors.uncheckedIcon} />
      }
      onPress={onPress}
    />
  );
};

