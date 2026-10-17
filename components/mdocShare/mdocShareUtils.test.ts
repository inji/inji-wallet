import {
  agreedPurposeTitles,
  allRequiredPurposesSelected,
  buildDisclosurePlan,
  buildWithheldPlan,
  buildPurposesResponse,
  buildShareSummary,
  hasPurposeElementMapping,
  deriveMdocShareStep,
  describeElementValue,
  maskIdentifier,
  formatElementLabel,
  getCredentialTypeMismatch,
  getMdocDocType,
  getMdocHolderName,
  getMdocIssuingAuthority,
  isRequiredFlag,
  isSessionStep,
  resolveVerifierName,
  togglePurposeSelection,
} from './mdocShareUtils';
import type {MdocPresentmentConsentRequest} from '../../shared/mdoc/iso18013PresentmentInterop';

const idle = {
  qrReady: false,
  qrError: false,
  readerConnected: false,
  hasConsentRequest: false,
  isSending: false,
  result: null,
};

describe('deriveMdocShareStep', () => {
  it('walks the happy path in order', () => {
    expect(deriveMdocShareStep(idle)).toBe('loading');
    expect(deriveMdocShareStep({...idle, qrReady: true})).toBe('showQr');
    expect(
      deriveMdocShareStep({...idle, qrReady: true, readerConnected: true}),
    ).toBe('connecting');
    expect(
      deriveMdocShareStep({
        ...idle,
        qrReady: true,
        readerConnected: true,
        hasConsentRequest: true,
      }),
    ).toBe('consent');
    expect(
      deriveMdocShareStep({
        ...idle,
        qrReady: true,
        hasConsentRequest: true,
        isSending: true,
      }),
    ).toBe('sending');
    expect(
      deriveMdocShareStep({...idle, isSending: true, result: 'success'}),
    ).toBe('shared');
  });

  it('shows a result over every other state', () => {
    const busy = {
      ...idle,
      qrReady: true,
      readerConnected: true,
      hasConsentRequest: true,
      isSending: true,
    };
    expect(deriveMdocShareStep({...busy, result: 'declined'})).toBe('declined');
    expect(deriveMdocShareStep({...busy, result: 'failure'})).toBe('failed');
  });

  it('reports a QR error only before a session starts', () => {
    expect(deriveMdocShareStep({...idle, qrError: true})).toBe('error');
    expect(
      deriveMdocShareStep({...idle, qrError: true, readerConnected: true}),
    ).toBe('connecting');
  });
});

describe('isSessionStep', () => {
  it('treats only the pre-scan steps as non-session', () => {
    expect(isSessionStep('loading')).toBe(false);
    expect(isSessionStep('error')).toBe(false);
    expect(isSessionStep('showQr')).toBe(false);
    expect(isSessionStep('connecting')).toBe(true);
    expect(isSessionStep('consent')).toBe(true);
    expect(isSessionStep('failed')).toBe(true);
  });
});

describe('isRequiredFlag', () => {
  it('normalizes untrusted verifier values', () => {
    expect(isRequiredFlag(true)).toBe(true);
    expect(isRequiredFlag('true')).toBe(true);
    expect(isRequiredFlag(' 1 ')).toBe(true);
    expect(isRequiredFlag(1)).toBe(true);
    expect(isRequiredFlag('false')).toBe(false);
    expect(isRequiredFlag(0)).toBe(false);
    expect(isRequiredFlag(undefined)).toBe(false);
  });
});

