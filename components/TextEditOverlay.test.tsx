import React from 'react';
import {render} from '@testing-library/react-native';
import {TextEditOverlay} from './TextEditOverlay';

// Mock react-native-elements
jest.mock('react-native-elements', () => ({
  Input: jest.fn(() => null),
}));

// Mock ui components
jest.mock('./ui', () => ({
  Button: jest.fn(() => null),
  Centered: ({children}: {children: React.ReactNode}) => <>{children}</>,
  Column: ({children}: {children: React.ReactNode}) => <>{children}</>,
  Row: ({children}: {children: React.ReactNode}) => <>{children}</>,
  Text: ({children}: {children: React.ReactNode}) => <>{children}</>,
}));

describe('TextEditOverlay Component', () => {
  const defaultProps = {
    isVisible: true,
    label: 'Edit Name',
    value: 'John Doe',
    onSave: jest.fn(),
    onDismiss: jest.fn(),
  };

  it('should match snapshot with default props', () => {
    const {toJSON} = render(<TextEditOverlay {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with different label', () => {
    const {toJSON} = render(
      <TextEditOverlay {...defaultProps} label="Edit Email" />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with maxLength', () => {
    const {toJSON} = render(
      <TextEditOverlay {...defaultProps} maxLength={50} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with empty value', () => {
    const {toJSON} = render(<TextEditOverlay {...defaultProps} value="" />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with long value', () => {
    const {toJSON} = render(
      <TextEditOverlay
        {...defaultProps}
        value="This is a very long text value that should be editable"
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
