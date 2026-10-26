import type {VCMetadata} from './VCMetadata';
import {RevocationStatus} from './vcVerifier/VcVerifier';
import {isCredentialExpired} from './credentialExpiry';

/**
 * Expired and revoked credentials can't be shared, by any route: verifiers would reject them.
 * Expiry is also read from the stored credential, since it needs no network, so a card whose
 * date has passed is blocked before any status check marks it.
 */
export function isShareable(
  vcMetadata?: Pick<VCMetadata, 'isExpired' | 'isRevoked' | 'format'> | null,
  verifiableCredential?: unknown,
  now: Date = new Date(),
): boolean {
  return (
    !vcMetadata?.isExpired &&
    vcMetadata?.isRevoked !== RevocationStatus.TRUE &&
    !isCredentialExpired(verifiableCredential, vcMetadata?.format ?? '', now)
  );
}
