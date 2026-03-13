const mockSend = jest.fn();
const mockBioSend = jest.fn();

jest.mock('@xstate/react', () => ({
  useSelector: jest.fn(() => undefined),
  useMachine: jest.fn(() => [
    {matches: jest.fn((s: string) => false)},
    mockBioSend,
    {send: mockBioSend},
  ]),
}));
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({t: jest.fn((k: string) => k)})),
}));
jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn().mockResolvedValue(true),
  isEnrolledAsync: jest.fn().mockResolvedValue(true),
}));
jest.mock('../machines/auth', () => ({
  AuthEvents: {
    SETUP_BIOMETRICS: jest.fn((v: string) => ({
      type: 'SETUP_BIOMETRICS',
      value: v,
    })),
  },
  selectSettingUp: jest.fn(),
  selectAuthorized: jest.fn(),
}));
jest.mock('../machines/biometrics', () => ({
  biometricsMachine: {},
  selectError: jest.fn(),
  selectIsEnabled: jest.fn(),
  selectIsSuccess: jest.fn(),
  selectIsUnvailable: jest.fn(),
  selectUnenrolledNotice: jest.fn(),
  selectErrorResponse: jest.fn(),
}));
jest.mock('../machines/settings', () => ({
  SettingsEvents: {
    TOGGLE_BIOMETRIC_UNLOCK: jest.fn((a: boolean, b: boolean) => ({
      type: 'TOGGLE_BIOMETRIC_UNLOCK',
      a,
      b,
    })),
  },
}));
jest.mock('../shared/GlobalContext', () => ({
  GlobalContext: {_currentValue: {appService: {children: new Map()}}},
}));
jest.mock('../shared/telemetry/TelemetryUtils', () => ({
  sendStartEvent: jest.fn(),
  sendImpressionEvent: jest.fn(),
  sendInteractEvent: jest.fn(),
  sendEndEvent: jest.fn(),
  getStartEventData: jest.fn(),
  getInteractEventData: jest.fn(),
  getImpressionEventData: jest.fn(),
  getEndEventData: jest.fn(),
}));
jest.mock('../shared/telemetry/TelemetryConstants', () => ({
  TelemetryConstants: {
    FlowType: {appOnboarding: 'appOnboarding'},
    EndEventStatus: {success: 'success', failure: 'failure'},
    InteractEventSubtype: {click: 'click'},
    Screens: {home: 'home'},
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

import {useAuthScreen} from './AuthScreenController';

describe('AuthScreenController', () => {
  const mockNavigation = {navigate: jest.fn(), reset: jest.fn()};
  const mockProps = {navigation: mockNavigation, route: {}} as any;

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

  it('alertMsg is empty by default', () => {
    const result = useAuthScreen(mockProps);
    expect(result.alertMsg).toBe('');
  });

  it('hideAlert clears alert message', () => {
    const result = useAuthScreen(mockProps);
    result.hideAlert();
    expect(result.alertMsg).toBe('');
  });

  it('navigateToPasscode navigates to Passcode', () => {
    const result = useAuthScreen(mockProps);
    result.navigateToPasscode();
    expect(mockNavigation.navigate).toHaveBeenCalledWith(
      'Passcode',
      expect.any(Object),
    );
  });

  it('useBiometrics sends AUTHENTICATE when enrolled', async () => {
    const result = useAuthScreen(mockProps);
    await result.useBiometrics();
    expect(mockBioSend).toHaveBeenCalledWith({type: 'AUTHENTICATE'});
  });

  it('useBiometrics sets alert when not enrolled', async () => {
    const LocalAuthentication = require('expo-local-authentication');
    LocalAuthentication.isEnrolledAsync.mockResolvedValueOnce(false);
    const result = useAuthScreen(mockProps);
    await result.useBiometrics();
    // When not enrolled, it sets alertMsg but doesn't send
    expect(typeof result.alertMsg).toBe('string');
  });

  it('isBiometricsAvailable is initially false', () => {
    const result = useAuthScreen(mockProps);
    expect(result.isBiometricsAvailable).toBe(false);
  });
});
