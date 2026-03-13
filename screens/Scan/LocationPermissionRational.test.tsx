import React from 'react';
import {render} from '@testing-library/react-native';
import {LocationPermissionRational} from './LocationPermissionRational';

describe('LocationPermissionRational', () => {
  const defaultProps = {
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  it('should match snapshot', () => {
    const {toJSON} = render(<LocationPermissionRational {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
