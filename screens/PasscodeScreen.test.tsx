import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({t: (key: string) => key}),
}));
jest.mock('../components/PasscodeVerify', () => ({
  MAX_PIN: 6,
  PasscodeVerify: () => React.createElement('View', {testID: 'passcodeVerify'}),
}));
jest.mock('../components/PinInput', () => ({
  PinInput: ({onDone}: any) =>
    React.createElement('View', {testID: 'pinInput'}),
}));
jest.mock('../components/ui', () => ({
  Column: ({children}: any) => React.createElement('View', null, children),
  Text: ({children, testID}: any) =>
    React.createElement('Text', {accessibilityLabel: testID}, children),
}));
jest.mock('../components/ui/styleUtils', () => ({
  Theme: {
    Colors: {
      whiteBackgroundColor: '#fff',
      GrayText: '#999',
      errorMessage: 'red',
    },
    Styles: {passwordKeyboardAvoidStyle: {}},
    TextStyles: {header: {}},
  },
}));
jest.mock('../components/ui/svg', () => ({
  SvgImage: {LockIcon: () => React.createElement('View', {testID: 'lockIcon'})},
}));
jest.mock('./PasscodeScreenController', () => ({
  usePasscodeScreen: jest.fn(() => ({
    passcode: '',
    error: '',
    storedPasscode: '1234',
    storedSalt: 'salt',
    toggleUnlock: false,
    setPasscode: jest.fn(),
    setError: jest.fn(),
    SETUP_PASSCODE: jest.fn(),
    LOGIN: jest.fn(),
  })),
}));
jest.mock('../shared/commonUtil', () => ({
  hashData: jest.fn().mockResolvedValue('hashed'),
  __esModule: true,
  default: (id: string) => ({accessibilityLabel: id, accessible: true}),
}));
jest.mock('../shared/constants', () => ({
  argon2iConfig: {},
  isIOS: () => false,
}));
jest.mock('../shared/telemetry/TelemetryUtils', () => ({
  getEndEventData: jest.fn(),
  getEventType: jest.fn(),
  getImpressionEventData: jest.fn(),
  resetRetryCount: jest.fn(),
  sendEndEvent: jest.fn(),
  sendImpressionEvent: jest.fn(),
  incrementRetryCount: jest.fn(),
}));
jest.mock('../shared/telemetry/TelemetryConstants', () => ({
  TelemetryConstants: {
    FlowType: {},
    EndEventStatus: {failure: 'failure'},
    Screens: {passcode: 'passcode'},
    ErrorId: {userCancel: 'user_cancel'},
    ErrorMessage: {authenticationCancelled: 'auth cancelled'},
  },
}));

import {PasscodeScreen} from './PasscodeScreen';

describe('PasscodeScreen', () => {
  const defaultProps: any = {
    navigation: {reset: jest.fn()},
    route: {params: {setup: true}},
  };

  it('should render setup mode', () => {
    const {getByLabelText} = render(
      React.createElement(PasscodeScreen, defaultProps),
    );
    expect(getByLabelText('setPasscodeHeader')).toBeTruthy();
  });

  it('should render unlock mode', () => {
    const unlockProps: any = {
      navigation: {reset: jest.fn()},
      route: {params: {setup: false}},
    };
    const {getByLabelText} = render(
      React.createElement(PasscodeScreen, unlockProps),
    );
    expect(getByLabelText('enterPasscode')).toBeTruthy();
  });

  it('should render confirm passcode when passcode already entered', () => {
    const {usePasscodeScreen} = require('./PasscodeScreenController');
    usePasscodeScreen.mockReturnValue({
      passcode: 'hashedVal',
      error: '',
      storedPasscode: '',
      storedSalt: 'salt',
      toggleUnlock: false,
      setPasscode: jest.fn(),
      setError: jest.fn(),
      SETUP_PASSCODE: jest.fn(),
      LOGIN: jest.fn(),
    });
    const {getByLabelText} = render(
      React.createElement(PasscodeScreen, defaultProps),
    );
    expect(getByLabelText('confirmPasscodeHeader')).toBeTruthy();
  });
});
