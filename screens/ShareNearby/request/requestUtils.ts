import {
  getFieldName,
  formatKeyLabel,
} from '../../../components/VC/common/VCUtils';
import type {
  MdocCandidate,
  MdocDocumentMatch,
  MdocRequestedElement,
} from '../../../shared/mdocPresentation/matching';
import type {ReaderTrust} from '../../../shared/mdocPresentation/types';
import type {VerifiableCredential} from '../../../machines/VerifiableCredential/VCMetaMachine/vc';
import {format} from 'date-fns';

export function getRequestedElements(
  documentMatch: MdocDocumentMatch,
): MdocRequestedElement[] {
  return Object.entries(documentMatch.requested.nameSpaces).flatMap(
    ([namespace, fields]) =>
      Object.entries(fields).map(([elementIdentifier, intentToRetain]) => ({
        namespace,
        elementIdentifier,
        intentToRetain,
      })),
  );
}

// Readable names for mDL elements whose identifiers don't read well on their own.
const MDL_LABELS: Record<string, string> = {
  birth_date: 'Date of birth',
  un_distinguishing_sign: 'Distinguishing sign',
  signature_usual_mark: 'Signature',
  portrait: 'Photo',
};

function sentenceCase(identifier: string): string {
  const ageOver = /^age_over_(\d+)$/.exec(identifier);
  if (ageOver) return `Over ${ageOver[1]}`;
  const words = identifier
    .split(/[_\s]+/)
    .filter(Boolean)
    .join(' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

type IssuerMetadata = {
  display?: {name?: unknown}[];
  credential_configurations_supported?: Record<string, unknown>;
};

// Stored as the parsed issuer metadata object, though typed as a string; accept both.
function parseWellKnown(
  candidate: MdocCandidate | undefined,
): IssuerMetadata | undefined {
  const credential = candidate?.vc.verifiableCredential as
    | VerifiableCredential
    | undefined;
  const wellKnown: unknown = credential?.wellKnown;
  if (wellKnown && typeof wellKnown === 'object')
    return wellKnown as IssuerMetadata;
  try {
    return typeof wellKnown === 'string' && wellKnown
      ? JSON.parse(wellKnown)
      : undefined;
  } catch {
    return undefined;
  }
}

/** The issuer's display name from its metadata, never its URL. */
export function getIssuerDisplayName(
  candidate: MdocCandidate | undefined,
): string | undefined {
  const display = parseWellKnown(candidate)?.display;
  const name = Array.isArray(display) ? display[0]?.name : undefined;
  return typeof name === 'string' && name ? name : undefined;
}

/** Tells cards apart: the issuer's display name, else its host (offer downloads store the URL), else its catalog id. */
export function getIssuerLabel(
  candidate: MdocCandidate | undefined,
): string | undefined {
  const displayName = getIssuerDisplayName(candidate);
  if (displayName) return displayName;
  const issuer = candidate?.vc.vcMetadata.issuer;
  if (!issuer) return undefined;
  try {
    return /^https?:\/\//.test(issuer) ? new URL(issuer).host : issuer;
  } catch {
    return issuer;
  }
}

export function getRequestedFieldLabel(
  candidate: MdocCandidate | undefined,
  element: MdocRequestedElement,
): string {
  const credential = candidate?.vc.verifiableCredential as
    | VerifiableCredential
    | undefined;
  // Older credentials may not have usable display metadata; the field identifier is retained.
  const wellKnown = parseWellKnown(candidate);
  const configuration: unknown =
    wellKnown?.credential_configurations_supported?.[
      credential?.credentialConfigurationId ?? ''
    ] ?? wellKnown;
  const issuerLabel =
    configuration && candidate
      ? getFieldName(
          `${element.namespace}~${element.elementIdentifier}`,
          configuration,
          candidate.vc.vcMetadata.format,
        )
      : undefined;
  // Issuer-provided names win; derived Title Case names become sentence case, as designed.
  return issuerLabel &&
    issuerLabel !== formatKeyLabel(element.elementIdentifier)
    ? issuerLabel
    : MDL_LABELS[element.elementIdentifier] ??
        sentenceCase(element.elementIdentifier);
}

const TRUST_RANK: Record<ReaderTrust['status'], number> = {
  invalid: 0,
  notSigned: 1,
  unverified: 1,
  verified: 2,
};

/** One verifier card per request (frame 27): show the weakest trust any document carried. */
export function leastTrustedReader(
  documentMatches: MdocDocumentMatch[],
): ReaderTrust | undefined {
  return documentMatches
    .map(documentMatch => documentMatch.requested.readerTrust)
    .reduce<ReaderTrust | undefined>(
      (weakest, trust) =>
        !weakest || TRUST_RANK[trust.status] < TRUST_RANK[weakest.status]
          ? trust
          : weakest,
      undefined,
    );
}

// Readable names for well-known document types, for requests no stored card can answer.
const DOC_TYPE_NAMES: Record<string, string> = {
  'org.iso.18013.5.1.mDL': 'Mobile Driving Licence',
  'org.iso.7367.1.mVRC': 'Vehicle Registration',
  'org.iso.23220.photoid.1': 'Photo ID',
  'eu.europa.ec.eudi.pid.1': 'Personal ID',
};

export function docTypeName(docType: string): string {
  return DOC_TYPE_NAMES[docType] ?? docType;
}

/** The MSO's validUntil as "2 Oct 2026", or undefined when the decoded card doesn't carry it. */
export function getCardExpiryDate(
  candidate: MdocCandidate | undefined,
): string | undefined {
  type DecodedMso = {validityInfo?: {validUntil?: unknown}};
  type DecodedIssuerSigned = {issuerAuth?: unknown};
  const processed = (
    candidate?.vc.verifiableCredential as
      | {
          processedCredential?: DecodedIssuerSigned & {
            issuerSigned?: DecodedIssuerSigned;
          };
        }
      | undefined
  )?.processedCredential;
  const issuerAuth = (processed?.issuerSigned ?? processed)?.issuerAuth;
  const validUntil = Array.isArray(issuerAuth)
    ? (issuerAuth[2] as DecodedMso | undefined)?.validityInfo?.validUntil
    : undefined;
  const date =
    validUntil instanceof Date
      ? validUntil
      : typeof validUntil === 'string'
      ? new Date(validUntil)
      : undefined;
  return date && !isNaN(date.getTime())
    ? format(date, 'd MMM yyyy')
    : undefined;
}
