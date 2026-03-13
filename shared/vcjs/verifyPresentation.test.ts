jest.mock('@digitalcredentials/vc', () => ({
  __esModule: true,
  default: {
    verify: jest.fn().mockResolvedValue({verified: true}),
  },
}));
jest.mock('@digitalcredentials/jsonld', () => ({
  __esModule: true,
  default: {
    documentLoaders: {
      xhr: jest.fn(() => 'mock-loader'),
    },
  },
}));
jest.mock(
  '../../lib/jsonld-signatures/suites/rsa2018/RsaSignature2018',
  () => ({
    RsaSignature2018: jest
      .fn()
      .mockImplementation(() => ({type: 'RsaSignature2018'})),
  }),
);

import {verifyPresentation} from './verifyPresentation';

describe('verifyPresentation', () => {
  it('should return true for valid presentation', async () => {
    const presentation = {
      proof: {
        verificationMethod: 'did:example:123#key-1',
        created: '2023-01-01',
      },
    };
    const result = await verifyPresentation(
      presentation as any,
      'challenge-123',
    );
    expect(result).toBe(true);
  });

  it('should call vcjs.verify with correct params', async () => {
    const vcjs = require('@digitalcredentials/vc').default;
    const presentation = {
      proof: {
        verificationMethod: 'did:example:456#key-2',
        created: '2023-06-15',
      },
    };
    await verifyPresentation(presentation as any, 'test-challenge');
    expect(vcjs.verify).toHaveBeenCalledWith(
      expect.objectContaining({
        presentation,
        challenge: 'test-challenge',
      }),
    );
  });

  it('should return false for failed verification', async () => {
    const vcjs = require('@digitalcredentials/vc').default;
    vcjs.verify.mockResolvedValueOnce({verified: false});
    const presentation = {
      proof: {
        verificationMethod: 'did:example:789',
        created: '2023-01-01',
      },
    };
    const result = await verifyPresentation(presentation as any, 'ch');
    expect(result).toBe(false);
  });
});
