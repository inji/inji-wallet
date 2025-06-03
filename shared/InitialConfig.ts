// Initial configs used by app if network is not available when app is opened for first time. once network is available response is cached and used from then
// Note: Need to keep this config in sync with actual mimoto response.

export const INITIAL_CONFIG = {
  // These properties are stored in mosip-config github repo / inji-default.properties
  allProperties: {
    modelDownloadMaxRetry: '10',
    audience: 'ida-binding',
    allowedInternalAuthType: 'otp,bio-Finger,bio-Iris,bio-Face',
    vcDownloadMaxRetry: '10',
    minStorageRequiredForAuditEntry: '2',
    minStorageRequired: '2',
    vcDownloadPoolInterval: '6000',
    issuer: 'residentapp',
    allowedAuthType: 'demo,otp,bio-Finger,bio-Iris,bio-Face',
    allowedEkycAuthType: 'demo,otp,bio-Finger,bio-Iris,bio-Face',
    warningDomainName: '',
    aboutInjiUrl: 'https://docs.mosip.io/inji/inji-wallet/inji-mobile',
    faceSdkModelUrl: '',
    openId4VCIDownloadVCTimeout: '30000',
    cacheTTLInMilliSeconds: '3600000',
  },
};
