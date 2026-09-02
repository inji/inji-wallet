/*!
 * Copyright (c) 2020 Digital Bazaar, Inc. All rights reserved.
 */
import {Buffer} from 'buffer';

import forge, {pki, asn1, random} from 'node-forge';

type PrivateKey = forge.pki.PrivateKey;
type PublicKey = forge.pki.PublicKey;

const {publicKeyToAsn1, privateKeyToAsn1, privateKeyFromAsn1, ed25519} = pki;
const {toDer, fromDer: forgeFromDer} = asn1;
const {getBytesSync: getRandomBytes} = random;

// used to export node's public keys to buffers
const publicKeyEncoding = {format: 'der', type: 'spki'};
// used to turn private key bytes into a buffer in DER format
const DER_PRIVATE_KEY_PREFIX = Buffer.from(
  '302e020100300506032b657004220420',
  'hex',
);
// used to turn public key bytes into a buffer in DER format
const DER_PUBLIC_KEY_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');

const api = {
  /**
   * Generates a key using a 32 byte Uint8Array.
   *
   * @param {Uint8Array} seedBytes - The bytes for the private key.
   *
   * @returns {object} The object with the public and private key material.
   */
  async generateKeyPairFromSeed(seedBytes) {
    const privateKey: PrivateKey = forgePrivateKey(
      _privateKeyDerEncode({seedBytes}),
    );

    // this expects either a PEM encoded key or a node privateKeyObject
    const publicKey: PublicKey =
      createForgePublicKeyFromPrivateKeyBuffer(privateKey);
    const publicKeyBuffer: Buffer = Buffer.from(
      toDer(publicKeyToAsn1(publicKey)).getBytes(),
      'binary',
    );

    const publicKeyBytes = getKeyMaterial(publicKeyBuffer);
    return {
      publicKey: publicKeyBytes,
      secretKey: Buffer.concat([seedBytes, publicKeyBytes]),
    };
  },
  // generates an ed25519 key using a random seed
  async generateKeyPair() {
    const seed = randomBytes(32);
    return api.generateKeyPairFromSeed(seed);
  },
  async sign(privateKeyBytes, data) {
    const privateKey = Uint8Array.from(privateKeyBytes);
    const message = Buffer.from(data, 'utf8');

    const signature = ed25519.sign({
      privateKey,
      message,
    });

    return Buffer.from(signature).toString('binary');
  },
  async verify(publicKeyBytes: Uint8Array, data: string, signature: string) {
    const publicKey = createForgePublicKeyFromPublicKeyBuffer(publicKeyBytes);

    return forgeVerifyEd25519(data, publicKey, signature);
  },
};

export default api;

function forgePrivateKey(privateKeyBuffer: Buffer): PrivateKey {
  return privateKeyFromAsn1(fromDer(privateKeyBuffer));
}

function fromDer(keyBuffer: Buffer) {
  return forgeFromDer(keyBuffer.toString('binary'));
}

function createForgePublicKeyFromPrivateKeyBuffer(
  privateKeyObject: PrivateKey,
): PublicKey {
  const privateKeyBuffer = privateKeyToBuffer(privateKeyObject);
  const publicKey = ed25519.publicKeyFromPrivateKey({
    privateKey: privateKeyBuffer,
  });
  return publicKey;
}

/**
 * Validates that the public key is a raw 32-byte Uint8Array/Buffer.
 */
function createForgePublicKeyFromPublicKeyBuffer(
  publicKeyBuffer: Uint8Array,
): Uint8Array {
  if (publicKeyBuffer.length !== 32) {
    throw new Error(
      `Invalid Ed25519 public key length: expected 32 bytes, got ${publicKeyBuffer.length}`,
    );
  }

  return publicKeyBuffer;
}

function forgeVerifyEd25519(
  data: string,
  publicKey: Uint8Array,
  signature: string,
): boolean {
  return ed25519.verify({
    publicKey,
    signature: Buffer.from(signature, 'binary'),
    message: Buffer.from(data, 'utf8'),
  });
}

