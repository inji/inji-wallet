jest.mock('xstate', () => ({
  assign: jest.fn(arg => ({type: 'xstate.assign', assignment: arg})),
  send: jest.fn((event, opts) => ({type: 'xstate.send', event, opts})),
}));
jest.mock('../../../shared/Utils', () => ({
  CommunicationDetails: {},
  UUID: {generate: jest.fn(() => 'uuid-1234')},
  VerificationStatus: {
    VALID: 'VALID',
    REVOKED: 'REVOKED',
    EXPIRED: 'EXPIRED',
    PENDING: 'PENDING',
  },
}));
jest.mock('../../store', () => ({
  StoreEvents: {
    SET: jest.fn((key, val) => ({type: 'SET', key, val})),
    GET: jest.fn(key => ({type: 'GET', key})),
    REMOVE: jest.fn((key, vcKey) => ({type: 'REMOVE', key, vcKey})),
    REMOVE_VC_METADATA: jest.fn((key, vcKey) => ({
      type: 'REMOVE_VC_METADATA',
      key,
      vcKey,
    })),
    REMOVE_ITEMS: jest.fn(),
  },
}));
jest.mock('../../../shared/VCMetadata', () => ({
  VCMetadata: jest.fn().mockImplementation(obj => ({
    ...obj,
    getVcKey: () => obj?.id || 'vc-key',
  })),
}));
const MockVCMetadata = require('../../../shared/VCMetadata').VCMetadata;
(MockVCMetadata as any).fromVC = jest.fn(vc => ({
  ...vc,
  getVcKey: () => vc?.id || 'vc-key',
}));

jest.mock('../../../shared/constants', () => ({
  EXPIRED_VC_ERROR_CODE: 'expired',
  MIMOTO_BASE_URL: 'https://mimoto.example.com',
  MY_VCS_STORE_KEY: 'myVCs',
}));
jest.mock('../../../i18n', () => ({
  __esModule: true,
  default: {t: jest.fn(() => 'translated error')},
}));
jest.mock('../../../screens/Home/HomeScreenController', () => ({
  getHomeMachineService: jest.fn(() => ({})),
}));
jest.mock('../../../shared/api', () => ({}));
jest.mock('../../../shared/cryptoutil/cryptoUtil', () => ({
  isHardwareKeystoreExists: false,
}));
jest.mock('../../../shared/keystore/SecureKeystore', () => ({
  getBindingCertificateConstant: jest.fn(id => `binding_${id}`),
}));
jest.mock('../../../shared/openId4VCI/Utils', () => ({
  getVcVerificationDetails: jest.fn(() => ({statusType: 'SUCCESS'})),
}));
jest.mock('../../../shared/telemetry/TelemetryConstants', () => ({
  TelemetryConstants: {
    FlowType: {
      vcActivation: 'vcActivation',
      vcActivationFromKebab: 'vcActivationFromKebab',
      vcDownload: 'vcDownload',
    },
    InteractEventSubtype: {click: 'click'},
    EndEventStatus: {success: 'success', failure: 'failure'},
    ErrorId: {activationFailed: 'activation_failed', userCancel: 'user_cancel'},
    ErrorMessage: {activationCancelled: 'activation cancelled'},
  },
}));
jest.mock('../../../shared/telemetry/TelemetryUtils', () => ({
  sendStartEvent: jest.fn(),
  getStartEventData: jest.fn(),
  sendInteractEvent: jest.fn(),
  getInteractEventData: jest.fn(),
  sendEndEvent: jest.fn(),
  getEndEventData: jest.fn(),
  sendErrorEvent: jest.fn(),
  getErrorEventData: jest.fn(),
}));
jest.mock('../../activityLog', () => ({
  ActivityLogEvents: {LOG_ACTIVITY: jest.fn()},
}));
jest.mock('../../backupAndRestore/backup/backupMachine', () => ({
  BackupEvents: {DATA_BACKUP: jest.fn(() => ({type: 'DATA_BACKUP'}))},
}));
jest.mock('../VCMetaMachine/VCMetaMachine', () => ({
  VcMetaEvents: {
    VC_METADATA_UPDATED: jest.fn(m => ({type: 'VC_METADATA_UPDATED', ...m})),
  },
}));
jest.mock('../../../components/BannerNotification', () => ({
  BannerStatusType: {
    IN_PROGRESS: 'in_progress',
    SUCCESS: 'success',
    ERROR: 'error',
  },
}));
jest.mock('../../../components/ActivityLogEvent', () => ({
  VCActivityLog: {getLogFromObject: jest.fn(obj => obj)},
}));
jest.mock('../../../shared/vcVerifier/VcVerifier', () => ({
  RevocationStatus: {
    FALSE: 'false',
    TRUE: 'true',
    UNDETERMINED: 'undetermined',
  },
}));

import {VCItemActions} from './VCItemActions';

