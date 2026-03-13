import React from 'react';
import {render} from '@testing-library/react-native';
import {AdaptiveImage} from './AdaptiveImage';

describe('AdaptiveImage', () => {
  it('should return null when uri is empty', () => {
    const tree = render(<AdaptiveImage uri="" testID="test" />);
    expect(tree.toJSON()).toBeNull();
  });

  it('should render Image for non-svg uri', () => {
    const tree = render(
      <AdaptiveImage uri="https://example.com/image.png" testID="test-img" />,
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it('should render SvgUri for svg uri', () => {
    const tree = render(
      <AdaptiveImage uri="https://example.com/logo.svg" testID="test-svg" />,
    );
    expect(tree.toJSON()).toBeNull();
  });

  it('should handle svg uri with query params', () => {
    const tree = render(
      <AdaptiveImage
        uri="https://example.com/icon.svg?v=123"
        testID="test-svg-query"
      />,
    );
    expect(tree.toJSON()).toBeNull();
  });

  it('should handle svg uri with hash fragment', () => {
    const tree = render(
      <AdaptiveImage
        uri="https://example.com/icon.svg#section"
        testID="test-svg-hash"
      />,
    );
    expect(tree.toJSON()).toBeNull();
  });
});
