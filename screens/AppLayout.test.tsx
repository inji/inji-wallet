import React from 'react';
import {render} from '@testing-library/react-native';
import {AppLayout} from './AppLayout';

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({children}: any) => children,
  ScrollView: null,
}));

jest.mock('./AppLayoutController', () => ({
  useAppLayout: () => ({
    isAuthorized: false,
  }),
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({children}: any) => children,
    Screen: (props: any) => {
      const {View} = require('react-native');
      return <View testID={props.name} />;
    },
  }),
}));

jest.mock('../routes', () => ({
  baseRoutes: [{name: 'Auth', component: () => 'Auth'}],
  authRoutes: [{name: 'Home', component: () => 'Home'}],
}));

describe('AppLayout', () => {
  it('should match snapshot when not authorized', () => {
    const {toJSON} = render(<AppLayout />);
    expect(toJSON()).toMatchSnapshot();
  });
});
