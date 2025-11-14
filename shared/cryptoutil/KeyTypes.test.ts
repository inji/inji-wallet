import {KeyTypes} from './KeyTypes';

describe('KeyTypes', () => {
  it('should have RS256 key type', () => {
    expect(KeyTypes.RS256).toBe('RS256');
  });

  it('should have ES256 key type', () => {
    expect(KeyTypes.ES256).toBe('ES256');
  });

  it('should have ES256K key type', () => {
    expect(KeyTypes.ES256K).toBe('ES256K');
  });

  it('should have ED25519 key type', () => {
    expect(KeyTypes.ED25519).toBe('Ed25519');
  });

  it('should have exactly 4 key types', () => {
    const keyTypeCount = Object.keys(KeyTypes).length;
    expect(keyTypeCount).toBe(4);
  });

  it('should allow access via enum key', () => {
    expect(KeyTypes['RS256']).toBe('RS256');
    expect(KeyTypes['ES256']).toBe('ES256');
    expect(KeyTypes['ES256K']).toBe('ES256K');
    expect(KeyTypes['ED25519']).toBe('Ed25519');
  });

  it('should have all unique values', () => {
    const values = Object.values(KeyTypes);
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);
  });
});
