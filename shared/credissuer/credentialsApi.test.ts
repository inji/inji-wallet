jest.mock('../constants', () => ({
  CREDISSUER_API_BASE_URL: 'https://api.credissuer.test',
  CREDISSUER_API_TOKEN_VALUE: 'test-token',
}));

import {
  attachIssuerQrCode,
  fetchIssuerQrCodeImage,
  fetchIssuerQrCodeUrl,
  getTokenResponseCredentialId,
  resolveCredissuerCredentialId,
} from './credentialsApi';

const VC_ID = 'urn:uuid:64218a46-4d0d-4955-8d5f-1df660210c28';
const FRESH_QR =
  'https://cdn.credissuer.com/media/vc_presentation_files/UTPNID002/qr_presentation_UTPNID002.png?Expires=2';

const mockFetchResponse = (status: number, body: unknown) =>
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });

const credentialsApiBody = (id: string) => ({
  format: 'ldp_vc',
  credential: {
    id,
    credentialSubject: {credential_id: 'UTPNID002', qr_code: FRESH_QR},
  },
});

describe('fetchIssuerQrCodeUrl', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('calls the credentials API with the bearer token and returns the fresh qr_code', async () => {
    mockFetchResponse(200, credentialsApiBody(VC_ID));

    await expect(fetchIssuerQrCodeUrl('UTPNID002', VC_ID)).resolves.toBe(
      FRESH_QR,
    );
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.credissuer.test/api/credentials/credentials/UTPNID002',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      }),
    );
  });

  it("ignores the QR when the API returns a different credential than the wallet's", async () => {
    mockFetchResponse(200, credentialsApiBody('urn:uuid:someone-else'));

    await expect(fetchIssuerQrCodeUrl('UTPNID002', VC_ID)).resolves.toBeNull();
  });

  it('returns null without calling the API when the wallet credential has no id to verify ownership', async () => {
    mockFetchResponse(200, credentialsApiBody(VC_ID));

    await expect(fetchIssuerQrCodeUrl('UTPNID002', null)).resolves.toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns null when the response has no qr_code', async () => {
    mockFetchResponse(200, {credential: {id: VC_ID, credentialSubject: {}}});

    await expect(fetchIssuerQrCodeUrl('UTPNID002', VC_ID)).resolves.toBeNull();
  });

  it('rejects on an error status so the caller keeps the stored QR', async () => {
    mockFetchResponse(404, {error: 'Credentials not found'});

    await expect(fetchIssuerQrCodeUrl('UNKNOWN', VC_ID)).rejects.toThrow(
      'HTTP 404',
    );
  });
});

const PNG_BASE64 = 'iVBORw0KGgo=';

const MAX_QR_IMAGE_BYTES = 1024 * 1024;

// The credentials API answers first, then the presigned image download. Returns the image
// response's blob() mock, so a test can check whether the body was read at all.
const mockApiThenImage = (
  apiBody: unknown,
  image: {
    ok?: boolean;
    status?: number;
    type?: string;
    /** What the server declares in Content-Length; omitted means no header. */
    contentLength?: string;
    /** The real size of the body. */
    size?: number;
  } = {},
) => {
  const blob = jest.fn(async () => ({
    type: image.type ?? 'image/png',
    size: image.size ?? 8,
  }));
  (global.fetch as jest.Mock)
    .mockResolvedValueOnce({ok: true, status: 200, json: async () => apiBody})
    .mockResolvedValueOnce({
      ok: image.ok ?? true,
      status: image.status ?? 200,
      headers: {
        get: (name: string) =>
          name.toLowerCase() === 'content-length'
            ? image.contentLength ?? null
            : null,
      },
      blob,
    });
  return blob;
};

// Reads any blob as the same PNG, labelled with the blob's own type.
class FakeFileReader {
  result: string | null = null;
  error: Error | null = null;
  onloadend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  readAsDataURL(blob: {type: string}) {
    this.result = `data:${blob.type};base64,${PNG_BASE64}`;
    this.onloadend?.();
  }
}

