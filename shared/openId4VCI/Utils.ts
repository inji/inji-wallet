import base64url from 'base64url';
import i18next from 'i18next';
import jose from 'node-jose';
import {NativeModules} from 'react-native';
import {vcVerificationBannerDetails} from '../../components/BannerNotificationContainer';
import {VCProcessor} from '../../components/VC/common/VCProcessor';
import {
  BOTTOM_SECTION_FIELDS_WITH_DETAILED_ADDRESS_FIELDS,
  DETAIL_VIEW_ADD_ON_FIELDS,
  DETAIL_VIEW_BOTTOM_SECTION_FIELDS,
  getCredentialTypeFromWellKnown,
} from '../../components/VC/common/VCUtils';
import {displayType} from '../../machines/Issuers/IssuersMachine';
import {
  Credential,
  CredentialWrapper,
  VerifiableCredential,
} from '../../machines/VerifiableCredential/VCMetaMachine/vc';
import getAllConfigurations, {CACHED_API} from '../api';
import {
  ED25519_PROOF_SIGNING_ALGO,
  isAndroid,
  JWT_ALG_TO_KEY_TYPE,
  KEY_TYPE_TO_JWT_ALG,
} from '../constants';
import {getJWT} from '../cryptoutil/cryptoUtil';
import {verifyCredential} from '../vcjs/verifyCredential';
import {getVerifiableCredential} from '../../machines/VerifiableCredential/VCItemMachine/VCItemSelectors';
import {getErrorEventData, sendErrorEvent} from '../telemetry/TelemetryUtils';
import {TelemetryConstants} from '../telemetry/TelemetryConstants';
import {KeyTypes} from '../cryptoutil/KeyTypes';
import {VCFormat} from '../VCFormat';
import {UnsupportedVcFormat} from '../error/UnsupportedVCFormat';
import {VCMetadata} from '../VCMetadata';

export const Protocols = {
  OpenId4VCI: 'OpenId4VCI',
  OTP: 'OTP',
};

export const Issuers = {
  MosipOtp: 'MosipOtp',
  Mosip: 'Mosip',
};

export function getVcVerificationDetails(
  statusType,
  vcMetadata: VCMetadata,
): vcVerificationBannerDetails {
  const credentialType = vcMetadata.credentialType
  return {
    statusType: statusType,
    isRevoked:vcMetadata.isRevoked,
    isExpired: vcMetadata.isExpired,
    vcType: credentialType,
  };
}

export const ACTIVATION_NEEDED = [Issuers.Mosip, Issuers.MosipOtp];

export const isActivationNeeded = (issuer: string) => {
  return ACTIVATION_NEEDED.indexOf(issuer) !== -1;
};

export const Issuers_Key_Ref = 'OpenId4VCI_KeyPair';

export const updateCredentialInformation = async (
  context: any,
  credential: VerifiableCredential,
): Promise<CredentialWrapper> => {
  let processedCredential;
  if (context.selectedCredentialType.format === VCFormat.mso_mdoc) {
    processedCredential = await VCProcessor.processForRendering(
      credential,
      context.selectedCredentialType.format,
    );
  }
  if( context.selectedCredentialType.format === VCFormat.vc_sd_jwt || context.selectedCredentialType.format === VCFormat.dc_sd_jwt) {
    processedCredential = await VCProcessor.processForRendering(
      credential,
      context.selectedCredentialType.format,
    )
  }
  let verifiableCredential;
  try {
    verifiableCredential = {
      ...credential,
      credentialConfigurationId: context.selectedCredentialType.id,
      issuerLogo: getDisplayObjectForCurrentLanguage(
        context.selectedIssuer.display,
      )?.logo ?? "",
      processedCredential,
    };
  } catch (e) {
    console.error(
      'Error occurred while processing credential for rendering',
      e,
    );
  }

  return {
    verifiableCredential,
    format: context.selectedCredentialType.format,
    generatedOn: new Date(),
    vcMetadata: {
      ...context.vcMetadata,
      format: context.selectedCredentialType.format,
    },
  };
};

