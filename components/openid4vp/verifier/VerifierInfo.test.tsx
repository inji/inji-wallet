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

  it('renders subLabel text when provided', () => {
    const {getByText} = render(
      <VerifierInfo name="Verifier" subLabel="Trusted Partner" />,
    );
    expect(getByText('Trusted Partner')).toBeTruthy();
  });

  it('shows "Trusted" badge when no subLabel is provided', () => {
    const {getByText} = render(<VerifierInfo name="Verifier" />);
    expect(getByText('verifierInfo.trusted')).toBeTruthy();
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
