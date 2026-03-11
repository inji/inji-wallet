jest.mock('xstate', () => ({
  assign: jest.fn(arg => ({type: 'xstate.assign', assignment: arg})),
  send: jest.fn((event, opts) => ({type: 'xstate.send', event, opts})),
  spawn: jest.fn(),
}));
jest.mock('../../shared/openId4VCI/Utils', () => ({
  ErrorMessage: {
    NO_INTERNET: 'no_internet',
    CREDENTIAL_TYPE_DOWNLOAD_FAILURE: 'cred_type_fail',
    NETWORK_REQUEST_FAILED: 'network_failed',
    REQUEST_TIMEDOUT: 'request_timeout',
    AUTHORIZATION_GRANT_TYPE_NOT_SUPPORTED: 'grant_type_not_supported',
    GENERIC: 'generic',
    KEY_MANAGEMENT_ERROR: 'key_management_error',
    WALLET_GENERIC_ERROR: 'wallet_generic_error',
  },
  getDisplayObjectForCurrentLanguage: jest.fn(arr => arr?.[0]),
  Issuers_Key_Ref: 'issuers_key_ref',
  VCIServerErrorCode: {
    SERVER_ERROR: 'server_error',
    INVALID_CREDENTIAL_OFFER: 'invalid_credential_offer',
    UNKNOWN_ERROR: 'unknown_error',
  },
  OIDCErrors: {
    AUTHORIZATION_ENDPOINT_DISCOVERY: {
      GRANT_TYPE_NOT_SUPPORTED: 'grant_type_not_supported',
    },
  },
  selectCredentialRequestKey: jest.fn(() => 'ES256'),
}));
jest.mock('../../shared/constants', () => ({
  EXPIRED_VC_ERROR_CODE: 'expired',
  MY_VCS_STORE_KEY: 'myVCs',
  NO_INTERNET: 'No Internet',
  REQUEST_TIMEOUT: 'Request Timeout',
  isIOS: jest.fn(() => false),
  AuthorizationType: {
    IMPLICIT: 'implicit',
    OPENID4VP_PRESENTATION: 'presentation',
  },
  OVP_ERROR_CODE: {DECLINED: 'declined'},
  OVP_ERROR_MESSAGES: {DECLINED: 'User declined'},
}));
jest.mock('../store', () => ({
  StoreEvents: {
    GET: jest.fn(key => ({type: 'GET', key})),
    PREPEND: jest.fn((key, val) => ({type: 'PREPEND', key, val})),
    SET: jest.fn((key, val) => ({type: 'SET', key, val})),
  },
}));
jest.mock('../backupAndRestore/backup/backupMachine', () => ({
  BackupEvents: {DATA_BACKUP: jest.fn(() => ({type: 'DATA_BACKUP'}))},
}));
jest.mock('../../shared/VCMetadata', () => ({
  getVCMetadata: jest.fn(() => ({getVcKey: () => 'vc-key'})),
  VCMetadata: jest
    .fn()
    .mockImplementation(obj => ({...obj, getVcKey: () => 'vc-key'})),
}));
jest.mock('../../shared/cryptoutil/cryptoUtil', () => ({
  isHardwareKeystoreExists: false,
}));
jest.mock('../activityLog', () => ({
  ActivityLogEvents: {LOG_ACTIVITY: jest.fn()},
}));
jest.mock('../../shared/telemetry/TelemetryUtils', () => ({
  getEndEventData: jest.fn(),
  getImpressionEventData: jest.fn(),
  sendEndEvent: jest.fn(),
  sendImpressionEvent: jest.fn(),
}));
jest.mock('../../shared/telemetry/TelemetryConstants', () => ({
  TelemetryConstants: {
    FlowType: {
      vcDownload: 'vcDownload',
      presentationAuthorizationForVcDownload: 'pres',
    },
    EndEventStatus: {success: 'success', failure: 'failure'},
    Screens: {issuerList: 'issuerList'},
  },
}));
jest.mock('react-native', () => ({
  NativeModules: {
    RNSecureKeystoreModule: {
      storeGenericKey: jest.fn().mockResolvedValue(undefined),
    },
  },
}));
jest.mock('../../components/ActivityLogEvent', () => ({
  VCActivityLog: {getLogFromObject: jest.fn(obj => obj)},
}));
jest.mock('../../shared/Utils', () => ({
  isNetworkError: jest.fn(msg => msg?.includes?.('Network')),
  parseJSON: jest.fn(str => JSON.parse(str || '{}')),
  VCShareFlowType: {OPENID4VP_AUTHORIZATION: 'openid4vp'},
}));
jest.mock('./IssuersMachine', () => ({}));
jest.mock('../../shared/vcVerifier/VcVerifier', () => ({
  RevocationStatus: {FALSE: 'false', TRUE: 'true'},
}));
jest.mock('../../shared/commonUtil', () => ({
  logState: jest.fn(),
}));
jest.mock('../openID4VP/openID4VPMachine', () => ({
  createOpenID4VPMachine: jest.fn(),
}));
jest.mock('../../shared/vciClient/VciClient', () => {
  const instance = {
    sendSignedVP: jest.fn(),
    abortPresentationFlow: jest.fn(),
  };
  return {
    __esModule: true,
    default: {getInstance: jest.fn(() => instance)},
  };
});

