import React from 'react';
import {render} from '@testing-library/react-native';
import PendingIcon from './PendingIcon';

describe('PendingIcon', () => {
  it('should render PendingIcon component', () => {
    const {toJSON} = render(<PendingIcon />);
    expect(toJSON()).toBeTruthy();
  });

  it('should match snapshot', () => {
    const {toJSON} = render(<PendingIcon />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with custom color', () => {
    const {toJSON} = render(<PendingIcon color="#FF0000" />);
    expect(toJSON()).toMatchSnapshot();
  });
});
