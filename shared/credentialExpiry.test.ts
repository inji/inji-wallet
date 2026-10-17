import {Buffer} from 'buffer';
import {getCredentialExpiryDate} from './credentialExpiry';
import {VCFormat} from './VCFormat';
import {CborTag24, CborTagged, encodeCbor} from './mdoc/cborEncodeMinimal';

/** A stored mdoc credential whose MSO carries `validityInfo`. */
function mdocCredential(validityInfo: Map<string, unknown>): string {
  const mso = encodeCbor(
    new Map<string, unknown>([
      ['version', '1.0'],
      ['docType', 'org.iso.18013.5.1.mDL'],
      ['validityInfo', validityInfo],
    ]),
  );
  const issuerSigned = encodeCbor(
    new Map<string, unknown>([
      ['nameSpaces', new Map()],
      [
        'issuerAuth',
        [
          encodeCbor(new Map([[1, -7]])),
          new Map(),
          encodeCbor(new CborTag24(mso)),
          new Uint8Array(64),
        ],
      ],
    ]),
  );
  return Buffer.from(issuerSigned).toString('base64');
}

describe('getCredentialExpiryDate', () => {
  it('reads validUntil from an mdoc MSO', () => {
    const credential = mdocCredential(
      new Map([
        ['signed', new CborTagged(0, '2026-01-01T00:00:00Z')],
        ['validUntil', new CborTagged(0, '2026-11-12T00:00:00Z')],
      ]),
    );
    expect(getCredentialExpiryDate({credential}, VCFormat.mso_mdoc)).toBe(
      '2026-11-12T00:00:00.000Z',
    );
  });

  it('is empty for an mdoc without a readable validUntil', () => {
    expect(
      getCredentialExpiryDate(
        {credential: mdocCredential(new Map())},
        VCFormat.mso_mdoc,
      ),
    ).toBe('');
    expect(
      getCredentialExpiryDate({credential: 'not cbor'}, VCFormat.mso_mdoc),
    ).toBe('');
  });

  it('reads exp from an SD-JWT', () => {
    const exp = Date.UTC(2026, 10, 12) / 1000;
    expect(
      getCredentialExpiryDate(
        {processedCredential: {fullResolvedPayload: {exp}}},
        VCFormat.dc_sd_jwt,
      ),
    ).toBe('2026-11-12T00:00:00.000Z');
  });

  it('reads validUntil or expirationDate from a W3C credential', () => {
    expect(
      getCredentialExpiryDate(
        {credential: {validUntil: '2026-11-12T00:00:00Z'}},
        VCFormat.ldp_vc,
      ),
    ).toBe('2026-11-12T00:00:00.000Z');
    expect(
      getCredentialExpiryDate(
        {credential: {expirationDate: '2027-01-31T00:00:00Z'}},
        VCFormat.ldp_vc,
      ),
    ).toBe('2027-01-31T00:00:00.000Z');
  });

  it('is empty when the credential has no expiry', () => {
    expect(getCredentialExpiryDate({credential: {}}, VCFormat.ldp_vc)).toBe('');
    expect(getCredentialExpiryDate(undefined, VCFormat.ldp_vc)).toBe('');
  });
});
