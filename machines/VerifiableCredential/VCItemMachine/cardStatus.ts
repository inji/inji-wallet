import {VCMetadata} from '../../../shared/VCMetadata';
import {EXPIRED_VC_ERROR_CODE} from '../../../shared/constants';
import {
  RevocationStatus,
  RevocationStatusType,
} from '../../../shared/vcVerifier/VcVerifier';

/** The automatic status checks leave a card alone for this long after it was last checked. */
export const STATUS_CHECK_INTERVAL_MS = 15 * 60 * 1000;

export function wasStatusCheckedRecently(
  vcMetadata: Pick<VCMetadata, 'lastKnownStatusTimestamp'> | undefined,
  now: number = Date.now(),
): boolean {
  const checkedAt = Date.parse(vcMetadata?.lastKnownStatusTimestamp ?? '');
  return !isNaN(checkedAt) && now - checkedAt < STATUS_CHECK_INTERVAL_MS;
}

/** The card's status after a check that completed with `result`. */
export function statusAfterCheck(
  previous: VCMetadata,
  result: {isRevoked?: RevocationStatusType; verificationErrorCode?: string},
  now: string,
) {
  // An unreachable status list says nothing about the card, so a known revocation stands.
  const keepRevoked =
    previous.isRevoked === RevocationStatus.TRUE &&
    result.isRevoked === RevocationStatus.UNDETERMINED;
  const isRevoked = keepRevoked ? RevocationStatus.TRUE : result.isRevoked;
  return {
    isVerified: true,
    isRevoked,
    isExpired: result.verificationErrorCode == EXPIRED_VC_ERROR_CODE,
    revokedOn:
      isRevoked === RevocationStatus.TRUE ? previous.revokedOn || now : '',
  };
}

export function hasStatusChanged(
  previous: Pick<VCMetadata, 'isVerified' | 'isRevoked' | 'isExpired'>,
  next: Pick<VCMetadata, 'isVerified' | 'isRevoked' | 'isExpired'>,
): boolean {
  return (
    previous.isVerified !== next.isVerified ||
    previous.isRevoked !== next.isRevoked ||
    previous.isExpired !== next.isExpired
  );
}
