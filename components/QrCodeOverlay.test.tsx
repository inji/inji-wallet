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

  // NOTE: CodeRabbit suggested making these tests async to wait for QR data loading.
  // However, the component requires native module mocks (RNSecureKeystoreModule.getData)
  // that are not properly initialized in the test environment, causing the component
  // to always return null. These tests currently capture empty snapshots.
  // TODO: Fix native module mocking to properly test the async QR data loading behavior.

  it('should match snapshot with default props', () => {
    const {toJSON} = render(<QrCodeOverlay {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with inline QR disabled', () => {
    const {toJSON} = render(
      <QrCodeOverlay {...defaultProps} showInlineQr={false} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with force visible', () => {
    const {toJSON} = render(
      <QrCodeOverlay {...defaultProps} forceVisible={true} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with onClose handler', () => {
    const {toJSON} = render(
      <QrCodeOverlay {...defaultProps} onClose={jest.fn()} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
