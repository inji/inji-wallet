import bs58 from 'bs58';
import {Buffer} from 'buffer';
import {encodeDidKey, didKeyVerificationMethod} from './didKey';
import {KeyTypes} from './KeyTypes';

const base64url = (bytes: Uint8Array) =>
  Buffer.from(bytes)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

// Published did:key method test vectors. Each is decoded back into the JWK the wallet would
// derive from its own keystore, so a wrong multicodec prefix or a missing point compression
// makes the round trip fail.
const VECTORS = {
  [KeyTypes.ED25519]:
    'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
  [KeyTypes.ES256K]:
    'did:key:zQ3shokFTS3brHcDQrn82RUDfCZESWL1ZdCEJwekUDPQiYBme',
  [KeyTypes.ES256]: 'did:key:zDnaerDaTF5BXEavCrfRZEk316dpbLsfPDZ3WJ5hRTPFU2169',
};

const keyBytesOf = (did: string) =>
  bs58.decode(did.slice('did:key:z'.length)).slice(2);

describe('encodeDidKey', () => {
  it('encodes an Ed25519 key against the did:key test vector', () => {
    const raw = keyBytesOf(VECTORS[KeyTypes.ED25519]);
    const jwk = {kty: 'OKP', crv: 'Ed25519', x: base64url(raw)};

    expect(encodeDidKey(jwk, KeyTypes.ED25519)).toBe(VECTORS[KeyTypes.ED25519]);
  });

  it.each([
    [KeyTypes.ES256, 'P-256'],
    [KeyTypes.ES256K, 'secp256k1'],
  ])('compresses an %s point to the did:key test vector', (keyType, crv) => {
    const compressed = keyBytesOf(VECTORS[keyType]);
    // The vector carries x plus a parity byte. Recovering the real y needs curve arithmetic, and
    // compression only reads y's parity - so any y with the matching parity exercises the same path.
    const y = Buffer.alloc(32, 0x11);
    y[31] = compressed[0] === 0x02 ? 0x02 : 0x03;
    const jwk = {
      kty: 'EC',
      crv,
      x: base64url(Uint8Array.from(compressed.slice(1))),
      y: base64url(y),
    };

    expect(encodeDidKey(jwk, keyType)).toBe(VECTORS[keyType]);
  });

  it('encodes an RSA key as PKCS#1 DER behind the rsa-pub multicodec', () => {
    // A 2048-bit modulus. The high bit must be set, as it is for a real RSA key: that is what
    // makes DER pad the INTEGER and lands the vector on the published z4MXj1wBzi9 prefix.
    const modulus = Buffer.alloc(256, 0xab);
    modulus[0] = 0xc7;
    const jwk = {
      kty: 'RSA',
      n: base64url(modulus),
      e: base64url(Buffer.from([0x01, 0x00, 0x01])),
    };

    const did = encodeDidKey(jwk, KeyTypes.RS256);
    const decoded = bs58.decode(did.slice('did:key:z'.length));

    expect(Buffer.from(decoded.slice(0, 2)).toString('hex')).toBe('8524');
    // PKCS#1 RSAPublicKey is a SEQUENCE of two INTEGERs.
    expect(decoded[2]).toBe(0x30);
    expect(did.startsWith('did:key:z4MXj1wBzi9')).toBe(true);
  });

  it('rejects a key type with no did:key encoding', () => {
    expect(() => encodeDidKey({}, 'X25519')).toThrow(
      'did:key encoding is not supported for keyType: X25519',
    );
  });
});

describe('didKeyVerificationMethod', () => {
  it('repeats the multibase value as the fragment', () => {
    const raw = keyBytesOf(VECTORS[KeyTypes.ED25519]);
    const jwk = {kty: 'OKP', crv: 'Ed25519', x: base64url(raw)};
    const did = VECTORS[KeyTypes.ED25519];

    expect(didKeyVerificationMethod(jwk, KeyTypes.ED25519)).toBe(
      `${did}#${did.slice('did:key:'.length)}`,
    );
  });
});
