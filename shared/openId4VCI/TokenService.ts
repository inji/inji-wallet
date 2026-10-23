import VciClient, {VciClientErrorResponse} from '../vciClient/VciClient';
import {
  DPOP_HEADER,
  DPOP_NONCE_HEADER,
  USE_DPOP_NONCE_ERROR,
} from '../constants';
import {
  buildDeviceProof,
  DEVICE_NOT_REGISTERED,
  DEVICE_PROOF_HEADER,
  ensureRegistered,
  forgetRegistration,
  isDeviceAttestationSupported,
  mimotoBaseFromTokenEndpoint,
} from '../deviceAttestation/DeviceAttestationService';

function buildTokenFormBody(tokenRequestObject: any): URLSearchParams {
  const formBody = new URLSearchParams();
  formBody.append('grant_type', tokenRequestObject.grantType);

  if (tokenRequestObject.authCode) {
    formBody.append('code', tokenRequestObject.authCode);
  }
  if (tokenRequestObject.preAuthCode) {
    formBody.append('pre-authorized_code', tokenRequestObject.preAuthCode);
  }
  if (tokenRequestObject.txCode) {
    formBody.append('tx_code', tokenRequestObject.txCode);
  }
  if (tokenRequestObject.clientId) {
    formBody.append('client_id', tokenRequestObject.clientId);
  }
  if (tokenRequestObject.redirectUri) {
    formBody.append('redirect_uri', tokenRequestObject.redirectUri);
  }
  if (tokenRequestObject.codeVerifier) {
    formBody.append('code_verifier', tokenRequestObject.codeVerifier);
  }
  return formBody;
}

async function postTokenRequest(
  tokenEndpoint: string,
  formBody: string,
  dpopProof?: string | null,
  extraHeaders: Record<string, string> = {},
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
    ...extraHeaders,
  };
  if (dpopProof) {
    headers[DPOP_HEADER] = dpopProof;
  }
  return await fetch(tokenEndpoint, {
    method: 'POST',
    headers,
    body: formBody,
  });
}

/**
 * Device proof header for mimoto's get-token proxy. Registration or signing failures are logged and the
 * request goes out without a proof, so a mimoto in monitor mode keeps working; one in enforce mode rejects it.
 */
async function deviceProofHeaders(
  tokenEndpoint: string,
  formBody: string,
): Promise<Record<string, string>> {
  const mimotoBase = mimotoBaseFromTokenEndpoint(tokenEndpoint);
  if (!mimotoBase || !isDeviceAttestationSupported()) {
    return {};
  }
  try {
    await ensureRegistered(mimotoBase);
    return {
      [DEVICE_PROOF_HEADER]: await buildDeviceProof(tokenEndpoint, formBody),
    };
  } catch (error) {
    console.warn('Sending token request without a device proof:', error);
    return {};
  }
}

function parseError(errorText: string): any {
  try {
    return JSON.parse(errorText);
  } catch {
    return {};
  }
}

function toVciClientError(errorText: string): VciClientErrorResponse {
  const parsedError = parseError(errorText);
  const issuerErrorCode = parsedError.error ?? 'UNKNOWN_ERROR';
  const issuerErrorMessage = parsedError.error_description;
  return {
    code: issuerErrorCode,
    message: issuerErrorMessage,
    issuerErrorCode,
    issuerErrorMessage,
  };
}

/**
 * Performs the OID4VCI token request. The DPoP proof is built and signed by the VCIClient
 * library and arrives on `tokenRequestObject.dpopProof`; the wallet only attaches it as the
 * `DPoP` header. On an authorization server `use_dpop_nonce` challenge the wallet asks the
 * library for a fresh proof bound to the supplied nonce and retries once (RFC 9449).
 *
 * When the token endpoint is mimoto's get-token proxy, each attempt also carries a fresh device proof.
 * If mimoto no longer knows the device key (`device_not_registered`), the wallet registers again and
 * retries once.
 */
export async function sendTokenRequest(
  tokenRequestObject: any,
  proxyTokenEndpoint: any = null,
) {
  if (proxyTokenEndpoint) {
    tokenRequestObject.tokenEndpoint = proxyTokenEndpoint;
  }
  if (!tokenRequestObject?.tokenEndpoint) {
    console.error('tokenEndpoint is not provided in tokenRequestObject');
    throw new Error('tokenEndpoint is required');
  }

  const tokenEndpoint: string = tokenRequestObject.tokenEndpoint;
  const formBody = buildTokenFormBody(tokenRequestObject).toString();
  const send = async (dpopProof?: string | null) =>
    postTokenRequest(
      tokenEndpoint,
      formBody,
      dpopProof,
      await deviceProofHeaders(tokenEndpoint, formBody),
    );

  let response = await send(tokenRequestObject.dpopProof);
  let errorText = response.ok ? '' : await response.text();

  const mimotoBase = mimotoBaseFromTokenEndpoint(tokenEndpoint);
  if (
    !response.ok &&
    response.status === 401 &&
    mimotoBase &&
    parseError(errorText)?.error === DEVICE_NOT_REGISTERED
  ) {
    // mimoto rejected the request before forwarding it, so the DPoP proof was never used
    await forgetRegistration(mimotoBase).catch(() => undefined);
    response = await send(tokenRequestObject.dpopProof);
    errorText = response.ok ? '' : await response.text();
  }

  if (!response.ok) {
    const dpopNonce = response.headers?.get(DPOP_NONCE_HEADER);

    if (
      response.status === 400 &&
      parseError(errorText)?.error === USE_DPOP_NONCE_ERROR &&
      dpopNonce
    ) {
      const refreshedProof =
        await VciClient.getInstance().generateTokenDPoPProof(dpopNonce);
      response = await send(refreshedProof);

      if (!response.ok) {
        const retryError = await response.text();
        console.error(
          'Token request failed after DPoP nonce retry with status:',
          response.status,
          retryError,
        );
        throw toVciClientError(retryError);
      }
    } else {
      console.error(
        'Token request failed with status:',
        response.status,
        errorText,
      );
      throw toVciClientError(errorText);
    }
  }

  return await response.json();
}
