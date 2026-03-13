import {NativeModules, Platform} from 'react-native';
import {
  getAvailableBiometricType,
  getBiometricLabel,
  getBiometricTranslationSuffix,
  getBiometricCategory,
  useBiometricType,
  BiometricType,
} from './useBiometricType';

const {RNSecureKeystoreModule} = NativeModules;

describe('getAvailableBiometricType', () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    jest.restoreAllMocks();
    (Platform as any).OS = originalOS;
  });

  describe('iOS (adaptive detection)', () => {
    beforeEach(() => {
      (Platform as any).OS = 'ios';
    });

    it('returns FACE when native module returns FACE', async () => {
      RNSecureKeystoreModule.getAvailableBiometricType = jest
        .fn()
        .mockResolvedValue('FACE');
      const result = await getAvailableBiometricType();
      expect(result).toBe('FACE');
    });

    it('returns FINGERPRINT when native module returns FINGERPRINT', async () => {
      RNSecureKeystoreModule.getAvailableBiometricType = jest
        .fn()
        .mockResolvedValue('FINGERPRINT');
      const result = await getAvailableBiometricType();
      expect(result).toBe('FINGERPRINT');
    });

    it('returns NONE when native module returns unknown value BOTH', async () => {
      RNSecureKeystoreModule.getAvailableBiometricType = jest
        .fn()
        .mockResolvedValue('BOTH');
      const result = await getAvailableBiometricType();
      expect(result).toBe('NONE');
    });

    it('returns NONE when native module returns NONE', async () => {
      RNSecureKeystoreModule.getAvailableBiometricType = jest
        .fn()
        .mockResolvedValue('NONE');
      const result = await getAvailableBiometricType();
      expect(result).toBe('NONE');
    });

    it('returns NONE for unknown/unexpected native values', async () => {
      RNSecureKeystoreModule.getAvailableBiometricType = jest
        .fn()
        .mockResolvedValue('IRIS');
      const result = await getAvailableBiometricType();
      expect(result).toBe('NONE');
    });

    it('returns NONE when native value is null', async () => {
      RNSecureKeystoreModule.getAvailableBiometricType = jest
        .fn()
        .mockResolvedValue(null);
      const result = await getAvailableBiometricType();
      expect(result).toBe('NONE');
    });

    it('returns NONE when native value is undefined', async () => {
      RNSecureKeystoreModule.getAvailableBiometricType = jest
        .fn()
        .mockResolvedValue(undefined);
      const result = await getAvailableBiometricType();
      expect(result).toBe('NONE');
    });

    it('returns NONE when native module throws an error', async () => {
      RNSecureKeystoreModule.getAvailableBiometricType = jest
        .fn()
        .mockRejectedValue(new Error('Module not available'));
      const result = await getAvailableBiometricType();
      expect(result).toBe('NONE');
    });

    it('returns NONE when native module is missing (undefined method)', async () => {
      const original = RNSecureKeystoreModule.getAvailableBiometricType;
      RNSecureKeystoreModule.getAvailableBiometricType = undefined;
      try {
        const result = await getAvailableBiometricType();
        expect(result).toBe('NONE');
      } finally {
        RNSecureKeystoreModule.getAvailableBiometricType = original;
      }
    });
  });

  describe('Android (no adaptive detection)', () => {
    beforeEach(() => {
      (Platform as any).OS = 'android';
    });

    it('always returns FINGERPRINT regardless of native module value', async () => {
      RNSecureKeystoreModule.getAvailableBiometricType = jest
        .fn()
        .mockResolvedValue('FACE');
      const result = await getAvailableBiometricType();
      expect(result).toBe('FINGERPRINT');
    });

    it('returns FINGERPRINT even if native module returns unknown value', async () => {
      RNSecureKeystoreModule.getAvailableBiometricType = jest
        .fn()
        .mockResolvedValue('BOTH');
      const result = await getAvailableBiometricType();
      expect(result).toBe('FINGERPRINT');
    });

    it('returns FINGERPRINT even if native module returns NONE', async () => {
      RNSecureKeystoreModule.getAvailableBiometricType = jest
        .fn()
        .mockResolvedValue('NONE');
      const result = await getAvailableBiometricType();
      expect(result).toBe('FINGERPRINT');
    });

    it('does not call native module on Android', async () => {
      const mockFn = jest.fn().mockResolvedValue('FACE');
      RNSecureKeystoreModule.getAvailableBiometricType = mockFn;
      await getAvailableBiometricType();
      expect(mockFn).not.toHaveBeenCalled();
    });
  });
});

