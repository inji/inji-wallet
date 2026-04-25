/* eslint-disable @typescript-eslint/no-explicit-any */
import base64url from 'base64url';
import {sha256} from '@noble/hashes/sha2';
import {VCProcessor, reconstructSdJwtFromCompact} from './VCProcessor';
import {VCFormat} from '../../../shared/VCFormat';
import {getVerifiableCredential} from '../../../machines/VerifiableCredential/VCItemMachine/VCItemSelectors';

jest.mock('react-native', () => ({
  NativeModules: {
    RNPixelpassModule: {
      decodeBase64UrlEncodedCBORData: jest.fn(),
    },
  },
}));

jest.mock(
  '../../../machines/VerifiableCredential/VCItemMachine/VCItemSelectors',
  () => ({
    getVerifiableCredential: jest.fn(),
  }),
);

const mockedGetVerifiableCredential = getVerifiableCredential as jest.Mock;

const encodeBase64Url = (value: unknown): string =>
  Buffer.from(JSON.stringify(value), 'utf-8')
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

const createDisclosure = (value: unknown[]): string => encodeBase64Url(value);

const createDigest = (disclosureB64: string): string =>
  base64url(Buffer.from(sha256(disclosureB64)));

const createSdJwtCompact = (
  payload: Record<string, any>,
  disclosures: string[],
): string => {
  const headerB64 = encodeBase64Url({alg: 'none', typ: 'JWT'});
  const payloadB64 = encodeBase64Url(payload);
  const jwt = `${headerB64}.${payloadB64}.signature`;
  return [jwt, ...disclosures].join('~');
};

