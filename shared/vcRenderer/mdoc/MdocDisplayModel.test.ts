import {createMdocDisplayModel, DecodedMdoc} from './MdocDisplayModel';

const templateUrl = 'https://mimoto.example/templates/coastal.svg';
const namespace = 'org.iso.18013.5.1';
const makeNamespace = (elementValue: unknown) => ({
  [namespace]: [{elementIdentifier: 'family_name', elementValue}],
});

describe('mdoc display model', () => {
  it.each([
    [
      'issuerSigned',
      (nameSpaces: NonNullable<DecodedMdoc['nameSpaces']>) => ({
        issuerSigned: {nameSpaces},
      }),
    ],
    [
      'root',
      (nameSpaces: NonNullable<DecodedMdoc['nameSpaces']>) => ({nameSpaces}),
    ],
  ])(
    'reads claims from %s namespaces without mutating the credential',
    (_, wrap) => {
      const decoded = wrap(makeNamespace('Holder'));
      const original = JSON.stringify(decoded);
      const model = createMdocDisplayModel(decoded, templateUrl);
      expect(model.claims).toEqual({[namespace]: {family_name: 'Holder'}});
      expect(model.renderMethod).toEqual([
        {
          type: 'TemplateRenderMethod',
          renderSuite: 'svg-mustache',
          template: {id: templateUrl},
        },
      ]);
      expect(JSON.stringify(decoded)).toBe(original);
    },
  );

  it('keeps identical element names in different namespaces separate', () => {
    const model = createMdocDisplayModel(
      {
        nameSpaces: {
          ...makeNamespace('First'),
          other: [{elementIdentifier: 'family_name', elementValue: 'Second'}],
        },
      },
      templateUrl,
    );
    expect(model.claims).toEqual({
      [namespace]: {family_name: 'First'},
      other: {family_name: 'Second'},
    });
  });

  it('preserves nested vehicle claims for JSON Pointer substitution', () => {
    const model = createMdocDisplayModel(
      {
        nameSpaces: {
          'org.iso.7367.1': [
            {
              elementIdentifier: 'basic_vehicle_info',
              elementValue: {make: 'OPEL', commercial_name: 'A&B'},
            },
            {
              elementIdentifier: 'vehicle_holder',
              elementValue: [{family_name_unicode: 'Cërnosljé'}],
            },
          ],
        },
      },
      templateUrl,
    );
    expect(model.claims['org.iso.7367.1']).toEqual({
      basic_vehicle_info: {make: 'OPEL', commercial_name: 'A&amp;B'},
      vehicle_holder: [{family_name_unicode: 'Cërnosljé'}],
    });
  });

  it.each([
    ['<A & "B"\'s>', '&lt;A &amp; &quot;B&quot;&apos;s&gt;'],
    [0, '0'],
    [false, 'No'],
    [true, 'Yes'],
    [null, '-'],
  ])('formats %p safely for XML substitution', (value, expected) => {
    const model = createMdocDisplayModel(
      {nameSpaces: makeNamespace(value)},
      templateUrl,
    );
    expect(model.claims[namespace].family_name).toBe(expected);
  });

  it.each([
    ['/9j/AA==', 'data:image/jpeg;base64,/9j/AA=='],
    ['data:image/jpeg;base64,/9j/AA==', 'data:image/jpeg;base64,/9j/AA=='],
    [[255, 216, 255, 0], 'data:image/jpeg;base64,/9j/AA=='],
  ])('embeds a JPEG portrait from %p', (value, expected) => {
    const model = createMdocDisplayModel(
      {
        nameSpaces: {
          [namespace]: [{elementIdentifier: 'portrait', elementValue: value}],
        },
      },
      templateUrl,
    );
    expect(model.portraits[namespace]).toBe(expected);
    expect(model.claims[namespace].portrait).toBe('-');
  });

  it('does not permit remote portrait requests', () => {
    const empty = createMdocDisplayModel(
      {nameSpaces: {[namespace]: []}},
      templateUrl,
    );
    const remote = createMdocDisplayModel(
      {
        nameSpaces: {
          [namespace]: [
            {
              elementIdentifier: 'portrait',
              elementValue: 'https://example.com/photo.jpg',
            },
          ],
        },
      },
      templateUrl,
    );
    expect(remote.portraits).toEqual(empty.portraits);
  });

  it('uses original CBOR bytes when the decoded portrait string is lossy', () => {
    const model = createMdocDisplayModel(
      {
        nameSpaces: {
          [namespace]: [
            {elementIdentifier: 'portrait', elementValue: '\uFFFD\uFFFD\uFFFD'},
          ],
        },
      },
      templateUrl,
      {portraits: {[namespace]: new Uint8Array([255, 216, 255, 0])}},
    );
    expect(model.portraits[namespace]).toBe('data:image/jpeg;base64,/9j/AA==');
  });

  it('createMdocDisplayModel shows signature_usual_mark from the original CBOR bytes as a signature image', () => {
    const decoded = {
      nameSpaces: {
        [namespace]: [
          // PixelPass turned the binary signature into lossy text
          {elementIdentifier: 'signature_usual_mark', elementValue: '\uFFFD'},
        ],
      },
    };

    const model = createMdocDisplayModel(decoded, templateUrl, {
      signatures: {[namespace]: new Uint8Array([255, 216, 255, 0])},
    });

    expect(model.signatures[namespace]).toBe('data:image/jpeg;base64,/9j/AA==');
    expect(model.claims[namespace].signature_usual_mark).toBe('-');
  });

  it('createMdocDisplayModel gives every namespace an empty signature image when the issuer sends none', () => {
    const decoded = {nameSpaces: makeNamespace('Holder')};

    const model = createMdocDisplayModel(decoded, templateUrl);

    expect(model.signatures[namespace]).toBe(model.portraits[namespace]);
    expect(model.signatures[namespace]).toMatch(/^data:image\/png;base64,/);
  });

  it.each(['birth_date', 'issue_date', 'expiry_date'])(
    'formats %s without a timezone shift',
    identifier => {
      const model = createMdocDisplayModel(
        {
          nameSpaces: {
            [namespace]: [
              {
                elementIdentifier: identifier,
                elementValue: '2026-10-21T18:13:31Z',
              },
            ],
          },
        },
        templateUrl,
      );
      expect(model.claims[namespace][identifier]).toBe('2026-10-21');
    },
  );

  it('rejects missing decoded namespaces', () => {
    expect(() => createMdocDisplayModel({}, templateUrl)).toThrow(
      'Mdoc display requires decoded namespaces',
    );
  });

  it('rejects duplicate claims instead of displaying an ambiguous value', () => {
    expect(() =>
      createMdocDisplayModel(
        {
          nameSpaces: {
            [namespace]: [
              {elementIdentifier: 'family_name', elementValue: 'First'},
              {elementIdentifier: 'family_name', elementValue: 'Second'},
            ],
          },
        },
        templateUrl,
      ),
    ).toThrow('Duplicate mdoc element identifier');
  });
});

