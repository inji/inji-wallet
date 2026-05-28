import React from 'react';
import {render} from '@testing-library/react-native';
import {Divider} from './Divider';

describe('Divider', () => {
  it('renders the divider text', () => {
    const {getByText} = render(<Divider text="OR" testId={'my-divider'} />);
    expect(getByText('OR')).toBeTruthy();
  });

  it('renders testId as accessibilityLabel via testIDProps', () => {
    const {getByLabelText} = render(<Divider text="OR" testId="my-divider" />);
    expect(getByLabelText('my-divider')).toBeTruthy();
  });

  it('matches snapshot for happy case', () => {
    const {toJSON} = render(<Divider text="OR" testId="snap-divider" />);
    expect(toJSON()).toMatchSnapshot();
  });
});
