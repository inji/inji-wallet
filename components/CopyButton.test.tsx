import React from 'react';
import {render} from '@testing-library/react-native';
import {CopyButton} from './CopyButton';

// Mock Clipboard
jest.mock('@react-native-clipboard/clipboard', () => ({
  setString: jest.fn(),
}));

// Mock SvgImage
jest.mock('./ui/svg', () => ({
  SvgImage: {
    copyIcon: jest.fn(() => null),
  },
}));

describe('CopyButton Component', () => {
  const defaultProps = {
    content: 'Test content to copy',
  };

  it('should match snapshot with default props', () => {
    const {toJSON} = render(<CopyButton {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with long content', () => {
    const {toJSON} = render(
      <CopyButton content="This is a very long content string that needs to be copied to clipboard for testing purposes" />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with special characters', () => {
    const specialContent = 'Special: @#$%^&*(){}[]';
    const {toJSON} = render(<CopyButton content={specialContent} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
