const mockSend = jest.fn();
const mockNavigate = jest.fn();

jest.mock('@xstate/react', () => ({
  useSelector: jest.fn((service, selector) => {
    if (selector.name === 'selectSettingUp') return false;
    if (selector.name === 'selectPasscode') return '1234';
    if (selector.name === 'selectBiometrics') return 'true';
    if (selector.name === 'selectLanguagesetup') return true;
    if (selector.name === 'selectBiometricUnlockEnabled') return true;
    return undefined;
  }),
}));
jest.mock('../machines/auth', () => ({
  AuthEvents: {
    NEXT: jest.fn(() => ({type: 'NEXT'})),
    SELECT: jest.fn(() => ({type: 'SELECT'})),
  },
  selectBiometrics: (() => {
    const f = jest.fn();
    Object.defineProperty(f, 'name', {value: 'selectBiometrics'});
    return f;
  })(),
  selectLanguagesetup: (() => {
    const f = jest.fn();
    Object.defineProperty(f, 'name', {value: 'selectLanguagesetup'});
    return f;
  })(),
  selectPasscode: (() => {
    const f = jest.fn();
    Object.defineProperty(f, 'name', {value: 'selectPasscode'});
    return f;
  })(),
  selectSettingUp: (() => {
    const f = jest.fn();
    Object.defineProperty(f, 'name', {value: 'selectSettingUp'});
    return f;
  })(),
}));
jest.mock('../machines/settings', () => ({
  SettingsEvents: {
    BACK: jest.fn(() => ({type: 'BACK'})),
  },
  selectBiometricUnlockEnabled: (() => {
    const f = jest.fn();
    Object.defineProperty(f, 'name', {value: 'selectBiometricUnlockEnabled'});
    return f;
  })(),
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
  getStartEventData: jest.fn(),
  getInteractEventData: jest.fn(),
  sendInteractEvent: jest.fn(),
  sendStartEvent: jest.fn(),
}));
jest.mock('../shared/telemetry/TelemetryConstants', () => ({
  TelemetryConstants: {
    FlowType: {appLogin: 'appLogin'},
    InteractEventSubtype: {click: 'click'},
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

import {useWelcomeScreen} from './WelcomeScreenController';

describe('WelcomeScreenController', () => {
  const mockProps = {
    route: {},
    navigation: {navigate: mockNavigate, reset: jest.fn()},
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(React, 'useContext').mockReturnValue({
      appService: {
        children: new Map([
          ['auth', {send: mockSend}],
          ['settings', {send: mockSend}],
        ]),
      },
    });
  });

  it('returns expected properties', () => {
    const result = useWelcomeScreen(mockProps);
    expect(result).toHaveProperty('isSettingUp');
    expect(result).toHaveProperty('isLanguagesetup');
    expect(result).toHaveProperty('isPasscodeSet');
    expect(result).toHaveProperty('NEXT');
    expect(result).toHaveProperty('SELECT');
    expect(result).toHaveProperty('BACK');
    expect(result).toHaveProperty('unlockPage');
  });

  it('isPasscodeSet returns true when passcode exists', () => {
    const result = useWelcomeScreen(mockProps);
    expect(result.isPasscodeSet()).toBe(true);
  });

  it('NEXT sends NEXT event and navigates to Auth', () => {
    const result = useWelcomeScreen(mockProps);
    result.NEXT();
    expect(mockSend).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('Auth');
  });

  it('SELECT sends SELECT event and navigates to IntroSliders', () => {
    const result = useWelcomeScreen(mockProps);
    result.SELECT('any');
    expect(mockSend).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('IntroSliders');
  });

  it('BACK sends BACK event and navigates to Main', () => {
    const result = useWelcomeScreen(mockProps);
    result.BACK();
    expect(mockSend).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('Main');
  });

  it('unlockPage navigates to Biometric when biometrics available', () => {
    const result = useWelcomeScreen(mockProps);
    result.unlockPage();
    expect(mockNavigate).toHaveBeenCalledWith('Biometric', {setup: false});
  });

  it('unlockPage navigates to Passcode when no biometrics but passcode set', () => {
    const {useSelector} = require('@xstate/react');
    useSelector.mockImplementation((service: any, selector: any) => {
      if (selector.name === 'selectSettingUp') return false;
      if (selector.name === 'selectPasscode') return '1234';
      if (selector.name === 'selectBiometrics') return '';
      if (selector.name === 'selectLanguagesetup') return true;
      if (selector.name === 'selectBiometricUnlockEnabled') return false;
      return undefined;
    });
    const result = useWelcomeScreen(mockProps);
    result.unlockPage();
    expect(mockNavigate).toHaveBeenCalledWith('Passcode', {setup: false});
  });

  it('unlockPage navigates to Auth when setting up', () => {
    const {useSelector} = require('@xstate/react');
    useSelector.mockImplementation((service: any, selector: any) => {
      if (selector.name === 'selectSettingUp') return true;
      if (selector.name === 'selectPasscode') return '';
      if (selector.name === 'selectBiometrics') return '';
      if (selector.name === 'selectLanguagesetup') return true;
      if (selector.name === 'selectBiometricUnlockEnabled') return false;
      return undefined;
    });
    const result = useWelcomeScreen(mockProps);
    result.unlockPage();
    expect(mockNavigate).toHaveBeenCalledWith('Auth');
  });
});
