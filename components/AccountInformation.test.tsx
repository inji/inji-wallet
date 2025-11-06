import React from 'react';
import {render} from '@testing-library/react-native';
import {AccountInformation} from './AccountInformation';

describe('AccountInformation Component', () => {
  const defaultProps = {
    email: 'test@example.com',
    picture: 'https://example.com/avatar.jpg',
  };

  it('should match snapshot with email and picture', () => {
    const {toJSON} = render(<AccountInformation {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with different email', () => {
    const {toJSON} = render(
      <AccountInformation {...defaultProps} email="another@test.com" />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with different picture URL', () => {
    const {toJSON} = render(
      <AccountInformation
        {...defaultProps}
        picture="https://example.com/different-avatar.jpg"
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with long email', () => {
    const {toJSON} = render(
      <AccountInformation
        {...defaultProps}
        email="very.long.email.address@example-domain.com"
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
