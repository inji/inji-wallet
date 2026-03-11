import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('react-native-elements', () => {
  const React = require('react');
  return {
    Icon: ({name, ...props}: any) =>
      React.createElement('View', {...props, testID: name}),
    ListItem: Object.assign(
      ({children, onPress, ...props}: any) =>
        React.createElement('View', {...props, onPress}, children),
      {
        Content: ({children}: any) =>
          React.createElement('View', null, children),
        Title: ({children, ...props}: any) =>
          React.createElement('View', props, children),
      },
    ),
    Button: (props: any) => React.createElement('View', props),
    Tooltip: ({children}: any) => React.createElement('View', null, children),
  };
});

// Override the global useState mock to use the real one for this test
jest.mock('react', () => ({
  ...jest.requireActual('react'),
}));

import {SetupPicker} from './SetupPicker';

describe('SetupPicker', () => {
  const mockItems = [
    {label: 'English', value: 'en'},
    {label: 'Hindi', value: 'hi'},
    {label: 'Tamil', value: 'ta'},
  ];

  it('should render all items', () => {
    const {getByText} = render(
      <SetupPicker
        testID="language-picker"
        items={mockItems}
        selectedValue="en"
        onValueChange={jest.fn()}
      />,
    );
    expect(getByText('English')).toBeTruthy();
    expect(getByText('Hindi')).toBeTruthy();
    expect(getByText('Tamil')).toBeTruthy();
  });

  it('should match snapshot', () => {
    const tree = render(
      <SetupPicker
        testID="picker"
        items={mockItems}
        selectedValue="hi"
        onValueChange={jest.fn()}
      />,
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
