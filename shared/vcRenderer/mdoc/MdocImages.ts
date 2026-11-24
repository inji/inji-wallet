// TODO: fix PixelPass's CBOR-to-JSON decoding, which turns byte strings (portrait, signature) into
// UTF-8 text and corrupts them; then this recovery from the original credential can be removed.
import {Buffer} from 'buffer';
import {decode, Tag} from 'cbor2';

const ENCODED_CBOR_TAG = 24;

/** Image elements templates can show, by the key they get in the display model. */
export const IMAGE_ELEMENT_BY_KIND = {
  portraits: 'portrait',
  signatures: 'signature_usual_mark',
} as const;

export type ImageKind = keyof typeof IMAGE_ELEMENT_BY_KIND;

/** Image bytes per kind, keyed by namespace. */
export type OriginalImages = Record<ImageKind, Record<string, Uint8Array>>;

const IMAGE_KIND_BY_ELEMENT = new Map<unknown, ImageKind>(
  Object.entries(IMAGE_ELEMENT_BY_KIND).map(([kind, element]) => [
    element,
    kind as ImageKind,
  ]),
);

// keeps tags such as 24 as Tag objects without changing the decoders shared with the rest of the app
const DECODE_OPTIONS = {ignoreGlobalTags: true};

/** Reads a key from a CBOR map or a plain object. */
function readField(value: unknown, key: string): unknown {
  if (value instanceof Map) return value.get(key);
  if (value && typeof value === 'object')
    return (value as Record<string, unknown>)[key];
  return undefined;
}

function decodeEncodedMdoc(encodedMdoc: string): unknown {
  const base64 = encodedMdoc.trim().replace(/-/g, '+').replace(/_/g, '/');
  return decode(new Uint8Array(Buffer.from(base64, 'base64')), DECODE_OPTIONS);
}

function entriesOf(map: unknown): [unknown, unknown][] {
  if (map instanceof Map) return [...map.entries()];
  if (map && typeof map === 'object') return Object.entries(map);
  return [];
}

/** An IssuerSignedItem, decoded from its tag 24 bytes when it is wrapped. */
function decodeIssuerSignedItem(item: unknown): unknown {
  const isEncoded =
    item instanceof Tag &&
    item.tag === ENCODED_CBOR_TAG &&
    item.contents instanceof Uint8Array;
  return isEncoded
    ? decode((item as Tag).contents as Uint8Array, DECODE_OPTIONS)
    : item;
}

function findImages(issuerSigned: unknown): OriginalImages {
  const images: OriginalImages = {
    portraits: Object.create(null),
    signatures: Object.create(null),
  };
  for (const [namespace, items] of entriesOf(
    readField(issuerSigned, 'nameSpaces'),
  )) {
    if (typeof namespace !== 'string' || !Array.isArray(items)) continue;
    for (const item of items) {
      const issuerSignedItem = decodeIssuerSignedItem(item);
      const kind = IMAGE_KIND_BY_ELEMENT.get(
        readField(issuerSignedItem, 'elementIdentifier'),
      );
      const bytes = readField(issuerSignedItem, 'elementValue');
      if (kind && bytes instanceof Uint8Array) images[kind][namespace] = bytes;
    }
  }
  return images;
}

/** The docType of the document, or of the MSO in issuerAuth when only IssuerSigned is stored. */
function findDocType(document: unknown, issuerSigned: unknown): unknown {
  const docType = readField(document, 'docType');
  if (typeof docType === 'string') return docType;

  const issuerAuth = readField(issuerSigned, 'issuerAuth');
  const coseSign1 =
    issuerAuth instanceof Tag ? issuerAuth.contents : issuerAuth;
  let payload = Array.isArray(coseSign1) ? coseSign1[2] : undefined;
  // COSE payload -> encoded MobileSecurityObjectBytes (tag 24) -> MSO
  for (let depth = 0; depth < 4; depth++) {
    if (payload instanceof Uint8Array)
      payload = decode(payload, DECODE_OPTIONS);
    else if (payload instanceof Tag && payload.tag === ENCODED_CBOR_TAG)
      payload = payload.contents;
    else break;
  }
  return readField(payload, 'docType');
}

/** The docType and the image bytes, read from the original credential. */
export function readOriginalMdoc(encodedMdoc: string): {
  docType?: string;
  images: OriginalImages;
} {
  const document = decodeEncodedMdoc(encodedMdoc);
  const issuerSigned = readField(document, 'issuerSigned') ?? document;
  const docType = findDocType(document, issuerSigned);
  return {
    docType: typeof docType === 'string' ? docType : undefined,
    images: findImages(issuerSigned),
  };
}

/** Shown when a namespace has no usable image: a transparent 1x1 PNG. */
export const EMPTY_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGNgAAIAAAUAAXpeqz8AAAAASUVORK5CYII=';

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function imageMimeType(bytes: Buffer): 'jpeg' | 'png' | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    return 'jpeg';
  if (bytes.subarray(0, 8).equals(PNG_SIGNATURE)) return 'png';
  return null;
}

function toBase64(value: unknown): string | null {
  if (typeof value === 'string') {
    return value
      .replace(/^data:image\/(?:jpeg|jpg|png);base64,/i, '')
      .replace(/\s/g, '')
      .replace(/-/g, '+')
      .replace(/_/g, '/');
  }
  const isByteList =
    Array.isArray(value) &&
    value.every(byte => Number.isInteger(byte) && byte >= 0 && byte <= 255);
  if (value instanceof Uint8Array || isByteList)
    return Buffer.from(value as Uint8Array | number[]).toString('base64');
  return null;
}

/** An image value as a JPEG/PNG data URI, or the empty image; never a remote URL or SVG. */
export function toImageDataUri(value: unknown): string {
  const base64 = toBase64(value);
  if (!base64 || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) return EMPTY_IMAGE;
  const bytes = Buffer.from(base64, 'base64');
  const mimeType = imageMimeType(bytes);
  return mimeType
    ? `data:image/${mimeType};base64,${bytes.toString('base64')}`
    : EMPTY_IMAGE;
}

/** The same as toImageDataUri, but null instead of the empty image. */
export function toImageDataUriOrNull(value: unknown): string | null {
  const uri = toImageDataUri(value);
  return uri === EMPTY_IMAGE ? null : uri;
}
