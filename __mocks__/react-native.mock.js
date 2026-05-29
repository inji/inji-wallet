jest.mock('react-native', () => {
  const ReactNative = jest.requireActual('react-native');

  // Define NativeModules using Object.defineProperty
  Object.defineProperty(ReactNative, 'NativeModules', {
    value: {
      // Mock the CameraRoll module
      CameraRoll: {
        getPhotos: jest.fn(),
      },
      CameraModule: {
        capturePhoto: jest.fn(),
      },
      LocationModule: {
        getCurrentLocation: jest.fn(),
      },
      SecureKeystore: {
        deviceSupportsHardware: jest.fn(),
      },
      RNSecureKeystoreModule: {
        sign: jest.fn(),
        encryptData: input => (input ? String(input) : 'mockedString'),
        decryptData: input => (input ? String(input) : 'mockedString'),
        deviceSupportsHardware: () => true,
        hasBiometricsEnabled: jest.fn().mockReturnValue(true),
        getAvailableBiometricType: jest.fn().mockResolvedValue('FINGERPRINT'),
      },
      InjiVciClient: {
        addListener: jest.fn(),
        removeListeners: jest.fn(),
      },
      WalletModule: {
        handleDataEvents: jest.fn(),
      },
    },
  });

  // Mock the Platform module
  Object.defineProperty(ReactNative, 'Platform', {
    value: {
      OS: 'android',
      Version: 42,
      select: jest.fn(),
    },
  });

  return ReactNative;
});
