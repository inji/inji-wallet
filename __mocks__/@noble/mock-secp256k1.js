const mockSecp256k1 = {
  utils: {
    randomPrivateKey: () =>
      new Uint8Array([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32,
      ]),
  },

  etc: {
    hmacSha256Sync: undefined,
    hmacSha256Async: undefined,
    concatBytes: (...arrays) => {
      const totalLength = arrays.reduce((sum, a) => sum + a.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
      }
      return result;
    },
  },

  getPublicKey: privateKey =>
    new Uint8Array([
      /* predefined public key */
    ]),

  sign: (messageHash, privateKey) => ({
    toCompactRawBytes: () => new Uint8Array([1, 2, 3, 4]),
  }),

  signAsync: (messageHash, privateKey, opts) =>
    Promise.resolve({
      toCompactRawBytes: () => new Uint8Array([1, 2, 3, 4]),
    }),

  verify: (signature, messageHash, publicKey) => true, // Always returns true in this example
};

jest.mock('@noble/secp256k1', () => mockSecp256k1);
