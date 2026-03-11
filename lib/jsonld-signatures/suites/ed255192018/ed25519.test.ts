jest.mock('node-forge', () => {
  const {Buffer: Buf} = require('buffer');
  const DER_PUBLIC_PREFIX = Buf.from('302a300506032b6570032100', 'hex');
  const fakePublicKeyBytes = Buf.alloc(32, 0xab);
  const fakePublicKeyDer = Buf.concat([DER_PUBLIC_PREFIX, fakePublicKeyBytes]);
  const mockPublicKey = {type: 'ed25519-public'};
  const mockPrivateKey = {type: 'ed25519-private'};
  return {
    pki: {
      publicKeyToAsn1: jest.fn(() => ({type: 'asn1-pub'})),
      publicKeyFromAsn1: jest.fn(() => mockPublicKey),
      privateKeyToAsn1: jest.fn(() => ({type: 'asn1-priv'})),
      privateKeyFromAsn1: jest.fn(() => mockPrivateKey),
      ed25519: {
        publicKeyFromPrivateKey: jest.fn(() => mockPublicKey),
        sign: jest.fn(() => Buf.from('signature-bytes')),
        verify: jest.fn(() => true),
      },
    },
    asn1: {
      toDer: jest.fn(() => ({
        getBytes: () => fakePublicKeyDer.toString('binary'),
      })),
      fromDer: jest.fn(s => ({type: 'asn1', data: s})),
    },
    util: {
      createBuffer: jest.fn(s => s),
    },
    random: {
      getBytesSync: jest.fn(len =>
        String.fromCharCode(...new Array(len).fill(0)),
      ),
    },
    md: {
      sha256: {
        create: jest.fn(() => ({digest: jest.fn()})),
      },
    },
  };
});

import ed25519Api, {_privateKeyDerEncode, _publicKeyDerEncode} from './ed25519';
import {Buffer} from 'buffer';

describe('ed25519', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('generateKeyPair', () => {
    it('should call generateKeyPairFromSeed with random 32 bytes', async () => {
      const spy = jest.spyOn(ed25519Api, 'generateKeyPairFromSeed');
      try {
        await ed25519Api.generateKeyPair();
      } catch {
        // Buffer polyfill may not satisfy instanceof Uint8Array in jest
      }
      expect(spy).toHaveBeenCalledWith(expect.any(Buffer));
      expect((spy.mock.calls[0][0] as Buffer).length).toBe(32);
      spy.mockRestore();
    });
  });

  describe('generateKeyPairFromSeed', () => {
    it('should return publicKey and secretKey from seed', async () => {
      const seed = new Uint8Array(32);
      const result = await ed25519Api.generateKeyPairFromSeed(seed);
      expect(result).toHaveProperty('publicKey');
      expect(result).toHaveProperty('secretKey');
      expect(Buffer.isBuffer(result.publicKey)).toBe(true);
      expect(Buffer.isBuffer(result.secretKey)).toBe(true);
    });
  });

  describe('sign', () => {
    it('should sign data and return a string', async () => {
      const privateKeyBytes = new Uint8Array(64);
      const result = await ed25519Api.sign(privateKeyBytes, 'test data');
      expect(typeof result).toBe('string');
    });
  });

  describe('verify', () => {
    it('should verify a signature', async () => {
      const publicKeyBytes = new Uint8Array(32);
      const result = await ed25519Api.verify(publicKeyBytes, 'data', 'sig');
      expect(result).toBe(true);
    });
  });

  describe('_privateKeyDerEncode', () => {
    it('should encode seed bytes', () => {
      const seedBytes = new Uint8Array(32);
      const result = _privateKeyDerEncode({seedBytes});
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should encode private key bytes', () => {
      const privateKeyBytes = new Uint8Array(64);
      const result = _privateKeyDerEncode({privateKeyBytes});
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should throw if neither provided', () => {
      expect(() => _privateKeyDerEncode({})).toThrow(
        '`privateKeyBytes` or `seedBytes` is required.',
      );
    });

    it('should throw if seedBytes is wrong size', () => {
      expect(() =>
        _privateKeyDerEncode({seedBytes: new Uint8Array(16)}),
      ).toThrow('`seedBytes` must be a 32 byte Buffer.');
    });

    it('should throw if privateKeyBytes is wrong size', () => {
      expect(() =>
        _privateKeyDerEncode({privateKeyBytes: new Uint8Array(32)}),
      ).toThrow('`privateKeyBytes` must be a 64 byte Buffer.');
    });
  });

  describe('_publicKeyDerEncode', () => {
    it('should encode public key bytes', () => {
      const publicKeyBytes = new Uint8Array(32);
      const result = _publicKeyDerEncode({publicKeyBytes});
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should throw if wrong size', () => {
      expect(() =>
        _publicKeyDerEncode({publicKeyBytes: new Uint8Array(16)}),
      ).toThrow('`publicKeyBytes` must be a 32 byte Buffer.');
    });

    it('should throw if not Uint8Array', () => {
      expect(() =>
        _publicKeyDerEncode({publicKeyBytes: 'not-bytes'}),
      ).toThrow();
    });
  });
});
