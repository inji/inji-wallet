import React from 'react';
import {render} from '@testing-library/react-native';
import {Passcode} from './Passcode';

// Mock PasscodeVerify
jest.mock('./PasscodeVerify', () => ({
  PasscodeVerify: jest.fn(() => null),
}));

// Mock telemetry
jest.mock('../shared/telemetry/TelemetryUtils', () => ({
  getImpressionEventData: jest.fn(),
  sendImpressionEvent: jest.fn(),
}));

describe('Passcode Component', () => {
  const defaultProps = {
    error: '',
    storedPasscode: 'hashed-passcode',
    salt: 'salt-value',
    onSuccess: jest.fn(),
    onError: jest.fn(),
    onDismiss: jest.fn(),
  };

  it('should match snapshot with default props', () => {
    const {toJSON} = render(<Passcode {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with custom message', () => {
    const {toJSON} = render(
      <Passcode
        {...defaultProps}
        message="Please enter your 6-digit passcode"
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with error message', () => {
    const {toJSON} = render(
      <Passcode {...defaultProps} error="Incorrect passcode. Try again." />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with both message and error', () => {
    const {toJSON} = render(
      <Passcode
        {...defaultProps}
        message="Enter passcode"
        error="Authentication failed"
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
