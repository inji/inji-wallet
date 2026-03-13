// Restore real React hooks (jest-init mocks useState/useEffect globally)
jest.mock('react', () => jest.requireActual('react'));

import React from 'react';
import {render, act, fireEvent} from '@testing-library/react-native';
import {View} from 'react-native';

jest.mock('react-native-elements', () => {
  const R = jest.requireActual('react');
  const {View} = jest.requireActual('react-native');
  return {
    Icon: ({name}: any) => R.createElement(View, {testID: `icon-${name}`}),
    ListItem: Object.assign(
      ({children, onPress}: any) => R.createElement(View, {onPress}, children),
      {
        Content: ({children}: any) => R.createElement(View, null, children),
        Title: ({children, ...props}: any) =>
          R.createElement(View, props, children),
      },
    ),
    Overlay: ({children, isVisible}: any) =>
      isVisible ? R.createElement(View, {testID: 'overlay'}, children) : null,
  };
});
jest.mock('./Layout', () => ({
  Column: ({children}: any) =>
    jest.requireActual('react').createElement('View', null, children),
}));
jest.mock('./Text', () => ({
  Text: ({children}: any) =>
    jest.requireActual('react').createElement('Text', null, children),
}));
jest.mock('../../shared/commonUtil', () => ({
  __esModule: true,
  default: (id: string) => ({accessibilityLabel: id, accessible: true}),
}));

import {Picker} from './Picker';

describe('Picker', () => {
  const items = [
    {label: 'English', value: 'en'},
    {label: 'French', value: 'fr'},
    {label: 'Hindi', value: 'hi'},
  ];

  it('should render trigger component', () => {
    const trigger = React.createElement('Text', {testID: 'trigger'}, 'Select');
    const {getByTestId} = render(
      React.createElement(Picker, {
        items,
        selectedValue: 'en',
        triggerComponent: trigger,
        onValueChange: jest.fn(),
      }),
    );
    expect(getByTestId('trigger')).toBeTruthy();
  });

  it('should not show overlay initially', () => {
    const trigger = React.createElement('Text', {testID: 'trigger'}, 'Select');
    const {queryByTestId} = render(
      React.createElement(Picker, {
        items,
        selectedValue: 'en',
        triggerComponent: trigger,
        onValueChange: jest.fn(),
      }),
    );
    expect(queryByTestId('overlay')).toBeNull();
  });

  it('should open overlay when trigger is pressed', () => {
    const setIsContentVisible = jest.fn();
    jest
      .spyOn(React, 'useState')
      .mockImplementationOnce(() => [false, setIsContentVisible] as any)
      .mockImplementationOnce(() => [-1, jest.fn()] as any);

    const trigger = React.createElement('Text', {testID: 'trigger'}, 'Select');
    const {UNSAFE_root} = render(
      React.createElement(Picker, {
        items,
        selectedValue: 'en',
        triggerComponent: trigger,
        onValueChange: jest.fn(),
      }),
    );

    const pressables = UNSAFE_root.findAll(
      node => typeof node.props?.onPress === 'function',
    );
    act(() => {
      pressables[0]?.props.onPress();
    });
    expect(setIsContentVisible).toHaveBeenCalledWith(true);
    (React.useState as jest.Mock).mockRestore?.();
  });

  it('should call onValueChange when an item is selected', () => {
    const onValueChange = jest.fn();
    jest
      .spyOn(React, 'useState')
      .mockImplementationOnce(() => [true, jest.fn()] as any)
      .mockImplementationOnce(() => [0, jest.fn()] as any);

    const trigger = React.createElement('Text', {testID: 'trigger'}, 'Select');
    const {getByText} = render(
      React.createElement(Picker, {
        items,
        selectedValue: 'en',
        triggerComponent: trigger,
        onValueChange,
      }),
    );

    fireEvent.press(getByText('French'));
    expect(onValueChange).toHaveBeenCalledWith('fr', 1);
    (React.useState as jest.Mock).mockRestore?.();
  });
});
