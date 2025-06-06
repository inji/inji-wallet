
  // This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  internalEvents: {
    'done.invoke.app.init.checkKeyPairs:invocation[0]': {
      type: 'done.invoke.app.init.checkKeyPairs:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'done.invoke.app.init.generateKeyPairs:invocation[0]': {
      type: 'done.invoke.app.init.generateKeyPairs:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'done.invoke.app.ready.focus.active:invocation[0]': {
      type: 'done.invoke.app.ready.focus.active:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'error.platform.app.init.checkKeyPairs:invocation[0]': {
      type: 'error.platform.app.init.checkKeyPairs:invocation[0]';
      data: unknown;
    };
    'xstate.init': {type: 'xstate.init'};
  };
  invokeSrcNameMap: {
    checkFocusState: 'done.invoke.app.ready.focus:invocation[0]';
    checkKeyPairs: 'done.invoke.app.init.checkKeyPairs:invocation[0]';
    checkNetworkState: 'done.invoke.app.ready.network:invocation[0]';
    generateKeyPairsAndStoreOrder: 'done.invoke.app.init.generateKeyPairs:invocation[0]';
    getAppInfo: 'done.invoke.app.init.info:invocation[0]';
    isQrLoginByDeepLink: 'done.invoke.app.ready.focus.active:invocation[0]';
    resetQRLoginDeepLinkData: 'done.invoke.app.ready.focus.active:invocation[1]';
  };
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {
    forwardToServices: 'ACTIVE' | 'INACTIVE' | 'OFFLINE' | 'ONLINE';
    loadCredentialRegistryHostFromStorage: 'READY';
    loadCredentialRegistryInConstants: 'STORE_RESPONSE';
    loadEsignetHostFromConstants: 'STORE_RESPONSE';
    loadEsignetHostFromStorage: 'READY';
    logServiceEvents: 'done.invoke.app.init.checkKeyPairs:invocation[0]';
    logStoreEvents:
      | 'BIOMETRIC_CANCELLED'
      | 'KEY_INVALIDATE_ERROR'
      | 'RESET_KEY_INVALIDATE_ERROR_DISMISS'
      | 'xstate.init';
    requestDeviceInfo: 'REQUEST_DEVICE_INFO';
    resetKeyInvalidateError: 'READY' | 'RESET_KEY_INVALIDATE_ERROR_DISMISS';
    resetLinkCode: 'RESET_LINKCODE';
    setAppInfo: 'APP_INFO_RECEIVED';
    setIsDecryptError: 'DECRYPT_ERROR';
    setIsReadError: 'ERROR';
    setLinkCode: 'done.invoke.app.ready.focus.active:invocation[0]';
    spawnServiceActors: 'done.invoke.app.init.checkKeyPairs:invocation[0]';
    spawnStoreActor:
      | 'BIOMETRIC_CANCELLED'
      | 'KEY_INVALIDATE_ERROR'
      | 'RESET_KEY_INVALIDATE_ERROR_DISMISS'
      | 'xstate.init';
    unsetIsDecryptError: 'DECRYPT_ERROR_DISMISS' | 'READY';
    unsetIsReadError: 'READY';
    updateKeyInvalidateError: 'ERROR' | 'KEY_INVALIDATE_ERROR';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {
    checkFocusState: 'APP_INFO_RECEIVED';
    checkKeyPairs:
      | 'READY'
      | 'done.invoke.app.init.generateKeyPairs:invocation[0]';
    checkNetworkState: 'APP_INFO_RECEIVED';
    generateKeyPairsAndStoreOrder: 'error.platform.app.init.checkKeyPairs:invocation[0]';
    getAppInfo: 'STORE_RESPONSE';
    isQrLoginByDeepLink: 'ACTIVE';
    resetQRLoginDeepLinkData: 'ACTIVE';
  };
  matchesStates:
    | 'init'
    | 'init.checkKeyPairs'
    | 'init.credentialRegistry'
    | 'init.generateKeyPairs'
    | 'init.info'
    | 'init.services'
    | 'init.store'
    | 'ready'
    | 'ready.focus'
    | 'ready.focus.active'
    | 'ready.focus.checking'
    | 'ready.focus.inactive'
    | 'ready.network'
    | 'ready.network.checking'
    | 'ready.network.offline'
    | 'ready.network.online'
    | 'waiting'
    | {
        init?:
          | 'checkKeyPairs'
          | 'credentialRegistry'
          | 'generateKeyPairs'
          | 'info'
          | 'services'
          | 'store';
        ready?:
          | 'focus'
          | 'network'
          | {
              focus?: 'active' | 'checking' | 'inactive';
              network?: 'checking' | 'offline' | 'online';
            };
      };
  tags: never;
}
