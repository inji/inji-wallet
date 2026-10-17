/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  getCredentialConfigurationNames,
  getOfferedCredentialConfigurationIds,
} from './credentialOffer';

jest.mock('./Utils', () => ({
  getDisplayObjectForCurrentLanguage: (display: {locale: string}[]) =>
    display.find(d => d.locale === 'en') ?? display[0],
}));

const offer = {
  credential_issuer: 'https://issuer.example.com',
  credential_configuration_ids: ['NationalID', 'DrivingLicence'],
};

describe('getOfferedCredentialConfigurationIds', () => {
  afterEach(() => {
    (global as any).fetch = undefined;
    jest.useRealTimers();
  });

  it('reads the ids from an inline offer', async () => {
    const qr = `openid-credential-offer://?credential_offer=${encodeURIComponent(
      JSON.stringify(offer),
    )}`;
    await expect(getOfferedCredentialConfigurationIds(qr)).resolves.toEqual([
      'NationalID',
      'DrivingLicence',
    ]);
  });

  it('fetches an offer passed by reference', async () => {
    const fetchMock = jest.fn().mockResolvedValue({json: async () => offer});
    (global as any).fetch = fetchMock;
    const uri = 'https://issuer.example.com/offers/123';
    const qr = `openid-credential-offer://?credential_offer_uri=${encodeURIComponent(
      uri,
    )}`;

    await expect(getOfferedCredentialConfigurationIds(qr)).resolves.toEqual([
      'NationalID',
      'DrivingLicence',
    ]);
    expect(fetchMock).toHaveBeenCalledWith(uri, {
      signal: expect.any(AbortSignal),
    });
  });

  it('does not fetch an offer link that is not https', async () => {
    const fetchMock = jest.fn();
    (global as any).fetch = fetchMock;
    const qr = `openid-credential-offer://?credential_offer_uri=${encodeURIComponent(
      'http://issuer.example.com/offers/123',
    )}`;

    await expect(getOfferedCredentialConfigurationIds(qr)).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('gives up on an offer link that does not answer within 5 seconds', async () => {
    jest.useFakeTimers();
    (global as any).fetch = jest.fn(
      (_uri: string, {signal}: {signal: AbortSignal}) =>
        new Promise((_resolve, reject) =>
          signal.addEventListener('abort', () => reject(new Error('aborted'))),
        ),
    );
    const qr = `openid-credential-offer://?credential_offer_uri=${encodeURIComponent(
      'https://issuer.example.com/offers/123',
    )}`;

    const result = getOfferedCredentialConfigurationIds(qr);
    jest.advanceTimersByTime(5000);
    await expect(result).rejects.toThrow('aborted');
  });

  it('returns nothing for a QR that is not a credential offer', async () => {
    await expect(
      getOfferedCredentialConfigurationIds('https://example.com'),
    ).resolves.toEqual([]);
  });
});

describe('getCredentialConfigurationNames', () => {
  const metadata = {
    credential_configurations_supported: {
      NationalID: {
        display: [
          {name: 'Carte d’identité', locale: 'fr'},
          {name: 'National ID Card', locale: 'en'},
        ],
      },
      DrivingLicence: {
        credential_metadata: {
          display: [{name: 'Driving Licence', locale: 'en'}],
        },
      },
      Unnamed: {},
    },
  };

  it('uses each configuration’s display name', () => {
    expect(
      getCredentialConfigurationNames(metadata, [
        'NationalID',
        'DrivingLicence',
      ]),
    ).toEqual(['National ID Card', 'Driving Licence']);
  });

  it('leaves out configurations without a display name or not in the metadata', () => {
    expect(
      getCredentialConfigurationNames(metadata, ['Unnamed', 'Missing']),
    ).toEqual([]);
  });
});
