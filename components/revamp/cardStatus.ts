import {VCMetadata} from '../../shared/VCMetadata';
import {RevocationStatus} from '../../shared/vcVerifier/VcVerifier';
import {isCredentialExpired} from '../../shared/credentialExpiry';
import type {CardStatus} from './useCredentialCard';

/**
 * The status a card shows. Expiry is read from the credential itself as well as from the last
 * check, since it needs no network: the card shows expired at once, offline, and on platforms
 * whose verifier doesn't check expiry.
 */
export function cardStatusOf(
  vcMetadata: VCMetadata,
  credential: unknown,
  now: Date = new Date(),
): CardStatus {
  if (vcMetadata.isRevoked === RevocationStatus.TRUE) return 'revoked';
  if (
    vcMetadata.isExpired ||
    isCredentialExpired(credential, vcMetadata.format, now)
  ) {
    return 'expired';
  }
  return vcMetadata.isVerified ? 'verified' : 'pending';
}
