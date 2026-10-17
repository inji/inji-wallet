/**
 * Reads the stored `mso_mdoc` credential and indexes it for selective disclosure.
 *
 * The wallet persists whatever OpenID4VCI / PixelPass produced, which in practice is one of
 * three shapes — bare `IssuerSigned`, an ISO `Document`, or a whole `DeviceResponse`. The same
 * three cases are handled on Android (`extractIssuerSignedBytes`), and this mirrors that
 * behaviour so a credential that works there works here.
 *
 * **Byte preservation is the point of this module.** The MSO's `ValueDigests` are computed over
 * each `IssuerSignedItemBytes` exactly as the issuer serialized it (ISO 18013-5 §9.1.2.5), so
 * disclosed items are carried through as their original byte slices and never re-encoded. A
 * re-encoded item that differs by a single length header still decodes to the same value and
 * still looks right in logs, but its digest no longer matches the MSO and the verifier rejects
 * the credential as tampered.
 */

import {Buffer} from 'buffer';

import {CborRaw, encodeCbor} from '../cborEncodeMinimal';
import {asArray, asBytes, asMap, asText, decodeCbor, DecodedTag} from './cbor';
import {parseCoseSign1} from './cose';

/** One disclosable element, with the exact issuer bytes that must be echoed back. */
export interface IndexedIssuerSignedItem {
  namespace: string;
  elementIdentifier: string;
  digestID: number;
  /** Original `#6.24(bstr .cbor IssuerSignedItem)` bytes — never re-encode these. */
  raw: Uint8Array;
}

export interface ParsedIssuerSignedCredential {
  docType: string;
  /** Re-encoded `issuerAuth` COSE_Sign1; see {@link issuerAuthEncoded} on why that is safe. */
  issuerAuthEncoded: Uint8Array;
  /** namespace → elementIdentifier → item. */
  elements: Map<string, Map<string, IndexedIssuerSignedItem>>;
  /** Present only when the MSO could be read; used for a clearer "cannot satisfy" message. */
  msoDocType: string | null;
}

/** Decodes the persisted compact credential string, accepting base64url or standard base64. */
export function decodeIssuerSignedCompact(compact: string): Uint8Array {
  const trimmed = compact.trim();
  if (trimmed.length === 0) {
    throw new Error('mso_mdoc credential string is empty');
  }
  // base64url and base64 differ only in two alphabet characters and padding, and Buffer's
  // base64 decoder accepts both alphabets — normalising first keeps a single code path.
  const normalized = trimmed.replace(/-/g, '+').replace(/_/g, '/');
  const bytes = new Uint8Array(Buffer.from(normalized, 'base64'));
  if (bytes.length === 0) {
    throw new Error(
      `mso_mdoc credential is not valid base64url or base64 (length=${trimmed.length})`,
    );
  }
  return bytes;
}

/**
 * Narrows any of the three persisted shapes down to the `IssuerSigned` map.
 *
 * Mirrors Android's `extractIssuerSignedBytes`, including its diagnostics: a credential that
 * fails here fails identically on both platforms, with the same top-level key list in the
 * message, so a report from one platform is actionable for the other.
 */
function extractIssuerSignedMap(
  credentialCbor: Uint8Array,
): Map<unknown, unknown> {
  const root = asMap(decodeCbor(credentialCbor), 'mso_mdoc credential');

  if (root.get('issuerAuth') !== undefined) {
    return root;
  }

  const nested = root.get('issuerSigned');
  if (nested !== undefined) {
    return asMap(nested, 'Document.issuerSigned');
  }

  const documents = root.get('documents');
  if (documents !== undefined) {
    const docs = asArray(documents, 'DeviceResponse.documents');
    if (docs.length === 0) {
      throw new Error(
        'DeviceResponse has an empty documents[] — cannot extract IssuerSigned',
      );
    }
    const first = asMap(docs[0], 'DeviceResponse.documents[0]');
    const issuerSigned = first.get('issuerSigned');
    if (issuerSigned === undefined) {
      throw new Error('DeviceResponse.documents[0] has no issuerSigned');
    }
    return asMap(issuerSigned, 'DeviceResponse.documents[0].issuerSigned');
  }

  const keys = [...root.keys()].map(String).join(', ');
  throw new Error(
    'mso_mdoc credential CBOR is not IssuerSigned, Document, or DeviceResponse. ' +
      `Top-level keys: [${keys}]. Expected issuerAuth, or issuerSigned, or documents[].`,
  );
}

/**
 * The MSO carried in the `issuerAuth` payload, or null when it cannot be read.
 *
 * `issuerAuth` is a COSE_Sign1 whose payload is `MobileSecurityObjectBytes = #6.24(bstr .cbor
 * MobileSecurityObject)`.
 */
function msoFromIssuerAuth(issuerAuth: unknown): Map<unknown, unknown> | null {
  try {
    const sign1 = parseCoseSign1(issuerAuth);
    if (!sign1.payload) {
      return null;
    }
    // The payload bstr content is itself #6.24(bstr .cbor MSO).
    const payloadItem = decodeCbor(sign1.payload);
    const msoBytes =
      payloadItem instanceof DecodedTag
        ? payloadItem.embeddedCbor
        : sign1.payload;
    return asMap(decodeCbor(msoBytes), 'MobileSecurityObject');
  } catch {
    return null;
  }
}

/**
 * Pulls `docType` out of the MSO. This is best-effort: the caller falls back to the docType
 * recorded alongside the credential, and a credential whose MSO we cannot read is still
 * presentable.
 */
function msoDocTypeFromIssuerAuth(issuerAuth: unknown): string | null {
  const docType = msoFromIssuerAuth(issuerAuth)?.get('docType');
  return typeof docType === 'string' ? docType : null;
}

