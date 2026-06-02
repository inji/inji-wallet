import {
  getDisclosuresForPath,
  hasMatchingClaimsPath,
  isClaimsPathMatch,
  normalizeClaimsPath,
} from './claimsPathMatching';

describe('claimsPathMatching', () => {
  it('normalizes indexed and wildcard bracket paths', () => {
    expect(normalizeClaimsPath('credentialSubject.degrees[1].type')).toBe(
      'credentialSubject.degrees.1.type',
    );
    expect(normalizeClaimsPath('credentialSubject.degrees[*].type')).toBe(
      'credentialSubject.degrees.*.type',
    );
  });

  it('matches parent/child paths and wildcard-index segments', () => {
    expect(
      isClaimsPathMatch('credentialSubject.address', 'credentialSubject.address.city'),
    ).toBe(true);

    expect(
      isClaimsPathMatch(
        'credentialSubject.degrees[*]',
        'credentialSubject.degrees[0].type',
      ),
    ).toBe(true);
  });

  it('checks if any path in the set matches the current path', () => {
    const disclosed = new Set(['credentialSubject.degrees[*]']);
    expect(
      hasMatchingClaimsPath(disclosed, 'credentialSubject.degrees[2].institution'),
    ).toBe(true);
    expect(hasMatchingClaimsPath(disclosed, 'credentialSubject.address.city')).toBe(
      false,
    );
  });

  it('returns wildcard and parent fallback disclosures for selected path', () => {
    const pathToDisclosures = {
      'credentialSubject.degrees[0].type': ['disc0'],
      'credentialSubject.degrees[1].type': ['disc1'],
      'credentialSubject.address': ['addressDisclosure'],
    };

    expect(
      getDisclosuresForPath(pathToDisclosures, 'credentialSubject.degrees[*].type'),
    ).toEqual(['disc0', 'disc1']);

    expect(
      getDisclosuresForPath(pathToDisclosures, 'credentialSubject.address.city'),
    ).toEqual(['addressDisclosure']);
  });
});


