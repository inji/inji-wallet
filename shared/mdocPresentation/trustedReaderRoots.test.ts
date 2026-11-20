import forge from 'node-forge';

const mockGetAllConfigurations = jest.fn();
jest.mock('../api', () => ({
  __esModule: true,
  default: () => mockGetAllConfigurations(),
}));

import {
  getTrustedReaderRoots,
  normalizeTrustedReaderRoot,
} from './trustedReaderRoots';

function selfSignedRoot() {
  const keys = forge.pki.rsa.generateKeyPair({bits: 1024, e: 0x10001});
  const certificate = forge.pki.createCertificate();
  certificate.publicKey = keys.publicKey;
  certificate.serialNumber = '01';
  certificate.validity.notBefore = new Date('2026-01-01');
  certificate.validity.notAfter = new Date('2036-01-01');
  const name = [{name: 'commonName', value: 'Test Reader Root'}];
  certificate.setSubject(name);
  certificate.setIssuer(name);
  certificate.sign(keys.privateKey, forge.md.sha256.create());
  const der = forge.asn1
    .toDer(forge.pki.certificateToAsn1(certificate))
    .getBytes();
  return {
    base64: forge.util.encode64(der),
    pem: forge.pki.certificateToPem(certificate),
  };
}

const root = selfSignedRoot();

describe('normalizeTrustedReaderRoot', () => {
  it('turns a PEM root with its armour and line breaks into single-line base64 DER', () => {
    // certificateToPem wraps the base64 at 64 characters between BEGIN and END lines
    const normalized = normalizeTrustedReaderRoot(root.pem);

    expect(normalized).toBe(root.base64);
  });

  it('keeps a root that is already single-line base64 DER as it is', () => {
    const normalized = normalizeTrustedReaderRoot(root.base64);

    expect(normalized).toBe(root.base64);
  });

  it('drops a root that is not base64', () => {
    const normalized = normalizeTrustedReaderRoot('not a certificate!');

    expect(normalized).toBeUndefined();
  });

  it('drops base64 that does not hold a certificate', () => {
    // "hello" in base64
    const normalized = normalizeTrustedReaderRoot('aGVsbG8=');

    expect(normalized).toBeUndefined();
  });

  it('drops a root that is not a string', () => {
    const normalized = normalizeTrustedReaderRoot(42);

    expect(normalized).toBeUndefined();
  });
});

describe('getTrustedReaderRoots', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  it('reads the roots from the mdocTrustedReaderRoots property given as JSON text', async () => {
    mockGetAllConfigurations.mockResolvedValue({
      mdocTrustedReaderRoots: JSON.stringify([root.pem]),
    });

    const roots = await getTrustedReaderRoots();

    expect(roots).toEqual([root.base64]);
  });

  it('reads the roots from the mdocTrustedReaderRoots property given as a list', async () => {
    mockGetAllConfigurations.mockResolvedValue({
      mdocTrustedReaderRoots: [root.base64],
    });

    const roots = await getTrustedReaderRoots();

    expect(roots).toEqual([root.base64]);
  });

  it('leaves out roots that are not certificates and warns how many were left out', async () => {
    mockGetAllConfigurations.mockResolvedValue({
      mdocTrustedReaderRoots: [root.base64, 'aGVsbG8=', 'not base64'],
    });

    const roots = await getTrustedReaderRoots();

    expect(roots).toEqual([root.base64]);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(String(jest.mocked(console.warn).mock.calls[0][0])).toContain('2');
  });

  it('has no roots when the property is missing', async () => {
    mockGetAllConfigurations.mockResolvedValue({});

    const roots = await getTrustedReaderRoots();

    expect(roots).toEqual([]);
  });

  it('has no roots when the property is not a JSON list', async () => {
    mockGetAllConfigurations.mockResolvedValue({
      mdocTrustedReaderRoots: '{oops',
    });

    const roots = await getTrustedReaderRoots();

    expect(roots).toEqual([]);
  });

  it('has no roots when the configuration cannot be loaded, so sharing still starts', async () => {
    mockGetAllConfigurations.mockRejectedValue(new Error('offline'));

    const roots = await getTrustedReaderRoots();

    expect(roots).toEqual([]);
  });
});
