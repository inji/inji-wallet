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
  } else {
    Object.entries(vc?.credentialSubject ?? {}).forEach(([k, v]) => put(k, v));
  }
  return out;
}

const pick = (claims: Record<string, string>, keys: string[]) => {
  const lower = Object.fromEntries(
    Object.entries(claims).map(([k, v]) => [k.toLowerCase(), v]),
  );
  for (const key of keys) {
    const value = lower[key.toLowerCase()];
    if (value) return value;
  }
  return undefined;
};

const join = (...parts: (string | undefined)[]) =>
  parts.filter(Boolean).join(' ') || undefined;

/** ISO mDL, Inji, and common W3C names for the holder, in that order of preference. */
export function holderName(claims: Record<string, string>): string | undefined {
  return (
    pick(claims, ['fullName', 'name', 'recipient_name']) ??
    join(
      pick(claims, [
        'given_name',
        'givenName',
        'firstName',
        'recipient_first_name',
      ]),
      pick(claims, [
        'family_name',
        'familyName',
        'lastName',
        'surname',
        'recipient_last_name',
      ]),
    )
  );
}

/** The credential's own number, labelled as the card shows it. */
export function documentNumber(
  claims: Record<string, string>,
): {label: string; value: string} | undefined {
  const candidates: [string, string][] = [
    ['document_number', 'No.'],
    ['UIN', 'UIN'],
    ['VID', 'VID'],
    ['credential_id', 'ID'],
    ['nationalId', 'ID'],
    ['idNumber', 'ID'],
    ['licenseNumber', 'Licence no.'],
  ];
  for (const [key, label] of candidates) {
    const value = pick(claims, [key]);
    if (value) return {label, value};
  }
  return undefined;
}

/** The last four characters shown, the rest masked, as the design shows numbers. */
export function maskNumber(value: string): string {
  const v = value.replace(/\s+/g, '');
  if (v.length <= 4) return v;
  return `•••• ${v.slice(-4)}`;
}
