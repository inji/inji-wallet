import {CameraCapturedPicture} from 'expo-camera';
import {EmitterSubscription} from 'react-native';
import {ActorRefFrom} from 'xstate';
import {createModel} from 'xstate/lib/model';
import {DeviceInfo} from '../../../components/DeviceInfoList';
import {AppServices} from '../../../shared/GlobalContext';
import {VCShareFlowType} from '../../../shared/Utils';
import {qrLoginMachine} from '../../QrLogin/QrLoginMachine';
import {VC} from '../../VerifiableCredential/VCMetaMachine/vc';
import {ActivityLogType} from '../../activityLog';
import {BLEError} from '../types';
import {openID4VPMachine} from '../../openID4VP/openID4VPMachine';

const ScanEvents = {
  SELECT_VC: (vc: VC, flowType: string) => ({vc, flowType}),
  SCAN: (params: string) => ({params}),
  ACCEPT_REQUEST: () => ({}),
  VERIFY_AND_ACCEPT_REQUEST: () => ({}),
  VC_ACCEPTED: () => ({}),
  VC_REJECTED: () => ({}),
  VC_SENT: () => ({}),
  CANCEL: () => ({}),
  CLOSE_BANNER: () => ({}),
  STAY_IN_PROGRESS: () => ({}),
  RETRY: () => ({}),
  DISMISS: () => ({}),
  DISMISS_QUICK_SHARE_BANNER: () => ({}),
  GOTO_HISTORY: () => ({}),
  CONNECTED: () => ({}),
  DISCONNECT: () => ({}),
  BLE_ERROR: (bleError: BLEError) => ({bleError}),
  CONNECTION_DESTROYED: () => ({}),
  SCREEN_BLUR: () => ({}),
  SCREEN_FOCUS: () => ({}),
  BLUETOOTH_PERMISSION_ENABLED: () => ({}),
  BLUETOOTH_PERMISSION_DENIED: () => ({}),
  BLUETOOTH_STATE_ENABLED: () => ({}),
  BLUETOOTH_STATE_DISABLED: () => ({}),
  NEARBY_ENABLED: () => ({}),
  NEARBY_DISABLED: () => ({}),
  GOTO_SETTINGS: () => ({}),
  START_PERMISSION_CHECK: () => ({}),
  LOCATION_ENABLED: () => ({}),
  LOCATION_DISABLED: () => ({}),
  LOCATION_REQUEST: () => ({}),
  CHECK_FLOW_TYPE: () => ({}),
  UPDATE_VC_NAME: (vcName: string) => ({vcName}),
  STORE_RESPONSE: (response: any) => ({response}),
  APP_ACTIVE: () => ({}),
  FACE_VALID: () => ({}),
  FACE_INVALID: () => ({}),
  RETRY_VERIFICATION: () => ({}),
  RESET: () => ({}),
  FACE_VERIFICATION_CONSENT: (isDoNotAskAgainChecked: boolean) => ({
    isDoNotAskAgainChecked,
  }),
  ALLOWED: () => ({}),
  DENIED: () => ({}),
  SHOW_ERROR: () => ({}),
  SUCCESS: () => ({}),
  IN_PROGRESS: () => ({}),
  TIMEOUT: () => ({}),
  QRLOGIN_VIA_DEEP_LINK: (linkCode: string) => ({linkCode}),
  OVP_VIA_DEEP_LINK: (authorizationRequest: string) => ({authorizationRequest}),
};

export const ScanModel = createModel(
  {
    serviceRefs: {} as AppServices,
    senderInfo: {} as DeviceInfo,
    receiverInfo: {} as DeviceInfo,
    selectedVc: {} as VC,
    bleError: {} as BLEError,
    loggers: [] as EmitterSubscription[],
    vcName: '',
    flowType: VCShareFlowType.SIMPLE_SHARE,
    openID4VPFlowType: '',
    verificationImage: {} as CameraCapturedPicture,
    openId4VpUri: '',
    shareLogType: '' as ActivityLogType,
    QrLoginRef: {} as ActorRefFrom<typeof qrLoginMachine>,
    OpenId4VPRef: {} as ActorRefFrom<typeof openID4VPMachine>,
    showQuickShareSuccessBanner: false,
    linkCode: '',
    authorizationRequest: '',
    quickShareData: {},
    isQrLoginViaDeepLink: false,
    isOVPViaDeepLink: false,
    showFaceAuthConsent: true as boolean,
    readyForBluetoothStateCheck: false,
    showFaceCaptureSuccessBanner: false,
  },
  {
    events: ScanEvents,
  },
);
