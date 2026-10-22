import {
  createHash,
  createPublicKey,
  generateKeyPairSync,
  sign,
  verify,
} from 'crypto';
import {NativeModules} from 'react-native';

jest.mock('../constants', () => ({
  ...jest.requireActual('../constants'),
  isAndroid: () => true,
}));

import {
  buildDeviceProof,
  ensureRegistered,
  forgetRegistration,
  integrityNonce,
  isDeviceAttestationSupported,
  mimotoBaseFromTokenEndpoint,
} from './DeviceAttestationService';

const MIMOTO = 'https://api.example.net/v1/mimoto';
const TOKEN_ENDPOINT = `${MIMOTO}/v2/get-token/issuerX`;

const b64url = (buf: Buffer) => buf.toString('base64url');
const sha256b64url = (input: string) =>
  b64url(createHash('sha256').update(input, 'utf8').digest());

describe('DeviceAttestationService', () => {
  const {publicKey, privateKey} = generateKeyPairSync('ec', {
    namedCurve: 'P-256',
  });
  const publicPem = publicKey.export({type: 'spki', format: 'pem'}).toString();
  const jwk = createPublicKey(publicPem).export({format: 'jwk'}) as any;
  // RFC 7638: required members only, lexicographic order, no whitespace
  const expectedThumbprint = sha256b64url(
    JSON.stringify({crv: jwk.crv, kty: jwk.kty, x: jwk.x, y: jwk.y}),
  );

  let keystoreHasKey: boolean;
  let stored: Map<string, string>;
  let nonces: string[];
  let fetchMock: jest.Mock;
  let requestIntegrityToken: jest.Mock;

  beforeEach(() => {
    keystoreHasKey = false;
    stored = new Map();
    nonces = [
      'nonce-1-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      'nonce-2-BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
      'nonce-3',
      'nonce-4',
    ];
    requestIntegrityToken = jest.fn().mockResolvedValue('integrity-token');
    (NativeModules as any).RNPlayIntegrityModule = {requestIntegrityToken};
    (NativeModules as any).RNSecureKeystoreModule = {
      ...(NativeModules as any).RNSecureKeystoreModule,
      retrieveKey: jest.fn(async () => {
        if (!keystoreHasKey) {
          throw new Error('key not found');
        }
        return publicPem;
      }),
      generateKeyPair: jest.fn(() => {
        keystoreHasKey = true;
        return publicPem;
      }),
      signBytes: jest.fn(async (_alg: string, _alias: string, b64: string) =>
        sign('sha256', Buffer.from(b64, 'base64'), privateKey).toString(
          'base64',
        ),
      ),
      getData: jest.fn(async (key: string) => [stored.get(key) ?? '', '']),
      storeData: jest.fn(async (key: string, value: string) => {
        stored.set(key, value);
        return 'success';
      }),
    };
    fetchMock = jest.fn(async (url: string) => {
      if (url.endsWith('/device/nonce')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({nonce: nonces.shift(), expires_in: 120}),
        };
      }
      if (url.endsWith('/device/register')) {
        return {ok: true, status: 201, text: async () => ''};
      }
      throw new Error(`unexpected ${url}`);
    });
    global.fetch = fetchMock as any;
  });

  const registerCalls = () =>
    fetchMock.mock.calls.filter(([url]) => url.endsWith('/device/register'));

  it('extracts the mimoto base only from get-token endpoints', () => {
    expect(mimotoBaseFromTokenEndpoint(`${MIMOTO}/v2/get-token/issuerX`)).toBe(
      MIMOTO,
    );
    expect(mimotoBaseFromTokenEndpoint(`${MIMOTO}/get-token/issuerX?x=1`)).toBe(
      MIMOTO,
    );
    expect(
      mimotoBaseFromTokenEndpoint('https://as.example.com/oauth/token'),
    ).toBeNull();
    expect(mimotoBaseFromTokenEndpoint('')).toBeNull();
  });

  it('computes the integrity nonce exactly as mimoto expects', () => {
    expect(integrityNonce('n0nce', 'thumb')).toBe(
      sha256b64url('n0nce' + 'thumb'),
    );
  });

  it('registers a non-biometric P-256 key bound to the nonce and its thumbprint', async () => {
    await ensureRegistered(MIMOTO);

    expect(
      NativeModules.RNSecureKeystoreModule.generateKeyPair,
    ).toHaveBeenCalledWith('ES256', 'inji-device-attestation-es256', false, 0);
    expect(requestIntegrityToken).toHaveBeenCalledWith(
      sha256b64url(
        'nonce-1-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' + expectedThumbprint,
      ),
      '',
    );
    const [url, init] = registerCalls()[0];
    expect(url).toBe(`${MIMOTO}/device/register`);
    expect(JSON.parse(init.body)).toEqual({
      platform: 'ANDROID',
      nonce: 'nonce-1-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      public_key_jwk: {kty: 'EC', crv: 'P-256', x: jwk.x, y: jwk.y},
      integrity_token: 'integrity-token',
    });
  });

  it('does not register again once registered, and shares one registration between concurrent callers', async () => {
    await Promise.all([
      ensureRegistered(MIMOTO),
      ensureRegistered(MIMOTO),
      ensureRegistered(MIMOTO),
    ]);
    await ensureRegistered(MIMOTO);

    expect(registerCalls()).toHaveLength(1);
    expect(requestIntegrityToken).toHaveBeenCalledTimes(1);
  });

  it('registers separately with each mimoto', async () => {
    await ensureRegistered(MIMOTO);
    await ensureRegistered('https://other.example.net/v1/mimoto');

    expect(registerCalls()).toHaveLength(2);
  });

  it('registers again after the registration is forgotten', async () => {
    await ensureRegistered(MIMOTO);
    await forgetRegistration(MIMOTO);
    await ensureRegistered(MIMOTO);

    expect(registerCalls()).toHaveLength(2);
  });

  it('fails and stores nothing when mimoto rejects the registration', async () => {
    fetchMock.mockImplementation(async (url: string) =>
      url.endsWith('/device/nonce')
        ? {ok: true, status: 200, json: async () => ({nonce: 'n'})}
        : {
            ok: false,
            status: 400,
            text: async () => '{"error":"attestation_failed"}',
          },
    );

    await expect(ensureRegistered(MIMOTO)).rejects.toThrow(
      'attestation_failed',
    );
    expect(stored.size).toBe(0);
  });

  it('builds a device proof that verifies with the device key and is bound to nonce, URL and body', async () => {
    keystoreHasKey = true;
    const body = 'grant_type=authorization_code&code=abc&code_verifier=v';

    const proof = await buildDeviceProof(`${TOKEN_ENDPOINT}?ignored=1`, body);

    const [h, p, s] = proof.split('.');
    expect(
      verify(
        'sha256',
        Buffer.from(`${h}.${p}`),
        {key: publicKey, dsaEncoding: 'ieee-p1363'},
        Buffer.from(s, 'base64url'),
      ),
    ).toBe(true);
    expect(JSON.parse(Buffer.from(h, 'base64url').toString())).toEqual({
      alg: 'ES256',
      typ: 'device-proof+jwt',
      kid: expectedThumbprint,
    });
    const claims = JSON.parse(Buffer.from(p, 'base64url').toString());
    expect(claims.nonce).toBe('nonce-1-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
    expect(claims.htm).toBe('POST');
    expect(claims.htu).toBe(TOKEN_ENDPOINT);
    expect(claims.req_hash).toBe(sha256b64url(body));
    expect(claims.exp - claims.iat).toBe(60);
    expect(
      NativeModules.RNSecureKeystoreModule.generateKeyPair,
    ).not.toHaveBeenCalled();
  });

  it('uses a fresh nonce for every proof', async () => {
    keystoreHasKey = true;
    const nonceOf = (proof: string) =>
      JSON.parse(Buffer.from(proof.split('.')[1], 'base64url').toString())
        .nonce;

    const first = await buildDeviceProof(TOKEN_ENDPOINT, 'a=1');
    const second = await buildDeviceProof(TOKEN_ENDPOINT, 'a=1');

    expect(nonceOf(first)).not.toBe(nonceOf(second));
  });

  it('refuses to build a proof for a non-mimoto endpoint', async () => {
    await expect(
      buildDeviceProof('https://as.example.com/token', 'a=1'),
    ).rejects.toThrow();
  });

  it('reports unsupported when the Play Integrity module is missing', () => {
    expect(isDeviceAttestationSupported()).toBe(true);
    delete (NativeModules as any).RNPlayIntegrityModule;
    expect(isDeviceAttestationSupported()).toBe(false);
  });
});
