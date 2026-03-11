import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({t: (key: string) => key}),
}));
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(cb => cb()),
}));
jest.mock('./Modal', () => ({
  Modal: ({children, isVisible}: any) =>
    isVisible ? React.createElement('View', {testID: 'modal'}, children) : null,
}));
jest.mock('./Header', () => ({
  Header: () => React.createElement('View', {testID: 'header'}),
}));
jest.mock('./styleUtils', () => ({
  Theme: {
    ErrorStyles: {image: {}, title: {}, message: {}, additionalMessage: {}},
    ModalStyles: {modal: {}},
    TextStyles: {
      base: {},
      semiBoldHeader: {},
      subHeader: {},
      bold: {},
      small: {},
      regular: {},
      header: {},
    },
    ButtonStyles: {
      float: {},
      fill: {},
      clear: {},
      solid: {},
      outline: {},
      small: {},
      medium: {},
      large: {},
    },
    Colors: {
      whiteBackgroundColor: '#fff',
      GradientColors: ['#000', '#111'],
      DisabledColors: ['#999', '#aaa'],
    },
    Styles: {hrLineFill: {}},
    LinearGradientDirection: {start: {x: 0, y: 0}, end: {x: 1, y: 0}},
    spacing: jest.fn(() => ({})),
  },
}));
jest.mock('../../shared/commonUtil', () => ({
  __esModule: true,
  default: (id: string) => ({testID: id}),
}));
jest.mock('../../shared/constants', () => ({
  isIOS: jest.fn(() => false),
}));

import {ErrorView} from './Error';

describe('ErrorView', () => {
  const defaultProps = {
    testID: 'errorTest',
    isVisible: true,
    title: 'Error Title',
    message: 'Error message',
    image: React.createElement('View', {testID: 'errorImage'}),
  };

  it('should render in non-modal mode by default', () => {
    const {getByText} = render(React.createElement(ErrorView, defaultProps));
    expect(getByText('Error Title')).toBeTruthy();
    expect(getByText('Error message')).toBeTruthy();
  });

  it('should render in modal mode', () => {
    const {getByText} = render(
      React.createElement(ErrorView, {...defaultProps, isModal: true}),
    );
    expect(getByText('Error Title')).toBeTruthy();
  });

  it('should render additional message when provided', () => {
    const {getByText} = render(
      React.createElement(ErrorView, {
        ...defaultProps,
        additionalMessage: 'Extra info',
      }),
    );
    expect(getByText('Extra info')).toBeTruthy();
  });

  it('should render primary button when provided', () => {
    const onPress = jest.fn();
    const {getByText} = render(
      React.createElement(ErrorView, {
        ...defaultProps,
        primaryButtonText: 'tryAgain',
        primaryButtonEvent: onPress,
      }),
    );
    expect(getByText('tryAgain')).toBeTruthy();
  });

  it('should render text button when provided', () => {
    const {getByText} = render(
      React.createElement(ErrorView, {
        ...defaultProps,
        textButtonText: 'goBack',
        textButtonEvent: jest.fn(),
      }),
    );
    expect(getByText('goBack')).toBeTruthy();
  });

  it('should render with goBack header', () => {
    const {getByText} = render(
      React.createElement(ErrorView, {...defaultProps, goBack: jest.fn()}),
    );
    expect(getByText('Error Title')).toBeTruthy();
  });

  it('should render aligned actions on end', () => {
    const {getByText} = render(
      React.createElement(ErrorView, {
        ...defaultProps,
        alignActionsOnEnd: true,
        primaryButtonText: 'retry',
        primaryButtonEvent: jest.fn(),
        textButtonText: 'cancel',
        textButtonEvent: jest.fn(),
      }),
    );
    expect(getByText('retry')).toBeTruthy();
    expect(getByText('cancel')).toBeTruthy();
  });
});