describe('mdoc display model issuer aliases', () => {
  const photoId = 'org.iso.23220.1';
  const element = (elementIdentifier: string, elementValue: unknown) => ({
    elementIdentifier,
    elementValue,
  });

  it('createMdocDisplayModel fills the unicode name claims from plain names when an issuer sends only family_name and given_name', () => {
    // Paradym style Photo ID
    const decoded = {
      nameSpaces: {
        [photoId]: [
          element('family_name', 'Mustermann'),
          element('given_name', 'Erika'),
        ],
      },
    };

    const model = createMdocDisplayModel(decoded, templateUrl);

    expect(model.claims[photoId].family_name_unicode).toBe('Mustermann');
    expect(model.claims[photoId].given_name_unicode).toBe('Erika');
  });

  it('createMdocDisplayModel never replaces a value the issuer sent when a synonym is also present', () => {
    const decoded = {
      nameSpaces: {
        [photoId]: [
          element('family_name_unicode', 'Müller'),
          element('family_name', 'Mueller'),
        ],
      },
    };

    const model = createMdocDisplayModel(decoded, templateUrl);

    expect(model.claims[photoId].family_name_unicode).toBe('Müller');
    expect(model.claims[photoId].family_name).toBe('Mueller');
  });

  it('createMdocDisplayModel exposes the lower-case photoid namespace under the photoID spelling templates use', () => {
    const decoded = {
      nameSpaces: {
        'org.iso.23220.photoid.1': [element('person_id', '1234567890')],
      },
    };

    const model = createMdocDisplayModel(decoded, templateUrl);

    expect(model.claims['org.iso.23220.photoID.1'].person_id).toBe(
      '1234567890',
    );
  });

  it('createMdocDisplayModel maps an EU PID onto the identity card claims and joins its nationality list', () => {
    const decoded = {
      nameSpaces: {
        'eu.europa.ec.eudi.pid.1': [
          element('family_name', 'Garcia'),
          element('issuance_date', '2025-01-02'),
          element('nationality', ['ES', 'PT']),
          element('personal_administrative_number', 'X-42'),
        ],
      },
    };

    const model = createMdocDisplayModel(decoded, templateUrl);

    expect(model.claims[photoId].family_name_unicode).toBe('Garcia');
    expect(model.claims[photoId].issue_date).toBe('2025-01-02');
    expect(model.claims[photoId].nationality).toBe('ES, PT');
    expect(model.claims['org.iso.23220.photoID.1'].person_id).toBe('X-42');
  });

  it('createMdocDisplayModel writes an EU PID place_of_birth map as one line', () => {
    const decoded = {
      nameSpaces: {
        'eu.europa.ec.eudi.pid.1': [
          element('place_of_birth', {locality: 'Leiden', country: 'NL'}),
        ],
      },
    };

    const model = createMdocDisplayModel(decoded, templateUrl);

    expect(model.claims[photoId].birthplace).toBe('Leiden, NL');
  });

  it('createMdocDisplayModel uses the EU PID portrait for the identity card portrait slot', () => {
    // JPEG magic bytes
    const decoded = {
      nameSpaces: {
        'eu.europa.ec.eudi.pid.1': [
          element('portrait', new Uint8Array([0xff, 0xd8, 0xff, 0xe0])),
        ],
      },
    };

    const model = createMdocDisplayModel(decoded, templateUrl);

    expect(model.portraits[photoId]).toBe('data:image/jpeg;base64,/9j/4A==');
  });

  it('createMdocDisplayModel shows the issuing country as the UN sign when an mDL has no un_distinguishing_sign', () => {
    const decoded = {
      nameSpaces: {[namespace]: [element('issuing_country', 'NL')]},
    };

    const model = createMdocDisplayModel(decoded, templateUrl);

    expect(model.claims[namespace].un_distinguishing_sign).toBe('NL');
  });

  it('createMdocDisplayModel takes the vehicle expiry from the 7367 namespace when the 23220 namespace has none', () => {
    const decoded = {
      nameSpaces: {'org.iso.7367.1': [element('expiry_date', '2034-08-28')]},
    };

    const model = createMdocDisplayModel(decoded, templateUrl);

    expect(model.claims[photoId].expiry_date).toBe('2034-08-28');
  });
});
