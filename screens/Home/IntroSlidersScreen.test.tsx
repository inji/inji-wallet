import React from 'react';
import {render} from '@testing-library/react-native';

// Polyfill clearImmediate for StatusBar
global.clearImmediate =
  global.clearImmediate || ((id: any) => clearTimeout(id));
global.setImmediate =
  global.setImmediate ||
  ((fn: any, ...args: any[]) => setTimeout(fn, 0, ...args));

jest.mock('react-native-app-intro-slider', () => {
  const React = require('react');
  const {View} = require('react-native');
  return React.forwardRef((props: any, ref: any) => (
    <View testID="appIntroSlider">
      {props.data?.map((item: any) => (
        <View key={item.key}>{props.renderItem?.({item})}</View>
      ))}
    </View>
  ));
});

jest.mock('../WelcomeScreenController', () => ({
  useWelcomeScreen: () => ({
    isPasscodeSet: () => false,
    BACK: jest.fn(),
    NEXT: jest.fn(),
    SELECT: jest.fn(),
    unlockPage: jest.fn(),
  }),
}));

jest.mock('../../shared/constants', () => ({
  isIOS: () => false,
  isAndroid: () => true,
  INTRO_SLIDER_LOGO_MARGIN: 10,
}));

jest.mock('../../components/ui/svg', () => ({
  SvgImage: {
    InjiSmallLogo: () => 'InjiSmallLogo',
  },
}));

jest.mock('../../shared/commonUtil', () => {
  const fn = jest.fn(() => ({}));
  return {__esModule: true, default: fn};
});

jest.mock('../IntroSliders/biometricIntro', () => ({
  StaticAuthScreen: () => 'StaticAuthScreen',
}));

jest.mock('../IntroSliders/quickAccessIntro', () => ({
  StaticScanScreen: () => 'StaticScanScreen',
}));

jest.mock('../IntroSliders/backupRestoreIntro', () => ({
  __esModule: true,
  default: () => 'StaticBackupAndRestoreScreen',
}));

jest.mock('../IntroSliders/trustedDigitalWalletIntro', () => ({
  StaticHomeScreen: () => 'StaticHomeScreen',
}));

jest.mock('../IntroSliders/secureShareIntro', () => ({
  StaticSendVcScreen: () => 'StaticSendVcScreen',
}));

import {IntroSlidersScreen} from './IntroSlidersScreen';

describe('IntroSlidersScreen', () => {
  const defaultProps = {
    navigation: {navigate: jest.fn()},
    route: {},
  } as any;

  it('should render intro sliders', () => {
    const {toJSON} = render(<IntroSlidersScreen {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
