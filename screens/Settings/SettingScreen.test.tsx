import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('./SettingScreenController', () => ({
  useSettingsScreen: () => ({
    alertMsg: '',
    hideAlert: jest.fn(),
    canUseBiometrics: true,
    isBiometricUnlockEnabled: false,
    isPasscodeSet: jest.fn(() => false),
    CHANGE_UNLOCK_METHOD: jest.fn(),
    useBiometrics: jest.fn(),
    TOGGLE_BIOMETRIC: jest.fn(),
    appId: 'test-app-id',
    credentialRegistry: 'https://test.registry.com',
    esignetHostUrl: 'https://esignet.test.com',
    credentialRegistryResponse: '',
    CANCEL: jest.fn(),
    TOGGLE_SETTINGS: jest.fn(),
    RECEIVE_CARD: jest.fn(),
    INJI_TOUR_GUIDE: jest.fn(),
    LOGOUT: jest.fn(),
    UPDATE_CREDENTIAL_REGISTRY: jest.fn(),
    isResetInjiProps: false,
  }),
}));

jest.mock('react-native-elements', () => {
  const {
    View,
    TouchableOpacity,
    Text: RNText,
    Switch: RNSwitch,
  } = require('react-native');
  const MockListItem = (props: any) => (
    <TouchableOpacity {...props}>{props.children}</TouchableOpacity>
  );
  MockListItem.Content = (props: any) => (
    <View {...props}>{props.children}</View>
  );
  MockListItem.Title = (props: any) => <View {...props}>{props.children}</View>;
  return {
    Icon: (props: any) => <View testID="icon" />,
    ListItem: MockListItem,
    Switch: (props: any) => (
      <RNSwitch
        testID="switch"
        value={props.value}
        onValueChange={props.onValueChange}
      />
    ),
    Button: (props: any) => (
      <TouchableOpacity testID={props.testID} onPress={props.onPress}>
        <RNText>{props.title}</RNText>
      </TouchableOpacity>
    ),
  };
});

jest.mock('../../components/LanguageSelector', () => ({
  LanguageSelector: (props: any) => {
    const {View} = require('react-native');
    return <View testID="languageSelector">{props.triggerComponent}</View>;
  },
}));

jest.mock('react-native-gesture-handler', () => {
  const {ScrollView} = require('react-native');
  return {ScrollView};
});

jest.mock('react-native-dotenv', () => ({CREDENTIAL_REGISTRY_EDIT: 'false'}));

jest.mock('./AboutInji', () => ({AboutInji: () => null}));
jest.mock('../../components/EditableListItem', () => ({
  EditableListItem: () => null,
}));
jest.mock('./ReceivedCards', () => ({ReceivedCards: () => null}));
jest.mock('../../shared/commonUtil', () => {
  const fn = jest.fn(() => ({}));
  return {__esModule: true, default: fn};
});
jest.mock('../../components/ui/svg', () => ({
  SvgImage: {
    settingsLanguageIcon: () => 'LanguageIcon',
    ReceiveCard: () => 'ReceiveCard',
    fingerprintIcon: () => 'FingerprintIcon',
    adaptiveBiometricIcon: () => 'AdaptiveBiometricIcon',
    coloredInfo: () => 'ColoredInfo',
    logOutIcon: () => 'LogOutIcon',
  },
}));
jest.mock('../../shared/hooks/useBiometricType', () => ({
  useBiometricType: () => ({
    biometricType: 'FINGERPRINT',
    isBiometricsLoading: false,
    biometricLabel: 'Biometrics',
    translationSuffix: 'Biometrics',
    biometricCategory: 'fingerprint',
  }),
}));
jest.mock('./DataBackupAndRestore', () => ({DataBackupAndRestore: () => null}));
jest.mock('../../components/BannerNotificationContainer', () => ({
  BannerNotificationContainer: () => null,
}));
jest.mock('./SettingsKeyManagement', () => ({
  SettingsKeyManagementScreen: () => null,
}));
jest.mock('../../components/MessageOverlay', () => ({
  MessageOverlay: () => null,
}));

import {SettingScreen} from './SettingScreen';

describe('SettingScreen', () => {
  const defaultProps = {
    triggerComponent: <></>,
    navigation: {navigate: jest.fn()},
    route: {params: {}},
  } as any;

  it('should render settings screen', () => {
    const {toJSON} = render(<SettingScreen {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
