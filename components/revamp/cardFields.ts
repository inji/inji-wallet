import {getLocalizedField} from '../../i18n';
import {
  claimKey,
  displayDate,
  EXPIRY_NAMES,
  ISSUED_NAMES,
  normKey,
} from './credentialClaims';

export interface CardField {
  key: string;
  label: string;
  value: string;
}

type Kind = 'contact' | 'personal' | 'validity' | 'shown' | 'skip' | 'other';

const lower = (s: string) => s.toLowerCase();

/** Standard names (ISO 18013-5 mDL, OpenID and W3C claims) and what they are. */
const CONTACT_KEYS = ['email', 'phone_number', 'phone', 'mobile', 'telephone'];
const PERSONAL_KEYS = [
  'birth_date',
  'birthdate',
  'date_of_birth',
  'dateofbirth',
  'dob',
  'age_in_years',
  'age_birth_year',
  'sex',
  'gender',
  'address',
  'resident_address',
  'resident_city',
  'resident_state',
  'resident_postal_code',
  'resident_country',
  'nationality',
  'birth_place',
  'place_of_birth',
];
const VALIDITY_KEYS = [
  'issue_date',
  'issuancedate',
  'issuedate',
  'dateofissue',
  'expiry_date',
  'expirydate',
  'validuntil',
  'validfrom',
  'dateofexpiry',
  'expirationdate',
];
/** Already on the card in their own place, or not text. */
const SHOWN_KEYS = [
  'given_name',
  'family_name',
  'givenname',
  'familyname',
  'firstname',
  'lastname',
  'fullname',
  'name',
  'recipient_name',
  'recipient_first_name',
  'recipient_last_name',
  'surname',
  'document_number',
  'uin',
  'vid',
  'credential_id',
  'nationalid',
  'idnumber',
  'licensenumber',
  'address_line1',
  'address_line2',
];
const SKIP_KEYS = [
  'photo',
  'portrait',
  'face',
  'biometrics',
  'signature_usual_mark',
  'id',
  'type',
];

/** Parts of a custom field name that mark it as personal or contact data. */
const PERSONAL_WORDS = [
  'birth',
  'dob',
  'age',
  'sex',
  'gender',
  'address',
  'street',
  'city',
  'village',
  'district',
  'postal',
  'zip',
  'nationality',
  'religion',
  'blood',
  'marital',
  'parent',
  'father',
  'mother',
  'spouse',
  'signature',
  'biometric',
  'photo',
  'face',
  'height',
  'weight',
  'eye',
];
const CONTACT_WORDS = ['email', 'mail', 'phone', 'mobile', 'tel'];
const ID_WORDS = ['id', 'number', 'no', 'num'];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[\d\s()-]{7,}$/;
const LONG_DIGITS = /\d{6,}/;
const DATE = /^\d{4}-\d{2}-\d{2}|^\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}$/;

const words = (key: string) =>
  key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/[\s_\-.~]+/)
    .map(lower)
    .filter(Boolean);

const normList = (names: string[]) => names.map(normKey);
const SKIP = normList(SKIP_KEYS);
const CONTACT = normList(CONTACT_KEYS);
const SHOWN = normList(SHOWN_KEYS);
const VALIDITY = normList([...VALIDITY_KEYS, ...ISSUED_NAMES, ...EXPIRY_NAMES]);
const PERSONAL = normList(PERSONAL_KEYS);

function kindOf(key: string, value: string): Kind {
  const k = normKey(key);
  if (SKIP.includes(k) || k.startsWith('mrz') || value.length > 80)
    return 'skip';
  if (CONTACT.includes(k)) return 'contact';
  if (SHOWN.includes(k)) return 'shown';
  if (VALIDITY.includes(k)) return 'validity';
  if (PERSONAL.includes(k)) return 'personal';
  const w = words(key);
  if (EMAIL.test(value) || PHONE.test(value)) return 'contact';
  if (w.some(x => CONTACT_WORDS.includes(x))) return 'contact';
  if (w.some(x => PERSONAL_WORDS.some(p => x.startsWith(p)))) return 'personal';
  if (w.some(x => ID_WORDS.includes(x)) || LONG_DIGITS.test(value))
    return 'personal';
  if (DATE.test(value)) return 'personal';
  return 'other';
}

