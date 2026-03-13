import {base58Decode} from './util';

describe('util - base58Decode', () => {
  it('should decode valid base58 data', () => {
    const mockDecode = jest.fn(() => new Uint8Array([1, 2, 3]));
    const result = base58Decode({
      decode: mockDecode,
      keyMaterial: 'abc123',
      type: 'public',
    });
    expect(result).toEqual(new Uint8Array([1, 2, 3]));
    expect(mockDecode).toHaveBeenCalledWith('abc123');
  });

  it('should throw TypeError when decode returns undefined', () => {
    const mockDecode = jest.fn(() => undefined);
    expect(() =>
      base58Decode({decode: mockDecode, keyMaterial: 'bad', type: 'public'}),
    ).toThrow(TypeError);
    expect(() =>
      base58Decode({decode: mockDecode, keyMaterial: 'bad', type: 'public'}),
    ).toThrow('The public key material must be Base58 encoded.');
  });

  it('should throw TypeError when decode throws', () => {
    const mockDecode = jest.fn(() => {
      throw new Error('bad input');
    });
    expect(() =>
      base58Decode({
        decode: mockDecode,
        keyMaterial: 'invalid',
        type: 'private',
      }),
    ).toThrow('The private key material must be Base58 encoded.');
  });

  it('should include the key type in error message', () => {
    const mockDecode = jest.fn(() => undefined);
    expect(() =>
      base58Decode({decode: mockDecode, keyMaterial: 'x', type: 'secret'}),
    ).toThrow('The secret key material must be Base58 encoded.');
  });

  it('should return decoded bytes of various types', () => {
    const buff = Buffer.from([10, 20, 30]);
    const mockDecode = jest.fn(() => buff);
    const result = base58Decode({
      decode: mockDecode,
      keyMaterial: 'test',
      type: 'public',
    });
    expect(result).toBe(buff);
  });
});
