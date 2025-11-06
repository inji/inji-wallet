import React from 'react';
import {render} from '@testing-library/react-native';
import {ActivityLogText} from './ActivityLogText';
import {VCItemContainerFlowType} from '../shared/Utils';
import {VCActivityLog} from './ActivityLogEvent';
import {VPShareActivityLog} from './VPShareActivityLogEvent';

// Mock TextItem
jest.mock('./ui/TextItem', () => ({
  TextItem: jest.fn(() => null),
}));

// Mock HistoryScreenController
jest.mock('../screens/History/HistoryScreenController', () => ({
  useHistoryTab: jest.fn(() => ({
    getWellKnownIssuerMap: jest.fn(() => ({display: [{name: 'Test Issuer'}]})),
  })),
}));

// Mock ActivityLogEvent
jest.mock('./ActivityLogEvent', () => ({
  VCActivityLog: {
    getLogFromObject: jest.fn(obj => ({
      ...obj,
      getActionLabel: jest.fn(() => 'Shared'),
      getActionText: jest.fn(() => 'Shared with Test Device'),
    })),
  },
}));

// Mock VPShareActivityLogEvent
jest.mock('./VPShareActivityLogEvent', () => ({
  VPShareActivityLog: {
    getLogFromObject: jest.fn(obj => ({
      ...obj,
      getActionLabel: jest.fn(() => 'Verified'),
      getActionText: jest.fn(() => 'Verified by Test Device'),
    })),
  },
}));

describe('ActivityLogText Component', () => {
  const mockActivity = {
    vcLabel: 'Test VC',
    timestamp: new Date().toISOString(),
    deviceName: 'Test Device',
    vcIdType: 'NationalID',
    flow: VCItemContainerFlowType.VC_SHARE,
    issuer: 'test-issuer',
  } as unknown as VCActivityLog;

  it('should match snapshot with VC activity', () => {
    const {toJSON} = render(<ActivityLogText activity={mockActivity} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with VP activity', () => {
    const vpActivity = {
      ...mockActivity,
      flow: VCItemContainerFlowType.VP_SHARE,
    } as unknown as VPShareActivityLog;
    const {toJSON} = render(<ActivityLogText activity={vpActivity} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
