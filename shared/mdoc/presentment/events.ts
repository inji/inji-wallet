/**
 * Presentment event names, kept in a leaf module with no imports of its own.
 *
 * Both engines emit these: the Android native Multipaz module sends them over the RN bridge, and
 * the common TypeScript engine sends them through its local emitter. `../iso18013PresentmentInterop`
 * re-exports them so existing importers are unaffected.
 *
 * They live here rather than in that file because the TS engine and the interop layer import
 * from each other — the interop layer dispatches into the engine, and the engine emits events the
 * interop layer defines. Holding the constants in a module neither side owns breaks the cycle;
 * the *types* can stay in the interop layer since `import type` is erased at runtime.
 */

export const MDOC_PRESENTMENT_CONSENT_REQUIRED =
  'MdocPresentmentConsentRequired';
export const MDOC_PRESENTMENT_CONSENT_DISMISSED =
  'MdocPresentmentConsentDismissed';
export const MDOC_PRESENTMENT_CANNOT_SATISFY = 'MdocPresentmentCannotSatisfy';
export const MDOC_PRESENTMENT_RESPONSE_SENT = 'MdocPresentmentResponseSent';
/** A reader attached over BLE (i.e. it scanned the QR); fired before any DeviceRequest. */
export const MDOC_PRESENTMENT_READER_CONNECTED =
  'MdocPresentmentReaderConnected';

export type PresentmentEventName =
  | typeof MDOC_PRESENTMENT_READER_CONNECTED
  | typeof MDOC_PRESENTMENT_CONSENT_REQUIRED
  | typeof MDOC_PRESENTMENT_CONSENT_DISMISSED
  | typeof MDOC_PRESENTMENT_CANNOT_SATISFY
  | typeof MDOC_PRESENTMENT_RESPONSE_SENT;
