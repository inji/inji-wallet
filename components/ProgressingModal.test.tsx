import React from 'react';
import {render} from '@testing-library/react-native';
import {ProgressingModal} from './ProgressingModal';

// Mock Modal
jest.mock('./ui/Modal', () => ({
  Modal: ({children}: {children: React.ReactNode}) => <>{children}</>,
}));

// Mock Spinner
jest.mock('react-native-spinkit', () => 'Spinner');

// Mock SvgImage
jest.mock('./ui/svg', () => ({
  SvgImage: {
    ProgressIcon: jest.fn(() => null),
  },
}));

// Mock ui components
jest.mock('./ui', () => ({
  Button: jest.fn(() => null),
  Centered: ({children}: {children: React.ReactNode}) => <>{children}</>,
  Column: ({children}: {children: React.ReactNode}) => <>{children}</>,
  Text: ({children}: {children: React.ReactNode}) => <>{children}</>,
}));

describe('ProgressingModal Component', () => {
  const defaultProps = {
    isVisible: true,
    isHintVisible: false,
    title: 'Processing',
  };

  it('should match snapshot with default props', () => {
    const {toJSON} = render(<ProgressingModal {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with progress spinner', () => {
    const {toJSON} = render(
      <ProgressingModal {...defaultProps} progress={true} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with hint visible', () => {
    const {toJSON} = render(
      <ProgressingModal
        {...defaultProps}
        isHintVisible={true}
        hint="Please wait..."
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with retry button', () => {
    const {toJSON} = render(
      <ProgressingModal
        {...defaultProps}
        isHintVisible={true}
        hint="Connection failed"
        onRetry={jest.fn()}
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with stay in progress button', () => {
    const {toJSON} = render(
      <ProgressingModal
        {...defaultProps}
        isHintVisible={true}
        hint="Taking longer than expected"
        onStayInProgress={jest.fn()}
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with BLE error visible', () => {
    const {toJSON} = render(
      <ProgressingModal
        {...defaultProps}
        isHintVisible={true}
        isBleErrorVisible={true}
        hint="Bluetooth error occurred"
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot as requester', () => {
    const {toJSON} = render(
      <ProgressingModal {...defaultProps} requester={true} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
