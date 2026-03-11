jest.unmock('./cryptoUtil');
jest.unmock('../cryptoutil/cryptoUtil');

jest.mock('./signFormatConverter', () => jest.fn(() => 'mockConvertedSig'));

jest.mock('../constants', () => {
  const actual = jest.requireActual('../constants');
  return {
    ...actual,
    isAndroid: jest.fn(() => true),
    isIOS: jest.fn(() => false),
  };
});

jest.mock('react-native-rsa-native', () => ({
  RSA: {
    generateKeys: jest.fn(() =>
      Promise.resolve({public: 'rsaMockPub', private: 'rsaMockPriv'}),
    ),
  },
}));

import {NativeModules} from 'react-native';
import {
  replaceCharactersInB64,
  encodeB64,
  hmacSHA,
  AUTH_TIMEOUT,
  ENCRYPTION_ID,
  HMAC_ALIAS,
  DUMMY_KEY_FOR_BIOMETRIC_ALIAS,
  isHardwareKeystoreExists,
  generateKeyPairECK1,
  generateKeyPair,
  createSignature,
  createSignatureRSA,
  createSignatureECR1,
  createSignatureECK1,
  createSignatureED,
  getJWT,
  fetchKeyPair,
  checkAllKeyPairs,
  generateKeyPairsAndStoreOrder,
  generateKeyPairRSA,
  generateKeyPairECR1,
  generateKeyPairED,
  encryptJson,
  decryptJson,
} from './cryptoUtil';

const {RNSecureKeystoreModule} = NativeModules;

// Setup mocks on RNSecureKeystoreModule that are missing from __mocks__/react-native.mock.js
beforeAll(() => {
  RNSecureKeystoreModule.hasBiometricsEnabled = jest
    .fn()
    .mockResolvedValue(false);
  RNSecureKeystoreModule.generateKeyPair = jest
    .fn()
    .mockResolvedValue('mockPublicKey');
  RNSecureKeystoreModule.storeData = jest.fn().mockResolvedValue(undefined);
  RNSecureKeystoreModule.storeGenericKey = jest
    .fn()
    .mockResolvedValue(undefined);
  RNSecureKeystoreModule.retrieveKey = jest
    .fn()
    .mockResolvedValue('mockPubKey');
  RNSecureKeystoreModule.retrieveGenericKey = jest
    .fn()
    .mockResolvedValue(['mockPriv', 'mockPub']);
});

beforeEach(() => {
  jest.clearAllMocks();
  RNSecureKeystoreModule.hasBiometricsEnabled = jest
    .fn()
    .mockResolvedValue(false);
  RNSecureKeystoreModule.generateKeyPair = jest
    .fn()
    .mockResolvedValue('mockPublicKey');
  RNSecureKeystoreModule.storeData = jest.fn().mockResolvedValue(undefined);
  RNSecureKeystoreModule.storeGenericKey = jest
    .fn()
    .mockResolvedValue(undefined);
  RNSecureKeystoreModule.retrieveKey = jest
    .fn()
    .mockResolvedValue('mockPubKey');
  RNSecureKeystoreModule.retrieveGenericKey = jest
    .fn()
    .mockResolvedValue(['mockPriv', 'mockPub']);
  RNSecureKeystoreModule.sign = jest.fn().mockResolvedValue('mockSig');
});

jest.mock('../openId4VCI/Utils', () => ({
  hasKeyPair: jest.fn().mockResolvedValue(true),
}));