export const getDisplayObjectForCurrentLanguage = (
  display: displayType[],
): displayType => {
  const currentLanguage = i18next.language;
  if (!display || display.length === 0) {
    return {} as displayType;
  }
  const languageKey = Object.keys(display[0]).includes('language')
    ? 'language'
    : 'locale';
  let displayType = display.filter(
    obj => obj[languageKey] == currentLanguage,
  )[0];
  if (!displayType) {
    displayType =
      display.filter(obj => obj[languageKey] === 'en')[0] ||
      display.filter(obj => obj[languageKey] === 'en-US')[0] ||
      display[0];
  }
  return displayType;
};

export const getCredentialIssuersWellKnownConfig = async (
  issuerCacheKey: string | undefined,
  defaultFields: string[],
  credentialConfigurationId: string,
  format: string,
  issuerHost: string,
) => {
  let fields: string[] = defaultFields;
  let wellknownFieldsFlag = false;
  let matchingWellknownDetails: any;
  const wellknownResponse = await CACHED_API.fetchIssuerWellknownConfig(
    issuerCacheKey!,
    issuerHost,
    true,
  );
  try {
    if (wellknownResponse) {
      matchingWellknownDetails = getMatchingCredentialIssuerMetadata(
        wellknownResponse,
        credentialConfigurationId,
      );
      if (
        matchingWellknownDetails.order != null &&
        matchingWellknownDetails.order.length > 0
      ) {
        fields = matchingWellknownDetails.order;
      } else {
        if (format === VCFormat.mso_mdoc) {
          fields = [];
          Object.keys(matchingWellknownDetails.claims).forEach(namespace => {
            Object.keys(matchingWellknownDetails.claims[namespace]).forEach(
              claim => {
                fields.concat(`${namespace}~${claim}`);
              },
            );
          });
        } else if (format === VCFormat.ldp_vc) {
          const ldpFields = Object.keys(
            matchingWellknownDetails.credential_definition.credentialSubject,
          );
          if (ldpFields.length > 0) {
            fields = ldpFields;
            wellknownFieldsFlag = true;
          }
        }
        else if( format === VCFormat.vc_sd_jwt || format === VCFormat.dc_sd_jwt) {
          const sdJwtFields = flattenClaimPaths(matchingWellknownDetails.claims);

          if (sdJwtFields.length > 0) {
            fields = sdJwtFields;
            wellknownFieldsFlag = true
          }
        }
        else {
          console.error(`Unsupported credential format - ${format} found`);
          throw new UnsupportedVcFormat(format);
        }
      }
    }
  } catch (error) {
    console.error(
      `Error occurred while parsing well-known response of credential type - ${credentialConfigurationId} so returning default fields only. Error is `,
      error.toString(),
    );
    return {
      matchingCredentialIssuerMetadata: matchingWellknownDetails,
      fields: fields,
      wellknownFieldsFlag: false,
    };
  }
  return {
    matchingCredentialIssuerMetadata: matchingWellknownDetails,
    wellknownResponse,
    fields: fields,
    wellknownFieldsFlag:
      wellknownFieldsFlag || matchingWellknownDetails?.order?.length > 0,
  };
};
const flattenClaimPaths = (
  claims: Record<string, any>,
  prefix = '',
): string[] => {
  return Object.entries(claims).flatMap(([key, value]) => {
    const currentPath = prefix ? `${prefix}.${key}` : key;

    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      Object.keys(value).some(k => typeof value[k] === 'object')
    ) {
      // Has nested objects inside, so recurse
      return flattenClaimPaths(value, currentPath);
    } else {
      // Either a primitive or an empty object or a leaf with no metadata
      return [currentPath];
    }
  });
};


export const getDetailedViewFields = async (
  issuerCacheKey: string,
  credentialConfigurationId: string,
  defaultFields: string[],
  format: string,
  issuerHost: string,
) => {
  let response = await getCredentialIssuersWellKnownConfig(
    issuerCacheKey,
    defaultFields,
    credentialConfigurationId,
    format,
    issuerHost,
  );

  let updatedFieldsList = response.fields.concat(DETAIL_VIEW_ADD_ON_FIELDS);

  updatedFieldsList = removeBottomSectionFields(updatedFieldsList,format);
  return {
    matchingCredentialIssuerMetadata: response.matchingCredentialIssuerMetadata,
    fields: updatedFieldsList,
    wellknownFieldsFlag: response.wellknownFieldsFlag,
    wellknownResponse: response.wellknownResponse,
  };
};

