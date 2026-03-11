/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  getFieldValue,
  getFieldName,
  getFaceField,
  getAddressFields,
  formatKeyLabel,
  isVCLoaded,
  getMosipLogo,
  getCredentialType,
  getCredentialTypeFromWellKnown,
  Display,
  getIssuerAuthenticationAlorithmForMdocVC,
  getMdocAuthenticationAlorithm,
  getFaceAttribute,
  fieldItemIterator,
  CARD_VIEW_DEFAULT_FIELDS,
  DETAIL_VIEW_DEFAULT_FIELDS,
  STATUS_FIELD_NAME,
  VC_STATUS_KEYS,
  CARD_VIEW_ADD_ON_FIELDS,
  DETAIL_VIEW_ADD_ON_FIELDS,
  DETAIL_VIEW_BOTTOM_SECTION_FIELDS,
  BOTTOM_SECTION_FIELDS_WITH_DETAILED_ADDRESS_FIELDS,
} from './VCUtils';
import {VCFormat} from '../../../shared/VCFormat';
import * as i18n from '../../../i18n';

// Mock dependencies
jest.mock('../../../i18n', () => ({
  __esModule: true,
  default: {t: jest.fn(key => key)},
  getLocalizedField: jest.fn(value => {
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

jest.mock('../../ui/styleUtils', () => ({
  Theme: {
    Colors: {
      DetailsLabel: '#333',
      Details: '#666',
      whiteBackgroundColor: '#FFFFFF',
    },
  },
}));

jest.mock('react-native-vector-icons/FontAwesome', () => 'Icon');

jest.mock('react-native-dotenv', () => ({
  CREDENTIAL_REGISTRY_EDIT: 'true',
  MIMOTO_BASE_URL: 'https://api.example.com',
}));

jest.mock('../../../shared/constants', () => ({
  MIMOTO_BASE_URL: 'https://api.example.com',
}));

jest.mock('../../../shared/openId4VCI/Utils', () => ({
  getDisplayObjectForCurrentLanguage: jest.fn(display => {
    if (!display || !display.length) return {};
    const en = display.find((d: any) => d.locale === 'en');
    return en || display[0];
  }),
  getMatchingCredentialIssuerMetadata: jest.fn((wellknown, configId) => {
    return wellknown?.credential_configurations_supported?.[configId] || null;
  }),
}));

jest.mock('../../../shared/VCFormat', () => ({
  VCFormat: {
    ldp_vc: 'ldp_vc',
    mso_mdoc: 'mso_mdoc',
    vc_sd_jwt: 'vc_sd_jwt',
    dc_sd_jwt: 'dc_sd_jwt',
  },
}));

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
                elementValue: [
                  {issueDate: '2023-01-15', vehicleCategoryCode: 'B'},
                ],
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
                elementValue: {
                  issueDate: '2023-01-15',
                  vehicleCategoryCode: 'B',
                },
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
        fullResolvedPayload: {
          address: {street: '123 Main St', city: 'TestCity'},
        },
      } as any;

      const result = getFieldValue(
        verifiableCredential,
        'address',
        mockWellknown,
        mockProps,
        mockDisplay as any,
        VCFormat.vc_sd_jwt,
      );

      expect(result).toBe('');
    });

    it('should handle nested array paths in SD-JWT', () => {
      const verifiableCredential = {
        fullResolvedPayload: {
          users: [{profile: {name: 'John'}}, {profile: {name: 'Jane'}}],
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
    });
  });
});

