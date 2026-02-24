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
        getSupportedBiometricType: jest.fn().mockResolvedValue('FINGERPRINT'),
      },
    },
  });

  // Mock the Platform module
  Object.defineProperty(ReactNative, 'Platform', {
    value: {
      OS: 'android', // or 'ios' based on your requirement
      Version: 42, // Set a version number that you expect to use in your test
      select: jest.fn(),
    },
  });

  return ReactNative;
});