export const removeBottomSectionFields = (fields, format) => {
  if (format === VCFormat.vc_sd_jwt || format === VCFormat.dc_sd_jwt) {
    return fields.filter(
      fieldName => !DETAIL_VIEW_BOTTOM_SECTION_FIELDS.includes(fieldName),
    );
  }

  return fields.filter(
    fieldName =>
      !BOTTOM_SECTION_FIELDS_WITH_DETAILED_ADDRESS_FIELDS.includes(fieldName) &&
      fieldName !== 'address',
  );
};

export const vcDownloadTimeout = async (): Promise<number> => {
  const response = await getAllConfigurations();

  return Number(response['openId4VCIDownloadVCTimeout']) || 30000;
};

// OIDCErrors is a collection of external errors from the OpenID library or the issuer
export const OIDCErrors = {
  OIDC_FLOW_CANCELLED_ANDROID: 'User cancelled flow',
  OIDC_FLOW_CANCELLED_IOS: 'org.openid.appauth.general error -3',

  INVALID_TOKEN_SPECIFIED: 'Invalid token specified',
  OIDC_CONFIG_ERROR_PREFIX: 'Config error',

  AUTHORIZATION_ENDPOINT_DISCOVERY: {
    GRANT_TYPE_NOT_SUPPORTED: 'Grant type not supported by Wallet',
    FAILED_TO_FETCH_AUTHORIZATION_ENDPOINT:
      'Failed to fetch authorization endpoint or grant type not supported by wallet',
  },
};

// ErrorMessage is the type of error message shown in the UI

export enum ErrorMessage {
  NO_INTERNET = 'noInternetConnection',
  GENERIC = 'generic',
  REQUEST_TIMEDOUT = 'technicalDifficulty',
  BIOMETRIC_CANCELLED = 'biometricCancelled',
  TECHNICAL_DIFFICULTIES = 'technicalDifficulty',
  CREDENTIAL_TYPE_DOWNLOAD_FAILURE = 'credentialTypeListDownloadFailure',
  AUTHORIZATION_GRANT_TYPE_NOT_SUPPORTED = 'authorizationGrantTypeNotSupportedByWallet',
  NETWORK_REQUEST_FAILED = 'networkRequestFailed',
}

export async function constructProofJWT(
  publicKey: any,
  privateKey: any,
  selectedIssuer: string,
  client_id: string | null,
  keyType: string,
  proofSigningAlgosSupported: string[] = [],
  isCredentialOfferFlow: boolean,
  cNonce?: string,
): Promise<string> {
  const jwk = await getJWK(publicKey, keyType);
  const nonce = cNonce;
  const alg =
    keyType === KeyTypes.ED25519
      ? resolveEd25519Alg(proofSigningAlgosSupported)
      : KEY_TYPE_TO_JWT_ALG[keyType];

  if (!alg) {
    throw new Error(`Unsupported algorithm for keyType: ${keyType}`);
  }

  const jwtHeader: Record<string, any> = {
    alg,
    typ: 'openid4vci-proof+jwt',
    ...(isCredentialOfferFlow
      ? {kid: `did:jwk:${base64url(JSON.stringify(jwk))}#0`}
      : {jwk}),
  };

  const jwtPayload = {
    ...(client_id ? {iss: client_id} : {}),
    nonce,
    aud: selectedIssuer,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 18000,
  };

  return getJWT(jwtHeader, jwtPayload, Issuers_Key_Ref, privateKey, keyType);
}

