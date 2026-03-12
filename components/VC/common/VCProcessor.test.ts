import {VCFormat} from '../../../shared/VCFormat';
import {NativeModules} from 'react-native';

// Set up RNPixelpassModule on NativeModules directly
NativeModules.RNPixelpassModule = {
  decodeBase64UrlEncodedCBORData: jest
    .fn()
    .mockResolvedValue('{"issuerSigned":{"nameSpaces":{}}}'),
};

jest.mock(
  '../../../machines/VerifiableCredential/VCItemMachine/VCItemSelectors',
  () => ({
    getVerifiableCredential: jest.fn(vc => vc),
  }),
);
jest.mock('../../../shared/Utils', () => ({
  parseJSON: jest.fn(input => {
    try {
      return JSON.parse(input);
    } catch {
      return input;
    }
  }),
}));
jest.mock('base64url', () => {
  const fn: any = (input: any) => {
    if (Buffer.isBuffer(input))
      return input
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    return Buffer.from(String(input))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };
  fn.decode = (input: string) =>
    Buffer.from(input.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString(
      'utf-8',
    );
  fn.encode = fn;
  fn.default = fn;
  return fn;
});
jest.mock('jwt-decode', () => ({
  __esModule: true,
  default: jest.fn(),
  jwtDecode: jest.fn(),
}));

import {VCProcessor, reconstructSdJwtFromCompact} from './VCProcessor';
import {getVerifiableCredential} from '../../../machines/VerifiableCredential/VCItemMachine/VCItemSelectors';
import jwtDecode from 'jwt-decode';

describe('VCProcessor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processForRendering', () => {
    it('should return processedCredential for mso_mdoc if already available', async () => {
      const vcData = {
        processedCredential: {foo: 'bar'},
        credential: 'test',
      } as any;
      const result = await VCProcessor.processForRendering(
        vcData,
        VCFormat.mso_mdoc,
      );
      expect(result).toEqual({foo: 'bar'});
    });

    it('should decode CBOR for mso_mdoc when no processedCredential', async () => {
      const vcData = {credential: 'base64data'} as any;
      const result = await VCProcessor.processForRendering(
        vcData,
        VCFormat.mso_mdoc,
      );
      expect(
        NativeModules.RNPixelpassModule.decodeBase64UrlEncodedCBORData,
      ).toHaveBeenCalledWith('base64data');
      expect(result).toEqual({issuerSigned: {nameSpaces: {}}});
    });

    it('should call getVerifiableCredential for ldp_vc format', async () => {
      const vcData = {credential: {}} as any;
      await VCProcessor.processForRendering(vcData, VCFormat.ldp_vc);
      expect(getVerifiableCredential).toHaveBeenCalledWith(vcData);
    });

    it('should reconstruct sd-jwt for vc_sd_jwt format', async () => {
      // Create a minimal SD-JWT: header.payload~
      const header = Buffer.from(JSON.stringify({alg: 'ES256'}))
        .toString('base64')
        .replace(/=/g, '');
      const payload = Buffer.from(
        JSON.stringify({sub: 'test', _sd_alg: 'sha-256'}),
      )
        .toString('base64')
        .replace(/=/g, '');
      const jwt = `${header}.${payload}`;
      const sdJwt = `${jwt}~`;

      (jwtDecode as jest.Mock).mockReturnValue({
        sub: 'test',
        _sd_alg: 'sha-256',
      });
      const vcData = {credential: sdJwt} as any;
      const result = await VCProcessor.processForRendering(
        vcData,
        VCFormat.vc_sd_jwt,
      );
      expect(result).toHaveProperty('fullResolvedPayload');
      expect(result).toHaveProperty('disclosedKeys');
      expect(result).toHaveProperty('publicKeys');
      expect(result).toHaveProperty('pathToDisclosures');
    });

    it('should handle dc_sd_jwt format same as vc_sd_jwt', async () => {
      const header = Buffer.from(JSON.stringify({alg: 'ES256'}))
        .toString('base64')
        .replace(/=/g, '');
      const payload = Buffer.from(JSON.stringify({iss: 'test'}))
        .toString('base64')
        .replace(/=/g, '');
      const jwt = `${header}.${payload}`;
      const sdJwt = `${jwt}~`;

      (jwtDecode as jest.Mock).mockReturnValue({iss: 'test'});
      const vcData = {credential: sdJwt} as any;
      const result = await VCProcessor.processForRendering(
        vcData,
        VCFormat.dc_sd_jwt,
      );
      expect(result).toHaveProperty('fullResolvedPayload');
    });
  });
});

