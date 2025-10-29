
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "done.invoke._store": { type: "done.invoke._store"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.store.checkFreshInstall:invocation[0]": { type: "done.invoke.store.checkFreshInstall:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.store.resettingStorage:invocation[0]": { type: "done.invoke.store.resettingStorage:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"error.platform._store": { type: "error.platform._store"; data: unknown };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          "checkFreshInstall": "done.invoke.store.checkFreshInstall:invocation[0]";
"checkStorageInitialisedOrNot": "done.invoke.store.checkStorageInitialisation:invocation[0]";
"clear": "done.invoke.store.resettingStorage:invocation[0]";
"clearKeys": "done.invoke.store.clearIosKeys:invocation[0]";
"generateEncryptionKey": "done.invoke.store.generatingEncryptionKey:invocation[0]";
"getEncryptionKey": "done.invoke.store.gettingEncryptionKey:invocation[0]";
"hasEncryptionKey": "done.invoke.store.checkEncryptionKey:invocation[0]";
"store": "done.invoke._store";
        };
        missingImplementations: {
          actions: never;
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          "forwardStoreRequest": "APPEND" | "CLEAR" | "EXPORT" | "FETCH_ALL_WELLKNOWN_CONFIG" | "GET" | "GET_VCS_DATA" | "PREPEND" | "REMOVE" | "REMOVE_ITEMS" | "REMOVE_VC_METADATA" | "RESTORE_BACKUP" | "SET" | "UPDATE";
"notifyParent": "KEY_RECEIVED" | "READY" | "done.invoke.store.resettingStorage:invocation[0]";
"setEncryptionKey": "KEY_RECEIVED";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          "hasData": "done.invoke.store.checkFreshInstall:invocation[0]";
"isCustomSecureKeystore": "KEY_RECEIVED";
        };
        eventsCausingServices: {
          "checkFreshInstall": "BIOMETRIC_CANCELLED" | "xstate.init";
"checkStorageInitialisedOrNot": "ERROR";
"clear": "KEY_RECEIVED";
"clearKeys": "done.invoke.store.checkFreshInstall:invocation[0]";
"generateEncryptionKey": "ERROR" | "IGNORE" | "READY";
"getEncryptionKey": "TRY_AGAIN";
"hasEncryptionKey": never;
"store": "KEY_RECEIVED" | "READY" | "done.invoke.store.resettingStorage:invocation[0]";
        };
        matchesStates: "checkEncryptionKey" | "checkFreshInstall" | "checkStorageInitialisation" | "clearIosKeys" | "failedReadingKey" | "generatingEncryptionKey" | "gettingEncryptionKey" | "ready" | "resettingStorage";
        tags: never;
      }
  
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "done.invoke._store": { type: "done.invoke._store"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.store.checkFreshInstall:invocation[0]": { type: "done.invoke.store.checkFreshInstall:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.store.resettingStorage:invocation[0]": { type: "done.invoke.store.resettingStorage:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"error.platform._store": { type: "error.platform._store"; data: unknown };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          "checkFreshInstall": "done.invoke.store.checkFreshInstall:invocation[0]";
"checkStorageInitialisedOrNot": "done.invoke.store.checkStorageInitialisation:invocation[0]";
"clear": "done.invoke.store.resettingStorage:invocation[0]";
"clearKeys": "done.invoke.store.clearIosKeys:invocation[0]";
"generateEncryptionKey": "done.invoke.store.generatingEncryptionKey:invocation[0]";
"getEncryptionKey": "done.invoke.store.gettingEncryptionKey:invocation[0]";
"hasEncryptionKey": "done.invoke.store.checkEncryptionKey:invocation[0]";
"store": "done.invoke._store";
        };
        missingImplementations: {
          actions: never;
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          "forwardStoreRequest": "APPEND" | "CLEAR" | "EXPORT" | "FETCH_ALL_WELLKNOWN_CONFIG" | "GET" | "GET_VCS_DATA" | "PREPEND" | "REMOVE" | "REMOVE_ITEMS" | "REMOVE_VC_METADATA" | "RESTORE_BACKUP" | "SET" | "UPDATE";
"notifyParent": "KEY_RECEIVED" | "READY" | "done.invoke.store.resettingStorage:invocation[0]";
"setEncryptionKey": "KEY_RECEIVED";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          "hasData": "done.invoke.store.checkFreshInstall:invocation[0]";
"isCustomSecureKeystore": "KEY_RECEIVED";
        };
        eventsCausingServices: {
          "checkFreshInstall": "BIOMETRIC_CANCELLED" | "xstate.init";
"checkStorageInitialisedOrNot": "ERROR";
"clear": "KEY_RECEIVED";
"clearKeys": "done.invoke.store.checkFreshInstall:invocation[0]";
"generateEncryptionKey": "ERROR" | "IGNORE" | "READY";
"getEncryptionKey": "TRY_AGAIN";
"hasEncryptionKey": never;
"store": "KEY_RECEIVED" | "READY" | "done.invoke.store.resettingStorage:invocation[0]";
        };
        matchesStates: "checkEncryptionKey" | "checkFreshInstall" | "checkStorageInitialisation" | "clearIosKeys" | "failedReadingKey" | "generatingEncryptionKey" | "gettingEncryptionKey" | "ready" | "resettingStorage";
        tags: never;
      }
  