/** "eventName" or "event_name" as "Event name", for fields the issuer gives no label. */
function humanize(key: string): string {
  const w = words(key).join(' ');
  return w.charAt(0).toUpperCase() + w.slice(1);
}

/**
 * The issuer's display name for each claim, from its metadata: mdoc claims are grouped by
 * namespace, W3C ones sit under the credential subject, and each carries a `display` list.
 */
export function claimLabels(wellknown: unknown): Record<string, string> {
  const labels: Record<string, string> = {};
  const walk = (node: unknown, depth: number) => {
    if (!node || typeof node !== 'object' || depth > 5) return;
    for (const [key, value] of Object.entries(
      node as Record<string, unknown>,
    )) {
      if (value && typeof value === 'object' && 'display' in value) {
        const display = (value as {display: unknown}).display;
        const name = Array.isArray(display)
          ? getLocalizedField(display)?.name ?? display[0]?.name
          : undefined;
        if (typeof name === 'string' && name) labels[key] = name;
      }
      walk(value, depth + 1);
    }
  };
  const w = wellknown as Record<string, unknown> | undefined;
  walk(w?.claims, 0);
  walk(
    (w?.credential_definition as Record<string, unknown> | undefined)
      ?.credentialSubject,
    0,
  );
  return labels;
}

const field = (
  key: string,
  value: string,
  labels: Record<string, string>,
): CardField => ({
  key,
  label: labels[key] ?? humanize(key),
  value: displayDate(value),
});

/**
 * What the card shows beyond its fixed parts, filled from the credential in the issuer's order.
 *
 * The front only ever takes fields that are known not to be personal: up to two plain fields
 * (an event, a course, a grade), else the expiry date. The back takes the personal details,
 * address, date of birth and sex, and fills any empty slot with the next field not shown yet.
 * Contact data is never on the card.
 */
export function cardFields(
  claims: Record<string, string>,
  labels: Record<string, string>,
  shownKeys: string[] = [],
) {
  const entries = Object.entries(claims).filter(([, v]) => v);
  const kinds = new Map(entries.map(([k, v]) => [k, kindOf(k, v)]));
  shownKeys.forEach(k => kinds.set(k, 'shown'));
  const used = new Set<string>();

  const birthKey = claimKey(claims, [
    'birth_date',
    'birthdate',
    'date_of_birth',
    'dob',
  ]);
  const sexKey = claimKey(claims, ['sex', 'gender']);
  const expiryKey = claimKey(claims, EXPIRY_NAMES);
  // An identity document shows its expiry on the front, like a physical card.
  const isIdentity = !!(birthKey || sexKey);
  const plain = entries.filter(([k]) => kinds.get(k) === 'other').slice(0, 2);
  let frontExtra: string | undefined;
  if (expiryKey && (isIdentity || !plain.length)) {
    frontExtra = `Valid until ${displayDate(claims[expiryKey])}`;
    used.add(expiryKey);
  } else if (plain.length) {
    frontExtra = plain.map(([, v]) => v).join(' · ');
    plain.forEach(([k]) => used.add(k));
  }

  const take = (key: string | undefined) => {
    if (!key || used.has(key)) return undefined;
    used.add(key);
    return field(key, claims[key], labels);
  };
  const next = () => {
    const found = entries.find(([k]) => {
      const kind = kinds.get(k);
      return (
        !used.has(k) &&
        kind !== 'contact' &&
        kind !== 'shown' &&
        kind !== 'skip'
      );
    });
    return found ? take(found[0]) : undefined;
  };

  const pair = [take(birthKey), take(sexKey)];
  const wide = take(claimKey(claims, ['address', 'resident_address']));
  const back = {
    wide: wide ?? next(),
    pair: pair.map(f => f ?? next()).filter((f): f is CardField => !!f),
  };
  return {frontExtra, back};
}
