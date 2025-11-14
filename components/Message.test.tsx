import React from 'react';
import {render} from '@testing-library/react-native';
import {Message} from './Message';

// Mock LinearProgress
jest.mock('react-native-elements', () => ({
  LinearProgress: jest.fn(() => null),
}));

// Mock Button from ui
jest.mock('./ui', () => ({
  Button: jest.fn(() => null),
  Centered: ({children}: {children: React.ReactNode}) => <>{children}</>,
  Column: ({children}: {children: React.ReactNode}) => <>{children}</>,
  Text: ({children}: {children: React.ReactNode}) => <>{children}</>,
}));

describe('Message Component', () => {
  it('should match snapshot with title only', () => {
    const {toJSON} = render(<Message title="Test Title" />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with message only', () => {
    const {toJSON} = render(<Message message="Test Message" />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with title and message', () => {
    const {toJSON} = render(<Message title="Title" message="Message" />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with hint text', () => {
    const {toJSON} = render(<Message message="Test" hint="Hint text" />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with cancel button', () => {
    const {toJSON} = render(<Message message="Test" onCancel={jest.fn()} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
