import React from 'react';
import {render} from '@testing-library/react-native';
import {Badge} from './Badge';

describe('Badge', () => {
  it('renders the badge text', () => {
    const {getByText} = render(<Badge text="REQUIRED" bgColor="#fff" />);
    expect(getByText('REQUIRED')).toBeTruthy();
  });

  it('renders testId as accessibilityLabel via testIDProps', () => {
    const {getByLabelText} = render(
      <Badge text="REQUIRED" bgColor="#fff" testId="my-badge" />,
    );
    expect(getByLabelText('badge-my-badge')).toBeTruthy();
  });

  it('renders info icon when addInfoIcon is true', () => {
    const {UNSAFE_queryByProps} = render(
      <Badge text="INFO" bgColor="#fff" addInfoIcon />,
    );
    expect(UNSAFE_queryByProps({name: 'info-outline'})).toBeTruthy();
  });

  it('does NOT render info icon when addInfoIcon is false (default)', () => {
    const {UNSAFE_queryByProps} = render(
      <Badge text="NO ICON" bgColor="#fff" />,
    );
    expect(UNSAFE_queryByProps({name: 'info-outline'})).toBeNull();
  });

  it('does NOT apply accessibilityLabel when testId is not provided', () => {
    const {queryByLabelText} = render(<Badge text="No ID" bgColor="#eee" />);
    expect(queryByLabelText(/badge-/)).toBeNull();
  });

  it('matches snapshot for happy case (with testId, text, addInfoIcon)', () => {
    const {toJSON} = render(
      <Badge text="REQUIRED" bgColor="#fff" testId="happy" addInfoIcon />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