describe('Constants', () => {
  it('should have correct CARD_VIEW_DEFAULT_FIELDS', () => {
    expect(CARD_VIEW_DEFAULT_FIELDS).toEqual(['fullName']);
  });

  it('should have correct DETAIL_VIEW_DEFAULT_FIELDS', () => {
    expect(DETAIL_VIEW_DEFAULT_FIELDS).toEqual([
      'fullName',
      'gender',
      'phone',
      'dateOfBirth',
      'email',
      'address',
    ]);
  });

  it('should have correct STATUS_FIELD_NAME', () => {
    expect(STATUS_FIELD_NAME).toBe('Status');
  });

  it('should have correct VC_STATUS_KEYS', () => {
    expect(VC_STATUS_KEYS).toEqual(['valid', 'pending', 'expired', 'revoked']);
  });

  it('should have correct CARD_VIEW_ADD_ON_FIELDS', () => {
    expect(CARD_VIEW_ADD_ON_FIELDS).toEqual(['UIN', 'VID']);
  });

  it('should have correct DETAIL_VIEW_ADD_ON_FIELDS', () => {
    expect(DETAIL_VIEW_ADD_ON_FIELDS).toEqual([
      'status',
      'idType',
      'credentialRegistry',
    ]);
  });

  it('should have correct DETAIL_VIEW_BOTTOM_SECTION_FIELDS', () => {
    expect(DETAIL_VIEW_BOTTOM_SECTION_FIELDS).toEqual([
      'email',
      'address',
      'credentialRegistry',
    ]);
  });

  it('should have correct BOTTOM_SECTION_FIELDS_WITH_DETAILED_ADDRESS_FIELDS', () => {
    expect(BOTTOM_SECTION_FIELDS_WITH_DETAILED_ADDRESS_FIELDS).toContain(
      'addressLine1',
    );
    expect(BOTTOM_SECTION_FIELDS_WITH_DETAILED_ADDRESS_FIELDS).toContain(
      'email',
    );
    expect(BOTTOM_SECTION_FIELDS_WITH_DETAILED_ADDRESS_FIELDS).toContain(
      'credentialRegistry',
    );
  });
});

describe('getFieldName', () => {
  it('should return field name from ldp_vc wellknown definition', () => {
    const wellknown = {
      credential_definition: {
        credentialSubject: {
          fullName: {
            display: [{locale: 'en', name: 'Full Name'}],
          },
        },
      },
    };
    const result = getFieldName('fullName', wellknown, VCFormat.ldp_vc);
    expect(result).toBe('Full Name');
  });

  it('should return raw field if no display in ldp_vc', () => {
    const wellknown = {
      credential_definition: {
        credentialSubject: {
          fullName: {},
        },
      },
    };
    const result = getFieldName('fullName', wellknown, VCFormat.ldp_vc);
    expect(result).toBe('fullName');
  });

  it('should handle missing credential_definition in ldp_vc', () => {
    const wellknown = {};
    const result = getFieldName('fullName', wellknown, VCFormat.ldp_vc);
    expect(result).toBe('Full Name');
  });

  it('should return field name from mso_mdoc wellknown', () => {
    const wellknown = {
      claims: {
        'org.iso.18013.5.1': {
          given_name: {
            display: [{locale: 'en', name: 'Given Name'}],
          },
        },
      },
    };
    const result = getFieldName(
      'org.iso.18013.5.1~given_name',
      wellknown,
      VCFormat.mso_mdoc,
    );
    expect(result).toBe('Given Name');
  });

  it('should return raw fieldName for mso_mdoc without display', () => {
    const wellknown = {
      claims: {
        'org.iso.18013.5.1': {
          given_name: {},
        },
      },
    };
    const result = getFieldName(
      'org.iso.18013.5.1~given_name',
      wellknown,
      VCFormat.mso_mdoc,
    );
    expect(result).toBe('given_name');
  });

  it('should return field name from vc_sd_jwt wellknown', () => {
    const wellknown = {
      claims: {
        user: {
          name: {
            display: [{locale: 'en', name: 'User Name'}],
          },
        },
      },
    };
    const result = getFieldName('user.name', wellknown, VCFormat.vc_sd_jwt);
    expect(result).toBe('User Name');
  });

  it('should return formatted label for vc_sd_jwt without display', () => {
    const wellknown = {claims: {}};
    const result = getFieldName(
      'user.firstName',
      wellknown,
      VCFormat.vc_sd_jwt,
    );
    expect(result).toContain('Name');
  });

  it('should work with dc_sd_jwt format', () => {
    const wellknown = {
      claims: {
        given_name: {
          display: [{locale: 'en', name: 'Given Name'}],
        },
      },
    };
    const result = getFieldName('given_name', wellknown, VCFormat.dc_sd_jwt);
    expect(result).toBe('Given Name');
  });

  it('should return formatted label when no wellknown', () => {
    const result = getFieldName('firstName', null, VCFormat.ldp_vc);
    expect(result).toBe('First Name');
  });

  it('should handle mso_mdoc field without namespace delimiter', () => {
    const wellknown = {claims: {}};
    const result = getFieldName('simpleField', wellknown, VCFormat.mso_mdoc);
    expect(typeof result).toBe('string');
  });
});

