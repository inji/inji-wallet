jest.mock('../../shared/request', () => ({
  request: jest
    .fn()
    .mockResolvedValue({response: {linkedTransactionId: 'txn123'}}),
}));
jest.mock('../../shared/api', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue({
    issuer: 'test-issuer',
    audience: 'test-audience',
  }),
  API_URLS: {
    linkTransaction: {
      method: 'POST',
      buildURL: jest.fn(() => '/linked-authorization/link-transaction'),
    },
    authenticate: {
      method: 'POST',
      buildURL: jest.fn(() => '/linked-authorization/authenticate'),
    },
    sendConsent: {
      method: 'POST',
      buildURL: jest.fn(() => '/linked-authorization/consent'),
    },
  },
}));
jest.mock('../../shared/constants', () => ({
  ESIGNET_BASE_URL: 'https://esignet.test.com',
}));
jest.mock('../../shared/cryptoutil/cryptoUtil', () => ({
  isHardwareKeystoreExists: true,
  getJWT: jest.fn().mockResolvedValue('header.payload.signature'),
  fetchKeyPair: jest.fn().mockResolvedValue({
    publicKey: 'testPublicKey',
    privateKey: 'testPrivateKey',
  }),
}));
jest.mock('../../shared/keystore/SecureKeystore', () => ({
  getPrivateKey: jest.fn().mockResolvedValue('privateKey123'),
}));

import {QrLoginServices} from './QrLoginServices';
import {request} from '../../shared/request';

describe('QrLoginServices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('linkTransaction', () => {
    it('should call request with link code', async () => {
      const context = {linkCode: 'abc123'};
      const result = await QrLoginServices.linkTransaction(context);
      expect(request).toHaveBeenCalled();
      expect(result).toEqual({linkedTransactionId: 'txn123'});
    });
  });

  describe('sendAuthenticate', () => {
    it('should send authentication request with JWT', async () => {
      const context = {
        selectedVc: {
          vcMetadata: {
            mosipIndividualId: 'individual123',
            downloadKeyType: 'RS256',
          },
          walletBindingResponse: {walletBindingId: 'binding123'},
        },
        linkTransactionId: 'txn123',
        thumbprint: 'thumb123',
      };
      const result = await QrLoginServices.sendAuthenticate(context);
      expect(request).toHaveBeenCalled();
      expect(result).toEqual({linkedTransactionId: 'txn123'});
    });
  });

  describe('sendConsent', () => {
    it('should send consent with detached signature', async () => {
      const context = {
        selectedVc: {
          vcMetadata: {downloadKeyType: 'RS256'},
          walletBindingResponse: {walletBindingId: 'binding123'},
        },
        linkedTransactionId: 'ltxn123',
        essentialClaims: ['name'],
        selectedVoluntaryClaims: ['email'],
        authorizeScopes: ['openid'],
        thumbprint: 'thumb123',
      };
      await QrLoginServices.sendConsent(context);
      expect(request).toHaveBeenCalled();
    });
  });

  describe('linkTransaction - error path', () => {
    it('should reject when request fails', async () => {
      (request as jest.Mock).mockRejectedValueOnce(new Error('network error'));
      await expect(
        QrLoginServices.linkTransaction({linkCode: 'abc'}),
      ).rejects.toThrow('network error');
    });
  });
});
