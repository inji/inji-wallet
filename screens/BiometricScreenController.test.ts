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
jest.mock('../machines/auth', () => ({
  AuthEvents: {
    LOGIN: jest.fn(() => ({type: 'LOGIN'})),
  },
  selectAuthorized: jest.fn(),
  selectPasscode: jest.fn(),
  selectPasscodeSalt: jest.fn(),
}));
jest.mock('../machines/biometrics', () => ({
  biometricsMachine: {},
  selectError: jest.fn(),
  selectErrorResponse: jest.fn(),
  selectIsAvailable: jest.fn(),
  selectIsSuccess: jest.fn(),
  selectIsUnenrolled: jest.fn(),
  selectIsUnvailable: jest.fn(),
}));
jest.mock('../shared/GlobalContext', () => ({
  GlobalContext: {_currentValue: {appService: {children: new Map()}}},
}));
jest.mock('react-native-biometrics-changed', () => ({
  hasFingerPrintChanged: jest.fn().mockResolvedValue(false),
}));
jest.mock('../shared/telemetry/TelemetryUtils', () => ({
  getStartEventData: jest.fn(),
  getEndEventData: jest.fn(),
  getInteractEventData: jest.fn(),
  sendEndEvent: jest.fn(),
  sendInteractEvent: jest.fn(),
  sendStartEvent: jest.fn(),
  resetRetryCount: jest.fn(),
}));
jest.mock('../shared/telemetry/TelemetryConstants', () => ({
  TelemetryConstants: {
    FlowType: {appLogin: 'appLogin'},
    InteractEventSubtype: {click: 'click'},
    EndEventStatus: {success: 'success', failure: 'failure'},
  },
}));
jest.mock('../shared/constants', () => ({
  isAndroid: jest.fn(() => true),
}));

const React = require('react');
jest.spyOn(React, 'useContext').mockReturnValue({
  appService: {children: new Map([['auth', {send: mockSend}]])},
});

import {useBiometricScreen} from './BiometricScreenController';

describe('BiometricScreenController', () => {
  const mockNavigation = {reset: jest.fn(), navigate: jest.fn()};
  const mockProps = {navigation: mockNavigation, route: {}} as any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(React, 'useContext').mockReturnValue({
      appService: {children: new Map([['auth', {send: mockSend}]])},
    });
  });

  it('useBiometrics sends AUTHENTICATE', () => {
    const result = useBiometricScreen(mockProps);
    result.useBiometrics();
    expect(mockBioSend).toHaveBeenCalledWith({type: 'AUTHENTICATE'});
  });

  it('onSuccess resets retry count and sends AUTHENTICATE', () => {
    const {resetRetryCount} = require('../shared/telemetry/TelemetryUtils');
    const result = useBiometricScreen(mockProps);
    result.onSuccess();
    expect(resetRetryCount).toHaveBeenCalled();
    expect(mockBioSend).toHaveBeenCalledWith({type: 'AUTHENTICATE'});
  });

  it('onError sets error value without throwing', () => {
    const result = useBiometricScreen(mockProps);
    expect(() => result.onError('some error')).not.toThrow();
  });

  it('onDismiss sends end event', () => {
    const {sendEndEvent} = require('../shared/telemetry/TelemetryUtils');
    const result = useBiometricScreen(mockProps);
    result.onDismiss();
    expect(sendEndEvent).toHaveBeenCalled();
  });

  it('initial error is empty string', () => {
    const result = useBiometricScreen(mockProps);
    expect(result.error).toBe('');
  });

  it('isReEnabling is initially false', () => {
    const result = useBiometricScreen(mockProps);
    expect(result.isReEnabling).toBe(false);
  });

  it('useBiometrics sends telemetry start and interact events', () => {
    const {
      sendStartEvent,
      sendInteractEvent,
    } = require('../shared/telemetry/TelemetryUtils');
    const result = useBiometricScreen(mockProps);
    result.useBiometrics();
    expect(sendStartEvent).toHaveBeenCalled();
    expect(sendInteractEvent).toHaveBeenCalled();
    expect(mockBioSend).toHaveBeenCalledWith({type: 'AUTHENTICATE'});
  });

  it('isSuccessBio is initially falsy', () => {
    const result = useBiometricScreen(mockProps);
    expect(result.isSuccessBio).toBeFalsy();
  });
});
