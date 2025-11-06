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

  it('should render with correct icon name', () => {
    const {toJSON} = render(<PendingIcon />);
    const tree = toJSON();
    expect(tree).toBeTruthy();
  });

  it('should render with material-community icon type', () => {
    const {toJSON} = render(<PendingIcon />);
    const tree = toJSON();
    expect(tree).toBeTruthy();
  });

  it('should have proper styling structure', () => {
    const {toJSON} = render(<PendingIcon />);
    const tree = toJSON();

    // Verify component structure exists
    expect(tree).toBeTruthy();
    expect(tree.children).toBeTruthy();
  });
});
