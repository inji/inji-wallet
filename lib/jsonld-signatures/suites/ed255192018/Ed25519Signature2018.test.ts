jest.mock('./Ed25519VerificationKey2018', () => ({
  Ed25519VerificationKey2018: class MockKey {
    id = 'mock-key-id';
    type = 'Ed25519VerificationKey2018';
    signer() {
      return {sign: jest.fn()};
    }
    verifier() {
      return {verify: jest.fn()};
    }
  },
}));

jest.mock('../JwsLinkedDataSignature', () => ({
  JwsLinkedDataSignature: class MockBase {
    type: string;
    alg: string;
    LDKeyClass: any;
    requiredKeyType: string;
    constructor(opts: any) {
      this.type = opts.type;
      this.alg = opts.alg;
      this.LDKeyClass = opts.LDKeyClass;
    }
  },
}));

import {Ed25519Signature2018} from './Ed25519Signature2018';

describe('Ed25519Signature2018', () => {
  it('should create instance with default options', () => {
    const suite = new Ed25519Signature2018();
    expect(suite).toBeDefined();
    expect(suite.type).toBe('Ed25519Signature2018');
    expect(suite.alg).toBe('EdDSA');
    expect(suite.requiredKeyType).toBe('Ed25519VerificationKey2018');
  });

  it('should accept signer option', () => {
    const signer = {sign: jest.fn()};
    const suite = new Ed25519Signature2018({signer});
    expect(suite).toBeDefined();
  });

  it('should accept verificationMethod option', () => {
    const suite = new Ed25519Signature2018({
      verificationMethod: 'did:example:123#key-1',
    });
    expect(suite).toBeDefined();
  });

  it('should accept key option', () => {
    const key = {id: 'key-1', type: 'Ed25519VerificationKey2018'};
    const suite = new Ed25519Signature2018({key});
    expect(suite).toBeDefined();
  });

  it('should accept proof option', () => {
    const proof = {created: '2023-01-01'};
    const suite = new Ed25519Signature2018({proof});
    expect(suite).toBeDefined();
  });

  it('should accept date option', () => {
    const suite = new Ed25519Signature2018({date: '2023-06-15'});
    expect(suite).toBeDefined();
  });

  it('should accept useNativeCanonize option', () => {
    const suite = new Ed25519Signature2018({useNativeCanonize: true});
    expect(suite).toBeDefined();
  });

  it('should use Ed25519VerificationKey2018 as LDKeyClass', () => {
    const suite = new Ed25519Signature2018();
    expect(suite.LDKeyClass).toBeDefined();
  });
});