const OriginalFileReader = global.FileReader;
beforeAll(() => {
  global.FileReader = FakeFileReader as unknown as typeof FileReader;
});
afterAll(() => {
  global.FileReader = OriginalFileReader;
});

describe('fetchIssuerQrCodeImage', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('downloads the presigned QR image and returns it as a data URI', async () => {
    mockApiThenImage(credentialsApiBody(VC_ID));

    await expect(fetchIssuerQrCodeImage('UTPNID002', VC_ID)).resolves.toBe(
      `data:image/png;base64,${PNG_BASE64}`,
    );
    expect(global.fetch).toHaveBeenLastCalledWith(FRESH_QR, expect.anything());
  });

  it('labels a QR served as generic binary data as a PNG', async () => {
    mockApiThenImage(credentialsApiBody(VC_ID), {
      type: 'binary/octet-stream',
    });

    await expect(fetchIssuerQrCodeImage('UTPNID002', VC_ID)).resolves.toBe(
      `data:image/png;base64,${PNG_BASE64}`,
    );
  });

  it("returns null without downloading when the credential isn't the wallet's", async () => {
    mockApiThenImage(credentialsApiBody('urn:uuid:someone-else'));

    await expect(
      fetchIssuerQrCodeImage('UTPNID002', VC_ID),
    ).resolves.toBeNull();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('refuses a QR image link that is not https, without downloading it', async () => {
    mockApiThenImage({
      credential: {
        id: VC_ID,
        credentialSubject: {qr_code: FRESH_QR.replace('https://', 'http://')},
      },
    });

    await expect(fetchIssuerQrCodeImage('UTPNID002', VC_ID)).rejects.toThrow(
      'must use https',
    );
    // Only the credentials API was called; the image was never requested.
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('rejects when the image download fails', async () => {
    mockApiThenImage(credentialsApiBody(VC_ID), {ok: false, status: 403});

    await expect(fetchIssuerQrCodeImage('UTPNID002', VC_ID)).rejects.toThrow(
      'HTTP 403',
    );
  });

  it('refuses an image the server declares as over the size limit, without reading it', async () => {
    const blob = mockApiThenImage(credentialsApiBody(VC_ID), {
      contentLength: String(MAX_QR_IMAGE_BYTES + 1),
    });

    await expect(fetchIssuerQrCodeImage('UTPNID002', VC_ID)).rejects.toThrow(
      'too large',
    );
    expect(blob).not.toHaveBeenCalled();
  });

  it('refuses an oversized image when the server declared no size, before converting it', async () => {
    const readAsDataURL = jest.spyOn(FakeFileReader.prototype, 'readAsDataURL');
    mockApiThenImage(credentialsApiBody(VC_ID), {
      size: MAX_QR_IMAGE_BYTES + 1,
    });

    await expect(fetchIssuerQrCodeImage('UTPNID002', VC_ID)).rejects.toThrow(
      'too large',
    );
    expect(readAsDataURL).not.toHaveBeenCalled();
    readAsDataURL.mockRestore();
  });

  it('refuses an oversized image even when the declared size is under the limit', async () => {
    mockApiThenImage(credentialsApiBody(VC_ID), {
      contentLength: '2048',
      size: MAX_QR_IMAGE_BYTES + 1,
    });

    await expect(fetchIssuerQrCodeImage('UTPNID002', VC_ID)).rejects.toThrow(
      'too large',
    );
  });

  it('accepts an image exactly at the size limit', async () => {
    mockApiThenImage(credentialsApiBody(VC_ID), {
      contentLength: String(MAX_QR_IMAGE_BYTES),
      size: MAX_QR_IMAGE_BYTES,
    });

    await expect(fetchIssuerQrCodeImage('UTPNID002', VC_ID)).resolves.toBe(
      `data:image/png;base64,${PNG_BASE64}`,
    );
  });
});

describe('attachIssuerQrCode', () => {
  const wrapper = () => ({
    format: 'ldp_vc',
    verifiableCredential: {
      credential: {id: VC_ID, credentialSubject: {}},
      issuerLogo: 'logo',
    },
  });

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('stores the credential ID and QR image next to the signed credential', async () => {
    mockApiThenImage(credentialsApiBody(VC_ID));
    const original = wrapper();

    const result = await attachIssuerQrCode(original, 'UTPNID002');

    expect(result.verifiableCredential).toEqual({
      ...original.verifiableCredential,
      credissuerCredentialId: 'UTPNID002',
      issuerQrCode: `data:image/png;base64,${PNG_BASE64}`,
    });
    // The signed VC itself is untouched.
    expect(result.verifiableCredential.credential).toBe(
      original.verifiableCredential.credential,
    );
  });

  it('keeps the credential ID but no QR when the fetch fails, without failing', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('offline'));
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const result = await attachIssuerQrCode(wrapper(), 'UTPNID002');

    expect(result.verifiableCredential).toMatchObject({
      credissuerCredentialId: 'UTPNID002',
    });
    expect(result.verifiableCredential).not.toHaveProperty('issuerQrCode');
  });

  it('stops waiting after 8 seconds on a slow network, keeping the credential ID', async () => {
    jest.useFakeTimers();
    try {
      // The credentials API never answers.
      (global.fetch as jest.Mock).mockReturnValue(new Promise(() => undefined));
      jest.spyOn(console, 'error').mockImplementation(() => undefined);

      let result: Awaited<ReturnType<typeof wrapper>> | undefined;
      const pending = attachIssuerQrCode(wrapper(), 'UTPNID002').then(value => {
        result = value;
      });

      await jest.advanceTimersByTimeAsync(7999);
      expect(result).toBeUndefined();

      await jest.advanceTimersByTimeAsync(1);
      await pending;
      expect(result?.verifiableCredential).toMatchObject({
        credissuerCredentialId: 'UTPNID002',
      });
      expect(result?.verifiableCredential).not.toHaveProperty('issuerQrCode');
    } finally {
      jest.useRealTimers();
    }
  });

  it('leaves the credential unchanged when the token response had no credential ID', async () => {
    const original = wrapper();

    await expect(attachIssuerQrCode(original, null)).resolves.toBe(original);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe('getTokenResponseCredentialId', () => {
  it('reads credential_id from the token response', () => {
    expect(
      getTokenResponseCredentialId({
        access_token: 'token',
        credential_id: 'A1B2C3D4E5F6',
      }),
    ).toBe('A1B2C3D4E5F6');
  });

  it.each([undefined, null, {}, {credential_id: ''}, {credential_id: 42}])(
    'returns null for %p',
    tokenResponse => {
      expect(getTokenResponseCredentialId(tokenResponse)).toBeNull();
    },
  );
});

describe('resolveCredissuerCredentialId', () => {
  const credissuerVc = {
    id: VC_ID,
    issuer: 'did:web:did.credissuer.com:issuer',
    credentialSubject: {credential_id: 'UTPNID002'},
  };

  it("prefers the token response's credential_id", () => {
    expect(
      resolveCredissuerCredentialId(
        {credential_id: 'A1B2C3D4E5F6'},
        credissuerVc,
      ),
    ).toBe('A1B2C3D4E5F6');
  });

  it('falls back to the ID inside a CredIssuer credential', () => {
    expect(resolveCredissuerCredentialId({}, credissuerVc)).toBe('UTPNID002');
  });

  it('returns null for credentials from other issuers', () => {
    expect(
      resolveCredissuerCredentialId(
        {},
        {...credissuerVc, issuer: 'did:web:other.example'},
      ),
    ).toBeNull();
  });
});
