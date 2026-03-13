import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('react-native-elements', () => {
  const {View} = require('react-native');
  return {
    Icon: (props: any) => <View testID="icon" />,
    Image: (props: any) => <View testID="image" />,
  };
});

jest.mock('../../components/ui/svg', () => ({
  SvgImage: {
    DigitalIdentity: () => 'DigitalIdentity',
    addIdIcon: () => 'addIdIcon',
    InjiLogo: () => 'InjiLogo',
    coloredInfo: () => 'coloredInfo',
    pinIcon: () => 'pinIcon',
    statusValidIcon: () => 'statusValidIcon',
    statusPendingIcon: () => 'statusPendingIcon',
    walletActivatedIcon: () => 'walletActivatedIcon',
    walletUnActivatedIcon: () => 'walletUnActivatedIcon',
  },
}));

jest.mock('../../components/ui/SearchBar', () => ({
  SearchBar: () => null,
}));

jest.mock('../../components/HelpScreen', () => ({
  HelpScreen: () => null,
}));

jest.mock('../../shared/tuvali', () => ({
  __esModule: true,
  default: {},
}));

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => {
  const {EventEmitter} = require('events');
  return jest.fn(() => new EventEmitter());
});

jest.mock('../../shared/constants', () => ({
  isIOS: () => false,
  isAndroid: () => true,
}));

import {StaticHomeScreen} from './trustedDigitalWalletIntro';

describe('StaticHomeScreen', () => {
  it('should render trusted digital wallet intro', () => {
    const {toJSON} = render(<StaticHomeScreen />);
    expect(toJSON()).toMatchSnapshot();
  });
});