describe('purpose selection', () => {
  const purposes = [
    {id: 'p1', name: 'verify', is_required: true, description: 'Verify'},
    {name: 'record', is_required: 'false' as unknown as boolean},
  ];

  it('accepts everything when nothing is unticked', () => {
    const none = new Set<string>();
    expect(allRequiredPurposesSelected(purposes, none)).toBe(true);
    expect(buildPurposesResponse(purposes, none)).toEqual([
      {id: 'p1', name: 'verify', accepted: true},
      {id: 'NA', name: 'record', accepted: true},
    ]);
    expect(agreedPurposeTitles(purposes, none, 'Default', 'Fallback')).toEqual([
      'Verify',
      'Default',
    ]);
  });

  it('reports an unticked optional purpose without blocking approval', () => {
    const unselected = new Set(['record']);
    expect(allRequiredPurposesSelected(purposes, unselected)).toBe(true);
    expect(buildPurposesResponse(purposes, unselected)[1].accepted).toBe(false);
    expect(
      agreedPurposeTitles(purposes, unselected, 'Default', 'Fallback'),
    ).toEqual(['Verify']);
  });

  it('never unticks a required purpose but toggles optional ones', () => {
    const none = new Set<string>();
    expect(togglePurposeSelection(purposes, none, 0)).toBe(none);
    const unticked = togglePurposeSelection(purposes, none, 1);
    expect(Array.from(unticked)).toEqual(['record']);
    expect(Array.from(togglePurposeSelection(purposes, unticked, 1))).toEqual(
      [],
    );
  });

  it('blocks approval while a required purpose is unticked', () => {
    expect(allRequiredPurposesSelected(purposes, new Set(['p1']))).toBe(false);
  });

  it('falls back to the request purpose when the verifier sent no list', () => {
    expect(allRequiredPurposesSelected([], new Set())).toBe(true);
    expect(buildPurposesResponse([], new Set())).toEqual([]);
    expect(agreedPurposeTitles([], new Set(), 'Default', 'Age check')).toEqual([
      'Age check',
    ]);
  });
});

describe('formatElementLabel', () => {
  it('sentence-cases element identifiers', () => {
    expect(formatElementLabel('age_over_18')).toBe('Age over 18');
    expect(formatElementLabel('portrait')).toBe('Portrait');
    expect(formatElementLabel('')).toBe('');
  });
});

const request: MdocPresentmentConsentRequest = {
  docType: 'org.iso.18013.5.1.mDL',
  verifierName: 'Reader CN',
  purpose: '',
  elements: [
    {
      namespace: 'org.iso.18013.5.1',
      element: 'family_name',
      intentToRetain: false,
      optional: false,
    },
  ],
  requestedElements: [
    {
      namespace: 'org.iso.18013.5.1',
      element: 'family_name',
      intentToRetain: false,
      servable: true,
      servedAs: null,
    },
    {
      namespace: 'org.iso.18013.5.1',
      element: 'resident_address',
      intentToRetain: false,
      servable: false,
      servedAs: null,
    },
  ],
  requestInfo: {verifier_name: '  Metro Traffic Police '},
};

describe('resolveVerifierName', () => {
  it('prefers the verifier-supplied name over the reader certificate', () => {
    expect(resolveVerifierName(request)).toBe('Metro Traffic Police');
    expect(resolveVerifierName({...request, requestInfo: undefined})).toBe(
      'Reader CN',
    );
    expect(resolveVerifierName(null)).toBeUndefined();
  });
});

describe('buildShareSummary', () => {
  it('lists the disclosed elements and agreed purposes, not what the credential lacks', () => {
    expect(buildShareSummary(request, ['Verify your licence'])).toEqual({
      shared: request.elements,
      agreedPurposes: ['Verify your licence'],
      withheld: [],
    });
  });

  it('reports what the user held back', () => {
    expect(buildShareSummary(request, [], [])).toEqual({
      shared: [],
      agreedPurposes: [],
      withheld: ['family_name'],
    });
  });

  it('is empty without a request', () => {
    expect(buildShareSummary(null, [])).toEqual({
      shared: [],
      agreedPurposes: [],
      withheld: [],
    });
  });
});

