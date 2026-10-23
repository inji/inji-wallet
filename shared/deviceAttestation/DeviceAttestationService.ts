import {NativeModules} from 'react-native';
import jose from 'node-jose';
import {Buffer} from 'buffer';
import base64url from 'base64url';
import {sha256} from '@noble/hashes/sha256';
import {PLAY_INTEGRITY_CLOUD_PROJECT_NUMBER} from 'react-native-dotenv';
import {isAndroid} from '../constants';
import {isHardwareKeystoreExists} from '../cryptoutil/cryptoUtil';
import convertDerToRsFormat from '../cryptoutil/signFormatConverter';

/**
 * Proves to mimoto that a get-token call comes from a genuine Inji Wallet install.
 *
 * Once per install (and per mimoto), the wallet registers a hardware-backed EC P-256 device key with a
 * Play Integrity verdict requested for base64url(SHA-256(nonce + JWK thumbprint)). Every get-token call
 * through mimoto then carries a short-lived JWT signed by that key in the X-Inji-Device-Proof header.
 * See mimoto docs/WalletDeviceAttestation.md.
 */

export const DEVICE_PROOF_HEADER = 'X-Inji-Device-Proof';
export const DEVICE_NOT_REGISTERED = 'device_not_registered';

const DEVICE_KEY_ALIAS = 'inji-device-attestation-es256';
const REGISTRATION_KEY_PREFIX = 'deviceAttestationRegistration:';
const PROOF_TYPE = 'device-proof+jwt';
const PROOF_LIFETIME_SECONDS = 60;
const GET_TOKEN_PATH = /^(.*?)\/(?:v2\/)?get-token\/[^/?#]+/;

type DeviceKey = {
  publicJwk: {kty: string; crv: string; x: string; y: string};
  thumbprint: string;
};

const inFlightRegistrations = new Map<string, Promise<void>>();

/**
 * @returns mimoto's base URL (scheme, host and context path) when the token endpoint is mimoto's
 * get-token proxy, otherwise null
 */
export function mimotoBaseFromTokenEndpoint(
  tokenEndpoint: string,
): string | null {
  const match = GET_TOKEN_PATH.exec(tokenEndpoint ?? '');
  return match ? match[1] : null;
}

export function isDeviceAttestationSupported(): boolean {
  return (
    isAndroid() &&
    isHardwareKeystoreExists &&
    !!NativeModules.RNPlayIntegrityModule &&
    !!NativeModules.RNSecureKeystoreModule
  );
}

/**
 * The value the Play Integrity verdict must be requested with, binding it to the nonce and the device key.
 */
export function integrityNonce(nonce: string, thumbprint: string): string {
  return base64url(Buffer.from(sha256(nonce + thumbprint)));
}

async function deviceKey(): Promise<DeviceKey> {
  const {RNSecureKeystoreModule} = NativeModules;
  let publicKeyPem: string | null = null;
  try {
    publicKeyPem = await RNSecureKeystoreModule.retrieveKey(DEVICE_KEY_ALIAS);
  } catch {
    publicKeyPem = null;
  }
  if (!publicKeyPem) {
    // Not gated by biometrics: the key only proves the app install, it unlocks no user data
    publicKeyPem = await RNSecureKeystoreModule.generateKeyPair(
      'ES256',
      DEVICE_KEY_ALIAS,
      false,
      0,
    );
  }
  const key = await jose.JWK.asKey(publicKeyPem, 'pem');
  const {kty, crv, x, y} = key.toJSON() as DeviceKey['publicJwk'];
  const thumbprint = base64url(Buffer.from(await key.thumbprint('SHA-256')));
  return {publicJwk: {kty, crv, x, y}, thumbprint};
}

async function fetchNonce(mimotoBase: string): Promise<string> {
  const response = await fetch(`${mimotoBase}/device/nonce`, {method: 'GET'});
  if (!response.ok) {
    throw new Error(
      `Device nonce request failed with status ${response.status}`,
    );
  }
  const {nonce} = await response.json();
  if (!nonce) {
    throw new Error('Device nonce response has no nonce');
  }
  return nonce;
}

async function registeredThumbprint(
  mimotoBase: string,
): Promise<string | null> {
  try {
    const data = await NativeModules.RNSecureKeystoreModule.getData(
      REGISTRATION_KEY_PREFIX + mimotoBase,
    );
    return Array.isArray(data) && data[0] ? data[0] : null;
  } catch {
    return null;
  }
}

async function register(mimotoBase: string, key: DeviceKey) {
  const nonce = await fetchNonce(mimotoBase);
  const integrityToken =
    await NativeModules.RNPlayIntegrityModule.requestIntegrityToken(
      integrityNonce(nonce, key.thumbprint),
      PLAY_INTEGRITY_CLOUD_PROJECT_NUMBER ?? '',
    );
  const response = await fetch(`${mimotoBase}/device/register`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      platform: 'ANDROID',
      nonce,
      public_key_jwk: key.publicJwk,
      integrity_token: integrityToken,
    }),
  });
  if (response.status !== 201) {
    throw new Error(
      `Device registration failed with status ${
        response.status
      }: ${await response.text()}`,
    );
  }
  await NativeModules.RNSecureKeystoreModule.storeData(
    REGISTRATION_KEY_PREFIX + mimotoBase,
    key.thumbprint,
  );
}

