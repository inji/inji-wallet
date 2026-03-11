import {Ed25519VerificationKey2018} from './Ed25519VerificationKey2018';

// Mock base58-universal
jest.mock('base58-universal/main', () => ({
  encode: jest.fn((input: Uint8Array) => {
    // Simple mock: convert bytes to hex string for testing
    return Array.from(input)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }),
  decode: jest.fn((str: string) => {
    // Simple mock: convert hex string back to bytes
    const bytes = new Uint8Array(str.length / 2);
    for (let i = 0; i < str.length; i += 2) {
      bytes[i / 2] = parseInt(str.substr(i, 2), 16);
    }
    return bytes;
  }),
}));

// Mock util
jest.mock('./util', () => ({
  base58Decode: jest.fn(({decode, keyMaterial, type}) => {
    if (!keyMaterial) {
      throw new TypeError(`The ${type} key material must be Base58 encoded.`);
    }
    return decode(keyMaterial);
  }),
}));

// Mock ed25519
jest.mock('./ed25519', () => ({
  __esModule: true,
  default: {
    generateKeyPair: jest.fn(async () => ({
      publicKey: new Uint8Array([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32,
      ]),
      secretKey: new Uint8Array(64).fill(0xab),
    })),
    generateKeyPairFromSeed: jest.fn(async (seed: Uint8Array) => ({
      publicKey: new Uint8Array([
        10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160,
        170, 180, 190, 200, 210, 220, 230, 240, 250, 1, 2, 3, 4, 5, 6, 7,
      ]),
      secretKey: new Uint8Array(64).fill(0xcd),
    })),
    sign: jest.fn((privateKeyBytes: any, data: any) => 'mock-signature'),
    verify: jest.fn((publicKeyBytes: any, data: any, signature: any) => true),
  },
}));

// Mock crypto-ld's LDKeyPair
jest.mock('crypto-ld', () => ({
  LDKeyPair: class LDKeyPair {
    id: any;
    controller: any;
    type: any;
    revoked: any;
    constructor(options: any = {}) {
      this.id = options.id;
      this.controller = options.controller;
      this.type = options.type;
      this.revoked = options.revoked;
    }
  },
}));

const MOCK_PUBLIC_KEY_BASE58 =
  '0102030405060708091011121314151617181920212223242526272829303132';
const MOCK_PRIVATE_KEY_BASE58 =
  'abababababababababababababababababababababababababababababababababababababababababababababababababababababababababababababababababababab';