describe('describeElementValue', () => {
  it('formats the common mDL value shapes', () => {
    expect(describeElementValue('family_name', ' Mensah ')).toEqual({
      kind: 'text',
      text: 'Mensah',
    });
    expect(describeElementValue('birth_date', '1994-03-14')).toEqual({
      kind: 'text',
      text: '14 Mar 1994',
    });
    expect(describeElementValue('age_over_18', true)).toEqual({
      kind: 'boolean',
      value: true,
    });
    expect(describeElementValue('portrait', new Uint8Array([1]))).toEqual({
      kind: 'image',
    });
    expect(
      describeElementValue('driving_privileges', [
        {vehicle_category_code: 'B'},
        {vehicle_category_code: 'A1'},
      ]),
    ).toEqual({kind: 'text', text: 'B, A1'});
    expect(describeElementValue('issue_date', {value: '2020-01-02'})).toEqual({
      kind: 'text',
      text: '2 Jan 2020',
    });
  });

  it('masks the document number', () => {
    expect(describeElementValue('document_number', 'DL-07-2019-3390')).toEqual({
      kind: 'text',
      text: 'DL-07-•••• 3390',
    });
    expect(maskIdentifier('AB123456')).toBe('•••• 3456');
    expect(maskIdentifier('A123')).toBe('A123');
  });

  it('shows nothing for missing or unreadable values', () => {
    expect(describeElementValue('email', undefined)).toEqual({kind: 'none'});
    expect(describeElementValue('portrait', null)).toEqual({kind: 'none'});
    expect(describeElementValue('email', {nested: 1})).toEqual({kind: 'none'});
  });
});

describe('buildDisclosurePlan', () => {
  const ns = 'org.iso.18013.5.1';
  const el = (element: string, intentToRetain = false) => ({
    namespace: ns,
    element,
    intentToRetain,
    optional: false,
  });
  const mappedRequest: MdocPresentmentConsentRequest = {
    docType: 'org.iso.18013.5.1.mDL',
    purpose: '',
    elements: [
      el('family_name', true),
      el('portrait'),
      el('age_over_18'),
      el('birth_date'),
    ],
    requestedElements: [
      {
        namespace: ns,
        element: 'family_name',
        intentToRetain: true,
        servable: true,
        servedAs: null,
      },
      {
        namespace: ns,
        element: 'full_name',
        intentToRetain: true,
        servable: true,
        servedAs: 'family_name',
      },
      {
        namespace: ns,
        element: 'resident_address',
        intentToRetain: false,
        servable: false,
        servedAs: null,
      },
    ],
  };
  const purposes = [
    {
      id: 'verify',
      name: 'verify',
      is_required: true,
      description: 'Verify licence',
      elements: ['portrait', 'age_over_18'],
    },
    {
      id: 'record',
      name: 'record',
      is_required: false,
      description: 'Keep a record',
      elements: ['full_name'],
    },
  ];
  const names = (rows: ReturnType<typeof buildDisclosurePlan>) =>
    rows.map(r => r.element.element);

  it('lists only what agreed purposes need, matching remapped names', () => {
    const rows = buildDisclosurePlan(mappedRequest, purposes, new Set(), 'D');
    expect(names(rows)).toEqual(['family_name', 'portrait', 'age_over_18']);
    expect(rows[0].usedFor).toEqual(['Keep a record']);
    expect(rows[1].usedFor).toEqual(['Verify licence']);
  });

  it('drops a purpose’s details once it is unticked', () => {
    const rows = buildDisclosurePlan(
      mappedRequest,
      purposes,
      new Set(['record']),
      'D',
    );
    expect(names(rows)).toEqual(['portrait', 'age_over_18']);
  });

  it('never lists requested elements the credential does not hold', () => {
    const unmapped = purposes.map(({elements: _e, ...rest}) => rest);
    const rows = buildDisclosurePlan(
      mappedRequest,
      unmapped,
      new Set(['record']),
      'D',
    );
    expect(rows.map(r => r.element)).toEqual(mappedRequest.elements);
    expect(names(rows)).not.toContain('resident_address');
    expect(rows.every(r => r.usedFor.length === 0)).toBe(true);
  });

  it('ignores a malformed elements field', () => {
    const malformed = [
      {...purposes[0], elements: 'portrait' as unknown as string[]},
    ];
    expect(hasPurposeElementMapping(malformed)).toBe(false);
    expect(
      buildDisclosurePlan(mappedRequest, malformed, new Set(), 'D'),
    ).toHaveLength(4);
  });

  it('splits what is not sent into unneeded and not held', () => {
    const rows = buildDisclosurePlan(
      mappedRequest,
      purposes,
      new Set(['record']),
      'D',
    );
    const withheld = buildWithheldPlan(mappedRequest, rows);
    expect(withheld.unneeded.map(e => e.element)).toEqual([
      'family_name',
      'birth_date',
    ]);
    expect(withheld.notHeld).toEqual(['resident_address']);
  });
});

