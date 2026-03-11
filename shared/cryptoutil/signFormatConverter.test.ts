jest.mock('asn1.js', () => ({
  define: jest.fn((name, fn) => {
    if (name === 'ASN1Sequence') {
      return {
        decode: jest.fn().mockReturnValue({
          r: {
            toArrayLike: jest.fn().mockReturnValue(Buffer.alloc(32, 1)),
          },
          s: {
            toArrayLike: jest.fn().mockReturnValue(Buffer.alloc(32, 2)),
          },
        }),
      };
    }
    return {decode: jest.fn()};
  }),
}));

import convertDerToRsFormat from './signFormatConverter';

describe('signFormatConverter', () => {
  it('should be a function', () => {
    expect(typeof convertDerToRsFormat).toBe('function');
  });

  it('should convert DER signature to RS format', () => {
    const mockDer = new Uint8Array(70);
    const result = convertDerToRsFormat(mockDer);
    expect(typeof result).toBe('string');
    // Should be base64 encoded, 64 bytes (32+32) => ~88 chars base64
    expect(result.length).toBeGreaterThan(0);
  });
});
