import React from 'react';
import {render} from '@testing-library/react-native';
import {Logo} from './Logo';

describe('Logo Component', () => {
  it('should render Logo with default props', () => {
    const {toJSON} = render(<Logo />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render Logo with custom dimensions', () => {
    const {toJSON} = render(<Logo width={100} height={100} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
