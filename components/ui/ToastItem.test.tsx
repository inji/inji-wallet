import React from 'react';
import {render} from '@testing-library/react-native';
import {ToastItem} from './ToastItem';

describe('ToastItem', () => {
  it('should render toast message', () => {
    const {getByText} = render(<ToastItem message="Success!" />);
    expect(getByText('Success!')).toBeTruthy();
  });

  it('should render with empty message', () => {
    const {toJSON} = render(<ToastItem message="" />);
    expect(toJSON()).toMatchSnapshot();
  });
});
