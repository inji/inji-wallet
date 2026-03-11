import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('react-native-dotenv', () => ({
  APPLICATION_THEME: 'default',
}));
jest.mock('../routes', () => ({}));
jest.mock('./AppLayoutController', () => ({
  useAppLayout: jest.fn(() => ({
    isLanguagesetup: false,
    isUnAuthorized: false,
    isAuthorized: false,
  })),
}));
jest.mock('../components/ui', () => ({
  Column: ({children, ...props}: any) =>
    React.createElement('View', props, children),
}));

import {SplashScreen} from './SplashScreen';

describe('SplashScreen', () => {
  const mockNavigation = {navigate: jest.fn()};
  const mockRoute = {params: {}};

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render splash screen', () => {
    const {toJSON} = render(
      React.createElement(SplashScreen, {
        navigation: mockNavigation as any,
        route: mockRoute as any,
      }),
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
