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
  encodePinHash: jest.fn(
    (version: string, hash: string) => `${version}$${hash}`,
  ),
  parsePinHash: jest.fn((stored: string) => {
    const sep = stored.indexOf('$');
    if (sep === -1 || !/^v\d+$/.test(stored.slice(0, sep))) {
      return {version: 'v1', hash: stored};
    }
    return {version: stored.slice(0, sep), hash: stored.slice(sep + 1)};
  }),
}));

// Mock constants
jest.mock('../shared/constants', () => ({
  CURRENT_PIN_KDF_VERSION: 'v2',
  PIN_KDF_PROFILES: {v1: {iterations: 5}, v2: {iterations: 2}},
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
