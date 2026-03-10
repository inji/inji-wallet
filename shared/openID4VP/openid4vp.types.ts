export type UnsignedVPTokensV2 = Array<UnsignedVPTokenV2>;

export interface UnsignedVPTokenV2 {
  format: 'ldp_vc' | 'mso_mdoc' | 'vc_sd_jwt' | 'dc_sd_jwt' | 'jwt_vc_json';
  holderKeyReference: string;
  signatureAlgorithm: string;
  dataToSign: string;
}

export type VPTokenSigningResultsV2 = Array<VPTokenSigningResultV2>;

export interface VPTokenSigningResultV2 {
  signedData: string;
}