/** A `tdate` (#6.0 text) or epoch-seconds (#6.1, or untagged) CBOR date. */
function cborDate(value: unknown): Date | null {
  const inner = value instanceof DecodedTag ? value.value : value;
  const date =
    typeof inner === 'string'
      ? new Date(inner)
      : typeof inner === 'number'
      ? new Date(inner * 1000)
      : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

/**
 * The MSO's `validityInfo.validUntil`, after which verifiers reject the credential. Null when
 * the credential, its MSO or the date cannot be read.
 */
export function readMsoValidUntil(compact: string): Date | null {
  try {
    const issuerSigned = extractIssuerSignedMap(
      decodeIssuerSignedCompact(compact),
    );
    const validityInfo = msoFromIssuerAuth(issuerSigned.get('issuerAuth'))?.get(
      'validityInfo',
    );
    return validityInfo instanceof Map
      ? cborDate(validityInfo.get('validUntil'))
      : null;
  } catch {
    return null;
  }
}

/**
 * Parses and indexes the credential.
 *
 * `fallbackDocType` is used when the MSO cannot be read — the caller already resolves a docType
 * from `processedCredential`, and refusing to present over an unreadable MSO would be a
 * regression against Android, which only warns.
 */
export function parseIssuerSignedCredential(
  compact: string,
  fallbackDocType: string,
): ParsedIssuerSignedCredential {
  const credentialCbor = decodeIssuerSignedCompact(compact);
  const issuerSigned = extractIssuerSignedMap(credentialCbor);

  const issuerAuth = issuerSigned.get('issuerAuth');
  if (issuerAuth === undefined) {
    const keys = [...issuerSigned.keys()].map(String).join(', ');
    throw new Error(`IssuerSigned has no issuerAuth (keys=[${keys}])`);
  }

  // Re-encoding issuerAuth is safe where re-encoding an item is not: the issuer's signature
  // covers the COSE Sig_structure (protected-header bytes and payload bytes, both preserved
  // verbatim as byte strings), never the serialization of the 4-element array around them.
  const issuerAuthEncoded = encodeCbor(
    issuerAuth instanceof DecodedTag ? new CborRaw(issuerAuth.raw) : issuerAuth,
  );

  const elements = new Map<string, Map<string, IndexedIssuerSignedItem>>();
  const nameSpaces = issuerSigned.get('nameSpaces');
  if (nameSpaces !== undefined) {
    const nsMap = asMap(nameSpaces, 'IssuerSigned.nameSpaces');
    for (const [nsKey, itemList] of nsMap.entries()) {
      const namespace = String(nsKey);
      const items = asArray(
        itemList,
        `IssuerSigned.nameSpaces["${namespace}"]`,
      );
      const byElement = new Map<string, IndexedIssuerSignedItem>();
      for (const entry of items) {
        if (!(entry instanceof DecodedTag) || entry.tag !== 24) {
          // Not an IssuerSignedItemBytes — skip rather than fail the whole credential.
          continue;
        }
        try {
          const item = asMap(
            decodeCbor(entry.embeddedCbor),
            'IssuerSignedItem',
          );
          const elementIdentifier = asText(
            item.get('elementIdentifier'),
            'IssuerSignedItem.elementIdentifier',
          );
          const digestID = item.get('digestID');
          byElement.set(elementIdentifier, {
            namespace,
            elementIdentifier,
            digestID: typeof digestID === 'number' ? digestID : -1,
            raw: entry.raw,
          });
        } catch {
          // A single unparseable item must not make the rest of the credential unpresentable.
          continue;
        }
      }
      elements.set(namespace, byElement);
    }
  }

  const msoDocType = msoDocTypeFromIssuerAuth(issuerAuth);

  return {
    docType: msoDocType ?? fallbackDocType,
    issuerAuthEncoded,
    elements,
    msoDocType,
  };
}

/** Flat list of everything the credential could disclose, for diagnostics. */
export function availableElements(
  credential: ParsedIssuerSignedCredential,
): IndexedIssuerSignedItem[] {
  const out: IndexedIssuerSignedItem[] = [];
  for (const byElement of credential.elements.values()) {
    for (const item of byElement.values()) {
      out.push(item);
    }
  }
  return out;
}

/** Looks up one element, returning `null` when the credential cannot serve it. */
export function findElement(
  credential: ParsedIssuerSignedCredential,
  namespace: string,
  elementIdentifier: string,
): IndexedIssuerSignedItem | null {
  return credential.elements.get(namespace)?.get(elementIdentifier) ?? null;
}

/** Builds the response `nameSpaces` map from the approved subset, preserving issuer bytes. */
export function buildDisclosedNameSpaces(
  disclosed: IndexedIssuerSignedItem[],
): Map<string, unknown[]> {
  const byNamespace = new Map<string, unknown[]>();
  for (const item of disclosed) {
    let list = byNamespace.get(item.namespace);
    if (!list) {
      list = [];
      byNamespace.set(item.namespace, list);
    }
    list.push(new CborRaw(item.raw));
  }
  return byNamespace;
}

/** Dev-only: the shape we resolved, to compare against Android's equivalent log line. */
export function logCredentialShape(
  credential: ParsedIssuerSignedCredential,
): void {
  if (!__DEV__ || process.env.NODE_ENV === 'test') {
    return;
  }
  const namespaces = [...credential.elements.entries()].map(
    ([ns, items]) => `${ns}(${items.size})`,
  );
  console.log(
    '[mdoc presentment] credential indexed:',
    `docType=${credential.docType}`,
    `msoDocType=${credential.msoDocType ?? 'unreadable'}`,
    `namespaces=[${namespaces.join(', ')}]`,
  );
}

/** Re-exported so the response builder can splice raw issuer bytes without importing the encoder. */
export {CborRaw, asBytes};
