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
jest.mock('./ReceivedVcsTabController', () => ({
  useReceivedVcsTab: jest.fn(() => ({
    receivedVcsMetadata: [],
    isRefreshingVcs: false,
    REFRESH: jest.fn(),
    VIEW_VC: jest.fn(),
  })),
}));
jest.mock('../../components/VC/VcItemContainer', () => ({
  VcItemContainer: () => React.createElement('View', {testID: 'vcItem'}),
}));
jest.mock('../../shared/Utils', () => ({
  VCItemContainerFlowType: {VC_SHARE: 'vc share'},
}));
jest.mock('./HomeScreen', () => ({}));

import {ReceivedVcsTab} from './ReceivedVcsTab';
import {useReceivedVcsTab} from './ReceivedVcsTabController';

describe('ReceivedVcsTab', () => {
  it('should render empty state when no received VCs', () => {
    const {getByText} = render(
      React.createElement(ReceivedVcsTab, {isVisible: true}),
    );
    expect(getByText('noReceivedVcsTitle')).toBeTruthy();
  });

  it('should render VC items when available', () => {
    (useReceivedVcsTab as jest.Mock).mockReturnValue({
      receivedVcsMetadata: [{getVcKey: () => 'vc1'}, {getVcKey: () => 'vc2'}],
      isRefreshingVcs: false,
      REFRESH: jest.fn(),
      VIEW_VC: jest.fn(),
    });
    const {getAllByTestId} = render(
      React.createElement(ReceivedVcsTab, {isVisible: true}),
    );
    expect(getAllByTestId('vcItem').length).toBe(2);
  });
});
