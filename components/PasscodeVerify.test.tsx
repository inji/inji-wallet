import React from 'react';
import {render} from '@testing-library/react-native';
import {PasscodeVerify} from './PasscodeVerify';

// Mock PinInput
jest.mock('./PinInput', () => ({
  PinInput: jest.fn(() => null),
}));

// Mock commonUtil
jest.mock('../shared/commonUtil', () => ({
  hashData: jest.fn(() => Promise.resolve('hashed-value')),
}));

// Mock telemetry
jest.mock('../shared/telemetry/TelemetryUtils', () => ({
  getErrorEventData: jest.fn(),
  sendErrorEvent: jest.fn(),
}));

describe('PasscodeVerify Component', () => {
  const defaultProps = {
    passcode: 'stored-hashed-passcode',
    onSuccess: jest.fn(),
    onError: jest.fn(),
    salt: 'test-salt',
    testID: 'passcodeVerify',
  };

  it('should match snapshot with default props', () => {
    const {toJSON} = render(<PasscodeVerify {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with different testID', () => {
    const {toJSON} = render(
      <PasscodeVerify {...defaultProps} testID="customPasscode" />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot without onError handler', () => {
    const {passcode, onSuccess, salt, testID} = defaultProps;
    const {toJSON} = render(
      <PasscodeVerify
        passcode={passcode}
        onSuccess={onSuccess}
        salt={salt}
        testID={testID}
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
