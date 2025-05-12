import telemetry from 'telemetry-sdk';
import {Platform} from 'react-native';
import {MIMOTO_BASE_URL} from '../constants';
import i18next from 'i18next';
import {
  __AppId,
  __InjiVersion,
  __SelectedLanguage,
  __SessionId,
  __TuvaliVersion,
} from '../GlobalVariables';
import {OBSRV_HOST} from 'react-native-dotenv';
import DeviceInfo from 'react-native-device-info';
import {isHardwareKeystoreExists} from '../cryptoutil/cryptoUtil';
import * as RNLocalize from 'react-native-localize';
import {TelemetryConstants} from './TelemetryConstants';

export function sendStartEvent(data) {
  //telemetry.start({}, '', '', data, {});
}

export function sendEndEvent(data) {
  //telemetry.end(data, {});
}

export function sendImpressionEvent(data) {
  //telemetry.impression(data, {});
}

export function sendInteractEvent(data) {
  //telemetry.interact(data, {});
}

export function sendAppInfoEvent(data) {
  //telemetry.appinfo(data);
}

export function sendErrorEvent(data) {
  //telemetry.error(data, {});
}

export function initializeTelemetry(config) {
  //telemetry.initialize(config);
}

export function getTelemetryConfigData() {
  return {
    authtoken: '',
    appid: __AppId.getValue(),
    sid: __SessionId.getValue(),
    batchsize: 5,
    host: OBSRV_HOST,
    endpoint: '/obsrv/v1/data/create/mosip-dataset',
    telemetryDebugEnabled: false,
    enableValidation: true,
    schemaBaseUrl: 'http://mosip.io/telemetry/',
  };
}

export function getStartEventData(type, additionalParameters = {}) {
  return {
    type: type,
    additionalParameters: additionalParameters,
  };
}

export function getEndEventData(type, status, additionalParameters = {}) {
  return {
    type: type,
    status: status,
    additionalParameters: additionalParameters,
  };
}

export function getInteractEventData(
  type,
  ineteractionType,
  interactingOn,
  additionParameters = {},
) {
  const subtype = getInteractDataSubtype(ineteractionType, interactingOn);
  return {
    type,
    subtype,
    additionParameters: additionParameters,
  };
}

export const getInteractDataSubtype = (ineteractionType, interactingOn) => {
  return ineteractionType + '_' + interactingOn;
};

export function getImpressionEventData(
  type,
  subtype,
  additionalParameters = {},
) {
  return {
    type,
    subtype,
    additionalParameters: additionalParameters,
  };
}

export function getErrorEventData(
  type,
  errorId,
  errorMessage,
  stacktrace = {},
) {
  return {
    type: type,
    errorId: errorId,
    errorMessage: errorMessage,
    stacktrace: stacktrace,
    ...getAppInfoEventData(),
  };
}

export function getAppInfoEventData() {
  return {
    env: MIMOTO_BASE_URL,
    brandName: DeviceInfo.getBrand(),
    modelName: DeviceInfo.getModel(),
    osName: DeviceInfo.getSystemName(),
    osVersion: DeviceInfo.getSystemVersion(),
    osApiLevel: Platform.Version.toString(),
    isHardwareKeystoreSupported: isHardwareKeystoreExists,
    dateTime: new Date().getTime(),
    zone: RNLocalize.getTimeZone(),
    offset: new Date().getTimezoneOffset() * 60 * 1000,
    preferredLanguage: languageCodeMap[i18next.language] ?? i18next.language,
    buildNumber: DeviceInfo.getBuildNumber(),
    injiVersion: __InjiVersion.getValue(),
    tuvaliVersion: __TuvaliVersion.getValue(),
  };
}

let retryCount = 0;

export const incrementRetryCount = (eventType, screen) => {
  if (retryCount < 4) {
    retryCount += 1;
  } else {
    const [errorId, errorMessage] =
      screen === TelemetryConstants.Screens.passcode
        ? [
            TelemetryConstants.ErrorId.mismatch,
            TelemetryConstants.ErrorMessage.passcodeDidNotMatch,
          ]
        : [
            TelemetryConstants.ErrorId.resend,
            TelemetryConstants.ErrorMessage.resendOtp,
          ];
    sendErrorEvent(getErrorEventData(eventType, errorId, errorMessage));
    retryCount = 0;
  }
};

export const resetRetryCount = () => {
  retryCount = 0;
};

export function configureTelemetry() {
  const config = getTelemetryConfigData();
  initializeTelemetry(config);
  sendAppInfoEvent(getAppInfoEventData());
}

export function getEventType(isSettingUp) {
  return isSettingUp
    ? TelemetryConstants.FlowType.appOnboarding
    : TelemetryConstants.FlowType.appLogin;
}

const languageCodeMap = {
  en: 'English',
  fil: 'Filipino',
  ar: 'Arabic',
  hi: 'Hindi',
  kn: 'Kannada',
  ta: 'Tamil',
};
