import {VC} from "../../machines/VerifiableCredential/VCMetaMachine/vc";

export interface UnsignedVPToken {
  format: 'ldp_vc' | 'mso_mdoc' | 'vc_sd_jwt' | 'dc_sd_jwt';
  holderKeyReference: string;
  signatureAlgorithm: string;
  dataToSign: string;
}

export interface VPTokenSigningResult {
  signedData: string;
}

export interface MatchingVCsResult {
  matchingVCs: Record<string, VC[]>;
  success: boolean;
  purpose: string;
  requestedClaims: string;
  credentialSetOptions: Record<string, any> | undefined;
}
