jest.mock(
  '@digitalbazaar/rsa-verification-key-2018/lib/RsaVerificationKey2018',
  () => ({
    RsaVerificationKey2018: class MockRsaKey {
      id = 'mock-rsa-key-id';
      type = 'RsaVerificationKey2018';
      signer() {
        return {sign: jest.fn()};
      }
      verifier() {
        return {verify: jest.fn()};
      }
    },
  }),
);

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

import {RsaSignature2018} from './RsaSignature2018';

describe('RsaSignature2018', () => {
  it('should create instance with default options', () => {
    const suite = new RsaSignature2018();
    expect(suite).toBeDefined();
    expect(suite.type).toBe('RsaSignature2018');
    expect(suite.alg).toBe('PS256');
    expect(suite.requiredKeyType).toBe('RsaVerificationKey2018');
  });

  it('should accept signer option', () => {
    const signer = {sign: jest.fn()};
    const suite = new RsaSignature2018({signer});
    expect(suite).toBeDefined();
  });

  it('should accept verificationMethod option', () => {
    const suite = new RsaSignature2018({
      verificationMethod: 'did:example:rsa#key-1',
    });
    expect(suite).toBeDefined();
  });

  it('should accept key option', () => {
    const key = {id: 'rsa-key-1', type: 'RsaVerificationKey2018'};
    const suite = new RsaSignature2018({key});
    expect(suite).toBeDefined();
  });

  it('should accept proof option', () => {
    const suite = new RsaSignature2018({proof: {created: '2023-01-01'}});
    expect(suite).toBeDefined();
  });

  it('should accept date option', () => {
    const suite = new RsaSignature2018({date: new Date('2023-01-01')});
    expect(suite).toBeDefined();
  });

  it('should accept useNativeCanonize option', () => {
    const suite = new RsaSignature2018({useNativeCanonize: false});
    expect(suite).toBeDefined();
  });

  it('should use RsaVerificationKey2018 as LDKeyClass', () => {
    const suite = new RsaSignature2018();
    expect(suite.LDKeyClass).toBeDefined();
  });
});
