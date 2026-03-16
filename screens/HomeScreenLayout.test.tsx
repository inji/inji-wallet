import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  getFocusedRouteNameFromRoute: jest.fn(() => 'HomeScreen'),
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({children}: any) => {
      const {View} = require('react-native');
      return <View testID="navigator">{children}</View>;
    },
    Screen: ({component: Component, ...props}: any) => {
      const {View} = require('react-native');
      return <View testID={`screen-${props.name}`} />;
    },
  }),
}));

jest.mock('../shared/constants', () => ({
  isIOS: () => false,
  isAndroid: () => true,
  INTRO_SLIDER_LOGO_MARGIN: 10,
}));

jest.mock('./Home/HomeScreen', () => ({
  HomeScreen: () => null,
}));

jest.mock('./Issuers/IssuersScreen', () => ({
  IssuersScreen: () => null,
}));

jest.mock('../components/ui/svg', () => ({
  SvgImage: {
    InjiLogo: () => 'InjiLogo',
    InjiSmallLogo: () => 'InjiSmallLogo',
    coloredInfo: () => 'coloredInfo',
  },
}));

jest.mock('../components/HelpScreen', () => ({
  HelpScreen: () => null,
}));

jest.mock('../components/ui/Copilot', () => ({
  Copilot: ({children}: any) => children,
}));

jest.mock('../components/ui/Header', () => ({
  Header: () => null,
}));

jest.mock('../shared/commonUtil', () => jest.fn(() => ({})));

import {HomeScreenLayout} from './HomeScreenLayout';

describe('HomeScreenLayout', () => {
  const defaultProps = {
    navigation: {
      setOptions: jest.fn(),
      navigate: jest.fn(),
    },
    route: {},
  } as any;

  it('should render home screen layout', () => {
    const {toJSON} = render(<HomeScreenLayout {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
