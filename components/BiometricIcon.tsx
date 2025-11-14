import React from 'react';
import {isIOS} from '../shared/constants';
import {SvgImage} from './ui/svg';
import {View} from 'react-native';

interface BiometricIconProps {
  size?: number;
}

const BiometricIcon: React.FC<BiometricIconProps> = ({size = 66}) => {
  const Icon = isIOS()
    ? SvgImage.faceBiometicIcon(size)
    : SvgImage.fingerprintIcon(size);

  return <View>{Icon}</View>;
};

export default BiometricIcon;
