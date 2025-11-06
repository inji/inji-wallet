import React from 'react';
import {isIOS} from '../shared/constants';
import {SvgImage} from './ui/svg';
import {View} from 'react-native';

interface BiometricIconProps {
  size?: number;
  align?: 'center' | 'left' | 'right';
}

const BiometricIcon: React.FC<BiometricIconProps> = ({
  size = 66,
  align = 'center',
}) => {
  const Icon = isIOS()
    ? SvgImage.faceBiometicIcon(size)
    : SvgImage.fingerprintIcon(size);

  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: align,
      }}>
      {Icon}
    </View>
  );
};

export default BiometricIcon;
