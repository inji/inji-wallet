import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({t: (key: string) => key}),
}));
jest.mock('../components/ui', () => ({
  Button: ({title, onPress}: any) =>
    React.createElement(
      'TouchableOpacity',
      {onPress, accessibilityLabel: title},
      React.createElement('Text', null, title),
    ),
  HorizontallyCentered: ({children}: any) =>
    React.createElement('View', null, children),
  Column: ({children}: any) => React.createElement('View', null, children),
}));
jest.mock('../components/ui/styleUtils', () => ({
  Theme: {
    Colors: {whiteBackgroundColor: '#fff'},
    Styles: {welcomeLogo: {}},
  },
}));
jest.mock('../components/ui/svg', () => ({
  SvgImage: {InjiLogo: () => React.createElement('View', {testID: 'logo'})},
}));
jest.mock('./WelcomeScreenController', () => ({
  useWelcomeScreen: jest.fn(() => ({
    unlockPage: jest.fn(),
  })),
}));

import {WelcomeScreen} from './WelcomeScreen';

describe('WelcomeScreen', () => {
  const props: any = {
    navigation: {reset: jest.fn(), navigate: jest.fn()},
    route: {params: {}},
  };

  it('should render unlock button', () => {
    const {getByText} = render(React.createElement(WelcomeScreen, props));
    expect(getByText('unlockApplication')).toBeTruthy();
  });
});
