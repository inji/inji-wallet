import React from 'react';
import {render} from '@testing-library/react-native';
import {GlobalContextProvider} from './GlobalContextProvider';
import {Text} from 'react-native';

// Mock xstate
jest.mock('@xstate/react', () => ({
  useInterpret: jest.fn(() => ({
    subscribe: jest.fn(),
  })),
}));

// Mock appMachine
jest.mock('../machines/app', () => ({
  appMachine: {},
}));

// Mock GlobalContext
jest.mock('../shared/GlobalContext', () => ({
  GlobalContext: {
    Provider: ({children}: {children: React.ReactNode}) => <>{children}</>,
  },
}));

// Mock commonUtil
jest.mock('../shared/commonUtil', () => ({
  logState: jest.fn(),
}));

describe('GlobalContextProvider Component', () => {
  it('should match snapshot with children', () => {
    const {toJSON} = render(
      <GlobalContextProvider>
        <Text>Test Child</Text>
      </GlobalContextProvider>,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with multiple children', () => {
    const {toJSON} = render(
      <GlobalContextProvider>
        <Text>Child 1</Text>
        <Text>Child 2</Text>
      </GlobalContextProvider>,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
