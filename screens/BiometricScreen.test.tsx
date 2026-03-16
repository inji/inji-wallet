import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({t: (key: string) => key}),
}));
jest.mock('../components/ui', () => ({
  Button: ({title, onPress}: any) =>
    React.createElement(
      'TouchableOpacity',
      {onPress, accessibilityLabel: title},
      React.createElement('Text', null, title),
    ),
  Centered: ({children}: any) => React.createElement('View', null, children),
  Column: ({children}: any) => React.createElement('View', null, children),
}));
jest.mock('../components/ui/styleUtils', () => ({
  Theme: {
    Colors: {
      whiteBackgroundColor: '#fff',
      textLabel: '#999',
      errorMessage: 'red',
    },
    Styles: {passwordKeyboardAvoidStyle: {}},
    TextStyles: {header: {}},
  },
}));
jest.mock('../components/ui/svg', () => ({
  SvgImage: {
    fingerprintIcon: () => React.createElement('View', {testID: 'fingerprint'}),
    adaptiveBiometricIcon: () =>
      React.createElement('View', {testID: 'adaptiveBiometric'}),
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
jest.mock('./BiometricScreenController', () => ({
  useBiometricScreen: jest.fn(() => ({
    error: '',
    isReEnabling: false,
    isSuccessBio: false,
    passcodeSalt: 'salt',
    storedPasscode: '1234',
    useBiometrics: jest.fn(),
    onSuccess: jest.fn(),
    onError: jest.fn(),
    onDismiss: jest.fn(),
  })),
}));
jest.mock('../components/Passcode', () => ({
  Passcode: () => React.createElement('View', {testID: 'passcode'}),
}));
jest.mock('../shared/telemetry/TelemetryUtils', () => ({
  getEventType: jest.fn(),
  incrementRetryCount: jest.fn(),
  resetRetryCount: jest.fn(),
}));
jest.mock('../shared/telemetry/TelemetryConstants', () => ({
  TelemetryConstants: {Screens: {passcode: 'passcode'}},
}));

import {BiometricScreen} from './BiometricScreen';

describe('BiometricScreen', () => {
  const defaultProps: any = {
    navigation: {reset: jest.fn(), navigate: jest.fn()},
    route: {params: {setup: false}},
  };

  it('should render without crashing', () => {
    const {getByText} = render(
      React.createElement(BiometricScreen, defaultProps),
    );
    expect(getByText('unlockBiometrics')).toBeTruthy();
  });

  it('should show passcode component when re-enabling', () => {
    const {useBiometricScreen} = require('./BiometricScreenController');
    useBiometricScreen.mockReturnValue({
      error: '',
      isReEnabling: true,
      isSuccessBio: false,
      passcodeSalt: 'salt',
      storedPasscode: '1234',
      useBiometrics: jest.fn(),
      onSuccess: jest.fn(),
      onError: jest.fn(),
      onDismiss: jest.fn(),
    });
    const {getByTestId} = render(
      React.createElement(BiometricScreen, defaultProps),
    );
    expect(getByTestId('passcode')).toBeTruthy();
  });
});
