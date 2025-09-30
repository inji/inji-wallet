import {
  DecodedCredential,
  VerifiableCredential,
} from '../machines/VerifiableCredential/VCMetaMachine/vc';
import {__AppId} from './GlobalVariables';
import {MIMOTO_BASE_URL, REQUEST_TIMEOUT} from './constants';
import NetInfo from '@react-native-community/netinfo';
import {ErrorMessage} from './openId4VCI/Utils';

export type HTTP_METHOD = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export class BackendResponseError extends Error {
  constructor(name: string, message: string) {
    super(message);
    this.name = name;
  }
}

async function assertInternetConnection() {
  const net = await NetInfo.fetch();
  if (!net.isConnected || net.isInternetReachable === false) {
    console.info('No internet');
    throw new Error('No internet connection');
  }
}

export async function request(
  method: HTTP_METHOD,
  path: `/${string}` | string,
  body?: Record<string, unknown>,
  host = MIMOTO_BASE_URL,
  headers: Record<string, string> = {
    'Content-Type': 'application/json',
  },
  timeoutMillis?: number | undefined,
) {
  if (path.includes('v1/mimoto')) {
    headers['X-AppId'] = __AppId.getValue();
  }

  const requestUrl = path.startsWith('https://') ? path : host + path;
  let response;

  try {
    if (timeoutMillis === undefined) {
      response = await fetch(requestUrl, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } else {
      console.info(`Making a web request to ${requestUrl}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMillis);

      try {
        response = await fetch(requestUrl, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });
      } catch (error: any) {
        clearTimeout(timeoutId);
        console.error(`Request failed: ${requestUrl}:`, error);

        if (error.name === 'AbortError') {
          throw new Error(REQUEST_TIMEOUT);
        }

        await assertInternetConnection();
        throw error;
      }
    }
  } catch (error: any) {
    console.error(`Failed to fetch from ${requestUrl}:`, error);
    await assertInternetConnection();
    throw error;
  }

  let jsonResponse;
  try {
    jsonResponse = await response.json();
  } catch (jsonError) {
    console.warn(`Failed to parse JSON from ${requestUrl}`, jsonError);
    throw new Error(
      ErrorMessage.NETWORK_REQUEST_FAILED + ' Invalid JSON response',
    );
  }

  if (response.status >= 400) {
    const backendUrl = host + path;
    const errorMessage =
      jsonResponse.message ||
      (typeof jsonResponse.error === 'object'
        ? JSON.stringify(jsonResponse.error)
        : jsonResponse.error);

    console.error(
      `The backend API ${backendUrl} returned error code ${response.status} with message --> ${errorMessage}`,
    );
    throw new Error(errorMessage);
  }

  if (jsonResponse.errors && jsonResponse.errors.length) {
    const {errorCode, errorMessage} = jsonResponse.errors.shift();
    console.error(
      `The backend API ${requestUrl} returned structured error --> error code: ${errorCode}, message: ${errorMessage}`,
    );
    throw new BackendResponseError(errorCode, errorMessage);
  }

  return jsonResponse;
}

interface ResponseError {
  errorCode: string;
  errorMessage: string;
}

interface BackendResponse<T> {
  id: string;
  version: string;
  response: T;
  str?: string;
  responsetime?: string;
  metadata?: string;
  errors?: ResponseError[];
}

export type OtpRequestResponse = BackendResponse<{
  maskedMobile?: string;
  maskedEmail?: string;
}>;

export type VcGenerateResponse = BackendResponse<{
  vc: string;
  message: string;
}>;

export type CredentialRequestResponse = BackendResponse<{
  id: string;
  requestId: string;
}>;

export type CredentialStatusResponse = BackendResponse<{
  statusCode: 'NEW' | 'ISSUED' | 'printing';
}>;

export interface CredentialDownloadResponse {
  credential?: DecodedCredential;
  verifiableCredential?: VerifiableCredential;
}
