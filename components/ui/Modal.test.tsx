import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';

jest.mock('react-native', () => {
  const actual = jest.requireActual('react-native');
  return {
    ...actual,
    I18nManager: {isRTL: false},
    Modal: ({children, visible, ...props}: any) =>
      visible ? React.createElement('View', props, children) : null,
    TouchableOpacity: ({children, onPress, ...props}: any) =>
      React.createElement('View', {...props, onPress}, children),
    View: ({children, ...props}: any) =>
      React.createElement('View', props, children),
  };
});
jest.mock('react-native-elements', () => ({
  Icon: ({name, onPress}: any) =>
    React.createElement('View', {testID: `icon-${name}`, onPress}),
}));
jest.mock('.', () => ({
  Column: ({children, ...props}: any) =>
    React.createElement('View', props, children),
  Row: ({children, ...props}: any) =>
    React.createElement('View', props, children),
  Text: ({children, testID, ...props}: any) =>
    React.createElement(
      'Text',
      {accessibilityLabel: testID, ...props},
      children,
    ),
}));
jest.mock('../../screens/Scan/SendVcScreenController', () => ({
  useSendVcScreen: jest.fn(() => ({receiverInfo: {}})),
}));
jest.mock('../DeviceInfoList', () => ({
  DeviceInfoList: () => React.createElement('View', {testID: 'deviceInfo'}),
}));
jest.mock('./styleUtils', () => ({
  Theme: {
    Colors: {Icon: '#000', textLabel: '#999', IconBg: '#eee', Details: '#333'},
    ModalStyles: {defaultModal: {}},
    TextStyles: {header: {}, small: {}},
  },
}));
jest.mock('../../shared/commonUtil', () => ({
  __esModule: true,
  default: (id: string) => ({accessibilityLabel: id, accessible: true}),
}));
jest.mock('./backButton/BackButton', () => ({
  BackButton: ({onPress}: any) =>
    React.createElement('View', {testID: 'backButton', onPress}),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 24, bottom: 0}),
}));

import {Modal} from './Modal';

describe('Modal', () => {
  it('should render children when visible', () => {
    const {getByText} = render(
      React.createElement(
        Modal,
        {isVisible: true, testID: 'modal'} as any,
        React.createElement('Text', null, 'Content'),
      ),
    );
    expect(getByText('Content')).toBeTruthy();
  });

  it('should not render when not visible', () => {
    const {queryByText} = render(
      React.createElement(
        Modal,
        {isVisible: false} as any,
        React.createElement('Text', null, 'Hidden'),
      ),
    );
    expect(queryByText('Hidden')).toBeNull();
  });

  it('should render header title', () => {
    const {getAllByLabelText} = render(
      React.createElement(Modal, {
        isVisible: true,
        testID: 'myModal',
        headerTitle: 'Test Title',
      } as any),
    );
    expect(getAllByLabelText('myModal').length).toBeGreaterThan(0);
  });

  it('should call onDismiss when back button is pressed', () => {
    const onDismiss = jest.fn();
    const {getByTestId} = render(
      React.createElement(Modal, {
        isVisible: true,
        arrowLeft: true,
        onDismiss,
      } as any),
    );
    fireEvent.press(getByTestId('backButton'));
    expect(onDismiss).toHaveBeenCalled();
  });
});