describe('getCredentialTypeMismatch', () => {
  it('reports the requested and wallet doc types when none match', () => {
    expect(
      getCredentialTypeMismatch({
        reason: 'credential_not_present',
        walletDocType: 'org.iso.18013.5.1.mDL1',
        requestedDocTypes: [
          'org.iso.18013.5.1.mDL',
          'org.iso.18013.5.1.IdentityCertificate',
        ],
      }),
    ).toEqual({
      requestedDocTypes: [
        'org.iso.18013.5.1.mDL',
        'org.iso.18013.5.1.IdentityCertificate',
      ],
      walletDocType: 'org.iso.18013.5.1.mDL1',
    });
  });

  it('is null when the doc type matched and only the elements did not', () => {
    expect(
      getCredentialTypeMismatch({
        reason: 'no_overlapping_elements',
        walletDocType: 'org.iso.18013.5.1.mDL',
        requestedDocTypes: ['org.iso.18013.5.1.mDL'],
      }),
    ).toBeNull();
  });

  it('is null when the event lacks doc types', () => {
    expect(getCredentialTypeMismatch(null)).toBeNull();
    expect(
      getCredentialTypeMismatch({
        reason: '',
        walletDocType: '',
        requestedDocTypes: ['org.iso.18013.5.1.mDL'],
      }),
    ).toBeNull();
    expect(
      getCredentialTypeMismatch({
        reason: '',
        walletDocType: 'org.iso.18013.5.1.mDL1',
        requestedDocTypes: [],
      }),
    ).toBeNull();
  });
});

describe('mdoc credential display helpers', () => {
  const asArray = {
    docType: 'org.iso.18013.5.1.mDL',
    issuerSigned: {
      nameSpaces: {
        'org.iso.18013.5.1': [
          {elementIdentifier: 'given_name', elementValue: 'Amara'},
          {elementIdentifier: 'family_name', elementValue: 'Mensah'},
          {
            elementIdentifier: 'issuing_authority',
            elementValue: 'Road Transport Authority',
          },
        ],
      },
    },
  };

  it('reads the holder name from given + family name', () => {
    expect(getMdocHolderName(asArray)).toBe('Amara Mensah');
  });

  it('prefers a full name element and supports map-shaped nameSpaces', () => {
    expect(
      getMdocHolderName({
        nameSpaces: {ns: {full_name: 'A. Mensah', given_name: 'Amara'}},
      }),
    ).toBe('A. Mensah');
  });

  it('reads the issuing authority and docType', () => {
    expect(getMdocIssuingAuthority(asArray)).toBe('Road Transport Authority');
    expect(getMdocDocType(asArray)).toBe('org.iso.18013.5.1.mDL');
    expect(getMdocDocType({issuerSigned: {docType: 'x'}})).toBe('x');
  });

  it('returns empty strings when nothing is available', () => {
    expect(getMdocHolderName(undefined)).toBe('');
    expect(getMdocIssuingAuthority({})).toBe('');
    expect(getMdocDocType(undefined)).toBe('');
  });
});