/**
 * Registers the device key with this mimoto unless it already is. Concurrent callers share one registration.
 */
export async function ensureRegistered(mimotoBase: string): Promise<void> {
  const key = await deviceKey();
  if ((await registeredThumbprint(mimotoBase)) === key.thumbprint) {
    return;
  }
  let pending = inFlightRegistrations.get(mimotoBase);
  if (!pending) {
    pending = register(mimotoBase, key).finally(() =>
      inFlightRegistrations.delete(mimotoBase),
    );
    inFlightRegistrations.set(mimotoBase, pending);
  }
  await pending;
}

/**
 * Forgets that this mimoto knows the device key, e.g. after it answers device_not_registered.
 */
export async function forgetRegistration(mimotoBase: string): Promise<void> {
  await NativeModules.RNSecureKeystoreModule.storeData(
    REGISTRATION_KEY_PREFIX + mimotoBase,
    '',
  );
}

async function signEs256(signingInput: string): Promise<string> {
  const derBase64: string =
    await NativeModules.RNSecureKeystoreModule.signBytes(
      'ES256',
      DEVICE_KEY_ALIAS,
      Buffer.from(signingInput, 'utf8').toString('base64'),
    );
  const der = Buffer.from(derBase64.replace(/\n/g, ''), 'base64');
  return base64url.fromBase64(convertDerToRsFormat(der));
}

/**
 * Builds the device proof for one get-token request. The proof is bound to a fresh mimoto nonce, the request
 * method and URL, and the exact form body, so it cannot be replayed or moved onto another request.
 */
export async function buildDeviceProof(
  tokenEndpoint: string,
  formBody: string,
): Promise<string> {
  const mimotoBase = mimotoBaseFromTokenEndpoint(tokenEndpoint);
  if (!mimotoBase) {
    throw new Error('Token endpoint is not a mimoto get-token endpoint');
  }
  const key = await deviceKey();
  const nonce = await fetchNonce(mimotoBase);
  const iat = Math.floor(Date.now() / 1000);
  const header = {alg: 'ES256', typ: PROOF_TYPE, kid: key.thumbprint};
  const claims = {
    nonce,
    htm: 'POST',
    htu: tokenEndpoint.split(/[?#]/)[0],
    iat,
    exp: iat + PROOF_LIFETIME_SECONDS,
    req_hash: base64url(Buffer.from(sha256(formBody))),
  };
  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(
    JSON.stringify(claims),
  )}`;
  return `${signingInput}.${await signEs256(signingInput)}`;
}
