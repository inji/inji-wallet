import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('../../shared/constants', () => ({
  isIOS: () => false,
  isAndroid: () => true,
}));

jest.mock('../../components/ui/Modal', () => ({
  Modal: ({children, ...props}: any) => {
    const {View} = require('react-native');
    return (
      <View testID="modal" {...props}>
        {children}
      </View>
    );
  },
}));

jest.mock('../Home/ViewVcModal', () => ({
  ViewVcModal: () => null,
}));

jest.mock('../../components/VC/VcItemContainer', () => ({
  VcItemContainer: () => {
    const {View} = require('react-native');
    return <View testID="vcItemContainer" />;
  },
}));

jest.mock('react-native-copilot', () => ({
  CopilotProvider: ({children}: any) => children,
}));

jest.mock('../../shared/Utils', () => ({
  VCItemContainerFlowType: {VC_SHARE: 'VC_SHARE'},
}));

import {ReceivedCardsModal} from './ReceivedCardsModal';

describe('ReceivedCardsModal', () => {
  const defaultController = {
    isRefreshingVcs: false,
    receivedVcsMetadata: [],
    selectedVc: null,
    isViewingVc: false,
    activeTab: 0,
    REFRESH: jest.fn(),
    VIEW_VC: jest.fn(),
    DISMISS_MODAL: jest.fn(),
  };

  it('should render empty state', () => {
    const {toJSON} = render(
      <ReceivedCardsModal
        isVisible={true}
        controller={defaultController}
        onDismiss={jest.fn()}
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
