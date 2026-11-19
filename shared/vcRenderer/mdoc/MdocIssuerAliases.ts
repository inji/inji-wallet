// TODO: once the templates are verified against the specs (ISO 23220 Photo ID, ISO 7367 vehicle), keep only
// mappings for known issuer deviations and cross-document display (EU PID on the ID card).
import type {ClaimsByNamespace, DisplayValue} from './MdocDisplayModel';
import {EMPTY_IMAGE} from './MdocImages';

type ClaimLocation = readonly [namespace: string, elementIdentifier: string];

const PHOTO_ID = 'org.iso.23220.photoID.1';
const ISO_23220 = 'org.iso.23220.1';
const MDL = 'org.iso.18013.5.1';
const VEHICLE = 'org.iso.7367.1';
const PID = 'eu.europa.ec.eudi.pid.1';

/** The namespace a template reads, then other spellings issuers use for it. */
const NAMESPACE_SPELLINGS: readonly (readonly string[])[] = [
  [PHOTO_ID, 'org.iso.23220.photoid.1'],
];

/** Element names that mean the same within one namespace. */
const ELEMENT_SYNONYMS: readonly [string, readonly string[]][] = [
  [ISO_23220, ['family_name_unicode', 'family_name', 'family_name_latin1']],
  [ISO_23220, ['given_name_unicode', 'given_name', 'given_name_latin1']],
  [
    ISO_23220,
    [
      'issuing_authority_unicode',
      'issuing_authority',
      'issuing_authority_latin1',
    ],
  ],
  [ISO_23220, ['resident_address_unicode', 'resident_address']],
  [ISO_23220, ['birthplace', 'birth_place']],
];

/** A claim a template reads, and where to take it from when the issuer did not send it. */
const CLAIM_FALLBACKS: readonly [ClaimLocation, readonly ClaimLocation[]][] = [
  [[MDL, 'un_distinguishing_sign'], [[MDL, 'issuing_country']]],
  [
    [VEHICLE, 'un_distinguishing_sign'],
    [
      [VEHICLE, 'issuing_country'],
      [ISO_23220, 'issuing_country'],
    ],
  ],
  [[ISO_23220, 'expiry_date'], [[VEHICLE, 'expiry_date']]],
  [
    [ISO_23220, 'issuing_country'],
    [
      [VEHICLE, 'issuing_country'],
      [PID, 'issuing_country'],
    ],
  ],
  // EU PID shown on the identity card template
  [[ISO_23220, 'family_name_unicode'], [[PID, 'family_name']]],
  [[ISO_23220, 'given_name_unicode'], [[PID, 'given_name']]],
  [[ISO_23220, 'birth_date'], [[PID, 'birth_date']]],
  [[ISO_23220, 'issue_date'], [[PID, 'issuance_date']]],
  [[ISO_23220, 'expiry_date'], [[PID, 'expiry_date']]],
  [[ISO_23220, 'issuing_authority_unicode'], [[PID, 'issuing_authority']]],
  [[ISO_23220, 'nationality'], [[PID, 'nationality']]],
  [
    [ISO_23220, 'birthplace'],
    [
      [PID, 'birth_place'],
      [PID, 'place_of_birth'],
    ],
  ],
  [[ISO_23220, 'document_number'], [[PID, 'document_number']]],
  [[PHOTO_ID, 'person_id'], [[PID, 'personal_administrative_number']]],
];

/** A portrait a template reads, and the namespaces to take it from when it is missing. */
const PORTRAIT_FALLBACKS: readonly [string, readonly string[]][] = [
  [ISO_23220, [PID]],
];

function hasValue(value: DisplayValue | undefined): value is DisplayValue {
  return value !== undefined && value !== '-';
}

function hasPortrait(portrait: string | undefined): boolean {
  return Boolean(portrait) && portrait !== EMPTY_IMAGE;
}

/** Lists and small maps (a nationality list, a place of birth) become one line of text. */
function joinAsText(value: DisplayValue): DisplayValue {
  if (typeof value !== 'object') return value;
  const parts = Object.values(value);
  const texts = parts.filter(
    (part): part is string => typeof part === 'string' && part !== '-',
  );
  const canJoin = Array.isArray(value)
    ? texts.length === parts.length && texts.length > 0
    : texts.length > 0;
  return canJoin ? texts.join(', ') : value;
}

function readClaim(
  claims: ClaimsByNamespace,
  [namespace, elementIdentifier]: ClaimLocation,
) {
  return claims[namespace]?.[elementIdentifier];
}

/** Writes the claim only where the issuer sent nothing, so issuer values are never replaced. */
function fillIfMissing(
  claims: ClaimsByNamespace,
  [namespace, elementIdentifier]: ClaimLocation,
  value: DisplayValue,
) {
  claims[namespace] ??= Object.create(null);
  if (!hasValue(claims[namespace][elementIdentifier]))
    claims[namespace][elementIdentifier] = value;
}

function copyAlternativeNamespaces(
  claims: ClaimsByNamespace,
  portraits: Record<string, string>,
) {
  for (const [templateNamespace, ...spellings] of NAMESPACE_SPELLINGS) {
    for (const spelling of spellings) {
      if (!claims[spelling]) continue;
      for (const [elementIdentifier, value] of Object.entries(claims[spelling]))
        fillIfMissing(claims, [templateNamespace, elementIdentifier], value);
      if (portraits[spelling] && !portraits[templateNamespace])
        portraits[templateNamespace] = portraits[spelling];
    }
  }
}

function applyClaimFallbacks(claims: ClaimsByNamespace) {
  for (const [target, sources] of CLAIM_FALLBACKS) {
    if (hasValue(readClaim(claims, target))) continue;
    const value = sources
      .map(source => readClaim(claims, source))
      .find(hasValue);
    if (value) fillIfMissing(claims, target, joinAsText(value));
  }
}

function applyElementSynonyms(claims: ClaimsByNamespace) {
  for (const [namespace, synonyms] of ELEMENT_SYNONYMS) {
    const sent = synonyms.find(name => hasValue(claims[namespace]?.[name]));
    if (!sent) continue;
    for (const name of synonyms)
      fillIfMissing(claims, [namespace, name], claims[namespace][sent]);
  }
}

function applyPortraitFallbacks(portraits: Record<string, string>) {
  for (const [namespace, sources] of PORTRAIT_FALLBACKS) {
    if (hasPortrait(portraits[namespace])) continue;
    const source = sources.find(name => hasPortrait(portraits[name]));
    if (source) portraits[namespace] = portraits[source];
  }
}

/**
 * Fills the claim names the templates read from the names issuers actually send, so one template
 * serves several issuers. Only gaps are filled. Synonyms run after fallbacks, so a value taken
 * from another namespace also reaches its synonyms.
 */
export function applyIssuerAliases(
  claims: ClaimsByNamespace,
  portraits: Record<string, string>,
) {
  copyAlternativeNamespaces(claims, portraits);
  applyClaimFallbacks(claims);
  applyElementSynonyms(claims);
  applyPortraitFallbacks(portraits);
}
