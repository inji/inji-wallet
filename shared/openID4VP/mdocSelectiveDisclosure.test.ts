import {filterMdocCredential} from './mdocSelectiveDisclosure';

// Sample mDL (flat {docType, issuerSigned}) with 8 issuer-signed items in
// namespace org.iso.18013.5.1 (from the mock issuer's static sample).
const ORIGINAL =
  'omdkb2NUeXBldW9yZy5pc28uMTgwMTMuNS4xLm1ETGxpc3N1ZXJTaWduZWSiamlzc3VlckF1dGiEQ6EBJqEYIVkB2TCCAdUwggF7oAMCAQICFBRDWWSBLltTWt65yytaZ01baoM9MAoGCCqGSM49BAMCMFkxCzAJBgNVBAYTAk1LMQ4wDAYDVQQIDAVNSy1LQTENMAsGA1UEBwwETW9jazENMAsGA1UECgwETW9jazENMAsGA1UECwwETU9jazENMAsGA1UEAwwETW9jazAeFw0yNDEwMjEwNzU2MTBaFw0yNTEwMjEwNzU2MTBaMFkxCzAJBgNVBAYTAk1LMQ4wDAYDVQQIDAVNSy1LQTENMAsGA1UEBwwETW9jazENMAsGA1UECgwETW9jazENMAsGA1UECwwETU9jazENMAsGA1UEAwwETW9jazBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABA8PMic1jzZYunhb2Ymq3eH2qEudb5rBnGMk1RAmFuLbPYBgFhDjdhK7j3ciE16-XfCFHnVEX8cANHw1_XjU2nejITAfMB0GA1UdDgQWBBQmaVJHKU-6Y7m6g6qolUJ3p94yhjAKBggqhkjOPQQDAgNIADBFAiEAwXQgNSUrhHIlPE1N24u5UCRwBTqYKKpJqBlC0niZRHgCIFryTL85LV-hab5RL4YiDpDeNOL6_YyiS-STfjrv-OL4WQJR2BhZAkymZ3ZlcnNpb25jMS4wb2RpZ2VzdEFsZ29yaXRobWdTSEEtMjU2Z2RvY1R5cGV1b3JnLmlzby4xODAxMy41LjEubURMbHZhbHVlRGlnZXN0c6Fxb3JnLmlzby4xODAxMy41LjGoAlggahyUDZzWwyVz1oYQSOSTOl3XfzVAAVi-ILLpwP3DMtUGWCBJiBVoqzuOj8ZRrOsV7DNFe0QBWplIKWMU3aILs8y6lwNYILzO8fswbC_wn7rQYO8eq91XotAltVllVzYTwyYHHWYIAVggHp8Y6cV73O670tvfMiyCZoxGczcYyfOh43Q8ahKpxxcEWCC75BhZBjDE1I4S5NLZAsaUmBERMZM9rMgZPkAzl45VeABYIIlDF4uT1D3MLGPsLL-kVBP0SHyxAYcAVf9SLYLUJUUgB1ggFuI0cmV1WwSJGv5VxI5a7Dsm6fIqr2MeIDBmYjIlZ0oFWCA88kOo8KNGtCpl2XH5CXMcgoE6D_fag9xjmPoLUcpgpG1kZXZpY2VLZXlJbmZvoWlkZXZpY2VLZXmkAQIgASFYIOMdpjABg7S1sJBCgdC4D6V237Jk_oGhMl_LInX0CFnGIlggPdyNKVXrSZb4CYQmoK6lX7Zux0DIBcnhJ9-_a7ZlYtdsdmFsaWRpdHlJbmZvo2ZzaWduZWTAdDIwMjQtMTAtMjFUMDg6MTE6MTNaaXZhbGlkRnJvbcB0MjAyNC0xMC0yMVQwODoxMToxM1pqdmFsaWRVbnRpbMB0MjAyNS0xMC0yMVQwODoxMToxM1pYQBZJtQ6yPA--sITjOK29mGLGKeG2DEx3qDHQEw99esCHwUnPJtobUfLGHhfmM0nawMZai21LXq5ZEdInOkEDSNRqbmFtZVNwYWNlc6Fxb3JnLmlzby4xODAxMy41LjGI2BhYaqRoZGlnZXN0SUQCZnJhbmRvbVBthSy1vmphqpoMYRe9Z0PncWVsZW1lbnRJZGVudGlmaWVyamlzc3VlX2RhdGVsZWxlbWVudFZhbHVleBsyMDI0LTEwLTIxVDA4OjExOjEzLjQ5NTQ3OFrYGFhrpGhkaWdlc3RJRAZmcmFuZG9tUNyXhXOZjmheiFyzYfhsl0ZxZWxlbWVudElkZW50aWZpZXJrZXhwaXJ5X2RhdGVsZWxlbWVudFZhbHVleBsyMDI1LTEwLTIxVDA4OjExOjEzLjQ5NTQ3OFrYGFjBpGhkaWdlc3RJRANmcmFuZG9tUCC-v7ARALJ2VFcYww9AbMhxZWxlbWVudElkZW50aWZpZXJyZHJpdmluZ19wcml2aWxlZ2VzbGVsZW1lbnRWYWx1ZXhqe2lzc3VlX2RhdGU9MjAyNC0xMC0yMVQwODoxMToxMy40OTU0NzhaLCB2ZWhpY2xlX2NhdGVnb3J5X2NvZGU9QSwgZXhwaXJ5X2RhdGU9MjAyNS0xMC0yMVQwODoxMToxMy40OTU0NzhafdgYWFekaGRpZ2VzdElEAWZyYW5kb21Q46GI__EQWetvvOYmVd-9b3FlbGVtZW50SWRlbnRpZmllcm9kb2N1bWVudF9udW1iZXJsZWxlbWVudFZhbHVlZDEyMzPYGFhVpGhkaWdlc3RJRARmcmFuZG9tUIO4lnDW2fm_Utg97twL9mJxZWxlbWVudElkZW50aWZpZXJvaXNzdWluZ19jb3VudHJ5bGVsZW1lbnRWYWx1ZWJNS9gYWFikaGRpZ2VzdElEAGZyYW5kb21QBYNczBataC2MR4om9FAnmHFlbGVtZW50SWRlbnRpZmllcmpiaXJ0aF9kYXRlbGVsZW1lbnRWYWx1ZWoxOTk0LTExLTA22BhYVKRoZGlnZXN0SUQHZnJhbmRvbVBJWZtW3VOzNRpXK0Dyf3LTcWVsZW1lbnRJZGVudGlmaWVyamdpdmVuX25hbWVsZWxlbWVudFZhbHVlZkpvc2VwaNgYWFWkaGRpZ2VzdElEBWZyYW5kb21QfzR7XZl5Fiz6lZ0oMqRhlnFlbGVtZW50SWRlbnRpZmllcmtmYW1pbHlfbmFtZWxlbGVtZW50VmFsdWVmQWdhdGhh';

