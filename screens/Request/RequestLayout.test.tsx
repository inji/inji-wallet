import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: (props: any) => {
      const {View} = require('react-native');
      return <View testID="navigator">{props.children}</View>;
    },
    Screen: (props: any) => {
      const {View} = require('react-native');
      return <View testID={`screen-${props.name}`} />;
    },
  }),
}));

jest.mock('@react-navigation/elements', () => ({
  HeaderBackButton: () => null,
}));

jest.mock('./RequestLayoutController', () => ({
  useRequestLayout: () => ({
    isDone: true,
    isAccepted: false,
    isRejected: false,
    isNavigatingToReceivedCards: false,
    errorStatusOverlay: null,
    RESET: jest.fn(),
    DISMISS: jest.fn(),
    GOTO_HOME: jest.fn(),
  }),
}));

jest.mock('../Home/ReceivedVcsTabController', () => ({
  useReceivedVcsTab: () => ({}),
}));

jest.mock('./RequestScreen', () => ({RequestScreen: () => null}));
jest.mock('./ReceiveVcScreen', () => ({ReceiveVcScreen: () => null}));
jest.mock('../Settings/ReceivedCardsModal', () => ({
  ReceivedCardsModal: () => null,
}));
jest.mock('../../components/ui/SquircleIconPopUpModal', () => ({
  SquircleIconPopUpModal: () => null,
}));
jest.mock('../../components/BannerNotificationContainer', () => ({
  BannerNotificationContainer: () => null,
}));
jest.mock('../Scan/SharingStatusModal', () => ({
  SharingStatusModal: () => null,
}));
jest.mock('../../components/ui/svg', () => ({
  SvgImage: {ErrorLogo: () => 'ErrorLogo'},
}));
jest.mock('../../components/Message', () => ({Message: () => null}));
jest.mock('react-native-linear-gradient', () => 'LinearGradient');
jest.mock('../../components/ui/backButton/BackButton', () => ({
  BackButton: () => null,
}));
jest.mock('../../routes/routesConstants', () => ({
  REQUEST_ROUTES: {RequestScreen: 'Request', ReceiveVcScreen: 'ReceiveVc'},
}));

import {RequestLayout} from './RequestLayout';

describe('RequestLayout', () => {
  it('should render default state', () => {
    const {toJSON} = render(<RequestLayout />);
    expect(toJSON()).toMatchSnapshot();
  });
});
