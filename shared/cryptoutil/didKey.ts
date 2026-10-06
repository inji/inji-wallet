import {Buffer} from 'buffer';
import bs58 from 'bs58';
import forge from 'node-forge';
import {KeyTypes} from './KeyTypes';

// Multicodec varint prefixes from the did:key method registry. The raw key bytes that follow
// differ per type: Ed25519 is the raw 32-byte key, the EC curves use the 33-byte compressed
// point, and RSA uses the PKCS#1 DER encoding of RSAPublicKey.
const MULTICODEC_PREFIX: Record<string, number[]> = {
  [KeyTypes.ED25519]: [0xed, 0x01], // ed25519-pub  0xed
  [KeyTypes.ES256K]: [0xe7, 0x01], // secp256k1-pub 0xe7
  [KeyTypes.ES256]: [0x80, 0x24], // p256-pub      0x1200
  [KeyTypes.RS256]: [0x85, 0x24], // rsa-pub       0x1205
};

const decodeBase64Url = (value: string): Buffer =>
  Buffer.from(base64UrlToBase64(value), 'base64');

function base64UrlToBase64(value: string): string {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  return padded + '='.repeat((4 - (padded.length % 4)) % 4);
}

/**
 * SEC 1 compressed point: a parity byte for `y` followed by `x`. Both P-256 and secp256k1 use
 * 32-byte coordinates, so this needs no curve arithmetic - only the parity of the final `y` byte.
 */
function compressedEcPoint(jwk: any): Uint8Array {
  const x = decodeBase64Url(jwk.x);
  const y = decodeBase64Url(jwk.y);
  const parity = (y[y.length - 1] & 1) === 0 ? 0x02 : 0x03;

  return Uint8Array.from(Buffer.concat([Buffer.from([parity]), x]));
}

function pkcs1PublicKeyDer(jwk: any): Uint8Array {
  const toBigInteger = (value: string) =>
    new forge.jsbn.BigInteger(decodeBase64Url(value).toString('hex'), 16);
  const publicKey = forge.pki.setRsaPublicKey(
    toBigInteger(jwk.n),
    toBigInteger(jwk.e),
  );
  const der = forge.asn1
    .toDer(forge.pki.publicKeyToRSAPublicKey(publicKey))
    .getBytes();

  return Uint8Array.from(der, char => char.charCodeAt(0));
}

function rawPublicKeyBytes(jwk: any, keyType: string): Uint8Array {
  switch (keyType) {
    case KeyTypes.ED25519:
      return Uint8Array.from(decodeBase64Url(jwk.x));
    case KeyTypes.ES256:
    case KeyTypes.ES256K:
      return compressedEcPoint(jwk);
    case KeyTypes.RS256:
      return pkcs1PublicKeyDer(jwk);
    default:
      throw new Error(
        `did:key encoding is not supported for keyType: ${keyType}`,
      );
  }
}

/**
 * Encodes a public key JWK as a did:key identifier - `did:key:z<base58btc(multicodec || key)>`.
 */
export function encodeDidKey(publicKeyJwk: any, keyType: string): string {
  const prefix = MULTICODEC_PREFIX[keyType];
  if (!prefix) {
    throw new Error(
      `did:key encoding is not supported for keyType: ${keyType}`,
    );
  }

  const keyBytes = rawPublicKeyBytes(publicKeyJwk, keyType);
  const multicodec = new Uint8Array(prefix.length + keyBytes.length);
  multicodec.set(prefix, 0);
  multicodec.set(keyBytes, prefix.length);

  return `did:key:z${bs58.encode(multicodec)}`;
}

/**
 * The verification method id for a did:key, which repeats the multibase value as the fragment.
 */
export function didKeyVerificationMethod(
  publicKeyJwk: any,
  keyType: string,
): string {
  const did = encodeDidKey(publicKeyJwk, keyType);

  return `${did}#${did.slice('did:key:'.length)}`;
}
