import VciClient, {VciClientErrorResponse} from '../vciClient/VciClient';
import {
  DPOP_HEADER,
  DPOP_NONCE_HEADER,
  USE_DPOP_NONCE_ERROR,
} from '../constants';

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
  formBody: URLSearchParams,
  dpopProof?: string | null,
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  if (dpopProof) {
    headers[DPOP_HEADER] = dpopProof;
  }
  return await fetch(tokenEndpoint, {
    method: 'POST',
    headers,
    body: formBody.toString(),
  });
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
  return {
    issuerErrorCode: parsedError.error ?? 'UNKNOWN_ERROR',
    issuerErrorMessage: parsedError.error_description,
  };
}

/**
 * Performs the OID4VCI token request. The DPoP proof is built and signed by the VCIClient
 * library and arrives on `tokenRequestObject.dpopProof`; the wallet only attaches it as the
 * `DPoP` header. On an authorization server `use_dpop_nonce` challenge the wallet asks the
 * library for a fresh proof bound to the supplied nonce and retries once (RFC 9449).
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

  const formBody = buildTokenFormBody(tokenRequestObject);

  let response = await postTokenRequest(
    tokenRequestObject.tokenEndpoint,
    formBody,
    tokenRequestObject.dpopProof,
  );

  if (!response.ok) {
    const errorText = await response.text();
    const dpopNonce = response.headers?.get(DPOP_NONCE_HEADER);

    if (
      response.status === 400 &&
      parseError(errorText)?.error === USE_DPOP_NONCE_ERROR &&
      dpopNonce
    ) {
      const refreshedProof =
        await VciClient.getInstance().generateTokenDPoPProof(dpopNonce);
      response = await postTokenRequest(
        tokenRequestObject.tokenEndpoint,
        formBody,
        refreshedProof,
      );

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