export const getJWK = async (publicKey, keyType) => {
  try {
    let publicKeyJWK;
    switch (keyType) {
      case KeyTypes.RS256:
        publicKeyJWK = await getJWKRSA(publicKey);
        break;
      case KeyTypes.ES256:
        publicKeyJWK = await getJWKECR1(publicKey);
        break;
      case KeyTypes.ES256K:
        publicKeyJWK = await getJWKECK1(publicKey);
        break;
      case KeyTypes.ED25519:
        publicKeyJWK = await getJWKED(publicKey);
        break;
      default:
        throw Error;
    }
    return {
      ...publicKeyJWK,
      use: 'sig',
    };
  } catch (e) {
    console.error(
      'Exception occurred while constructing JWK from PEM : ' +
        publicKey +
        '  Exception is ',
      e,
    );
  }
};
async function getJWKRSA(publicKey): Promise<any> {
  const publicKeyJWKString = await jose.JWK.asKey(publicKey, 'pem');
  return publicKeyJWKString.toJSON();
}
async function getJWKECR1(publicKey): Promise<any> {
  let jwk = {};
  if (isAndroid()) {
    const publicKeyJWKString = await jose.JWK.asKey(publicKey, 'pem');
    jwk = publicKeyJWKString.toJSON();
  } else {
    const x = base64url(Buffer.from(publicKey.slice(1, 33))); // Skip the first byte (0x04) in the uncompressed public key
    const y = base64url(Buffer.from(publicKey.slice(33, 65)));
    jwk = {
      kty: 'EC',
      crv: 'P-256',
      x: x,
      y: y,
    };
  }

  return jwk;
}
function getJWKECK1(publicKey): any {
  const x = base64url(Buffer.from(publicKey.slice(1, 33))); // Skip the first byte (0x04) in the uncompressed public key
  const y = base64url(Buffer.from(publicKey.slice(33)));
  const jwk = {
    kty: 'EC',
    crv: 'secp256k1',
    x: x,
    y: y,
  };
  return jwk;
}
function getJWKED(publicKey): any {
  const x = base64url(publicKey);
  const jwk = {
    kty: 'OKP',
    crv: 'Ed25519',
    x: x,
  };
  return jwk;
}
export async function hasKeyPair(keyType: any): Promise<boolean> {
  const {RNSecureKeystoreModule} = NativeModules;
  try {
    return await RNSecureKeystoreModule.hasAlias(keyType);
  } catch (e) {
    console.error('key not found');
    return false;
  }
}

export function selectCredentialRequestKey(
  proofSigningAlgosSupported: string[],
  keyOrder: Record<string, string>,
): string {
  const supportedKeyTypes = proofSigningAlgosSupported
    .map(algo => JWT_ALG_TO_KEY_TYPE[algo])
    .filter(Boolean);

  for (const index in keyOrder) {
    const keyType = keyOrder[index];
    if (supportedKeyTypes.includes(keyType)) {
      return keyType;
    }
  }
  return keyOrder[0];
}

export function getMatchingCredentialIssuerMetadata(
  wellknown: any,
  credentialConfigurationId: string,
): any {
  for (const credentialTypeKey in wellknown.credential_configurations_supported) {
    if (credentialTypeKey === credentialConfigurationId) {
      return wellknown.credential_configurations_supported[credentialTypeKey];
    }
  }
  console.error(
    'Selected credential type is not available in wellknown config supported credentials list',
  );
  sendErrorEvent(
    getErrorEventData(
      TelemetryConstants.FlowType.wellknownConfig,
      TelemetryConstants.ErrorId.mismatch,
      TelemetryConstants.ErrorMessage.wellknownConfigMismatch,
    ),
  );
  throw new Error(
    `Selected credential type - ${credentialConfigurationId} is not available in wellknown config supported credentials list`,
  );
}

export async function verifyCredentialData(
  credential: Credential,
  credentialFormat: string,
) {
  const verificationResult = await verifyCredential(
    credential,
    credentialFormat,
  );
  return verificationResult;
}
function resolveEd25519Alg(proofSigningAlgosSupported: string[]) {
  return proofSigningAlgosSupported.includes(
    KEY_TYPE_TO_JWT_ALG[KeyTypes.ED25519],
  )
    ? KEY_TYPE_TO_JWT_ALG[KeyTypes.ED25519]
    : ED25519_PROOF_SIGNING_ALGO;
}

export function formattedDate(time: number|string): React.ReactNode {
  const date = new Date(time);
  const day = date.getDate();
  const month = date.toLocaleString('default', {month: 'long'});
  const year = date.getFullYear();
  const formattedHours = (date.getHours() % 12 || 12)
    .toString()
    .padStart(2, '0');
  const formattedMinutes = date.getMinutes().toString().padStart(2, '0');
  const period = date.getHours() >= 12 ? 'PM' : 'AM';

  return `${day} ${month} ${year}, ${formattedHours}:${formattedMinutes} ${period}`;
}
