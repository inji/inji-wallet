// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  internalEvents: {
    '': {type: ''};
    'done.invoke.request.checkStorage:invocation[0]': {
      type: 'done.invoke.request.checkStorage:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'xstate.after(DESTROY_TIMEOUT)#request.clearingConnection': {
      type: 'xstate.after(DESTROY_TIMEOUT)#request.clearingConnection';
    };
    'xstate.after(SHARING_TIMEOUT)#request.waitingForVc.inProgress': {
      type: 'xstate.after(SHARING_TIMEOUT)#request.waitingForVc.inProgress';
    };
    'xstate.init': {type: 'xstate.init'};
  };
  invokeSrcNameMap: {
    advertiseDevice: 'done.invoke.request.waitingForConnection:invocation[0]';
    checkBluetoothService: 'done.invoke.request.checkingBluetoothService.checking:invocation[0]';
    checkNearByDevicesPermission: 'done.invoke.request.checkNearbyDevicesPermission.checking:invocation[0]';
    checkStorageAvailability: 'done.invoke.request.checkStorage:invocation[0]';
    disconnect:
      | 'done.invoke.request.disconnecting:invocation[0]'
      | 'done.invoke.request.clearingConnection:invocation[0]'
      | 'done.invoke.request.reviewing.navigatingToHistory:invocation[0]'
      | 'done.invoke.request.reviewing.navigatingToHome:invocation[0]';
    monitorConnection: 'done.invoke.request:invocation[0]';
    receiveVc: 'done.invoke.request.waitingForVc:invocation[0]';
    requestBluetooth: 'done.invoke.request.checkingBluetoothService.requesting:invocation[0]';
    requestNearByDevicesPermission: 'done.invoke.request.checkNearbyDevicesPermission.requesting:invocation[0]';
    sendVcResponse:
      | 'done.invoke.request.reviewing.accepted:invocation[0]'
      | 'done.invoke.request.reviewing.rejected:invocation[0]'
      | 'done.invoke.request.reviewing.savingFailed:invocation[0]';
  };
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {
    logReceived: 'CANCEL' | 'REJECT' | 'STORE_ERROR' | 'STORE_RESPONSE';
    openAppPermission: 'GOTO_SETTINGS';
    prependReceivedVcMetadata:
      | 'ACCEPT'
      | 'DISMISS'
      | 'FACE_VALID'
      | 'VC_RECEIVED';
    registerLoggers:
      | 'DISCONNECT'
      | 'RESET'
      | 'xstate.after(DESTROY_TIMEOUT)#request.clearingConnection';
    removeLoggers:
      | 'DISCONNECT'
      | 'GOTO_HOME'
      | 'RESET'
      | 'SCREEN_BLUR'
      | 'xstate.after(DESTROY_TIMEOUT)#request.clearingConnection'
      | 'xstate.init';
    removeReceivedVcMetadataFromStorage: 'STORE_ERROR';
    sendBLEConnectionErrorEvent: 'BLE_ERROR';
    sendVCReceiveFailedEvent: 'FACE_INVALID';
    sendVCReceiveFlowTimeoutEndEvent: 'CANCEL';
    sendVCReceiveRejectedEvent: 'CANCEL' | 'REJECT' | 'STORE_ERROR';
    sendVCReceiveSuccessEvent: 'STORE_RESPONSE';
    sendVCReceivingDisconnectedEvent: 'DISCONNECT';
    sendVCReceivingStartEvent: 'CONNECTED';
    sendVCReceivingTerminatedEvent: 'CANCEL';
    sendVcReceived: 'STORE_RESPONSE';
    setBleError: 'BLE_ERROR';
    setIncomingVc: 'VC_RECEIVED';
    setOpenID4VpUri: 'ADV_STARTED';
    setReadyForBluetoothStateCheck: 'NEARBY_ENABLED';
    setReceiveLogTypeDiscarded: 'CANCEL' | 'REJECT' | 'STORE_ERROR';
    setReceiveLogTypeRegular: 'ACCEPT' | 'STORE_RESPONSE';
    setReceiveLogTypeUnverified: 'FACE_INVALID';
    setReceiveLogTypeVerified: 'FACE_VALID';
    setReceiverInfo: 'CONNECTED';
    setSenderInfo: 'CONNECTED';
    storeVc: 'STORE_RESPONSE';
  };
  eventsCausingDelays: {
    DESTROY_TIMEOUT: '' | 'DISMISS';
    SHARING_TIMEOUT: 'CONNECTED';
  };
  eventsCausingGuards: {
    isMinimumStorageLimitReached: 'done.invoke.request.checkStorage:invocation[0]';
  };
  eventsCausingServices: {
    advertiseDevice:
      | 'DISCONNECT'
      | 'RESET'
      | 'xstate.after(DESTROY_TIMEOUT)#request.clearingConnection';
    checkBluetoothService: 'NEARBY_ENABLED';
    checkNearByDevicesPermission:
      | 'APP_ACTIVE'
      | 'RESET'
      | 'done.invoke.request.checkStorage:invocation[0]';
    checkStorageAvailability: 'SCREEN_FOCUS';
    disconnect:
      | ''
      | 'DISMISS'
      | 'GOTO_HOME'
      | 'GO_TO_RECEIVED_VC_TAB'
      | 'SCREEN_BLUR';
    monitorConnection: 'GOTO_HOME' | 'xstate.init';
    receiveVc: 'CONNECTED';
    requestBluetooth: 'BLUETOOTH_STATE_DISABLED';
    requestNearByDevicesPermission: 'NEARBY_DISABLED';
    sendVcResponse: 'CANCEL' | 'REJECT' | 'STORE_ERROR' | 'STORE_RESPONSE';
  };
  matchesStates:
    | 'bluetoothDenied'
    | 'cancelling'
    | 'checkNearbyDevicesPermission'
    | 'checkNearbyDevicesPermission.checking'
    | 'checkNearbyDevicesPermission.requesting'
    | 'checkStorage'
    | 'checkingBluetoothService'
    | 'checkingBluetoothService.checking'
    | 'checkingBluetoothService.enabled'
    | 'checkingBluetoothService.requesting'
    | 'clearingConnection'
    | 'disconnected'
    | 'disconnecting'
    | 'handlingBleError'
    | 'inactive'
    | 'nearByDevicesPermissionDenied'
    | 'reviewing'
    | 'reviewing.accepted'
    | 'reviewing.accepting'
    | 'reviewing.accepting.prependingReceivedVcMetadata'
    | 'reviewing.accepting.storingVc'
    | 'reviewing.displayingIncomingVC'
    | 'reviewing.idle'
    | 'reviewing.invalidIdentity'
    | 'reviewing.navigatingToHistory'
    | 'reviewing.navigatingToHome'
    | 'reviewing.navigatingToReceivedCards'
    | 'reviewing.rejected'
    | 'reviewing.savingFailed'
    | 'reviewing.savingFailed.idle'
    | 'reviewing.verifyingIdentity'
    | 'storageLimitReached'
    | 'waitingForConnection'
    | 'waitingForVc'
    | 'waitingForVc.inProgress'
    | 'waitingForVc.timeout'
    | {
        checkNearbyDevicesPermission?: 'checking' | 'requesting';
        checkingBluetoothService?: 'checking' | 'enabled' | 'requesting';
        reviewing?:
          | 'accepted'
          | 'accepting'
          | 'displayingIncomingVC'
          | 'idle'
          | 'invalidIdentity'
          | 'navigatingToHistory'
          | 'navigatingToHome'
          | 'navigatingToReceivedCards'
          | 'rejected'
          | 'savingFailed'
          | 'verifyingIdentity'
          | {
              accepting?: 'prependingReceivedVcMetadata' | 'storingVc';
              savingFailed?: 'idle';
            };
        waitingForVc?: 'inProgress' | 'timeout';
      };
  tags: never;
}