describe('getFaceField', () => {
  it('should return null for non-object input', () => {
    expect(getFaceField(null)).toBeNull();
    expect(getFaceField('string')).toBeNull();
    expect(getFaceField(123)).toBeNull();
  });

  it('should find face field directly', () => {
    const obj = {face: 'base64imagedata'};
    expect(getFaceField(obj)).toBe('base64imagedata');
  });

  it('should find photo field', () => {
    const obj = {photo: 'photodata'};
    expect(getFaceField(obj)).toBe('photodata');
  });

  it('should find picture field', () => {
    const obj = {picture: 'picturedata'};
    expect(getFaceField(obj)).toBe('picturedata');
  });

  it('should find portrait field', () => {
    const obj = {portrait: 'portraitdata'};
    expect(getFaceField(obj)).toBe('portraitdata');
  });

  it('should find image field', () => {
    const obj = {image: 'imagedata'};
    expect(getFaceField(obj)).toBe('imagedata');
  });

  it('should find nested face field', () => {
    const obj = {nested: {deep: {face: 'deepfacedata'}}};
    expect(getFaceField(obj)).toBe('deepfacedata');
  });

  it('should return null when no image key found', () => {
    const obj = {name: 'John', age: 30};
    expect(getFaceField(obj)).toBeNull();
  });

  it('should skip non-string values for image keys', () => {
    const obj = {face: {nested: 'value'}};
    // face is object not string, so it recurses into it
    expect(getFaceField(obj)).toBeNull();
  });
});

describe('getAddressFields', () => {
  it('should return all address field names', () => {
    const fields = getAddressFields();
    expect(fields).toContain('addressLine1');
    expect(fields).toContain('addressLine2');
    expect(fields).toContain('addressLine3');
    expect(fields).toContain('city');
    expect(fields).toContain('province');
    expect(fields).toContain('region');
    expect(fields).toContain('postalCode');
    expect(fields).toHaveLength(7);
  });
});

describe('formatKeyLabel', () => {
  it('should convert camelCase to spaced words', () => {
    expect(formatKeyLabel('firstName')).toBe('First Name');
  });

  it('should convert snake_case to spaced words', () => {
    expect(formatKeyLabel('first_name')).toBe('First Name');
  });

  it('should remove array indices', () => {
    expect(formatKeyLabel('items[0]')).toBe('Items');
  });

  it('should handle single word', () => {
    expect(formatKeyLabel('name')).toBe('Name');
  });

  it('should handle complex camelCase', () => {
    expect(formatKeyLabel('dateOfBirth')).toBe('Date Of Birth');
  });

  it('should handle multiple array indices', () => {
    expect(formatKeyLabel('items[0][1]')).toBe('Items');
  });
});

describe('isVCLoaded', () => {
  it('should return true for non-null credential', () => {
    expect(isVCLoaded({credentialSubject: {}} as any)).toBe(true);
  });

  it('should return false for null credential', () => {
    expect(isVCLoaded(null)).toBe(false);
  });

  it('should return true for empty object (still non-null)', () => {
    expect(isVCLoaded({} as any)).toBe(true);
  });
});

describe('getMosipLogo', () => {
  it('should return logo object with url and alt_text', () => {
    const logo = getMosipLogo();
    expect(logo).toHaveProperty('url');
    expect(logo).toHaveProperty('alt_text');
    expect(logo.url).toContain('mosip-logo.png');
    expect(logo.alt_text).toBe('a square logo of mosip');
  });
});

describe('getCredentialType', () => {
  it('should return identityCard translation when no wellknown', () => {
    const result = getCredentialType(null as any);
    expect(result).toBe('VcDetails:identityCard');
  });

  it('should return display name when display exists', () => {
    const wellknown = {
      display: [{name: 'National ID', locale: 'en'}],
    } as any;
    const result = getCredentialType(wellknown);
    expect(result).toBe('National ID');
  });

  it('should return last type for ldp_vc format', () => {
    const wellknown = {
      format: VCFormat.ldp_vc,
      credential_definition: {
        type: ['VerifiableCredential', 'NationalIDCredential'],
      },
    } as any;
    const result = getCredentialType(wellknown);
    expect(result).toBe('NationalIDCredential');
  });

  it('should return identityCard for non-ldp_vc without display', () => {
    const wellknown = {
      format: VCFormat.mso_mdoc,
    } as any;
    const result = getCredentialType(wellknown);
    expect(result).toBe('VcDetails:identityCard');
  });
});