describe('reconstructSdJwtFromCompact', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reconstruct a simple SD-JWT with no disclosures', () => {
    const header = Buffer.from(JSON.stringify({alg: 'ES256'})).toString(
      'base64',
    );
    const payload = Buffer.from(
      JSON.stringify({
        sub: 'user123',
        iss: 'issuer',
        iat: 1234567890,
      }),
    ).toString('base64');
    const jwt = `${header}.${payload}`;

    (jwtDecode as jest.Mock).mockReturnValue({
      sub: 'user123',
      iss: 'issuer',
      iat: 1234567890,
    });

    const result = reconstructSdJwtFromCompact(`${jwt}~`);
    expect(result.fullResolvedPayload).toHaveProperty('sub', 'user123');
    expect(result.fullResolvedPayload).toHaveProperty('iss', 'issuer');
    expect(result.publicKeys).toContain('iss');
    expect(result.publicKeys).toContain('sub');
    expect(result.publicKeys).toContain('iat');
    expect(result.disclosedKeys).toEqual([]);
  });

  it('should track public keys correctly', () => {
    (jwtDecode as jest.Mock).mockReturnValue({
      iss: 'test-issuer',
      sub: 'test-sub',
      aud: 'test-aud',
      exp: 9999999999,
      nbf: 1000000000,
      iat: 1000000000,
      jti: 'unique-id',
      name: 'John',
    });

    const result = reconstructSdJwtFromCompact('header.payload~');
    expect(result.publicKeys).toContain('iss');
    expect(result.publicKeys).toContain('sub');
    expect(result.publicKeys).toContain('aud');
    expect(result.publicKeys).toContain('exp');
    expect(result.publicKeys).toContain('nbf');
    expect(result.publicKeys).toContain('iat');
    expect(result.publicKeys).toContain('jti');
    // 'name' is not in public keys list
    expect(result.publicKeys).not.toContain('name');
  });

  it('should remove _sd_alg from resolved payload', () => {
    (jwtDecode as jest.Mock).mockReturnValue({
      _sd_alg: 'sha-256',
      iss: 'test',
    });

    const result = reconstructSdJwtFromCompact('header.payload~');
    expect(result.fullResolvedPayload).not.toHaveProperty('_sd_alg');
  });

  it('should handle empty disclosures', () => {
    (jwtDecode as jest.Mock).mockReturnValue({
      iss: 'test',
      _sd: [],
    });

    const result = reconstructSdJwtFromCompact('header.payload~');
    expect(result.disclosedKeys).toEqual([]);
  });

  it('should handle jwt with trailing tilde only', () => {
    (jwtDecode as jest.Mock).mockReturnValue({iss: 'test'});
    const result = reconstructSdJwtFromCompact('header.payload~');
    expect(result.fullResolvedPayload).toBeDefined();
  });

  it('should use default sha-256 when _sd_alg is not set', () => {
    (jwtDecode as jest.Mock).mockReturnValue({
      iss: 'issuer',
    });

    const result = reconstructSdJwtFromCompact('header.payload~');
    expect(result.fullResolvedPayload).toHaveProperty('iss', 'issuer');
  });

  it('should handle nested objects in payload', () => {
    (jwtDecode as jest.Mock).mockReturnValue({
      iss: 'test',
      address: {
        street: '123 Main St',
        city: 'Anytown',
      },
    });

    const result = reconstructSdJwtFromCompact('header.payload~');
    expect(result.fullResolvedPayload.address).toEqual({
      street: '123 Main St',
      city: 'Anytown',
    });
  });

  it('should handle arrays in payload', () => {
    (jwtDecode as jest.Mock).mockReturnValue({
      iss: 'test',
      nationalities: ['US', 'DE'],
    });

    const result = reconstructSdJwtFromCompact('header.payload~');
    expect(result.fullResolvedPayload.nationalities).toEqual(['US', 'DE']);
  });

  it('should resolve _sd object disclosures with matching digest', () => {
    // Create a disclosure: [salt, claim_name, claim_value]
    const disclosureArray = ['salt123', 'given_name', 'John'];
    const disclosureJson = JSON.stringify(disclosureArray);
    const disclosureB64 = Buffer.from(disclosureJson)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Compute the digest using sha256 the same way the source code does
    const {sha256} = require('@noble/hashes/sha2');
    const hashBytes = sha256(disclosureB64);
    const digest = Buffer.from(hashBytes)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    (jwtDecode as jest.Mock).mockReturnValue({
      iss: 'test',
      _sd_alg: 'sha-256',
      _sd: [digest],
    });

    const result = reconstructSdJwtFromCompact(
      `header.payload~${disclosureB64}~`,
    );
    expect(result.disclosedKeys).toContain('given_name');
    expect(result.fullResolvedPayload.given_name).toBe('John');
    expect(result.fullResolvedPayload.iss).toBe('test');
    expect(result.pathToDisclosures).toHaveProperty('given_name');
  });

  it('should resolve array element disclosures with ... digest', () => {
    // Array disclosure: [salt, value] (2-element)
    const disclosureArray = ['arrSalt', 'Germany'];
    const disclosureJson = JSON.stringify(disclosureArray);
    const disclosureB64 = Buffer.from(disclosureJson)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const {sha256} = require('@noble/hashes/sha2');
    const hashBytes = sha256(disclosureB64);
    const digest = Buffer.from(hashBytes)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    (jwtDecode as jest.Mock).mockReturnValue({
      iss: 'test',
      _sd_alg: 'sha-256',
      nationalities: [{'...': digest}],
    });

    const result = reconstructSdJwtFromCompact(
      `header.payload~${disclosureB64}~`,
    );
    expect(result.fullResolvedPayload.nationalities).toContain('Germany');
  });

  it('should skip array element when disclosure has wrong length', () => {
    // Create disclosure with length !== 2 (single element)
    const disclosureArray = ['onlySalt'];
    const disclosureJson = JSON.stringify(disclosureArray);
    const disclosureB64 = Buffer.from(disclosureJson)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const {sha256} = require('@noble/hashes/sha2');
    const hashBytes = sha256(disclosureB64);
    const digest = Buffer.from(hashBytes)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    (jwtDecode as jest.Mock).mockReturnValue({
      iss: 'test',
      _sd_alg: 'sha-256',
      items: [{'...': digest}],
    });

    const result = reconstructSdJwtFromCompact(
      `header.payload~${disclosureB64}~`,
    );
    expect(result.fullResolvedPayload.items).toEqual([]);
  });

  it('should skip _sd disclosure with wrong length (not 3)', () => {
    // Create disclosure with 2 elements instead of 3
    const disclosureArray = ['salt', 'value_only'];
    const disclosureJson = JSON.stringify(disclosureArray);
    const disclosureB64 = Buffer.from(disclosureJson)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const {sha256} = require('@noble/hashes/sha2');
    const hashBytes = sha256(disclosureB64);
    const digest = Buffer.from(hashBytes)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    (jwtDecode as jest.Mock).mockReturnValue({
      iss: 'test',
      _sd_alg: 'sha-256',
      _sd: [digest],
    });

    const result = reconstructSdJwtFromCompact(
      `header.payload~${disclosureB64}~`,
    );
    // The disclosure was skipped since it had length 2 (not 3)
    expect(result.disclosedKeys).toEqual([]);
  });

  it('should throw when disclosure tries to overwrite existing key', () => {
    const disclosureArray = ['salt', 'iss', 'overwritten'];
    const disclosureJson = JSON.stringify(disclosureArray);
    const disclosureB64 = Buffer.from(disclosureJson)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const {sha256} = require('@noble/hashes/sha2');
    const hashBytes = sha256(disclosureB64);
    const digest = Buffer.from(hashBytes)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    (jwtDecode as jest.Mock).mockReturnValue({
      iss: 'existing-value',
      _sd_alg: 'sha-256',
      _sd: [digest],
    });

    expect(() =>
      reconstructSdJwtFromCompact(`header.payload~${disclosureB64}~`),
    ).toThrow('Overwriting existing key');
  });

  it('should skip disclosures with _sd or ... as claim name', () => {
    const disclosureArray = ['salt', '_sd', 'bad_value'];
    const disclosureJson = JSON.stringify(disclosureArray);
    const disclosureB64 = Buffer.from(disclosureJson)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const {sha256} = require('@noble/hashes/sha2');
    const hashBytes = sha256(disclosureB64);
    const digest = Buffer.from(hashBytes)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    (jwtDecode as jest.Mock).mockReturnValue({
      iss: 'test',
      _sd_alg: 'sha-256',
      _sd: [digest],
    });

    const result = reconstructSdJwtFromCompact(
      `header.payload~${disclosureB64}~`,
    );
    expect(result.fullResolvedPayload).not.toHaveProperty('_sd');
  });

  it('should handle unsupported _sd_alg by throwing', () => {
    const disclosureArray = ['salt', 'name', 'value'];
    const disclosureJson = JSON.stringify(disclosureArray);
    const disclosureB64 = Buffer.from(disclosureJson)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    (jwtDecode as jest.Mock).mockReturnValue({
      iss: 'test',
      _sd_alg: 'sha-999',
    });

    expect(() =>
      reconstructSdJwtFromCompact(`header.payload~${disclosureB64}~`),
    ).toThrow('Unsupported _sd_alg: sha-999');
  });

  it('should handle nested object disclosures recursively', () => {
    const disclosureArray = [
      'salt1',
      'address',
      {street: '123 Main St', city: 'Springfield'},
    ];
    const disclosureJson = JSON.stringify(disclosureArray);
    const disclosureB64 = Buffer.from(disclosureJson)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const {sha256} = require('@noble/hashes/sha2');
    const hashBytes = sha256(disclosureB64);
    const digest = Buffer.from(hashBytes)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    (jwtDecode as jest.Mock).mockReturnValue({
      iss: 'test',
      _sd_alg: 'sha-256',
      _sd: [digest],
    });

    const result = reconstructSdJwtFromCompact(
      `header.payload~${disclosureB64}~`,
    );
    expect(result.disclosedKeys).toContain('address');
    expect(result.fullResolvedPayload.address).toEqual({
      street: '123 Main St',
      city: 'Springfield',
    });
  });

  it('should handle array with non-disclosure items', () => {
    (jwtDecode as jest.Mock).mockReturnValue({
      iss: 'test',
      items: ['plain', 42, {key: 'val'}],
    });

    const result = reconstructSdJwtFromCompact('header.payload~');
    expect(result.fullResolvedPayload.items).toEqual([
      'plain',
      42,
      {key: 'val'},
    ]);
  });

  it('should skip array disclosure with no matching digest', () => {
    (jwtDecode as jest.Mock).mockReturnValue({
      iss: 'test',
      _sd_alg: 'sha-256',
      items: [{'...': 'non-matching-digest'}],
    });

    const result = reconstructSdJwtFromCompact('header.payload~');
    expect(result.fullResolvedPayload.items).toEqual([]);
  });
});