describe('VCItemActions', () => {
  const mockModel = {
    assign: jest.fn(arg => ({type: 'model.assign', assignment: arg})),
    events: {
      POLL: jest.fn(),
      DOWNLOAD_READY: jest.fn(),
      FAILED: jest.fn(),
      CREDENTIAL_DOWNLOADED: jest.fn(),
    },
  };
  let actions: ReturnType<typeof VCItemActions>;

  beforeEach(() => {
    jest.clearAllMocks();
    actions = VCItemActions(mockModel);
  });

  it('should return all expected action definitions', () => {
    const expectedActions = [
      'setIsVerified',
      'resetIsVerified',
      'setVerificationStatus',
      'sendReverificationSuccessToVcMeta',
      'resetStatusChangedFlag',
      'sendReverificationFailureToVcMeta',
      'logStatusChangedOnReverification',
      'resetVerificationStatus',
      'showVerificationBannerStatus',
      'sendVerificationStatusToVcMeta',
      'removeVerificationStatusFromVcMeta',
      'setCommunicationDetails',
      'requestVcContext',
      'sendDownloadingFailedToVcMeta',
      'setContext',
      'storeContext',
      'setVcMetadata',
      'updateWellknownResponse',
      'storeVcInContext',
      'updateVcMetadata',
      'removeVcMetaDataFromStorage',
      'removeVcMetaDataFromVcMachineContext',
      'sendDownloadLimitExpire',
      'sendVerificationError',
      'refreshAllVcs',
      'setPinCard',
      'resetIsMachineInKebabPopupState',
      'sendBackupEvent',
      'setErrorAsWalletBindingError',
      'setErrorAsVerificationError',
      'unSetError',
      'unSetBindingTransactionId',
      'sendWalletBindingSuccess',
      'setWalletBindingResponse',
      'incrementDownloadCounter',
      'setMaxDownloadCount',
      'setDownloadInterval',
      'sendActivationStartEvent',
      'sendUserCancelledActivationFailedEndEvent',
      'sendWalletBindingErrorEvent',
      'sendActivationSuccessEvent',
      'setPublicKey',
      'setPrivateKey',
      'resetPrivateKey',
      'setThumbprintForWalletBindingId',
      'setOTP',
      'unSetOTP',
      'removeVcItem',
      'setVcKey',
      'removeVcFromInProgressDownloads',
      'addVcToInProgressDownloads',
      'sendTelemetryEvents',
      'closeViewVcModal',
      'logDownloaded',
      'logRemovedVc',
      'logWalletBindingSuccess',
      'logWalletBindingFailure',
    ];
    for (const name of expectedActions) {
      expect(actions).toHaveProperty(name);
    }
  });

  it('sendActivationStartEvent fires telemetry', () => {
    const {
      sendStartEvent,
      sendInteractEvent,
    } = require('../../../shared/telemetry/TelemetryUtils');
    actions.sendActivationStartEvent({isMachineInKebabPopupState: false});
    expect(sendStartEvent).toHaveBeenCalled();
    expect(sendInteractEvent).toHaveBeenCalled();
  });

  it('sendActivationSuccessEvent fires success telemetry', () => {
    const {sendEndEvent} = require('../../../shared/telemetry/TelemetryUtils');
    actions.sendActivationSuccessEvent({
      isMachineInKebabPopupState: false,
      vcMetadata: {downloadKeyType: 'ES256'},
    });
    expect(sendEndEvent).toHaveBeenCalled();
  });

  it('sendActivationSuccessEvent handles undefined downloadKeyType', () => {
    const {sendEndEvent} = require('../../../shared/telemetry/TelemetryUtils');
    sendEndEvent.mockClear();
    actions.sendActivationSuccessEvent({
      isMachineInKebabPopupState: false,
      vcMetadata: {} as any,
    });
    expect(sendEndEvent).toHaveBeenCalled();
  });

  it('sendTelemetryEvents fires end event', () => {
    const {sendEndEvent} = require('../../../shared/telemetry/TelemetryUtils');
    actions.sendTelemetryEvents();
    expect(sendEndEvent).toHaveBeenCalled();
  });

  it('sendUserCancelledActivationFailedEndEvent fires failure telemetry', () => {
    const {sendEndEvent} = require('../../../shared/telemetry/TelemetryUtils');
    actions.sendUserCancelledActivationFailedEndEvent({
      isMachineInKebabPopupState: true,
    });
    expect(sendEndEvent).toHaveBeenCalled();
  });

  // --- xstate assign-based actions ---

  describe('setIsVerified', () => {
    it('sets vcMetadata with isVerified=true and tracks status change', () => {
      const fn = actions.setIsVerified.assignment;
      const ctx = {
        vcMetadata: {
          id: 'v1',
          isVerified: false,
          isRevoked: 'false',
          isExpired: false,
        },
      };
      const evt = {data: {isRevoked: 'true', verificationErrorCode: 'expired'}};
      const result = fn(ctx, evt);
      expect(result.vcMetadata.isVerified).toBe(true);
      expect(result.vcMetadata.isRevoked).toBe('true');
      expect(result.vcMetadata.isExpired).toBe(true);
      expect(result.statusChangedDuringVerification).toBe(true);
    });

    it('statusChangedDuringVerification false when nothing changed', () => {
      const fn = actions.setIsVerified.assignment;
      const ctx = {
        vcMetadata: {
          id: 'v1',
          isVerified: true,
          isRevoked: 'false',
          isExpired: false,
        },
      };
      const evt = {data: {isRevoked: 'false', verificationErrorCode: 'none'}};
      const result = fn(ctx, evt);
      expect(result.statusChangedDuringVerification).toBe(false);
    });
  });

  describe('resetIsVerified', () => {
    it('sets isVerified false and tracks status change', () => {
      const fn = actions.resetIsVerified.assignment;
      const ctx = {
        vcMetadata: {
          id: 'v1',
          isVerified: true,
          isRevoked: 'true',
          isExpired: true,
        },
      };
      const result = fn(ctx, {} as any);
      expect(result.vcMetadata.isVerified).toBe(false);
      expect(result.vcMetadata.isRevoked).toBe('false');
      expect(result.vcMetadata.isExpired).toBe(false);
      expect(result.statusChangedDuringVerification).toBe(true);
    });

    it('statusChangedDuringVerification false when already not verified', () => {
      const fn = actions.resetIsVerified.assignment;
      const ctx = {vcMetadata: {id: 'v1', isVerified: false}};
      const result = fn(ctx, {} as any);
      expect(result.statusChangedDuringVerification).toBe(false);
    });
  });

  describe('setVerificationStatus', () => {
    it('calls getVcVerificationDetails with correct statusType', () => {
      const {
        getVcVerificationDetails,
      } = require('../../../shared/openId4VCI/Utils');
      const fn = actions.setVerificationStatus.assignment.verificationStatus;
      const ctx = {
        vcMetadata: {id: 'v1'},
        verifiableCredential: {},
        wellknownResponse: {},
      };
      const evt = {
        response: {statusType: 'in_progress', vcMetadata: {isVerified: false}},
      };
      fn(ctx, evt);
      expect(getVcVerificationDetails).toHaveBeenCalled();
    });

    it('uses SUCCESS when not in progress and verified', () => {
      const {
        getVcVerificationDetails,
      } = require('../../../shared/openId4VCI/Utils');
      getVcVerificationDetails.mockClear();
      const fn = actions.setVerificationStatus.assignment.verificationStatus;
      const ctx = {
        vcMetadata: {},
        verifiableCredential: {},
        wellknownResponse: {},
      };
      const evt = {
        response: {statusType: 'other', vcMetadata: {isVerified: true}},
      };
      fn(ctx, evt);
      expect(getVcVerificationDetails).toHaveBeenCalledWith(
        'success',
        expect.anything(),
        expect.anything(),
        expect.anything(),
      );
    });

    it('uses ERROR when not in progress and not verified', () => {
      const {
        getVcVerificationDetails,
      } = require('../../../shared/openId4VCI/Utils');
      getVcVerificationDetails.mockClear();
      const fn = actions.setVerificationStatus.assignment.verificationStatus;
      const ctx = {
        vcMetadata: {},
        verifiableCredential: {},
        wellknownResponse: {},
      };
      const evt = {
        response: {statusType: 'other', vcMetadata: {isVerified: false}},
      };
      fn(ctx, evt);
      expect(getVcVerificationDetails).toHaveBeenCalledWith(
        'error',
        expect.anything(),
        expect.anything(),
        expect.anything(),
      );
    });
  });

  describe('resetStatusChangedFlag', () => {
    it('sets statusChangedDuringVerification to false', () => {
      const fn =
        actions.resetStatusChangedFlag.assignment
          .statusChangedDuringVerification;
      expect(fn()).toBe(false);
    });
  });

  describe('resetVerificationStatus', () => {
    it('returns null when not in progress', () => {
      const fn = actions.resetVerificationStatus.assignment.verificationStatus;
      const ctx = {verificationStatus: {statusType: 'success'}};
      expect(fn(ctx)).toBeNull();
    });

    it('returns existing when in progress', () => {
      const fn = actions.resetVerificationStatus.assignment.verificationStatus;
      const ctx = {verificationStatus: {statusType: 'in_progress'}};
      expect(fn(ctx)).toEqual({statusType: 'in_progress'});
    });

    it('returns null when verificationStatus is null', () => {
      const fn = actions.resetVerificationStatus.assignment.verificationStatus;
      const ctx = {verificationStatus: null};
      expect(fn(ctx)).toBeNull();
    });

    it('sets showVerificationStatusBanner to false', () => {
      const fn =
        actions.resetVerificationStatus.assignment.showVerificationStatusBanner;
      expect(fn()).toBe(false);
    });
  });

  describe('showVerificationBannerStatus', () => {
    it('sets showVerificationStatusBanner to true', () => {
      const fn =
        actions.showVerificationBannerStatus.assignment
          .showVerificationStatusBanner;
      expect(fn()).toBe(true);
    });
  });

  describe('setCommunicationDetails', () => {
    it('returns communication details from event data', () => {
      const fn =
        actions.setCommunicationDetails.assignment.communicationDetails;
      const evt = {
        data: {response: {maskedMobile: '***1234', maskedEmail: 't@e.com'}},
      };
      const result = fn({}, evt);
      expect(result).toEqual({phoneNumber: '***1234', emailId: 't@e.com'});
    });
  });

  describe('setContext', () => {
    it('merges event response into context and generates id if missing', () => {
      const fn = actions.setContext.assignment;
      const ctx = {vcMetadata: {issuer: 'issuer1'}, existing: 'data'};
      const evt = {response: {newField: 'val'}};
      const result = fn(ctx, evt);
      expect(result.newField).toBe('val');
      expect(result.existing).toBe('data');
      expect(result.vcMetadata).toBeDefined();
    });
  });

  describe('setVcMetadata', () => {
    it('sets vcMetadata from event', () => {
      const fn = actions.setVcMetadata.assignment.vcMetadata;
      const evt = {vcMetadata: {id: 'new-vc'}};
      expect(fn({}, evt)).toEqual({id: 'new-vc'});
    });
  });

  describe('updateWellknownResponse', () => {
    it('sets wellknownResponse from event data', () => {
      const fn = actions.updateWellknownResponse.assignment.wellknownResponse;
      const evt = {data: {config: 'abc'}};
      expect(fn({}, evt)).toEqual({config: 'abc'});
    });
  });

  describe('setPinCard', () => {
    it('toggles isPinned on vcMetadata', () => {
      const fn = actions.setPinCard.assignment.vcMetadata;
      const ctx = {vcMetadata: {id: 'v1', isPinned: false}};
      const result = fn(ctx, {});
      expect(result.isPinned).toBe(true);
    });

    it('unpins if already pinned', () => {
      const fn = actions.setPinCard.assignment.vcMetadata;
      const ctx = {vcMetadata: {id: 'v1', isPinned: true}};
      const result = fn(ctx, {});
      expect(result.isPinned).toBe(false);
    });
  });

  describe('resetIsMachineInKebabPopupState', () => {
    it('sets to false', () => {
      const fn =
        actions.resetIsMachineInKebabPopupState.assignment
          .isMachineInKebabPopupState;
      expect(fn()).toBe(false);
    });
  });

  describe('setErrorAsWalletBindingError', () => {
    it('sets error to translated error string', () => {
      const fn = actions.setErrorAsWalletBindingError.assignment.error;
      const result = fn();
      expect(typeof result).toBe('string');
    });
  });

  describe('setErrorAsVerificationError', () => {
    it('sets error from event data message', () => {
      const fn = actions.setErrorAsVerificationError.assignment.error;
      const evt = {data: {message: 'verification failed'}};
      expect(fn({}, evt)).toBe('verification failed');
    });
  });

  describe('unSetError', () => {
    it('sets error to empty string', () => {
      const fn = actions.unSetError.assignment.error;
      expect(fn()).toBe('');
    });
  });

  describe('unSetBindingTransactionId', () => {
    it('sets bindingTransactionId to empty string', () => {
      const fn =
        actions.unSetBindingTransactionId.assignment.bindingTransactionId;
      expect(fn()).toBe('');
    });
  });

  describe('setWalletBindingResponse', () => {
    it('returns event data', () => {
      const fn =
        actions.setWalletBindingResponse.assignment.walletBindingResponse;
      const evt = {data: {walletBindingId: 'wb1', thumbprint: 'tp1'}};
      expect(fn({}, evt)).toEqual({walletBindingId: 'wb1', thumbprint: 'tp1'});
    });
  });

  describe('incrementDownloadCounter', () => {
    it('increments by 1', () => {
      const fn = actions.incrementDownloadCounter.assignment.downloadCounter;
      expect(fn({downloadCounter: 2})).toBe(3);
    });
  });

  describe('setMaxDownloadCount', () => {
    it('sets from event data maxDownloadLimit', () => {
      const fn = actions.setMaxDownloadCount.assignment.maxDownloadCount;
      const evt = {data: {maxDownloadLimit: '10'}};
      expect(fn({}, evt)).toBe(10);
    });
  });

  describe('setDownloadInterval', () => {
    it('sets from event data downloadInterval', () => {
      const fn = actions.setDownloadInterval.assignment.downloadInterval;
      const evt = {data: {downloadInterval: '5000'}};
      expect(fn({}, evt)).toBe(5000);
    });
  });

  describe('setPublicKey', () => {
    it('sets publicKey from event data', () => {
      const fn = actions.setPublicKey.assignment.publicKey;
      const evt = {data: {publicKey: 'pub-key-123'}};
      expect(fn({}, evt)).toBe('pub-key-123');
    });
  });

  describe('setPrivateKey', () => {
    it('sets privateKey from event data', () => {
      const fn = actions.setPrivateKey.assignment.privateKey;
      const evt = {data: {privateKey: 'priv-key-456'}};
      expect(fn({}, evt)).toBe('priv-key-456');
    });
  });

  describe('resetPrivateKey', () => {
    it('resets to empty string', () => {
      const fn = actions.resetPrivateKey.assignment.privateKey;
      expect(fn()).toBe('');
    });
  });

  describe('setOTP', () => {
    it('sets OTP from event', () => {
      const fn = actions.setOTP.assignment.OTP;
      expect(fn({}, {OTP: '123456'})).toBe('123456');
    });
  });

  describe('unSetOTP', () => {
    it('resets OTP to empty string', () => {
      const fn = actions.unSetOTP.assignment.OTP;
      expect(fn()).toBe('');
    });
  });

  describe('setVcKey', () => {
    it('sets vcMetadata from event', () => {
      const fn = actions.setVcKey.assignment.vcMetadata;
      const evt = {vcMetadata: {id: 'key123'}};
      expect(fn({}, evt)).toEqual({id: 'key123'});
    });
  });

  // --- send-based actions ---

  describe('sendVerificationStatusToVcMeta', () => {
    it('creates correct event type', () => {
      const action = actions.sendVerificationStatusToVcMeta;
      const ctx = {
        verificationStatus: {statusType: 'success'},
        serviceRefs: {vcMeta: {}},
      };
      const evtFn = action.event;
      const result = evtFn(ctx);
      expect(result.type).toBe('SET_VERIFICATION_STATUS');
      expect(result.verificationStatus).toEqual({statusType: 'success'});
    });
  });

  describe('removeVerificationStatusFromVcMeta', () => {
    it('creates correct event type', () => {
      const action = actions.removeVerificationStatusFromVcMeta;
      const evtFn = action.event;
      const ctx = {verificationStatus: {statusType: 'error'}};
      const result = evtFn(ctx);
      expect(result.type).toBe('RESET_VERIFICATION_STATUS');
    });
  });

  describe('requestVcContext', () => {
    it('creates GET_VC_ITEM event', () => {
      const action = actions.requestVcContext;
      const evtFn = action.event;
      const ctx = {vcMetadata: {id: 'v1'}, serviceRefs: {vcMeta: {}}};
      const result = evtFn(ctx);
      expect(result.type).toBe('GET_VC_ITEM');
      expect(result.vcMetadata).toEqual({id: 'v1'});
    });
  });

  describe('sendDownloadingFailedToVcMeta', () => {
    it('creates VC_DOWNLOADING_FAILED event', () => {
      const action = actions.sendDownloadingFailedToVcMeta;
      const evtFn = action.event;
      const result = evtFn({});
      expect(result.type).toBe('VC_DOWNLOADING_FAILED');
    });
  });

  describe('storeContext', () => {
    it('creates SET store event', () => {
      const {StoreEvents} = require('../../store');
      const action = actions.storeContext;
      const evtFn = action.event;
      const ctx = {
        serviceRefs: {store: {}},
        isMachineInKebabPopupState: false,
        verificationStatus: null,
        showVerificationStatusBanner: false,
        vcMetadata: {id: 'v1', getVcKey: () => 'vc-key'},
        credentialRegistry: '',
      };
      evtFn(ctx);
      expect(StoreEvents.SET).toHaveBeenCalled();
    });
  });

  describe('storeVcInContext', () => {
    it('creates VC_DOWNLOADED event', () => {
      const action = actions.storeVcInContext;
      const evtFn = action.event;
      const ctx = {
        serviceRefs: {vcMeta: {}},
        wellknownResponse: {},
        vcMetadata: {id: 'v1'},
        someData: 'data',
      };
      const result = evtFn(ctx);
      expect(result.type).toBe('VC_DOWNLOADED');
      expect(result.vcMetadata).toEqual({id: 'v1'});
    });
  });

  describe('sendDownloadLimitExpire', () => {
    it('creates DOWNLOAD_LIMIT_EXPIRED event', () => {
      const action = actions.sendDownloadLimitExpire;
      const evtFn = action.event;
      const ctx = {vcMetadata: {id: 'v1'}};
      const result = evtFn(ctx, {});
      expect(result.type).toBe('DOWNLOAD_LIMIT_EXPIRED');
    });
  });

  describe('sendVerificationError', () => {
    it('creates VERIFY_VC_FAILED event', () => {
      const action = actions.sendVerificationError;
      const evtFn = action.event;
      const ctx = {error: 'some error', vcMetadata: {id: 'v1'}};
      const result = evtFn(ctx, {});
      expect(result.type).toBe('VERIFY_VC_FAILED');
      expect(result.errorMessage).toBe('some error');
    });
  });

  describe('refreshAllVcs', () => {
    it('creates REFRESH_MY_VCS event', () => {
      const action = actions.refreshAllVcs;
      const evtFn = action.event;
      const result = evtFn();
      expect(result.type).toBe('REFRESH_MY_VCS');
    });
  });

  describe('sendReverificationSuccessToVcMeta', () => {
    it('sends REVERIFY_VC_SUCCESS when not undetermined', () => {
      const action = actions.sendReverificationSuccessToVcMeta;
      const evtFn = action.event;
      const ctx = {
        vcMetadata: {
          id: 'v1',
          isRevoked: 'false',
          isExpired: false,
          isVerified: true,
          credentialType: 'ct',
          getVcKey: () => 'vc-key',
        },
      };
      const result = evtFn(ctx);
      expect(result.type).toBe('REVERIFY_VC_SUCCESS');
      expect(result.statusValue).toBe('VALID');
    });

    it('sends REVERIFY_VC_FAILED when undetermined', () => {
      const action = actions.sendReverificationSuccessToVcMeta;
      const evtFn = action.event;
      const ctx = {
        vcMetadata: {
          id: 'v1',
          isRevoked: 'undetermined',
          isExpired: false,
          isVerified: false,
          credentialType: 'ct',
          getVcKey: () => 'vc-key',
        },
      };
      const result = evtFn(ctx);
      expect(result.type).toBe('REVERIFY_VC_FAILED');
    });

    it('returns REVOKED status when isRevoked is true', () => {
      const action = actions.sendReverificationSuccessToVcMeta;
      const evtFn = action.event;
      const ctx = {
        vcMetadata: {
          id: 'v1',
          isRevoked: 'true',
          isExpired: false,
          isVerified: true,
          credentialType: 'ct',
          getVcKey: () => 'vc-key',
        },
      };
      const result = evtFn(ctx);
      expect(result.statusValue).toBe('REVOKED');
    });

    it('returns EXPIRED status when expired', () => {
      const action = actions.sendReverificationSuccessToVcMeta;
      const evtFn = action.event;
      const ctx = {
        vcMetadata: {
          id: 'v1',
          isRevoked: 'false',
          isExpired: true,
          isVerified: true,
          credentialType: 'ct',
          getVcKey: () => 'vc-key',
        },
      };
      const result = evtFn(ctx);
      expect(result.statusValue).toBe('EXPIRED');
    });
  });

  describe('sendReverificationFailureToVcMeta', () => {
    it('sends REVERIFY_VC_FAILED with PENDING', () => {
      const action = actions.sendReverificationFailureToVcMeta;
      const evtFn = action.event;
      const ctx = {
        vcMetadata: {id: 'v1', credentialType: 'ct', getVcKey: () => 'vc-key'},
      };
      const result = evtFn(ctx);
      expect(result.type).toBe('REVERIFY_VC_FAILED');
      expect(result.statusValue).toBe('PENDING');
    });
  });

  describe('sendWalletBindingSuccess', () => {
    it('sends WALLET_BINDING_SUCCESS event', () => {
      const action = actions.sendWalletBindingSuccess;
      const evtFn = action.event;
      const ctx = {
        serviceRefs: {vcMeta: {}},
        isMachineInKebabPopupState: false,
        verificationStatus: null,
        showVerificationStatusBanner: false,
        vcMetadata: {id: 'v1', getVcKey: () => 'vc-key'},
        data1: 'a',
      };
      const result = evtFn(ctx);
      expect(result.type).toBe('WALLET_BINDING_SUCCESS');
      expect(result.vcKey).toBe('vc-key');
    });
  });

  describe('removeVcItem send event', () => {
    it('creates REMOVE store event', () => {
      const {StoreEvents} = require('../../store');
      const action = actions.removeVcItem;
      const evtFn = action.event;
      const ctx = {
        vcMetadata: {id: 'v1', getVcKey: () => 'vc-key'},
        serviceRefs: {store: {}},
      };
      evtFn(ctx);
      expect(StoreEvents.REMOVE).toHaveBeenCalled();
    });
  });

  describe('removeVcFromInProgressDownloads send', () => {
    it('creates correct event', () => {
      const action = actions.removeVcFromInProgressDownloads;
      const evtFn = action.event;
      const ctx = {vcMetadata: {id: 'v1'}};
      const result = evtFn(ctx);
      expect(result.type).toBe('REMOVE_VC_FROM_IN_PROGRESS_DOWNLOADS');
    });
  });

  describe('addVcToInProgressDownloads send', () => {
    it('creates correct event', () => {
      const action = actions.addVcToInProgressDownloads;
      const evtFn = action.event;
      const ctx = {vcMetadata: {requestId: 'req-1'}};
      const result = evtFn(ctx);
      expect(result.type).toBe('ADD_VC_TO_IN_PROGRESS_DOWNLOADS');
      expect(result.requestId).toBe('req-1');
    });
  });

  describe('sendWalletBindingErrorEvent', () => {
    it('fires error and end events', () => {
      const {
        sendErrorEvent,
        sendEndEvent,
      } = require('../../../shared/telemetry/TelemetryUtils');
      const ctx = {error: 'some error'};
      const evt = {data: {name: 'ErrorName'}};
      actions.sendWalletBindingErrorEvent(ctx, evt);
      expect(sendErrorEvent).toHaveBeenCalled();
      expect(sendEndEvent).toHaveBeenCalled();
    });

    it('fires only end event when no error', () => {
      const {
        sendErrorEvent,
        sendEndEvent,
      } = require('../../../shared/telemetry/TelemetryUtils');
      sendErrorEvent.mockClear();
      sendEndEvent.mockClear();
      const ctx = {error: ''};
      const evt = {data: {}};
      actions.sendWalletBindingErrorEvent(ctx, evt);
      expect(sendErrorEvent).not.toHaveBeenCalled();
      expect(sendEndEvent).toHaveBeenCalled();
    });
  });

  describe('sendActivationStartEvent - kebab flow', () => {
    it('fires telemetry with kebab flow type', () => {
      const {
        sendStartEvent,
        sendInteractEvent,
      } = require('../../../shared/telemetry/TelemetryUtils');
      sendStartEvent.mockClear();
      sendInteractEvent.mockClear();
      actions.sendActivationStartEvent({isMachineInKebabPopupState: true});
      expect(sendStartEvent).toHaveBeenCalled();
      expect(sendInteractEvent).toHaveBeenCalled();
    });
  });

  describe('logStatusChangedOnReverification send', () => {
    it('sends LOG_ACTIVITY for revoked VC', () => {
      const {ActivityLogEvents} = require('../../activityLog');
      const action = actions.logStatusChangedOnReverification;
      const evtFn = action.event;
      const ctx = {
        vcMetadata: {
          id: 'v1',
          isRevoked: 'true',
          isExpired: false,
          isVerified: true,
          credentialType: 'ct',
          getVcKey: () => 'vc-key',
          issuerHost: 'host',
        },
        verifiableCredential: {credentialConfigurationId: 'cfg'},
      };
      evtFn(ctx);
      expect(ActivityLogEvents.LOG_ACTIVITY).toHaveBeenCalled();
    });
  });

  describe('updateVcMetadata send', () => {
    it('fires VC_METADATA_UPDATED event', () => {
      const {VcMetaEvents} = require('../VCMetaMachine/VCMetaMachine');
      const action = actions.updateVcMetadata;
      const evtFn = action.event;
      const ctx = {vcMetadata: {id: 'v1'}};
      evtFn(ctx);
      expect(VcMetaEvents.VC_METADATA_UPDATED).toHaveBeenCalled();
    });
  });

  describe('removeVcMetaDataFromStorage send', () => {
    it('fires REMOVE_VC_METADATA event', () => {
      const {StoreEvents} = require('../../store');
      const action = actions.removeVcMetaDataFromStorage;
      const evtFn = action.event;
      const ctx = {vcMetadata: {id: 'v1', getVcKey: () => 'vc-key'}};
      evtFn(ctx);
      expect(StoreEvents.REMOVE_VC_METADATA).toHaveBeenCalled();
    });
  });

  describe('removeVcMetaDataFromVcMachineContext send', () => {
    it('creates REMOVE_VC_FROM_CONTEXT event', () => {
      const action = actions.removeVcMetaDataFromVcMachineContext;
      const evtFn = action.event;
      const ctx = {vcMetadata: {id: 'v1'}};
      const result = evtFn(ctx);
      expect(result.type).toBe('REMOVE_VC_FROM_CONTEXT');
    });
  });

  describe('sendBackupEvent', () => {
    it('is defined with DATA_BACKUP', () => {
      const {
        BackupEvents,
      } = require('../../backupAndRestore/backup/backupMachine');
      expect(BackupEvents.DATA_BACKUP).toHaveBeenCalled();
      expect(actions.sendBackupEvent).toBeDefined();
    });
  });

  describe('closeViewVcModal send', () => {
    it('is defined', () => {
      expect(actions.closeViewVcModal).toBeDefined();
    });
  });

  describe('logDownloaded send', () => {
    it('logs VC_DOWNLOADED activity', () => {
      const {ActivityLogEvents} = require('../../activityLog');
      const action = actions.logDownloaded;
      const evtFn = action.event;
      const ctx = {
        vcMetadata: {id: 'v1', getVcKey: () => 'vc-key', issuerHost: 'host'},
        verifiableCredential: {credentialConfigurationId: 'cfg'},
      };
      evtFn(ctx);
      expect(ActivityLogEvents.LOG_ACTIVITY).toHaveBeenCalled();
    });
  });

  describe('logRemovedVc send', () => {
    it('logs VC_REMOVED activity', () => {
      const {ActivityLogEvents} = require('../../activityLog');
      ActivityLogEvents.LOG_ACTIVITY.mockClear();
      const action = actions.logRemovedVc;
      const evtFn = action.event;
      const ctx = {
        vcMetadata: {id: 'v1', getVcKey: () => 'vc-key', issuerHost: 'host'},
        verifiableCredential: {credentialConfigurationId: 'cfg'},
      };
      evtFn(ctx, {});
      expect(ActivityLogEvents.LOG_ACTIVITY).toHaveBeenCalled();
    });
  });

  describe('logWalletBindingSuccess send', () => {
    it('logs WALLET_BINDING_SUCCESSFULL activity', () => {
      const {ActivityLogEvents} = require('../../activityLog');
      ActivityLogEvents.LOG_ACTIVITY.mockClear();
      const action = actions.logWalletBindingSuccess;
      const evtFn = action.event;
      const ctx = {
        vcMetadata: {id: 'v1', getVcKey: () => 'vc-key', issuerHost: 'host'},
        verifiableCredential: {credentialConfigurationId: 'cfg'},
      };
      evtFn(ctx);
      expect(ActivityLogEvents.LOG_ACTIVITY).toHaveBeenCalled();
    });
  });

  describe('logWalletBindingFailure send', () => {
    it('logs WALLET_BINDING_FAILURE activity', () => {
      const {ActivityLogEvents} = require('../../activityLog');
      ActivityLogEvents.LOG_ACTIVITY.mockClear();
      const action = actions.logWalletBindingFailure;
      const evtFn = action.event;
      const ctx = {
        vcMetadata: {id: 'v1', getVcKey: () => 'vc-key', issuerHost: 'host'},
        verifiableCredential: {credentialConfigurationId: 'cfg'},
      };
      evtFn(ctx);
      expect(ActivityLogEvents.LOG_ACTIVITY).toHaveBeenCalled();
    });
  });

  describe('setThumbprintForWalletBindingId send', () => {
    it('fires SET on store', () => {
      const {StoreEvents} = require('../../store');
      StoreEvents.SET.mockClear();
      const action = actions.setThumbprintForWalletBindingId;
      const evtFn = action.event;
      const ctx = {
        walletBindingResponse: {walletBindingId: 'wb1', thumbprint: 'tp1'},
        serviceRefs: {store: {}},
      };
      evtFn(ctx);
      expect(StoreEvents.SET).toHaveBeenCalled();
    });
  });

  describe('sendActivationSuccessEvent - kebab path', () => {
    it('fires end event for kebab flow', () => {
      const {
        sendEndEvent,
      } = require('../../../shared/telemetry/TelemetryUtils');
      sendEndEvent.mockClear();
      actions.sendActivationSuccessEvent({
        isMachineInKebabPopupState: true,
        vcMetadata: {downloadKeyType: 'RSA'},
      });
      expect(sendEndEvent).toHaveBeenCalled();
    });
  });

  describe('send action to callbacks', () => {
    const mockServiceRefs = {
      vcMeta: 'vcMeta-ref',
      store: 'store-ref',
      activityLog: 'activityLog-ref',
      backup: 'backup-ref',
    };

    it('sendReverificationSuccessToVcMeta to returns vcMeta ref', () => {
      expect(
        actions.sendReverificationSuccessToVcMeta.opts.to({
          serviceRefs: mockServiceRefs,
        }),
      ).toBe('vcMeta-ref');
    });

    it('sendReverificationSuccessToVcMeta VALID status for verified non-revoked', () => {
      const fn = actions.sendReverificationSuccessToVcMeta.event;
      const ctx = {
        vcMetadata: {
          isRevoked: 'false',
          isExpired: false,
          isVerified: true,
          getVcKey: () => 'k',
          credentialType: 'vc',
        },
      };
      const result = fn(ctx);
      expect(result.type).toBe('REVERIFY_VC_SUCCESS');
      expect(result.statusValue).toBe('VALID');
    });

    it('sendReverificationSuccessToVcMeta EXPIRED status', () => {
      const fn = actions.sendReverificationSuccessToVcMeta.event;
      const ctx = {
        vcMetadata: {
          isRevoked: 'false',
          isExpired: true,
          isVerified: true,
          getVcKey: () => 'k',
          credentialType: 'vc',
        },
      };
      expect(fn(ctx).statusValue).toBe('EXPIRED');
    });

    it('sendReverificationFailureToVcMeta to returns vcMeta ref', () => {
      expect(
        actions.sendReverificationFailureToVcMeta.opts.to({
          serviceRefs: mockServiceRefs,
        }),
      ).toBe('vcMeta-ref');
    });

    it('logStatusChangedOnReverification to returns activityLog ref', () => {
      expect(
        actions.logStatusChangedOnReverification.opts.to({
          serviceRefs: mockServiceRefs,
        }),
      ).toBe('activityLog-ref');
    });

    it('logStatusChangedOnReverification event for expired VC', () => {
      const {ActivityLogEvents} = require('../../activityLog');
      ActivityLogEvents.LOG_ACTIVITY.mockClear();
      actions.logStatusChangedOnReverification.event({
        vcMetadata: {
          isRevoked: 'false',
          isExpired: true,
          isVerified: true,
          getVcKey: () => 'k',
          issuerHost: 'host',
        },
        verifiableCredential: {credentialConfigurationId: 'cfg'},
      });
      expect(ActivityLogEvents.LOG_ACTIVITY).toHaveBeenCalled();
    });

    it('sendVerificationStatusToVcMeta to returns vcMeta ref', () => {
      expect(
        actions.sendVerificationStatusToVcMeta.opts.to({
          serviceRefs: mockServiceRefs,
        }),
      ).toBe('vcMeta-ref');
    });

    it('removeVerificationStatusFromVcMeta to returns vcMeta ref', () => {
      expect(
        actions.removeVerificationStatusFromVcMeta.opts.to({
          serviceRefs: mockServiceRefs,
        }),
      ).toBe('vcMeta-ref');
    });

    it('requestVcContext to returns vcMeta ref', () => {
      expect(
        actions.requestVcContext.opts.to({serviceRefs: mockServiceRefs}),
      ).toBe('vcMeta-ref');
    });

    it('sendDownloadingFailedToVcMeta to returns vcMeta ref', () => {
      expect(
        actions.sendDownloadingFailedToVcMeta.opts.to({
          serviceRefs: mockServiceRefs,
        }),
      ).toBe('vcMeta-ref');
    });

    it('storeContext to returns store ref', () => {
      expect(actions.storeContext.opts.to({serviceRefs: mockServiceRefs})).toBe(
        'store-ref',
      );
    });

    it('storeVcInContext to returns vcMeta ref', () => {
      expect(
        actions.storeVcInContext.opts.to({serviceRefs: mockServiceRefs}),
      ).toBe('vcMeta-ref');
    });

    it('updateVcMetadata to returns vcMeta ref', () => {
      expect(
        actions.updateVcMetadata.opts.to({serviceRefs: mockServiceRefs}),
      ).toBe('vcMeta-ref');
    });

    it('removeVcMetaDataFromStorage to returns store ref', () => {
      expect(
        actions.removeVcMetaDataFromStorage.opts.to({
          serviceRefs: mockServiceRefs,
        }),
      ).toBe('store-ref');
    });

    it('removeVcMetaDataFromVcMachineContext to returns vcMeta ref', () => {
      expect(
        actions.removeVcMetaDataFromVcMachineContext.opts.to({
          serviceRefs: mockServiceRefs,
        }),
      ).toBe('vcMeta-ref');
    });

    it('sendDownloadLimitExpire to returns vcMeta ref', () => {
      expect(
        actions.sendDownloadLimitExpire.opts.to({serviceRefs: mockServiceRefs}),
      ).toBe('vcMeta-ref');
    });

    it('sendVerificationError to returns vcMeta ref', () => {
      expect(
        actions.sendVerificationError.opts.to({serviceRefs: mockServiceRefs}),
      ).toBe('vcMeta-ref');
    });

    it('refreshAllVcs to returns vcMeta ref', () => {
      expect(
        actions.refreshAllVcs.opts.to({serviceRefs: mockServiceRefs}),
      ).toBe('vcMeta-ref');
    });

    it('sendWalletBindingSuccess to returns vcMeta ref', () => {
      expect(
        actions.sendWalletBindingSuccess.opts.to({
          serviceRefs: mockServiceRefs,
        }),
      ).toBe('vcMeta-ref');
    });

    it('removeVcItem to returns store ref', () => {
      expect(actions.removeVcItem.opts.to({serviceRefs: mockServiceRefs})).toBe(
        'store-ref',
      );
    });

    it('removeVcFromInProgressDownloads to returns vcMeta ref', () => {
      expect(
        actions.removeVcFromInProgressDownloads.opts.to({
          serviceRefs: mockServiceRefs,
        }),
      ).toBe('vcMeta-ref');
    });

    it('addVcToInProgressDownloads to returns vcMeta ref', () => {
      expect(
        actions.addVcToInProgressDownloads.opts.to({
          serviceRefs: mockServiceRefs,
        }),
      ).toBe('vcMeta-ref');
    });

    it('logDownloaded to returns activityLog ref', () => {
      expect(
        actions.logDownloaded.opts.to({serviceRefs: mockServiceRefs}),
      ).toBe('activityLog-ref');
    });

    it('logRemovedVc to returns activityLog ref', () => {
      expect(actions.logRemovedVc.opts.to({serviceRefs: mockServiceRefs})).toBe(
        'activityLog-ref',
      );
    });

    it('logWalletBindingSuccess to returns activityLog ref', () => {
      expect(
        actions.logWalletBindingSuccess.opts.to({serviceRefs: mockServiceRefs}),
      ).toBe('activityLog-ref');
    });

    it('logWalletBindingFailure to returns activityLog ref', () => {
      expect(
        actions.logWalletBindingFailure.opts.to({serviceRefs: mockServiceRefs}),
      ).toBe('activityLog-ref');
    });

    it('setThumbprintForWalletBindingId to returns store ref', () => {
      expect(
        actions.setThumbprintForWalletBindingId.opts.to({
          serviceRefs: mockServiceRefs,
        }),
      ).toBe('store-ref');
    });

    it('sendBackupEvent to returns backup ref', () => {
      expect(
        actions.sendBackupEvent.opts.to({serviceRefs: mockServiceRefs}),
      ).toBe('backup-ref');
    });
  });
});