describe('Ed25519VerificationKey2018', () => {
  describe('constructor', () => {
    it('should create instance with publicKeyBase58', () => {
      const key = new Ed25519VerificationKey2018({
        publicKeyBase58: MOCK_PUBLIC_KEY_BASE58,
      });
      expect(key.publicKeyBase58).toBe(MOCK_PUBLIC_KEY_BASE58);
      expect(key.type).toBe('Ed25519VerificationKey2018');
    });

    it('should throw if publicKeyBase58 is missing', () => {
      expect(() => new Ed25519VerificationKey2018({})).toThrow(
        'The "publicKeyBase58" property is required.',
      );
    });

    it('should set privateKeyBase58 when provided', () => {
      const key = new Ed25519VerificationKey2018({
        publicKeyBase58: MOCK_PUBLIC_KEY_BASE58,
        privateKeyBase58: MOCK_PRIVATE_KEY_BASE58,
      });
      expect(key.privateKeyBase58).toBe(MOCK_PRIVATE_KEY_BASE58);
    });

    it('should auto-generate id from controller and fingerprint', () => {
      const key = new Ed25519VerificationKey2018({
        publicKeyBase58: MOCK_PUBLIC_KEY_BASE58,
        controller: 'did:example:123',
      });
      expect(key.id).toContain('did:example:123#');
    });

    it('should not overwrite id if already provided', () => {
      const key = new Ed25519VerificationKey2018({
        publicKeyBase58: MOCK_PUBLIC_KEY_BASE58,
        controller: 'did:example:123',
        id: 'did:example:123#existing-id',
      });
      expect(key.id).toBe('did:example:123#existing-id');
    });
  });

  describe('fromFingerprint', () => {
    it('should throw if fingerprint is missing', () => {
      expect(() => Ed25519VerificationKey2018.fromFingerprint({})).toThrow(
        '`fingerprint` must be a multibase encoded string.',
      );
    });

    it('should throw if fingerprint does not start with z', () => {
      expect(() =>
        Ed25519VerificationKey2018.fromFingerprint({fingerprint: 'abc'}),
      ).toThrow('`fingerprint` must be a multibase encoded string.');
    });

    it('should create key from valid ed25519 fingerprint', () => {
      // Create a mock fingerprint: z + base58(0xed 0x01 + 32 bytes public key)
      const bs58 = require('base58-universal/main');
      const mockPublicKeyBytes = new Uint8Array(32).fill(0x42);
      const buffer = new Uint8Array(34);
      buffer[0] = 0xed;
      buffer[1] = 0x01;
      buffer.set(mockPublicKeyBytes, 2);
      const encoded = bs58.encode(buffer);

      bs58.decode.mockReturnValueOnce(buffer);

      const key = Ed25519VerificationKey2018.fromFingerprint({
        fingerprint: `z${encoded}`,
      });
      expect(key).toBeInstanceOf(Ed25519VerificationKey2018);
    });

    it('should throw for unsupported fingerprint type', () => {
      const bs58 = require('base58-universal/main');
      // Return buffer with wrong prefix
      bs58.decode.mockReturnValueOnce(new Uint8Array([0x00, 0x00, 0x01]));

      expect(() =>
        Ed25519VerificationKey2018.fromFingerprint({fingerprint: 'zabc'}),
      ).toThrow('Unsupported fingerprint');
    });
  });

  describe('generate', () => {
    it('should generate a key pair', async () => {
      const key = await Ed25519VerificationKey2018.generate();
      expect(key).toBeInstanceOf(Ed25519VerificationKey2018);
      expect(key.publicKeyBase58).toBeDefined();
      expect(key.privateKeyBase58).toBeDefined();
    });

    it('should generate from seed', async () => {
      const seed = new Uint8Array(32).fill(0x01);
      const key = await Ed25519VerificationKey2018.generate({seed});
      expect(key).toBeInstanceOf(Ed25519VerificationKey2018);
      expect(key.publicKeyBase58).toBeDefined();
    });

    it('should pass options through', async () => {
      const key = await Ed25519VerificationKey2018.generate({
        controller: 'did:example:456',
      });
      expect(key.controller).toBe('did:example:456');
    });
  });

  describe('from', () => {
    it('should create an instance from serialized options', async () => {
      const key = await Ed25519VerificationKey2018.from({
        publicKeyBase58: MOCK_PUBLIC_KEY_BASE58,
        controller: 'did:example:789',
      });
      expect(key).toBeInstanceOf(Ed25519VerificationKey2018);
      expect(key.publicKeyBase58).toBe(MOCK_PUBLIC_KEY_BASE58);
      expect(key.controller).toBe('did:example:789');
    });
  });

  describe('signer', () => {
    it('should return signer with sign function', () => {
      const key = new Ed25519VerificationKey2018({
        publicKeyBase58: MOCK_PUBLIC_KEY_BASE58,
        privateKeyBase58: MOCK_PRIVATE_KEY_BASE58,
      });
      const signer = key.signer();
      expect(signer).toHaveProperty('sign');
      expect(typeof signer.sign).toBe('function');
    });

    it('should set signer id', () => {
      const key = new Ed25519VerificationKey2018({
        publicKeyBase58: MOCK_PUBLIC_KEY_BASE58,
        privateKeyBase58: MOCK_PRIVATE_KEY_BASE58,
        id: 'key-id-1',
      });
      const signer = key.signer();
      expect(signer.id).toBe('key-id-1');
    });

    it('signer without private key should throw on sign', async () => {
      const key = new Ed25519VerificationKey2018({
        publicKeyBase58: MOCK_PUBLIC_KEY_BASE58,
      });
      const signer = key.signer();
      await expect(signer.sign({data: 'test'})).rejects.toThrow(
        'No private key to sign with.',
      );
    });

    it('signer with private key should sign data', async () => {
      const key = new Ed25519VerificationKey2018({
        publicKeyBase58: MOCK_PUBLIC_KEY_BASE58,
        privateKeyBase58: MOCK_PRIVATE_KEY_BASE58,
      });
      const signer = key.signer();
      const result = await signer.sign({data: 'test-data'});
      expect(result).toBe('mock-signature');
    });
  });

  describe('verifier', () => {
    it('should return verifier with verify function', () => {
      const key = new Ed25519VerificationKey2018({
        publicKeyBase58: MOCK_PUBLIC_KEY_BASE58,
      });
      const verifier = key.verifier();
      expect(verifier).toHaveProperty('verify');
      expect(typeof verifier.verify).toBe('function');
    });

    it('should set verifier id', () => {
      const key = new Ed25519VerificationKey2018({
        publicKeyBase58: MOCK_PUBLIC_KEY_BASE58,
        id: 'key-id-2',
      });
      const verifier = key.verifier();
      expect(verifier.id).toBe('key-id-2');
    });

    it('verifier should verify data', async () => {
      const key = new Ed25519VerificationKey2018({
        publicKeyBase58: MOCK_PUBLIC_KEY_BASE58,
      });
      const verifier = key.verifier();
      const result = await verifier.verify({
        data: 'test-data',
        signature: 'test-sig',
      });
      expect(result).toBe(true);
    });
  });

  describe('export', () => {
    it('should throw if neither publicKey nor privateKey specified', () => {
      const key = new Ed25519VerificationKey2018({
        publicKeyBase58: MOCK_PUBLIC_KEY_BASE58,
      });
      expect(() => key.export()).toThrow(
        'Export requires specifying either "publicKey" or "privateKey".',
      );
    });

    it('should export public key only', () => {
      const key = new Ed25519VerificationKey2018({
        publicKeyBase58: MOCK_PUBLIC_KEY_BASE58,
        controller: 'did:example:123',
      });
      const exported = key.export({publicKey: true});
      expect(exported.publicKeyBase58).toBe(MOCK_PUBLIC_KEY_BASE58);
      expect(exported.privateKeyBase58).toBeUndefined();
      expect(exported.type).toBe('Ed25519VerificationKey2018');
      expect(exported.controller).toBe('did:example:123');
    });

    it('should export private key only', () => {
      const key = new Ed25519VerificationKey2018({
        publicKeyBase58: MOCK_PUBLIC_KEY_BASE58,
        privateKeyBase58: MOCK_PRIVATE_KEY_BASE58,
      });
      const exported = key.export({privateKey: true});
      expect(exported.privateKeyBase58).toBe(MOCK_PRIVATE_KEY_BASE58);
      expect(exported.publicKeyBase58).toBeUndefined();
    });

    it('should export both keys', () => {
      const key = new Ed25519VerificationKey2018({
        publicKeyBase58: MOCK_PUBLIC_KEY_BASE58,
        privateKeyBase58: MOCK_PRIVATE_KEY_BASE58,
      });
      const exported = key.export({publicKey: true, privateKey: true});
      expect(exported.publicKeyBase58).toBe(MOCK_PUBLIC_KEY_BASE58);
      expect(exported.privateKeyBase58).toBe(MOCK_PRIVATE_KEY_BASE58);
    });

    it('should include context when requested', () => {
      const key = new Ed25519VerificationKey2018({
        publicKeyBase58: MOCK_PUBLIC_KEY_BASE58,
      });
      const exported = key.export({publicKey: true, includeContext: true});
      expect(exported['@context']).toBeDefined();
    });

    it('should include revoked if key is revoked', () => {
      const key = new Ed25519VerificationKey2018({
        publicKeyBase58: MOCK_PUBLIC_KEY_BASE58,
        revoked: '2023-01-01T00:00:00Z',
      });
      const exported = key.export({publicKey: true});
      expect(exported.revoked).toBe('2023-01-01T00:00:00Z');
    });
  });

  describe('fingerprintFromPublicKey', () => {
    it('should generate fingerprint from public key', () => {
      const fp = Ed25519VerificationKey2018.fingerprintFromPublicKey({
        publicKeyBase58: MOCK_PUBLIC_KEY_BASE58,
      });
      expect(fp).toMatch(/^z/);
    });
  });

  describe('fingerprint', () => {
    it('should generate fingerprint from instance public key', () => {
      const key = new Ed25519VerificationKey2018({
        publicKeyBase58: MOCK_PUBLIC_KEY_BASE58,
      });
      const fp = key.fingerprint();
      expect(fp).toMatch(/^z/);
    });
  });

  describe('verifyFingerprint', () => {
    it('should return error for non-multibase fingerprint', () => {
      const key = new Ed25519VerificationKey2018({
        publicKeyBase58: MOCK_PUBLIC_KEY_BASE58,
      });
      const result = key.verifyFingerprint({fingerprint: 'notmultibase'});
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error for non-string fingerprint', () => {
      const key = new Ed25519VerificationKey2018({
        publicKeyBase58: MOCK_PUBLIC_KEY_BASE58,
      });
      const result = key.verifyFingerprint({fingerprint: 123 as any});
      expect(result.valid).toBe(false);
    });

    it('should verify matching fingerprint', () => {
      const key = new Ed25519VerificationKey2018({
        publicKeyBase58: MOCK_PUBLIC_KEY_BASE58,
      });
      const fp = key.fingerprint();
      const result = key.verifyFingerprint({fingerprint: fp});
      expect(result.valid).toBe(true);
    });

    it('should reject non-matching fingerprint', () => {
      const bs58 = require('base58-universal/main');
      const key = new Ed25519VerificationKey2018({
        publicKeyBase58: MOCK_PUBLIC_KEY_BASE58,
      });
      // Create a wrong fingerprint (wrong prefix)
      const wrongBuffer = new Uint8Array(34);
      wrongBuffer[0] = 0x00;
      wrongBuffer[1] = 0x00;
      wrongBuffer.fill(0xff, 2);
      const encoded = bs58.encode(wrongBuffer);

      const result = key.verifyFingerprint({fingerprint: `z${encoded}`});
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('static properties', () => {
    it('should have suite property', () => {
      expect(Ed25519VerificationKey2018['suite']).toBe(
        'Ed25519VerificationKey2018',
      );
    });

    it('should have SUITE_CONTEXT', () => {
      expect(Ed25519VerificationKey2018['SUITE_CONTEXT']).toBe(
        'https://w3id.org/security/suites/ed25519-2018/v1',
      );
    });
  });
});