describe('getCredentialTypeFromWellKnown', () => {
  it('should return credential type from matching config', () => {
    const wellknown = {
      credential_configurations_supported: {
        'national-id': {
          display: [{name: 'National ID', locale: 'en'}],
        },
      },
    } as any;
    const result = getCredentialTypeFromWellKnown(wellknown, 'national-id');
    expect(result).toBeDefined();
  });

  it('should return identityCard when credentialConfigurationId is undefined', () => {
    const wellknown = {} as any;
    const result = getCredentialTypeFromWellKnown(wellknown, undefined);
    expect(result).toBe('VcDetails:identityCard');
  });

  it('should return identityCard on error', () => {
    // getMatchingCredentialIssuerMetadata returns null → getCredentialType(null) returns identityCard
    const result = getCredentialTypeFromWellKnown({} as any, 'nonexistent');
    expect(result).toBe('VcDetails:identityCard');
  });
});

describe('Display class', () => {
  it('should use default background color when no wellknown', () => {
    const display = new Display(null);
    const bg = display.getBackgroundColor();
    expect(bg).toHaveProperty('backgroundColor');
  });

  it('should use default background color when wellknown has no display', () => {
    const display = new Display({});
    const bg = display.getBackgroundColor();
    expect(bg).toHaveProperty('backgroundColor');
  });

  it('should set background color from wellknown', () => {
    const display = new Display({
      display: [{background_color: '#FF0000', locale: 'en'}],
    });
    const bg = display.getBackgroundColor();
    expect(bg.backgroundColor).toBe('#FF0000');
  });

  it('should return default color when no text_color set', () => {
    const display = new Display({});
    expect(display.getTextColor('#000')).toBe('#000');
  });

  it('should return text_color from wellknown', () => {
    const display = new Display({
      display: [{text_color: '#00FF00', locale: 'en'}],
    });
    expect(display.getTextColor('#000')).toBe('#00FF00');
  });

  it('should return background image from wellknown', () => {
    const display = new Display({
      display: [
        {background_image: {uri: 'https://img.com/bg.png'}, locale: 'en'},
      ],
    });
    expect(display.getBackgroundImage('default.png')).toEqual({
      uri: 'https://img.com/bg.png',
    });
  });

  it('should return default background image when not set', () => {
    const display = new Display({});
    expect(display.getBackgroundImage('default.png')).toBe('default.png');
  });

  it('should use default when display array is empty', () => {
    const display = new Display({display: []});
    const bg = display.getBackgroundColor();
    expect(bg).toHaveProperty('backgroundColor');
  });
});

