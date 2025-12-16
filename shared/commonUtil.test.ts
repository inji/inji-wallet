import testIDProps, {
  bytesToMB,
  faceMatchConfig,
  generateBackupEncryptionKey,
  generateRandomString,
  getBackupFileName,
  getDriveName,
  getMaskedText,
  hashData,
  logState,
  removeWhiteSpace,
  sleep,
  getRandomInt,
  getMosipIdentifier,
  isTranslationKeyFound,
  getAccountType,
  BYTES_IN_MEGABYTE,
} from './commonUtil';
import {useScreenHeight} from './hooks/useScreenHeight';
import {
  argon2iConfig,
  GOOGLE_DRIVE_NAME,
  ICLOUD_DRIVE_NAME,
  GMAIL,
  APPLE,
} from './constants';
import {CredentialSubject} from '../machines/VerifiableCredential/VCMetaMachine/vc.d';
import {renderHook} from '@testing-library/react-native';

describe('hashData', () => {
  it('should expose a function', () => {
    expect(hashData).toBeDefined();
  });

  it('hashData should return hashed string', async () => {
    const hashedData = await hashData('1234567890', '1600', argon2iConfig);
    expect(hashedData).toBe('mockedRawHashValue');
  });
});

describe('generateRandomString', () => {
  it('should expose a function', () => {
    expect(generateRandomString).toBeDefined();
  });

  it('generateRandomString should return random string', async () => {
    const RandomString = await generateRandomString();
    expect(typeof RandomString).toBe('string');
  });
});

describe('generateBackupEncryptionKey', () => {
  it('should expose a function', () => {
    expect(generateBackupEncryptionKey).toBeDefined();
  });

  it('generateBackupEncryptionKey should return Encrypted key', async () => {
    const BackupEncryptionKey = generateBackupEncryptionKey(
      '1234567890',
      '123445',
      5,
      16,
    );
    expect(typeof BackupEncryptionKey).toBe('string');
  });
});

describe('testIDProps', () => {
  it('should expose a function', () => {
    expect(testIDProps).toBeDefined();
  });

  it('testIDProps should return object with testID ', () => {
    const id = 'unitTest';
    const testID = testIDProps(id);
    expect(typeof testID).toBe('object');
  });
});

describe('removeWhiteSpace', () => {
  it('should expose a function', () => {
    expect(removeWhiteSpace).toBeDefined();
  });

  it('removeWhiteSpace should return string with out white space', () => {
    const response = removeWhiteSpace('React Native Unit Testing');
    expect(response).toBe('ReactNativeUnitTesting');
  });

  it('should handle empty string', () => {
    expect(removeWhiteSpace('')).toBe('');
  });

  it('should handle string with only spaces', () => {
    expect(removeWhiteSpace('    ')).toBe('');
  });

  it('should handle string with tabs and newlines', () => {
    expect(removeWhiteSpace('Hello\tWorld\n')).toBe('HelloWorld');
  });

  it('should handle string with multiple types of whitespace', () => {
    expect(removeWhiteSpace('  Test  \t  String  \n  ')).toBe('TestString');
  });

  it('should remove all whitespace from string', () => {
    const result = removeWhiteSpace('Hello World Test');
    expect(result).toBe('HelloWorldTest');
  });
});

describe('logState', () => {
  it('should expose a function', () => {
    expect(logState).toBeDefined();
  });

  // it('logState should return expected output', () => {
  //   const retValue = logState(state);
  //   expect(retValue).toBe(String);
  // });
});

describe('getMaskedText', () => {
  it('should expose a function', () => {
    expect(getMaskedText).toBeDefined();
  });

  it('getMaskedText should return MaskedText', () => {
    const id = '1234567890';
    const maskedTxt = getMaskedText(id);
    expect(maskedTxt).toBe('******7890');
  });

  it('should handle exactly 4 characters', () => {
    expect(getMaskedText('1234')).toBe('1234');
  });

  it('should handle long strings', () => {
    const longString = '12345678901234567890';
    const masked = getMaskedText(longString);
    expect(masked.endsWith('7890')).toBe(true);
    expect(masked.length).toBe(longString.length);
  });

  it('should handle short strings', () => {
    const result = getMaskedText('ABCDEF');
    expect(result).toBe('**CDEF');
  });

  it('should handle exactly 4 characters (ABCD)', () => {
    const result = getMaskedText('ABCD');
    expect(result).toBe('ABCD');
  });
});

