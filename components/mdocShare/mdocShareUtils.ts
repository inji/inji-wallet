import {format, isValid, parseISO} from 'date-fns';
import type {
  MdocPresentmentCannotSatisfyEvent,
  MdocPresentmentConsentElement,
  MdocPresentmentConsentRequest,
} from '../../shared/mdoc/iso18013PresentmentInterop';

export const MDL_DOC_TYPE = 'org.iso.18013.5.1.mDL';

export type MdocShareResult = 'success' | 'declined' | 'failure';

export type MdocShareStep =
  | 'loading'
  | 'error'
  | 'showQr'
  | 'connecting'
  | 'consent'
  | 'sending'
  | 'shared'
  | 'declined'
  | 'failed';

export type PurposesResponse = Array<{
  id: string;
  name: string;
  accepted: boolean;
}>;

export type MdocRequestPurpose = NonNullable<
  NonNullable<MdocPresentmentConsentRequest['requestInfo']>['purposes']
>[number];

/**
 * Picks the screen for the current presentment state. Later stages win, so e.g. a result
 * replaces the sending screen the moment it arrives.
 */
export function deriveMdocShareStep(state: {
  qrReady: boolean;
  qrError: boolean;
  readerConnected: boolean;
  hasConsentRequest: boolean;
  isSending: boolean;
  result: MdocShareResult | null;
}): MdocShareStep {
  if (state.result === 'success') {
    return 'shared';
  }
  if (state.result === 'declined') {
    return 'declined';
  }
  if (state.result === 'failure') {
    return 'failed';
  }
  if (state.isSending) {
    return 'sending';
  }
  if (state.hasConsentRequest) {
    return 'consent';
  }
  if (state.readerConnected) {
    return 'connecting';
  }
  if (state.qrError) {
    return 'error';
  }
  return state.qrReady ? 'showQr' : 'loading';
}

/** True for steps that belong to a live session and must stay on screen even if the QR page was closed. */
export function isSessionStep(step: MdocShareStep): boolean {
  return step !== 'loading' && step !== 'error' && step !== 'showQr';
}

/** `age_over_18` → `Age over 18`. */
export function formatElementLabel(element: string): string {
  const words = element.split('_').filter(Boolean).join(' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * `requestInfo` is JSON from an untrusted verifier device and is not runtime-validated, so a
 * "boolean" can arrive as the string "false" (truthy in JS), a number, or be missing.
 */
export function isRequiredFlag(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1';
  }
  return false;
}

/**
 * Stable per-purpose identity for (de)selection. Falls back through id → name → index so a
 * verifier sending duplicate or missing names can't make two purposes share one toggle.
 */
export function purposeKey(
  p: {id?: string; name?: string},
  index: number,
): string {
  return p.id || p.name || `purpose-${index}`;
}

/** Only the description is user-facing; `name` is the verifier's internal identifier. */
export function purposeTitle(p: MdocRequestPurpose, fallback: string): string {
  return typeof p.description === 'string' && p.description.trim()
    ? p.description.trim()
    : fallback;
}

/** Ticks or unticks the purpose at `index`; required purposes always stay ticked. */
export function togglePurposeSelection(
  purposes: MdocRequestPurpose[],
  unselected: Set<string>,
  index: number,
): Set<string> {
  const purpose = purposes[index];
  if (!purpose || isRequiredFlag(purpose.is_required)) {
    return unselected;
  }
  const key = purposeKey(purpose, index);
  const next = new Set(unselected);
  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
  }
  return next;
}

/** Sharing is blocked while any required purpose is unticked. */
export function allRequiredPurposesSelected(
  purposes: MdocRequestPurpose[],
  unselected: Set<string>,
): boolean {
  return purposes.every(
    (p, index) =>
      !isRequiredFlag(p.is_required) || !unselected.has(purposeKey(p, index)),
  );
}

/** The per-purpose answer native echoes back to the verifier in the DeviceResponse. */
export function buildPurposesResponse(
  purposes: MdocRequestPurpose[],
  unselected: Set<string>,
): PurposesResponse {
  return purposes.map((p, index) => ({
    id: p.id || 'NA',
    name: p.name,
    accepted: !unselected.has(purposeKey(p, index)),
  }));
}

/** Titles of the ticked purposes, for the result screen; the single fallback when none were sent. */
export function agreedPurposeTitles(
  purposes: MdocRequestPurpose[],
  unselected: Set<string>,
  defaultPurpose: string,
  fallbackPurpose: string,
): string[] {
  if (purposes.length === 0) {
    return [fallbackPurpose];
  }
  return purposes
    .filter((p, index) => !unselected.has(purposeKey(p, index)))
    .map(p => purposeTitle(p, defaultPurpose));
}

