import {getLocalizedField} from '../../i18n';
import {VCFormat} from '../../shared/VCFormat';

/**
 * A credential's claims as one flat map of name to display string, whatever its format: a W3C
 * credential's subject, or every element of an mdoc's namespaces.
 */
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/** "2026-10-09" or a full timestamp, as "09 Oct 2026"; anything else unchanged. */
export function displayDate(value: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!m) return value;
  const month = MONTHS[Number(m[2]) - 1];
  return month ? `${m[3]} ${month} ${m[1]}` : value;
}

/**
 * An mdoc element can arrive as a CBOR-tagged value (a full-date is tag 1004 around a string) or
 * as a Date; both are a plain value underneath.
 */
function untag(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (value && typeof value === 'object' && '__cborTag' in value)
    return untag((value as unknown as {value: unknown}).value);
  return value;
}

export function flatClaims(vc: any, format: string): Record<string, string> {
  const out: Record<string, string> = {};
  const put = (key: string, raw: unknown) => {
    const value = untag(raw);
    if (value == null || typeof value === 'object') {
      const localized =
        value && typeof value === 'object' ? getLocalizedField(value) : null;
      if (typeof localized === 'string' && localized) out[key] = localized;
      return;
    }
    out[key] = String(value);
  };

  if (format === VCFormat.mso_mdoc) {
    const nameSpaces = vc?.issuerSigned?.nameSpaces ?? vc?.nameSpaces ?? {};
    Object.values(nameSpaces).forEach((ns: any) => {
      if (Array.isArray(ns)) {
        ns.forEach(e => put(e?.elementIdentifier, e?.elementValue));
      } else if (ns && typeof ns === 'object') {
        Object.entries(ns).forEach(([k, v]) => put(k, v));
      }
    });
  } else if (format === VCFormat.vc_sd_jwt || format === VCFormat.dc_sd_jwt) {
    const payload = vc?.fullResolvedPayload ?? {};
    Object.entries(payload.credentialSubject ?? payload).forEach(([k, v]) =>
      put(k, v),
    );
  } else {
    Object.entries(vc?.credentialSubject ?? {}).forEach(([k, v]) => put(k, v));
  }
  // W3C and SD-JWT credentials keep their validity on the credential itself, not as claims.
  const issued =
    vc?.validFrom ?? vc?.issuanceDate ?? vc?.fullResolvedPayload?.iat;
  const expires =
    vc?.validUntil ?? vc?.expirationDate ?? vc?.fullResolvedPayload?.exp;
  const asDate = (v: unknown) =>
    typeof v === 'number' ? new Date(v * 1000).toISOString() : v;
  if (issued != null && pick(out, ISSUED_NAMES) === undefined)
    put('issue_date', asDate(issued));
  if (expires != null && pick(out, EXPIRY_NAMES) === undefined)
    put('expiry_date', asDate(expires));
  return out;
}

export const ISSUED_NAMES = ['issue_date', 'issuanceDate', 'dateOfIssue'];
export const EXPIRY_NAMES = [
  'expiry_date',
  'validUntil',
  'dateOfExpiry',
  'expirationDate',
];

/** Claim names compared without case, underscores or dashes: `dateOfIssue` matches `date_of_issue`. */
export const normKey = (key: string) =>
  key.toLowerCase().replace(/[_\-\s]/g, '');

export function claimKey(
  claims: Record<string, string>,
  names: string[],
): string | undefined {
  const wanted = names.map(normKey);
  for (const name of wanted) {
    const key = Object.keys(claims).find(k => normKey(k) === name && claims[k]);
    if (key) return key;
  }
  return undefined;
}

function pick(claims: Record<string, string>, keys: string[]) {
  const key = claimKey(claims, keys);
  return key ? claims[key] : undefined;
}

const join = (...parts: (string | undefined)[]) =>
  parts.filter(Boolean).join(' ') || undefined;

/** ISO mDL, Inji, and common W3C names for the holder, in that order of preference. */
export function holderName(claims: Record<string, string>): string | undefined {
  return (
    pick(claims, ['fullName', 'name', 'recipient_name']) ??
    join(
      pick(claims, ['given_name', 'first_name', 'recipient_first_name']),
      pick(claims, [
        'family_name',
        'last_name',
        'surname',
        'recipient_last_name',
      ]),
    )
  );
}

const NUMBER_WORDS = ['number', 'no', 'num'];
const NOT_A_DOCUMENT_NUMBER = [
  'phone',
  'mobile',
  'tel',
  'house',
  'street',
  'postal',
];

/**
 * The credential's own number, labelled as the card shows it: a known name first, else a field
 * whose name ends in "number" (`nrcNumber` becomes "NRC").
 */
export function documentNumber(
  claims: Record<string, string>,
): {key: string; label: string; value: string} | undefined {
  const candidates: [string, string][] = [
    ['document_number', 'No.'],
    ['UIN', 'UIN'],
    ['VID', 'VID'],
    ['credential_id', 'ID'],
    ['nationalId', 'ID'],
    ['idNumber', 'ID'],
    ['licenseNumber', 'Licence no.'],
  ];
  for (const [name, label] of candidates) {
    const key = claimKey(claims, [name]);
    if (key) return {key, label, value: claims[key]};
  }
  for (const [key, value] of Object.entries(claims)) {
    const words = key
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(/[\s_-]+/)
      .map(w => w.toLowerCase())
      .filter(Boolean);
    const last = words[words.length - 1];
    if (
      words.length > 1 &&
      NUMBER_WORDS.includes(last) &&
      !words.some(w => NOT_A_DOCUMENT_NUMBER.includes(w)) &&
      value
    ) {
      const name = words.slice(0, -1).join(' ');
      const label = name.length <= 4 ? name.toUpperCase() : 'No.';
      return {key, label, value};
    }
  }
  return undefined;
}

/** The credential's own machine-readable zone, when the issuer includes one. */
export function mrzLines(
  claims: Record<string, string>,
): [string, string] | undefined {
  const one = pick(claims, ['mrz_line_1', 'mrz1']);
  const two = pick(claims, ['mrz_line_2', 'mrz2']);
  return one && two ? [one, two] : undefined;
}

/** The last four characters shown, the rest masked, as the design shows numbers. */
export function maskNumber(value: string): string {
  const v = value.replace(/\s+/g, '');
  if (v.length <= 4) return v;
  return `•••• ${v.slice(-4)}`;
}
