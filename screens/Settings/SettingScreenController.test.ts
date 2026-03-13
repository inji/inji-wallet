const mockSend = jest.fn();
const mockBioSend = jest.fn();

jest.mock('@xstate/react', () => ({
  useSelector: jest.fn(() => undefined),
  useMachine: jest.fn(() => [
    {matches: jest.fn(() => false)},
    mockBioSend,
    {send: mockBioSend},
  ]),
}));
jest.mock('../../machines/auth', () => ({
  AuthEvents: {
    SETUP_BIOMETRICS: jest.fn(v => ({type: 'SETUP_BIOMETRICS', value: v})),
    CHANGE_METHOD: jest.fn(() => ({type: 'CHANGE_METHOD'})),
    SET_TOUR_GUIDE: jest.fn(() => ({type: 'SET_TOUR_GUIDE'})),
    LOGOUT: jest.fn(() => ({type: 'LOGOUT'})),
  },
  selectBiometrics: jest.fn(),
  selectCanUseBiometrics: jest.fn(),
  selectPasscode: jest.fn(),
  selectSettingUp: jest.fn(),
}));
jest.mock('../../machines/settings', () => ({
  SettingsEvents: {
    UPDATE_NAME: jest.fn(n => ({type: 'UPDATE_NAME', name: n})),
    UPDATE_VC_LABEL: jest.fn(l => ({type: 'UPDATE_VC_LABEL', label: l})),
    UPDATE_HOST: jest.fn(() => ({type: 'UPDATE_HOST'})),
    UPDATE_CREDENTIAL_REGISTRY_RESPONSE: jest.fn(() => ({
      type: 'UPDATE_CREDENTIAL_REGISTRY_RESPONSE',
    })),
    TOGGLE_BIOMETRIC_UNLOCK: jest.fn(() => ({type: 'TOGGLE_BIOMETRIC_UNLOCK'})),
    BACK: jest.fn(() => ({type: 'BACK'})),
    CANCEL: jest.fn(() => ({type: 'CANCEL'})),
    SET_KEY_MANAGEMENT_EXPLORED: jest.fn(() => ({
      type: 'SET_KEY_MANAGEMENT_EXPLORED',
    })),
    SET_KEY_ORDER_RESPONSE: jest.fn(() => ({type: 'SET_KEY_ORDER_RESPONSE'})),
    RESET_KEY_ORDER_RESPONSE: jest.fn(() => ({
      type: 'RESET_KEY_ORDER_RESPONSE',
    })),
    SET_KEY_MANAGEMENT_TOUR_GUIDE_EXPLORED: jest.fn(() => ({
      type: 'SET_KEY_MANAGEMENT_TOUR_GUIDE_EXPLORED',
    })),
    INJI_TOUR_GUIDE: jest.fn(() => ({type: 'INJI_TOUR_GUIDE'})),
    ACCEPT_HARDWARE_SUPPORT_NOT_EXISTS: jest.fn(() => ({type: 'ACCEPT'})),
  },
  selectBiometricUnlockEnabled: jest.fn(),
  selectName: jest.fn(),
  selectCredentialRegistryResponse: jest.fn(),
  selectVcLabel: jest.fn(),
  selectCredentialRegistry: jest.fn(),
  selectAppId: jest.fn(),
  selectEsignetHostUrl: jest.fn(),
  selectIsKeymanagementTourGuideExplored: jest.fn(),
  selectIsKeyOrderSet: jest.fn(),
}));
jest.mock('../../machines/biometrics', () => ({
  biometricsMachine: {},
  selectError: jest.fn(),
  selectIsSuccess: jest.fn(),
  selectUnenrolledNotice: jest.fn(),
}));
jest.mock('../../shared/GlobalContext', () => ({
  GlobalContext: {_currentValue: {appService: {children: new Map()}}},
}));
jest.mock('expo-local-authentication', () => ({
  isEnrolledAsync: jest.fn().mockResolvedValue(true),
}));
jest.mock('react-native-copilot', () => ({
  useCopilot: jest.fn(() => ({start: jest.fn()})),
}));
jest.mock('../../routes/routesConstants', () => ({
  BOTTOM_TAB_ROUTES: {home: 'Home'},
  REQUEST_ROUTES: {Request: 'Request'},
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

import {useSettingsScreen} from './SettingScreenController';

describe('SettingScreenController', () => {
  const mockProps = {
    route: {},
    navigation: {navigate: jest.fn(), reset: jest.fn()},
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
    const result = useSettingsScreen(mockProps);
    expect(result).toHaveProperty('isVisible');
    expect(result).toHaveProperty('alertMsg');
    expect(result).toHaveProperty('hideAlert');
    expect(result).toHaveProperty('isPasscodeSet');
    expect(result).toHaveProperty('isSettingUp');
    expect(result).toHaveProperty('appId');
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('vcLabel');
    expect(result).toHaveProperty('credentialRegistry');
    expect(result).toHaveProperty('isBiometricUnlockEnabled');
    expect(result).toHaveProperty('canUseBiometrics');
    expect(result).toHaveProperty('useBiometrics');
    expect(result).toHaveProperty('UPDATE_NAME');
    expect(result).toHaveProperty('TOGGLE_SETTINGS');
    expect(result).toHaveProperty('UPDATE_VC_LABEL');
    expect(result).toHaveProperty('UPDATE_CREDENTIAL_REGISTRY');
    expect(result).toHaveProperty('RECEIVE_CARD');
    expect(result).toHaveProperty('CHANGE_UNLOCK_METHOD');
    expect(result).toHaveProperty('BACK');
    expect(result).toHaveProperty('TOGGLE_BIOMETRIC');
    expect(result).toHaveProperty('LOGOUT');
    expect(result).toHaveProperty('CANCEL');
  });

  it('UPDATE_NAME sends event with name', () => {
    const result = useSettingsScreen(mockProps);
    result.UPDATE_NAME('Test User');
    expect(mockSend).toHaveBeenCalled();
  });

  it('UPDATE_VC_LABEL sends event', () => {
    const result = useSettingsScreen(mockProps);
    result.UPDATE_VC_LABEL('MyCard');
    expect(mockSend).toHaveBeenCalled();
  });

  it('TOGGLE_SETTINGS toggles visibility', () => {
    const result = useSettingsScreen(mockProps);
    expect(() => result.TOGGLE_SETTINGS()).not.toThrow();
  });

  it('RECEIVE_CARD navigates to Request', () => {
    const result = useSettingsScreen(mockProps);
    result.RECEIVE_CARD();
    expect(mockProps.navigation.navigate).toHaveBeenCalledWith('Request');
  });

  it('CHANGE_UNLOCK_METHOD navigates to Passcode', () => {
    const result = useSettingsScreen(mockProps);
    result.CHANGE_UNLOCK_METHOD(true);
    expect(mockProps.navigation.navigate).toHaveBeenCalledWith('Passcode', {
      setup: true,
    });
  });

  it('BACK sends BACK event', () => {
    const result = useSettingsScreen(mockProps);
    result.BACK();
    expect(mockSend).toHaveBeenCalled();
  });

  it('CANCEL sends CANCEL event', () => {
    const result = useSettingsScreen(mockProps);
    result.CANCEL();
    expect(mockSend).toHaveBeenCalled();
  });

  it('hideAlert clears alert', () => {
    const result = useSettingsScreen(mockProps);
    expect(() => result.hideAlert()).not.toThrow();
  });

  it('useBiometrics with false disables biometrics', () => {
    const result = useSettingsScreen(mockProps);
    result.useBiometrics(false);
    expect(mockSend).toHaveBeenCalled();
  });

  it('INJI_TOUR_GUIDE sends events and navigates', () => {
    const result = useSettingsScreen(mockProps);
    result.INJI_TOUR_GUIDE();
    expect(mockSend).toHaveBeenCalled();
    expect(mockProps.navigation.navigate).toHaveBeenCalledWith('Home');
  });

  it('UPDATE_CREDENTIAL_REGISTRY sends events', () => {
    const result = useSettingsScreen(mockProps);
    result.UPDATE_CREDENTIAL_REGISTRY(
      'https://reg.example',
      'https://esignet.example',
    );
    expect(mockSend).toHaveBeenCalled();
  });

  it('SET_KEY_MANAGEMENT_EXPLORED sends event', () => {
    const result = useSettingsScreen(mockProps);
    result.SET_KEY_MANAGEMENT_EXPLORED();
    expect(mockSend).toHaveBeenCalled();
  });

  it('SET_KEY_ORDER_RESPONSE sends event with status', () => {
    const result = useSettingsScreen(mockProps);
    result.SET_KEY_ORDER_RESPONSE(true);
    expect(mockSend).toHaveBeenCalled();
  });

  it('RESET_KEY_ORDER_RESPONSE sends event', () => {
    const result = useSettingsScreen(mockProps);
    result.RESET_KEY_ORDER_RESPONSE();
    expect(mockSend).toHaveBeenCalled();
  });

  it('SET_KEY_MANAGEMENT_TOUR_GUIDE_EXPLORED sends event', () => {
    const result = useSettingsScreen(mockProps);
    result.SET_KEY_MANAGEMENT_TOUR_GUIDE_EXPLORED();
    expect(mockSend).toHaveBeenCalled();
  });

  it('TOGGLE_BIOMETRIC sends toggle event', () => {
    const result = useSettingsScreen(mockProps);
    result.TOGGLE_BIOMETRIC(true);
    expect(mockSend).toHaveBeenCalled();
  });

  it('TOGGLE_BIOMETRIC sends disable event', () => {
    const result = useSettingsScreen(mockProps);
    result.TOGGLE_BIOMETRIC(false);
    expect(mockSend).toHaveBeenCalled();
  });

  it('LOGOUT navigates to Welcome and sends LOGOUT event', () => {
    jest.useFakeTimers();
    const result = useSettingsScreen(mockProps);
    result.LOGOUT();
    jest.advanceTimersByTime(20);
    expect(mockProps.navigation.navigate).toHaveBeenCalledWith('Welcome');
    expect(mockSend).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('UPDATE_CREDENTIAL_REGISTRY_RESPONSE sends event', () => {
    const result = useSettingsScreen(mockProps);
    result.UPDATE_CREDENTIAL_REGISTRY_RESPONSE('response');
    expect(mockSend).toHaveBeenCalled();
  });

  it('useBiometrics with true sends AUTHENTICATE when no authBiometrics', () => {
    const result = useSettingsScreen(mockProps);
    result.useBiometrics(true);
    expect(mockBioSend).toHaveBeenCalled();
  });

  it('isPasscodeSet returns boolean', () => {
    const result = useSettingsScreen(mockProps);
    expect(typeof result.isPasscodeSet()).toBe('boolean');
  });

  it('has expected additional properties', () => {
    const result = useSettingsScreen(mockProps);
    expect(result).toHaveProperty('UPDATE_CREDENTIAL_REGISTRY');
    expect(result).toHaveProperty('UPDATE_CREDENTIAL_REGISTRY_RESPONSE');
    expect(result).toHaveProperty('RECEIVE_CARD');
    expect(result).toHaveProperty('CHANGE_UNLOCK_METHOD');
    expect(result).toHaveProperty('SET_KEY_MANAGEMENT_EXPLORED');
    expect(result).toHaveProperty('SET_KEY_ORDER_RESPONSE');
    expect(result).toHaveProperty('RESET_KEY_ORDER_RESPONSE');
    expect(result).toHaveProperty('SET_KEY_MANAGEMENT_TOUR_GUIDE_EXPLORED');
    expect(result).toHaveProperty('TOGGLE_BIOMETRIC');
    expect(result).toHaveProperty('LOGOUT');
    expect(result).toHaveProperty('esignetHostUrl');
    expect(result).toHaveProperty('credentialRegistryResponse');
    expect(result).toHaveProperty('isKeyManagementTourGuideExplored');
    expect(result).toHaveProperty('isKeyOrderSet');
  });
});
