import React from 'react';
import {render} from '@testing-library/react-native';
import {MessageOverlay, ErrorMessageOverlay} from './MessageOverlay';
import {Text} from 'react-native';

// Mock react-native-elements
jest.mock('react-native-elements', () => ({
  Overlay: ({children}: {children: React.ReactNode}) => <>{children}</>,
  LinearProgress: jest.fn(() => null),
}));

// Mock ui components
jest.mock('./ui', () => ({
  Button: jest.fn(() => null),
  Column: ({children}: {children: React.ReactNode}) => <>{children}</>,
  Text: ({children}: {children: React.ReactNode}) => <>{children}</>,
}));

describe('MessageOverlay Component', () => {
  const defaultProps = {
    isVisible: true,
    title: 'Test Title',
    message: 'Test Message',
  };

  it('should match snapshot with title and message', () => {
    const {toJSON} = render(<MessageOverlay {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with progress indicator', () => {
    const {toJSON} = render(
      <MessageOverlay {...defaultProps} progress={true} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with numeric progress', () => {
    const {toJSON} = render(
      <MessageOverlay {...defaultProps} progress={0.75} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with button', () => {
    const {toJSON} = render(
      <MessageOverlay
        {...defaultProps}
        buttonText="OK"
        onButtonPress={jest.fn()}
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with custom children', () => {
    const {toJSON} = render(
      <MessageOverlay {...defaultProps}>
        <Text>Custom Content</Text>
      </MessageOverlay>,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with hint text', () => {
    const {toJSON} = render(
      <MessageOverlay {...defaultProps} hint="This is a hint" />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with custom minHeight', () => {
    const {toJSON} = render(
      <MessageOverlay {...defaultProps} minHeight={250} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});

describe('ErrorMessageOverlay Component', () => {
  const errorProps = {
    isVisible: true,
    error: 'network',
    translationPath: 'errors',
    onDismiss: jest.fn(),
  };

  it('should match snapshot with error', () => {
    const {toJSON} = render(<ErrorMessageOverlay {...errorProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with testID', () => {
    const {toJSON} = render(
      <ErrorMessageOverlay {...errorProps} testID="errorOverlay" />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