function randomBytes(length: number) {
  return Buffer.from(getRandomBytes(length), 'binary');
}

function privateKeyToBuffer(privateKey: PrivateKey): Buffer {
  const privateKeyAsn1 = privateKeyToAsn1(privateKey);
  const privateKeyDer = toDer(privateKeyAsn1).getBytes();

  const privateKeyBuffer = Buffer.from(privateKeyDer, 'binary');

  return privateKeyBuffer;
}
/**
 * The key material is the part of the buffer after the DER Prefix.
 *
 * @param {Buffer} buffer - A DER encoded key buffer.
 *
 * @throws {Error} If the buffer does not contain a valid DER Prefix.
 *
 * @returns {Buffer} The key material part of the Buffer.
 */
function getKeyMaterial(buffer) {
  if (buffer.indexOf(DER_PUBLIC_KEY_PREFIX) === 0) {
    return buffer.slice(DER_PUBLIC_KEY_PREFIX.length, buffer.length);
  }
  if (buffer.indexOf(DER_PRIVATE_KEY_PREFIX) === 0) {
    return buffer.slice(DER_PRIVATE_KEY_PREFIX.length, buffer.length);
  }
  throw new Error('Expected Buffer to match Ed25519 Public or Private Prefix');
}
/**
 * Takes a Buffer or Uint8Array with the raw private key and encodes it
 * in DER-encoded PKCS#8 format.
 * Allows Uint8Arrays to be interoperable with node's crypto functions.
 *
 * @param {object} options - Options to use.
 * @param {Buffer} [options.privateKeyBytes] - Required if no seedBytes.
 * @param {Buffer} [options.seedBytes] - Required if no privateKeyBytes.
 *
 * @throws {TypeError} Throws if the supplied buffer is not of the right size
 *  or not a Uint8Array or Buffer.
 *
 * @returns {Buffer} DER private key prefix + key bytes.
 */
export function _privateKeyDerEncode({privateKeyBytes, seedBytes}: any) {
  if (!(privateKeyBytes || seedBytes)) {
    throw new TypeError('`privateKeyBytes` or `seedBytes` is required.');
  }
  if (
    !privateKeyBytes &&
    !(seedBytes instanceof Uint8Array && seedBytes.length === 32)
  ) {
    throw new TypeError('`seedBytes` must be a 32 byte Buffer.');
  }
  if (
    !seedBytes &&
    !(privateKeyBytes instanceof Uint8Array && privateKeyBytes.length === 64)
  ) {
    throw new TypeError('`privateKeyBytes` must be a 64 byte Buffer.');
  }
  let p;
  if (seedBytes) {
    p = seedBytes;
  } else {
    // extract the first 32 bytes of the 64 byte private key representation
    p = privateKeyBytes.slice(0, 32);
  }
  return Buffer.concat([DER_PRIVATE_KEY_PREFIX, p]);
}

/**
 * Takes a Uint8Array of public key bytes and encodes it in DER-encoded
 * SubjectPublicKeyInfo (SPKI) format.
 * Allows Uint8Arrays to be interoperable with node's crypto functions.
 *
 * @param {object} options - Options to use.
 * @param {Uint8Array} options.publicKeyBytes - The keyBytes.
 *
 * @throws {TypeError} Throws if the bytes are not Uint8Array or of length 32.
 *
 * @returns {Buffer} DER Public key Prefix + key bytes.
 */
export function _publicKeyDerEncode({publicKeyBytes}) {
  if (!(publicKeyBytes instanceof Uint8Array && publicKeyBytes.length === 32)) {
    throw new TypeError('`publicKeyBytes` must be a 32 byte Buffer.');
  }
  return Buffer.concat([DER_PUBLIC_KEY_PREFIX, publicKeyBytes]);
}
