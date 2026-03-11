import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('./RequestScreenController', () => ({
  useRequestScreen: () => ({
    isMinimumStorageLimitReached: false,
    isNearByDevicesPermissionDenied: false,
    isBluetoothDenied: false,
    isReadyForBluetoothStateCheck: false,
    isCheckingBluetoothService: false,
    isWaitingForConnection: false,
    isWaitingForVc: false,
    isWaitingForVcTimeout: false,
    statusTitle: '',
    statusMessage: '',
    statusHint: '',
    openId4VpUri: '',
    CANCEL: jest.fn(),
    GOTO_SETTINGS: jest.fn(),
  }),
}));

jest.mock('react-native-bluetooth-state-manager', () => ({
  onStateChange: jest.fn(),
}));

jest.mock('react-native-qrcode-svg', () => 'QRCode');

jest.mock('react-native-elements', () => {
  const {View, TouchableOpacity, Text: RNText} = require('react-native');
  return {
    Button: (props: any) => (
      <TouchableOpacity testID={props.testID} onPress={props.onPress}>
        <RNText>{props.title}</RNText>
      </TouchableOpacity>
    ),
    Icon: () => <View testID="icon" />,
  };
});

jest.mock('../../components/MessageOverlay', () => ({
  ErrorMessageOverlay: () => null,
  MessageOverlay: () => null,
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({navigate: jest.fn(), goBack: jest.fn()}),
  NavigationProp: jest.fn(),
}));

jest.mock('../../routes/routesConstants', () => ({
  BOTTOM_TAB_ROUTES: {home: 'home'},
}));

jest.mock('../../components/ProgressingModal', () => ({
  ProgressingModal: () => null,
}));
jest.mock('../../shared/constants', () => ({
  isIOS: () => false,
  isAndroid: () => true,
}));
jest.mock('../../shared/commonUtil', () => {
  const fn = jest.fn(() => ({}));
  return {__esModule: true, default: fn};
});

import {RequestScreen} from './RequestScreen';

describe('RequestScreen', () => {
  it('should render default state', () => {
    const {toJSON} = render(<RequestScreen />);
    expect(toJSON()).toMatchSnapshot();
  });
});
