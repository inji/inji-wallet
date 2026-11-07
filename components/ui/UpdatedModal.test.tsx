import React from 'react';
import {Text, Modal as RNModal} from 'react-native';
import {render, fireEvent} from '@testing-library/react-native';

jest.mock('react-native-elements', () => ({
  Button: ({title, ...props}: {title: React.ReactNode; onPress?: () => void}) =>
    React.createElement('View', props, title),
  Icon: ({name, onPress}: any) =>
    React.createElement('View', {testID: `icon-${name}`, onPress}),
}));
jest.mock('.', () => ({
  Column: ({children}: any) => React.createElement('View', null, children),
  Row: ({children}: any) => React.createElement('View', null, children),
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: jest.requireActual('react-native').View,
}));

import {Modal} from './UpdatedModal';

describe('UpdatedModal', () => {
  it('should render children when visible', () => {
    const {getByText} = render(
      React.createElement(
        Modal,
        {
          isVisible: true,
          onDismiss: jest.fn(),
        },
        React.createElement('Text', null, 'Modal Content'),
      ),
    );
    expect(getByText('Modal Content')).toBeTruthy();
  });

  it('should render with header right', () => {
    const {toJSON} = render(
      React.createElement(Modal, {
        isVisible: true,
        onDismiss: jest.fn(),
        headerRight: React.createElement('View', {testID: 'right'}),
      }),
    );
    expect(toJSON()).not.toBeNull();
  });

  it('should call onDismiss when back icon is pressed', () => {
    const onDismiss = jest.fn();
    const {getByTestId} = render(
      React.createElement(Modal, {
        isVisible: true,
        onDismiss,
        headerRight: React.createElement('View', {testID: 'right'}),
      }),
    );
    fireEvent.press(getByTestId('icon-chevron-left'));
    expect(onDismiss).toHaveBeenCalled();
  });
  it('shows bottom-sheet content and dismisses through its close button', () => {
    const onDismiss = jest.fn();
    const screen = render(
      <Modal
        presentation="bottomSheet"
        isVisible
        onDismiss={onDismiss}
        headerTitle="About copies"
        closeLabel="Got it">
        <Text>Copy explanation</Text>
      </Modal>,
    );
    expect(screen.getByText('About copies')).toBeOnTheScreen();
    expect(screen.getByText('Copy explanation')).toBeOnTheScreen();
    fireEvent.press(screen.getByText('Got it'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('routes Android back to dismissal for a bottom sheet', () => {
    const onDismiss = jest.fn();
    const screen = render(
      <Modal presentation="bottomSheet" isVisible onDismiss={onDismiss}>
        <Text>Content</Text>
      </Modal>,
    );
    fireEvent(screen.UNSAFE_getByType(RNModal), 'requestClose');
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
