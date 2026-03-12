import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';

jest.mock('react-native-elements', () => ({
  Icon: ({name, onPress}: any) =>
    React.createElement('View', {testID: `icon-${name}`, onPress}),
}));
jest.mock('.', () => ({
  Column: ({children}: any) => React.createElement('View', null, children),
  Row: ({children}: any) => React.createElement('View', null, children),
}));
jest.mock('./styleUtils', () => ({
  Theme: {
    UpdateModalStyles: {modal: {}},
    Colors: {Icon: '#000'},
  },
  ElevationLevel: {},
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
});
