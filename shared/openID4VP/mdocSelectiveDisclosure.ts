import {Tag, decode, encode} from 'cbor2';

// Keep IssuerSignedItemBytes (Tag 24) as-is, so the retained items are not re-encoded.
Tag.registerDecoder(24, (tag: Tag) => tag);

// Node Buffers are encoded wrongly inside a Tag, so use plain Uint8Array everywhere.
function toUint8(x: any): any {
  if (x instanceof Tag) {
    return new Tag(x.tag, toUint8(x.contents));
  }
  if (x instanceof Uint8Array) {
    return new Uint8Array(x);
  }
  if (x instanceof Map) {
    return new Map([...x].map(([k, v]) => [toUint8(k), toUint8(v)]));
  }
  if (Array.isArray(x)) {
    return x.map(toUint8);
  }
  if (x && typeof x === 'object' && x.constructor === Object) {
    return Object.fromEntries(
      Object.entries(x).map(([k, v]) => [k, toUint8(v)]),
    );
  }
  return x;
}

const get = (m: any, k: string) => (m instanceof Map ? m.get(k) : m?.[k]);
const set = (m: any, k: string, v: any) =>
  m instanceof Map ? m.set(k, v) : (m[k] = v);
const remove = (m: any, k: string) =>
  m instanceof Map ? m.delete(k) : delete m[k];

function elementIdentifier(item: Tag): string {
  const inner = decode(item.contents as Uint8Array);
  const id = get(inner, 'elementIdentifier');
  if (typeof id !== 'string') {
    throw new Error('mso_mdoc: elementIdentifier not found in item');
  }
  return id;
}

function encodeCredential(root: any): string {
  return Buffer.from(encode(toUint8(root)))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Keeps only the selected claims (per namespace) in issuerSigned.nameSpaces.
 *
 * An empty selection is valid: when the verifier omits `claims` in the DCQL
 * query, no selectively disclosable claims are requested. All mdoc claims are
 * selectively disclosable, so the credential is returned without nameSpaces
 * (only issuerAuth). nameSpaces is optional in IssuerSigned (ISO 18013-5) and
 * an empty map is not allowed, so the key is removed.
 */
export function filterMdocCredential(
  credential: string,
  selection: Record<string, string[]>,
): string {
  const requested = Object.keys(selection ?? {}).filter(
    ns => (selection[ns] ?? []).length > 0,
  );

  const root: any = decode(
    new Uint8Array(
      Buffer.from(
        credential.trim().replace(/-/g, '+').replace(/_/g, '/'),
        'base64',
      ),
    ),
  );
  const issuerSigned = get(root, 'issuerSigned') ?? root;

  if (requested.length === 0) {
    remove(issuerSigned, 'nameSpaces');
    return encodeCredential(root);
  }

  const nameSpaces = get(issuerSigned, 'nameSpaces');
  if (!nameSpaces) {
    throw new Error('mso_mdoc: nameSpaces not found in credential');
  }

  const names: string[] =
    nameSpaces instanceof Map
      ? [...nameSpaces.keys()]
      : Object.keys(nameSpaces);
  const matched = new Set<string>();

  names.forEach(ns => {
    const wanted = new Set(selection[ns] ?? []);
    const kept = (get(nameSpaces, ns) as Tag[]).filter(item => {
      const id = elementIdentifier(item);
      if (wanted.has(id)) {
        matched.add(`${ns}|${id}`);
        return true;
      }
      return false;
    });
    if (kept.length > 0) {
      set(nameSpaces, ns, kept);
    } else {
      remove(nameSpaces, ns);
    }
  });

  const missing: string[] = [];
  requested.forEach(ns =>
    selection[ns].forEach(el => {
      if (!matched.has(`${ns}|${el}`)) {
        missing.push(`${ns}.${el}`);
      }
    }),
  );
  if (missing.length > 0) {
    throw new Error(
      `mso_mdoc: selected claims not found in credential: ${missing.join(
        ', ',
      )}`,
    );
  }

  return encodeCredential(root);
}