describe('getBackupFileName', () => {
  it('should expose a function', () => {
    expect(getBackupFileName()).toMatch('backup_');
  });
});

describe('getDriveName', () => {
  it('should expose a function', () => {
    expect(getDriveName).toBeDefined();
  });

  it('should return a string', () => {
    const result = getDriveName();
    expect(typeof result).toBe('string');
  });

  it('should return Google Drive for Android or iCloud for iOS', () => {
    const result = getDriveName();
    expect([GOOGLE_DRIVE_NAME, ICLOUD_DRIVE_NAME]).toContain(result);
  });
});

describe('sleep : The promise resolves after a certain time', () => {
  it('should expose a function', () => {
    expect(sleep).toBeDefined();
  });

  it('Should resolve after a certain time', () => {
    const time = 100;
    const promise = sleep(time);
    expect(promise).toBeInstanceOf(Promise);
  });

  it('should delay for specified milliseconds', async () => {
    const start = Date.now();
    await sleep(100);
    const end = Date.now();
    const elapsed = end - start;
    expect(elapsed).toBeGreaterThanOrEqual(90); // Allow small margin
  });

  it('should resolve after timeout', async () => {
    const promise = sleep(50);
    await expect(promise).resolves.toBeUndefined();
  });
});

describe('useScreenHeight', () => {
  it('should expose a function', () => {
    expect(useScreenHeight).toBeDefined();
  });

  it('useScreenHeight should return screen height', () => {
    const {result} = renderHook(() => useScreenHeight());
    expect(typeof result.current).toBe('object');
  });

  it('should return a value', () => {
    const {result} = renderHook(() => useScreenHeight());
    expect(result.current).toBeDefined();
  });
});

describe('getRandomInt', () => {
  it('should expose a function', () => {
    expect(getRandomInt).toBeDefined();
  });

  it('should return a number within the specified range', () => {
    const min = 1;
    const max = 10;
    const result = getRandomInt(min, max);
    expect(result).toBeGreaterThanOrEqual(min);
    expect(result).toBeLessThanOrEqual(max);
    expect(Number.isInteger(result)).toBe(true);
  });

  it('should return min when min and max are equal', () => {
    const value = 5;
    const result = getRandomInt(value, value);
    expect(result).toBe(value);
  });

  it('should handle negative ranges', () => {
    const result = getRandomInt(-10, -1);
    expect(result).toBeGreaterThanOrEqual(-10);
    expect(result).toBeLessThanOrEqual(-1);
  });

  it('should handle larger ranges', () => {
    const result = getRandomInt(100, 200);
    expect(result).toBeGreaterThanOrEqual(100);
    expect(result).toBeLessThanOrEqual(200);
  });
});

describe('getMosipIdentifier', () => {
  it('should expose a function', () => {
    expect(getMosipIdentifier).toBeDefined();
  });

  it('should return UIN when UIN is present', () => {
    const credentialSubject = {
      UIN: '123456789',
      VID: '987654321',
    } as Partial<CredentialSubject>;
    const result = getMosipIdentifier(credentialSubject as CredentialSubject);
    expect(result).toBe('123456789');
  });

  it('should return VID when UIN is not present', () => {
    const credentialSubject = {VID: '987654321'} as Partial<CredentialSubject>;
    const result = getMosipIdentifier(credentialSubject as CredentialSubject);
    expect(result).toBe('987654321');
  });

  it('should return undefined when neither UIN nor VID is present', () => {
    const credentialSubject = {} as Partial<CredentialSubject>;
    const result = getMosipIdentifier(credentialSubject as CredentialSubject);
    expect(result).toBeUndefined();
  });

  it('should prioritize UIN over VID', () => {
    const credSubject = {
      UIN: '1111111111',
      VID: '2222222222',
    } as CredentialSubject;
    expect(getMosipIdentifier(credSubject)).toBe('1111111111');
  });
});

describe('isTranslationKeyFound', () => {
  it('should expose a function', () => {
    expect(isTranslationKeyFound).toBeDefined();
  });

  it('should return true when translation key is found', () => {
    const mockT = jest.fn(() => 'Translated text');
    const result = isTranslationKeyFound('someKey', mockT);
    expect(result).toBe(true);
  });

  it('should return false when translation key is not found', () => {
    const mockT = jest.fn((key: string) => key);
    const result = isTranslationKeyFound('someKey', mockT);
    expect(result).toBe(false);
  });

  it('should return true when key is translated', () => {
    const mockT = () => 'Translated value';
    expect(isTranslationKeyFound('any.key', mockT)).toBe(true);
  });

  it('should return false when translation key not found', () => {
    const mockT = (key: string) => key; // returns same key
    expect(isTranslationKeyFound('some.unknown.key', mockT)).toBe(false);
  });

  it('should return true for errors.notFound key when translation is found', () => {
    const mockT = (key: string) => {
      if (key === 'errors.notFound') return 'Error Not Found';
      return key;
    };
    expect(isTranslationKeyFound('errors.notFound', mockT)).toBe(true);
  });
});

