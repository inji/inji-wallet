import React from 'react';
import {render} from '@testing-library/react-native';
import {View, Text} from 'react-native';

jest.mock('react-native-copilot', () => ({
  CopilotStep: ({children}: any) => children,
  walkthroughable: (Component: any) => Component,
  CopilotProvider: ({children}: any) => children,
  useCopilot: () => ({
    start: jest.fn(),
    copilotEvents: {on: jest.fn(), off: jest.fn()},
  }),
}));

import {Copilot} from './Copilot';

describe('Copilot', () => {
  it('should render children', () => {
    const {getByText} = render(
      <Copilot title="step1" description="desc" order={1}>
        <View>
          <Text>My Content</Text>
        </View>
      </Copilot>,
    );
    expect(getByText('My Content')).toBeTruthy();
  });

  it('should match snapshot', () => {
    const tree = render(
      <Copilot title="step" description="description" order={2}>
        <View>
          <Text>Content</Text>
        </View>
      </Copilot>,
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
