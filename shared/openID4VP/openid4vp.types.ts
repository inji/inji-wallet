export interface UnsignedVPToken {
  format: 'ldp_vc' | 'mso_mdoc' | 'vc_sd_jwt' | 'dc_sd_jwt';
  holderKeyReference: string;
  signatureAlgorithm: string;
  dataToSign: string;
}

export interface VPTokenSigningResult {
  signedData: string;
}
