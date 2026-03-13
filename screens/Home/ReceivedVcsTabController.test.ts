const mockServiceSend = jest.fn();
const mockMyVcsSend = jest.fn();
const mockReceivedVcsSend = jest.fn();

jest.mock('@xstate/react', () => ({
  useSelector: jest.fn(() => undefined),
  useInterpret: jest.fn(() => ({send: mockServiceSend})),
}));
jest.mock(
  '../../machines/VerifiableCredential/VCMetaMachine/VCMetaSelectors',
  () => ({
    selectIsRefreshingReceivedVcs: jest.fn(),
    selectReceivedVcsMetadata: jest.fn(),
  }),
);
jest.mock('./ReceivedVcsTabMachine', () => ({
  ReceivedVcsTabEvents: {
    REFRESH: jest.fn(() => ({type: 'REFRESH'})),
  },
  ReceivedVcsTabMachine: {},
}));
jest.mock('./MyVcsTabMachine', () => ({
  MyVcsTabEvents: {
    VIEW_VC: jest.fn((ref: any) => ({type: 'VIEW_VC', ref})),
  },
  MyVcsTabMachine: {},
}));
jest.mock('./HomeScreenMachine', () => ({
  HomeScreenEvents: {
    DISMISS_MODAL: jest.fn(() => ({type: 'DISMISS_MODAL'})),
  },
  HomeScreenMachine: {
    context: {serviceRefs: {}},
    withContext: jest.fn(function (ctx: any) {
      return this;
    }),
  },
  selectSelectedVc: jest.fn(),
  selectTabRefs: jest.fn(),
  selectViewingVc: jest.fn(),
}));
jest.mock(
  '../../machines/VerifiableCredential/VCItemMachine/VCItemMachine',
  () => ({
    VCItemMachine: {},
  }),
);
jest.mock(
  '../../machines/VerifiableCredential/VCItemMachine/VCItemSelectors',
  () => ({
    selectVc: jest.fn(),
  }),
);
jest.mock('../../shared/GlobalContext', () => ({
  GlobalContext: {_currentValue: {appService: {children: new Map()}}},
}));

const React = require('react');
const {useSelector} = require('@xstate/react');

// Make useSelector return tabRefs with send functions
const mockTabRefs = {
  receivedVcs: {send: mockReceivedVcsSend},
  myVcs: {send: mockMyVcsSend},
};

jest.spyOn(React, 'useRef').mockReturnValue({current: {}});
jest.spyOn(React, 'useContext').mockReturnValue({
  appService: {
    children: new Map([['vcMeta', {send: jest.fn()}]]),
    getSnapshot: () => ({context: {serviceRefs: {}}}),
  },
});

import {useReceivedVcsTab} from './ReceivedVcsTabController';

describe('ReceivedVcsTabController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(React, 'useRef').mockReturnValue({current: {}});
    jest.spyOn(React, 'useContext').mockReturnValue({
      appService: {
        children: new Map([['vcMeta', {send: jest.fn()}]]),
        getSnapshot: () => ({context: {serviceRefs: {}}}),
      },
    });
    // Return tabRefs for selectTabRefs selector
    useSelector.mockReturnValue(mockTabRefs);
  });

  it('returns expected properties', () => {
    const result = useReceivedVcsTab();
    expect(result).toHaveProperty('isVisible');
    expect(result).toHaveProperty('receivedVcsMetadata');
    expect(result).toHaveProperty('isRefreshingVcs');
    expect(result).toHaveProperty('TOGGLE_RECEIVED_CARDS');
    expect(result).toHaveProperty('VIEW_VC');
    expect(result).toHaveProperty('isViewingVc');
    expect(result).toHaveProperty('selectedVc');
    expect(result).toHaveProperty('activeTab');
    expect(result).toHaveProperty('DISMISS_MODAL');
    expect(result).toHaveProperty('REFRESH');
  });

  it('isVisible starts as false', () => {
    const result = useReceivedVcsTab();
    expect(result.isVisible).toBe(false);
  });

  it('activeTab is 1', () => {
    const result = useReceivedVcsTab();
    expect(result.activeTab).toBe(1);
  });

  it('DISMISS_MODAL sends event', () => {
    const result = useReceivedVcsTab();
    result.DISMISS_MODAL();
    expect(mockServiceSend).toHaveBeenCalled();
  });

  it('REFRESH sends event', () => {
    const result = useReceivedVcsTab();
    result.REFRESH();
    expect(mockReceivedVcsSend).toHaveBeenCalled();
  });

  it('VIEW_VC sends event to myVcs service', () => {
    const mockVcRef = {} as any;
    const result = useReceivedVcsTab();
    result.VIEW_VC(mockVcRef);
    expect(mockMyVcsSend).toHaveBeenCalled();
  });
});
