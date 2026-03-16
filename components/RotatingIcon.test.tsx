import React from 'react';
import {render} from '@testing-library/react-native';
import {RotatingIcon} from './RotatingIcon';

describe('RotatingIcon Component', () => {
  it('should match snapshot with clockwise rotation', () => {
    const {toJSON} = render(
      <RotatingIcon name="sync" size={24} color="#000000" clockwise={true} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with counter-clockwise rotation', () => {
    const {toJSON} = render(
      <RotatingIcon
        name="refresh"
        size={30}
        color="#0000FF"
        clockwise={false}
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
