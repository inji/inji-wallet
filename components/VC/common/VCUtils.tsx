import {
  Credential,
  CredentialSubject,
  CredentialTypes,
  IssuerWellknownResponse,
  VerifiableCredential,
} from '../../../machines/VerifiableCredential/VCMetaMachine/vc';
import i18n, {getLocalizedField} from '../../../i18n';
import {Row} from '../../ui';
import {Text} from 'react-native';
import {VCItemField} from './VCItemField';
import React from 'react';
import {Theme} from '../../ui/styleUtils';
import {CREDENTIAL_REGISTRY_EDIT} from 'react-native-dotenv';
import {VCVerification} from '../../VCVerification';
import {MIMOTO_BASE_URL} from '../../../shared/constants';
import {VCItemDetailsProps} from '../Views/VCDetailView';
import {
  getDisplayObjectForCurrentLanguage,
  getMatchingCredentialIssuerMetadata,
} from '../../../shared/openId4VCI/Utils';
import {VCFormat} from '../../../shared/VCFormat';
import {displayType} from '../../../machines/Issuers/IssuersMachine';
import {Image} from 'react-native-elements/dist/image/Image';
import Icon from 'react-native-vector-icons/FontAwesome';
export const CARD_VIEW_DEFAULT_FIELDS = ['fullName'];
export const DETAIL_VIEW_DEFAULT_FIELDS = [
  'fullName',
  'gender',
  'phone',
  'dateOfBirth',
  'email',
  'address',
];

export const STATUS_FIELD_NAME = 'Status';
export const VC_STATUS_KEYS = ['valid', 'pending', 'expired', 'revoked'];

//todo UIN & VID to be removed once we get the fields in the wellknown endpoint
export const CARD_VIEW_ADD_ON_FIELDS = ['UIN', 'VID'];
export const DETAIL_VIEW_ADD_ON_FIELDS = [
  'status',
  'idType',
  'credentialRegistry',
];

export const DETAIL_VIEW_BOTTOM_SECTION_FIELDS = [
  'email',
  'address',
  'credentialRegistry',
];

export const BOTTOM_SECTION_FIELDS_WITH_DETAILED_ADDRESS_FIELDS = [
  ...getAddressFields(),
  'email',
  'credentialRegistry',
];

function iterateMsoMdocFor(
  credential,
  namespace: string,
  element: 'elementIdentifier' | 'elementValue',
  fieldName: string,
) {
  const foundItem = credential['issuerSigned']['nameSpaces'][namespace].find(
    element => {
      return element.elementIdentifier === fieldName;
    },
  );
  return foundItem[element];
}

export const getFieldValue = (
  verifiableCredential: Credential,
  field: string,
  wellknown: any,
  props: any,
  display: Display,
  format: string,
) => {
  switch (field) {
    case 'status':
      return (
        <VCVerification
          display={display}
          vcMetadata={props.verifiableCredentialData.vcMetadata}
        />
      );
    case 'idType':
      return getCredentialType(wellknown);
    case 'credentialRegistry':
      return props?.vc?.credentialRegistry;
    case 'address':
      return getLocalizedField(
        getFullAddress(verifiableCredential?.credentialSubject),
      );
    default: {
      if (format === VCFormat.ldp_vc) {
        const fieldValue = verifiableCredential?.credentialSubject[field];
        if (Array.isArray(fieldValue) && typeof fieldValue[0] !== 'object') {
          return fieldValue.join(', ');
        }
        return getLocalizedField(fieldValue);
      } else if (format === VCFormat.mso_mdoc) {
        const splitField = field.split('~');
        if (splitField.length > 1) {
          const [namespace, fieldName] = splitField;
          return iterateMsoMdocFor(
            verifiableCredential,
            namespace,
            'elementValue',
            fieldName,
          );
        }
      } else if (
        format === VCFormat.vc_sd_jwt ||
        format === VCFormat.dc_sd_jwt
      ) {
        const fieldParts = field.split('.');
        let value: any = verifiableCredential?.fullResolvedPayload;

        for (let i = 0; i < fieldParts.length; i++) {
          const part = fieldParts[i];

          if (!value) break;

          value = value[part];

          // If we hit an array and we still have more path to go...
          if (Array.isArray(value) && i < fieldParts.length - 1) {
            const remainingPath = fieldParts.slice(i + 1);
            value = value.map(item => {
              let inner = item;
              for (const p of remainingPath) {
                inner = inner?.[p];
              }
              return inner;
            });
            break;
          }
        }

        if (Array.isArray(value) && typeof value[0] !== 'object') {
          return value.join(', ');
        }

        if (Array.isArray(value) && typeof value[0] === 'object') {
          if ('language' in value[0] && 'value' in value[0]) {
            return getLocalizedField(value);
          } else return null;
        }

        if (typeof value === 'object' && !Array.isArray(value)) {
          return null;
        }
        return getLocalizedField(value?.toString());
      }
    }
  }
};

