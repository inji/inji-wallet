jest.mock('xstate', () => ({
  assign: jest.fn(arg => ({type: 'xstate.assign', assignment: arg})),
  spawn: jest.fn(() => ({subscribe: jest.fn()})),
  send: jest.fn((event, opts) => ({type: 'xstate.send', event, opts})),
  DoneInvokeEvent: {},
}));
jest.mock('react-native', () => ({
  Linking: {openSettings: jest.fn()},
  NativeModules: {RNPixelpassModule: {decode: jest.fn()}},
}));
jest.mock('react-native-device-info', () => ({
  getDeviceNameSync: jest.fn(() => 'TestDevice'),
}));
jest.mock('../../../shared/Utils', () => ({
  VCShareFlowType: {
    SIMPLE_SHARE: 'simple',
    MINI_VIEW_SHARE: 'mini',
    MINI_VIEW_SHARE_WITH_SELFIE: 'mini_selfie',
    OPENID4VP: 'openid4vp',
    OPENID4VP_AUTHORIZATION: 'openid4vp_auth',
    MINI_VIEW_SHARE_OPENID4VP: 'mini_openid4vp',
    MINI_VIEW_SHARE_WITH_SELFIE_OPENID4VP: 'mini_selfie_openid4vp',
  },
}));
jest.mock('../../../shared/VCMetadata', () => {
  const VCMetadata = jest
    .fn()
    .mockImplementation(obj => ({...obj, getVcKey: () => 'key'}));
  (VCMetadata as any).fromVC = jest.fn(vc => ({
    ...vc,
    getVcKey: () => 'key',
    issuerHost: vc?.issuerHost || 'issuer.com',
  }));
  return {VCMetadata};
});
jest.mock('../../../shared/commonUtil', () => ({logState: jest.fn()}));
jest.mock('../../../shared/constants', () => ({
  SHOW_FACE_AUTH_CONSENT_SHARE_FLOW: 'face_auth_consent',
  isAndroid: jest.fn(() => true),
  DEFAULT_QR_HEADER: 'OPENID4VP://',
  MY_VCS_STORE_KEY: 'myVCs',
  MY_LOGIN_STORE_KEY: 'myLogins',
}));
jest.mock('../../../shared/telemetry/TelemetryConstants', () => ({
  TelemetryConstants: {
    FlowType: {vcShare: 'vcShare', senderVcShare: 'senderVcShare'},
    EndEventStatus: {success: 'success', failure: 'failure'},
    InteractEventSubtype: {click: 'click'},
    ErrorId: {},
    ErrorMessage: {},
    Screens: {vcShareSuccessPage: 'vcShareSuccessPage'},
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
  sendImpressionEvent: jest.fn(),
  getImpressionEventData: jest.fn(),
}));
jest.mock('../../QrLogin/QrLoginMachine', () => ({
  createQrLoginMachine: jest.fn(() => ({})),
}));
jest.mock('../../VerifiableCredential/VCMetaMachine/VCMetaMachine', () => ({
  VcMetaEvents: {REFRESH_MY_VCS: jest.fn()},
}));
jest.mock('../../activityLog', () => ({
  ActivityLogEvents: {
    LOG_ACTIVITY: jest.fn(log => ({type: 'LOG_ACTIVITY', log})),
  },
}));
jest.mock('../../store', () => ({
  StoreEvents: {
    GET: jest.fn(key => ({type: 'GET', key})),
    SET: jest.fn((key, val) => ({type: 'SET', key, val})),
    PREPEND: jest.fn(),
  },
}));
jest.mock('react-native-bluetooth-state-manager', () => ({
  openSettings: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../../shared/tuvali', () => ({
  wallet: {
    startConnection: jest.fn(),
    send: jest.fn(),
    handleDataEvents: jest.fn(() => ({remove: jest.fn()})),
  },
  EventTypes: {},
  VerificationStatus: {},
}));
jest.mock('../../openID4VP/openID4VPMachine', () => ({
  createOpenID4VPMachine: jest.fn(() => ({})),
}));
jest.mock('../../../components/ActivityLogEvent', () => ({
  VCActivityLog: {getLogFromObject: jest.fn(obj => obj)},
}));

import {ScanActions} from './scanActions';

describe('ScanActions', () => {
  const mockModel = {
    assign: jest.fn(arg => ({type: 'model.assign', assignment: arg})),
  };
  let actions: ReturnType<typeof ScanActions>;

  beforeEach(() => {
    jest.clearAllMocks();
    actions = ScanActions(mockModel);
  });

  it('should return all expected action definitions', () => {
    const expectedActions = [
      'setQrLoginRef',
      'setOpenId4VPRef',
      'resetLinkCode',
      'resetAuthorizationRequest',
      'updateShowFaceAuthConsent',
      'setShowFaceAuthConsent',
      'getFaceAuthConsent',
      'storeShowFaceAuthConsent',
      'sendScanData',
      'sendVPScanData',
      'openBluetoothSettings',
      'openAppPermission',
      'enableLocation',
      'setUri',
      'clearUri',
      'setSenderInfo',
      'setReceiverInfo',
      'setReadyForBluetoothStateCheck',
      'setBleError',
      'resetBleError',
      'setSelectedVc',
      'resetSelectedVc',
      'resetShowQuickShareSuccessBanner',
      'setShowQuickShareSuccessBanner',
      'setFlowType',
      'setOpenId4VPFlowType',
      'resetFlowType',
      'resetOpenID4VPFlowType',
      'registerLoggers',
      'removeLoggers',
      'setShareLogTypeUnverified',
      'setShareLogTypeVerified',
      'updateFaceCaptureBannerStatus',
      'resetFaceCaptureBannerStatus',
      'logShared',
      'logFailedVerification',
      'setLinkCode',
      'setLinkCodeFromDeepLink',
      'setAuthRequestFromDeepLink',
      'setIsQrLoginViaDeepLink',
      'resetIsQrLoginViaDeepLink',
      'setIsOVPViaDeepLink',
      'resetIsOVPViaDeepLink',
      'setQuickShareData',
      'loadMetaDataToMemory',
      'loadVCDataToMemory',
      'refreshVCs',
      'storeLoginItem',
      'storingActivityLog',
      'sendVcShareSuccessEvent',
      'sendBLEConnectionErrorEvent',
      'sendVcSharingStartEvent',
      'sendVCShareFlowCancelEndEvent',
      'sendVCShareFlowTimeoutEndEvent',
    ];
    for (const name of expectedActions) {
      expect(actions).toHaveProperty(name);
    }
  });

  it('sendVcShareSuccessEvent fires telemetry', () => {
    const {
      sendEndEvent,
      sendImpressionEvent,
    } = require('../../../shared/telemetry/TelemetryUtils');
    actions.sendVcShareSuccessEvent();
    expect(sendEndEvent).toHaveBeenCalled();
    expect(sendImpressionEvent).toHaveBeenCalled();
  });

  it('openBluetoothSettings opens BT settings', () => {
    const BM = require('react-native-bluetooth-state-manager');
    actions.openBluetoothSettings();
    expect(BM.openSettings).toHaveBeenCalled();
  });

  describe('assignment callbacks', () => {
    it('resetLinkCode returns empty string', () => {
      const val = actions.resetLinkCode.assignment.linkcode;
      expect(typeof val === 'function' ? val() : val).toBe('');
    });

    it('resetAuthorizationRequest returns empty string', () => {
      const val =
        actions.resetAuthorizationRequest.assignment.authorizationRequest;
      expect(typeof val === 'function' ? val() : val).toBe('');
    });

    it('updateShowFaceAuthConsent returns event.response', () => {
      const fn =
        actions.updateShowFaceAuthConsent.assignment.showFaceAuthConsent;
      expect(fn({}, {response: true})).toBe(true);
      expect(fn({}, {response: null})).toBe(true);
    });

    it('setShowFaceAuthConsent returns negation', () => {
      const fn = actions.setShowFaceAuthConsent.assignment.showFaceAuthConsent;
      expect(fn({}, {isDoNotAskAgainChecked: true})).toBe(false);
      expect(fn({}, {isDoNotAskAgainChecked: false})).toBe(true);
    });

    it('setUri sets openId4VpUri from event.params', () => {
      const fn = actions.setUri.assignment.openId4VpUri;
      expect(fn({}, {params: 'openid4vp://test'})).toBe('openid4vp://test');
    });

    it('clearUri sets empty string', () => {
      expect(actions.clearUri.assignment.openId4VpUri).toBe('');
    });

    it('setSenderInfo returns wallet info', () => {
      const fn = actions.setSenderInfo.assignment.senderInfo;
      const result = fn();
      expect(result.name).toBe('Wallet');
    });

    it('setReceiverInfo returns verifier info', () => {
      const fn = actions.setReceiverInfo.assignment.receiverInfo;
      const result = fn();
      expect(result.name).toBe('Verifier');
    });

    it('setReadyForBluetoothStateCheck returns true', () => {
      const fn =
        actions.setReadyForBluetoothStateCheck.assignment
          .readyForBluetoothStateCheck;
      expect(fn()).toBe(true);
    });

    it('setBleError sets from event', () => {
      const fn = actions.setBleError.assignment.bleError;
      expect(fn({}, {bleError: {code: 'ERR'}})).toEqual({code: 'ERR'});
    });

    it('resetBleError returns empty object', () => {
      expect(actions.resetBleError.assignment.bleError).toEqual({});
    });

    it('setSelectedVc sets from event', () => {
      const fn = actions.setSelectedVc.assignment.selectedVc;
      expect(fn({}, {vc: {id: 'vc1'}})).toEqual({id: 'vc1'});
    });

    it('resetSelectedVc returns empty object', () => {
      expect(actions.resetSelectedVc.assignment.selectedVc).toEqual({});
    });

    it('setFlowType sets from event', () => {
      const fn = actions.setFlowType.assignment.flowType;
      expect(fn({}, {flowType: 'simple'})).toBe('simple');
    });

    it('resetFlowType returns SIMPLE_SHARE', () => {
      expect(actions.resetFlowType.assignment.flowType).toBe('simple');
    });

    it('setShareLogTypeUnverified sets VC_SHARED', () => {
      const val = actions.setShareLogTypeUnverified.assignment.shareLogType;
      expect(typeof val === 'function' ? val() : val).toBe('VC_SHARED');
    });

    it('setShareLogTypeVerified sets PRESENCE_VERIFIED_AND_VC_SHARED', () => {
      const val = actions.setShareLogTypeVerified.assignment.shareLogType;
      expect(typeof val === 'function' ? val() : val).toBe(
        'PRESENCE_VERIFIED_AND_VC_SHARED',
      );
    });

    it('updateFaceCaptureBannerStatus returns true', () => {
      expect(
        actions.updateFaceCaptureBannerStatus.assignment
          .showFaceCaptureSuccessBanner,
      ).toBe(true);
    });

    it('resetFaceCaptureBannerStatus returns false', () => {
      expect(
        actions.resetFaceCaptureBannerStatus.assignment
          .showFaceCaptureSuccessBanner,
      ).toBe(false);
    });

    it('resetShowQuickShareSuccessBanner returns false', () => {
      expect(
        actions.resetShowQuickShareSuccessBanner.assignment
          .showQuickShareSuccessBanner,
      ).toBe(false);
    });

    it('setShowQuickShareSuccessBanner returns true', () => {
      expect(
        actions.setShowQuickShareSuccessBanner.assignment
          .showQuickShareSuccessBanner,
      ).toBe(true);
    });

    it('setLinkCodeFromDeepLink sets from event', () => {
      const fn = actions.setLinkCodeFromDeepLink.assignment.linkCode;
      expect(fn({}, {linkCode: 'abc123'})).toBe('abc123');
    });

    it('setAuthRequestFromDeepLink sets from event params or authorizationRequest', () => {
      const fn =
        actions.setAuthRequestFromDeepLink.assignment.authorizationRequest;
      expect(fn({}, {params: 'param1'})).toBe('param1');
      expect(fn({}, {authorizationRequest: 'req1'})).toBe('req1');
    });

    it('setIsQrLoginViaDeepLink sets true', () => {
      expect(
        actions.setIsQrLoginViaDeepLink.assignment.isQrLoginViaDeepLink,
      ).toBe(true);
    });

    it('resetIsQrLoginViaDeepLink sets false', () => {
      expect(
        actions.resetIsQrLoginViaDeepLink.assignment.isQrLoginViaDeepLink,
      ).toBe(false);
    });

    it('setIsOVPViaDeepLink sets true', () => {
      expect(actions.setIsOVPViaDeepLink.assignment.isOVPViaDeepLink).toBe(
        true,
      );
    });

    it('resetIsOVPViaDeepLink sets false', () => {
      expect(actions.resetIsOVPViaDeepLink.assignment.isOVPViaDeepLink).toBe(
        false,
      );
    });

    it('resetOpenID4VPFlowType sets empty string', () => {
      expect(actions.resetOpenID4VPFlowType.assignment.openID4VPFlowType).toBe(
        '',
      );
    });

    it('removeLoggers removes all loggers', () => {
      const fn = actions.removeLoggers.assignment.loggers;
      const removeSpy = jest.fn();
      const result = fn({loggers: [{remove: removeSpy}]});
      expect(removeSpy).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('telemetry actions', () => {
    it('sendBLEConnectionErrorEvent fires error telemetry', () => {
      const {
        sendErrorEvent,
        sendEndEvent,
      } = require('../../../shared/telemetry/TelemetryUtils');
      actions.sendBLEConnectionErrorEvent(
        {},
        {bleError: {code: 'BLE01', message: 'err'}},
      );
      expect(sendErrorEvent).toHaveBeenCalled();
      expect(sendEndEvent).toHaveBeenCalled();
    });

    it('sendVcSharingStartEvent fires start telemetry', () => {
      const {
        sendStartEvent,
        sendImpressionEvent,
      } = require('../../../shared/telemetry/TelemetryUtils');
      actions.sendVcSharingStartEvent();
      expect(sendStartEvent).toHaveBeenCalled();
      expect(sendImpressionEvent).toHaveBeenCalled();
    });

    it('sendVCShareFlowCancelEndEvent fires cancel telemetry', () => {
      const {
        sendEndEvent,
      } = require('../../../shared/telemetry/TelemetryUtils');
      actions.sendVCShareFlowCancelEndEvent();
      expect(sendEndEvent).toHaveBeenCalled();
    });

    it('sendVCShareFlowTimeoutEndEvent fires timeout telemetry', () => {
      const {
        sendEndEvent,
      } = require('../../../shared/telemetry/TelemetryUtils');
      actions.sendVCShareFlowTimeoutEndEvent();
      expect(sendEndEvent).toHaveBeenCalled();
    });
  });

  describe('send actions', () => {
    it('sendScanData sends to QrLoginRef', () => {
      const mockSend = jest.fn();
      const context = {
        QrLoginRef: {send: mockSend},
        linkCode: 'link1',
        flowType: 'simple',
        selectedVc: {},
        isQrLoginViaDeepLink: false,
      };
      actions.sendScanData(context);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({type: 'GET', linkCode: 'link1'}),
      );
    });

    it('sendVPScanData sends to OpenId4VPRef', () => {
      const mockSend = jest.fn();
      const context = {
        OpenId4VPRef: {send: mockSend},
        authorizationRequest: 'auth-req',
        openID4VPFlowType: 'openid4vp',
        selectedVc: {},
        isOVPViaDeepLink: false,
      };
      actions.sendVPScanData(context);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({type: 'AUTHENTICATE'}),
      );
    });

    it('openAppPermission calls Linking.openSettings', () => {
      const {Linking} = require('react-native');
      actions.openAppPermission();
      expect(Linking.openSettings).toHaveBeenCalled();
    });
  });

  describe('additional assignment callbacks', () => {
    it('setOpenId4VPFlowType defaults to OPENID4VP', () => {
      const fn = actions.setOpenId4VPFlowType.assignment.openID4VPFlowType;
      const ctx = {flowType: 'some_other'};
      const result = fn(ctx);
      expect(result).toBe('openid4vp');
    });

    it('setOpenId4VPFlowType uses MINI_VIEW_SHARE_OPENID4VP for MINI_VIEW_SHARE', () => {
      const fn = actions.setOpenId4VPFlowType.assignment.openID4VPFlowType;
      const ctx = {flowType: 'mini'};
      const result = fn(ctx);
      expect(result).toBe('mini_openid4vp');
    });

    it('setOpenId4VPFlowType uses MINI_VIEW_SHARE_WITH_SELFIE_OPENID4VP', () => {
      const fn = actions.setOpenId4VPFlowType.assignment.openID4VPFlowType;
      const ctx = {flowType: 'mini_selfie'};
      const result = fn(ctx);
      expect(result).toBe('mini_selfie_openid4vp');
    });

    it('setLinkCode parses linkCode from URL when not OpenID4VP', () => {
      const fn = actions.setLinkCode.assignment.linkCode;
      const ctx = {openID4VPFlowType: ''};
      const result = fn(ctx, {params: 'https://example.com?linkCode=abc123'});
      expect(result).toBe('abc123');
    });

    it('setLinkCode uses raw params when OpenID4VP', () => {
      const fn = actions.setLinkCode.assignment.linkCode;
      const ctx = {openID4VPFlowType: 'OpenID4VP-flow'};
      const result = fn(ctx, {params: 'raw-link-code'});
      expect(result).toBe('raw-link-code');
    });

    it('removeLoggers handles empty loggers', () => {
      const fn = actions.removeLoggers.assignment.loggers;
      const result = fn({loggers: []});
      expect(result).toEqual([]);
    });

    it('removeLoggers handles null loggers', () => {
      const fn = actions.removeLoggers.assignment.loggers;
      const result = fn({loggers: null});
      expect(result).toEqual([]);
    });
  });

  describe('send-based actions', () => {
    it('getFaceAuthConsent is defined', () => {
      expect(actions.getFaceAuthConsent).toBeDefined();
    });

    it('storeShowFaceAuthConsent is defined', () => {
      expect(actions.storeShowFaceAuthConsent).toBeDefined();
    });

    it('logShared is defined as send action', () => {
      expect(actions.logShared).toBeDefined();
      expect(actions.logShared.type).toBe('xstate.send');
    });

    it('logFailedVerification is defined as send action', () => {
      expect(actions.logFailedVerification).toBeDefined();
      expect(actions.logFailedVerification.type).toBe('xstate.send');
    });

    it('loadMetaDataToMemory is defined as send action', () => {
      expect(actions.loadMetaDataToMemory).toBeDefined();
      expect(actions.loadMetaDataToMemory.type).toBe('xstate.send');
    });

    it('refreshVCs is defined as send action', () => {
      expect(actions.refreshVCs).toBeDefined();
      expect(actions.refreshVCs.type).toBe('xstate.send');
    });

    it('storeLoginItem is defined as send action', () => {
      expect(actions.storeLoginItem).toBeDefined();
      expect(actions.storeLoginItem.type).toBe('xstate.send');
    });

    it('storingActivityLog is defined as send action', () => {
      expect(actions.storingActivityLog).toBeDefined();
      expect(actions.storingActivityLog.type).toBe('xstate.send');
    });

    it('logShared event function creates activity log', () => {
      const eventFn = actions.logShared.event;
      expect(typeof eventFn).toBe('function');
      const ctx = {
        selectedVc: {
          vcMetadata: {
            id: 'vc1',
            issuerHost: 'issuer.com',
            getVcKey: () => 'k1',
          },
          verifiableCredential: {credentialConfigurationId: 'config1'},
        },
        shareLogType: 'VC_SHARED',
        receiverInfo: {name: 'Verifier', deviceName: 'Device1'},
        serviceRefs: {activityLog: {}},
      };
      eventFn(ctx);
      const {ActivityLogEvents} = require('../../activityLog');
      expect(ActivityLogEvents.LOG_ACTIVITY).toHaveBeenCalled();
    });

    it('logFailedVerification event function creates activity log', () => {
      const eventFn = actions.logFailedVerification.event;
      expect(typeof eventFn).toBe('function');
      const ctx = {
        selectedVc: {
          id: 'vc1',
          issuerHost: 'issuer.com',
          getVcKey: () => 'k1',
          verifiableCredential: {credentialConfigurationId: 'config1'},
        },
        receiverInfo: {name: 'Verifier', deviceName: 'Device1'},
        serviceRefs: {activityLog: {}},
      };
      eventFn(ctx);
      const {ActivityLogEvents} = require('../../activityLog');
      expect(ActivityLogEvents.LOG_ACTIVITY).toHaveBeenCalled();
    });
  });

  describe('setQrLoginRef and setOpenId4VPRef', () => {
    it('setQrLoginRef is an assign action', () => {
      expect(actions.setQrLoginRef).toBeDefined();
      expect(actions.setQrLoginRef.assignment).toBeDefined();
    });

    it('setOpenId4VPRef is an assign action', () => {
      expect(actions.setOpenId4VPRef).toBeDefined();
      expect(actions.setOpenId4VPRef.assignment).toBeDefined();
    });

    it('setQrLoginRef spawns QrLogin machine and subscribes', () => {
      const {spawn} = require('xstate');
      const assignFn = actions.setQrLoginRef.assignment;
      const QrLoginRef =
        typeof assignFn === 'function'
          ? assignFn({serviceRefs: {store: {}}})
          : assignFn.QrLoginRef({serviceRefs: {store: {}}});
      expect(spawn).toHaveBeenCalled();
      expect(QrLoginRef).toBeDefined();
    });

    it('setOpenId4VPRef spawns OpenID4VP machine and subscribes', () => {
      const {spawn} = require('xstate');
      const assignFn = actions.setOpenId4VPRef.assignment;
      const OpenId4VPRef =
        typeof assignFn === 'function'
          ? assignFn({serviceRefs: {store: {}}})
          : assignFn.OpenId4VPRef({serviceRefs: {store: {}}});
      expect(spawn).toHaveBeenCalled();
      expect(OpenId4VPRef).toBeDefined();
    });
  });

  describe('send-based action callbacks', () => {
    it('getFaceAuthConsent opts.to returns store ref', () => {
      const toFn = actions.getFaceAuthConsent.opts?.to;
      expect(typeof toFn).toBe('function');
      const ref = toFn({serviceRefs: {store: 'storeRef'}});
      expect(ref).toBe('storeRef');
    });

    it('storeShowFaceAuthConsent event callback creates SET event', () => {
      const eventFn = actions.storeShowFaceAuthConsent.event;
      expect(typeof eventFn).toBe('function');
      const {StoreEvents} = require('../../store');
      eventFn({}, {isDoNotAskAgainChecked: false});
      expect(StoreEvents.SET).toHaveBeenCalledWith('face_auth_consent', true);
    });

    it('storeShowFaceAuthConsent opts.to returns store ref', () => {
      const toFn = actions.storeShowFaceAuthConsent.opts?.to;
      expect(typeof toFn).toBe('function');
      expect(toFn({serviceRefs: {store: 'storeRef'}})).toBe('storeRef');
    });

    it('sendScanData sends GET to QrLoginRef', () => {
      const mockSend = jest.fn();
      actions.sendScanData({
        QrLoginRef: {send: mockSend},
        linkCode: 'code1',
        flowType: 'simple',
        selectedVc: {id: 'vc1'},
        isQrLoginViaDeepLink: false,
      });
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({type: 'GET', linkCode: 'code1'}),
      );
    });

    it('sendVPScanData sends AUTHENTICATE to OpenId4VPRef', () => {
      const mockSend = jest.fn();
      actions.sendVPScanData({
        OpenId4VPRef: {send: mockSend},
        authorizationRequest: 'auth-req',
        openID4VPFlowType: 'openid4vp',
        selectedVc: {id: 'vc1'},
        isOVPViaDeepLink: false,
      });
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({type: 'AUTHENTICATE'}),
      );
    });

    it('loadMetaDataToMemory event callback calls PREPEND', () => {
      const eventFn = actions.loadMetaDataToMemory.event;
      expect(typeof eventFn).toBe('function');
      const {StoreEvents} = require('../../store');
      eventFn({quickShareData: {meta: {id: 'vc1'}}});
      expect(StoreEvents.PREPEND).toHaveBeenCalled();
    });

    it('loadMetaDataToMemory opts.to returns store ref', () => {
      const toFn = actions.loadMetaDataToMemory.opts?.to;
      expect(typeof toFn).toBe('function');
      expect(toFn({serviceRefs: {store: 'storeRef'}})).toBe('storeRef');
    });

    it('refreshVCs opts.to returns vcMeta ref', () => {
      const toFn = actions.refreshVCs.opts?.to;
      expect(typeof toFn).toBe('function');
      expect(toFn({serviceRefs: {vcMeta: 'vcMetaRef'}})).toBe('vcMetaRef');
    });

    it('storeLoginItem event creates PREPEND event', () => {
      const eventFn = actions.storeLoginItem.event;
      expect(typeof eventFn).toBe('function');
      const {StoreEvents} = require('../../store');
      eventFn({}, {data: 'login-item'});
      expect(StoreEvents.PREPEND).toHaveBeenCalled();
    });

    it('storeLoginItem opts.to returns store ref', () => {
      const toFn = actions.storeLoginItem.opts?.to;
      expect(typeof toFn).toBe('function');
      expect(toFn({serviceRefs: {store: 'storeRef'}})).toBe('storeRef');
    });

    it('storingActivityLog event callback creates activity log', () => {
      const eventFn = actions.storingActivityLog.event;
      expect(typeof eventFn).toBe('function');
      const {ActivityLogEvents} = require('../../activityLog');
      eventFn(
        {
          QrLoginRef: {
            getSnapshot: () => ({
              context: {
                selectedVc: {
                  verifiableCredential: {credentialConfigurationId: 'cfg1'},
                },
              },
            }),
          },
        },
        {
          response: {
            selectedVc: {vcMetadata: {getVcKey: () => 'k', issuerHost: 'host'}},
          },
        },
      );
      expect(ActivityLogEvents.LOG_ACTIVITY).toHaveBeenCalled();
    });

    it('storingActivityLog opts.to returns activityLog ref', () => {
      const toFn = actions.storingActivityLog.opts?.to;
      expect(typeof toFn).toBe('function');
      expect(toFn({serviceRefs: {activityLog: 'logRef'}})).toBe('logRef');
    });
  });

  describe('setOpenId4VPFlowType', () => {
    it('returns OPENID4VP by default', () => {
      const fn = actions.setOpenId4VPFlowType.assignment.openID4VPFlowType;
      const result = fn({flowType: 'simple'});
      expect(result).toBe('openid4vp');
    });

    it('returns MINI_VIEW_SHARE_OPENID4VP when flowType is MINI_VIEW_SHARE', () => {
      const fn = actions.setOpenId4VPFlowType.assignment.openID4VPFlowType;
      const result = fn({flowType: 'mini'});
      expect(result).toBe('mini_openid4vp');
    });

    it('returns MINI_VIEW_SHARE_WITH_SELFIE_OPENID4VP for selfie', () => {
      const fn = actions.setOpenId4VPFlowType.assignment.openID4VPFlowType;
      const result = fn({flowType: 'mini_selfie'});
      expect(result).toBe('mini_selfie_openid4vp');
    });
  });

  describe('setLinkCode', () => {
    it('returns event.params when openID4VPFlowType starts with OpenID4VP', () => {
      const fn = actions.setLinkCode.assignment.linkCode;
      const result = fn(
        {openID4VPFlowType: 'OpenID4VP_test'},
        {params: 'raw-param'},
      );
      expect(result).toBe('raw-param');
    });

    it('parses URL linkCode when flowType does not start with OpenID4VP', () => {
      const fn = actions.setLinkCode.assignment.linkCode;
      const result = fn(
        {openID4VPFlowType: 'simple'},
        {params: 'https://example.com?linkCode=abc123'},
      );
      expect(result).toBe('abc123');
    });
  });

  describe('setLinkCodeFromDeepLink', () => {
    it('sets linkCode from event.linkCode', () => {
      const fn = actions.setLinkCodeFromDeepLink.assignment.linkCode;
      expect(fn({}, {linkCode: 'deep-link-code'})).toBe('deep-link-code');
    });
  });

  describe('setAuthRequestFromDeepLink', () => {
    it('uses event.params when present', () => {
      const fn =
        actions.setAuthRequestFromDeepLink.assignment.authorizationRequest;
      expect(fn({}, {params: 'param-val'})).toBe('param-val');
    });

    it('falls back to event.authorizationRequest', () => {
      const fn =
        actions.setAuthRequestFromDeepLink.assignment.authorizationRequest;
      expect(fn({}, {authorizationRequest: 'auth-req-val'})).toBe(
        'auth-req-val',
      );
    });
  });

  describe('setQuickShareData', () => {
    it('is an assign action with quickShareData callback', () => {
      expect(actions.setQuickShareData).toBeDefined();
      expect(actions.setQuickShareData.assignment).toBeDefined();
      expect(typeof actions.setQuickShareData.assignment.quickShareData).toBe(
        'function',
      );
    });
  });

  describe('registerLoggers', () => {
    it('returns loggers array (in dev mode wallet.handleDataEvents is called)', () => {
      const fn = actions.registerLoggers.assignment.loggers;
      const result = fn();
      // __DEV__ is true in jest, so it returns handlers
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('removeLoggers', () => {
    it('calls remove on each logger and returns empty array', () => {
      const fn = actions.removeLoggers.assignment.loggers;
      const mockLogger = {remove: jest.fn()};
      const result = fn({loggers: [mockLogger]});
      expect(mockLogger.remove).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('handles undefined loggers', () => {
      const fn = actions.removeLoggers.assignment.loggers;
      const result = fn({loggers: undefined});
      expect(result).toEqual([]);
    });
  });
});