describe('getBiometricLabel', () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    (Platform as any).OS = originalOS;
  });

  describe('iOS', () => {
    beforeEach(() => {
      (Platform as any).OS = 'ios';
    });

    it('returns "Face ID" for FACE', () => {
      expect(getBiometricLabel('FACE')).toBe('Face ID');
    });

    it('returns "Biometrics" for unknown type BOTH', () => {
      expect(getBiometricLabel('BOTH' as any)).toBe('Biometrics');
    });

    it('returns "Touch ID" for FINGERPRINT', () => {
      expect(getBiometricLabel('FINGERPRINT')).toBe('Touch ID');
    });

    it('returns "Biometrics" for NONE', () => {
      expect(getBiometricLabel('NONE')).toBe('Biometrics');
    });
  });

  describe('Android (always generic)', () => {
    beforeEach(() => {
      (Platform as any).OS = 'android';
    });

    it('returns "Biometrics" for FACE', () => {
      expect(getBiometricLabel('FACE')).toBe('Biometrics');
    });

    it('returns "Biometrics" for unknown type BOTH', () => {
      expect(getBiometricLabel('BOTH' as any)).toBe('Biometrics');
    });

    it('returns "Biometrics" for FINGERPRINT', () => {
      expect(getBiometricLabel('FINGERPRINT')).toBe('Biometrics');
    });

    it('returns "Biometrics" for NONE', () => {
      expect(getBiometricLabel('NONE')).toBe('Biometrics');
    });
  });
});

describe('getBiometricTranslationSuffix', () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    (Platform as any).OS = originalOS;
  });

  describe('iOS', () => {
    beforeEach(() => {
      (Platform as any).OS = 'ios';
    });

    it('returns "FaceId" for FACE', () => {
      expect(getBiometricTranslationSuffix('FACE')).toBe('FaceId');
    });

    it('returns "Biometrics" for unknown type BOTH', () => {
      expect(getBiometricTranslationSuffix('BOTH' as any)).toBe('Biometrics');
    });

    it('returns "TouchId" for FINGERPRINT', () => {
      expect(getBiometricTranslationSuffix('FINGERPRINT')).toBe('TouchId');
    });

    it('returns "Biometrics" for NONE', () => {
      expect(getBiometricTranslationSuffix('NONE')).toBe('Biometrics');
    });
  });

  describe('Android (always generic)', () => {
    beforeEach(() => {
      (Platform as any).OS = 'android';
    });

    it('returns "Biometrics" for FACE', () => {
      expect(getBiometricTranslationSuffix('FACE')).toBe('Biometrics');
    });

    it('returns "Biometrics" for unknown type BOTH', () => {
      expect(getBiometricTranslationSuffix('BOTH' as any)).toBe('Biometrics');
    });

    it('returns "Biometrics" for FINGERPRINT', () => {
      expect(getBiometricTranslationSuffix('FINGERPRINT')).toBe('Biometrics');
    });

    it('returns "Biometrics" for NONE', () => {
      expect(getBiometricTranslationSuffix('NONE')).toBe('Biometrics');
    });
  });
});

describe('getBiometricCategory', () => {
  it('returns "face" for FACE', () => {
    expect(getBiometricCategory(BiometricType.FACE)).toBe('face');
  });

  it('returns "fingerprint" for FINGERPRINT', () => {
    expect(getBiometricCategory(BiometricType.FINGERPRINT)).toBe('fingerprint');
  });

  it('returns "none" for NONE', () => {
    expect(getBiometricCategory(BiometricType.NONE)).toBe('none');
  });

  it('returns "none" for unknown values', () => {
    expect(getBiometricCategory('UNKNOWN' as any)).toBe('none');
  });
});

