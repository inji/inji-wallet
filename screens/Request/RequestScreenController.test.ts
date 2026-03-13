const mockRequestSend = jest.fn();

jest.mock('@xstate/react', () => ({
  useSelector: jest.fn(() => undefined),
}));
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({t: jest.fn((k: string) => k)})),
}));
jest.mock('../../machines/app', () => ({
  selectIsActive: jest.fn(),
  selectIsFocused: jest.fn(),
}));
jest.mock('../../machines/bleShare/request/selectors', () => ({
  selectIsCheckingBluetoothService: jest.fn(),
  selectIsWaitingForConnection: jest.fn(),
  selectIsWaitingForVc: jest.fn(),
  selectIsWaitingForVcTimeout: jest.fn(),
  selectOpenId4VpUri: jest.fn(),
  selectSenderInfo: jest.fn(),
}));
jest.mock('../../machines/bleShare/commonSelectors', () => ({
  selectIsBluetoothDenied: jest.fn(),
  selectIsCancelling: jest.fn(),
  selectIsNearByDevicesPermissionDenied: jest.fn(),
  selectIsReviewing: jest.fn(),
  selectReadyForBluetoothStateCheck: jest.fn(),
}));
jest.mock('../../machines/bleShare/request/requestMachine', () => ({
  RequestEvents: {
    CANCEL: jest.fn(() => ({type: 'CANCEL'})),
    DISMISS: jest.fn(() => ({type: 'DISMISS'})),
    ACCEPT: jest.fn(() => ({type: 'ACCEPT'})),
    REJECT: jest.fn(() => ({type: 'REJECT'})),
    SCREEN_FOCUS: jest.fn(() => ({type: 'SCREEN_FOCUS'})),
    GOTO_SETTINGS: jest.fn(() => ({type: 'GOTO_SETTINGS'})),
  },
  selectIsMinimumStorageLimitReached: jest.fn(),
}));
jest.mock('react-native-bluetooth-state-manager', () => ({
  getState: jest.fn().mockResolvedValue('PoweredOn'),
}));
jest.mock('../../shared/GlobalContext', () => ({
  GlobalContext: {_currentValue: {appService: {children: new Map()}}},
}));

const React = require('react');
jest.spyOn(React, 'useContext').mockReturnValue({
  appService: {children: new Map([['request', {send: mockRequestSend}]])},
});

import {useRequestScreen} from './RequestScreenController';

describe('RequestScreenController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(React, 'useContext').mockReturnValue({
      appService: {children: new Map([['request', {send: mockRequestSend}]])},
    });
  });

  it('returns expected properties', () => {
    const result = useRequestScreen();
    expect(result).toHaveProperty('statusTitle');
    expect(result).toHaveProperty('statusMessage');
    expect(result).toHaveProperty('statusHint');
    expect(result).toHaveProperty('isWaitingForConnection');
    expect(result).toHaveProperty('isWaitingForVc');
    expect(result).toHaveProperty('isBluetoothDenied');
    expect(result).toHaveProperty('CANCEL');
    expect(result).toHaveProperty('DISMISS');
    expect(result).toHaveProperty('ACCEPT');
    expect(result).toHaveProperty('REJECT');
    expect(result).toHaveProperty('REQUEST');
    expect(result).toHaveProperty('GOTO_SETTINGS');
  });

  it('CANCEL sends event', () => {
    const result = useRequestScreen();
    result.CANCEL();
    expect(mockRequestSend).toHaveBeenCalled();
  });

  it('DISMISS sends event', () => {
    const result = useRequestScreen();
    result.DISMISS();
    expect(mockRequestSend).toHaveBeenCalled();
  });

  it('ACCEPT sends event', () => {
    const result = useRequestScreen();
    result.ACCEPT();
    expect(mockRequestSend).toHaveBeenCalled();
  });

  it('REJECT sends event', () => {
    const result = useRequestScreen();
    result.REJECT();
    expect(mockRequestSend).toHaveBeenCalled();
  });

  it('REQUEST sends SCREEN_FOCUS event', () => {
    const result = useRequestScreen();
    result.REQUEST();
    expect(mockRequestSend).toHaveBeenCalled();
  });

  it('GOTO_SETTINGS sends event', () => {
    const result = useRequestScreen();
    result.GOTO_SETTINGS();
    expect(mockRequestSend).toHaveBeenCalled();
  });

  it('statusTitle is empty by default', () => {
    const result = useRequestScreen();
    expect(result.statusTitle).toBe('');
  });

  it('statusMessage is empty by default', () => {
    const result = useRequestScreen();
    expect(result.statusMessage).toBe('');
  });
});
