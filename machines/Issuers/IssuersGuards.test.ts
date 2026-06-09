import {IssuersGuards} from './IssuersGuards';

describe('IssuersGuards', () => {
  const guard = IssuersGuards().isInSafeStateForDeepLink;

  it('accepts credential offer deep links from an idle state', () => {
    const matches = jest.fn(() => false);

    expect(guard({}, {}, {state: {matches}})).toBe(true);
  });

  it.each([
    'credentialDownloadFromOffer',
    'downloadCredentials',
    'proccessingCredential',
    'verifyingCredential',
    'storing',
  ])('rejects credential offer deep links while in %s', busyState => {
    const matches = jest.fn((state: string) => state === busyState);

    expect(guard({}, {}, {state: {matches}})).toBe(false);
  });
});
