import type {VC} from '../../machines/VerifiableCredential/VCMetaMachine/vc';
import {matchRequest} from './matching';
import type {MdocRequest, RequestedDocument} from './types';

const docType = 'org.iso.18013.5.1.mDL';
const namespace = 'org.iso.18013.5.1';
const requested: RequestedDocument = {
  docType,
  nameSpaces: {[namespace]: {given_name: false, age_over_18: true}},
  readerTrust: {status: 'unverified', readerName: 'Reader', reason: 'No root'},
};
const request: MdocRequest = {requestNumber: 1, documents: [requested]};

function credential(processedCredential: unknown, format = 'mso_mdoc'): VC {
  return {
    lastVerifiedOn: 0,
    vcMetadata: {id: 'card', format},
    verifiableCredential: {processedCredential},
  } as VC;
}

function issuerSigned(type = docType) {
  return {
    issuerAuth: [{}, {}, {docType: type}],
    nameSpaces: {
      [namespace]: [
        {elementIdentifier: 'given_name', elementValue: ''},
        {elementIdentifier: 'age_over_18', elementValue: false},
        {elementIdentifier: 'unrequested', elementValue: 'private'},
      ],
    },
  };
}

describe('matchRequest', () => {
  it.each(['issuerSigned', 'document'])(
    'matches the %s layout and preserves requested retention flags',
    layout => {
      const signed = issuerSigned();
      const vc = credential(
        layout === 'document' ? {issuerSigned: signed} : signed,
      );

      const result = matchRequest(request, [vc]);

      const givenName = {
        namespace,
        elementIdentifier: 'given_name',
        intentToRetain: false,
      };
      const ageOver18 = {
        namespace,
        elementIdentifier: 'age_over_18',
        intentToRetain: true,
      };
      expect(result).toEqual([
        {
          requested,
          candidates: [
            {
              vc,
              requestedElements: [givenName, ageOver18],
              availableElements: [givenName, ageOver18],
              missingElements: [],
            },
          ],
          noMatch: false,
        },
      ]);
      expect(result[0].candidates[0].vc).toBe(vc);
    },
  );

  it('lists a requested element as missing when the card holds it only in another namespace', () => {
    // namespace is part of an element's identity: given_name in org.iso.18013.5.1 does not answer other.given_name
    const document = {
      ...requested,
      nameSpaces: {...requested.nameSpaces, other: {given_name: false}},
    };
    const vc = credential(issuerSigned());

    const [result] = matchRequest({...request, documents: [document]}, [vc]);

    expect(result.candidates[0].missingElements).toEqual([
      {
        namespace: 'other',
        elementIdentifier: 'given_name',
        intentToRetain: false,
      },
    ]);
    expect(
      result.candidates[0].availableElements.map(e => e.elementIdentifier),
    ).toEqual(['given_name', 'age_over_18']);
  });

  it('offers a card that holds only some requested details, with the rest listed as missing', () => {
    // frame 31: requested details that are not on the card are shown, and not shared
    const partialSigned = issuerSigned();
    partialSigned.nameSpaces[namespace] = [
      {elementIdentifier: 'given_name', elementValue: 'Kiran'},
    ];
    const partial = credential(partialSigned);

    const [result] = matchRequest(request, [partial]);

    expect(result.noMatch).toBe(false);
    expect(
      result.candidates[0].availableElements.map(e => e.elementIdentifier),
    ).toEqual(['given_name']);
    expect(
      result.candidates[0].missingElements.map(e => e.elementIdentifier),
    ).toEqual(['age_over_18']);
  });

  it('offers partial and complete cards of the same type, in wallet order', () => {
    const partialSigned = issuerSigned();
    partialSigned.nameSpaces[namespace] = [
      {elementIdentifier: 'given_name', elementValue: 'Kiran'},
    ];
    const partial = credential(partialSigned);
    const complete = credential(issuerSigned());

    const [result] = matchRequest(request, [partial, complete]);

    expect(result.candidates.map(candidate => candidate.vc)).toEqual([
      partial,
      complete,
    ]);
    expect(
      result.candidates.map(candidate => candidate.missingElements.length),
    ).toEqual([1, 0]);
  });

  it('does not offer a card of the requested type that holds none of the requested details', () => {
    // frame 36: nothing on the card answers the request, so there is no matching card
    const unrelatedSigned = issuerSigned();
    unrelatedSigned.nameSpaces[namespace] = [
      {elementIdentifier: 'unrequested', elementValue: 'private'},
    ];

    const [result] = matchRequest(request, [credential(unrelatedSigned)]);

    expect(result).toEqual({requested, candidates: [], noMatch: true});
  });

  it('keeps multiple cards of the same document type in wallet order', () => {
    const first = credential(issuerSigned());
    const second = credential(issuerSigned());

    const [result] = matchRequest(request, [first, second]);

    expect(result.candidates.map(candidate => candidate.vc)).toEqual([
      first,
      second,
    ]);
    expect(result.candidates[0].vc).toBe(first);
    expect(result.candidates[1].vc).toBe(second);
  });

  it('matches each requested document independently and reports unmatched document types', () => {
    const other = {...requested, docType: 'other.docType'};
    const vc = credential(issuerSigned());

    const result = matchRequest({...request, documents: [other, requested]}, [
      vc,
    ]);

    expect(result[0]).toEqual({
      requested: other,
      candidates: [],
      noMatch: true,
    });
    expect(result[1].candidates.map(candidate => candidate.vc)).toEqual([vc]);
    expect(result[1].noMatch).toBe(false);
  });

  it.each([
    ['different docType', issuerSigned('different'), 'mso_mdoc'],
    ['non-mdoc', issuerSigned(), 'ldp_vc'],
    ['missing processed credential', undefined, 'mso_mdoc'],
    ['null processed credential', null, 'mso_mdoc'],
    ['missing MSO', {issuerAuth: []}, 'mso_mdoc'],
    ['missing docType', {issuerAuth: [{}, {}, {}]}, 'mso_mdoc'],
    ['non-string docType', {issuerAuth: [{}, {}, {docType: 123}]}, 'mso_mdoc'],
  ])('ignores %s', (_, processed, format) => {
    const result = matchRequest(request, [credential(processed, format)]);

    expect(result).toEqual([{requested, candidates: [], noMatch: true}]);
  });

  it.each([
    undefined,
    null,
    {},
    {[namespace]: null},
    {[namespace]: {}},
    {[namespace]: [null, {}, {elementIdentifier: 7}]},
    {[namespace]: [{elementIdentifier: 'given_name'}]},
  ])('excludes cards with malformed namespaces %p', nameSpaces => {
    const vc = credential({...issuerSigned(), nameSpaces});

    const [result] = matchRequest(request, [vc]);

    expect(result).toEqual({requested, candidates: [], noMatch: true});
  });

  it('does not mutate the request or the decoded credential', () => {
    const vc = credential(issuerSigned());
    const before = JSON.stringify({request, vc});

    matchRequest(request, [vc]);

    expect(JSON.stringify({request, vc})).toBe(before);
  });

  it('handles an empty wallet and an empty request', () => {
    expect(matchRequest(request, [])).toEqual([
      {requested, candidates: [], noMatch: true},
    ]);
    expect(matchRequest({...request, documents: []}, [])).toEqual([]);
  });
});
