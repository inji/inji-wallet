import {VCMetadata} from '../../shared/VCMetadata';
import {VCFormat} from '../../shared/VCFormat';
import {RevocationStatus} from '../../shared/vcVerifier/VcVerifier';
import {cardStatusOf} from './cardStatus';

jest.mock('../../shared/mdoc/presentment/issuerSigned', () => ({
  readMsoValidUntil: jest.fn(),
}));

const now = new Date('2026-10-26T12:00:00.000Z');
const expiredCredential = {
  credential: {expirationDate: '2026-01-01T00:00:00.000Z'},
};
const validCredential = {
  credential: {expirationDate: '2027-01-01T00:00:00.000Z'},
};
const verified = (fields = {}) =>
  new VCMetadata({id: 'vc', format: VCFormat.ldp_vc, isVerified: true, ...fields});

describe('cardStatusOf', () => {
  it('shows a card past its expiry date as expired before any check marks it', () => {
    expect(cardStatusOf(verified(), expiredCredential, now)).toBe('expired');
  });

  it('shows a verified card within its validity as verified', () => {
    expect(cardStatusOf(verified(), validCredential, now)).toBe('verified');
  });

  it('keeps an expiry found by a check', () => {
    expect(
      cardStatusOf(verified({isExpired: true}), validCredential, now),
    ).toBe('expired');
  });

  it('shows revoked over expired', () => {
    const revoked = verified();
    revoked.isRevoked = RevocationStatus.TRUE;
    expect(cardStatusOf(revoked, expiredCredential, now)).toBe('revoked');
  });

  it('shows an unchecked card without an expiry date as pending', () => {
    expect(
      cardStatusOf(verified({isVerified: false}), {credential: {}}, now),
    ).toBe('pending');
  });
});
