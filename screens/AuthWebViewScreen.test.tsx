jest.unmock('react');
import React from 'react';
import {render, act, waitFor} from '@testing-library/react-native';
import {Alert, BackHandler} from 'react-native';

const mockAlertFn = jest.fn();

jest.mock('psl', () => ({parse: jest.fn(() => ({domain: 'test.com'}))}));
jest.mock('react-native-webview', () => {
  const {View} = require('react-native');
  return {WebView: (props: any) => <View testID="webview" />};
});
jest.mock('@expo/vector-icons', () => ({
  Ionicons: (props: any) => {
    const {View} = require('react-native');
    return <View testID="ionicon" />;
  },
}));
jest.mock('../shared/vciClient/VciClient', () => ({
  __esModule: true,
  default: {getInstance: () => ({sendAuthCode: jest.fn()})},
}));
jest.mock('../shared/constants', () => ({
  isAndroid: () => true,
  isIOS: () => false,
}));

import AuthWebViewScreen from './AuthWebViewScreen';

describe('AuthWebViewScreen', () => {
  const makeRoute = (overrides = {}) => ({
    params: {
      authorizationURL: 'https://test.mosip.net/authorize?client_id=wallet',
      clientId: 'wallet',
      redirectUri: 'io.mosip.residentapp.inji://oauthredirect',
      controller: {CANCEL: jest.fn()},
      ...overrides,
    },
  });

  let navigation: any;

  beforeEach(() => {
    navigation = {
      goBack: jest.fn(),
      setOptions: jest.fn(),
    };
    mockAlertFn.mockClear();
    jest.spyOn(Alert, 'alert').mockImplementation(mockAlertFn);
    jest
      .spyOn(BackHandler, 'addEventListener')
      .mockReturnValue({remove: jest.fn()} as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render AuthWebViewScreen', () => {
    const {toJSON} = render(
      <AuthWebViewScreen route={makeRoute()} navigation={navigation} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should throw on missing authorizationURL', () => {
    expect(() => {
      render(
        <AuthWebViewScreen
          route={makeRoute({authorizationURL: null})}
          navigation={navigation}
        />,
      );
    }).toThrow();
  });

  it('should call controller.CANCEL when cancel alert button pressed', async () => {
    const controller = {CANCEL: jest.fn()};
    render(
      <AuthWebViewScreen
        route={makeRoute({controller})}
        navigation={navigation}
      />,
    );
    await waitFor(() => expect(mockAlertFn).toHaveBeenCalled());
    const alertCall = mockAlertFn.mock.calls[0];
    const buttons = alertCall[2];
    expect(buttons).toBeDefined();
    const cancelButton = buttons.find((btn: any) => btn.style === 'cancel');
    expect(cancelButton).toBeDefined();
    cancelButton.onPress();
    expect(controller.CANCEL).toHaveBeenCalled();
    expect(navigation.goBack).toHaveBeenCalled();
  });

  it('should show WebView when continue alert button pressed', async () => {
    const {toJSON, rerender} = render(
      <AuthWebViewScreen route={makeRoute()} navigation={navigation} />,
    );
    await waitFor(() => expect(mockAlertFn).toHaveBeenCalled());
    const alertCall = mockAlertFn.mock.calls[0];
    const buttons = alertCall[2];
    expect(buttons).toBeDefined();
    const continueButton = buttons.find((btn: any) => btn.style === 'default');
    expect(continueButton).toBeDefined();
    act(() => {
      continueButton.onPress();
    });
    rerender(<AuthWebViewScreen route={makeRoute()} navigation={navigation} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render Header component with back arrow', () => {
    const {getByText} = render(
      <AuthWebViewScreen route={makeRoute()} navigation={navigation} />,
    );
    expect(getByText('Authenticate')).toBeTruthy();
  });
});
