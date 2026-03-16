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

import {LoaderAnimation} from './LoaderAnimation';

describe('LoaderAnimation', () => {
  it('should render with showLogo=true by default', () => {
    const tree = render(<LoaderAnimation testID="test-loader" />);
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it('should render with showLogo=false', () => {
    const tree = render(
      <LoaderAnimation testID="test-loader" showLogo={false} />,
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it('should have threeDotsLoader accessible label', () => {
    const {getByLabelText} = render(<LoaderAnimation testID="loader" />);
    expect(getByLabelText('loader-threeDotsLoader')).toBeTruthy();
  });
});