describe('VCProcessor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('reconstructSdJwtFromCompact', () => {
    it('should resolve a simple top-level disclosed claim', () => {
      const givenNameDisclosure = createDisclosure([
        'salt-given',
        'given_name',
        'Alice',
      ]);
      const givenNameDigest = createDigest(givenNameDisclosure);

      const compact = createSdJwtCompact(
        {
          _sd: [givenNameDigest],
          _sd_alg: 'sha-256',
          iss: 'https://issuer.example',
          iat: 1710000000,
        },
        [givenNameDisclosure],
      );

      const result = reconstructSdJwtFromCompact(compact);

      expect(result.fullResolvedPayload.given_name).toBe('Alice');
      expect(result.disclosedKeys).toContain('given_name');
      expect(result.publicKeys).toEqual(expect.arrayContaining(['iss', 'iat']));
      expect(result.pathToDisclosures.given_name).toEqual([
        givenNameDisclosure,
      ]);
      expect(result.fullResolvedPayload).not.toHaveProperty('_sd_alg');
    });

    it('should resolve nested disclosed claims like address.city', () => {
      const cityDisclosure = createDisclosure(['salt-city', 'city', 'Paris']);
      const cityDigest = createDigest(cityDisclosure);
      const addressDisclosure = createDisclosure([
        'salt-address',
        'address',
        {
          _sd: [cityDigest],
        },
      ]);
      const addressDigest = createDigest(addressDisclosure);

      const compact = createSdJwtCompact(
        {
          _sd: [addressDigest],
          _sd_alg: 'sha-256',
        },
        [addressDisclosure, cityDisclosure],
      );

      const result = reconstructSdJwtFromCompact(compact);

      expect(result.fullResolvedPayload.address.city).toBe('Paris');
      expect(result.disclosedKeys).toEqual(
        expect.arrayContaining(['address', 'address.city']),
      );
      expect(result.pathToDisclosures['address.city']).toEqual([
        addressDisclosure,
        cityDisclosure,
      ]);
    });

    it('should resolve array disclosures like nationalities', () => {
      const nationalityItemDisclosure = createDisclosure(['salt-item', 'IN']);
      const nationalityItemDigest = createDigest(nationalityItemDisclosure);
      const nationalitiesDisclosure = createDisclosure([
        'salt-nationalities',
        'nationalities',
        [
          {
            '...': nationalityItemDigest,
          },
        ],
      ]);
      const nationalitiesDigest = createDigest(nationalitiesDisclosure);

      const compact = createSdJwtCompact(
        {
          _sd: [nationalitiesDigest],
          _sd_alg: 'sha-256',
        },
        [nationalitiesDisclosure, nationalityItemDisclosure],
      );

      const result = reconstructSdJwtFromCompact(compact);

      expect(result.fullResolvedPayload.nationalities).toEqual(['IN']);
      expect(result.disclosedKeys).toEqual(
        expect.arrayContaining(['nationalities', 'nationalities[0]']),
      );
      expect(result.pathToDisclosures['nationalities[0]']).toEqual([
        nationalitiesDisclosure,
        nationalityItemDisclosure,
      ]);
    });

    it('should skip undisclosed claims without crashing', () => {
      const compact = createSdJwtCompact(
        {
          _sd: ['digest-without-disclosure'],
          _sd_alg: 'sha-256',
          iss: 'https://issuer.example',
        },
        [],
      );

      const result = reconstructSdJwtFromCompact(compact);

      expect(result.fullResolvedPayload).not.toHaveProperty(
        'digest-without-disclosure',
      );
      expect(result.disclosedKeys).toEqual([]);
      expect(result.fullResolvedPayload.iss).toBe('https://issuer.example');
    });

    it('should throw for malformed compact SD-JWT input', () => {
      expect(() => reconstructSdJwtFromCompact('malformed-input')).toThrow();
    });
  });

  describe('processForRendering', () => {
    it('should process vc+sd-jwt and populate fullResolvedPayload', async () => {
      const givenNameDisclosure = createDisclosure([
        'salt-given',
        'given_name',
        'Alice',
      ]);
      const givenNameDigest = createDigest(givenNameDisclosure);
      const compact = createSdJwtCompact(
        {
          _sd: [givenNameDigest],
          _sd_alg: 'sha-256',
          iss: 'https://issuer.example',
        },
        [givenNameDisclosure],
      );

      const result = await VCProcessor.processForRendering(
        {credential: compact} as any,
        VCFormat.vc_sd_jwt,
      );

      expect(result.fullResolvedPayload.given_name).toBe('Alice');
      expect(result.disclosedKeys).toContain('given_name');
      expect(result.publicKeys).toContain('iss');
      expect(result.pathToDisclosures.given_name).toEqual([
        givenNameDisclosure,
      ]);
    });

    it('should process dc+sd-jwt the same way as vc+sd-jwt', async () => {
      const familyNameDisclosure = createDisclosure([
        'salt-family',
        'family_name',
        'Doe',
      ]);
      const familyNameDigest = createDigest(familyNameDisclosure);
      const compact = createSdJwtCompact(
        {
          _sd: [familyNameDigest],
          _sd_alg: 'sha-256',
          sub: 'did:example:abc',
        },
        [familyNameDisclosure],
      );

      const result = await VCProcessor.processForRendering(
        {credential: compact} as any,
        VCFormat.dc_sd_jwt,
      );

      expect(result.fullResolvedPayload.family_name).toBe('Doe');
      expect(result.disclosedKeys).toContain('family_name');
      expect(result.publicKeys).toContain('sub');
      expect(result.pathToDisclosures.family_name).toEqual([
        familyNameDisclosure,
      ]);
    });

    it('should not use SD-JWT path for ldp_vc format', async () => {
      const expectedCredential = {
        credentialSubject: {
          id: '123',
        },
      };
      mockedGetVerifiableCredential.mockReturnValue(expectedCredential);

      const vcData = {
        credential: 'plain-vc-data',
      } as any;

      const result = await VCProcessor.processForRendering(
        vcData,
        VCFormat.ldp_vc,
      );

      expect(mockedGetVerifiableCredential).toHaveBeenCalledTimes(1);
      expect(mockedGetVerifiableCredential).toHaveBeenCalledWith(vcData);
      expect(result).toEqual(expectedCredential);
      expect(result).not.toHaveProperty('fullResolvedPayload');
    });
  });
});
