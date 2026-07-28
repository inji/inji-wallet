const mockGenerateTokenDPoPProof = jest.fn();

jest.mock('../vciClient/VciClient', () => ({
  __esModule: true,
  default: {
    getInstance: () => ({
      generateTokenDPoPProof: mockGenerateTokenDPoPProof,
    }),
  },
}));

import {sendTokenRequest} from './TokenService';

type FakeResponseOptions = {
  ok: boolean;
  status?: number;
  body?: string;
  nonce?: string;
};

function fakeResponse({
  ok,
  status = 200,
  body = '{}',
  nonce,
}: FakeResponseOptions) {
  return {
    ok,
    status,
    text: async () => body,
    json: async () => JSON.parse(body),
    headers: {
      get: (header: string) => (header === 'DPoP-Nonce' ? nonce ?? null : null),
    },
  } as any;
}

describe('sendTokenRequest', () => {
  const baseRequest = {
    grantType: 'authorization_code',
    tokenEndpoint: 'https://as.example.com/token',
    authCode: 'auth-code',
    codeVerifier: 'verifier',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('attaches the DPoP header when dpopProof is present', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      fakeResponse({
        ok: true,
        body: '{"access_token":"t","token_type":"DPoP"}',
      }),
    );

    const result = await sendTokenRequest({
      ...baseRequest,
      dpopProof: 'proof-a',
    });

    expect(result.access_token).toBe('t');
    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers.DPoP).toBe('proof-a');
  });

  it('does not attach the DPoP header when dpopProof is absent', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      fakeResponse({
        ok: true,
        body: '{"access_token":"t","token_type":"Bearer"}',
      }),
    );

    await sendTokenRequest({...baseRequest});

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers.DPoP).toBeUndefined();
  });

  it('retries with a fresh proof on a use_dpop_nonce challenge', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(
        fakeResponse({
          ok: false,
          status: 400,
          body: '{"error":"use_dpop_nonce"}',
          nonce: 'server-nonce',
        }),
      )
      .mockResolvedValueOnce(
        fakeResponse({
          ok: true,
          body: '{"access_token":"t","token_type":"DPoP"}',
        }),
      );
    mockGenerateTokenDPoPProof.mockResolvedValueOnce('proof-b');

    const result = await sendTokenRequest({
      ...baseRequest,
      dpopProof: 'proof-a',
    });

    expect(result.access_token).toBe('t');
    expect(mockGenerateTokenDPoPProof).toHaveBeenCalledWith('server-nonce');
    expect((global.fetch as jest.Mock).mock.calls).toHaveLength(2);
    const [, firstOptions] = (global.fetch as jest.Mock).mock.calls[0];
    const [, retryOptions] = (global.fetch as jest.Mock).mock.calls[1];
    expect(firstOptions.headers.DPoP).toBe('proof-a');
    expect(retryOptions.headers.DPoP).toBe('proof-b');
  });

  it('throws when the retry after a nonce challenge also fails', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(
        fakeResponse({
          ok: false,
          status: 400,
          body: '{"error":"use_dpop_nonce"}',
          nonce: 'server-nonce',
        }),
      )
      .mockResolvedValueOnce(
        fakeResponse({ok: false, status: 400, body: 'still failing'}),
      );
    mockGenerateTokenDPoPProof.mockResolvedValueOnce('proof-b');

    await expect(
      sendTokenRequest({...baseRequest, dpopProof: 'proof-a'}),
    ).rejects.toMatchObject({issuerErrorCode: 'UNKNOWN_ERROR'});
  });

  it('surfaces proof generation failures during a use_dpop_nonce retry', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      fakeResponse({
        ok: false,
        status: 400,
        body: '{"error":"use_dpop_nonce"}',
        nonce: 'server-nonce',
      }),
    );
    mockGenerateTokenDPoPProof.mockRejectedValueOnce(
      new Error('bridge failed'),
    );

    await expect(
      sendTokenRequest({...baseRequest, dpopProof: 'proof-a'}),
    ).rejects.toThrow('bridge failed');
    expect((global.fetch as jest.Mock).mock.calls).toHaveLength(1);
  });

  it('does not retry for non use_dpop_nonce errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      fakeResponse({
        ok: false,
        status: 400,
        body: '{"error":"invalid_grant","error_description":"bad code"}',
      }),
    );

    await expect(
      sendTokenRequest({...baseRequest, dpopProof: 'proof-a'}),
    ).rejects.toMatchObject({
      code: 'invalid_grant',
      message: 'bad code',
      issuerErrorCode: 'invalid_grant',
      issuerErrorMessage: 'bad code',
    });
    expect(mockGenerateTokenDPoPProof).not.toHaveBeenCalled();
    expect((global.fetch as jest.Mock).mock.calls).toHaveLength(1);
  });

  it('uses the proxy token endpoint when provided', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      fakeResponse({ok: true, body: '{"access_token":"t"}'}),
    );

    await sendTokenRequest({...baseRequest}, 'https://proxy.example.com/token');

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('https://proxy.example.com/token');
  });

  it('throws when tokenEndpoint is missing', async () => {
    await expect(
      sendTokenRequest({grantType: 'authorization_code'}),
    ).rejects.toThrow('tokenEndpoint is required');
  });
});
