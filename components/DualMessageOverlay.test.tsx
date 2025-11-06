import React from 'react';
import {render} from '@testing-library/react-native';
import {DualMessageOverlay} from './DualMessageOverlay';
import {Text} from 'react-native';

// Mock react-native-elements
jest.mock('react-native-elements', () => ({
  Overlay: ({children}: {children: React.ReactNode}) => <>{children}</>,
  Button: jest.fn(({title}) => <>{title}</>),
}));

// Mock ui components
jest.mock('./ui', () => ({
  Button: jest.fn(
    ({title, children}: {title?: string; children?: React.ReactNode}) => (
      <>{title || children}</>
    ),
  ),
  Column: ({children}: {children: React.ReactNode}) => <>{children}</>,
  Row: ({children}: {children: React.ReactNode}) => <>{children}</>,
  Text: ({children}: {children: React.ReactNode}) => <>{children}</>,
}));

describe('DualMessageOverlay Component', () => {
  const defaultProps = {
    isVisible: true,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
  };

  it('should match snapshot with title and message', () => {
    const {toJSON} = render(<DualMessageOverlay {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with both buttons', () => {
    const {toJSON} = render(
      <DualMessageOverlay
        {...defaultProps}
        onTryAgain={jest.fn()}
        onIgnore={jest.fn()}
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with only try again button', () => {
    const {toJSON} = render(
      <DualMessageOverlay {...defaultProps} onTryAgain={jest.fn()} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with only ignore button', () => {
    const {toJSON} = render(
      <DualMessageOverlay {...defaultProps} onIgnore={jest.fn()} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with hint text', () => {
    const {toJSON} = render(
      <DualMessageOverlay {...defaultProps} hint="Additional information" />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with custom height', () => {
    const {toJSON} = render(
      <DualMessageOverlay {...defaultProps} customHeight={300} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with children', () => {
    const {toJSON} = render(
      <DualMessageOverlay {...defaultProps}>
        <Text>Custom content here</Text>
      </DualMessageOverlay>,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
