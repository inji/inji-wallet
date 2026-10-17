/**
 * ISO/IEC 18013-5 **proximity presentation** (post–DeviceEngagement QR): BLE session,
 * SessionTranscript, encrypted DeviceRequest / DeviceResponse, DeviceAuthentication, COSE_Sign1.
 *
 * This **cannot** be implemented faithfully in React Native JavaScript alone (Hermes) at the
 * same level as [Multipaz](https://github.com/openwallet-foundation/multipaz): timing, GATT,
 * and byte-exact CBOR/crypto belong in **native** code. Use this module as the **TypeScript
 * contract** for a thin RN bridge to Multipaz (or another ISO-complete SDK).
 *
 * @see https://developer.multipaz.org/docs/getting-started/holder/presentation/
 */

import {Buffer} from 'buffer';
import {
  EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from 'react-native';

import {
  MDOC_PRESENTMENT_CANNOT_SATISFY,
  MDOC_PRESENTMENT_CONSENT_DISMISSED,
  MDOC_PRESENTMENT_CONSENT_REQUIRED,
  MDOC_PRESENTMENT_READER_CONNECTED,
  MDOC_PRESENTMENT_RESPONSE_SENT,
  type PresentmentEventName,
} from './presentment/events';
import {
  addPresentmentListener,
  approveMdocPresentmentConsent,
  denyMdocPresentmentConsent,
  isMdocPresentmentEngineAvailable,
  startMdocPresentmentSession,
  stopMdocPresentmentSession,
} from './presentment';

/** Multipaz holder QR presentment composable (KMP) — wire equivalent in Android/iOS native. */
export const MULTIPAZ_REFERENCE = {
  holderPresentationDoc:
    'https://developer.multipaz.org/docs/getting-started/holder/presentation/',
  samplesPresentmentGradle:
    'https://github.com/openwallet-foundation/multipaz-samples/blob/main/MultipazGettingStartedSample/feature/presentment/build.gradle.kts',
} as const;

export type PresentmentPhase =
  | 'idle'
  | 'bleAdvertising'
  | 'awaitingReader'
  | 'sessionEstablishment'
  | 'deviceRequestReceived'
  | 'userConsent'
  | 'buildingDeviceResponse'
  | 'sendingDeviceResponse'
  | 'completed'
  | 'failed';

export interface Iso18013PresentmentParams {
  /** VC store id (same as `iso18013_de` keystore suffix family). */
  vcId: string;
  /** Issuer-signed mdoc credential (CBOR) as base64 or base64url — native must parse MSO. */
  msoMdocCredentialCompact: string;
  /** e.g. org.iso.18013.5.1.mDL */
  docType: string;
  /** Exact `mdoc:`… string already shown to the user (bytes must not change). */
  deviceEngagementUri: string;
  /** Raw DeviceEngagement CBOR bytes (must equal decoded URI payload). */
  deviceEngagementCbor: Uint8Array;
  /** Ephemeral P-256 private key bytes (must pair with COSE_Key in engagement). */
  ephemeralPresentationPrivateKey: Uint8Array;
  /** When true, native uses software-imported device key (e.g. iOS ES256 material). */
  useSoftwareDeviceKey?: boolean;
  /** Standard base64 of raw P-256 device private key (32 bytes) for software path. */
  deviceKeyPrivateBase64?: string;
}

export interface Iso18013PresentmentCallbacks {
  onPhase?: (phase: PresentmentPhase, detail?: string) => void;
  /** Native layer should log hex only in __DEV__ / gated builds. */
  onDebugHex?: (label: string, hex: string) => void;
  /** Fired when the verifier's DeviceRequest needs user approval before DeviceResponse. */
  onConsentRequired?: (request: MdocPresentmentConsentRequest) => void;
  /** Fired when consent UI should close (approve, deny, session end, cancel). */
  onConsentDismissed?: () => void;
}

/** One data element the verifier asked for (ISO 18013-5 nameSpaces). */
export interface MdocPresentmentConsentElement {
  namespace: string;
  element: string;
  intentToRetain: boolean;
  optional: boolean;
}

/**
 * One element from the verifier's *original* DeviceRequest, before the wallet narrows it to what
 * this credential can serve (ISO 18013-5 §8.3.2.1.2). `elements` on the consent request is the
 * narrowed set that will actually be disclosed; this is the full ask.
 */
export interface MdocPresentmentRequestedElement {
  namespace: string;
  element: string;
  intentToRetain: boolean;
  /** False when the credential has no matching element, so it is omitted from the response. */
  servable: boolean;
  /** Wallet element name when it differs from the verifier's (synonym remap), else null. */
  servedAs: string | null;
}

export interface MdocPresentmentConsentRequest {
  docType: string;
  /** Human-readable credential label (e.g. "Authorized Inji Certificate"). */
  credentialLabel?: string;
  /** Verifier display name from readerAuth / trust metadata when available. */
  verifierName?: string;
  /** Purpose from deviceRequestInfo.purposeHints or free-text otherInfo. */
  purpose?: string;
  /** Numeric purposeHints code when present (ISO 18013-5 §10.2.5). */
  purposeHintCode?: number | null;
  /** The narrowed set the wallet will disclose. */
  elements: MdocPresentmentConsentElement[];
  /** Everything the verifier asked for, including elements the wallet cannot serve. */
  requestedElements?: MdocPresentmentRequestedElement[];
  requestInfo?: {
    intent_to_retain?: boolean;
    /** Verifier's own display name for itself, when it sends one — preferred over the
     * readerAuth/trust-metadata-derived verifierName above when present. */
    verifier_name?: string;
    purpose?: string;
    purposes?: Array<{
      id?: string;
      name: string;
      is_required: boolean;
      description?: string;
      /** Longer explanation shown under the purpose title. */
      details?: string;
      /** Element identifiers this purpose needs; elements no agreed purpose needs are withheld. */
      elements?: string[];
      /** How the verifier keeps data for this purpose, e.g. "Anonymised · stored for 1 year". */
      retention?: string;
    }>;
    legal_basis?: string;
    /** Who else receives the data, e.g. "No third parties". */
    shared_with?: string;
  };
}

/** One element the user agreed to disclose; echoed back to the engine on approve. */
export interface MdocDisclosedElement {
  namespace: string;
  element: string;
}

// Defined in a leaf module so the common TypeScript engine can emit them without importing this
// file at runtime (it needs the types from here, which `import type` erases). Re-exported so
// every existing importer is unaffected.
export {
  MDOC_PRESENTMENT_CANNOT_SATISFY,
  MDOC_PRESENTMENT_CONSENT_DISMISSED,
  MDOC_PRESENTMENT_CONSENT_REQUIRED,
  MDOC_PRESENTMENT_READER_CONNECTED,
  MDOC_PRESENTMENT_RESPONSE_SENT,
} from './presentment/events';

export interface MdocPresentmentCannotSatisfyEvent {
  reason: string;
  walletDocType: string;
  requestedDocTypes: string[];
}

export class Iso18013PresentmentNotImplementedError extends Error {
  constructor(message?: string) {
    super(
      message ??
        'ISO/IEC 18013-5 proximity presentation is not available on this platform build. On Android, Multipaz must be on the classpath and MdocIso18013Presentment registered. See shared/mdoc/README.md.',
    );
    this.name = 'Iso18013PresentmentNotImplementedError';
  }
}

type MdocNative = {
  startPresentment: (config: Record<string, unknown>) => Promise<boolean>;
  stopPresentment: () => void;
  approvePresentment?: (
    purposesJson: string | null,
    disclosedElementsJson: string | null,
  ) => Promise<boolean>;
  denyPresentment?: () => Promise<boolean>;
  addListener?: (eventName: string) => void;
  removeListeners?: (count: number) => void;
};

function getNativeModule(): MdocNative | undefined {
  return (NativeModules as {MdocIso18013Presentment?: MdocNative})
    .MdocIso18013Presentment;
}

function getEventEmitter(): NativeEventEmitter | null {
  const nm = getNativeModule();
  if (Platform.OS !== 'android' || !nm) {
    return null;
  }
  return new NativeEventEmitter(nm as never);
}

/**
 * True when this platform runs the common TypeScript engine rather than a native presenter.
 *
 * iOS only, for now. Android has a working Multipaz-based native presenter and is deliberately
 * left on it — see `presentment/bleTransport.ts`.
 */
function usesCommonEngine(): boolean {
  return isMdocPresentmentEngineAvailable();
}

/**
 * Subscribes to a presentment event on whichever engine is active.
 *
 * Both engines use the same event names and payload shapes, so every `subscribeMdocPresentment*`
 * helper below is engine-agnostic and callers never branch on platform.
 */
function addEngineListener(
  event: PresentmentEventName,
  listener: (payload: unknown) => void,
): EmitterSubscription | {remove: () => void} | null {
  if (usesCommonEngine()) {
    return addPresentmentListener(event, listener);
  }
  const emitter = getEventEmitter();
  if (!emitter) {
    return null;
  }
  return emitter.addListener(event, listener);
}

function normalizeConsentPayload(raw: unknown): MdocPresentmentConsentRequest {
  const obj = (raw ?? {}) as {
    docType?: string;
    credentialLabel?: string;
    verifierName?: string;
    purpose?: string;
    purposeHintCode?: number | null;
    requestInfoJson?: string;
    requestInfo?: unknown;
    elements?: Array<{
      namespace?: string;
      element?: string;
      intentToRetain?: boolean;
      optional?: boolean;
    }>;
    requestedElements?: Array<{
      namespace?: string;
      element?: string;
      intentToRetain?: boolean;
      servable?: boolean;
      servedAs?: string | null;
    }>;
  };
  const purposeHintCode =
    typeof obj.purposeHintCode === 'number' &&
    Number.isFinite(obj.purposeHintCode)
      ? obj.purposeHintCode
      : null;
  return {
    docType: typeof obj.docType === 'string' ? obj.docType : '',
    credentialLabel:
      typeof obj.credentialLabel === 'string' ? obj.credentialLabel : undefined,
    verifierName:
      typeof obj.verifierName === 'string' ? obj.verifierName : undefined,
    purpose: typeof obj.purpose === 'string' ? obj.purpose : '',
    purposeHintCode,
    elements: Array.isArray(obj.elements)
      ? obj.elements.map(el => ({
          namespace: String(el?.namespace ?? ''),
          element: String(el?.element ?? ''),
          intentToRetain: !!el?.intentToRetain,
          optional: !!el?.optional,
        }))
      : [],
    requestedElements: Array.isArray(obj.requestedElements)
      ? obj.requestedElements.map(el => ({
          namespace: String(el?.namespace ?? ''),
          element: String(el?.element ?? ''),
          intentToRetain: !!el?.intentToRetain,
          servable: el?.servable !== false,
          servedAs: typeof el?.servedAs === 'string' ? el.servedAs : null,
        }))
      : undefined,
    requestInfo: (() => {
      // Android serialises requestInfo to JSON to cross the bridge; the common TypeScript
      // engine has no bridge in the way and passes the object straight through.
      if (obj.requestInfo && typeof obj.requestInfo === 'object') {
        return obj.requestInfo as MdocPresentmentConsentRequest['requestInfo'];
      }
      if (typeof obj.requestInfoJson === 'string' && obj.requestInfoJson) {
        try {
          return JSON.parse(obj.requestInfoJson);
        } catch (e) {
          return undefined;
        }
      }
      return undefined;
    })(),
  };
}

/**
 * Stand-in returned by the subscribe helpers when there is no engine to attach to (no native
 * module registered and no common engine available), so callers can always call .remove()
 * unconditionally.
 */
const noopSubscription = {
  remove: () => {
    // Nothing was ever subscribed, so there is nothing to detach.
  },
};

/**
 * Subscribe to "a reader attached over BLE" — the verifier scanned the QR and the session is
 * being established, but no DeviceRequest has arrived yet.
 */
export function subscribeMdocPresentmentReaderConnected(
  listener: () => void,
): EmitterSubscription | {remove: () => void} {
  return (
    addEngineListener(MDOC_PRESENTMENT_READER_CONNECTED, () => {
      listener();
    }) ?? noopSubscription
  );
}

/**
 * Subscribe to "consent required" (after DeviceRequest, before DeviceResponse).
 * Keep the subscription active for the whole presentment lifetime.
 */
export function subscribeMdocPresentmentConsentRequired(
  listener: (request: MdocPresentmentConsentRequest) => void,
): EmitterSubscription | {remove: () => void} {
  return (
    addEngineListener(MDOC_PRESENTMENT_CONSENT_REQUIRED, raw => {
      if (__DEV__) {
        console.log(
          '[mdoc presentment] consent required:',
          JSON.stringify(raw, null, 2),
        );
      }
      listener(normalizeConsentPayload(raw));
    }) ?? noopSubscription
  );
}

/**
 * Subscribe to "the DeviceResponse actually went out" — fired after DeviceAuth signing
 * (so after the keystore biometric prompt) and the transport send both succeeded.
 * MDOC_PRESENTMENT_CONSENT_DISMISSED fires on the success *and* teardown paths, so this
 * is the only reliable way to tell a completed share from a cancelled/failed one.
 */
export function subscribeMdocPresentmentResponseSent(
  listener: () => void,
): EmitterSubscription | {remove: () => void} {
  return (
    addEngineListener(MDOC_PRESENTMENT_RESPONSE_SENT, () => {
      listener();
    }) ?? noopSubscription
  );
}

/** Subscribe when the consent overlay should close. */
export function subscribeMdocPresentmentConsentDismissed(
  listener: () => void,
): EmitterSubscription | {remove: () => void} {
  return (
    addEngineListener(MDOC_PRESENTMENT_CONSENT_DISMISSED, () => {
      listener();
    }) ?? noopSubscription
  );
}

/**
 * Subscribe when the wallet cannot satisfy the reader's DeviceRequest
 * (e.g. requested docType is not the credential currently being presented).
 */
export function subscribeMdocPresentmentCannotSatisfy(
  listener: (event: MdocPresentmentCannotSatisfyEvent) => void,
): EmitterSubscription | {remove: () => void} {
  return (
    addEngineListener(MDOC_PRESENTMENT_CANNOT_SATISFY, raw => {
      const obj = (raw ?? {}) as {
        reason?: string;
        walletDocType?: string;
        requestedDocTypes?: unknown;
      };
      listener({
        reason: typeof obj.reason === 'string' ? obj.reason : '',
        walletDocType:
          typeof obj.walletDocType === 'string' ? obj.walletDocType : '',
        requestedDocTypes: Array.isArray(obj.requestedDocTypes)
          ? obj.requestedDocTypes.map(String)
          : [],
      });
    }) ?? noopSubscription
  );
}

/**
 * Starts full proximity presentation (BLE + session + DeviceResponse).
 *
 * Runs on whichever engine this platform has: the common TypeScript implementation (iOS) or the
 * native Multipaz presenter (Android). Consent is requested mid-session via
 * [subscribeMdocPresentmentConsentRequired] / callbacks either way.
 */
export async function startIso18013ProximityPresentment(
  params: Iso18013PresentmentParams,
  callbacks?: Iso18013PresentmentCallbacks,
): Promise<void> {
  const nm = getNativeModule();
  const useCommonEngine = usesCommonEngine();
  if (!useCommonEngine && (Platform.OS !== 'android' || !nm?.startPresentment)) {
    throw new Iso18013PresentmentNotImplementedError();
  }

  const consentSub = callbacks?.onConsentRequired
    ? subscribeMdocPresentmentConsentRequired(request => {
        callbacks.onPhase?.('userConsent');
        callbacks.onConsentRequired?.(request);
      })
    : null;
  const dismissSub = callbacks?.onConsentDismissed
    ? subscribeMdocPresentmentConsentDismissed(() => {
        callbacks.onConsentDismissed?.();
      })
    : null;

  try {
    callbacks?.onPhase?.('bleAdvertising');
    if (useCommonEngine) {
      // The TS engine reports each phase as it happens, so the caller's onPhase is threaded
      // through rather than being synthesised around a single opaque await.
      await startMdocPresentmentSession(params, callbacks?.onPhase);
    } else {
      await nm!.startPresentment({
        issuerSignedCompact: params.msoMdocCredentialCompact,
        deviceEngagementCborBase64: Buffer.from(
          params.deviceEngagementCbor,
        ).toString('base64'),
        ephemeralPrivateKeyBase64: Buffer.from(
          params.ephemeralPresentationPrivateKey,
        ).toString('base64'),
        useSoftwareDeviceKey: !!params.useSoftwareDeviceKey,
        deviceKeyPrivateBase64: params.deviceKeyPrivateBase64,
      });
      callbacks?.onPhase?.('completed');
    }
  } finally {
    consentSub?.remove();
    dismissSub?.remove();
  }
}

/** Stops the active proximity session (BLE), if any. */
export function stopIso18013ProximityPresentment(): void {
  if (usesCommonEngine()) {
    void stopMdocPresentmentSession();
    return;
  }
  const nm = getNativeModule();
  nm?.stopPresentment?.();
}

/**
 * Approve sharing after [MDOC_PRESENTMENT_CONSENT_REQUIRED].
 *
 * @param disclosedElements the subset of the consent request's `elements` the user agreed to
 *   share; omitted means all of them. Both engines drop everything else from the DeviceResponse.
 */
export async function approveIso18013PresentmentConsent(
  purposesJson?: string,
  disclosedElements?: MdocDisclosedElement[],
): Promise<void> {
  if (usesCommonEngine()) {
    // purposesJson is an Android-only echo into the DeviceResponse.
    approveMdocPresentmentConsent(disclosedElements);
    return;
  }
  const nm = getNativeModule();
  if (!nm?.approvePresentment) {
    throw new Iso18013PresentmentNotImplementedError(
      'approvePresentment is not available on this build',
    );
  }
  await nm.approvePresentment(
    purposesJson ?? null,
    disclosedElements ? JSON.stringify(disclosedElements) : null,
  );
}

/** Deny sharing after [MDOC_PRESENTMENT_CONSENT_REQUIRED] — no DeviceResponse is sent. */
export async function denyIso18013PresentmentConsent(): Promise<void> {
  if (usesCommonEngine()) {
    denyMdocPresentmentConsent();
    return;
  }
  const nm = getNativeModule();
  if (!nm?.denyPresentment) {
    throw new Iso18013PresentmentNotImplementedError(
      'denyPresentment is not available on this build',
    );
  }
  await nm.denyPresentment();
}

/**
 * Standard `mdoc:` QR is **not** DEFLATE-compressed in ISO/IEC 18013-5:2021 §8.1.2.3 / common
 * interop (Multipaz, Tap2iD): **base64url** of raw **DeviceEngagement** CBOR. Do not add
 * compression unless a deployment profile explicitly requires it.
 */
export function mdocUriUsesRawCborBase64url(uri: string): boolean {
  return uri.startsWith('mdoc:') || uri.startsWith('mDL:');
}
