import {EncryptedOutput} from './encryptedOutput';

describe('EncryptedOutput', () => {
  describe('constructor', () => {
    it('should create instance with encryptedData, iv and salt', () => {
      const output = new EncryptedOutput('data123', 'iv456', 'salt789');
      expect(output.encryptedData).toBe('data123');
      expect(output.iv).toBe('iv456');
      expect(output.salt).toBe('salt789');
    });
  });

  describe('ENCRYPTION_DELIMITER', () => {
    it('should be underscore', () => {
      expect(EncryptedOutput.ENCRYPTION_DELIMITER).toBe('_');
    });
  });

  describe('fromString', () => {
    it('should parse encrypted output from string', () => {
      const input = 'iv123_salt456_encrypted789';
      const result = EncryptedOutput.fromString(input);
      expect(result.iv).toBe('iv123');
      expect(result.salt).toBe('salt456');
      expect(result.encryptedData).toBe('encrypted789');
    });

    it('should handle complex data with underscores in encrypted data', () => {
      const output = new EncryptedOutput(
        'data_with_underscores',
        'myiv',
        'mysalt',
      );
      const str = output.toString();
      const parsed = EncryptedOutput.fromString(str);
      expect(parsed.iv).toBe('myiv');
      expect(parsed.salt).toBe('mysalt');
    });
  });

  describe('toString', () => {
    it('should serialize to iv_salt_encryptedData format', () => {
      const output = new EncryptedOutput('encrypted', 'iv', 'salt');
      expect(output.toString()).toBe('iv_salt_encrypted');
    });

    it('should roundtrip through fromString', () => {
      const original = new EncryptedOutput('testData', 'testIv', 'testSalt');
      const str = original.toString();
      const parsed = EncryptedOutput.fromString(str);
      expect(parsed.encryptedData).toBe('testData');
      expect(parsed.iv).toBe('testIv');
      expect(parsed.salt).toBe('testSalt');
    });
  });
});
