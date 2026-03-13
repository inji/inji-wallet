import React from 'react';
import {render} from '@testing-library/react-native';
import {View, Text} from 'react-native';

jest.mock('react-native-elements', () => {
  const React = require('react');
  return {
    Tooltip: ({children, ...props}: any) =>
      React.createElement('View', props, children),
    Icon: (props: any) => React.createElement('View', props),
    ListItem: Object.assign(
      ({children, ...props}: any) =>
        React.createElement('View', props, children),
      {
        Content: ({children}: any) =>
          React.createElement('View', null, children),
        Title: ({children}: any) => React.createElement('View', null, children),
      },
    ),
    Button: (props: any) => React.createElement('View', props),
  };
});

import {CustomTooltip} from './ToolTip';

describe('CustomTooltip', () => {
  it('should render trigger component', () => {
    const {getByText} = render(
      <CustomTooltip
        testID="tooltip"
        width={200}
        height={40}
        triggerComponent={<Text>Click me</Text>}
        triggerComponentStyles={{}}
      />,
    );
    expect(getByText('Click me')).toBeTruthy();
  });

  it('should match snapshot', () => {
    const tree = render(
      <CustomTooltip
        testID="tooltip"
        width={150}
        height={30}
        triggerComponent={<Text>Info</Text>}
        triggerComponentStyles={{padding: 4}}
        toolTipContent={<Text>Tooltip content</Text>}
      />,
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
