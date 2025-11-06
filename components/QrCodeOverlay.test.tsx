import React from 'react';
import {render} from '@testing-library/react-native';
import {QrCodeOverlay} from './QrCodeOverlay';

// Mock native modules
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.NativeModules.RNPixelpassModule = {
    generateQRData: jest.fn(() => Promise.resolve('mocked-qr-data')),
  };
  RN.NativeModules.RNSecureKeystoreModule = {
    getData: jest.fn(() => Promise.resolve(['key', 'mocked-qr-data'])),
    storeData: jest.fn(() => Promise.resolve()),
  };
  return RN;
});

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