describe('cryptoUtil', () => {
  describe('constants', () => {
    it('AUTH_TIMEOUT is 300 seconds', () => {
      expect(AUTH_TIMEOUT).toBe(300);
    });

    it('ENCRYPTION_ID is correct', () => {
      expect(ENCRYPTION_ID).toBe('c7c22a6c-9759-4605-ac88-46f4041d863k');
    });

    it('HMAC_ALIAS is correct', () => {
      expect(HMAC_ALIAS).toBe('860cc320-4248-11ee-be56-0242ac120002');
    });

    it('DUMMY_KEY_FOR_BIOMETRIC_ALIAS is correct', () => {
      expect(DUMMY_KEY_FOR_BIOMETRIC_ALIAS).toBe(
        '9a6cfc0e-4248-11ee-be56-0242ac120002',
      );
    });

    it('isHardwareKeystoreExists is truthy', () => {
      expect(isHardwareKeystoreExists).toBeTruthy();
    });
  });

  describe('replaceCharactersInB64', () => {
    it('replaces + with -', () => {
      expect(replaceCharactersInB64('abc+def')).toBe('abc-def');
    });

    it('replaces / with _', () => {
      expect(replaceCharactersInB64('abc/def')).toBe('abc_def');
    });

    it('removes trailing =', () => {
      expect(replaceCharactersInB64('abc==')).toBe('abc');
    });

    it('handles all together', () => {
      expect(replaceCharactersInB64('a+b/c==')).toBe('a-b_c');
    });

    it('leaves clean base64 unchanged', () => {
      expect(replaceCharactersInB64('abcdef')).toBe('abcdef');
    });

    it('handles empty string', () => {
      expect(replaceCharactersInB64('')).toBe('');
    });
  });

  describe('encodeB64', () => {
    it('encodes and cleans base64', () => {
      const result = encodeB64('test');
      expect(typeof result).toBe('string');
      expect(result).not.toMatch(/[+/=]/);
    });

    it('encodes empty string', () => {
      expect(typeof encodeB64('')).toBe('string');
    });
  });

  describe('hmacSHA', () => {
    it('generates HMAC string', () => {
      const result = hmacSHA('my-key', 'my-data');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns different for different data', () => {
      expect(hmacSHA('key', 'data1')).not.toBe(hmacSHA('key', 'data2'));
    });

    it('returns same for same inputs', () => {
      expect(hmacSHA('key', 'data')).toBe(hmacSHA('key', 'data'));
    });
  });

  describe('generateKeyPairRSA', () => {
    it('calls RNSecureKeystoreModule on Android with hardware keystore', async () => {
      const result = await generateKeyPairRSA();
      expect(RNSecureKeystoreModule.hasBiometricsEnabled).toHaveBeenCalled();
      expect(RNSecureKeystoreModule.generateKeyPair).toHaveBeenCalled();
      expect(result).toHaveProperty('publicKey');
      expect(result).toHaveProperty('privateKey');
      expect(result.privateKey).toBe('');
    });
  });

  describe('generateKeyPairECK1', () => {
    it('returns base64 key pair', () => {
      const result = generateKeyPairECK1();
      expect(result).toHaveProperty('publicKey');
      expect(result).toHaveProperty('privateKey');
      expect(typeof result.publicKey).toBe('string');
      expect(typeof result.privateKey).toBe('string');
    });
  });

  describe('generateKeyPairECR1', () => {
    it('calls RNSecureKeystoreModule on Android', async () => {
      const result = await generateKeyPairECR1();
      expect(RNSecureKeystoreModule.hasBiometricsEnabled).toHaveBeenCalled();
      expect(RNSecureKeystoreModule.generateKeyPair).toHaveBeenCalled();
      expect(result).toHaveProperty('publicKey');
      expect(result.privateKey).toBe('');
    });
  });

  describe('generateKeyPairED', () => {
    it('returns base64 encoded key pair', async () => {
      const result = await generateKeyPairED();
      expect(result).toHaveProperty('publicKey');
      expect(result).toHaveProperty('privateKey');
      expect(typeof result.publicKey).toBe('string');
      expect(typeof result.privateKey).toBe('string');
    });
  });

  describe('generateKeyPair', () => {
    it('RS256 delegates to generateKeyPairRSA', async () => {
      const result = await generateKeyPair('RS256');
      expect(result).toHaveProperty('publicKey');
    });

    it('ES256 delegates to generateKeyPairECR1', async () => {
      const result = await generateKeyPair('ES256');
      expect(result).toHaveProperty('publicKey');
    });

    it('ES256K delegates to generateKeyPairECK1', async () => {
      const result = await generateKeyPair('ES256K');
      expect(result).toHaveProperty('publicKey');
    });

    it('ED25519 delegates to generateKeyPairED', async () => {
      const result = await generateKeyPair('Ed25519');
      expect(result).toHaveProperty('publicKey');
    });

    it('returns undefined for unknown type', async () => {
      const result = await generateKeyPair('UNKNOWN');
      expect(result).toBeUndefined();
    });
  });

  describe('checkAllKeyPairs', () => {
    it('resolves when all keys present', async () => {
      await expect(checkAllKeyPairs()).resolves.not.toThrow();
    });

    it('throws when a key is missing', async () => {
      const {hasKeyPair} = require('../openId4VCI/Utils');
      hasKeyPair.mockResolvedValueOnce(false);
      await expect(checkAllKeyPairs()).rejects.toThrow();
    });
  });

  describe('generateKeyPairsAndStoreOrder', () => {
    it('generates all key pairs and stores them', async () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation();
      await generateKeyPairsAndStoreOrder();
      expect(RNSecureKeystoreModule.storeData).toHaveBeenCalledWith(
        'keyPreference',
        expect.any(String),
      );
      expect(RNSecureKeystoreModule.storeGenericKey).toHaveBeenCalledTimes(2);
      spy.mockRestore();
    });
  });

  describe('createSignatureRSA', () => {
    it('calls RNSecureKeystoreModule.sign on Android', async () => {
      RNSecureKeystoreModule.sign.mockResolvedValue('mockRSASig');
      const result = await createSignatureRSA('privKey', 'payload');
      expect(RNSecureKeystoreModule.sign).toHaveBeenCalledWith(
        'RS256',
        'RS256',
        'payload',
      );
      expect(typeof result).toBe('string');
    });
  });

  describe('createSignatureECR1', () => {
    it('calls sign and converts DER on Android', async () => {
      RNSecureKeystoreModule.sign.mockResolvedValue('mockDerBase64Sig');
      const result = await createSignatureECR1('privKey', 'payload');
      expect(RNSecureKeystoreModule.sign).toHaveBeenCalled();
      expect(typeof result).toBe('string');
    });
  });

  describe('createSignatureECK1', () => {
    it('signs with secp256k1', async () => {
      const privKey = new Uint8Array(32).fill(5);
      const result = await createSignatureECK1(privKey, 'test-payload');
      expect(typeof result).toBe('string');
    });
  });

  describe('createSignatureED', () => {
    it('signs with ed25519', async () => {
      const privKey = new Uint8Array(32).fill(1);
      const payload = new Uint8Array([116, 101, 115, 116]); // "test"
      const result = await createSignatureED(privKey, payload);
      expect(typeof result).toBe('string');
    });
  });

  describe('createSignature dispatcher', () => {
    it('RS256 calls createSignatureRSA', async () => {
      RNSecureKeystoreModule.sign.mockResolvedValue('mockSig');
      const result = await createSignature('key', 'payload', 'RS256');
      expect(result).toBeDefined();
    });

    it('ES256 calls createSignatureECR1', async () => {
      RNSecureKeystoreModule.sign.mockResolvedValue('mockDerSig');
      const result = await createSignature('key', 'payload', 'ES256');
      expect(result).toBeDefined();
    });

    it('ED25519 calls createSignatureED', async () => {
      const privKey = new Uint8Array(32).fill(1);
      const result = await createSignature(privKey, 'payload', 'Ed25519');
      expect(typeof result).toBe('string');
    });

    it('returns undefined for unknown type', async () => {
      const result = await createSignature('key', 'payload', 'UNKNOWN');
      expect(result).toBeUndefined();
    });
  });

  describe('getJWT', () => {
    it('constructs JWT with header.payload.signature', async () => {
      RNSecureKeystoreModule.sign.mockResolvedValue('mockSig');
      const header = {alg: 'RS256', typ: 'JWT'};
      const payload = {sub: '123', name: 'Test'};
      const result = await getJWT(header, payload, 'alias', 'privKey', 'RS256');
      expect(typeof result).toBe('string');
      expect(result.split('.')).toHaveLength(3);
    });

    it('propagates error on signature failure', async () => {
      RNSecureKeystoreModule.sign.mockRejectedValue(new Error('sign failed'));
      const spy = jest.spyOn(console, 'error').mockImplementation();
      await expect(
        getJWT({alg: 'RS256'}, {sub: '1'}, 'alias', 'key', 'RS256'),
      ).rejects.toThrow('sign failed');
      spy.mockRestore();
    });
  });

  describe('fetchKeyPair', () => {
    it('RS256 on Android calls retrieveKey', async () => {
      RNSecureKeystoreModule.retrieveKey.mockResolvedValue('rsaPubKey');
      const result = await fetchKeyPair('RS256');
      expect(RNSecureKeystoreModule.retrieveKey).toHaveBeenCalledWith('RS256');
      expect(result.publicKey).toBe('rsaPubKey');
      expect(result.privateKey).toBe('');
    });

    it('ES256 on Android calls retrieveKey', async () => {
      RNSecureKeystoreModule.retrieveKey.mockResolvedValue('ecPubKey');
      const result = await fetchKeyPair('ES256');
      expect(result.publicKey).toBe('ecPubKey');
    });

    it('ES256K calls retrieveGenericKey', async () => {
      RNSecureKeystoreModule.retrieveGenericKey.mockResolvedValue([
        'priv',
        'pub',
      ]);
      const result = await fetchKeyPair('ES256K');
      expect(RNSecureKeystoreModule.retrieveGenericKey).toHaveBeenCalledWith(
        'ES256K',
      );
      expect(result.publicKey).toBeDefined();
      expect(result.privateKey).toBeDefined();
    });

    it('ED25519 calls retrieveGenericKey', async () => {
      RNSecureKeystoreModule.retrieveGenericKey.mockResolvedValue([
        'priv',
        'pub',
      ]);
      const result = await fetchKeyPair('ED25519');
      expect(result.publicKey).toBeDefined();
    });

    it('throws on error', async () => {
      RNSecureKeystoreModule.retrieveKey.mockRejectedValue(new Error('fail'));
      const spy = jest.spyOn(console, 'error').mockImplementation();
      await expect(fetchKeyPair('RS256')).rejects.toThrow('fail');
      spy.mockRestore();
    });
  });

  describe('encryptJson', () => {
    it('encrypts with hardware keystore on Android', async () => {
      const result = await encryptJson('key', '{"test":true}');
      expect(typeof result).toBe('string');
    });

    it('handles error gracefully', async () => {
      RNSecureKeystoreModule.encryptData = jest
        .fn()
        .mockRejectedValue(new Error('enc error'));
      const spy = jest.spyOn(console, 'error').mockImplementation();
      await expect(encryptJson('key', 'data')).rejects.toThrow('enc error');
      spy.mockRestore();
      RNSecureKeystoreModule.encryptData = (input: any) =>
        input ? String(input) : 'mockedString';
    });
  });

  describe('decryptJson', () => {
    it('returns empty string for null', async () => {
      expect(await decryptJson('key', null as any)).toBe('');
    });

    it('returns empty string for undefined', async () => {
      expect(await decryptJson('key', undefined as any)).toBe('');
    });

    it('decrypts with hardware keystore on Android', async () => {
      RNSecureKeystoreModule.decryptData = jest
        .fn()
        .mockResolvedValue('decryptedData');
      const result = await decryptJson('key', 'encryptedStr');
      expect(result).toBe('decryptedData');
      RNSecureKeystoreModule.decryptData = (input: any) =>
        input ? String(input) : 'mockedString';
    });

    it('handles error gracefully', async () => {
      RNSecureKeystoreModule.decryptData = jest
        .fn()
        .mockRejectedValue(new Error('dec error'));
      const spy = jest.spyOn(console, 'error').mockImplementation();
      await expect(decryptJson('key', 'data')).rejects.toThrow('dec error');
      spy.mockRestore();
      RNSecureKeystoreModule.decryptData = (input: any) =>
        input ? String(input) : 'mockedString';
    });
  });

  describe('BiometricCancellationError paths', () => {
    it('getJWT throws BiometricCancellationError for biometric cancelled', async () => {
      RNSecureKeystoreModule.sign = jest
        .fn()
        .mockRejectedValue(new Error('biometrics_cancelled'));
      const spy = jest.spyOn(console, 'error').mockImplementation();
      await expect(
        getJWT({alg: 'RS256'}, {sub: '1'}, 'alias', 'key', 'RS256'),
      ).rejects.toThrow();
      spy.mockRestore();
      RNSecureKeystoreModule.sign = jest.fn().mockResolvedValue('mockSig');
    });

    it('encryptJson throws BiometricCancellationError for biometric cancelled', async () => {
      RNSecureKeystoreModule.encryptData = jest
        .fn()
        .mockRejectedValue(new Error('biometrics_cancelled'));
      const spy = jest.spyOn(console, 'error').mockImplementation();
      await expect(encryptJson('key', 'data')).rejects.toThrow();
      spy.mockRestore();
      RNSecureKeystoreModule.encryptData = (input: any) =>
        input ? String(input) : 'mockedString';
    });

    it('decryptJson throws BiometricCancellationError for biometric cancelled', async () => {
      RNSecureKeystoreModule.decryptData = jest
        .fn()
        .mockRejectedValue(new Error('biometrics_cancelled'));
      const spy = jest.spyOn(console, 'error').mockImplementation();
      await expect(decryptJson('key', 'data')).rejects.toThrow();
      spy.mockRestore();
      RNSecureKeystoreModule.decryptData = (input: any) =>
        input ? String(input) : 'mockedString';
    });
  });

  describe('ES256K signature via createSignature dispatcher', () => {
    it('ES256K calls createSignatureECK1 via dispatcher', async () => {
      const privKey = new Uint8Array(32).fill(5);
      const result = await createSignature(privKey, 'test', 'ES256K');
      expect(typeof result).toBe('string');
    });
  });

  describe('fetchKeyPair - iOS paths', () => {
    it('RS256 on iOS calls retrieveGenericKey', async () => {
      const {isAndroid} = require('../constants');
      isAndroid.mockReturnValue(false);
      RNSecureKeystoreModule.retrieveGenericKey = jest
        .fn()
        .mockResolvedValue(['privRS256', 'pubRS256']);
      const result = await fetchKeyPair('RS256');
      expect(RNSecureKeystoreModule.retrieveGenericKey).toHaveBeenCalledWith(
        'RS256',
      );
      expect(result.publicKey).toBeDefined();
      expect(result.privateKey).toBeDefined();
      isAndroid.mockReturnValue(true);
    });

    it('ES256 on iOS calls retrieveGenericKey and converts Buffer', async () => {
      const {isAndroid} = require('../constants');
      isAndroid.mockReturnValue(false);
      const pubB64 = Buffer.from('testpub').toString('base64');
      const privB64 = Buffer.from('testpriv').toString('base64');
      RNSecureKeystoreModule.retrieveGenericKey = jest
        .fn()
        .mockResolvedValue([privB64, pubB64]);
      const result = await fetchKeyPair('ES256');
      expect(result.publicKey).toBeDefined();
      expect(result.privateKey).toBeDefined();
      isAndroid.mockReturnValue(true);
    });

    it('fetchKeyPair throws BiometricCancellationError', async () => {
      RNSecureKeystoreModule.retrieveKey = jest
        .fn()
        .mockRejectedValue(new Error('biometrics_cancelled'));
      const spy = jest.spyOn(console, 'error').mockImplementation();
      await expect(fetchKeyPair('RS256')).rejects.toThrow();
      spy.mockRestore();
      RNSecureKeystoreModule.retrieveKey = jest
        .fn()
        .mockResolvedValue('mockPubKey');
    });
  });

  describe('generateKeyPairsAndStoreOrder - iOS path', () => {
    it('stores additional RSA and ES256 keys on iOS', async () => {
      const {isIOS} = require('../constants');
      isIOS.mockReturnValue(true);
      const spy = jest.spyOn(console, 'warn').mockImplementation();
      await generateKeyPairsAndStoreOrder();
      // On iOS, storeGenericKey is called 4 times (ECK1, ED, RSA, ES256)
      expect(RNSecureKeystoreModule.storeGenericKey).toHaveBeenCalledTimes(4);
      spy.mockRestore();
      isIOS.mockReturnValue(false);
    });
  });

  describe('generateKeyPairRSA - non-hardware path', () => {
    it('uses RSA.generateKeys when no hardware keystore on non-Android', async () => {
      const {isAndroid} = require('../constants');
      isAndroid.mockReturnValueOnce(false);
      const result = await generateKeyPairRSA();
      expect(result).toHaveProperty('publicKey');
      expect(result).toHaveProperty('privateKey');
    });
  });

  describe('generateKeyPairECR1 - non-Android path', () => {
    it('uses p256 on non-Android', async () => {
      const {isAndroid} = require('../constants');
      isAndroid.mockReturnValueOnce(false);
      const result = await generateKeyPairECR1();
      expect(result).toHaveProperty('publicKey');
      expect(result).toHaveProperty('privateKey');
      expect(result.publicKey.length).toBeGreaterThan(0);
      expect(result.privateKey.length).toBeGreaterThan(0);
    });
  });
});
