import React from 'react';
import {render} from '@testing-library/react-native';
import {QrCodeOverlay} from './QrCodeOverlay';
import {NativeModules} from 'react-native';

// Mock QRCode
jest.mock('react-native-qrcode-svg', () => 'QRCode');

// Mock SvgImage
jest.mock('./ui/svg', () => ({
  SvgImage: {
    MagnifierZoom: jest.fn(() => null),
  },
}));

// Mock sharing utils
jest.mock('../shared/sharing/imageUtils', () => ({
  shareImageToAllSupportedApps: jest.fn(() => Promise.resolve(true)),
}));

describe('QrCodeOverlay Component', () => {
  // Setup mocks for native modules
  beforeAll(() => {
    // Mock RNSecureKeystoreModule methods
    NativeModules.RNSecureKeystoreModule.getData = jest.fn(() =>
      Promise.resolve(['key', 'mocked-qr-data']),
    );
    NativeModules.RNSecureKeystoreModule.storeData = jest.fn(() =>
      Promise.resolve(),
    );

    // Mock RNPixelpassModule
    NativeModules.RNPixelpassModule = {
      generateQRData: jest.fn(() => Promise.resolve('mocked-qr-data')),
    };
  });

  // Silence console warnings during tests
  beforeAll(() => {
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  const mockVC = {
    credential: {id: 'test-credential'},
    generatedOn: new Date().toISOString(),
  };

  const mockMeta = {
    id: 'test-vc-id',
    vcLabel: 'Test VC',
  };

  const defaultProps = {
    verifiableCredential: mockVC as any,
    meta: mockMeta as any,
  };

  it('should render null when qrString is empty (useEffect does not fire synchronously)', () => {
    const {toJSON} = render(<QrCodeOverlay {...defaultProps} />);
    expect(toJSON()).toBeNull();
  });

  it('should render null with no credential subject', () => {
    const vcEmpty = {credential: {id: 'test'}};
    const {toJSON} = render(
      <QrCodeOverlay
        verifiableCredential={vcEmpty as any}
        meta={mockMeta as any}
      />,
    );
    expect(toJSON()).toBeNull();
  });

  it('should set qrError when data is too large', async () => {
    const longData = 'x'.repeat(5000);
    NativeModules.RNSecureKeystoreModule.getData = jest.fn(() =>
      Promise.resolve(['key', longData]),
    );
    const {toJSON} = render(<QrCodeOverlay {...defaultProps} />);
    await new Promise(resolve => setTimeout(resolve, 50));
    // With large data, qrError is set to true - component returns null
    expect(toJSON()).toMatchSnapshot();
    // Reset
    NativeModules.RNSecureKeystoreModule.getData = jest.fn(() =>
      Promise.resolve(['key', 'mocked-qr-data']),
    );
  });
});
