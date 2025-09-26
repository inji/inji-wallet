import {Linking} from 'react-native';
import {getDeviceNameSync} from 'react-native-device-info';
import {assign, spawn, send, DoneInvokeEvent} from 'xstate';
import {VCShareFlowType} from '../../../shared/Utils';
import {VCMetadata} from '../../../shared/VCMetadata';
import {logState} from '../../../shared/commonUtil';
import {
  SHOW_FACE_AUTH_CONSENT_SHARE_FLOW,
  isAndroid,
  DEFAULT_QR_HEADER,
  MY_VCS_STORE_KEY,
  MY_LOGIN_STORE_KEY,
} from '../../../shared/constants';
import {TelemetryConstants} from '../../../shared/telemetry/TelemetryConstants';
import {
  sendImpressionEvent,
  getImpressionEventData,
  sendEndEvent,
  getEndEventData,
  sendErrorEvent,
  getErrorEventData,
  sendStartEvent,
  getStartEventData,
} from '../../../shared/telemetry/TelemetryUtils';
import {createQrLoginMachine} from '../../QrLogin/QrLoginMachine';
import {VcMetaEvents} from '../../VerifiableCredential/VCMetaMachine/VCMetaEvents';
import {ActivityLogEvents} from '../../activityLog';
import {StoreEvents} from '../../store';
import BluetoothStateManager from 'react-native-bluetooth-state-manager';
import {NativeModules} from 'react-native';
import {wallet} from '../../../shared/tuvali';
import {createOpenID4VPMachine} from '../../openID4VP/openID4VPMachine';
import {VCActivityLog} from '../../../components/ActivityLogEvent';

const QR_LOGIN_REF_ID = 'QrLogin';
const OPENID4VP_REF_ID = 'OpenID4VP';

