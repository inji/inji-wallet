import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('react-native-elements', () => {
  const {View, TouchableOpacity, Text} = require('react-native');
  return {
    Divider: () => <View testID="divider" />,
    Icon: () => <View testID="icon" />,
    Button: (props: any) => (
      <TouchableOpacity testID={props.testID} onPress={props.onPress}>
        <Text>{props.title}</Text>
      </TouchableOpacity>
    ),
  };
});

jest.mock('../../components/ui/svg', () => ({
  SvgImage: {
    CheckedIcon: () => 'CheckedIcon',
    UnCheckedIcon: () => 'UnCheckedIcon',
    statusValidIcon: () => 'statusValidIcon',
    walletActivatedIcon: () => 'walletActivatedIcon',
  },
}));

jest.mock('../../shared/constants', () => ({
  isIOS: () => false,
  isAndroid: () => true,
}));

import {StaticSendVcScreen} from './secureShareIntro';

describe('StaticSendVcScreen', () => {
  it('should render secure share intro', () => {
    const {toJSON} = render(<StaticSendVcScreen />);
    expect(toJSON()).toMatchSnapshot();
  });
});