import {IssuersActions} from './IssuersActions';

describe('IssuersActions', () => {
  const mockModel = {
    assign: jest.fn(arg => ({type: 'model.assign', assignment: arg})),
  };
  let actions: ReturnType<typeof IssuersActions>;

  beforeEach(() => {
    jest.clearAllMocks();
    actions = IssuersActions(mockModel);
  });

  it('should return all expected action definitions', () => {
    const expectedActions = [
      'setVerificationResult',
      'resetVerificationResult',
      'setIssuers',
      'setLoadingReasonAsDisplayIssuers',
      'setLoadingReasonAsDownloadingCredentials',
      'setLoadingReasonAsPreparingRequest',
      'setLoadingReasonAsSettingUp',
      'resetLoadingReason',
      'resetAuthorization',
      'setSelectedCredentialType',
      'setSupportedCredentialTypes',
      'resetSelectedCredentialType',
      'setCredentialTypeListDownloadFailureError',
      'setError',
      'resetError',
      'loadKeyPair',
      'getKeyPairFromStore',
      'sendBackupEvent',
      'storeKeyPair',
      'storeVerifiableCredentialMeta',
      'setMetadataInCredentialData',
      'setVCMetadata',
      'storeVerifiableCredentialData',
      'storeVcMetaContext',
      'storeVcsContext',
      'setSelectedKey',
      'setSelectedIssuers',
      'resetSelectedIssuer',
      'updateIssuerFromWellknown',
      'setCredential',
      'setQrData',
      'setCredentialOfferIssuer',
      'setAccessToken',
      'setCNonce',
      'setCredentialConfigurationId',
      'setCredentialOfferCredentialType',
      'setAuthorizationTypeAsPresentation',
      'setPresentationAuthorizationSuccess',
      'setRequestTxCode',
      'resetRequestTxCode',
      'setCredentialOfferIssuerWellknownResponse',
      'setWellknwonKeyTypes',
      'setSelectedCredentialIssuer',
      'setTokenRequestObject',
      'setTokenResponseObject',
      'setSelectedIssuerId',
      'setTxCode',
      'setRequestConsentToTrustIssuer',
      'resetTrustedIssuerConsentStatus',
      'setTrustedIssuerConsentInProgress',
      'setTrustedIssuerConsentSuccess',
      'setTxCodeDisplayDetails',
      'setIssuerDisplayDetails',
      'setCredentialOfferFlowType',
      'resetCredentialOfferFlowType',
      'resetRequestConsentToTrustIssuer',
      'setVerifiableCredential',
      'setCredentialWrapper',
      'setPublicKey',
      'setPrivateKey',
      'logDownloaded',
      'sendSuccessEndEvent',
      'sendErrorEndEvent',
      'sendImpressionEvent',
      'sendPresentationAuthorizationImpressionEvent',
      'updateVerificationErrorMessage',
      'resetVerificationErrorMessage',
      'resetQrData',
      'sendDownloadingFailedToVcMeta',
      'setOpenId4VPRef',
      'sendVPScanData',
      'sendVPConsentReject',
      'sendPresentationAuthorizationError',
    ];
    for (const name of expectedActions) {
      expect(actions).toHaveProperty(name);
    }
  });

  it('setIssuers should call model.assign', () => {
    expect(actions.setIssuers).toBeDefined();
    expect(mockModel.assign).toHaveBeenCalled();
  });

  it('sendSuccessEndEvent should call sendEndEvent', () => {
    const {sendEndEvent} = require('../../shared/telemetry/TelemetryUtils');
    actions.sendSuccessEndEvent({keyType: 'ES256'});
    expect(sendEndEvent).toHaveBeenCalled();
  });

  it('sendErrorEndEvent should call sendEndEvent', () => {
    const {sendEndEvent} = require('../../shared/telemetry/TelemetryUtils');
    actions.sendErrorEndEvent({keyType: 'ES256'});
    expect(sendEndEvent).toHaveBeenCalled();
  });

  it('sendImpressionEvent fires impression telemetry', () => {
    const {
      sendImpressionEvent,
    } = require('../../shared/telemetry/TelemetryUtils');
    actions.sendImpressionEvent();
    expect(sendImpressionEvent).toHaveBeenCalled();
  });

  it('sendVPConsentReject calls VciClient abortPresentationFlow', () => {
    const instance =
      require('../../shared/vciClient/VciClient').default.getInstance();
    instance.abortPresentationFlow.mockClear();
    actions.sendVPConsentReject();
    expect(instance.abortPresentationFlow).toHaveBeenCalled();
  });

  it('setMetadataInCredentialData sets vcMetadata on credentialWrapper', () => {
    const ctx: any = {
      credentialWrapper: {verifiableCredential: {}},
      vcMetadata: {id: '123'},
    };
    actions.setMetadataInCredentialData(ctx);
    expect(ctx.credentialWrapper.vcMetadata).toEqual({id: '123'});
  });

  describe('assignment callbacks', () => {
    it('setVerificationResult creates VCMetadata with isVerified true', () => {
      const asg = actions.setVerificationResult.assignment;
      const result = asg.vcMetadata(
        {vcMetadata: {id: '1'}},
        {data: {verificationErrorCode: 'other', isRevoked: 'false'}},
      );
      expect(result.isVerified).toBe(true);
    });

    it('resetVerificationResult creates VCMetadata with isVerified false', () => {
      const asg = actions.resetVerificationResult.assignment;
      const result = asg.vcMetadata({vcMetadata: {id: '1'}});
      expect(result.isVerified).toBe(false);
    });

    it('setIssuers extracts from event.data', () => {
      const fn = actions.setIssuers.assignment.issuers;
      expect(fn({}, {data: ['issuer1']})).toEqual(['issuer1']);
    });

    it('setLoadingReasonAsDisplayIssuers returns displayIssuers', () => {
      expect(
        actions.setLoadingReasonAsDisplayIssuers.assignment.loadingReason,
      ).toBe('displayIssuers');
    });

    it('setLoadingReasonAsDownloadingCredentials returns correct reason', () => {
      expect(
        actions.setLoadingReasonAsDownloadingCredentials.assignment
          .loadingReason,
      ).toBe('downloadingCredentials');
    });

    it('setLoadingReasonAsPreparingRequest returns preparingRequest', () => {
      expect(
        actions.setLoadingReasonAsPreparingRequest.assignment.loadingReason,
      ).toBe('preparingRequest');
    });

    it('setLoadingReasonAsSettingUp returns settingUp', () => {
      expect(actions.setLoadingReasonAsSettingUp.assignment.loadingReason).toBe(
        'settingUp',
      );
    });

    it('resetLoadingReason returns null', () => {
      expect(actions.resetLoadingReason.assignment.loadingReason).toBeNull();
    });

    it('resetAuthorization resets auth type and success', () => {
      const asg = actions.resetAuthorization.assignment;
      expect(asg.authorizationType).toBe('implicit');
      expect(asg.authorizationSuccess).toBe(false);
    });

    it('setSelectedCredentialType picks credType and wellknown key types', () => {
      const asg = actions.setSelectedCredentialType.assignment;
      const event = {
        credType: {
          id: 'cred1',
          proof_types_supported: {
            jwt: {proof_signing_alg_values_supported: ['ES256']},
          },
        },
      };
      expect(asg.selectedCredentialType({}, event)).toEqual(event.credType);
      expect(asg.wellknownKeyTypes({}, event)).toEqual(['ES256']);
    });

    it('setSelectedCredentialType returns empty for no jwt', () => {
      const asg = actions.setSelectedCredentialType.assignment;
      expect(
        asg.wellknownKeyTypes({}, {credType: {proof_types_supported: {}}}),
      ).toEqual([]);
    });

    it('setSupportedCredentialTypes sets from event.data', () => {
      const fn =
        actions.setSupportedCredentialTypes.assignment.supportedCredentialTypes;
      expect(fn({}, {data: ['type1']})).toEqual(['type1']);
    });

    it('resetSelectedCredentialType returns empty object', () => {
      expect(
        actions.resetSelectedCredentialType.assignment.selectedCredentialType,
      ).toEqual({});
    });

    it('setCredentialTypeListDownloadFailureError for non-network error', () => {
      const fn =
        actions.setCredentialTypeListDownloadFailureError.assignment
          .errorMessage;
      expect(fn({}, {data: {message: 'server error'}})).toBe('cred_type_fail');
    });

    it('setError for no internet', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const fn = actions.setError.assignment.errorMessage;
      expect(fn({isInternetAvailable: false}, {data: {message: 'No Internet'}})).toBe('no_internet');
      consoleSpy.mockRestore();
    });

    it('setError returns server error when native error code is present', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const fn = actions.setError.assignment.errorMessage;
      expect(fn({isInternetAvailable: true}, {data: {code: 'VCI-001'}})).toBe(
        'server_error',
      );
      consoleSpy.mockRestore();
    });

    it('setError returns invalid credential offer for VCI-008 source error', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const fn = actions.setError.assignment.errorMessage;
      expect(
        fn(
          {isInternetAvailable: true},
          {data: {sourceErrorCode: 'VCI-008'}},
        ),
      ).toBe('invalid_credential_offer');
      consoleSpy.mockRestore();
    });

    it('setError returns server error code from payload when available', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const fn = actions.setError.assignment.errorMessage;
      expect(
        fn(
          {isInternetAvailable: true},
          {data: {serverErrorCode: 'unsupported_grant_type'}},
        ),
      ).toBe(
        'unsupported_grant_type',
      );
      consoleSpy.mockRestore();
    });

    it('setError returns unknown error when no structured code is available', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const fn = actions.setError.assignment.errorMessage;
      expect(fn({isInternetAvailable: true}, {data: {message: 'unknown'}})).toBe(
        'unknown_error',
      );
      consoleSpy.mockRestore();
    });

    it('resetError sets empty string', () => {
      expect(actions.resetError.assignment.errorMessage).toBe('');
    });

    it('loadKeyPair sets publicKey and privateKey', () => {
      const asg = actions.loadKeyPair.assignment;
      expect(asg.publicKey({}, {data: {publicKey: 'pk1'}})).toBe('pk1');
      expect(
        asg.privateKey({privateKey: 'old'}, {data: {privateKey: 'new'}}),
      ).toBe('new');
      expect(asg.privateKey({privateKey: 'old'}, {data: {}})).toBe('old');
    });

    it('setSelectedIssuers finds issuer by id', () => {
      const fn = actions.setSelectedIssuers.assignment.selectedIssuer;
      const issuers = [
        {issuer_id: 'i1', name: 'Issuer1'},
        {issuer_id: 'i2', name: 'Issuer2'},
      ];
      expect(fn({issuers}, {id: 'i2'})).toEqual({
        issuer_id: 'i2',
        name: 'Issuer2',
      });
    });

    it('resetSelectedIssuer returns empty object', () => {
      const fn = actions.resetSelectedIssuer.assignment.selectedIssuer;
      expect(fn()).toEqual({});
    });

    it('setCredential sets from event.data.credential', () => {
      const fn = actions.setCredential.assignment.credential;
      expect(fn({}, {data: {credential: 'cred1'}})).toBe('cred1');
    });

    it('setQrData sets from event.data', () => {
      const fn = actions.setQrData.assignment.qrData;
      expect(fn({}, {data: 'qr-data'})).toBe('qr-data');
    });

    it('setCredentialOfferIssuer sets from event.issuer', () => {
      const fn = actions.setCredentialOfferIssuer.assignment.selectedIssuer;
      expect(fn({}, {issuer: {id: 'i1'}})).toEqual({id: 'i1'});
    });

    it('setAccessToken sets from event.data.access_token', () => {
      const fn = actions.setAccessToken.assignment.accessToken;
      expect(fn({}, {data: {access_token: 'tok123'}})).toBe('tok123');
    });

    it('setCNonce sets from event.cNonce', () => {
      const fn = actions.setCNonce.assignment.cNonce;
      expect(fn({}, {cNonce: 'nonce1'})).toBe('nonce1');
    });

    it('setRequestTxCode returns true', () => {
      const fn = actions.setRequestTxCode.assignment.isTransactionCodeRequested;
      expect(fn({}, {})).toBe(true);
    });

    it('resetRequestTxCode returns false', () => {
      const fn =
        actions.resetRequestTxCode.assignment.isTransactionCodeRequested;
      expect(fn({}, {})).toBe(false);
    });

    it('setTxCode sets from event.txCode', () => {
      const fn = actions.setTxCode.assignment.txCode;
      expect(fn({}, {txCode: '123456'})).toBe('123456');
    });

    it('resetTrustedIssuerConsentStatus returns idle', () => {
      const fn =
        actions.resetTrustedIssuerConsentStatus.assignment
          .trustedIssuerConsentStatus;
      expect(fn()).toBe('idle');
    });

    it('setTrustedIssuerConsentInProgress returns loading', () => {
      const fn =
        actions.setTrustedIssuerConsentInProgress.assignment
          .trustedIssuerConsentStatus;
      expect(fn()).toBe('loading');
    });

    it('setTrustedIssuerConsentSuccess returns success', () => {
      const fn =
        actions.setTrustedIssuerConsentSuccess.assignment
          .trustedIssuerConsentStatus;
      expect(fn()).toBe('success');
    });

    it('setCredentialOfferFlowType returns true', () => {
      const fn =
        actions.setCredentialOfferFlowType.assignment.isCredentialOfferFlow;
      expect(fn({}, {})).toBe(true);
    });

    it('resetCredentialOfferFlowType returns false', () => {
      const fn =
        actions.resetCredentialOfferFlowType.assignment.isCredentialOfferFlow;
      expect(fn({}, {})).toBe(false);
    });

    it('setRequestConsentToTrustIssuer returns true', () => {
      const fn =
        actions.setRequestConsentToTrustIssuer.assignment.isConsentRequested;
      expect(fn({}, {})).toBe(true);
    });

    it('resetRequestConsentToTrustIssuer returns false', () => {
      const fn =
        actions.resetRequestConsentToTrustIssuer.assignment.isConsentRequested;
      expect(fn({}, {})).toBe(false);
    });

    it('setVerifiableCredential sets from event.data', () => {
      const fn =
        actions.setVerifiableCredential.assignment.verifiableCredential;
      expect(fn({}, {data: {verifiableCredential: 'vc1'}})).toBe('vc1');
    });

    it('setCredentialWrapper sets from event.data', () => {
      const fn = actions.setCredentialWrapper.assignment.credentialWrapper;
      expect(fn({}, {data: {wrapper: true}})).toEqual({wrapper: true});
    });

    it('setPublicKey extracts publicKey from event', () => {
      const fn = actions.setPublicKey.assignment.publicKey;
      expect(fn({}, {data: {publicKey: 'pk1'}})).toBe('pk1');
    });

    it('setPrivateKey extracts privateKey from event', () => {
      const fn = actions.setPrivateKey.assignment.privateKey;
      expect(fn({}, {data: {privateKey: 'priv1'}})).toBe('priv1');
    });

    it('resetVerificationErrorMessage returns empty', () => {
      const fn =
        actions.resetVerificationErrorMessage.assignment
          .verificationErrorMessage;
      expect(fn()).toBe('');
    });

    it('resetQrData returns empty', () => {
      const fn = actions.resetQrData.assignment.qrData;
      expect(fn()).toBe('');
    });

    it('updateVerificationErrorMessage sets from event.data.message', () => {
      const fn =
        actions.updateVerificationErrorMessage.assignment
          .verificationErrorMessage;
      expect(fn({}, {data: {message: 'verify err'}})).toBe('verify err');
    });

    it('setWellknwonKeyTypes sets from event', () => {
      const fn = actions.setWellknwonKeyTypes.assignment.wellknownKeyTypes;
      expect(fn({}, {proofSigningAlgosSupported: ['ES256']})).toEqual([
        'ES256',
      ]);
    });

    it('setSelectedCredentialIssuer from event.issuer', () => {
      const fn =
        actions.setSelectedCredentialIssuer.assignment
          .credentialOfferCredentialIssuer;
      expect(fn({}, {issuer: 'iss-host'})).toBe('iss-host');
    });

    it('setSelectedIssuerId from event.id', () => {
      const fn = actions.setSelectedIssuerId.assignment.selectedIssuerId;
      expect(fn({}, {id: 'id123'})).toBe('id123');
    });

    it('setTokenResponseObject from event.data', () => {
      const fn = actions.setTokenResponseObject.assignment.tokenResponse;
      expect(fn({}, {data: {token: 'abc'}})).toEqual({token: 'abc'});
    });

    it('setTxCodeDisplayDetails sets inputMode, description, length', () => {
      const asg = actions.setTxCodeDisplayDetails.assignment;
      const ev = {inputMode: 'numeric', description: 'Enter code', length: 6};
      expect(asg.txCodeInputMode({}, ev)).toBe('numeric');
      expect(asg.txCodeDescription({}, ev)).toBe('Enter code');
      expect(asg.txCodeLength({}, ev)).toBe(6);
    });

    it('setIssuerDisplayDetails extracts logo and name', () => {
      const asg = actions.setIssuerDisplayDetails.assignment;
      const ev = {
        issuerDisplay: [{logo: {url: 'http://logo.png'}, name: 'Issuer1'}],
      };
      expect(asg.issuerLogo({}, ev)).toBe('http://logo.png');
      expect(asg.issuerName({}, ev)).toBe('Issuer1');
    });

    it('setIssuerDisplayDetails handles missing display', () => {
      const asg = actions.setIssuerDisplayDetails.assignment;
      expect(asg.issuerLogo({}, {issuerDisplay: null})).toBe('');
      expect(asg.issuerName({}, {issuerDisplay: null})).toBe('');
    });

    it('updateIssuerFromWellknown merges wellknown data', () => {
      const asg = actions.updateIssuerFromWellknown.assignment;
      const ctx = {selectedIssuer: {display: null}};
      const ev = {
        data: {
          credential_endpoint: 'ep',
          credential_configurations_supported: {},
          display: [{name: 'N'}],
          authorization_servers: [],
        },
      };
      const result = asg.selectedIssuer(ctx, ev);
      expect(result.credential_endpoint).toBe('ep');
    });
  });

  describe('additional assignment callbacks', () => {
    it('setCredentialTypeListDownloadFailureError for network error returns NO_INTERNET', () => {
      const fn =
        actions.setCredentialTypeListDownloadFailureError.assignment
          .errorMessage;
      expect(fn({}, {data: {message: 'Network request failed'}})).toBe(
        'no_internet',
      );
    });

    it('setCredentialConfigurationId extracts from event.data', () => {
      const fn =
        actions.setCredentialConfigurationId.assignment
          .credentialConfigurationId;
      expect(fn({}, {data: {credentialConfigurationId: 'config1'}})).toBe(
        'config1',
      );
    });

    it('setCredentialOfferCredentialType returns matching credential type', () => {
      const fn =
        actions.setCredentialOfferCredentialType.assignment
          .selectedCredentialType;
      const ctx = {
        credentialConfigurationId: 'MosipVerifiableCredential',
        selectedIssuerWellknownResponse: {
          credential_configurations_supported: {
            MosipVerifiableCredential: {format: 'ldp_vc', scope: 'mosip'},
          },
        },
      };
      const result = fn(ctx, {});
      expect(result).toEqual({
        id: 'MosipVerifiableCredential',
        format: 'ldp_vc',
        scope: 'mosip',
      });
    });

    it('setCredentialOfferCredentialType returns undefined for missing config', () => {
      const fn =
        actions.setCredentialOfferCredentialType.assignment
          .selectedCredentialType;
      const ctx = {
        credentialConfigurationId: 'nonexistent',
        selectedIssuerWellknownResponse: {
          credential_configurations_supported: {},
        },
      };
      expect(fn(ctx, {})).toBeUndefined();
    });

    it('setAuthorizationTypeAsPresentation sets presentation', () => {
      expect(
        actions.setAuthorizationTypeAsPresentation.assignment.authorizationType,
      ).toBe('presentation');
    });

    it('setPresentationAuthorizationSuccess sets true', () => {
      expect(
        actions.setPresentationAuthorizationSuccess.assignment
          .authorizationSuccess,
      ).toBe(true);
    });

    it('setSelectedKey calls selectCredentialRequestKey', () => {
      const fn = actions.setSelectedKey.assignment.keyType;
      const result = fn({wellknownKeyTypes: ['ES256']}, {data: 'someData'});
      expect(result).toBe('ES256');
    });

    it('setCredentialOfferIssuerWellknownResponse sets selectedIssuer and wellknown', () => {
      const asg = actions.setCredentialOfferIssuerWellknownResponse.assignment;
      const ev = {data: {credential_endpoint: 'ep', display: []}};
      expect(asg.selectedIssuer({}, ev)).toEqual(ev.data);
      expect(asg.selectedIssuerWellknownResponse({}, ev)).toEqual(ev.data);
    });

    it('setTokenRequestObject calls parseJSON on event.tokenRequest', () => {
      const fn = actions.setTokenRequestObject.assignment.tokenRequestObject;
      const result = fn(
        {},
        {tokenRequest: '{"grant_type":"authorization_code"}'},
      );
      expect(result).toEqual({grant_type: 'authorization_code'});
    });

    it('updateIssuerFromWellknown also sets selectedIssuerWellknownResponse', () => {
      const asg = actions.updateIssuerFromWellknown.assignment;
      const ev = {
        data: {
          credential_endpoint: 'ep',
          credential_configurations_supported: {},
          display: [{name: 'N'}],
          authorization_servers: [],
        },
      };
      expect(asg.selectedIssuerWellknownResponse({}, ev)).toEqual(ev.data);
    });
  });

  describe('plain function actions', () => {
    it('supportedCredentialTypes returns event.credentialTypes', () => {
      const result = actions.supportedCredentialTypes(
        {},
        {credentialTypes: ['type1']},
      );
      expect(result).toEqual(['type1']);
    });

    it('accessToken returns event.accessToken', () => {
      const result = actions.accessToken({}, {accessToken: 'tok'});
      expect(result).toBe('tok');
    });

    it('cNonce returns event.cNonce', () => {
      const result = actions.cNonce({}, {cNonce: 'nonce1'});
      expect(result).toBe('nonce1');
    });
  });

  describe('send-based actions', () => {
    it('getKeyPairFromStore to callback returns context.serviceRefs.store', () => {
      const action = actions.getKeyPairFromStore;
      expect(action.opts.to({serviceRefs: {store: 'store-ref'}})).toBe(
        'store-ref',
      );
    });

    it('sendBackupEvent to callback returns context.serviceRefs.backup', () => {
      const action = actions.sendBackupEvent;
      expect(action.opts.to({serviceRefs: {backup: 'backup-ref'}})).toBe(
        'backup-ref',
      );
    });

    it('storeVerifiableCredentialMeta event callback returns PREPEND event', () => {
      const action = actions.storeVerifiableCredentialMeta;
      const ctx = {vcMetadata: {id: 'vc1'}};
      const result = action.event(ctx);
      expect(result.type).toBe('PREPEND');
    });

    it('storeVerifiableCredentialMeta to callback returns store ref', () => {
      const action = actions.storeVerifiableCredentialMeta;
      expect(action.opts.to({serviceRefs: {store: 'store-ref'}})).toBe(
        'store-ref',
      );
    });

    it('storeVerifiableCredentialData event callback returns SET event', () => {
      const action = actions.storeVerifiableCredentialData;
      const ctx = {
        vcMetadata: {getVcKey: () => 'vc-key', id: 'vc1'},
        credentialWrapper: {verifiableCredential: {data: 'cred'}},
      };
      const result = action.event(ctx);
      expect(result.type).toBe('SET');
    });

    it('storeVerifiableCredentialData to callback returns store ref', () => {
      const action = actions.storeVerifiableCredentialData;
      expect(action.opts.to({serviceRefs: {store: 'store-ref'}})).toBe(
        'store-ref',
      );
    });

    it('storeVcMetaContext event callback returns VC_ADDED', () => {
      const action = actions.storeVcMetaContext;
      const ctx = {vcMetadata: {id: 'vc1'}};
      const result = action.event(ctx);
      expect(result.type).toBe('VC_ADDED');
      expect(result.vcMetadata).toEqual({id: 'vc1'});
    });

    it('storeVcMetaContext to callback returns vcMeta ref', () => {
      const action = actions.storeVcMetaContext;
      expect(action.opts.to({serviceRefs: {vcMeta: 'vc-meta-ref'}})).toBe(
        'vc-meta-ref',
      );
    });

    it('storeVcsContext event callback returns VC_DOWNLOADED', () => {
      const action = actions.storeVcsContext;
      const ctx = {vcMetadata: {id: 'vc1'}, credentialWrapper: {data: 'cw'}};
      const result = action.event(ctx);
      expect(result.type).toBe('VC_DOWNLOADED');
      expect(result.vcMetadata).toEqual({id: 'vc1'});
      expect(result.vc).toEqual({data: 'cw'});
    });

    it('storeVcsContext to callback returns vcMeta ref', () => {
      const action = actions.storeVcsContext;
      expect(action.opts.to({serviceRefs: {vcMeta: 'vc-meta-ref'}})).toBe(
        'vc-meta-ref',
      );
    });

    it('logDownloaded event callback returns LOG_ACTIVITY event', () => {
      const action = actions.logDownloaded;
      const ctx = {
        vcMetadata: {getVcKey: () => 'vc-key'},
        selectedIssuer: {credential_issuer_host: 'issuer-host'},
        selectedCredentialType: {id: 'cred-type'},
        credentialOfferCredentialIssuer: 'fallback-host',
        selectedIssuerWellknownResponse: {},
      };
      action.event(ctx);
      const {ActivityLogEvents} = require('../activityLog');
      expect(ActivityLogEvents.LOG_ACTIVITY).toHaveBeenCalled();
    });

    it('logDownloaded to callback returns activityLog ref', () => {
      const action = actions.logDownloaded;
      expect(action.opts.to({serviceRefs: {activityLog: 'log-ref'}})).toBe(
        'log-ref',
      );
    });

    it('sendDownloadingFailedToVcMeta event returns VC_DOWNLOADING_FAILED', () => {
      const action = actions.sendDownloadingFailedToVcMeta;
      const result = action.event({});
      expect(result.type).toBe('VC_DOWNLOADING_FAILED');
    });

    it('sendDownloadingFailedToVcMeta to callback returns vcMeta ref', () => {
      const action = actions.sendDownloadingFailedToVcMeta;
      expect(action.opts.to({serviceRefs: {vcMeta: 'vc-meta-ref'}})).toBe(
        'vc-meta-ref',
      );
    });
  });

  describe('xstate assign actions', () => {
    it('setVCMetadata calls getVCMetadata', () => {
      const {getVCMetadata} = require('../../shared/VCMetadata');
      getVCMetadata.mockReturnValue({id: 'vc1', verified: true});
      const fn = actions.setVCMetadata.assignment.vcMetadata;
      const result = fn({keyType: 'ES256'});
      expect(getVCMetadata).toHaveBeenCalledWith({keyType: 'ES256'}, 'ES256');
      expect(result).toEqual({id: 'vc1', verified: true});
    });

    it('setOpenId4VPRef spawns machine and returns service', () => {
      const {spawn} = require('xstate');
      const mockService = {subscribe: jest.fn()};
      spawn.mockReturnValue(mockService);
      const fn = actions.setOpenId4VPRef.assignment.OpenId4VPRef;
      const result = fn({serviceRefs: {store: 'store-ref'}});
      expect(spawn).toHaveBeenCalled();
      expect(result).toBe(mockService);
    });
  });

  describe('storeKeyPair execution', () => {
    it('storeKeyPair does nothing for ES256 key on non-iOS', async () => {
      const ctx = {keyType: 'ES256', publicKey: 'pub', privateKey: 'priv'};
      await expect(actions.storeKeyPair(ctx)).resolves.not.toThrow();
    });

    it('storeKeyPair does nothing for RS256 key on non-iOS', async () => {
      const ctx = {keyType: 'RS256', publicKey: 'pub', privateKey: 'priv'};
      await expect(actions.storeKeyPair(ctx)).resolves.not.toThrow();
    });
  });

  describe('direct functions', () => {
    it('sendVPScanData sends to OpenId4VPRef', () => {
      const mockSend = jest.fn();
      actions.sendVPScanData(
        {OpenId4VPRef: {send: mockSend}},
        {presentationRequest: 'pr'},
      );
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({type: 'AUTHENTICATE_VIA_PRESENTATION'}),
      );
    });

    it('sendPresentationAuthorizationError calls abortPresentationFlow', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const instance =
        require('../../shared/vciClient/VciClient').default.getInstance();
      instance.abortPresentationFlow.mockClear();
      actions.sendPresentationAuthorizationError({}, {error: 'auth-err'});
      expect(instance.abortPresentationFlow).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('sendPresentationAuthorizationImpressionEvent fires impression', () => {
      const {
        sendImpressionEvent,
      } = require('../../shared/telemetry/TelemetryUtils');
      sendImpressionEvent.mockClear();
      actions.sendPresentationAuthorizationImpressionEvent();
      expect(sendImpressionEvent).toHaveBeenCalled();
    });

    it('storeKeyPair is defined', () => {
      expect(actions.storeKeyPair).toBeDefined();
    });
  });
});
