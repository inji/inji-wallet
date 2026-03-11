import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('react-native-elements', () => {
  const {View} = require('react-native');
  const MockListItem = (props: any) => <View {...props}>{props.children}</View>;
  MockListItem.Content = (props: any) => (
    <View {...props}>{props.children}</View>
  );
  MockListItem.Title = (props: any) => <View {...props}>{props.children}</View>;
  return {
    Icon: (props: any) => <View testID="icon" />,
    ListItem: MockListItem,
  };
});

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({navigate: jest.fn()}),
}));

jest.mock('../../shared/constants', () => ({
  isIOS: () => false,
  isAndroid: () => true,
}));

jest.mock('../../shared/commonUtil', () => jest.fn(() => ({})));

jest.mock('../../routes/routesConstants', () => ({
  SETTINGS_ROUTES: {KeyManagement: 'KeyManagement'},
  SettingsStackParamList: {},
}));

import {SettingsKeyManagementScreen} from './SettingsKeyManagement';

describe('SettingsKeyManagementScreen', () => {
  const mockController = {
    SET_KEY_MANAGEMENT_EXPLORED: jest.fn(),
  };

  it('should render key management menu item', () => {
    const {toJSON} = render(
      <SettingsKeyManagementScreen controller={mockController} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
