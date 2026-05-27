import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {VerifierInfo} from './VerifierInfo';

jest.mock('../../ui/AdaptiveImage', () => ({
  AdaptiveImage: ({testID}: any) => {
    const {View} = require('react-native');
    return <View testID={testID} />;
  },
}));

describe('VerifierInfo', () => {
  it('renders the verifier name', () => {
    const {getByText} = render(<VerifierInfo name="My Verifier" />);
    expect(getByText('My Verifier')).toBeTruthy();
  });

  it('renders the verifier logo when logoUri is provided', () => {
    const {getByTestId} = render(
      <VerifierInfo logoUri="https://example.com/logo.png" name="Verifier" />,
    );
    expect(getByTestId('verifier-logo')).toBeTruthy();
  });

  it('does not render a logo when logoUri is null', () => {
    const {queryByTestId} = render(
      <VerifierInfo logoUri={null} name="Verifier" />,
    );
    expect(queryByTestId('verifier-logo')).toBeNull();
  });

  it('shows the info icon when showInfo is true (default)', () => {
    const {UNSAFE_queryAllByType} = render(
      <VerifierInfo name="Verifier" showInfo />,
    );
    // Component renders a TouchableOpacity wrapping the info Icon when showInfo=true
    const {TouchableOpacity} = require('react-native');
    expect(UNSAFE_queryAllByType(TouchableOpacity).length).toBeGreaterThan(0);
  });

  it('does not show the info button when showInfo is false', () => {
    const {toJSON} = render(<VerifierInfo name="Verifier" showInfo={false} />);
    const json = JSON.stringify(toJSON());
    expect(json).not.toContain('info-outline');
  });

  it('calls onInfoPress when info icon is pressed', () => {
    const onInfoPress = jest.fn();
    const {UNSAFE_getAllByType} = render(
      <VerifierInfo name="Verifier" showInfo onInfoPress={onInfoPress} />,
    );
    const {TouchableOpacity} = require('react-native');
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(buttons[0]);
    expect(onInfoPress).toHaveBeenCalledTimes(1);
  });

  it('renders subLabel text when provided', () => {
    const {getByText} = render(
      <VerifierInfo name="Verifier" subLabel="Trusted Partner" />,
    );
    expect(getByText('Trusted Partner')).toBeTruthy();
  });

  it('shows "Trusted" badge when no subLabel is provided', () => {
    const {getByText} = render(<VerifierInfo name="Verifier" />);
    expect(getByText('Trusted')).toBeTruthy();
  });

  it('matches snapshot (happy path with logo and name)', () => {
    const {toJSON} = render(
      <VerifierInfo
        logoUri="https://example.com/logo.png"
        name="Test Verifier"
        showInfo
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
