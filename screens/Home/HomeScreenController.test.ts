jest.mock('@xstate/react', () => ({
  useSelector: jest.fn(() => undefined),
  useInterpret: jest.fn(() => ({
    send: jest.fn(),
    getSnapshot: jest.fn(() => ({context: {}})),
  })),
}));
jest.mock('./HomeScreenMachine', () => ({
  HomeScreenMachine: {
    withContext: jest.fn(() => ({})),
    context: {serviceRefs: {}},
  },
  HomeScreenEvents: {
    DISMISS: jest.fn(() => ({type: 'DISMISS'})),
    GOTO_ISSUERS: jest.fn(() => ({type: 'GOTO_ISSUERS'})),
    DISMISS_MODAL: jest.fn(() => ({type: 'DISMISS_MODAL'})),
    SELECT_MY_VCS: jest.fn(() => ({type: 'SELECT_MY_VCS'})),
    SELECT_RECEIVED_VCS: jest.fn(() => ({type: 'SELECT_RECEIVED_VCS'})),
    SELECT_HISTORY: jest.fn(() => ({type: 'SELECT_HISTORY'})),
  },
  selectActiveTab: jest.fn(),
  selectSelectedVc: jest.fn(),
  selectTabRefs: jest.fn(),
  selectTabsLoaded: jest.fn(),
  selectViewingVc: jest.fn(),
  selectIssuersMachine: jest.fn(),
  selectIsMinimumStorageLimitReached: jest.fn(),
}));
jest.mock(
  '../../machines/VerifiableCredential/VCItemMachine/VCItemSelectors',
  () => ({
    selectVc: jest.fn(),
  }),
);
jest.mock('../../shared/GlobalContext', () => ({
  GlobalContext: {
    _currentValue: {
      appService: {
        getSnapshot: jest.fn(() => ({context: {serviceRefs: {}}})),
        children: new Map(),
      },
    },
  },
}));

const React = require('react');
jest.spyOn(React, 'useContext').mockReturnValue({
  appService: {
    getSnapshot: jest.fn(() => ({context: {serviceRefs: {}}})),
    children: new Map(),
  },
});
jest.spyOn(React, 'useRef').mockReturnValue({current: {}});
jest.spyOn(React, 'useEffect').mockImplementation(fn => fn());

import {useHomeScreen, getHomeMachineService} from './HomeScreenController';

describe('HomeScreenController', () => {
  const mockProps = {
    route: {params: {}},
    navigation: {reset: jest.fn(), navigate: jest.fn()},
  } as any;

  it('DISMISS sends DISMISS event', () => {
    const result = useHomeScreen(mockProps);
    result.DISMISS();
    expect(result.service.send).toHaveBeenCalled();
  });

  it('GOTO_ISSUERS sends event', () => {
    const result = useHomeScreen(mockProps);
    result.GOTO_ISSUERS();
    expect(result.service.send).toHaveBeenCalled();
  });

  it('DISMISS_MODAL sends event', () => {
    const result = useHomeScreen(mockProps);
    result.DISMISS_MODAL();
    expect(result.service.send).toHaveBeenCalled();
  });

  it('getHomeMachineService returns the service', () => {
    useHomeScreen(mockProps);
    expect(getHomeMachineService()).toBeDefined();
  });

  it('handles route params with activeTab', () => {
    const propsWithTab = {
      route: {params: {activeTab: 1}},
      navigation: {reset: jest.fn(), navigate: jest.fn()},
    } as any;
    const result = useHomeScreen(propsWithTab);
    expect(result.service.send).toHaveBeenCalled();
  });
});
