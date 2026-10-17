/**
 * Public surface of the common (TypeScript) ISO 18013-5 presentment engine.
 *
 * `../iso18013PresentmentInterop` routes here when {@link isMdocPresentmentEngineAvailable} is
 * true and to the Android native Multipaz module otherwise, so callers — `QrCodeOverlay`, the
 * consent overlay — never branch on platform themselves.
 *
 * Events are delivered through a local emitter with the same names and payload shapes the native
 * module uses. That is what lets the existing `subscribeMdocPresentment*` helpers work unchanged
 * against either engine.
 */

import {Buffer} from 'buffer';

import {softwareEs256Signer, type Es256Signer} from './cose';
import {isMdocBleTransportAvailable} from './bleTransport';
import {
  MdocPresentmentSession,
  type PresentmentEventListener,
  type PresentmentEventName,
} from './presentmentSession';
import type {
  Iso18013PresentmentParams,
  MdocDisclosedElement,
  PresentmentPhase,
} from '../iso18013PresentmentInterop';

export {isMdocBleTransportAvailable} from './bleTransport';

/** True when this build can run a presentment session entirely from TypeScript. */
export function isMdocPresentmentEngineAvailable(): boolean {
  return isMdocBleTransportAvailable();
}

// --- local event bus -------------------------------------------------------
// Mirrors NativeEventEmitter's contract (addListener → {remove}) so the interop layer can treat
// both engines identically.

const listeners = new Map<string, Set<PresentmentEventListener>>();

export function addPresentmentListener(
  event: PresentmentEventName,
  listener: PresentmentEventListener,
): {remove: () => void} {
  let set = listeners.get(event);
  if (!set) {
    set = new Set();
    listeners.set(event, set);
  }
  set.add(listener);
  return {
    remove: () => {
      set?.delete(listener);
    },
  };
}

function emit(event: PresentmentEventName, payload: unknown): void {
  const set = listeners.get(event);
  if (!set) {
    return;
  }
  // Copy first: a listener that unsubscribes itself must not perturb this iteration.
  for (const listener of [...set]) {
    try {
      listener(payload);
    } catch (e) {
      console.warn(`[mdoc presentment] listener for ${event} threw`, e);
    }
  }
}

// --- session lifetime ------------------------------------------------------

let activeSession: MdocPresentmentSession | null = null;

/**
 * Builds the DeviceAuth signer.
 *
 * iOS exports its ES256 private key to JS (`useSoftwareDeviceKey`), which is why a software
 * signer is enough here. Android keeps the device key non-extractable in the hardware keystore,
 * so when it adopts this engine it supplies a signer that calls across the bridge instead —
 * that is the whole reason {@link Es256Signer} is injected rather than constructed inline.
 */
function signerFor(params: Iso18013PresentmentParams): Es256Signer {
  if (!params.useSoftwareDeviceKey || !params.deviceKeyPrivateBase64) {
    throw new Error(
      'No device key available for DeviceAuth. iOS proximity presentment needs the ES256 ' +
        'private key (useSoftwareDeviceKey); a hardware-keystore signer is not wired on this platform.',
    );
  }
  const raw = new Uint8Array(
    Buffer.from(params.deviceKeyPrivateBase64, 'base64'),
  );
  if (raw.length !== 32) {
    throw new Error(
      `DeviceAuth private key must be 32 raw P-256 bytes, got ${raw.length}`,
    );
  }
  return softwareEs256Signer(raw);
}

/**
 * Starts a proximity session and resolves when it finishes.
 *
 * Any session already running is cancelled first: the QR overlay can remount (navigation,
 * StrictMode, rotation) and two peripherals advertising the same service UUID would make the
 * reader connect to whichever answered first, with keys derived from the other engagement.
 */
export async function startMdocPresentmentSession(
  params: Iso18013PresentmentParams,
  onPhase?: (phase: PresentmentPhase, detail?: string) => void,
): Promise<void> {
  await stopMdocPresentmentSession();

  const session = new MdocPresentmentSession({
    credentialCompact: params.msoMdocCredentialCompact,
    docType: params.docType,
    deviceEngagementCbor: params.deviceEngagementCbor,
    ephemeralPrivateKey: params.ephemeralPresentationPrivateKey,
    signer: signerFor(params),
    emit,
    onPhase,
  });
  activeSession = session;

  try {
    await session.run();
  } finally {
    if (activeSession === session) {
      activeSession = null;
    }
  }
}

export async function stopMdocPresentmentSession(): Promise<void> {
  const session = activeSession;
  activeSession = null;
  session?.cancel();
}

export function approveMdocPresentmentConsent(
  disclosedElements?: MdocDisclosedElement[],
): void {
  activeSession?.approveConsent(disclosedElements);
}

export function denyMdocPresentmentConsent(): void {
  activeSession?.denyConsent();
}