export const getFieldName = (
  field: string,
  wellknown: any,
  format: string,
): string => {
  if (wellknown) {
    if (format === VCFormat.ldp_vc) {
      const credentialDefinition = wellknown.credential_definition;
      if (!credentialDefinition) {
        console.error(
          'Credential definition is not available for the selected credential type',
        );
      }
      const fieldObj = credentialDefinition?.credentialSubject?.[field];
      if (fieldObj) {
        if (fieldObj.display && fieldObj.display.length > 0) {
          const newFieldObj = fieldObj.display.map(obj => ({
            language: obj.locale,
            value: obj.name,
          }));
          return getLocalizedField(newFieldObj);
        }
        return field;
      }
    } else if (format === VCFormat.mso_mdoc) {
      const splitField = field.split('~');
      if (splitField.length > 1) {
        const [namespace, fieldName] = splitField;
        const fieldObj = wellknown.claims?.[namespace]?.[fieldName];
        if (fieldObj) {
          if (fieldObj.display && fieldObj.display.length > 0) {
            const newFieldObj = fieldObj.display.map(obj => ({
              language: obj.locale,
              value: obj.name,
            }));
            return getLocalizedField(newFieldObj);
          }
          return fieldName;
        }
      }
    } else if (format === VCFormat.vc_sd_jwt || format === VCFormat.dc_sd_jwt) {
      const pathParts = field.split('.');
      let currentObj = wellknown.claims;
      for (const part of pathParts) {
        if (!currentObj || typeof currentObj !== 'object') break;
        currentObj = currentObj[part];
      }

      if (
        currentObj &&
        typeof currentObj === 'object' &&
        currentObj.display &&
        Array.isArray(currentObj.display)
      ) {
        const newFieldObj = currentObj.display.map((obj: any) => ({
          language: obj.locale,
          value: obj.name,
        }));
        return getLocalizedField(newFieldObj);
      }

      return formatKeyLabel(pathParts[pathParts.length - 1]);
    }
  }
  return formatKeyLabel(field);
};

const ID = ['id'];

const IMAGE_KEYS = ['face', 'photo', 'picture', 'portrait', 'image'];

const EXCLUDED_FIELDS_FOR_RENDERING = [...ID, ...IMAGE_KEYS, 'cnf'];

const shouldExcludeField = (field: string): boolean => {
  const normalized = field.includes('~')
    ? field.split('~')[1]
    : field.includes('.') || field.includes('[')
    ? field
        .split('.')
        .pop()
        ?.replace(/\[\d+\]/g, '') ?? field
    : field;

  return EXCLUDED_FIELDS_FOR_RENDERING.includes(normalized);
};

export function getFaceField(obj: any): string | null {
  if (typeof obj !== 'object' || obj === null) return null;

  for (const [key, value] of Object.entries(obj)) {
    const normalizedKey = key.toLowerCase();
    if (IMAGE_KEYS.includes(normalizedKey) && typeof value === 'string') {
      return value;
    }

    if (typeof value === 'object') {
      const found = getFaceField(value);
      if (found) return found;
    }
  }

  return null;
}

export function getAddressFields() {
  return [
    'addressLine1',
    'addressLine2',
    'addressLine3',
    'city',
    'province',
    'region',
    'postalCode',
  ];
}

