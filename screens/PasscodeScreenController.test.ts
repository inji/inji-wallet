const mockSend = jest.fn();

jest.mock('@xstate/react', () => ({
  useSelector: jest.fn((service, selector) => {
    if (selector.name === 'selectAuthorized') return false;
    if (selector.name === 'selectPasscode') return '1234';
    if (selector.name === 'selectPasscodeSalt') return 'salt-value';
    if (selector.name === 'selectIsBiometricToggleFromSettings') return false;
    return undefined;
  }),
}));
jest.mock('../machines/auth', () => ({
  AuthEvents: {
    LOGIN: jest.fn(() => ({type: 'LOGIN'})),
    SETUP_PASSCODE: jest.fn(p => ({type: 'SETUP_PASSCODE', passcode: p})),
  },
  selectAuthorized: (() => {
    const f = jest.fn();
    Object.defineProperty(f, 'name', {value: 'selectAuthorized'});
    return f;
  })(),
  selectPasscode: (() => {
    const f = jest.fn();
    Object.defineProperty(f, 'name', {value: 'selectPasscode'});
    return f;
  })(),
  selectPasscodeSalt: (() => {
    const f = jest.fn();
    Object.defineProperty(f, 'name', {value: 'selectPasscodeSalt'});
    return f;
  })(),
  selectIsBiometricToggleFromSettings: (() => {
    const f = jest.fn();
    Object.defineProperty(f, 'name', {
      value: 'selectIsBiometricToggleFromSettings',
    });
    return f;
  })(),
}));
jest.mock('../machines/settings', () => ({
  SettingsEvents: {
    TOGGLE_BIOMETRIC_UNLOCK: jest.fn((a, b) => ({
      type: 'TOGGLE_BIOMETRIC_UNLOCK',
      enabled: a,
    })),
  },
}));
jest.mock('../shared/GlobalContext', () => ({
  GlobalContext: {
    _currentValue: {
      appService: {
        children: new Map([
          ['auth', {send: mockSend}],
          ['settings', {send: mockSend}],
        ]),
      },
    },
  },
}));
jest.mock('../shared/telemetry/TelemetryUtils', () => ({
  getEndEventData: jest.fn(),
  getEventType: jest.fn(),
  sendEndEvent: jest.fn(),
}));
jest.mock('../shared/telemetry/TelemetryConstants', () => ({
  TelemetryConstants: {
    EndEventStatus: {success: 'success'},
    FlowType: {appLogin: 'appLogin', appOnboarding: 'appOnboarding'},
  },
}));

const React = require('react');
jest.spyOn(React, 'useContext').mockReturnValue({
  appService: {
    children: new Map([
      ['auth', {send: mockSend}],
      ['settings', {send: mockSend}],
    ]),
  },
});

import {usePasscodeScreen} from './PasscodeScreenController';

describe('PasscodeScreenController', () => {
  const mockProps = {
    route: {params: {setup: true}},
    navigation: {reset: jest.fn(), navigate: jest.fn()},
  } as any;

  it('isPasscodeSet returns false for empty passcode', () => {
    const result = usePasscodeScreen(mockProps);
    expect(result.isPasscodeSet()).toBe(false);
  });

  it('LOGIN sends LOGIN event to auth service', () => {
    const result = usePasscodeScreen(mockProps);
    result.LOGIN();
    expect(mockSend).toHaveBeenCalled();
  });

  it('SETUP_PASSCODE sends passcode to auth and toggles biometric', () => {
    const result = usePasscodeScreen(mockProps);
    result.SETUP_PASSCODE();
    expect(mockSend).toHaveBeenCalled();
  });
});