describe('useBiometricType hook return shape', () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    jest.restoreAllMocks();
    (Platform as any).OS = originalOS;
  });

  it('Android FINGERPRINT maps to correct label, suffix, category', async () => {
    (Platform as any).OS = 'android';
    const type = await getAvailableBiometricType();
    expect(type).toBe(BiometricType.FINGERPRINT);
    expect(getBiometricLabel(type)).toBe('Biometrics');
    expect(getBiometricTranslationSuffix(type)).toBe('Biometrics');
    expect(getBiometricCategory(type)).toBe('fingerprint');
  });

  it('iOS FACE maps to Face ID label, FaceId suffix, face category', async () => {
    (Platform as any).OS = 'ios';
    RNSecureKeystoreModule.getAvailableBiometricType = jest
      .fn()
      .mockResolvedValue('FACE');
    const type = await getAvailableBiometricType();
    expect(type).toBe(BiometricType.FACE);
    expect(getBiometricLabel(type)).toBe('Face ID');
    expect(getBiometricTranslationSuffix(type)).toBe('FaceId');
    expect(getBiometricCategory(type)).toBe('face');
  });

  it('iOS error falls back to NONE with Biometrics and none category', async () => {
    (Platform as any).OS = 'ios';
    RNSecureKeystoreModule.getAvailableBiometricType = jest
      .fn()
      .mockRejectedValue(new Error('fail'));
    const type = await getAvailableBiometricType();
    expect(type).toBe(BiometricType.NONE);
    expect(getBiometricLabel(type)).toBe('Biometrics');
    expect(getBiometricTranslationSuffix(type)).toBe('Biometrics');
    expect(getBiometricCategory(type)).toBe('none');
  });

  it('useBiometricType is exported as a function', () => {
    expect(typeof useBiometricType).toBe('function');
  });
});

describe('useBiometricType end-to-end integration', () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    jest.restoreAllMocks();
    (Platform as any).OS = originalOS;
  });

  it('iOS FACE: getAvailableBiometricType maps to correct label, suffix, category', async () => {
    (Platform as any).OS = 'ios';
    RNSecureKeystoreModule.getAvailableBiometricType = jest
      .fn()
      .mockResolvedValue('FACE');

    const type = await getAvailableBiometricType();
    expect(type).toBe('FACE');
    expect(getBiometricLabel(type)).toBe('Face ID');
    expect(getBiometricTranslationSuffix(type)).toBe('FaceId');
    expect(getBiometricCategory(type)).toBe('face');
  });

  it('iOS FINGERPRINT: maps to Touch ID', async () => {
    (Platform as any).OS = 'ios';
    RNSecureKeystoreModule.getAvailableBiometricType = jest
      .fn()
      .mockResolvedValue('FINGERPRINT');

    const type = await getAvailableBiometricType();
    expect(type).toBe('FINGERPRINT');
    expect(getBiometricLabel(type)).toBe('Touch ID');
    expect(getBiometricTranslationSuffix(type)).toBe('TouchId');
    expect(getBiometricCategory(type)).toBe('fingerprint');
  });

  it('Android always returns FINGERPRINT with Biometrics label', async () => {
    (Platform as any).OS = 'android';
    RNSecureKeystoreModule.getAvailableBiometricType = jest
      .fn()
      .mockResolvedValue('FACE');

    const type = await getAvailableBiometricType();
    expect(type).toBe('FINGERPRINT');
    expect(getBiometricLabel(type)).toBe('Biometrics');
    expect(getBiometricTranslationSuffix(type)).toBe('Biometrics');
    expect(getBiometricCategory(type)).toBe('fingerprint');
  });

  it('iOS error falls back to NONE with Biometrics label', async () => {
    (Platform as any).OS = 'ios';
    RNSecureKeystoreModule.getAvailableBiometricType = jest
      .fn()
      .mockRejectedValue(new Error('unavailable'));

    const type = await getAvailableBiometricType();
    expect(type).toBe('NONE');
    expect(getBiometricLabel(type)).toBe('Biometrics');
    expect(getBiometricTranslationSuffix(type)).toBe('Biometrics');
    expect(getBiometricCategory(type)).toBe('none');
  });
});
