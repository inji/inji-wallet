import React from 'react';
import {render} from '@testing-library/react-native';
import {Divider} from './Divider';

describe('Divider', () => {
  it('renders the divider text', () => {
    const {getByText} = render(<Divider text="OR" />);
    expect(getByText('OR')).toBeTruthy();
  });

  it('renders testId as accessibilityLabel via testIDProps', () => {
    const {getByLabelText} = render(<Divider text="OR" testId="my-divider" />);
    expect(getByLabelText('divider-my-divider')).toBeTruthy();
  });

  it('does NOT apply accessibilityLabel when testId is not provided', () => {
    const {queryByLabelText} = render(<Divider text="AND" />);
    expect(queryByLabelText(/divider-/)).toBeNull();
  });

  it('matches snapshot for happy case', () => {
    const {toJSON} = render(<Divider text="OR" testId="snap-divider" />);
    expect(toJSON()).toMatchSnapshot();
  });
});
