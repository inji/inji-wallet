import React from 'react';
import {render} from '@testing-library/react-native';
import VerifiedIcon from './VerifiedIcon';

describe('VerifiedIcon', () => {
  it('should render and match snapshot', () => {
    const {toJSON} = render(<VerifiedIcon />);
    expect(toJSON()).toMatchSnapshot();
  });
});
