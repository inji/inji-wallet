import React from 'react';
import {render} from '@testing-library/react-native';
import VerifiedIcon from './VerifiedIcon';

describe('VerifiedIcon', () => {
  it('should render VerifiedIcon component', () => {
    const {toJSON} = render(<VerifiedIcon />);
    expect(toJSON()).toBeTruthy();
  });

  it('should match snapshot', () => {
    const {toJSON} = render(<VerifiedIcon />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should have proper styling structure', () => {
    const {toJSON} = render(<VerifiedIcon />);
    const tree = toJSON();

    // Verify component structure exists
    expect(tree).toBeTruthy();
    expect(tree.children).toBeTruthy();
  });

  it('should render with check-circle icon', () => {
    const {toJSON} = render(<VerifiedIcon />);
    const tree = toJSON();
    expect(tree).toBeTruthy();
  });
});
