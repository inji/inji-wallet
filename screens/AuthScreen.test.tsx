import React from 'react';
import {render} from '@testing-library/react-native';
import {AuthScreen} from './AuthScreen';

jest.mock('./AuthScreenController', () => ({
  useAuthScreen: () => ({
    alertMsg: '',
    hideAlert: jest.fn(),
    isBiometricsAvailable: true,
    useBiometrics: jest.fn(),
    navigateToPasscode: jest.fn(),
  }),
}));

jest.mock('../components/MessageOverlay', () => ({
  MessageOverlay: (props: any) => {
    const {View} = require('react-native');
    return props.isVisible ? <View testID="messageOverlay" /> : null;
  },
}));

jest.mock('../components/ui/svg', () => ({
  SvgImage: {
    fingerprintIcon: () => 'FingerprintIcon',
    adaptiveBiometricIcon: () => 'AdaptiveBiometricIcon',
  },
}));

jest.mock('../shared/hooks/useBiometricType', () => ({
  useBiometricType: () => ({
    biometricType: 'FINGERPRINT',
    isBiometricsLoading: false,
    biometricLabel: 'Biometrics',
    translationSuffix: 'Biometrics',
    biometricCategory: 'fingerprint',
  }),
}));

jest.mock('../shared/telemetry/TelemetryUtils', () => ({
  getStartEventData: jest.fn(),
  getInteractEventData: jest.fn(),
  sendInteractEvent: jest.fn(),
  sendStartEvent: jest.fn(),
}));

describe('AuthScreen', () => {
  const defaultProps = {
    navigation: {navigate: jest.fn()} as any,
    route: {} as any,
  };

  it('should match snapshot', () => {
    const {toJSON} = render(<AuthScreen {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