function getFullAddress(credential: CredentialSubject) {
  if (!credential) {
    return '';
  }

  const fields = getAddressFields();

  return fields
    .map(field => getLocalizedField(credential[field]))
    .filter(Boolean)
    .join(', ');
}
export const formatKeyLabel = (key: string): string => {
  return key
    .replace(/\[\d+\]/g, '') // Remove [0], [1], etc.
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase → spaced
    .split(/[_\s]+/) // snake_case → spaced
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const renderFieldRecursively = (
  key: string,
  value: any,
  fieldNameColor: string,
  fieldValueColor: string,
  parentKey = '',
  depth = 0,
  renderedFields: Set<string>,
  disclosedKeys: string[],
): JSX.Element[] => {
  const fullKey = parentKey ? `${parentKey}.${key}` : key;
  let shortKey =
    fullKey
      .split('.')
      .pop()
      ?.replace(/\[\d+\]/g, '') ?? key;
  if (renderedFields.has(fullKey)) return [];
  if (shouldExcludeField(shortKey)) return [];

  if (value === null || value === undefined) return [];

  // Handle arrays
  if (Array.isArray(value)) {
    const label = formatKeyLabel(key);
    const arrayFullKey = fullKey;
    const isArrayDisclosed = disclosedKeys.includes(arrayFullKey);

    return value.flatMap((item, index) => {
      const itemKey = `${key}[${index}]`;
      const itemFullKey = parentKey ? `${parentKey}.${itemKey}` : itemKey;
      const isItemDisclosed = disclosedKeys.includes(itemFullKey);
      const showDisclosureIcon = isArrayDisclosed || isItemDisclosed;

      return [
        <Row
          key={`section-${itemFullKey}`}
          align="flex-start"
          style={{
            marginTop: 8,
            marginBottom: 4,
          }}>
          <Text
            style={{
              paddingLeft: depth * 12,
              fontWeight: '600',
              color: fieldNameColor,
            }}>
            • {label} {value.length > 1 ? index + 1 : ''}
          </Text>
          {showDisclosureIcon && (
            <Icon
              name="share-square-o"
              size={14}
              color="#666"
              style={{marginLeft: 2}}
            />
          )}
        </Row>,
        ...renderFieldRecursively(
          itemKey,
          item,
          fieldNameColor,
          fieldValueColor,
          parentKey,
          depth + 1,
          renderedFields,
          disclosedKeys,
        ),
      ];
    });
  }

  // Handle objects
  if (typeof value === 'object') {
    return Object.entries(value).flatMap(([childKey, childValue]) =>
      renderFieldRecursively(
        childKey,
        childValue,
        fieldNameColor,
        fieldValueColor,
        fullKey,
        depth + 1,
        renderedFields,
        disclosedKeys,
      ),
    );
  }

  // Handle primitive values
  let displayValue: string | JSX.Element = String(value);

  // Image rendering
  if (typeof value === 'string' && value.startsWith('data:image')) {
    displayValue = (
      <Image
        source={{uri: value}}
        style={{width: 100, height: 100, borderRadius: 8}}
        resizeMode="contain"
      />
    );
  } else if (
    value?.startsWith?.('http') &&
    key.toLowerCase().includes('image')
  ) {
    displayValue = (
      <Image
        source={{uri: value}}
        style={{width: 100, height: 100, borderRadius: 8}}
        resizeMode="contain"
      />
    );
  } else if (
    typeof value === 'number' &&
    ['iat', 'nbf', 'exp'].includes(shortKey.toLowerCase())
  ) {
    displayValue = new Date(value * 1000).toLocaleString();
  } else if (
    typeof value === 'string' &&
    /^\d+$/.test(value) &&
    ['iat', 'nbf', 'exp'].includes(shortKey.toLowerCase())
  ) {
    const timestamp = Number.parseInt(value, 10);
    displayValue = new Date(timestamp * 1000).toLocaleString();
  } else if (/^\d{4}-\d{2}-\d{2}T/.test(displayValue)) {
    const date = new Date(displayValue);
    displayValue = date.toLocaleString();
  } else if (displayValue.length > 100) {
    displayValue = displayValue.slice(0, 60) + '...';
  }

  const publicKeyLabelMap: Record<string, string> = {
    iss: 'Issuer',
    sub: 'Subject',
    aud: 'Audience',
    exp: 'Expires At',
    nbf: 'Not Before',
    iat: 'Issued At',
    jti: 'JWT ID',
    vct: 'Verifiable Credential Type',
  };

  if (shortKey in publicKeyLabelMap) {
    shortKey = publicKeyLabelMap[shortKey];
  }
  const label = formatKeyLabel(shortKey);
  const isDisclosed = disclosedKeys.includes(fullKey);
  return [
    <Row
      key={`extra-${fullKey}`}
      style={{
        flexDirection: 'row',
        flex: 1,
        paddingLeft: depth * 12,
      }}
      align="space-between"
      margin="0 8 15 0">
      <VCItemField
        key={`extra-${fullKey}`}
        fieldName={label}
        fieldValue={displayValue}
        fieldNameColor={fieldNameColor}
        fieldValueColor={fieldValueColor}
        testID={`extra-${fullKey}`}
        isDisclosed={isDisclosed}
      />
    </Row>,
  ];
};

export const fieldItemIterator = (
  fields: any[],
  wellknownFieldsFlag: boolean,
  verifiableCredential: VerifiableCredential | Credential,
  wellknown: any,
  display: Display,
  isBottomSectionFields: boolean,
  props: VCItemDetailsProps,
): JSX.Element[] => {
  const fieldNameColor = display.getTextColor(Theme.Colors.DetailsLabel);
  const fieldValueColor = display.getTextColor(Theme.Colors.Details);
  const disclosedKeys = verifiableCredential.disclosedKeys || [];
  const renderedFields = new Set<string>();

  const renderedMainFields = fields.map(field => {
    const fieldName = getFieldName(
      field,
      wellknown,
      props.verifiableCredentialData.vcMetadata.format,
    );
    const fieldValue = getFieldValue(
      verifiableCredential,
      field,
      wellknown,
      props,
      display,
      props.verifiableCredentialData.vcMetadata.format,
    );
    if (fieldValue == null) {
      return null;
    }
    renderedFields.add(field);

    if (
      (field === 'credentialRegistry' &&
        CREDENTIAL_REGISTRY_EDIT === 'false') ||
      !fieldValue
    ) {
      return null;
    }

    const isDisclosed = disclosedKeys.includes(field);
    return (
      <Row
        key={field}
        style={{flexDirection: 'row', flex: 1}}
        align="space-between"
        margin="0 8 15 0">
        <VCItemField
          key={field}
          fieldName={fieldName}
          fieldValue={fieldValue}
          fieldNameColor={fieldNameColor}
          fieldValueColor={fieldValueColor}
          testID={field}
          isDisclosed={isDisclosed}
        />
      </Row>
    );
  });

  let renderedExtraFields: JSX.Element[] = [];
  DETAIL_VIEW_BOTTOM_SECTION_FIELDS.forEach(item => renderedFields.add(item));
  if (
    !wellknownFieldsFlag ||
    (verifiableCredential.fullResolvedPayload && !isBottomSectionFields)
  ) {
    const renderedAll: JSX.Element[] = [];

    //  Extra fields from credentialSubject
    const credentialSubjectFields =
      (verifiableCredential.credentialSubject as Record<string, any>) ||
      verifiableCredential.fullResolvedPayload ||
      {};
    const renderedSubjectFields = Object.entries(credentialSubjectFields)
      .filter(([key]) => !renderedFields.has(key))
      .flatMap(([key, value]) =>
        renderFieldRecursively(
          key,
          value,
          fieldNameColor,
          fieldValueColor,
          '',
          0,
          renderedFields,
          disclosedKeys,
        ),
      );

    renderedAll.push(...renderedSubjectFields);

    //  Render fields from nameSpaces (mso_mdoc)
    const nameSpaces: Record<string, any> =
      verifiableCredential.nameSpaces ??
      verifiableCredential.issuerSigned?.nameSpaces ??
      verifiableCredential.issuerAuth?.nameSpaces ??
      {};

    const renderedNamespaceFields = Object.entries(nameSpaces).flatMap(
      ([namespace, entries]) => {
        if (!Array.isArray(entries)) return [];

        return [
          <VCItemField
            key={`ns-title-${namespace}`}
            fieldName={namespace}
            fieldValue=""
            fieldNameColor={fieldNameColor}
            fieldValueColor={fieldValueColor}
            testID={`ns-title-${namespace}`}
          />,
          ...entries.flatMap((entry, index) =>
            renderFieldRecursively(
              entry.elementIdentifier,
              entry.elementValue,
              fieldNameColor,
              fieldValueColor,
              namespace,
              1,
              renderedFields,
              disclosedKeys,
            ),
          ),
        ];
      },
    );

    renderedAll.push(...renderedNamespaceFields);
    renderedExtraFields = renderedAll;
  }

  return [...renderedMainFields, ...renderedExtraFields];
};

export const isVCLoaded = (verifiableCredential: Credential | null) => {
  return verifiableCredential != null;
};

export const getMosipLogo = () => {
  return {
    url: `${MIMOTO_BASE_URL}/inji/mosip-logo.png`,
    alt_text: 'a square logo of mosip',
  };
};

/**
 *
 * @param wellknown (either supportedCredential's wellknown or whole well known response of issuer)
 * @param credentialConfigurationId
 * @returns credential type translations (Eg - National ID)
 *
 */
export const getCredentialType = (
  supportedCredentialsWellknown: CredentialTypes,
): string => {
  if (!supportedCredentialsWellknown) {
    return i18n.t('VcDetails:identityCard');
  }
  if (supportedCredentialsWellknown['display']) {
    const wellknownDisplayProperty = getDisplayObjectForCurrentLanguage(
      supportedCredentialsWellknown.display,
    );
    return wellknownDisplayProperty.name;
  }
  if (supportedCredentialsWellknown.format === VCFormat.ldp_vc) {
    const types = supportedCredentialsWellknown.credential_definition
      .type as string[];
    return types[types.length - 1];
  } else {
    return i18n.t('VcDetails:identityCard');
  }
};

export const getCredentialTypeFromWellKnown = (
  wellknown: IssuerWellknownResponse,
  credentialConfigurationId: string | undefined = undefined,
): string => {
  try {
    if (credentialConfigurationId !== undefined) {
      const supportedCredentialsWellknown = getMatchingCredentialIssuerMetadata(
        wellknown,
        credentialConfigurationId,
      );
      return getCredentialType(supportedCredentialsWellknown);
    }
    console.error(
      'credentialConfigurationId not available for fetching the Credential type',
    );
    throw new Error(
      `Invalid credentialConfigurationId - ${credentialConfigurationId} passed`,
    );
  } catch (error) {
    return i18n.t('VcDetails:identityCard');
  }
};

export class Display {
  private readonly textColor: string | undefined = undefined;
  private readonly backgroundColor: {backgroundColor: string};
  private readonly backgroundImage: {uri: string} | undefined = undefined;

  private defaultBackgroundColor = Theme.Colors.whiteBackgroundColor;

  constructor(wellknown: any) {
    const wellknownDisplayProperty = wellknown?.display
      ? getDisplayObjectForCurrentLanguage(wellknown.display)
      : {};

    if (!Object.keys(wellknownDisplayProperty).length) {
      this.backgroundColor = {
        backgroundColor: this.defaultBackgroundColor,
      };
      return;
    }

    const display = wellknownDisplayProperty as displayType;

    this.backgroundColor = {
      backgroundColor: display.background_color ?? this.defaultBackgroundColor,
    };
    this.backgroundImage = display.background_image;
    this.textColor = display.text_color;
  }

  getTextColor(defaultColor: string): string {
    return this.textColor ?? defaultColor;
  }

  getBackgroundColor(): {backgroundColor: string} {
    return this.backgroundColor;
  }

  getBackgroundImage(defaultBackgroundImage: string) {
    return this.backgroundImage ?? defaultBackgroundImage;
  }
}

export function getIssuerAuthenticationAlorithmForMdocVC(
  proofType: any,
): string {
  return PROOF_TYPE_ALGORITHM_MAP[proofType] || '';
}

export function getMdocAuthenticationAlorithm(issuerAuth: any): string {
  const deviceKey = issuerAuth?.deviceKeyInfo?.deviceKey;

  if (!deviceKey) return '';

  const keyType = deviceKey['1'];
  const curve = deviceKey['-1'];

  return keyType === ProtectedAlgorithm.EC2 && curve === ProtectedCurve.P256
    ? 'ES256'
    : '';
}

const ProtectedAlgorithm = {
  EC2: 2,
};

const ProtectedCurve = {
  P256: 1,
};

const PROOF_TYPE_ALGORITHM_MAP = {
  [-7]: 'ES256',
};

export function getFaceAttribute(verifiableCredential, format) {
  let credentialSubject = {};
  if (format === VCFormat.ldp_vc) {
    credentialSubject =
      verifiableCredential?.credential?.credentialSubject ??
      verifiableCredential?.verifiableCredential.credential.credentialSubject ??
      {};
  } else if (format === VCFormat.mso_mdoc) {
    const nameSpaces =
      verifiableCredential?.processedCredential?.issuerSigned?.nameSpaces ??
      verifiableCredential?.processedCredential?.nameSpaces ??
      {};
    credentialSubject = Object.values(nameSpaces)
      .flat()
      .reduce((acc, item) => {
        const key = item.elementIdentifier;
        const value = item.elementValue;
        acc[key] = value;
        return acc;
      }, {} as Record<string, any>);
  } else if (format === VCFormat.vc_sd_jwt || format === VCFormat.dc_sd_jwt) {
    credentialSubject =
      verifiableCredential?.processedCredential?.fullResolvedPayload ?? {};
  }
  const faceField = getFaceField(credentialSubject);

  return faceField;
}