describe('getAccountType', () => {
  it('should expose a function', () => {
    expect(getAccountType).toBeDefined();
  });

  it('should return a string', () => {
    const result = getAccountType();
    expect(typeof result).toBe('string');
  });

  it('should return Gmail for Android or Apple for iOS', () => {
    const result = getAccountType();
    expect([GMAIL, APPLE]).toContain(result);
  });
});

describe('faceMatchConfig', () => {
  it('should expose a function', () => {
    expect(faceMatchConfig).toBeDefined();
  });

  it('should return a valid configuration object', () => {
    const config = faceMatchConfig();
    expect(config).toBeDefined();
    expect(config.withFace).toBeDefined();
    expect(config.withFace.encoder).toBeDefined();
    expect(config.withFace.matcher).toBeDefined();
    expect(config.withFace.encoder.tfModel).toBeDefined();
    expect(config.withFace.matcher.threshold).toBe(1);
  });

  it('should return config with correct structure', () => {
    const config = faceMatchConfig();
    expect(config).toHaveProperty('withFace');
    expect(config.withFace).toHaveProperty('encoder');
    expect(config.withFace).toHaveProperty('matcher');
    expect(config.withFace.encoder.tfModel).toHaveProperty('path');
    expect(config.withFace.encoder.tfModel).toHaveProperty('modelChecksum');
    expect(config.withFace.matcher.threshold).toBe(1);
  });
});

describe('BYTES_IN_MEGABYTE', () => {
  it('should be defined', () => {
    expect(BYTES_IN_MEGABYTE).toBeDefined();
  });

  it('should equal 1,000,000', () => {
    expect(BYTES_IN_MEGABYTE).toBe(1000000);
  });

  it('should be 1000 * 1000', () => {
    expect(BYTES_IN_MEGABYTE).toBe(1000 * 1000);
  });

  it('should be a number', () => {
    expect(typeof BYTES_IN_MEGABYTE).toBe('number');
  });

  it('should be positive', () => {
    expect(BYTES_IN_MEGABYTE).toBeGreaterThan(0);
  });
});

describe('bytesToMB', () => {
  it('bytesToMB returns a string', () => {
    expect(bytesToMB(0)).toBe('0');
  });

  it('10^6 bytes is 1MB', () => {
    expect(bytesToMB(1e6)).toBe('1.000');
  });

  it('should return "0" for negative bytes', () => {
    expect(bytesToMB(-100)).toBe('0');
  });

  it('should convert 1,000,000 bytes to "1.000" MB', () => {
    expect(bytesToMB(1000000)).toBe('1.000');
  });

  it('should convert 2,500,000 bytes to "2.500" MB', () => {
    expect(bytesToMB(2500000)).toBe('2.500');
  });

  it('should convert 500,000 bytes to "0.500" MB', () => {
    expect(bytesToMB(500000)).toBe('0.500');
  });

  it('should handle large byte values', () => {
    expect(bytesToMB(10000000)).toBe('10.000');
  });

  it('should handle small byte values', () => {
    expect(bytesToMB(1000)).toBe('0.001');
  });

  it('should return three decimal places', () => {
    const result = bytesToMB(1234567);
    expect(result).toMatch(/^\d+\.\d{3}$/);
  });

  it('should handle fractional megabytes', () => {
    expect(bytesToMB(1234567)).toBe('1.235');
  });

  it('should handle very small values', () => {
    expect(bytesToMB(100)).toBe('0.000');
  });

  it('should handle exactly one byte', () => {
    expect(bytesToMB(1)).toBe('0.000');
  });

  it('should convert bytes to megabytes', () => {
    const bytes = BYTES_IN_MEGABYTE * 5; // 5 MB
    const result = bytesToMB(bytes);
    expect(result).toBe('5.000');
  });

  it('should handle fractional megabytes with BYTES_IN_MEGABYTE constant', () => {
    const bytes = BYTES_IN_MEGABYTE * 2.5;
    const result = bytesToMB(bytes);
    expect(result).toBe('2.500');
  });
});
