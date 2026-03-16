import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  rn.NativeModules.RNSecureKeystoreModule = {
    getData: jest.fn(() => Promise.resolve(['', '{"0":"RSA"}'])),
    storeData: jest.fn(() => Promise.resolve()),
  };
  return rn;
});

jest.mock('react-native-elements', () => {
  const {View, TouchableOpacity, Text: RNText} = require('react-native');
  const MockListItem = (props: any) => <View {...props}>{props.children}</View>;
  MockListItem.Content = (props: any) => (
    <View {...props}>{props.children}</View>
  );
  MockListItem.Title = (props: any) => <View {...props}>{props.children}</View>;
  return {
    Icon: (props: any) => <View testID="icon" />,
    ListItem: MockListItem,
    Button: (props: any) => (
      <TouchableOpacity testID={props.testID} onPress={props.onPress}>
        <RNText>{props.title}</RNText>
      </TouchableOpacity>
    ),
  };
});

jest.mock('react-native-draglist', () => {
  const {View} = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => (
      <View testID="dragList">
        {props.data?.map?.((item: any, i: number) => (
          <View key={i} />
        ))}
      </View>
    ),
  };
});

jest.mock('react-native-copilot', () => ({
  useCopilot: () => ({start: jest.fn(), copilotEvents: {on: jest.fn()}}),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({goBack: jest.fn(), navigate: jest.fn()}),
  useRoute: () => ({
    params: {
      controller: {
        isKeyManagementTourGuideExplored: true,
        SET_KEY_MANAGEMENT_TOUR_GUIDE_EXPLORED: jest.fn(),
        SET_KEY_ORDER_RESPONSE: jest.fn(),
      },
      isClosed: jest.fn(),
    },
  }),
}));

jest.mock('../../components/HelpScreen', () => ({HelpScreen: () => null}));
jest.mock('../../components/BannerNotificationContainer', () => ({
  BannerNotificationContainer: () => null,
}));
jest.mock('../../components/ui/backButton/BackButton', () => ({
  BackButton: () => null,
}));
jest.mock('../../components/ui/Copilot', () => ({
  Copilot: (props: any) => {
    const {View} = require('react-native');
    return <View testID="copilot">{props.children}</View>;
  },
}));
jest.mock('../../shared/telemetry/TelemetryUtils', () => ({
  getEndEventData: jest.fn(),
  getImpressionEventData: jest.fn(),
  sendEndEvent: jest.fn(),
  sendImpressionEvent: jest.fn(),
}));
jest.mock('../../shared/telemetry/TelemetryConstants', () => ({
  TelemetryConstants: {
    FlowType: {setKeyPriority: 'skp'},
    EndEventStatus: {success: 's', failure: 'f'},
  },
}));
jest.mock('../../shared/constants', () => ({
  SUPPORTED_KEY_TYPES: {RSA: 'RSA'},
  isAndroid: () => true,
  isIOS: () => false,
}));
jest.mock('../../components/ui/svg', () => ({SvgImage: {}}));
jest.mock('react-native-linear-gradient', () => 'LinearGradient');
jest.mock('../../components/ui/HelpIcon', () => ({HelpIcon: () => null}));

import {KeyManagementScreen} from './KeyManagementScreen';

describe('KeyManagementScreen', () => {
  it('should render', () => {
    const {toJSON} = render(
      <KeyManagementScreen
        isVisible={true}
        isClosed={jest.fn()}
        controller={{}}
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with key order data loaded', async () => {
    const {toJSON} = render(
      <KeyManagementScreen
        isVisible={true}
        isClosed={jest.fn()}
        controller={{
          isKeyManagementTourGuideExplored: true,
          SET_KEY_MANAGEMENT_TOUR_GUIDE_EXPLORED: jest.fn(),
          SET_KEY_ORDER_RESPONSE: jest.fn(),
        }}
      />,
    );
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render heading text', () => {
    const {getByLabelText} = render(
      <KeyManagementScreen
        isVisible={true}
        isClosed={jest.fn()}
        controller={{
          isKeyManagementTourGuideExplored: false,
          SET_KEY_MANAGEMENT_TOUR_GUIDE_EXPLORED: jest.fn(),
          SET_KEY_ORDER_RESPONSE: jest.fn(),
        }}
      />,
    );
    expect(getByLabelText('keyManagementHeadingSettingsScreen')).toBeTruthy();
  });
});
