import {VCMetadata} from './VCMetadata';
import {VCFormat} from './VCFormat';
import {RevocationStatus} from './vcVerifier/VcVerifier';
import {isShareable} from './shareability';

jest.mock('./mdoc/presentment/issuerSigned', () => ({
  readMsoValidUntil: jest.fn(),
}));

const now = new Date('2026-10-26T12:00:00.000Z');
const card = (fields = {}) =>
  new VCMetadata({id: 'vc', format: VCFormat.ldp_vc, ...fields});

describe('isShareable', () => {
  it('allows a valid card', () => {
    expect(isShareable(card())).toBe(true);
  });

  it('allows a card whose revocation could not be checked', () => {
    const undetermined = card();
    undetermined.isRevoked = RevocationStatus.UNDETERMINED;
    expect(isShareable(undetermined)).toBe(true);
  });

  it('blocks a card a check found expired', () => {
    expect(isShareable(card({isExpired: true}))).toBe(false);
  });

  it('blocks a revoked card', () => {
    const revoked = card();
    revoked.isRevoked = RevocationStatus.TRUE;
    expect(isShareable(revoked)).toBe(false);
  });

  it('blocks a card past its stored expiry date before any check marks it', () => {
    const credential = {credential: {expirationDate: '2026-01-01T00:00:00Z'}};
    expect(isShareable(card(), credential, now)).toBe(false);
  });

  it('allows a card within its stored validity', () => {
    const credential = {credential: {expirationDate: '2027-01-01T00:00:00Z'}};
    expect(isShareable(card(), credential, now)).toBe(true);
  });
});
