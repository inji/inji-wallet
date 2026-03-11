jest.mock('@digitalcredentials/vc', () => ({
  createPresentation: jest.fn(({verifiableCredential}) => ({
    type: ['VerifiablePresentation'],
    verifiableCredential,
  })),
  signPresentation: jest.fn(({presentation, suite, challenge}) =>
    Promise.resolve({
      ...presentation,
      proof: {
        type: 'RsaSignature2018',
        challenge,
        verificationMethod: suite.verificationMethod,
      },
    }),
  ),
}));
jest.mock('@digitalcredentials/jsonld', () => ({
  documentLoaders: {
    xhr: jest.fn(() => 'mockDocLoader'),
  },
}));
jest.mock(
  '../../lib/jsonld-signatures/suites/rsa2018/RsaSignature2018',
  () => ({
    RsaSignature2018: jest.fn().mockImplementation(opts => ({
      type: 'RsaSignature2018',
      verificationMethod: opts.verificationMethod,
      date: opts.date,
    })),
  }),
);

import {createVerifiablePresentation} from './createVerifiablePresentation';
import vcjs from '@digitalcredentials/vc';
import jsonld from '@digitalcredentials/jsonld';
import {RsaSignature2018} from '../../lib/jsonld-signatures/suites/rsa2018/RsaSignature2018';

describe('createVerifiablePresentation', () => {
  const mockVc = {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiableCredential'],
    credentialSubject: {id: 'did:example:123'},
    proof: {
      type: 'RsaSignature2018',
      verificationMethod: 'did:example:issuer#key-1',
      created: '2023-01-01T00:00:00Z',
    },
  } as any;

  const challenge = 'test-challenge-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a presentation from a verifiable credential', async () => {
    const result = await createVerifiablePresentation(mockVc, challenge);
    expect(vcjs.createPresentation).toHaveBeenCalledWith({
      verifiableCredential: [mockVc],
    });
  });

  it('should create RsaSignature2018 suite with vc proof details', async () => {
    await createVerifiablePresentation(mockVc, challenge);
    expect(RsaSignature2018).toHaveBeenCalledWith({
      verificationMethod: 'did:example:issuer#key-1',
      date: '2023-01-01T00:00:00Z',
    });
  });

  it('should sign the presentation with challenge and document loader', async () => {
    await createVerifiablePresentation(mockVc, challenge);
    expect(vcjs.signPresentation).toHaveBeenCalledWith(
      expect.objectContaining({
        challenge: 'test-challenge-123',
        documentLoader: 'mockDocLoader',
      }),
    );
  });

  it('should return signed presentation with proof', async () => {
    const result = await createVerifiablePresentation(mockVc, challenge);
    expect(result).toHaveProperty('proof');
    expect(result.proof.challenge).toBe(challenge);
  });

  it('should use xhr document loader', async () => {
    await createVerifiablePresentation(mockVc, challenge);
    expect(jsonld.documentLoaders.xhr).toHaveBeenCalled();
  });

  it('should include the vc in the presentation', async () => {
    const result = await createVerifiablePresentation(mockVc, challenge);
    expect(result.verifiableCredential).toEqual([mockVc]);
  });
});
