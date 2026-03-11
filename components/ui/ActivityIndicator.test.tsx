import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('react-native-spinkit', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props: any) => React.createElement('View', props),
  };
});

jest.mock('./svg', () => ({
  SvgImage: {
    ProgressIcon: () => null,
  },
}));

import {ActivityIndicator} from './ActivityIndicator';

describe('ActivityIndicator', () => {
  it('should render', () => {
    const {toJSON} = render(<ActivityIndicator />);
    expect(toJSON()).toMatchSnapshot();
  });
});
