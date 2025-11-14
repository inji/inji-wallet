import React from 'react';
import {render} from '@testing-library/react-native';
import {PinInput} from './PinInput';

// Mock usePinInput
jest.mock('../machines/pinInput', () => ({
  usePinInput: jest.fn(length => ({
    state: {
      context: {
        inputRefs: Array(length).fill({current: null}),
        values: Array(length).fill(''),
      },
    },
    send: jest.fn(),
    events: {
      UPDATE_INPUT: jest.fn((value, index) => ({
        type: 'UPDATE_INPUT',
        value,
        index,
      })),
      FOCUS_INPUT: jest.fn(index => ({type: 'FOCUS_INPUT', index})),
      KEY_PRESS: jest.fn(key => ({type: 'KEY_PRESS', key})),
    },
  })),
}));

describe('PinInput Component', () => {
  it('should match snapshot with 4 digit PIN', () => {
    const {toJSON} = render(<PinInput length={4} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with 6 digit PIN', () => {
    const {toJSON} = render(<PinInput length={6} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with onChange handler', () => {
    const {toJSON} = render(<PinInput length={4} onChange={jest.fn()} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with onDone and autosubmit', () => {
    const {toJSON} = render(
      <PinInput length={4} onDone={jest.fn()} autosubmit={true} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with custom testID', () => {
    const {toJSON} = render(<PinInput length={4} testID="customPinInput" />);
    expect(toJSON()).toMatchSnapshot();
  });
});
