import React from 'react';
import {render} from '@testing-library/react-native';
import {RotatingIcon} from './RotatingIcon';

describe('RotatingIcon Component', () => {
  it('should render RotatingIcon component', () => {
    const {toJSON} = render(
      <RotatingIcon name="sync" size={24} color="#000000" clockwise={true} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('should render with clockwise rotation', () => {
    const {toJSON} = render(
      <RotatingIcon
        name="refresh"
        size={30}
        color="#FF0000"
        clockwise={true}
      />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('should render with counter-clockwise rotation', () => {
    const {toJSON} = render(
      <RotatingIcon
        name="refresh"
        size={30}
        color="#0000FF"
        clockwise={false}
      />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('should render with custom duration', () => {
    const {toJSON} = render(
      <RotatingIcon
        name="sync"
        size={24}
        color="#00FF00"
        clockwise={true}
        duration={5000}
      />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('should render with default duration', () => {
    const {toJSON} = render(
      <RotatingIcon
        name="loading"
        size={20}
        color="#CCCCCC"
        clockwise={true}
      />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('should handle different icon names', () => {
    const iconNames = ['sync', 'refresh', 'loading', 'autorenew'];

    iconNames.forEach(name => {
      const {toJSON} = render(
        <RotatingIcon name={name} size={24} color="#000000" clockwise={true} />,
      );
      expect(toJSON()).toBeTruthy();
    });
  });

  it('should handle different sizes', () => {
    const sizes = [16, 24, 32, 48];

    sizes.forEach(size => {
      const {toJSON} = render(
        <RotatingIcon
          name="sync"
          size={size}
          color="#000000"
          clockwise={true}
        />,
      );
      expect(toJSON()).toBeTruthy();
    });
  });

  it('should handle different colors', () => {
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFFFF'];

    colors.forEach(color => {
      const {toJSON} = render(
        <RotatingIcon name="sync" size={24} color={color} clockwise={true} />,
      );
      expect(toJSON()).toBeTruthy();
    });
  });
});
