import React from 'react';
import {render} from '@testing-library/react-native';
import {VCCardSkeleton} from './VCCardSkeleton';

describe('VCCardSkeleton', () => {
  it('should match snapshot', () => {
    const {toJSON} = render(<VCCardSkeleton />);
    expect(toJSON()).toMatchSnapshot();
  });
});
