import {displayType, logoType} from '../../Issuers/IssuersMachine';
import {VCMetadata} from '../../../shared/VCMetadata';

export interface VC {
  id?: string;
  idType?: VcIdType;
  credential?: DecodedCredential;
  verifiableCredential: VerifiableCredential | Credential;
  requestId?: string;
  isVerified?: boolean;
  lastVerifiedOn: number;
  walletBindingResponse?: WalletBindingResponse;
  hashedId?: string;
  vcMetadata: VCMetadata;
}

export type SelectedCredentialsForVPSharing = Record<string,Record<string, Array<any>>;

export type VcIdType = 'UIN' | 'VID';

export interface DecodedCredential {
  biometrics: {
    face: string;
    finger: {
      left_thumb: string;
      right_thumb: string;
    };
  };
}

export interface CredentialSubject {
  //TODO: This should change to mandatory field if uin is also issued
  UIN?: string;
  VID?: string;
  addressLine1: LocalizedField[] | string;
  city: LocalizedField[] | string;
  dateOfBirth: string;
  email: string;
  fullName: LocalizedField[] | string;
  gender: LocalizedField[] | string;
  id: string;
  phone: string;
  face: string;
}

type VCContext = (string | Record<string, unknown>)[];

export type Credential =
  | {
      credentialConfigurationId: any;
      '@context': VCContext;
      credentialSubject: CredentialSubject;
      id: string;
      issuanceDate: string;
      issuer: string;
      proof: {
        created: string;
        jws: string;
        proofPurpose: 'assertionMethod' | string;
        type: 'RsaSignature2018' | string;
        verificationMethod: string;
      };
      type: string[];
    }
  | string;

export interface VerifiableCredential {
  issuerLogo: logoType;
  credential: Credential;
  processedCredential?: object;
  wellKnown: string;
  credentialConfigurationId: string;
}

export interface VerifiableCredentialData {
  vcMetadata: VCMetadata;
  format: string;
  face: string;
  issuerLogo: logoType;
  wellKnown?: string;
  credentialConfigurationId: string;
  issuer?: string;
}

export interface CredentialWrapper {
  verifiableCredential: VerifiableCredential;
  format: string;
  generatedOn: Date;
  vcMetadata: VCMetadata;
}

export interface CredentialTypes {
  format: string;
  id: string;
  scope: string;
  display: [displayType];
  proof_types_supported: Object;
  credential_definition: {
    type: Object[];
    context:string[]
    credentialSubject: CredentialSubject;
  };
  doctype: string;
  claims: Object;
}

export interface IssuerWellknownResponse {
  credential_issuer: string;
  credential_endpoint: string;
  credential_configurations_supported: Object;
}

export interface VCLabel {
  singular: string;
  plural: string;
}

export interface LocalizedField {
  language: string;
  value: string;
}

export interface linkTransactionResponse {
  authFactors: Object[];
  authorizeScopes: null;
  clientName: string;
  configs: {};
  essentialClaims: string[];
  linkTransactionId: string;
  logoUrl: string;
  voluntaryClaims: string[];
}

export interface WalletBindingResponse {
  walletBindingId: string;
  keyId: string;
  thumbprint: string;
  expireDateTime: string;
}

//TODO: Check if Type word is needed in the naming
export interface VCMetadataType {
  //TODO: requestId is not null at any point as its used for file names and all
  isPinned: boolean;
  requestId: string | null;
  issuer: string;
  protocol: string;
  id: string;
  timestamp: string;
  isVerified: boolean;
  credentialType: string;
}
