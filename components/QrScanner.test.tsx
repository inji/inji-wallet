import React from 'react';
import {render} from '@testing-library/react-native';
import {QrScanner} from './QrScanner';

// Mock useContext
const mockUseContext = jest.fn();
jest.spyOn(React, 'useContext').mockImplementation(mockUseContext);

// Mock GlobalContext
jest.mock('../shared/GlobalContext', () => ({
  GlobalContext: {},
}));

// Mock xstate with a mutable mock function
const mockUseSelector = jest.fn();
jest.mock('@xstate/react', () => ({
  useSelector: jest.fn((...args) => mockUseSelector(...args)),
}));

// Before each test, set up the context mock
beforeEach(() => {
  mockUseContext.mockReturnValue({
    appService: {send: jest.fn()},
  });
  mockUseSelector.mockReturnValue(true);
});

// Mock app machine
jest.mock('../machines/app', () => ({
  selectIsActive: jest.fn(),
}));

// Mock SvgImage
jest.mock('./ui/svg', () => ({
  SvgImage: {
    FlipCameraIcon: jest.fn(() => null),
  },
}));

// Mock ui components
jest.mock('./ui', () => ({
  Column: ({children}: {children: React.ReactNode}) => <>{children}</>,
  Row: ({children}: {children: React.ReactNode}) => <>{children}</>,
  Text: ({children}: {children: React.ReactNode}) => <>{children}</>,
}));

// Mock expo-camera
jest.mock('expo-camera', () => ({
  CameraView: jest.fn(() => null),
  useCameraPermissions: jest.fn(() => [
    null,
    jest.fn(() => Promise.resolve({granted: true})),
    jest.fn(() => Promise.resolve({status: 'granted'})),
  ]),
  PermissionStatus: {
    UNDETERMINED: 'undetermined',
    GRANTED: 'granted',
    DENIED: 'denied',
  },
  CameraType: {
    BACK: 'back',
    FRONT: 'front',
  },
}));

describe('QrScanner Component', () => {
  const defaultProps = {
    onQrFound: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should match snapshot with default props', () => {
    const {toJSON} = render(<QrScanner {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with title', () => {
    const {toJSON} = render(
      <QrScanner {...defaultProps} title="Hold phone steady to scan QR code" />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with custom title', () => {
    const {toJSON} = render(
      <QrScanner {...defaultProps} title="Scan QR code to share credentials" />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with onQrFound callback', () => {
    const onQrFound = jest.fn();
    const {toJSON} = render(<QrScanner onQrFound={onQrFound} />);
    expect(toJSON()).toBeTruthy();
    expect(onQrFound).not.toHaveBeenCalled(); // Callback not called until QR is scanned
  });

  it('should render when isActive is false', () => {
    mockUseSelector.mockReturnValue(false);
    const {toJSON} = render(<QrScanner {...defaultProps} />);
    expect(toJSON()).toBeTruthy();
  });
});