export const ScanActions = (model: any) => {
  const {RNPixelpassModule} = NativeModules;
  return {
    setQrLoginRef: assign({
      QrLoginRef: (context: any) => {
        const service = spawn(
          createQrLoginMachine(context.serviceRefs),
          QR_LOGIN_REF_ID,
        );
        service.subscribe(logState);
        return service;
      },
    }),

    setOpenId4VPRef: assign({
      OpenId4VPRef: (context: any) => {
        const service = spawn(
          createOpenID4VPMachine(context.serviceRefs),
          OPENID4VP_REF_ID,
        );
        service.subscribe(logState);
        return service;
      },
    }),

    resetLinkCode: model.assign({
      linkcode: '',
    }),

    resetAuthorizationRequest: model.assign({
      authorizationRequest: '',
    }),

    updateShowFaceAuthConsent: model.assign({
      showFaceAuthConsent: (_, event) => {
        return event.response || event.response === null;
      },
    }),
    setShowFaceAuthConsent: model.assign({
      showFaceAuthConsent: (_, event) => {
        return !event.isDoNotAskAgainChecked;
      },
    }),

    getFaceAuthConsent: send(
      StoreEvents.GET(SHOW_FACE_AUTH_CONSENT_SHARE_FLOW),
      {
        to: (context: any) => context.serviceRefs.store,
      },
    ),

    storeShowFaceAuthConsent: send(
      (context, event) =>
        StoreEvents.SET(
          SHOW_FACE_AUTH_CONSENT_SHARE_FLOW,
          !event.isDoNotAskAgainChecked,
        ),
      {
        to: (context: any) => context.serviceRefs.store,
      },
    ),

    sendScanData: context =>
      context.QrLoginRef.send({
        type: 'GET',
        linkCode: context.linkCode,
        flowType: context.flowType,
        selectedVc: context.selectedVc,
        isQrLoginViaDeepLink: context.isQrLoginViaDeepLink,
      }),

    sendVPScanData: context =>
      context.OpenId4VPRef.send({
        type: 'AUTHENTICATE',
        encodedAuthRequest: context.authorizationRequest,
        flowType: context.openID4VPFlowType,
        selectedVC: context.selectedVc,
        isOVPViaDeepLink: context.isOVPViaDeepLink,
      }),

    openBluetoothSettings: () => {
      isAndroid()
        ? BluetoothStateManager.openSettings().catch()
        : Linking.openURL('App-Prefs:Bluetooth');
    },

    openAppPermission: () => Linking.openSettings(),

    enableLocation: async () => {
      await Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
    },

    setUri: model.assign({
      openId4VpUri: (_context, event) => event.params,
    }),

    clearUri: assign({
      openId4VpUri: '',
    }),

    setSenderInfo: assign({
      senderInfo: () => {
        return {name: 'Wallet', deviceName: 'Wallet', deviceId: ''};
      },
    }),

    setReceiverInfo: assign({
      receiverInfo: () => {
        return {name: 'Verifier', deviceName: 'Verifier', deviceId: ''};
      },
    }),

    setReadyForBluetoothStateCheck: model.assign({
      readyForBluetoothStateCheck: () => true,
    }),

    setBleError: assign({
      bleError: (_context, event) => event.bleError,
    }),

    resetBleError: assign({
      bleError: {},
    }),

    setSelectedVc: assign({
      selectedVc: (_context, event) => event.vc,
    }),

    resetSelectedVc: assign({
      selectedVc: {},
    }),

    resetShowQuickShareSuccessBanner: assign({
      showQuickShareSuccessBanner: false,
    }),

    setShowQuickShareSuccessBanner: assign({
      showQuickShareSuccessBanner: true,
    }),

    setFlowType: assign({
      flowType: (_context, event) => event.flowType,
    }),

    setOpenId4VPFlowType: assign({
      openID4VPFlowType: (context: any) => {
        let flowType = VCShareFlowType.OPENID4VP;
        if (context.flowType === VCShareFlowType.MINI_VIEW_SHARE) {
          flowType = VCShareFlowType.MINI_VIEW_SHARE_OPENID4VP;
        } else if (
          context.flowType === VCShareFlowType.MINI_VIEW_SHARE_WITH_SELFIE
        ) {
          flowType = VCShareFlowType.MINI_VIEW_SHARE_WITH_SELFIE_OPENID4VP;
        }
        return flowType;
      },
    }),

    resetFlowType: assign({
      flowType: VCShareFlowType.SIMPLE_SHARE,
    }),

    resetOpenID4VPFlowType: assign({
      openID4VPFlowType: '',
    }),

    registerLoggers: assign({
      loggers: () => {
        if (__DEV__) {
          return [
            wallet.handleDataEvents(event => {
              console.log(
                getDeviceNameSync(),
                '<Sender.Event>',
                JSON.stringify(event).slice(0, 100),
              );
            }),
          ];
        } else {
          return [];
        }
      },
    }),

    removeLoggers: assign({
      loggers: ({loggers}) => {
        loggers?.forEach(logger => logger.remove());
        return [];
      },
    }),

    setShareLogTypeUnverified: model.assign({
      shareLogType: 'VC_SHARED',
    }),

    setShareLogTypeVerified: model.assign({
      shareLogType: 'PRESENCE_VERIFIED_AND_VC_SHARED',
    }),

    updateFaceCaptureBannerStatus: model.assign({
      showFaceCaptureSuccessBanner: true,
    }),

    resetFaceCaptureBannerStatus: model.assign({
      showFaceCaptureSuccessBanner: false,
    }),

    logShared: send(
      (context: any) => {
        const vcMetadata = VCMetadata.fromVC(context.selectedVc?.vcMetadata);

        return ActivityLogEvents.LOG_ACTIVITY(
          VCActivityLog.getLogFromObject({
            _vcKey: vcMetadata.getVcKey(),
            type: context.shareLogType
              ? context.shareLogType
              : 'VC_SHARED_WITH_VERIFICATION_CONSENT',
            credentialConfigurationId:
              context.selectedVc.verifiableCredential.credentialConfigurationId,
            issuer: vcMetadata.issuerHost!!,
            timestamp: Date.now(),
            deviceName:
              context.receiverInfo.name || context.receiverInfo.deviceName,
          }),
        );
      },
      {to: context => context.serviceRefs.activityLog},
    ),

    logFailedVerification: send(
      (context: any) => {
        const vcMetadata = VCMetadata.fromVC(context.selectedVc);
        return ActivityLogEvents.LOG_ACTIVITY(
          VCActivityLog.getLogFromObject({
            _vcKey: vcMetadata.getVcKey(),
            type: 'PRESENCE_VERIFICATION_FAILED',
            timestamp: Date.now(),
            credentialConfigurationId:
              context.selectedVc.verifiableCredential.credentialConfigurationId,
            issuer: vcMetadata.issuerHost!!,
            deviceName:
              context.receiverInfo.name || context.receiverInfo.deviceName,
          }),
        );
      },
      {to: context => context.serviceRefs.activityLog},
    ),

    setLinkCode: assign({
      linkCode: (context: any, event) =>
        context.openID4VPFlowType.startsWith('OpenID4VP')
          ? event.params
          : new URL(event.params).searchParams.get('linkCode'),
    }),

    setLinkCodeFromDeepLink: assign({
      linkCode: (_, event) => event.linkCode,
    }),

    setAuthRequestFromDeepLink: assign({
      authorizationRequest: (_, event) => {
        return event.params ?? event.authorizationRequest;
      },
    }),

    setIsQrLoginViaDeepLink: assign({
      isQrLoginViaDeepLink: true,
    }),

    resetIsQrLoginViaDeepLink: assign({
      isQrLoginViaDeepLink: false,
    }),

    setIsOVPViaDeepLink: assign({
      isOVPViaDeepLink: true,
    }),

    resetIsOVPViaDeepLink: assign({
      isOVPViaDeepLink: false,
    }),

    setQuickShareData: assign({
      quickShareData: (_, event) =>
        JSON.parse(
          RNPixelpassModule.decode(event.params.split(DEFAULT_QR_HEADER)[1]),
        ),
    }),
    loadMetaDataToMemory: send(
      (context: any) => {
        let metadata = VCMetadata.fromVC(context.quickShareData?.meta);
        return StoreEvents.PREPEND(MY_VCS_STORE_KEY, metadata);
      },
      {to: context => context.serviceRefs.store},
    ),
    loadVCDataToMemory: send(
      (context: any) => {
        const verifiableCredential =
          context.quickShareData?.verifiableCredential;

        return StoreEvents.SET(metadata.getVcKey(), {
          verifiableCredential: verifiableCredential,
        });
      },
      {to: context => context.serviceRefs.store},
    ),
    refreshVCs: send(VcMetaEvents.REFRESH_MY_VCS, {
      to: context => context.serviceRefs.vcMeta,
    }),
    storeLoginItem: send(
      (_context, event) => {
        return StoreEvents.PREPEND(
          MY_LOGIN_STORE_KEY,
          (event as DoneInvokeEvent<string>).data,
        );
      },
      {to: (context: any) => context.serviceRefs.store},
    ),

    storingActivityLog: send(
      (context, event) => {
        const vcMetadata = event.response.selectedVc.vcMetadata;

        const selectedVc = context.QrLoginRef.getSnapshot().context.selectedVc;

        return ActivityLogEvents.LOG_ACTIVITY(
          VCActivityLog.getLogFromObject({
            _vcKey: vcMetadata.getVcKey(),
            issuer: vcMetadata.issuerHost!!,
            credentialConfigurationId:
              selectedVc.verifiableCredential.credentialConfigurationId,
            type: 'QRLOGIN_SUCCESFULL',
            timestamp: Date.now(),
            deviceName: '',
          }),
        );
      },
      {
        to: (context: any) => context.serviceRefs.activityLog,
      },
    ),

    sendVcShareSuccessEvent: () => {
      sendImpressionEvent(
        getImpressionEventData(
          TelemetryConstants.FlowType.senderVcShare,
          TelemetryConstants.Screens.vcShareSuccessPage,
        ),
      );
      sendEndEvent(
        getEndEventData(
          TelemetryConstants.FlowType.senderVcShare,
          TelemetryConstants.EndEventStatus.success,
        ),
      );
    },

    sendBLEConnectionErrorEvent: (_context, event) => {
      sendErrorEvent(
        getErrorEventData(
          TelemetryConstants.FlowType.senderVcShare,
          event.bleError.code,
          event.bleError.message,
        ),
      );
      sendEndEvent(
        getEndEventData(
          TelemetryConstants.FlowType.senderVcShare,
          TelemetryConstants.EndEventStatus.failure,
        ),
      );
    },

    sendVcSharingStartEvent: () => {
      sendStartEvent(
        getStartEventData(TelemetryConstants.FlowType.senderVcShare),
      );
      sendImpressionEvent(
        getImpressionEventData(
          TelemetryConstants.FlowType.senderVcShare,
          TelemetryConstants.Screens.scanScreen,
        ),
      );
    },

    sendVCShareFlowCancelEndEvent: () => {
      sendEndEvent(
        getEndEventData(
          TelemetryConstants.FlowType.senderVcShare,
          TelemetryConstants.EndEventStatus.cancel,
          {comment: 'User cancelled VC share'},
        ),
      );
    },

    sendVCShareFlowTimeoutEndEvent: () => {
      sendEndEvent(
        getEndEventData(
          TelemetryConstants.FlowType.senderVcShare,
          TelemetryConstants.EndEventStatus.failure,
          {comment: 'VC sharing timeout'},
        ),
      );
    },
  };
};
