import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({children}: any) => {
      const {View} = require('react-native');
      return <View testID="bottomTabNavigator">{children}</View>;
    },
    Screen: (props: any) => {
      const {View} = require('react-native');
      return <View testID={`screen-${props.name}`} />;
    },
  }),
}));

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({navigate: jest.fn()}),
}));

jest.mock('@xstate/react', () => ({
  useSelector: () => '',
  useInterpret: jest.fn(),
}));

jest.mock('../shared/GlobalContext', () => {
  const React = require('react');
  return {
    GlobalContext: React.createContext({
      appService: {
        children: {get: () => ({send: jest.fn()})},
      },
    }),
  };
});

jest.mock('../routes/main', () => ({
  mainRoutes: [{name: 'home', component: () => null, options: {}}],
  share: {name: 'share'},
}));

jest.mock('../machines/bleShare/scan/scanMachine', () => ({
  ScanEvents: {RESET: () => ({type: 'RESET'})},
}));

jest.mock('../machines/app', () => ({
  selectAuthorizationRequest: () => '',
  selectIsLinkCode: () => '',
}));

jest.mock('../components/ui/svg', () => ({
  SvgImage: {
    TabIcon: () => 'TabIcon',
  },
}));

jest.mock('../components/CopilotTooltip', () => ({
  CopilotTooltip: () => null,
}));

jest.mock('../components/ui/Copilot', () => ({
  Copilot: ({children}: any) => children,
}));

jest.mock('react-native-copilot', () => ({
  CopilotProvider: ({children}: any) => children,
}));

jest.mock('../shared/commonUtil', () => jest.fn(() => ({})));

jest.mock('../shared/constants', () => ({
  isIOS: () => false,
  isAndroid: () => true,
}));

jest.mock('../routes/routesConstants', () => ({
  BOTTOM_TAB_ROUTES: {share: 'share'},
}));

import {MainLayout} from './MainLayout';

describe('MainLayout', () => {
  it('should render bottom tab navigator', () => {
    const {toJSON} = render(<MainLayout />);
    expect(toJSON()).toMatchSnapshot();
  });
});
