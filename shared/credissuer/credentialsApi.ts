import {
  CREDISSUER_API_BASE_URL,
  CREDISSUER_API_TOKEN_VALUE,
} from '../constants';
import {
  getCredentialId,
  getCredissuerCredentialId,
  getIssuerQrCodeUrl,
  isCredissuerCredential,
} from '../qr/issuerQrCode';

const REQUEST_TIMEOUT_MS = 15000;
const ATTACH_QR_TIMEOUT_MS = 8000;

// Bounds the whole URL-lookup + image-download chain so a slow network can't hold the
// download spinner for ~30s. On timeout the on-open fallback fetches the QR later.
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(
      () => reject(new Error('CredIssuer QR fetch timed out')),
      ms,
    );
    promise.then(
      value => {
        clearTimeout(id);
        resolve(value);
      },
      error => {
        clearTimeout(id);
        reject(error);
      },
    );
  });
}

/**
 * The `qr_code` stored in a downloaded credential is a presigned link that expires within a day
 * (and some credentials don't carry one at all), so the current one is fetched from CredIssuer.
 * `expectedVcId` guards against the lookup ID resolving to a different person's credential.
 * Without it there is nothing to compare against, so no request is made and the caller keeps
 * the stored QR.
 */
export async function fetchIssuerQrCodeUrl(
  credentialId: string,
  expectedVcId: string | null,
): Promise<string | null> {
  if (!expectedVcId) {
    return null; // can't verify ownership, so use the stored QR
  }
  if (!CREDISSUER_API_TOKEN_VALUE) {
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(
      `${CREDISSUER_API_BASE_URL}/api/credentials/credentials/${encodeURIComponent(
        credentialId,
      )}`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${CREDISSUER_API_TOKEN_VALUE}`,
        },
        signal: controller.signal,
      },
    );
    if (!response.ok) {
      throw new Error(
        `CredIssuer credentials API returned HTTP ${response.status}`,
      );
    }
    const body = await response.json();
    const returnedVcId = getCredentialId(body?.credential);
    if (returnedVcId !== expectedVcId) {
      return null;
    }
    return getIssuerQrCodeUrl(body?.credential);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetches the CredIssuer QR for a credential and downloads the image itself, returning it as a
 * `data:` URI so the wallet can store it and show it from then on without the network. Storing
 * the link instead would not work: it is presigned and expires within a day.
 *
 * Returns null when there is no QR to store (see {@link fetchIssuerQrCodeUrl}); rejects on
 * network or HTTP errors so the caller can tell "no QR" from "try again later".
 */
export async function fetchIssuerQrCodeImage(
  credentialId: string,
  expectedVcId: string | null,
): Promise<string | null> {
  const qrCodeUrl = await fetchIssuerQrCodeUrl(credentialId, expectedVcId);
  if (!qrCodeUrl) {
    return null;
  }
  return downloadImageAsDataUri(qrCodeUrl);
}

async function downloadImageAsDataUri(url: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {signal: controller.signal});
    if (!response.ok) {
      throw new Error(
        `CredIssuer QR image download returned HTTP ${response.status}`,
      );
    }
    const blob = await response.blob();
    const dataUri = await readBlobAsDataUri(blob);
    const base64 = dataUri.slice(dataUri.indexOf(',') + 1);
    if (!base64) {
      throw new Error('CredIssuer QR image download returned no data');
    }
    // Storage may serve the PNG as a generic binary type, which <Image> won't render as a data
    // URI on every platform, so anything that isn't labelled as an image is labelled as a PNG.
    const mimeType = blob.type?.startsWith('image/') ? blob.type : 'image/png';
    return `data:${mimeType};base64,${base64}`;
  } finally {
    clearTimeout(timeoutId);
  }
}

function readBlobAsDataUri(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () =>
      typeof reader.result === 'string'
        ? resolve(reader.result)
        : reject(new Error('Could not read the CredIssuer QR image'));
    reader.onerror = () =>
      reject(
        reader.error ?? new Error('Could not read the CredIssuer QR image'),
      );
    reader.readAsDataURL(blob);
  });
}

/**
 * Adds CredIssuer's credential ID, and the QR image fetched with it, to a freshly downloaded
 * credential before it is stored, so the card never has to fetch its QR on open. Both go next to
 * the signed VC (`verifiableCredential.credential`), never inside it.
 *
 * The ID is kept even when the image can't be fetched right now (offline, API down, or slower
 * than ATTACH_QR_TIMEOUT_MS), so the card can fetch it once later; it is only ever used through
 * {@link fetchIssuerQrCodeUrl}, which checks the credential it resolves to is this one. A failure
 * here never fails the download.
 */
export async function attachIssuerQrCode<
  T extends {verifiableCredential?: {credential?: unknown} | null},
>(credentialWrapper: T, credentialId: string | null): Promise<T> {
  const verifiableCredential = credentialWrapper.verifiableCredential;
  if (!credentialId || !verifiableCredential) {
    return credentialWrapper;
  }
  let issuerQrCode: string | null = null;
  try {
    issuerQrCode = await withTimeout(
      fetchIssuerQrCodeImage(
        credentialId,
        getCredentialId(verifiableCredential.credential),
      ),
      ATTACH_QR_TIMEOUT_MS,
    );
  } catch (error) {
    console.error('Error fetching issuer QR code from CredIssuer:', error);
  }
  return {
    ...credentialWrapper,
    verifiableCredential: {
      ...verifiableCredential,
      credissuerCredentialId: credentialId,
      ...(issuerQrCode ? {issuerQrCode} : {}),
    },
  };
}

/**
 * The CredIssuer credential ID from an OpenID4VCI token response. CredIssuer adds `credential_id`
 * to the token response of W3C pre-authorized offers (it can't go inside the VC, which is signed
 * before the ID exists); other issuers and mDoc offers leave it out.
 */
export function getTokenResponseCredentialId(
  tokenResponse: unknown,
): string | null {
  const credentialId = (tokenResponse as {credential_id?: unknown})
    ?.credential_id;
  return typeof credentialId === 'string' && credentialId.trim().length > 0
    ? credentialId.trim()
    : null;
}

/**
 * The CredIssuer credential ID to fetch a new credential's QR with: the token response's
 * `credential_id` when there is one, otherwise the ID older CredIssuer credentials carry in
 * `credentialSubject` (the same fallback the card uses when it is opened). Null for credentials
 * from other issuers.
 */
export function resolveCredissuerCredentialId(
  tokenResponse: unknown,
  credential: unknown,
): string | null {
  return (
    getTokenResponseCredentialId(tokenResponse) ??
    (isCredissuerCredential(credential)
      ? getCredissuerCredentialId(credential)
      : null)
  );
}
