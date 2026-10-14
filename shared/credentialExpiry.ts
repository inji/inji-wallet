import {VCFormat} from './VCFormat';
import {readMsoValidUntil} from './mdoc/presentment/issuerSigned';

interface StoredCredential {
  credential?: unknown;
  processedCredential?: {fullResolvedPayload?: {exp?: unknown}};
}

function toDate(value: unknown): Date | null {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function expiryOf(
  verifiableCredential: StoredCredential,
  format: string,
): Date | null {
  switch (format) {
    case VCFormat.mso_mdoc:
      return typeof verifiableCredential.credential === 'string'
        ? readMsoValidUntil(verifiableCredential.credential)
        : null;
    case VCFormat.vc_sd_jwt:
    case VCFormat.dc_sd_jwt: {
      const exp =
        verifiableCredential.processedCredential?.fullResolvedPayload?.exp;
      return typeof exp === 'number' ? toDate(exp * 1000) : null;
    }
    default: {
      const credential = (verifiableCredential.credential ??
        verifiableCredential) as {
        validUntil?: unknown;
        expirationDate?: unknown;
      };
      return toDate(credential.validUntil ?? credential.expirationDate);
    }
  }
}

/**
 * When a stored credential stops being valid, as an ISO 8601 string: the MSO's `validUntil` for
 * mdoc, `exp` for SD-JWT and `validUntil` / `expirationDate` for W3C credentials. Empty when the
 * credential doesn't say or can't be read.
 */
export function getCredentialExpiryDate(
  verifiableCredential: unknown,
  format: string,
): string {
  if (!verifiableCredential || typeof verifiableCredential !== 'object') {
    return '';
  }
  try {
    return (
      expiryOf(
        verifiableCredential as StoredCredential,
        format,
      )?.toISOString() ?? ''
    );
  } catch {
    return '';
  }
}
