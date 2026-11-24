import {applyIssuerAliases} from './MdocIssuerAliases';
import {
  EMPTY_IMAGE,
  IMAGE_ELEMENT_BY_KIND,
  ImageKind,
  OriginalImages,
  toImageDataUri,
} from './MdocImages';

type IssuerSignedItem = {
  elementIdentifier: string;
  elementValue: unknown;
};

type NameSpaces = Record<string, IssuerSignedItem[]>;

export type DecodedMdoc = {
  docType?: string;
  issuerSigned?: {nameSpaces?: NameSpaces};
  nameSpaces?: NameSpaces;
};

export type DisplayValue =
  | string
  | DisplayValue[]
  | {[key: string]: DisplayValue};

export type ClaimsByNamespace = Record<string, Record<string, DisplayValue>>;

type ImagesByNamespace = Record<ImageKind, Record<string, string>>;

const MISSING = '-';
const MAX_NESTING = 16;

// the native renderer substitutes strings verbatim into XML
const XML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

function escapeXml(text: string): string {
  return text.replace(/[&<>"']/g, character => XML_ENTITIES[character]);
}

const DATE_ELEMENTS = new Set([
  'birth_date',
  'issue_date',
  'issuance_date',
  'expiry_date',
  'date_of_registration',
  'date_of_first_registration',
]);

function formatText(text: string, elementIdentifier: string): string {
  const isDateTime =
    DATE_ELEMENTS.has(elementIdentifier) && /^\d{4}-\d{2}-\d{2}T/.test(text);
  return escapeXml(isDateTime ? text.slice(0, 10) : text);
}

/** An element value as text a template can show; nested lists and maps keep their shape. */
function toDisplayValue(
  value: unknown,
  elementIdentifier: string,
  depth = 0,
): DisplayValue {
  if (depth > MAX_NESTING || value instanceof Uint8Array) return MISSING;
  if (typeof value === 'string') return formatText(value, elementIdentifier);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (Array.isArray(value))
    return value.map(item =>
      toDisplayValue(item, elementIdentifier, depth + 1),
    );
  if (value && typeof value === 'object') {
    const fields: Record<string, DisplayValue> = Object.create(null);
    for (const [key, child] of Object.entries(value))
      fields[key] = toDisplayValue(child, key, depth + 1);
    return fields;
  }
  return MISSING;
}

const IMAGE_KINDS = Object.keys(IMAGE_ELEMENT_BY_KIND) as ImageKind[];

function imageKindFor(elementIdentifier: string): ImageKind | undefined {
  return IMAGE_KINDS.find(
    kind => IMAGE_ELEMENT_BY_KIND[kind] === elementIdentifier,
  );
}

function nameSpacesOf(decodedMdoc: DecodedMdoc): NameSpaces {
  const nameSpaces =
    decodedMdoc?.issuerSigned?.nameSpaces ?? decodedMdoc?.nameSpaces;
  if (!nameSpaces || typeof nameSpaces !== 'object') {
    throw new Error('Mdoc display requires decoded namespaces');
  }
  return nameSpaces;
}

function readNamespace(
  namespace: string,
  items: IssuerSignedItem[],
  originalImages: Partial<OriginalImages>,
  claims: ClaimsByNamespace,
  images: ImagesByNamespace,
) {
  if (!Array.isArray(items)) throw new Error('Invalid mdoc namespace elements');
  const namespaceClaims: Record<string, DisplayValue> = Object.create(null);
  claims[namespace] = namespaceClaims;
  for (const kind of IMAGE_KINDS) images[kind][namespace] = EMPTY_IMAGE;

  for (const item of items) {
    const elementIdentifier = item?.elementIdentifier;
    if (typeof elementIdentifier !== 'string') {
      throw new Error('Invalid mdoc element identifier');
    }
    if (
      Object.prototype.hasOwnProperty.call(namespaceClaims, elementIdentifier)
    ) {
      throw new Error('Duplicate mdoc element identifier');
    }
    const imageKind = imageKindFor(elementIdentifier);
    if (imageKind) {
      images[imageKind][namespace] = toImageDataUri(
        originalImages[imageKind]?.[namespace] ?? item.elementValue,
      );
      namespaceClaims[elementIdentifier] = MISSING;
    } else {
      namespaceClaims[elementIdentifier] = toDisplayValue(
        item.elementValue,
        elementIdentifier,
      );
    }
  }
}

/**
 * Input for Inji VC Renderer's template engine: claims and images by namespace, and the template.
 * It is not a VC and must never be stored, verified, exported or shared as one.
 */
export function createMdocDisplayModel(
  decodedMdoc: DecodedMdoc,
  templateUrl: string,
  originalImages: Partial<OriginalImages> = {},
) {
  const claims: ClaimsByNamespace = Object.create(null);
  const images: ImagesByNamespace = {
    portraits: Object.create(null),
    signatures: Object.create(null),
  };
  for (const [namespace, items] of Object.entries(nameSpacesOf(decodedMdoc))) {
    readNamespace(namespace, items, originalImages, claims, images);
  }

  applyIssuerAliases(claims, images.portraits);

  return {
    claims,
    ...images,
    renderMethod: [
      {
        type: 'TemplateRenderMethod',
        renderSuite: 'svg-mustache',
        template: {id: templateUrl},
      },
    ],
  };
}
