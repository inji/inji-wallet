jest.mock('react-native', () => ({
  NativeModules: {
    RNSecureKeyStore: {
      get: jest.fn().mockResolvedValue('mockPrivateKey'),
    },
  },
}));

import {getBindingCertificateConstant} from './SecureKeystore';

describe('shared/keystore/SecureKeystore', () => {
  describe('getBindingCertificateConstant', () => {
    it('should append -bindingCertificate to the id', () => {
      expect(getBindingCertificateConstant('key123')).toBe(
        'key123-bindingCertificate',
      );
    });

    it('should handle empty string id', () => {
      expect(getBindingCertificateConstant('')).toBe('-bindingCertificate');
    });

    it('should handle complex id strings', () => {
      expect(getBindingCertificateConstant('user:abc:xyz')).toBe(
        'user:abc:xyz-bindingCertificate',
      );
    });
  });
});
