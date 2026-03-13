const mockRequestSend = jest.fn();

jest.mock('@xstate/react', () => ({
  useSelector: jest.fn(() => undefined),
}));
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({t: jest.fn((k: string) => k)})),
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
  })),
  NavigationProp: {},
}));
jest.mock('../../machines/bleShare/request/selectors', () => ({
  selectIsWaitingForConnection: jest.fn(),
  selectSenderInfo: jest.fn(),
  selectIsDone: jest.fn(),
  selectIsNavigatingToReceivedCards: jest.fn(),
  selectIsNavigatingToHome: jest.fn(),
}));
jest.mock('../../machines/bleShare/commonSelectors', () => ({
  selectIsAccepted: jest.fn(),
  selectIsDisconnected: jest.fn(),
  selectIsHandlingBleError: jest.fn(),
  selectIsRejected: jest.fn(),
  selectIsReviewing: jest.fn(),
  selectBleError: jest.fn(),
}));
jest.mock('../../machines/bleShare/request/requestMachine', () => ({
  RequestEvents: {
    DISMISS: jest.fn(() => ({type: 'DISMISS'})),
    RESET: jest.fn(() => ({type: 'RESET'})),
    GOTO_HOME: jest.fn(() => ({type: 'GOTO_HOME'})),
    SCREEN_FOCUS: jest.fn(() => ({type: 'SCREEN_FOCUS'})),
    SCREEN_BLUR: jest.fn(() => ({type: 'SCREEN_BLUR'})),
  },
}));
jest.mock('../../routes/routeTypes', () => ({}));
jest.mock('../../routes/routesConstants', () => ({
  BOTTOM_TAB_ROUTES: {home: 'Home'},
  REQUEST_ROUTES: {
    ReceiveVcScreen: 'ReceiveVcScreen',
    RequestScreen: 'RequestScreen',
  },
}));
jest.mock('../../components/MessageOverlay', () => ({}));
jest.mock('../../shared/GlobalContext', () => ({
  GlobalContext: {_currentValue: {appService: {children: new Map()}}},
}));

const React = require('react');
jest.spyOn(React, 'useContext').mockReturnValue({
  appService: {children: new Map([['request', {send: mockRequestSend}]])},
});

import {useRequestLayout} from './RequestLayoutController';

describe('RequestLayoutController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(React, 'useContext').mockReturnValue({
      appService: {children: new Map([['request', {send: mockRequestSend}]])},
    });
  });

  it('DISMISS sends event', () => {
    const result = useRequestLayout();
    result.DISMISS();
    expect(mockRequestSend).toHaveBeenCalled();
  });

  it('RESET sends event', () => {
    const result = useRequestLayout();
    result.RESET();
    expect(mockRequestSend).toHaveBeenCalled();
  });

  it('GOTO_HOME sends event', () => {
    const result = useRequestLayout();
    result.GOTO_HOME();
    expect(mockRequestSend).toHaveBeenCalled();
  });

  it('errorStatusOverlay is null by default', () => {
    const result = useRequestLayout();
    expect(result.errorStatusOverlay).toBeNull();
  });
});