export function resolveVerifierName(
  request: MdocPresentmentConsentRequest | null | undefined,
): string | undefined {
  return (
    request?.requestInfo?.verifier_name?.trim() ||
    request?.verifierName?.trim() ||
    undefined
  );
}

/** `requestInfo` is untrusted JSON, so anything that isn't a list of strings counts as absent. */
export function purposeElements(p: MdocRequestPurpose): string[] {
  return Array.isArray(p.elements)
    ? p.elements.filter((e): e is string => typeof e === 'string')
    : [];
}

/** True when the verifier said which elements each purpose needs. */
export function hasPurposeElementMapping(
  purposes: MdocRequestPurpose[],
): boolean {
  return purposes.some(p => purposeElements(p).length > 0);
}

/** Purpose text from untrusted JSON; non-strings and blanks count as absent. */
export function purposeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export interface MdocDisclosureRow {
  element: MdocPresentmentConsentElement;
  /** Titles of the agreed purposes needing this element; empty without a purpose mapping. */
  usedFor: string[];
}

/**
 * The elements that will actually be sent given the ticked purposes. Requested elements the
 * credential doesn't hold never appear. With a purpose mapping, an element is sent only when an
 * agreed purpose lists it (under the verifier's name or the wallet name it was remapped to);
 * without one, every servable element is sent.
 */
export function buildDisclosurePlan(
  request: MdocPresentmentConsentRequest,
  purposes: MdocRequestPurpose[],
  unselected: Set<string>,
  defaultPurpose: string,
): MdocDisclosureRow[] {
  if (!hasPurposeElementMapping(purposes)) {
    return request.elements.map(element => ({element, usedFor: []}));
  }
  const requested = request.requestedElements ?? [];
  return request.elements
    .map(element => {
      const names = new Set([
        element.element,
        ...requested
          .filter(r => r.servedAs === element.element)
          .map(r => r.element),
      ]);
      const usedFor = purposes
        .filter(
          (p, index) =>
            !unselected.has(purposeKey(p, index)) &&
            purposeElements(p).some(name => names.has(name)),
        )
        .map(p => purposeTitle(p, defaultPurpose));
      return {element, usedFor};
    })
    .filter(row => row.usedFor.length > 0);
}

export interface MdocWithheldPlan {
  /** Held by the credential, but no agreed purpose needs them. */
  unneeded: MdocPresentmentConsentElement[];
  /** Asked for by the verifier, but the credential doesn't hold them. */
  notHeld: string[];
}

/** The requested details that will not be sent, split by why. */
export function buildWithheldPlan(
  request: MdocPresentmentConsentRequest,
  rows: MdocDisclosureRow[],
): MdocWithheldPlan {
  const sent = new Set(rows.map(row => elementKey(row.element)));
  const unneeded = request.elements.filter(el => !sent.has(elementKey(el)));
  const held = new Set(request.elements.map(el => el.element));
  const notHeld = Array.from(
    new Set(
      (request.requestedElements ?? [])
        .filter(r => !r.servable && !held.has(r.element))
        .map(r => r.element),
    ),
  );
  return {unneeded, notHeld};
}

function elementKey(el: MdocPresentmentConsentElement): string {
  return `${el.namespace}\u0000${el.element}`;
}

export interface MdocShareSummary {
  shared: MdocPresentmentConsentElement[];
  agreedPurposes: string[];
  /** Elements this credential holds that the user held back by unticking purposes. */
  withheld: string[];
}

/**
 * What the result screen reports. `sharedElements` is what the user approved; without it every
 * servable element in the request is assumed shared. Requested elements the credential doesn't
 * hold are not reported.
 */
export function buildShareSummary(
  request: MdocPresentmentConsentRequest | null,
  agreedPurposes: string[],
  sharedElements?: MdocPresentmentConsentElement[] | null,
): MdocShareSummary {
  if (!request) {
    return {shared: [], agreedPurposes: [], withheld: []};
  }
  const shared = sharedElements ?? request.elements;
  const sharedKeys = new Set(
    shared.map(el => `${el.namespace}\u0000${el.element}`),
  );
  const withheld = request.elements
    .filter(el => !sharedKeys.has(`${el.namespace}\u0000${el.element}`))
    .map(el => el.element);
  return {shared, agreedPurposes, withheld};
}

const IMAGE_ELEMENTS = new Set([
  'portrait',
  'photo',
  'signature_usual_mark',
  'enrolment_photo',
]);

export type MdocElementDisplayValue =
  | {kind: 'text'; text: string}
  | {kind: 'boolean'; value: boolean}
  | {kind: 'image'}
  | {kind: 'none'};