const NS = 'org.iso.18013.5.1';
const ALL_ELEMENTS = [
  'issue_date',
  'expiry_date',
  'driving_privileges',
  'document_number',
  'issuing_country',
  'birth_date',
  'given_name',
  'family_name',
];

const toBytes = (b64url: string) => Buffer.from(b64url, 'base64url');
const contains = (b64url: string, text: string) =>
  toBytes(b64url).includes(Buffer.from(text));

describe('filterMdocCredential', () => {
  it('discloses only the selected claim (one claim)', () => {
    const out = filterMdocCredential(ORIGINAL, {[NS]: ['birth_date']});
    expect(contains(out, 'birth_date')).toBe(true);
    ALL_ELEMENTS.filter(e => e !== 'birth_date').forEach(e =>
      expect(contains(out, e)).toBe(false),
    );
  });

  it('discloses only the selected claims (multiple claims)', () => {
    const out = filterMdocCredential(ORIGINAL, {
      [NS]: ['family_name', 'given_name'],
    });
    expect(contains(out, 'family_name')).toBe(true);
    expect(contains(out, 'given_name')).toBe(true);
    [
      'birth_date',
      'document_number',
      'issuing_country',
      'driving_privileges',
      'issue_date',
      'expiry_date',
    ].forEach(e => expect(contains(out, e)).toBe(false));
    expect(toBytes(out).length).toBeLessThan(toBytes(ORIGINAL).length);
  });

  it('keeps everything before nameSpaces (docType, issuerAuth) byte-identical', () => {
    const original = toBytes(ORIGINAL);
    const out = toBytes(
      filterMdocCredential(ORIGINAL, {[NS]: ['family_name', 'given_name']}),
    );
    const idx = original.indexOf(Buffer.from('nameSpaces'));
    expect(idx).toBeGreaterThan(0);
    expect(out.subarray(0, idx).equals(original.subarray(0, idx))).toBe(true);
  });

  it('returns the original bytes when every claim is selected', () => {
    const out = filterMdocCredential(ORIGINAL, {[NS]: ALL_ELEMENTS});
    expect(toBytes(out).equals(toBytes(ORIGINAL))).toBe(true);
  });

  it('fails closed when a selected claim is not in the credential', () => {
    expect(() =>
      filterMdocCredential(ORIGINAL, {[NS]: ['family_name', 'nonexistent']}),
    ).toThrow(/not found/);
  });

  it('fails closed for an unknown namespace', () => {
    expect(() =>
      filterMdocCredential(ORIGINAL, {'other.ns': ['family_name']}),
    ).toThrow(/not found/);
  });

  it('shares no claims for an empty selection (verifier omitted claims)', () => {
    const original = toBytes(ORIGINAL);
    const issuerAuthStart = original.indexOf(Buffer.from('issuerAuth'));
    const nameSpacesKeyStart = original.indexOf(Buffer.from('nameSpaces')) - 1;
    const issuerAuth = original.subarray(issuerAuthStart, nameSpacesKeyStart);

    [{}, {[NS]: []}].forEach(selection => {
      const out = filterMdocCredential(ORIGINAL, selection);
      expect(contains(out, 'nameSpaces')).toBe(false);
      ALL_ELEMENTS.forEach(e => expect(contains(out, e)).toBe(false));
      expect(toBytes(out).includes(issuerAuth)).toBe(true);
    });
  });

  it('throws for input that is not an mdoc', () => {
    expect(() =>
      filterMdocCredential('AAAA', {[NS]: ['family_name']}),
    ).toThrow();
  });
});
