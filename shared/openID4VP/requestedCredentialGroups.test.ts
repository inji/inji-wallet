import {getRequestedCredentialGroups} from './requestedCredentialGroups';

describe('getRequestedCredentialGroups', () => {
  it('builds one group per input descriptor, keyed by id', () => {
    expect(
      getRequestedCredentialGroups({
        input_descriptors: [
          {
            id: 'identity',
            name: ' Proof of Identity ',
            constraints: {
              fields: [{path: ["$.type[?(@ == 'NationalIDCredential')]"]}],
            },
          },
          {
            id: 'insurance',
            purpose: 'Lets the clinic bill your insurer directly.',
            constraints: {},
          },
          {name: 'no id, ignored'},
        ],
      }),
    ).toEqual({
      identity: {name: 'Proof of Identity', purpose: ''},
      insurance: {
        name: '',
        purpose: 'Lets the clinic bill your insurer directly.',
      },
    });
  });

  it('returns no groups without input descriptors', () => {
    expect(getRequestedCredentialGroups(undefined)).toEqual({});
    expect(getRequestedCredentialGroups({})).toEqual({});
  });
});
