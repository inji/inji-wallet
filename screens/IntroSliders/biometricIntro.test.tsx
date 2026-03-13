import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('../../components/ui/svg', () => ({
  SvgImage: {
    fingerprintIcon: () => 'fingerprintIcon',
    adaptiveBiometricIcon: () => 'AdaptiveBiometricIcon',
  },
}));

jest.mock('../../shared/constants', () => ({
  isIOS: () => false,
  isAndroid: () => true,
}));

jest.mock('../../shared/hooks/useBiometricType', () => ({
  useBiometricType: () => ({
    biometricType: 'FINGERPRINT',
    isBiometricsLoading: false,
    biometricLabel: 'Biometrics',
    translationSuffix: 'Biometrics',
    biometricCategory: 'fingerprint',
  }),
}));

import {StaticAuthScreen} from './biometricIntro';

describe('StaticAuthScreen', () => {
  it('should render biometric intro', () => {
    const {toJSON} = render(<StaticAuthScreen />);
    expect(toJSON()).toMatchSnapshot();
  });
});
