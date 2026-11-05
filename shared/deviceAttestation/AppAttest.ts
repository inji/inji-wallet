import {NativeModules} from 'react-native';
import {isIOS} from '../constants';

/**
 * Thin wrapper over the iOS RNAppAttestModule.
 * - App Attest (Apple's attestation that this is a genuine, unmodified Inji Wallet), the iOS
 *   counterpart of RNPlayIntegrityModule, used once to register the device key with mimoto.
 * - The device key itself: an ES256 key in the Secure Enclave that signs get-token device proofs.
 */

export type AppAttestResult = {keyId: string; attestation: string};

const appAttestModule = () => NativeModules.RNAppAttestModule;

export function hasAppAttestModule(): boolean {
  return isIOS() && !!appAttestModule();
}

export async function isAppAttestSupported(): Promise<boolean> {
  if (!hasAppAttestModule()) {
    return false;
  }
  try {
    return await appAttestModule().isSupported();
  } catch {
    return false;
  }
}

/**
 * Attests the App Attest key (creating it on first use) for the given challenge.
 * Native side hashes the challenge: clientDataHash = SHA-256(UTF-8(challenge)).
 * Errors carry codes such as SERVER_UNAVAILABLE (retry later, same key) or INVALID_KEY.
 */
export async function appAttest(challenge: string): Promise<AppAttestResult> {
  return appAttestModule().attest(challenge);
}

export async function resetAppAttestKey(): Promise<void> {
  await appAttestModule().resetKey();
}

/** PEM public key of the Secure Enclave device key, created on first use. */
export async function deviceKeyPublicPem(alias: string): Promise<string> {
  return appAttestModule().getOrCreateDeviceKey(alias);
}

/** Signs base64 data with the device key (ECDSA P-256 / SHA-256); returns a base64 DER signature. */
export async function signWithDeviceKey(
  alias: string,
  dataBase64: string,
): Promise<string> {
  return appAttestModule().signWithDeviceKey(alias, dataBase64);
}
