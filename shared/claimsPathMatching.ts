export function normalizeClaimsPath(value: string): string {
  return value
    .replace(/\[(\d+)]/g, '.$1')
    .replace(/\[\*]/g, '.*')
    .replace(/\.{2,}/g, '.')
    .replace(/^\./, '');
}

function toSegments(value: string): string[] {
  return normalizeClaimsPath(value).split('.').filter(Boolean);
}

function isIndexSegment(segment: string): boolean {
  return /^\d+$/.test(segment);
}

function isSegmentMatch(patternSegment: string, candidateSegment: string): boolean {
  if (patternSegment === candidateSegment) {
    return true;
  }

  return (
    (patternSegment === '*' && isIndexSegment(candidateSegment)) ||
    (candidateSegment === '*' && isIndexSegment(patternSegment))
  );
}

function isPrefixMatch(prefix: string[], full: string[]): boolean {
  if (prefix.length > full.length) {
    return false;
  }

  return prefix.every((segment, index) => isSegmentMatch(segment, full[index]));
}

export function isClaimsPathMatch(pathA: string, pathB: string): boolean {
  const segmentsA = toSegments(pathA);
  const segmentsB = toSegments(pathB);

  return isPrefixMatch(segmentsA, segmentsB) || isPrefixMatch(segmentsB, segmentsA);
}

export function hasMatchingClaimsPath(
  paths: Iterable<string>,
  currentPath: string,
): boolean {
  for (const path of paths) {
    if (isClaimsPathMatch(path, currentPath)) {
      return true;
    }
  }

  return false;
}

export function getDisclosuresForPath(
  pathToDisclosures: Record<string, string[]>,
  path: string,
): string[] | undefined {
  const normalizedSelectedPath = normalizeClaimsPath(path);
  const normalizedPathToDisclosures: Record<string, string[]> = {};

  Object.entries(pathToDisclosures).forEach(([disclosurePath, disclosures]) => {
    const normalizedPath = normalizeClaimsPath(disclosurePath);
    const existingDisclosures = normalizedPathToDisclosures[normalizedPath] ?? [];
    normalizedPathToDisclosures[normalizedPath] = Array.from(
      new Set([...existingDisclosures, ...disclosures]),
    );
  });

  const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const getWildcardMatches = (candidatePath: string): string[] => {
    if (!candidatePath.includes('*')) {
      return [];
    }

    const regex = new RegExp(
      `^${candidatePath
        .split('.')
        .map(segment => (segment === '*' ? '\\d+' : escapeRegex(segment)))
        .join('\\.')}$`,
    );

    return Object.keys(normalizedPathToDisclosures).filter(disclosurePath =>
      regex.test(disclosurePath),
    );
  };

  let currentPath = normalizedSelectedPath;

  while (currentPath) {
    const matchedDisclosures = new Set<string>();

    const exactMatch = normalizedPathToDisclosures[currentPath];
    if (exactMatch) {
      exactMatch.forEach(disclosure => matchedDisclosures.add(disclosure));
    }

    getWildcardMatches(currentPath).forEach(matchingPath => {
      normalizedPathToDisclosures[matchingPath].forEach(disclosure =>
        matchedDisclosures.add(disclosure),
      );
    });

    if (matchedDisclosures.size > 0) {
      return Array.from(matchedDisclosures);
    }

    const lastDotIndex = currentPath.lastIndexOf('.');
    if (lastDotIndex === -1) {
      break;
    }

    currentPath = currentPath.slice(0, lastDotIndex);
  }

  return undefined;
}



