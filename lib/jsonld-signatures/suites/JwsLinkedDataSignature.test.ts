import {JwsLinkedDataSignature} from './JwsLinkedDataSignature';

// Mock dependencies
jest.mock('jsonld', () => ({
  hasValue: jest.fn((obj: any, prop: string, value: string) => {
    if (!obj || !obj[prop]) return false;
    if (Array.isArray(obj[prop])) return obj[prop].includes(value);
    return obj[prop] === value;
  }),
}));

jest.mock('jsonld-signatures/lib/suites/LinkedDataSignature', () => {
  return class LinkedDataSignature {
    type: any;
    verificationMethod: any;
    proof: any;
    date: any;
    useNativeCanonize: any;
    requiredKeyType: string;
    constructor(options: any = {}) {
      this.type = options.type;
      this.verificationMethod = options.verificationMethod;
      this.proof = options.proof;
      this.date = options.date;
      this.useNativeCanonize = options.useNativeCanonize;
      this.requiredKeyType = 'Ed25519VerificationKey2018';
    }
    async getVerificationMethod({proof, documentLoader}: any) {
      if (documentLoader && proof?.verificationMethod) {
        return documentLoader(proof.verificationMethod);
      }
      return {
        id: proof?.verificationMethod,
        type: 'Ed25519VerificationKey2018',
      };
    }
    async matchProof() {
      return true;
    }
  };
});

jest.mock('base64url-universal', () => ({
  encode: jest.fn((input: any) => {
    if (typeof input === 'string') {
      return Buffer.from(input).toString('base64url');
    }
    if (input instanceof Uint8Array || Buffer.isBuffer(input)) {
      return Buffer.from(input).toString('base64url');
    }
    return Buffer.from(JSON.stringify(input)).toString('base64url');
  }),
}));

jest.mock('fast-text-encoding', () => {});

