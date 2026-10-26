import {VCMetadata} from '../../../shared/VCMetadata';
import {RevocationStatus} from '../../../shared/vcVerifier/VcVerifier';
import {
  hasStatusChanged,
  STATUS_CHECK_INTERVAL_MS,
  statusAfterCheck,
  wasStatusCheckedRecently,
} from './cardStatus';

describe('wasStatusCheckedRecently', () => {
  const now = Date.parse('2026-10-26T12:00:00.000Z');
  const checkedAgo = (ms: number) => ({
    lastKnownStatusTimestamp: new Date(now - ms).toISOString(),
  });

  it('is true within the check interval', () => {
    expect(wasStatusCheckedRecently(checkedAgo(60_000), now)).toBe(true);
  });

  it('is false once the interval has passed', () => {
    expect(
      wasStatusCheckedRecently(checkedAgo(STATUS_CHECK_INTERVAL_MS), now),
    ).toBe(false);
  });

  it('is false for a card that was never checked', () => {
    expect(wasStatusCheckedRecently({lastKnownStatusTimestamp: ''}, now)).toBe(
      false,
    );
    expect(wasStatusCheckedRecently(undefined, now)).toBe(false);
  });
});

describe('statusAfterCheck', () => {
  it('keeps a known revocation when the status list could not be reached', () => {
    const previous = new VCMetadata({
      id: 'vc',
      revokedOn: '2026-01-01T00:00:00.000Z',
    });
    previous.isRevoked = RevocationStatus.TRUE;

    const next = statusAfterCheck(
      previous,
      {isRevoked: RevocationStatus.UNDETERMINED, verificationErrorCode: ''},
      '2026-10-26T12:00:00.000Z',
    );

    expect(next.isRevoked).toBe(RevocationStatus.TRUE);
    expect(next.revokedOn).toBe('2026-01-01T00:00:00.000Z');
  });

  it('marks an expired card', () => {
    const next = statusAfterCheck(
      new VCMetadata({id: 'vc'}),
      {
        isRevoked: RevocationStatus.FALSE,
        verificationErrorCode: 'ERR_VC_EXPIRED',
      },
      '',
    );
    expect(next.isExpired).toBe(true);
  });
});

describe('hasStatusChanged', () => {
  const valid: Pick<VCMetadata, 'isVerified' | 'isRevoked' | 'isExpired'> = {
    isVerified: true,
    isRevoked: RevocationStatus.FALSE,
    isExpired: false,
  };

  it('is false when nothing changed', () => {
    expect(hasStatusChanged(valid, {...valid})).toBe(false);
  });

  it('is true when the card was revoked', () => {
    expect(
      hasStatusChanged(valid, {...valid, isRevoked: RevocationStatus.TRUE}),
    ).toBe(true);
  });
});
