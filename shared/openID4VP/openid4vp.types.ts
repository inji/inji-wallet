import {VCMetadata} from "../VCMetadata";

export interface UnsignedVPToken {
  id: string;
  format: 'ldp_vc' | 'mso_mdoc' | 'vc_sd_jwt' | 'dc_sd_jwt';
  holderKeyReference: string;
  signatureAlgorithm: string;
  dataToSign: string;
}

export interface VerifierInfo {
  name?: string;
  logo?: string;
}

export interface VPTokenSigningResult {
  id: string;
  signedData: string;
}

export type MatchingVcsResult =
  | MatchingVCsResultForDcql
  | MatchingVCsResultForPresentationExchangeRequest;

export interface MatchingVCsResultForPresentationExchangeRequest {
  matchingVCs: Record<string, VCInfo[]>;
  success: boolean;
  purpose: string;
  requestedClaims: Set<string>;
}

export interface MatchingVCsResultForDcql {
  matchingVCs: Record<string, MatchResult>;
  success: boolean;
  purpose: string;
  requestedClaims: Set<string>;
  credentialSetOptions: CredentialSetOption[];
}

export interface CredentialSetOption {
  options: Array<Array<string>>;
  required: boolean;
}

export interface MatchResult {
  matchingVcs?: VcWithMatchedClaims[];
  allowMultipleCredentials: boolean;
  failedClaims?: Claim[];
  failureReason?: string;
}

export interface VcWithMatchedClaims {
  matchingVcInfo: VCInfo;
  matchedClaims: Claim[] | undefined;
}

export interface Claim {
  id: string | undefined;
  path: Array<any>;
  values: Array<any> | undefined;
}

export class VCInfo {
  vcKey: string
  metadata: VCMetadata

  constructor(vcKey: string, metadata: VCMetadata) {
    this.vcKey = vcKey
    this.metadata = metadata
  }
}
