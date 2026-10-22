const mockGenerateTokenDPoPProof = jest.fn();

jest.mock('../vciClient/VciClient', () => ({
  __esModule: true,
  default: {
    getInstance: () => ({
      generateTokenDPoPProof: mockGenerateTokenDPoPProof,
    }),
  },
}));

const mockEnsureRegistered = jest.fn();
const mockBuildDeviceProof = jest.fn();
const mockForgetRegistration = jest.fn();
const mockIsDeviceAttestationSupported = jest.fn();

jest.mock('../deviceAttestation/DeviceAttestationService', () => {
  const actual = jest.requireActual(
    '../deviceAttestation/DeviceAttestationService',
  );
  return {
    DEVICE_PROOF_HEADER: actual.DEVICE_PROOF_HEADER,
    DEVICE_NOT_REGISTERED: actual.DEVICE_NOT_REGISTERED,
    mimotoBaseFromTokenEndpoint: actual.mimotoBaseFromTokenEndpoint,
    ensureRegistered: (...args: any[]) => mockEnsureRegistered(...args),
    buildDeviceProof: (...args: any[]) => mockBuildDeviceProof(...args),
    forgetRegistration: (...args: any[]) => mockForgetRegistration(...args),
    isDeviceAttestationSupported: () => mockIsDeviceAttestationSupported(),
  };
});

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

describe('sendTokenRequest through the mimoto get-token proxy', () => {
  const MIMOTO = 'https://api.example.net/v1/mimoto';
  const PROXY = `${MIMOTO}/v2/get-token/issuerX`;
  const request = {
    grantType: 'authorization_code',
    tokenEndpoint: 'https://as.example.com/token',
    authCode: 'auth-code',
    codeVerifier: 'verifier',
    dpopProof: 'dpop-proof',
  };
  const expectedBody =
    'grant_type=authorization_code&code=auth-code&code_verifier=verifier';
  const sentHeaders = (call: number) =>
    (global.fetch as jest.Mock).mock.calls[call][1].headers;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    mockIsDeviceAttestationSupported.mockReturnValue(true);
    mockEnsureRegistered.mockResolvedValue(undefined);
    mockForgetRegistration.mockResolvedValue(undefined);
    let n = 0;
    mockBuildDeviceProof.mockImplementation(async () => `device-proof-${++n}`);
  });

  it('attaches a device proof bound to the exact body sent', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      fakeResponse({ok: true, body: '{"access_token":"t"}'}),
    );

    await sendTokenRequest({...request}, PROXY);

    expect(mockEnsureRegistered).toHaveBeenCalledWith(MIMOTO);
    expect(mockBuildDeviceProof).toHaveBeenCalledWith(PROXY, expectedBody);
    expect((global.fetch as jest.Mock).mock.calls[0][1].body).toBe(
      expectedBody,
    );
    expect(sentHeaders(0)['X-Inji-Device-Proof']).toBe('device-proof-1');
    expect(sentHeaders(0).DPoP).toBe('dpop-proof');
  });

  it('re-registers once and retries with a fresh proof when mimoto does not know the device', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(
        fakeResponse({
          ok: false,
          status: 401,
          body: '{"error":"device_not_registered"}',
        }),
      )
      .mockResolvedValueOnce(
        fakeResponse({ok: true, body: '{"access_token":"t"}'}),
      );

    const result = await sendTokenRequest({...request}, PROXY);

    expect(result).toEqual({access_token: 't'});
    expect(mockForgetRegistration).toHaveBeenCalledWith(MIMOTO);
    expect(mockEnsureRegistered).toHaveBeenCalledTimes(2);
    expect(sentHeaders(1)['X-Inji-Device-Proof']).toBe('device-proof-2');
    expect(sentHeaders(1).DPoP).toBe('dpop-proof');
  });

  it('does not loop when the device is still not registered after retrying', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      fakeResponse({
        ok: false,
        status: 401,
        body: '{"error":"device_not_registered"}',
      }),
    );

    await expect(sendTokenRequest({...request}, PROXY)).rejects.toMatchObject({
      code: 'device_not_registered',
    });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('sends a new device proof with the DPoP nonce retry', async () => {
    mockGenerateTokenDPoPProof.mockResolvedValueOnce('dpop-proof-with-nonce');
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(
        fakeResponse({
          ok: false,
          status: 400,
          body: '{"error":"use_dpop_nonce"}',
          nonce: 'as-nonce',
        }),
      )
      .mockResolvedValueOnce(
        fakeResponse({ok: true, body: '{"access_token":"t"}'}),
      );

    await sendTokenRequest({...request}, PROXY);

    expect(sentHeaders(1)['X-Inji-Device-Proof']).toBe('device-proof-2');
    expect(sentHeaders(1).DPoP).toBe('dpop-proof-with-nonce');
  });

  it('still sends the token request when registration fails', async () => {
    mockEnsureRegistered.mockRejectedValue(
      new Error('Play Integrity unavailable'),
    );
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      fakeResponse({ok: true, body: '{"access_token":"t"}'}),
    );

    await sendTokenRequest({...request}, PROXY);

    expect(sentHeaders(0)['X-Inji-Device-Proof']).toBeUndefined();
  });

  it('adds no device proof when attestation is not supported (e.g. iOS)', async () => {
    mockIsDeviceAttestationSupported.mockReturnValue(false);
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      fakeResponse({ok: true, body: '{}'}),
    );

    await sendTokenRequest({...request}, PROXY);

    expect(mockEnsureRegistered).not.toHaveBeenCalled();
    expect(sentHeaders(0)['X-Inji-Device-Proof']).toBeUndefined();
  });

  it('adds no device proof when calling the authorization server directly', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      fakeResponse({ok: true, body: '{}'}),
    );

    await sendTokenRequest({...request});

    expect(mockEnsureRegistered).not.toHaveBeenCalled();
    expect(sentHeaders(0)['X-Inji-Device-Proof']).toBeUndefined();
  });
});
