import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({t: (key: string) => key}),
}));
jest.mock('./styleUtils', () => ({
  Theme: {
    SelectVcOverlayStyles: {timeoutHintContainer: {}},
    ModalStyles: {header: {}},
    LoaderStyles: {titleContainer: {}, heading: {}},
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
      TimeoutHintText: '#666',
      textLabel: '#999',
    },
    Styles: {hrLineFill: {}},
    spacing: jest.fn(() => ({})),
  },
}));
jest.mock('./LoaderAnimation', () => ({
  LoaderAnimation: () =>
    React.createElement('View', {testID: 'loaderAnimation'}),
}));
jest.mock('./Modal', () => ({
  Modal: ({children, isVisible}: any) =>
    isVisible ? React.createElement('View', {testID: 'modal'}, children) : null,
}));
jest.mock('../../components/BannerNotification', () => ({
  BannerNotification: () => React.createElement('View', {testID: 'banner'}),
  BannerStatusType: {SUCCESS: 'success', ERROR: 'error'},
}));
jest.mock('../../shared/commonUtil', () => ({
  __esModule: true,
  default: (id: string) => ({testID: id}),
}));

import {Loader, LoaderSkeleton} from './Loader';

describe('LoaderSkeleton', () => {
  it('should render with testID', () => {
    const {toJSON} = render(
      React.createElement(LoaderSkeleton, {testID: 'test-loader'}),
    );
    expect(toJSON()).not.toBeNull();
  });

  it('should render children', () => {
    const {getByText} = render(
      React.createElement(
        LoaderSkeleton,
        {testID: 'test'},
        React.createElement('Text', null, 'Child Text'),
      ),
    );
    expect(getByText('Child Text')).toBeTruthy();
  });
});

describe('Loader', () => {
  it('should render title', () => {
    const {getByText} = render(
      React.createElement(Loader, {title: 'Loading...'}),
    );
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('should render subtitle when provided', () => {
    const {getByText} = render(
      React.createElement(Loader, {title: 'Load', subTitle: 'Please wait'}),
    );
    expect(getByText('Please wait')).toBeTruthy();
  });

  it('should render in modal mode', () => {
    const {toJSON} = render(
      React.createElement(Loader, {title: 'Loading', isModal: true}),
    );
    expect(toJSON()).not.toBeNull();
  });

  it('should render hint text when visible', () => {
    const {getByText} = render(
      React.createElement(Loader, {
        title: 'Loading',
        hint: 'Taking longer than expected',
        isHintVisible: true,
      }),
    );
    expect(getByText('Taking longer than expected')).toBeTruthy();
  });

  it('should render cancel button when onCancel provided', () => {
    const onCancel = jest.fn();
    const {getByText} = render(
      React.createElement(Loader, {
        title: 'Loading',
        onCancel,
      }),
    );
    expect(getByText('common:cancel')).toBeTruthy();
  });

  it('should render retry button when onRetry provided', () => {
    const onRetry = jest.fn();
    const {getByText} = render(
      React.createElement(Loader, {
        title: 'Loading',
        isHintVisible: true,
        onRetry,
      }),
    );
    expect(getByText('status.retry')).toBeTruthy();
  });

  it('should call onCancel when cancel button is pressed', () => {
    const onCancel = jest.fn();
    const {getByText} = render(
      React.createElement(Loader, {
        title: 'Loading',
        onCancel,
      }),
    );
    fireEvent.press(getByText('common:cancel'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('should call onRetry when retry button is pressed', () => {
    const onRetry = jest.fn();
    const {getByText} = render(
      React.createElement(Loader, {
        title: 'Loading',
        isHintVisible: true,
        onRetry,
      }),
    );
    fireEvent.press(getByText('status.retry'));
    expect(onRetry).toHaveBeenCalled();
  });
});
