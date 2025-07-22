
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "done.invoke.app.init.checkKeyPairs:invocation[0]": { type: "done.invoke.app.init.checkKeyPairs:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.app.init.fetchConfig:invocation[0]": { type: "done.invoke.app.init.fetchConfig:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.app.init.generateKeyPairs:invocation[0]": { type: "done.invoke.app.init.generateKeyPairs:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.app.ready.focus.active:invocation[0]": { type: "done.invoke.app.ready.focus.active:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.app.ready.focus.active:invocation[2]": { type: "done.invoke.app.ready.focus.active:invocation[2]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"error.platform.app.init.checkKeyPairs:invocation[0]": { type: "error.platform.app.init.checkKeyPairs:invocation[0]"; data: unknown };
"error.platform.app.init.fetchConfig:invocation[0]": { type: "error.platform.app.init.fetchConfig:invocation[0]"; data: unknown };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          "checkFocusState": "done.invoke.app.ready.focus:invocation[0]";
"checkKeyPairs": "done.invoke.app.init.checkKeyPairs:invocation[0]";
"checkNetworkState": "done.invoke.app.ready.network:invocation[0]";
"fetchAndUpdateCacheTTLFromConfig": "done.invoke.app.init.fetchConfig:invocation[0]";
"generateKeyPairsAndStoreOrder": "done.invoke.app.init.generateKeyPairs:invocation[0]";
"getAppInfo": "done.invoke.app.init.info:invocation[0]";
"getOVPDeepLinkIntent": "done.invoke.app.ready.focus.active:invocation[2]";
"getQrLoginDeepLinkIntent": "done.invoke.app.ready.focus.active:invocation[0]";
"resetOVPDeepLinkIntent": "done.invoke.app.ready.focus.active:invocation[3]";
"resetQrLoginDeepLinkIntent": "done.invoke.app.ready.focus.active:invocation[1]";
        };
        missingImplementations: {
          actions: "forwardToServices";
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          "forwardToServices": "ACTIVE" | "INACTIVE" | "OFFLINE" | "ONLINE";
"loadCredentialRegistryHostFromStorage": "READY";
"loadCredentialRegistryInConstants": "STORE_RESPONSE";
"loadEsignetHostFromConstants": "STORE_RESPONSE";
"loadEsignetHostFromStorage": "READY";
"logServiceEvents": "done.invoke.app.init.checkKeyPairs:invocation[0]";
"logStoreEvents": "BIOMETRIC_CANCELLED" | "KEY_INVALIDATE_ERROR" | "RESET_KEY_INVALIDATE_ERROR_DISMISS" | "xstate.init";
"requestDeviceInfo": "REQUEST_DEVICE_INFO";
"resetAuthorizationRequest": "RESET_AUTHORIZATION_REQUEST";
"resetKeyInvalidateError": "READY" | "RESET_KEY_INVALIDATE_ERROR_DISMISS";
"resetLinkCode": "RESET_LINKCODE";
"setAppInfo": "APP_INFO_RECEIVED";
"setAuthorizationRequest": "done.invoke.app.ready.focus.active:invocation[2]";
"setIsDecryptError": "DECRYPT_ERROR";
"setIsReadError": "ERROR";
"setLinkCode": "done.invoke.app.ready.focus.active:invocation[0]";
"spawnServiceActors": "done.invoke.app.init.checkKeyPairs:invocation[0]";
"spawnStoreActor": "BIOMETRIC_CANCELLED" | "KEY_INVALIDATE_ERROR" | "RESET_KEY_INVALIDATE_ERROR_DISMISS" | "xstate.init";
"unsetIsDecryptError": "DECRYPT_ERROR_DISMISS" | "READY";
"unsetIsReadError": "READY";
"updateKeyInvalidateError": "ERROR" | "KEY_INVALIDATE_ERROR";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          
        };
        eventsCausingServices: {
          "checkFocusState": "APP_INFO_RECEIVED";
"checkKeyPairs": "READY" | "done.invoke.app.init.fetchConfig:invocation[0]" | "error.platform.app.init.fetchConfig:invocation[0]";
"checkNetworkState": "APP_INFO_RECEIVED";
"fetchAndUpdateCacheTTLFromConfig": "done.invoke.app.init.generateKeyPairs:invocation[0]";
"generateKeyPairsAndStoreOrder": "error.platform.app.init.checkKeyPairs:invocation[0]";
"getAppInfo": "STORE_RESPONSE";
"getOVPDeepLinkIntent": "ACTIVE";
"getQrLoginDeepLinkIntent": "ACTIVE";
"resetOVPDeepLinkIntent": "ACTIVE";
"resetQrLoginDeepLinkIntent": "ACTIVE";
        };
        matchesStates: "init" | "init.checkKeyPairs" | "init.credentialRegistry" | "init.fetchConfig" | "init.generateKeyPairs" | "init.info" | "init.services" | "init.store" | "ready" | "ready.focus" | "ready.focus.active" | "ready.focus.checking" | "ready.focus.inactive" | "ready.network" | "ready.network.checking" | "ready.network.offline" | "ready.network.online" | "waiting" | { "init"?: "checkKeyPairs" | "credentialRegistry" | "fetchConfig" | "generateKeyPairs" | "info" | "services" | "store";
"ready"?: "focus" | "network" | { "focus"?: "active" | "checking" | "inactive";
"network"?: "checking" | "offline" | "online"; }; };
        tags: never;
      }
  