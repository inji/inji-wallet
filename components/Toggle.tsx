import React from 'react';
import {View} from 'react-native';
import SwitchToggle from 'react-native-switch-toggle';
import {Theme} from './ui/styleUtils';
import testIDProps from '../shared/commonUtil';

interface ShareToggleProps {
  value: boolean;
  onToggle: (value: boolean) => void;
  testID?: string;
}

const Toggle: React.FC<ShareToggleProps> = ({value, onToggle, testID}) => {
  return (
    <View
      style={[
        Theme.Styles.wrapper,
        {
          borderColor: value ? 'transparent' : Theme.Colors.switchHead,
          backgroundColor: value
            ? Theme.Colors.switchHead
            : Theme.Colors.switchCircleOff,
        },
      ]}>
      <SwitchToggle
        {...testIDProps(testID || 'shareToggle')}
        switchOn={value}
        onPress={() => onToggle(value)}
        circleColorOff={Theme.Colors.switchHead}
        circleColorOn={Theme.Colors.switchCircleOff}
        backgroundColorOn={Theme.Colors.switchHead}
        backgroundColorOff={Theme.Colors.whiteBackgroundColor}
        containerStyle={Theme.Styles.container}
        circleStyle={Theme.Styles.circle}
      />
    </View>
  );
};

export default Toggle;
