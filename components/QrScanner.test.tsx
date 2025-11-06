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

// Before each test, set up the context mock
beforeEach(() => {
  mockUseContext.mockReturnValue({
    appService: {send: jest.fn()},
  });
});

// Mock xstate
jest.mock('@xstate/react', () => ({
  useSelector: jest.fn(() => true),
}));

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
  useCameraPermissions: jest.fn(() => [null, jest.fn(), jest.fn()]),
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
});
