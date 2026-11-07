import {docTypeName, getRequestedFieldLabel} from './requestUtils';

function labelFor(elementIdentifier: string) {
  return getRequestedFieldLabel(undefined, {
    namespace: 'org.iso.18013.5.1',
    elementIdentifier,
    intentToRetain: false,
  });
}

describe('requested field labels', () => {
  it('reads a plain element identifier in sentence case', () => {
    expect(labelFor('blood_type')).toBe('Blood type');
  });

  it('names the date of birth the way people say it', () => {
    expect(labelFor('birth_date')).toBe('Date of birth');
  });

  it('turns an age check into a short phrase', () => {
    expect(labelFor('age_over_18')).toBe('Over 18');
  });
});

describe('document type names', () => {
  it('names a vehicle registration request readably when no card matches it', () => {
    expect(docTypeName('org.iso.7367.1.mVRC')).toBe('Vehicle Registration');
  });

  it('falls back to the document type itself for one it does not know', () => {
    expect(docTypeName('com.example.loyalty.1')).toBe('com.example.loyalty.1');
  });
});
