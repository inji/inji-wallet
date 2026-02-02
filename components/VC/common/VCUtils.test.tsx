/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {getFieldValue} from './VCUtils';
import {VCFormat} from '../../../shared/VCFormat';
import * as i18n from '../../../i18n';

// Mock dependencies
jest.mock('../../../i18n', () => ({
  getLocalizedField: jest.fn((value) => {
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) {
      const match = value.find((item: any) => item.language === 'en');
      return match?.value || value[0]?.value || '';
    }
    return value;
  }),
}));

jest.mock('../../VCVerification', () => ({
  VCVerification: jest.fn(() => null),
}));

jest.mock('../../ui', () => ({
  Column: ({children}: any) => <div data-testid="column">{children}</div>,
  Row: ({children}: any) => <div data-testid="row">{children}</div>,
}));

jest.mock('react-native-vector-icons/FontAwesome', () => 'Icon');

// Mock Display class
class MockDisplay {
  getTextColor(color: string) {
    return color;
  }
}

describe('getFieldValue', () => {
  let mockDisplay: MockDisplay;
  let mockProps: any;
  let mockWellknown: any;

  beforeEach(() => {
    mockDisplay = new MockDisplay();
    mockProps = {
      verifiableCredentialData: {
        vcMetadata: {
          isVerified: true,
        },
      },
      vc: {
        credentialRegistry: 'Test Registry',
      },
    };
    mockWellknown = {
      credential_definition: {
        credentialSubject: {},
      },
    };
    jest.clearAllMocks();
  });

  describe('Special field cases', () => {
    it('should return VCVerification component for status field', () => {
      const verifiableCredential = {credentialSubject: {}} as any;

      const result = getFieldValue(
        verifiableCredential,
        'status',
        mockWellknown,
        mockProps,
        mockDisplay as any,
        VCFormat.ldp_vc,
      );

      expect(React.isValidElement(result)).toBe(true);
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('props');
    });

    it('should return credential type for idType field', () => {
      mockWellknown.display = [{name: 'National ID', locale: 'en'}];
      const verifiableCredential = {credentialSubject: {}} as any;

      const result = getFieldValue(
        verifiableCredential,
        'idType',
        mockWellknown,
        mockProps,
        mockDisplay as any,
        VCFormat.ldp_vc,
      );

      expect(result).toBe('National ID');
      expect(result).toHaveLength(11);
    });

    it('should return credential registry for credentialRegistry field', () => {
      const verifiableCredential = {credentialSubject: {}} as any;

      const result = getFieldValue(
        verifiableCredential,
        'credentialRegistry',
        mockWellknown,
        mockProps,
        mockDisplay as any,
        VCFormat.ldp_vc,
      );

      expect(result).toBe('Test Registry');
    });

    it('should return formatted address for address field', () => {
      const verifiableCredential = {
        credentialSubject: {
          addressLine1: '123 Main St',
          city: 'TestCity',
          province: 'TestProvince',
          postalCode: '12345',
        },
      } as any;

      const result = getFieldValue(
        verifiableCredential,
        'address',
        mockWellknown,
        mockProps,
        mockDisplay as any,
        VCFormat.ldp_vc,
      );

      expect(i18n.getLocalizedField).toHaveBeenCalledTimes(8);
      expect(result).toBeDefined();
    });
  });

  describe('LDP VC format', () => {
    it('should return localized field value for simple string field', () => {
      const verifiableCredential = {
        credentialSubject: {fullName: 'John Doe'},
      } as any;

      const result = getFieldValue(
        verifiableCredential,
        'fullName',
        mockWellknown,
        mockProps,
        mockDisplay as any,
        VCFormat.ldp_vc,
      );

      expect(result).toBe('John Doe');
      expect(i18n.getLocalizedField).toHaveBeenCalledWith('John Doe');
    });

    it('should join array of simple values with comma', () => {
      const verifiableCredential = {
        credentialSubject: {hobbies: ['Reading', 'Gaming', 'Coding']},
      } as any;

      const result = getFieldValue(
        verifiableCredential,
        'hobbies',
        mockWellknown,
        mockProps,
        mockDisplay as any,
        VCFormat.ldp_vc,
      );

      expect(result).toBe('Reading, Gaming, Coding');
      expect(result.split(', ')).toHaveLength(3);
    });

    it('should handle array of localized objects', () => {
      const verifiableCredential = {
        credentialSubject: {
          languages: [
            {language: 'en', value: 'English'},
            {language: 'fr', value: 'French'},
          ],
        },
      } as any;

      const result = getFieldValue(
        verifiableCredential,
        'languages',
        mockWellknown,
        mockProps,
        mockDisplay as any,
        VCFormat.ldp_vc,
      );

      expect(result).toBe('English');
      expect(i18n.getLocalizedField).toHaveBeenCalledWith([
        {language: 'en', value: 'English'},
        {language: 'fr', value: 'French'},
      ]);
    });

    it('should handle undefined field', () => {
      const verifiableCredential = {credentialSubject: {}} as any;

      const result = getFieldValue(
        verifiableCredential,
        'nonExistentField',
        mockWellknown,
        mockProps,
        mockDisplay as any,
        VCFormat.ldp_vc,
      );

      expect(result).toBeUndefined();
      expect(i18n.getLocalizedField).toHaveBeenCalledWith(undefined);
    });
  });

  describe('MSO MDOC format', () => {
    it('should extract value from namespaced field', () => {
      const verifiableCredential = {
        issuerSigned: {
          nameSpaces: {
            'org.iso.18013.5.1': [
              {
                elementIdentifier: 'given_name',
                elementValue: 'John',
              },
              {
                elementIdentifier: 'family_name',
                elementValue: 'Doe',
              },
            ],
          },
        },
      } as any;

      const result = getFieldValue(
        verifiableCredential,
        'org.iso.18013.5.1~given_name',
        mockWellknown,
        mockProps,
        mockDisplay as any,
        VCFormat.mso_mdoc,
      );

      expect(result).toBe('John');
      expect(result).not.toBe('Doe');
    });

    it('should render complex array values recursively', () => {
      const verifiableCredential = {
        issuerSigned: {
          nameSpaces: {
            'org.iso.18013.5.1': [
              {
                elementIdentifier: 'driving_privileges',
                elementValue: [{issueDate: '2023-01-15', vehicleCategoryCode: 'B'}],
              },
            ],
          },
        },
        disclosedKeys: [],
      } as any;

      const result = getFieldValue(
        verifiableCredential,
        'org.iso.18013.5.1~driving_privileges',
        mockWellknown,
        mockProps,
        mockDisplay as any,
        VCFormat.mso_mdoc,
      );

      expect(React.isValidElement(result)).toBe(true);
      expect(result?.props).toBeDefined();
    });

    it('should render complex object values recursively', () => {
      const verifiableCredential = {
        issuerSigned: {
          nameSpaces: {
            'org.iso.18013.5.1': [
              {
                elementIdentifier: 'driving_privileges',
                elementValue: {issueDate: '2023-01-15', vehicleCategoryCode: 'B'},
              },
            ],
          },
        },
        disclosedKeys: [],
      } as any;

      const result = getFieldValue(
        verifiableCredential,
        'org.iso.18013.5.1~driving_privileges',
        mockWellknown,
        mockProps,
        mockDisplay as any,
        VCFormat.mso_mdoc,
      );

      expect(React.isValidElement(result)).toBe(true);
      expect(result?.props).toBeDefined();
    });

    it('should return undefined for field without namespace delimiter', () => {
      const verifiableCredential = {issuerSigned: {nameSpaces: {}}} as any;

      const result = getFieldValue(
        verifiableCredential,
        'simpleField',
        mockWellknown,
        mockProps,
        mockDisplay as any,
        VCFormat.mso_mdoc,
      );

      expect(result).toBeUndefined();
    });
  });

  describe('SD-JWT formats (vc_sd_jwt and dc_sd_jwt)', () => {
    it('should extract nested field value using dot notation', () => {
      const verifiableCredential = {
        fullResolvedPayload: {user: {profile: {name: 'John Doe'}}},
      } as any;

      const result = getFieldValue(
        verifiableCredential,
        'user.profile.name',
        mockWellknown,
        mockProps,
        mockDisplay as any,
        VCFormat.vc_sd_jwt,
      );

      expect(result).toBe('John Doe');
      expect(i18n.getLocalizedField).toHaveBeenCalledWith('John Doe');
    });

    it('should handle array of simple values in SD-JWT', () => {
      const verifiableCredential = {
        fullResolvedPayload: {skills: ['JavaScript', 'TypeScript', 'React']},
      } as any;

      const result = getFieldValue(
        verifiableCredential,
        'skills',
        mockWellknown,
        mockProps,
        mockDisplay as any,
        VCFormat.vc_sd_jwt,
      );

      expect(result).toBe('JavaScript, TypeScript, React');
      expect(result.split(', ')).toEqual(['JavaScript', 'TypeScript', 'React']);
    });

    it('should handle array of localized objects in SD-JWT', () => {
      const verifiableCredential = {
        fullResolvedPayload: {
          title: [
            {language: 'en', value: 'Engineer'},
            {language: 'fr', value: 'Ingénieur'},
          ],
        },
      } as any;

      const result = getFieldValue(
        verifiableCredential,
        'title',
        mockWellknown,
        mockProps,
        mockDisplay as any,
        VCFormat.vc_sd_jwt,
      );

      expect(result).toBe('Engineer');
      expect(result).not.toBe('Ingénieur');
    });

    it('should return null for array of objects without language/value structure', () => {
      const verifiableCredential = {
        fullResolvedPayload: {
          credentials: [
            {id: '1', name: 'Cert1'},
            {id: '2', name: 'Cert2'},
          ],
        },
      } as any;

      const result = getFieldValue(
        verifiableCredential,
        'credentials',
        mockWellknown,
        mockProps,
        mockDisplay as any,
        VCFormat.vc_sd_jwt,
      );

      expect(result).toBeNull();
    });

    it('should return null for object values', () => {
      const verifiableCredential = {
        fullResolvedPayload: {address: {street: '123 Main St', city: 'TestCity'}},
      } as any;

      const result = getFieldValue(
        verifiableCredential,
        'address',
        mockWellknown,
        mockProps,
        mockDisplay as any,
        VCFormat.vc_sd_jwt,
      );

      expect(result).toBe("");
    });

    it('should handle nested array paths in SD-JWT', () => {
      const verifiableCredential = {
        fullResolvedPayload: {
          users: [
            {profile: {name: 'John'}},
            {profile: {name: 'Jane'}},
          ],
        },
      } as any;

      const result = getFieldValue(
        verifiableCredential,
        'users.profile.name',
        mockWellknown,
        mockProps,
        mockDisplay as any,
        VCFormat.vc_sd_jwt,
      );

      expect(result).toBe('John, Jane');
      expect(result.split(', ')).toEqual(['John', 'Jane']);
    });

    it('should handle undefined nested paths gracefully', () => {
      const verifiableCredential = {fullResolvedPayload: {user: {}}} as any;

      const result = getFieldValue(
        verifiableCredential,
        'user.profile.name',
        mockWellknown,
        mockProps,
        mockDisplay as any,
        VCFormat.vc_sd_jwt,
      );

      expect(result).toBeUndefined();
      expect(i18n.getLocalizedField).toHaveBeenCalledWith(undefined);
    });

    it('should work with dc_sd_jwt format', () => {
      const verifiableCredential = {
        fullResolvedPayload: {issuer: 'Test Issuer'},
      } as any;

      const result = getFieldValue(
        verifiableCredential,
        'issuer',
        mockWellknown,
        mockProps,
        mockDisplay as any,
        VCFormat.dc_sd_jwt,
      );

      expect(result).toBe('Test Issuer');
      expect(i18n.getLocalizedField).toHaveBeenCalledWith('Test Issuer');
    });

    it('should handle null values in path traversal', () => {
      const verifiableCredential = {fullResolvedPayload: {user: null}} as any;

      const result = getFieldValue(
        verifiableCredential,
        'user.profile.name',
        mockWellknown,
        mockProps,
        mockDisplay as any,
        VCFormat.vc_sd_jwt,
      );

      expect(result).toBeNull();
    });

    it('should convert non-string primitive values to string', () => {
      const verifiableCredential = {
        fullResolvedPayload: {age: 30, isActive: true},
      } as any;

      const resultAge = getFieldValue(
        verifiableCredential,
        'age',
        mockWellknown,
        mockProps,
        mockDisplay as any,
        VCFormat.vc_sd_jwt,
      );

      const resultActive = getFieldValue(
        verifiableCredential,
        'isActive',
        mockWellknown,
        mockProps,
        mockDisplay as any,
        VCFormat.vc_sd_jwt,
      );

      expect(resultAge).toBe('30');
      expect(resultActive).toBe('true');
      expect(i18n.getLocalizedField).toHaveBeenCalledWith('30');
      expect(i18n.getLocalizedField).toHaveBeenCalledWith('true');
    });
  });

  describe('Edge cases', () => {
    it('should handle missing credentialSubject', () => {
      const verifiableCredential = {
        credentialSubject: {},
      } as any;

      const result = getFieldValue(
        verifiableCredential,
        'fullName',
        mockWellknown,
        mockProps,
        mockDisplay as any,
        VCFormat.ldp_vc,
      );

      expect(i18n.getLocalizedField).toHaveBeenCalledWith(undefined);
      expect(i18n.getLocalizedField).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should handle missing fullResolvedPayload in SD-JWT', () => {
      const verifiableCredential = {} as any;

      const result = getFieldValue(
        verifiableCredential,
        'user.name',
        mockWellknown,
        mockProps,
        mockDisplay as any,
        VCFormat.vc_sd_jwt,
      );

      expect(i18n.getLocalizedField).toHaveBeenCalledWith(undefined);
      expect(i18n.getLocalizedField).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should handle missing props.vc for credentialRegistry', () => {
      const verifiableCredential = {
        credentialSubject: {},
      } as any;

      const propsWithoutVc = {};

      const result = getFieldValue(
        verifiableCredential,
        'credentialRegistry',
        mockWellknown,
        propsWithoutVc,
        mockDisplay as any,
        VCFormat.ldp_vc,
      );

      expect(result).toBeUndefined();
      expect(result).not.toBeNull();
      expect(typeof result).toBe('undefined');
    });

    it('should handle empty array', () => {
      const verifiableCredential = {
        credentialSubject: {
          emptyArray: [],
        },
      } as any;

      const result = getFieldValue(
        verifiableCredential,
        'emptyArray',
        mockWellknown,
        mockProps,
        mockDisplay as any,
        VCFormat.ldp_vc,
      );

      expect(result).toBe('');
      expect(typeof result).toBe('string');
      expect(result).toHaveLength(0);
      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
    });
  });
});