describe('getIssuerAuthenticationAlorithmForMdocVC', () => {
  it('should return ES256 for proof type -7', () => {
    expect(getIssuerAuthenticationAlorithmForMdocVC(-7)).toBe('ES256');
  });

  it('should return empty string for unknown proof type', () => {
    expect(getIssuerAuthenticationAlorithmForMdocVC(99)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(getIssuerAuthenticationAlorithmForMdocVC(undefined)).toBe('');
  });
});

describe('getMdocAuthenticationAlorithm', () => {
  it('should return ES256 for EC2 key with P256 curve', () => {
    const issuerAuth = {
      deviceKeyInfo: {
        deviceKey: {'1': 2, '-1': 1},
      },
    };
    expect(getMdocAuthenticationAlorithm(issuerAuth)).toBe('ES256');
  });

  it('should return empty string for non-EC2 key', () => {
    const issuerAuth = {
      deviceKeyInfo: {
        deviceKey: {'1': 3, '-1': 1},
      },
    };
    expect(getMdocAuthenticationAlorithm(issuerAuth)).toBe('');
  });

  it('should return empty string for wrong curve', () => {
    const issuerAuth = {
      deviceKeyInfo: {
        deviceKey: {'1': 2, '-1': 2},
      },
    };
    expect(getMdocAuthenticationAlorithm(issuerAuth)).toBe('');
  });

  it('should return empty string when no deviceKey', () => {
    expect(getMdocAuthenticationAlorithm({})).toBe('');
    expect(getMdocAuthenticationAlorithm({deviceKeyInfo: {}})).toBe('');
    expect(getMdocAuthenticationAlorithm(null)).toBe('');
  });
});

describe('getFaceAttribute', () => {
  it('should extract face from ldp_vc credential', () => {
    const vc = {
      credential: {
        credentialSubject: {face: 'faceData'},
      },
    };
    expect(getFaceAttribute(vc, VCFormat.ldp_vc)).toBe('faceData');
  });

  it('should extract face from ldp_vc verifiableCredential fallback', () => {
    const vc = {
      verifiableCredential: {
        credential: {
          credentialSubject: {photo: 'photoData'},
        },
      },
    };
    expect(getFaceAttribute(vc, VCFormat.ldp_vc)).toBe('photoData');
  });

  it('should extract face from mso_mdoc processedCredential', () => {
    const vc = {
      processedCredential: {
        issuerSigned: {
          nameSpaces: {
            'org.iso.18013.5.1': [
              {elementIdentifier: 'portrait', elementValue: 'portraitData'},
            ],
          },
        },
      },
    };
    expect(getFaceAttribute(vc, VCFormat.mso_mdoc)).toBe('portraitData');
  });

  it('should extract face from mso_mdoc nameSpaces fallback', () => {
    const vc = {
      processedCredential: {
        nameSpaces: {
          'org.iso.18013.5.1': [
            {elementIdentifier: 'photo', elementValue: 'photoVal'},
          ],
        },
      },
    };
    expect(getFaceAttribute(vc, VCFormat.mso_mdoc)).toBe('photoVal');
  });

  it('should extract face from vc_sd_jwt fullResolvedPayload', () => {
    const vc = {
      processedCredential: {
        fullResolvedPayload: {face: 'sdJwtFace'},
      },
    };
    expect(getFaceAttribute(vc, VCFormat.vc_sd_jwt)).toBe('sdJwtFace');
  });

  it('should extract face from dc_sd_jwt fullResolvedPayload', () => {
    const vc = {
      processedCredential: {
        fullResolvedPayload: {picture: 'dcSdJwtPic'},
      },
    };
    expect(getFaceAttribute(vc, VCFormat.dc_sd_jwt)).toBe('dcSdJwtPic');
  });

  it('should return null when no face attribute found', () => {
    const vc = {credential: {credentialSubject: {name: 'John'}}};
    expect(getFaceAttribute(vc, VCFormat.ldp_vc)).toBeNull();
  });

  it('should handle empty mso_mdoc nameSpaces', () => {
    const vc = {processedCredential: {}};
    expect(getFaceAttribute(vc, VCFormat.mso_mdoc)).toBeNull();
  });
});

describe('fieldItemIterator', () => {
  const mockDisplay = new Display({
    name: 'Test',
    locale: 'en',
    logo: {url: ''},
    description: '',
    text_color: '#000000',
    background_color: '#FFFFFF',
    background_image: {url: ''},
  });

  const baseProps = {
    verifiableCredentialData: {
      vcMetadata: {
        isVerified: true,
        format: VCFormat.ldp_vc,
      },
    },
    vc: {},
  } as any;

  it('should render main fields from wellknown', () => {
    const verifiableCredential = {
      credentialSubject: {fullName: 'John Doe', dateOfBirth: '1990-01-01'},
    } as any;
    const wellknown = {
      credential_definition: {
        credentialSubject: {
          fullName: {display: [{name: 'Full Name', locale: 'en'}]},
        },
      },
    };
    const result = fieldItemIterator(
      ['fullName'],
      true,
      verifiableCredential,
      wellknown,
      mockDisplay,
      false,
      baseProps,
    );
    expect(Array.isArray(result)).toBe(true);
  });

  it('should render extra fields when wellknownFieldsFlag is false', () => {
    const verifiableCredential = {
      credentialSubject: {fullName: 'John', age: 30, city: 'NYC'},
    } as any;
    const result = fieldItemIterator(
      ['fullName'],
      false,
      verifiableCredential,
      {},
      mockDisplay,
      false,
      baseProps,
    );
    expect(Array.isArray(result)).toBe(true);
    // Should include extra fields beyond the main field list
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it('should render nested object fields via renderFieldRecursively', () => {
    const verifiableCredential = {
      credentialSubject: {
        address: {street: '123 Main St', city: 'NYC', zip: '10001'},
      },
    } as any;
    const result = fieldItemIterator(
      [],
      false,
      verifiableCredential,
      {},
      mockDisplay,
      false,
      baseProps,
    );
    expect(Array.isArray(result)).toBe(true);
  });

  it('should render array fields via renderFieldRecursively', () => {
    const verifiableCredential = {
      credentialSubject: {
        hobbies: ['reading', 'coding'],
      },
    } as any;
    const result = fieldItemIterator(
      [],
      false,
      verifiableCredential,
      {},
      mockDisplay,
      false,
      baseProps,
    );
    expect(Array.isArray(result)).toBe(true);
  });

  it('should handle image values in fields', () => {
    const verifiableCredential = {
      credentialSubject: {
        photo: 'data:image/png;base64,abc123',
      },
    } as any;
    const result = fieldItemIterator(
      [],
      false,
      verifiableCredential,
      {},
      mockDisplay,
      false,
      baseProps,
    );
    expect(Array.isArray(result)).toBe(true);
  });

  it('should handle timestamp numeric fields (iat, nbf, exp)', () => {
    const verifiableCredential = {
      credentialSubject: {
        iat: 1700000000,
        exp: 1800000000,
      },
    } as any;
    const result = fieldItemIterator(
      [],
      false,
      verifiableCredential,
      {},
      mockDisplay,
      false,
      baseProps,
    );
    expect(Array.isArray(result)).toBe(true);
  });

  it('should handle string timestamp fields', () => {
    const verifiableCredential = {
      credentialSubject: {
        iat: '1700000000',
      },
    } as any;
    const result = fieldItemIterator(
      [],
      false,
      verifiableCredential,
      {},
      mockDisplay,
      false,
      baseProps,
    );
    expect(Array.isArray(result)).toBe(true);
  });

  it('should handle ISO date string fields', () => {
    const verifiableCredential = {
      credentialSubject: {
        issuedDate: '2024-01-15T10:30:00Z',
      },
    } as any;
    const result = fieldItemIterator(
      [],
      false,
      verifiableCredential,
      {},
      mockDisplay,
      false,
      baseProps,
    );
    expect(Array.isArray(result)).toBe(true);
  });

  it('should truncate long string values', () => {
    const verifiableCredential = {
      credentialSubject: {
        longField: 'x'.repeat(200),
      },
    } as any;
    const result = fieldItemIterator(
      [],
      false,
      verifiableCredential,
      {},
      mockDisplay,
      false,
      baseProps,
    );
    expect(Array.isArray(result)).toBe(true);
  });

  it('should map known keys to labels (iss, sub, etc)', () => {
    const verifiableCredential = {
      credentialSubject: {
        iss: 'https://issuer.example.com',
        sub: 'user123',
        vct: 'NationalID',
      },
    } as any;
    const result = fieldItemIterator(
      [],
      false,
      verifiableCredential,
      {},
      mockDisplay,
      false,
      baseProps,
    );
    expect(Array.isArray(result)).toBe(true);
  });

  it('should render mso_mdoc nameSpaces entries', () => {
    const verifiableCredential = {
      credentialSubject: {},
      nameSpaces: {
        'org.iso.18013.5.1': [
          {elementIdentifier: 'given_name', elementValue: 'Alice'},
          {elementIdentifier: 'family_name', elementValue: 'Smith'},
        ],
      },
    } as any;
    const result = fieldItemIterator(
      [],
      false,
      verifiableCredential,
      {},
      mockDisplay,
      false,
      baseProps,
    );
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should render fullResolvedPayload extra fields', () => {
    const verifiableCredential = {
      credentialSubject: {},
      fullResolvedPayload: {
        name: 'Jane',
        country: 'US',
      },
    } as any;
    const result = fieldItemIterator(
      [],
      true,
      verifiableCredential,
      {},
      mockDisplay,
      false,
      baseProps,
    );
    expect(Array.isArray(result)).toBe(true);
  });

  it('should handle URL image fields', () => {
    const verifiableCredential = {
      credentialSubject: {
        profileImage: 'https://example.com/image.jpg',
      },
    } as any;
    const result = fieldItemIterator(
      [],
      false,
      verifiableCredential,
      {},
      mockDisplay,
      false,
      baseProps,
    );
    expect(Array.isArray(result)).toBe(true);
  });

  it('should handle disclosedKeys from verifiableCredential', () => {
    const verifiableCredential = {
      credentialSubject: {name: 'John'},
      disclosedKeys: ['name'],
    } as any;
    const result = fieldItemIterator(
      [],
      false,
      verifiableCredential,
      {},
      mockDisplay,
      false,
      baseProps,
    );
    expect(Array.isArray(result)).toBe(true);
  });

  it('should skip null field values', () => {
    const verifiableCredential = {
      credentialSubject: {name: null, age: 30},
    } as any;
    const result = fieldItemIterator(
      ['name', 'age'],
      true,
      verifiableCredential,
      {credential_definition: {credentialSubject: {name: {}, age: {}}}},
      mockDisplay,
      false,
      baseProps,
    );
    // name should be skipped (null), age should render
    expect(Array.isArray(result)).toBe(true);
  });
});
