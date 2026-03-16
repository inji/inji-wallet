import React from 'react';
import {render} from '@testing-library/react-native';
import {HomeScreen} from './HomeScreen';

jest.mock('./HomeScreenController', () => ({
  useHomeScreen: () => ({
    IssuersService: null,
    activeTab: 0,
    haveTabsLoaded: true,
    tabRefs: {myVcs: {}, receivedVcs: {}},
    selectedVc: null,
    isViewingVc: false,
    isMinimumStorageLimitReached: false,
    DISMISS: jest.fn(),
    DISMISS_MODAL: jest.fn(),
    GOTO_ISSUERS: jest.fn(),
  }),
}));

jest.mock('./MyVcsTab', () => ({
  MyVcsTab: () => 'MyVcsTab',
}));

jest.mock('./ReceivedVcsTab', () => ({
  ReceivedVcsTab: () => 'ReceivedVcsTab',
}));

jest.mock('./ViewVcModal', () => ({
  ViewVcModal: () => 'ViewVcModal',
}));

jest.mock('../../components/MessageOverlay', () => ({
  ErrorMessageOverlay: () => null,
}));

jest.mock('../../components/BannerNotificationContainer', () => ({
  BannerNotificationContainer: () => 'BannerNotificationContainer',
}));

jest.mock('../../shared/commonUtil', () => jest.fn(() => ({})));

jest.mock('../../components/ui/Copilot', () => ({
  Copilot: ({children}: any) => children,
}));

describe('HomeScreen', () => {
  const defaultProps = {
    navigation: {navigate: jest.fn()} as any,
    route: {} as any,
  };

  it('should match snapshot', () => {
    const {toJSON} = render(<HomeScreen {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
