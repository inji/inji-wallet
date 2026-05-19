import {VC} from '../../machines/VerifiableCredential/VCMetaMachine/vc';

export interface UnsignedVPToken {
  format: 'ldp_vc' | 'mso_mdoc' | 'vc_sd_jwt' | 'dc_sd_jwt';
  holderKeyReference: string;
  signatureAlgorithm: string;
  dataToSign: string;
}

export interface VPTokenSigningResult {
  signedData: string;
}

export type MatchingVcsResult =
  | MatchingVCsResultForDcql
  | MatchingVCsResultForPresentationExchangeRequest;

export interface MatchingVCsResultForPresentationExchangeRequest {
  // TODO: Holding VC here is too much of space - check if any optimization is possible by just holding VC key
  //  and fetching VC details from something like cached registry based on need
  matchingVCs: Record<string, VC[]>;
  success: boolean;
  purpose: string;
  requestedClaims: string;
}

export interface MatchingVCsResultForDcql {
  matchingVCs: Record<string, MatchResult>;
  success: boolean;
  purpose: string;
  requestedClaims: string;
  credentialSetOptions: CredentialSetOption[];
}

export interface CredentialSetOption {
  options: Array<Array<string>>;
  required: boolean;
}

export interface MatchResult {
  matchingVcs: VcWithMatchedClaims[];
  allowMultipleCredentials: boolean;
}

export interface VcWithMatchedClaims {
  // TODO: Holding VC here is too much of space - check if any optimization is possible by just holding VC key
  //  and fetching VC details from something like cached registry based on need
  vc: VC;
  matchedClaims: Claim[] | undefined;
}

export interface Claim {
  id: string | undefined;
  path: Array<any>;
  values: Array<any> | undefined;
}
