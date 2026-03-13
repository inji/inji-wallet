import React from 'react';
import {render} from '@testing-library/react-native';
import {Dimensions} from 'react-native';
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
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Dimensions, 'get').mockReturnValue({
      width: 375,
      height: 667,
      scale: 2,
      fontScale: 2,
    } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

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

  it('should render custom message and error text', () => {
    const {getByText} = render(
      <Passcode
        {...defaultProps}
        message="Enter passcode"
        error="Authentication failed"
      />,
    );
    expect(getByText('Enter passcode')).toBeTruthy();
    expect(getByText('Authentication failed')).toBeTruthy();
  });

  it('should pass verification handlers and credentials to PasscodeVerify', () => {
    const onSuccess = jest.fn();
    const onError = jest.fn();

    render(
      <Passcode
        {...defaultProps}
        onSuccess={onSuccess}
        onError={onError}
        storedPasscode="stored-passcode"
        salt="stored-salt"
      />,
    );

    const {PasscodeVerify} = require('./PasscodeVerify');
    const callProps = PasscodeVerify.mock.calls[0][0];

    expect(callProps.passcode).toBe('stored-passcode');
    expect(callProps.salt).toBe('stored-salt');

    callProps.onSuccess();
    callProps.onError('bad-passcode');

    expect(onSuccess).toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith('bad-passcode');
  });
});
