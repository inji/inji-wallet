import React from 'react';
import {render} from '@testing-library/react-native';
import {Logo} from './Logo';

describe('Logo Component', () => {
  it('should render Logo component', () => {
    const {toJSON} = render(<Logo />);
    expect(toJSON()).toBeTruthy();
  });

  it('should render Logo with width and height props', () => {
    const {toJSON} = render(<Logo width={100} height={100} />);
    expect(toJSON()).toBeTruthy();
  });

  it('should render Logo with string width and height', () => {
    const {toJSON} = render(<Logo width="100%" height="50" />);
    expect(toJSON()).toBeTruthy();
  });
});
