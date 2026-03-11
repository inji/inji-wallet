const mockSelectActivities = jest.fn();
Object.defineProperty(mockSelectActivities, 'name', {
  value: 'selectActivities',
  writable: true,
});
const mockSelectIsRefreshing = jest.fn();
Object.defineProperty(mockSelectIsRefreshing, 'name', {
  value: 'selectIsRefreshing',
  writable: true,
});
const mockSelectWellknownIssuerMap = jest.fn();
Object.defineProperty(mockSelectWellknownIssuerMap, 'name', {
  value: 'selectWellknownIssuerMap',
  writable: true,
});

jest.mock('@xstate/react', () => ({
  useSelector: jest.fn((service, selector) => {
    if (selector.name === 'selectActivities') return [];
    if (selector.name === 'selectIsRefreshing') return false;
    if (selector.name === 'selectWellknownIssuerMap') return {};
    return undefined;
  }),
}));
jest.mock('../../machines/activityLog', () => ({
  ActivityLogEvents: {
    REFRESH: jest.fn(() => ({type: 'REFRESH'})),
  },
  selectActivities: mockSelectActivities,
  selectIsRefreshing: mockSelectIsRefreshing,
  selectWellknownIssuerMap: mockSelectWellknownIssuerMap,
}));
jest.mock('../../shared/GlobalContext', () => ({
  GlobalContext: {
    _currentValue: {
      appService: {
        children: new Map([['activityLog', {send: jest.fn()}]]),
      },
    },
  },
}));

import {useHistoryTab} from './HistoryScreenController';

// We need to mock useContext
const React = require('react');
jest.spyOn(React, 'useContext').mockReturnValue({
  appService: {
    children: new Map([['activityLog', {send: jest.fn()}]]),
  },
});

describe('HistoryScreenController', () => {
  it('should return activities', () => {
    const result = useHistoryTab();
    expect(result.activities).toBeDefined();
  });

  it('getWellKnownIssuerMap should return null for unknown issuer', () => {
    const result = useHistoryTab();
    expect(result.getWellKnownIssuerMap('unknown')).toBeNull();
  });
});