describe('JwsLinkedDataSignature', () => {
  describe('constructor', () => {
    it('should create instance with type and alg', () => {
      const suite = new JwsLinkedDataSignature({
        type: 'Ed25519Signature2018',
        alg: 'EdDSA',
      });
      expect(suite.type).toBe('Ed25519Signature2018');
      expect(suite.alg).toBe('EdDSA');
    });

    it('should store LDKeyClass', () => {
      const MockKeyClass = class {};
      const suite = new JwsLinkedDataSignature({
        type: 'Ed25519Signature2018',
        alg: 'EdDSA',
        LDKeyClass: MockKeyClass,
      });
      expect(suite.LDKeyClass).toBe(MockKeyClass);
    });

    it('should set signer from options', () => {
      const mockSigner = {sign: jest.fn()};
      const suite = new JwsLinkedDataSignature({
        type: 'Ed25519Signature2018',
        alg: 'EdDSA',
        signer: mockSigner,
      });
      expect(suite.signer).toBe(mockSigner);
    });

    it('should extract signer and verifier from key', () => {
      const mockKey = {
        export: jest.fn(() => ({id: 'key-id-1', publicKeyBase58: 'abc'})),
        signer: jest.fn(() => ({sign: jest.fn()})),
        verifier: jest.fn(() => ({verify: jest.fn()})),
      };
      const suite = new JwsLinkedDataSignature({
        type: 'Ed25519Signature2018',
        alg: 'EdDSA',
        key: mockKey,
      });
      expect(suite.key).toBe(mockKey);
      expect(suite.verificationMethod).toBe('key-id-1');
      expect(mockKey.signer).toHaveBeenCalled();
      expect(mockKey.verifier).toHaveBeenCalled();
    });

    it('should not override verificationMethod if provided', () => {
      const mockKey = {
        export: jest.fn(() => ({id: 'key-id-1'})),
        signer: jest.fn(() => ({sign: jest.fn()})),
        verifier: jest.fn(() => ({verify: jest.fn()})),
      };
      const suite = new JwsLinkedDataSignature({
        type: 'Ed25519Signature2018',
        alg: 'EdDSA',
        key: mockKey,
        verificationMethod: 'explicit-vm',
      });
      expect(suite.verificationMethod).toBe('explicit-vm');
    });

    it('should handle key without signer/verifier functions', () => {
      const mockKey = {
        export: jest.fn(() => ({id: 'key-id'})),
      };
      const suite = new JwsLinkedDataSignature({
        type: 'Ed25519Signature2018',
        alg: 'EdDSA',
        key: mockKey,
      });
      expect(suite.key).toBe(mockKey);
    });
  });

  describe('sign', () => {
    it('should throw if no signer specified', async () => {
      const suite = new JwsLinkedDataSignature({
        type: 'Ed25519Signature2018',
        alg: 'EdDSA',
      });
      await expect(
        suite.sign({verifyData: new Uint8Array([1, 2, 3]), proof: {}}),
      ).rejects.toThrow('A signer API has not been specified.');
    });

    it('should produce a JWS proof', async () => {
      const mockSigner = {
        sign: jest.fn(async () => Buffer.from('mock-signature')),
      };
      const suite = new JwsLinkedDataSignature({
        type: 'Ed25519Signature2018',
        alg: 'EdDSA',
        signer: mockSigner,
      });
      const proof: any = {};
      const result = await suite.sign({
        verifyData: new Uint8Array([1, 2, 3]),
        proof,
      });
      expect(result.jws).toBeDefined();
      expect(result.jws).toContain('..');
      expect(mockSigner.sign).toHaveBeenCalled();
    });
  });

  describe('verifySignature', () => {
    it('should throw if proof has no valid jws', async () => {
      const suite = new JwsLinkedDataSignature({
        type: 'Ed25519Signature2018',
        alg: 'EdDSA',
      });
      await expect(
        suite.verifySignature({
          verifyData: new Uint8Array([1, 2, 3]),
          verificationMethod: {},
          proof: {jws: 'invalid'},
        }),
      ).rejects.toThrow('The proof does not include a valid "jws" property.');
    });

    it('should throw if proof.jws is not a string', async () => {
      const suite = new JwsLinkedDataSignature({
        type: 'Ed25519Signature2018',
        alg: 'EdDSA',
      });
      await expect(
        suite.verifySignature({
          verifyData: new Uint8Array([1, 2, 3]),
          verificationMethod: {},
          proof: {jws: 123},
        }),
      ).rejects.toThrow('The proof does not include a valid "jws" property.');
    });

    it('should verify a valid JWS', async () => {
      const mockVerifier = {
        verify: jest.fn(async () => true),
      };
      const header = {alg: 'EdDSA', b64: false, crit: ['b64']};
      const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
        'base64',
      );
      const encodedSignature = Buffer.from('sig').toString('base64');
      const jws = `${encodedHeader}..${encodedSignature}`;

      const suite = new JwsLinkedDataSignature({
        type: 'Ed25519Signature2018',
        alg: 'EdDSA',
      });
      suite.verifier = mockVerifier;

      const result = await suite.verifySignature({
        verifyData: new Uint8Array([1, 2, 3]),
        verificationMethod: {},
        proof: {jws},
      });
      expect(result).toBe(true);
    });

    it('should use LDKeyClass when no verifier set', async () => {
      const mockVerifier = {verify: jest.fn(async () => true)};
      const MockKeyClass = {
        from: jest.fn(async () => ({
          verifier: () => mockVerifier,
        })),
      };

      const header = {alg: 'EdDSA', b64: false, crit: ['b64']};
      const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
        'base64',
      );
      const encodedSignature = Buffer.from('sig').toString('base64');
      const jws = `${encodedHeader}..${encodedSignature}`;

      const suite = new JwsLinkedDataSignature({
        type: 'Ed25519Signature2018',
        alg: 'EdDSA',
        LDKeyClass: MockKeyClass,
      });

      const result = await suite.verifySignature({
        verifyData: new Uint8Array([1, 2, 3]),
        verificationMethod: {id: 'key-1'},
        proof: {jws},
      });
      expect(result).toBe(true);
      expect(MockKeyClass.from).toHaveBeenCalledWith({id: 'key-1'});
    });

    it('should throw on invalid JWS header', async () => {
      const suite = new JwsLinkedDataSignature({
        type: 'Ed25519Signature2018',
        alg: 'EdDSA',
      });
      const encodedHeader = Buffer.from('not-json').toString('base64');
      const jws = `${encodedHeader}..sig`;

      await expect(
        suite.verifySignature({
          verifyData: new Uint8Array([1, 2, 3]),
          verificationMethod: {},
          proof: {jws},
        }),
      ).rejects.toThrow('Could not parse JWS header');
    });
  });

  describe('assertVerificationMethod', () => {
    it('should not throw for valid key type', async () => {
      const suite = new JwsLinkedDataSignature({
        type: 'Ed25519Signature2018',
        alg: 'EdDSA',
      });
      const jsonld = require('jsonld');
      jsonld.hasValue.mockReturnValueOnce(true);

      await expect(
        suite.assertVerificationMethod({
          verificationMethod: {type: 'Ed25519VerificationKey2018'},
        }),
      ).resolves.toBeUndefined();
    });

    it('should throw for invalid key type', async () => {
      const suite = new JwsLinkedDataSignature({
        type: 'Ed25519Signature2018',
        alg: 'EdDSA',
      });
      const jsonld = require('jsonld');
      jsonld.hasValue.mockReturnValueOnce(false);

      await expect(
        suite.assertVerificationMethod({
          verificationMethod: {type: 'WrongKeyType'},
        }),
      ).rejects.toThrow('Invalid key type');
    });
  });

  describe('getVerificationMethod', () => {
    it('should return exported key when key is set', async () => {
      const mockKey = {
        export: jest.fn(() => ({id: 'key-1', publicKeyBase58: 'abc'})),
        signer: jest.fn(() => ({sign: jest.fn()})),
        verifier: jest.fn(() => ({verify: jest.fn()})),
      };
      const suite = new JwsLinkedDataSignature({
        type: 'Ed25519Signature2018',
        alg: 'EdDSA',
        key: mockKey,
      });
      const result = await suite.getVerificationMethod({
        proof: {},
        documentLoader: jest.fn(),
      });
      expect(result).toEqual({id: 'key-1', publicKeyBase58: 'abc'});
    });
  });

  describe('matchProof', () => {
    it('should return true when no key specified', async () => {
      const suite = new JwsLinkedDataSignature({
        type: 'Ed25519Signature2018',
        alg: 'EdDSA',
      });
      const result = await suite.matchProof({
        proof: {},
        document: {},
        purpose: {},
        documentLoader: jest.fn(),
        expansionMap: jest.fn(),
      });
      expect(result).toBe(true);
    });

    it('should match when proof verificationMethod id matches key id', async () => {
      const mockKey = {
        id: 'key-1',
        export: jest.fn(() => ({id: 'key-1'})),
        signer: jest.fn(() => ({sign: jest.fn()})),
        verifier: jest.fn(() => ({verify: jest.fn()})),
      };
      const suite = new JwsLinkedDataSignature({
        type: 'Ed25519Signature2018',
        alg: 'EdDSA',
        key: mockKey,
      });
      const result = await suite.matchProof({
        proof: {verificationMethod: {id: 'key-1'}},
        document: {},
        purpose: {},
        documentLoader: jest.fn(),
        expansionMap: jest.fn(),
      });
      expect(result).toBe(true);
    });

    it('should match when proof verificationMethod string matches key id', async () => {
      const mockKey = {
        id: 'key-1',
        export: jest.fn(() => ({id: 'key-1'})),
        signer: jest.fn(() => ({sign: jest.fn()})),
        verifier: jest.fn(() => ({verify: jest.fn()})),
      };
      const suite = new JwsLinkedDataSignature({
        type: 'Ed25519Signature2018',
        alg: 'EdDSA',
        key: mockKey,
      });
      const result = await suite.matchProof({
        proof: {verificationMethod: 'key-1'},
        document: {},
        purpose: {},
        documentLoader: jest.fn(),
        expansionMap: jest.fn(),
      });
      expect(result).toBe(true);
    });

    it('should not match when verificationMethod does not match', async () => {
      const mockKey = {
        id: 'key-1',
        export: jest.fn(() => ({id: 'key-1'})),
        signer: jest.fn(() => ({sign: jest.fn()})),
        verifier: jest.fn(() => ({verify: jest.fn()})),
      };
      const suite = new JwsLinkedDataSignature({
        type: 'Ed25519Signature2018',
        alg: 'EdDSA',
        key: mockKey,
      });
      const result = await suite.matchProof({
        proof: {verificationMethod: 'key-2'},
        document: {},
        purpose: {},
        documentLoader: jest.fn(),
        expansionMap: jest.fn(),
      });
      expect(result).toBe(false);
    });
  });
});
