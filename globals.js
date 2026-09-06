/* eslint-disable @typescript-eslint/no-var-requires */
global.TextEncoder = require('text-encoding').TextEncoder;

// Upstream rdf-canonize (used by jsonld-rdfc for Data Integrity canonicalization)
// expects `self.crypto.subtle.digest(...)`. We shim it synchronously using @noble/hashes
// so canonicalization has zero dependency on PRNG/isomorphic-webcrypto entropy initialization,
// avoiding "You must wait until the library is secure" errors on React Native / iOS.
const {sha256} = require('@noble/hashes/sha256');
const {sha1} = require('@noble/hashes/sha1');

const nobleSubtleDigest = async (algorithm, data) => {
  const name = (
    typeof algorithm === 'string'
      ? algorithm
      : (algorithm && algorithm.name) || ''
  ).toUpperCase();
  const input = data instanceof Uint8Array ? data : new Uint8Array(data);
  let hash;
  if (name === 'SHA-256') {
    hash = sha256(input);
  } else if (name === 'SHA-1') {
    hash = sha1(input);
  } else {
    throw new Error(
      `Unsupported digest algorithm: ${JSON.stringify(algorithm)}`,
    );
  }
  return hash.buffer.slice(hash.byteOffset, hash.byteOffset + hash.byteLength);
};

if (typeof global.self === 'undefined') {
  global.self = global;
}

try {
  if (!global.crypto) {
    global.crypto = {
      subtle: {
        digest: nobleSubtleDigest,
      },
    };
  } else if (!global.crypto.subtle) {
    Object.defineProperty(global.crypto, 'subtle', {
      value: {
        digest: nobleSubtleDigest,
      },
      configurable: true,
      enumerable: true,
      writable: true,
    });
  } else {
    global.crypto.subtle.digest = nobleSubtleDigest;
  }
} catch (e) {
  console.warn('Unable to install crypto.subtle.digest shim:', e);
}