/** Turns an issuer-signed element value into something a single row can show. */
export function describeElementValue(
  element: string,
  value: unknown,
): MdocElementDisplayValue {
  if (IMAGE_ELEMENTS.has(element)) {
    return value == null ? {kind: 'none'} : {kind: 'image'};
  }
  const text = elementValueText(element, value);
  if (typeof text === 'boolean') {
    return {kind: 'boolean', value: text};
  }
  return text ? {kind: 'text', text} : {kind: 'none'};
}

function elementValueText(element: string, value: unknown): string | boolean {
  if (value == null) {
    return '';
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'bigint') {
    return String(value);
  }
  if (value instanceof Date) {
    return isValid(value) ? format(value, 'd MMM yyyy') : '';
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (ISO_DATE.test(trimmed)) {
      const date = parseISO(trimmed);
      return isValid(date) ? format(date, 'd MMM yyyy') : trimmed;
    }
    return element === 'document_number' ? maskIdentifier(trimmed) : trimmed;
  }
  if (Array.isArray(value)) {
    return value
      .map(item => {
        const code = (item as {vehicle_category_code?: unknown})
          ?.vehicle_category_code;
        const part = elementValueText(element, code ?? item);
        return typeof part === 'string' ? part : '';
      })
      .filter(Boolean)
      .join(', ');
  }
  if (typeof value === 'object' && 'value' in value) {
    return elementValueText(element, (value as {value: unknown}).value);
  }
  return '';
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T[\d:.]+(Z|[+-]\d{2}:?\d{2})?)?$/;

/** `DL-07-2019-3390` → `DL-07-•••• 3390`: enough to recognise, not enough to copy. */
export function maskIdentifier(id: string): string {
  if (id.length <= 6) {
    return id;
  }
  const tail = id.slice(-4);
  return id.length >= 12 ? `${id.slice(0, 6)}•••• ${tail}` : `•••• ${tail}`;
}

export interface MdocCredentialTypeMismatch {
  requestedDocTypes: string[];
  walletDocType: string;
}

/**
 * The reader asked only for document types this credential isn't. Derived from the doc types
 * rather than `reason`, which the Android and iOS engines word differently.
 */
export function getCredentialTypeMismatch(
  event: MdocPresentmentCannotSatisfyEvent | null | undefined,
): MdocCredentialTypeMismatch | null {
  const requestedDocTypes = (event?.requestedDocTypes ?? []).filter(Boolean);
  const walletDocType = event?.walletDocType ?? '';
  if (
    !walletDocType ||
    requestedDocTypes.length === 0 ||
    requestedDocTypes.includes(walletDocType)
  ) {
    return null;
  }
  return {requestedDocTypes, walletDocType};
}

type MdocNameSpaceEntry = {elementIdentifier?: string; elementValue?: unknown};

/** Element identifier → issuer-signed value, across every namespace of the mdoc. */
export function getMdocElementValues(
  processedCredential: unknown,
): Record<string, unknown> {
  const processed = processedCredential as
    | {
        issuerSigned?: {nameSpaces?: Record<string, unknown>};
        nameSpaces?: Record<string, unknown>;
      }
    | undefined;
  const nameSpaces =
    processed?.issuerSigned?.nameSpaces ?? processed?.nameSpaces ?? {};
  const values: Record<string, unknown> = {};
  Object.values(nameSpaces).forEach(entries => {
    if (Array.isArray(entries)) {
      (entries as MdocNameSpaceEntry[]).forEach(entry => {
        if (typeof entry?.elementIdentifier === 'string') {
          values[entry.elementIdentifier] = entry.elementValue;
        }
      });
    } else if (entries && typeof entries === 'object') {
      Object.assign(values, entries as Record<string, unknown>);
    }
  });
  return values;
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** Holder's display name from the mdoc's issuer-signed elements, or '' when there is none. */
export function getMdocHolderName(processedCredential: unknown): string {
  const values = getMdocElementValues(processedCredential);
  const fullName =
    asText(values.full_name) || asText(values.fullName) || asText(values.name);
  if (fullName) {
    return fullName;
  }
  const given = asText(values.given_name) || asText(values.other_names);
  const family = asText(values.family_name) || asText(values.sur_name);
  return [given, family].filter(Boolean).join(' ');
}

/** `issuing_authority` (ISO 18013-5 mDL) — the issuer as printed on the document. */
export function getMdocIssuingAuthority(processedCredential: unknown): string {
  return asText(getMdocElementValues(processedCredential).issuing_authority);
}

export function getMdocDocType(processedCredential: unknown): string {
  const processed = processedCredential as
    | {docType?: string; issuerSigned?: {docType?: string}}
    | undefined;
  return processed?.docType ?? processed?.issuerSigned?.docType ?? '';
}
