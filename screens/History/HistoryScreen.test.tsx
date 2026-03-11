import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({t: (key: string) => key}),
}));
jest.mock('react-native-elements', () => ({
  Icon: ({name}: any) => React.createElement('View', {testID: `icon-${name}`}),
}));
jest.mock('../../components/ui', () => ({
  Centered: ({children}: any) => React.createElement('View', null, children),
  Column: ({children, ...props}: any) =>
    React.createElement('View', props, children),
  Text: ({children, ...props}: any) =>
    React.createElement('Text', props, children),
}));
jest.mock('../../components/ui/styleUtils', () => ({
  Theme: {Colors: {whiteBackgroundColor: '#fff', textLabel: '#999'}},
}));
jest.mock('./HistoryScreenController', () => ({
  useHistoryTab: jest.fn(() => ({
    activities: [],
    isRefreshing: false,
    REFRESH: jest.fn(),
  })),
}));
jest.mock('../../components/ActivityLogText', () => ({
  ActivityLogText: () => React.createElement('View', {testID: 'activityLog'}),
}));
jest.mock('../../routes/main', () => ({}));
jest.mock('../../components/BannerNotificationContainer', () => ({
  BannerNotificationContainer: () => null,
}));

import {HistoryScreen} from './HistoryScreen';
import {useHistoryTab} from './HistoryScreenController';

describe('HistoryScreen', () => {
  it('should render empty state when no activities', () => {
    const {getByText} = render(React.createElement(HistoryScreen));
    expect(getByText('noHistory')).toBeTruthy();
  });

  it('should render activities when available', () => {
    (useHistoryTab as jest.Mock).mockReturnValue({
      activities: [
        {timestamp: '2024-01-01', _vcKey: 'vc1', type: 'download'},
        {timestamp: '2024-01-02', _vcKey: 'vc2', type: 'share'},
      ],
      isRefreshing: false,
      REFRESH: jest.fn(),
    });
    const {getAllByTestId} = render(React.createElement(HistoryScreen));
    expect(getAllByTestId('activityLog').length).toBe(2);
  });
});
