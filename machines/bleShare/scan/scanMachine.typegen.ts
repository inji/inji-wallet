
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "": { type: "" };
"done.invoke.QrLogin": { type: "done.invoke.QrLogin"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.scan.checkStorage:invocation[0]": { type: "done.invoke.scan.checkStorage:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"xstate.after(DESTROY_TIMEOUT)#scan.clearingConnection": { type: "xstate.after(DESTROY_TIMEOUT)#scan.clearingConnection" };
"xstate.init": { type: "xstate.init" };
"xstate.stop": { type: "xstate.stop" };
        };
        invokeSrcNameMap: {
          "checkBluetoothPermission": "done.invoke.scan.checkBluetoothPermission.checking:invocation[0]";
"checkBluetoothState": "done.invoke.scan.checkBluetoothState.checking:invocation[0]" | "done.invoke.scan.recheckBluetoothState.checking:invocation[0]";
"checkLocationPermission": "done.invoke.scan.checkingLocationState.checkingPermissionStatus:invocation[0]";
"checkLocationStatus": "done.invoke.scan.checkingLocationState.checkLocationService:invocation[0]";
"checkNearByDevicesPermission": "done.invoke.scan.checkNearbyDevicesPermission.checking:invocation[0]";
"checkStorageAvailability": "done.invoke.scan.checkStorage:invocation[0]";
"disconnect": "done.invoke.scan.clearingConnection:invocation[0]" | "done.invoke.scan.disconnectDevice:invocation[0]" | "done.invoke.scan.reviewing.disconnect:invocation[0]";
"monitorConnection": "done.invoke.scan:invocation[0]";
"requestBluetooth": "done.invoke.scan.checkBluetoothState.requesting:invocation[0]";
"requestNearByDevicesPermission": "done.invoke.scan.checkNearbyDevicesPermission.requesting:invocation[0]";
"requestToEnableLocationPermission": "done.invoke.scan.checkingLocationState.requestToEnableLocation:invocation[0]";
"sendVc": "done.invoke.scan.reviewing.sendingVc:invocation[0]";
"startConnection": "done.invoke.scan.connecting:invocation[0]";
        };
        missingImplementations: {
          actions: "clearUri" | "enableLocation" | "getFaceAuthConsent" | "loadMetaDataToMemory" | "loadVCDataToMemory" | "logFailedVerification" | "logShared" | "openAppPermission" | "openBluetoothSettings" | "refreshVCs" | "registerLoggers" | "removeLoggers" | "resetFaceCaptureBannerStatus" | "resetFlowType" | "resetIsQrLoginViaDeepLink" | "resetLinkCode" | "resetOpenID4VPFlowType" | "resetSelectedVc" | "resetShowQuickShareSuccessBanner" | "sendBLEConnectionErrorEvent" | "sendScanData" | "sendVCShareFlowCancelEndEvent" | "sendVCShareFlowTimeoutEndEvent" | "sendVPScanData" | "sendVcShareSuccessEvent" | "sendVcSharingStartEvent" | "setBleError" | "setFlowType" | "setIsQrLoginViaDeepLink" | "setLinkCode" | "setLinkCodeFromDeepLink" | "setOpenId4VPFlowType" | "setOpenId4VPRef" | "setQrLoginRef" | "setQuickShareData" | "setReadyForBluetoothStateCheck" | "setReceiverInfo" | "setSelectedVc" | "setSenderInfo" | "setShareLogTypeUnverified" | "setShareLogTypeVerified" | "setShowFaceAuthConsent" | "setShowQuickShareSuccessBanner" | "setUri" | "storeLoginItem" | "storeShowFaceAuthConsent" | "storingActivityLog" | "updateFaceCaptureBannerStatus" | "updateShowFaceAuthConsent";
          delays: never;
          guards: "isFlowTypeMiniViewShare" | "isFlowTypeMiniViewShareWithSelfie" | "isFlowTypeSimpleShare" | "isIOS" | "isMinimumStorageRequiredForAuditEntryReached" | "isOnlineSharing" | "isOpenIdQr" | "isQrLogin" | "isQrLoginViaDeepLinking" | "isQuickShare" | "showFaceAuthConsentScreen" | "uptoAndroid11";
          services: "checkBluetoothPermission" | "checkBluetoothState" | "checkLocationPermission" | "checkLocationStatus" | "checkNearByDevicesPermission" | "checkStorageAvailability" | "disconnect" | "monitorConnection" | "requestBluetooth" | "requestNearByDevicesPermission" | "requestToEnableLocationPermission" | "sendVc" | "startConnection";
        };
        eventsCausingActions: {
          "clearUri": "";
"enableLocation": "ALLOWED" | "LOCATION_REQUEST";
"getFaceAuthConsent": "DISCONNECT" | "DISMISS" | "xstate.after(DESTROY_TIMEOUT)#scan.clearingConnection";
"loadMetaDataToMemory": "SCAN";
"loadVCDataToMemory": "STORE_RESPONSE";
"logFailedVerification": "FACE_INVALID";
"logShared": "VC_ACCEPTED";
"openAppPermission": "GOTO_SETTINGS" | "LOCATION_REQUEST";
"openBluetoothSettings": "GOTO_SETTINGS";
"refreshVCs": "STORE_RESPONSE";
"registerLoggers": "";
"removeLoggers": "" | "DISCONNECT" | "DISMISS" | "DISMISS_QUICK_SHARE_BANNER" | "QRLOGIN_VIA_DEEP_LINK" | "RESET" | "SCREEN_BLUR" | "xstate.init";
"resetFaceCaptureBannerStatus": "" | "ACCEPT_REQUEST" | "CLOSE_BANNER";
"resetFlowType": "DISCONNECT" | "DISMISS" | "DISMISS_QUICK_SHARE_BANNER" | "GOTO_HISTORY" | "QRLOGIN_VIA_DEEP_LINK" | "RESET" | "SCREEN_BLUR" | "xstate.init";
"resetIsQrLoginViaDeepLink": "DISMISS" | "RESET";
"resetLinkCode": "BLE_ERROR" | "DISMISS" | "DISMISS_QUICK_SHARE_BANNER" | "QRLOGIN_VIA_DEEP_LINK" | "RESET" | "SCREEN_BLUR" | "SCREEN_FOCUS" | "SELECT_VC" | "xstate.stop";
"resetOpenID4VPFlowType": "CANCEL" | "DISMISS" | "RETRY" | "SCREEN_BLUR";
"resetSelectedVc": "DISCONNECT" | "DISMISS" | "DISMISS_QUICK_SHARE_BANNER" | "GOTO_HISTORY" | "QRLOGIN_VIA_DEEP_LINK" | "RESET" | "SCREEN_BLUR" | "xstate.init";
"resetShowQuickShareSuccessBanner": "DISMISS" | "DISMISS_QUICK_SHARE_BANNER";
"sendBLEConnectionErrorEvent": "BLE_ERROR";
"sendScanData": "" | "SCAN";
"sendVCShareFlowCancelEndEvent": "CANCEL";
"sendVCShareFlowTimeoutEndEvent": "CANCEL" | "RETRY";
"sendVPScanData": "SCAN";
"sendVcShareSuccessEvent": "VC_ACCEPTED";
"sendVcSharingStartEvent": "SCAN";
"setBleError": "BLE_ERROR";
"setFlowType": "SELECT_VC";
"setIsQrLoginViaDeepLink": "QRLOGIN_VIA_DEEP_LINK";
"setLinkCode": "SCAN";
"setLinkCodeFromDeepLink": "QRLOGIN_VIA_DEEP_LINK";
"setOpenId4VPFlowType": "SCAN";
"setOpenId4VPRef": "CANCEL" | "DISCONNECT" | "DISMISS" | "DISMISS_QUICK_SHARE_BANNER" | "QRLOGIN_VIA_DEEP_LINK" | "RESET" | "RETRY" | "SCREEN_BLUR" | "SCREEN_FOCUS" | "SELECT_VC" | "xstate.init";
"setQrLoginRef": "QRLOGIN_VIA_DEEP_LINK" | "SCAN";
"setQuickShareData": "SCAN";
"setReadyForBluetoothStateCheck": "BLUETOOTH_PERMISSION_ENABLED";
"setReceiverInfo": "CONNECTED";
"setSelectedVc": "SELECT_VC";
"setSenderInfo": "CONNECTED";
"setShareLogTypeUnverified": "ACCEPT_REQUEST" | "CHECK_FLOW_TYPE";
"setShareLogTypeVerified": "FACE_VALID";
"setShowFaceAuthConsent": "FACE_VERIFICATION_CONSENT";
"setShowQuickShareSuccessBanner": "STORE_RESPONSE";
"setUri": "SCAN";
"storeLoginItem": "done.invoke.QrLogin";
"storeShowFaceAuthConsent": "FACE_VERIFICATION_CONSENT";
"storingActivityLog": "STORE_RESPONSE";
"updateFaceCaptureBannerStatus": "FACE_VALID";
"updateShowFaceAuthConsent": "STORE_RESPONSE";
        };
        eventsCausingDelays: {
          "CONNECTION_TIMEOUT": "SCAN";
"DESTROY_TIMEOUT": "" | "DISMISS" | "LOCATION_ENABLED" | "RETRY";
"SHARING_TIMEOUT": "ACCEPT_REQUEST" | "CHECK_FLOW_TYPE" | "FACE_VALID";
        };
        eventsCausingGuards: {
          "isFlowTypeMiniViewShare": "CHECK_FLOW_TYPE";
"isFlowTypeMiniViewShareWithSelfie": "CHECK_FLOW_TYPE" | "DISMISS";
"isFlowTypeSimpleShare": "CANCEL" | "CHECK_FLOW_TYPE" | "DISMISS" | "RETRY";
"isIOS": "BLUETOOTH_STATE_DISABLED" | "START_PERMISSION_CHECK";
"isMinimumStorageRequiredForAuditEntryReached": "done.invoke.scan.checkStorage:invocation[0]";
"isOnlineSharing": "SCAN";
"isOpenIdQr": "SCAN";
"isQrLogin": "SCAN";
"isQrLoginViaDeepLinking": "" | "STORE_RESPONSE";
"isQuickShare": "SCAN";
"showFaceAuthConsentScreen": "" | "VERIFY_AND_ACCEPT_REQUEST";
"uptoAndroid11": "" | "START_PERMISSION_CHECK";
        };
        eventsCausingServices: {
          "OpenId4VP": "SCAN";
"QrLogin": "" | "SCAN";
"checkBluetoothPermission": "" | "BLUETOOTH_STATE_DISABLED" | "NEARBY_ENABLED" | "START_PERMISSION_CHECK";
"checkBluetoothState": "" | "APP_ACTIVE";
"checkLocationPermission": "LOCATION_ENABLED";
"checkLocationStatus": "" | "APP_ACTIVE" | "LOCATION_REQUEST";
"checkNearByDevicesPermission": "APP_ACTIVE" | "START_PERMISSION_CHECK";
"checkStorageAvailability": "CANCEL" | "DISMISS" | "QRLOGIN_VIA_DEEP_LINK" | "RESET" | "RETRY" | "SCREEN_FOCUS" | "SELECT_VC";
"disconnect": "" | "DISMISS" | "LOCATION_ENABLED" | "RETRY" | "SCREEN_BLUR";
"monitorConnection": "DISMISS" | "QRLOGIN_VIA_DEEP_LINK" | "SCREEN_BLUR" | "xstate.init";
"requestBluetooth": "BLUETOOTH_STATE_DISABLED";
"requestNearByDevicesPermission": "NEARBY_DISABLED";
"requestToEnableLocationPermission": "LOCATION_DISABLED";
"sendVc": "ACCEPT_REQUEST" | "CHECK_FLOW_TYPE" | "FACE_VALID";
"startConnection": "SCAN";
        };
        matchesStates: "bluetoothDenied" | "bluetoothPermissionDenied" | "checkBluetoothPermission" | "checkBluetoothPermission.checking" | "checkBluetoothPermission.enabled" | "checkBluetoothState" | "checkBluetoothState.checking" | "checkBluetoothState.enabled" | "checkBluetoothState.requesting" | "checkFaceAuthConsent" | "checkNearbyDevicesPermission" | "checkNearbyDevicesPermission.checking" | "checkNearbyDevicesPermission.enabled" | "checkNearbyDevicesPermission.requesting" | "checkQrLoginViaDeepLink" | "checkStorage" | "checkingLocationState" | "checkingLocationState.LocationPermissionRationale" | "checkingLocationState.checkLocationService" | "checkingLocationState.checkingPermissionStatus" | "checkingLocationState.denied" | "checkingLocationState.disabled" | "checkingLocationState.requestToEnableLocation" | "clearingConnection" | "connecting" | "connecting.inProgress" | "connecting.timeout" | "decodeQuickShareData" | "disconnectDevice" | "disconnected" | "findingConnection" | "handlingBleError" | "inactive" | "invalid" | "loadVCS" | "loadVCS.idle" | "loadVCS.navigatingToHome" | "nearByDevicesPermissionDenied" | "recheckBluetoothState" | "recheckBluetoothState.checking" | "recheckBluetoothState.enabled" | "restrictSharingVc" | "reviewing" | "reviewing.accepted" | "reviewing.cancelling" | "reviewing.checkFaceAuthConsentForMiniView" | "reviewing.disconnect" | "reviewing.faceVerificationConsent" | "reviewing.idle" | "reviewing.invalidIdentity" | "reviewing.navigateToHistory" | "reviewing.rejected" | "reviewing.selectingVc" | "reviewing.sendingVc" | "reviewing.sendingVc.inProgress" | "reviewing.sendingVc.sent" | "reviewing.sendingVc.timeout" | "reviewing.verifyingIdentity" | "showQrLogin" | "showQrLogin.idle" | "showQrLogin.navigatingToHistory" | "showQrLogin.navigatingToHome" | "showQrLogin.storing" | "startPermissionCheck" | "startVPSharing" | "startVPSharing.inProgress" | "startVPSharing.showError" | "startVPSharing.success" | "startVPSharing.timeout" | { "checkBluetoothPermission"?: "checking" | "enabled";
"checkBluetoothState"?: "checking" | "enabled" | "requesting";
"checkNearbyDevicesPermission"?: "checking" | "enabled" | "requesting";
"checkingLocationState"?: "LocationPermissionRationale" | "checkLocationService" | "checkingPermissionStatus" | "denied" | "disabled" | "requestToEnableLocation";
"connecting"?: "inProgress" | "timeout";
"loadVCS"?: "idle" | "navigatingToHome";
"recheckBluetoothState"?: "checking" | "enabled";
"reviewing"?: "accepted" | "cancelling" | "checkFaceAuthConsentForMiniView" | "disconnect" | "faceVerificationConsent" | "idle" | "invalidIdentity" | "navigateToHistory" | "rejected" | "selectingVc" | "sendingVc" | "verifyingIdentity" | { "sendingVc"?: "inProgress" | "sent" | "timeout"; };
"showQrLogin"?: "idle" | "navigatingToHistory" | "navigatingToHome" | "storing";
"startVPSharing"?: "inProgress" | "showError" | "success" | "timeout"; };
        tags: never;
      }
  