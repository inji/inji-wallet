import React from 'react';
import {View} from 'react-native';
import {Icon} from 'react-native-elements';
import {Theme} from './ui/styleUtils';

interface PendingIconProps {
  color?: string;
}

const PendingIcon: React.FC<PendingIconProps> = (props) => {
  return (
    <View style={Theme.Styles.verificationStatusIconContainer}>
      <View style={Theme.Styles.verificationStatusIconInner}>
        <Icon
          name="alert-circle"
          type="material-community"
          color={props.color}
          size={12}
        />
      </View>
    </View>
  );
};

export default PendingIcon;
