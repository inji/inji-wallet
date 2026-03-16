
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "done.invoke.backup.backingUp.checkInternet:invocation[0]": { type: "done.invoke.backup.backingUp.checkInternet:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.backup.backingUp.checkStorageAvailability:invocation[0]": { type: "done.invoke.backup.backingUp.checkStorageAvailability:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.backup.backingUp.uploadBackupFile:invocation[0]": { type: "done.invoke.backup.backingUp.uploadBackupFile:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.backup.backingUp.zipBackupFile:invocation[0]": { type: "done.invoke.backup.backingUp.zipBackupFile:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.backup.fetchLastBackupDetails.checkCloud:invocation[0]": { type: "done.invoke.backup.fetchLastBackupDetails.checkCloud:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"error.platform.backup.backingUp.checkInternet:invocation[0]": { type: "error.platform.backup.backingUp.checkInternet:invocation[0]"; data: unknown };
"error.platform.backup.backingUp.checkStorageAvailability:invocation[0]": { type: "error.platform.backup.backingUp.checkStorageAvailability:invocation[0]"; data: unknown };
"error.platform.backup.backingUp.uploadBackupFile:invocation[0]": { type: "error.platform.backup.backingUp.uploadBackupFile:invocation[0]"; data: unknown };
"error.platform.backup.backingUp.zipBackupFile:invocation[0]": { type: "error.platform.backup.backingUp.zipBackupFile:invocation[0]"; data: unknown };
"error.platform.backup.fetchLastBackupDetails.checkCloud:invocation[0]": { type: "error.platform.backup.fetchLastBackupDetails.checkCloud:invocation[0]"; data: unknown };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          "checkInternet": "done.invoke.backup.backingUp.checkInternet:invocation[0]";
"checkStorageAvailability": "done.invoke.backup.backingUp.checkStorageAvailability:invocation[0]";
"getLastBackupDetailsFromCloud": "done.invoke.backup.fetchLastBackupDetails.checkCloud:invocation[0]";
"uploadBackupFile": "done.invoke.backup.backingUp.uploadBackupFile:invocation[0]";
"writeDataToFile": "done.invoke.backup.backingUp.writeDataToFile:invocation[0]";
"zipBackupFile": "done.invoke.backup.backingUp.zipBackupFile:invocation[0]";
        };
        missingImplementations: {
          actions: "cleanupFiles" | "extractLastBackupDetails" | "fetchAllDataFromDB" | "loadVcs" | "sendDataBackupFailureEvent" | "sendDataBackupStartEvent" | "sendDataBackupSuccessEvent" | "sendFetchLastBackupDetailsCancelEvent" | "sendFetchLastBackupDetailsErrorEvent" | "sendFetchLastBackupDetailsFailureEvent" | "sendFetchLastBackupDetailsStartEvent" | "sendFetchLastBackupDetailsSuccessEvent" | "setBackUpNotPossible" | "setBackupErrorReason" | "setBackupErrorReasonAsNoInternet" | "setDataFromStorage" | "setErrorReasonAsStorageLimitReached" | "setFileName" | "setIsAutoBackup" | "setIsLoadingBackupDetails" | "setLastBackupDetails" | "setShowBackupInProgress" | "unsetIsLoadingBackupDetails" | "unsetLastBackupDetails" | "unsetShowBackupInProgress";
          delays: never;
          guards: "checkIfAutoBackup" | "isInternetConnected" | "isMinimumStorageRequiredForBackupAvailable" | "isNetworkError" | "isVCFound";
          services: "checkInternet" | "checkStorageAvailability" | "getLastBackupDetailsFromCloud" | "uploadBackupFile" | "writeDataToFile" | "zipBackupFile";
        };
        eventsCausingActions: {
          "cleanupFiles": "STORE_ERROR" | "STORE_RESPONSE" | "done.invoke.backup.backingUp.checkInternet:invocation[0]" | "done.invoke.backup.backingUp.checkStorageAvailability:invocation[0]" | "done.invoke.backup.backingUp.uploadBackupFile:invocation[0]" | "error.platform.backup.backingUp.checkInternet:invocation[0]" | "error.platform.backup.backingUp.checkStorageAvailability:invocation[0]" | "error.platform.backup.backingUp.uploadBackupFile:invocation[0]" | "error.platform.backup.backingUp.zipBackupFile:invocation[0]";
"extractLastBackupDetails": "done.invoke.backup.backingUp.uploadBackupFile:invocation[0]";
"fetchAllDataFromDB": "done.invoke.backup.backingUp.checkStorageAvailability:invocation[0]";
"loadVcs": "done.invoke.backup.backingUp.checkInternet:invocation[0]";
"sendDataBackupFailureEvent": "STORE_ERROR" | "STORE_RESPONSE" | "done.invoke.backup.backingUp.checkInternet:invocation[0]" | "done.invoke.backup.backingUp.checkStorageAvailability:invocation[0]" | "error.platform.backup.backingUp.checkInternet:invocation[0]" | "error.platform.backup.backingUp.checkStorageAvailability:invocation[0]" | "error.platform.backup.backingUp.uploadBackupFile:invocation[0]" | "error.platform.backup.backingUp.zipBackupFile:invocation[0]";
"sendDataBackupStartEvent": "DATA_BACKUP";
"sendDataBackupSuccessEvent": "done.invoke.backup.backingUp.uploadBackupFile:invocation[0]";
"sendFetchLastBackupDetailsCancelEvent": "DISMISS";
"sendFetchLastBackupDetailsErrorEvent": "error.platform.backup.fetchLastBackupDetails.checkCloud:invocation[0]";
"sendFetchLastBackupDetailsFailureEvent": "error.platform.backup.fetchLastBackupDetails.checkCloud:invocation[0]";
"sendFetchLastBackupDetailsStartEvent": "LAST_BACKUP_DETAILS" | "TRY_AGAIN";
"sendFetchLastBackupDetailsSuccessEvent": "done.invoke.backup.fetchLastBackupDetails.checkCloud:invocation[0]";
"setBackUpNotPossible": "STORE_RESPONSE" | "error.platform.backup.backingUp.checkStorageAvailability:invocation[0]";
"setBackupErrorReason": "STORE_ERROR" | "error.platform.backup.backingUp.uploadBackupFile:invocation[0]";
"setBackupErrorReasonAsNoInternet": "done.invoke.backup.backingUp.checkInternet:invocation[0]" | "error.platform.backup.backingUp.checkInternet:invocation[0]";
"setDataFromStorage": "STORE_RESPONSE";
"setErrorReasonAsStorageLimitReached": "done.invoke.backup.backingUp.checkStorageAvailability:invocation[0]";
"setFileName": "FILE_NAME";
"setIsAutoBackup": "DATA_BACKUP";
"setIsLoadingBackupDetails": "LAST_BACKUP_DETAILS" | "TRY_AGAIN";
"setLastBackupDetails": "done.invoke.backup.fetchLastBackupDetails.checkCloud:invocation[0]";
"setShowBackupInProgress": "DATA_BACKUP";
"unsetIsLoadingBackupDetails": "DISMISS" | "done.invoke.backup.fetchLastBackupDetails.checkCloud:invocation[0]" | "error.platform.backup.fetchLastBackupDetails.checkCloud:invocation[0]";
"unsetLastBackupDetails": "LAST_BACKUP_DETAILS" | "TRY_AGAIN";
"unsetShowBackupInProgress": "DISMISS_SHOW_BACKUP_IN_PROGRESS" | "STORE_ERROR" | "STORE_RESPONSE" | "done.invoke.backup.backingUp.checkInternet:invocation[0]" | "done.invoke.backup.backingUp.checkStorageAvailability:invocation[0]" | "done.invoke.backup.backingUp.uploadBackupFile:invocation[0]" | "error.platform.backup.backingUp.checkInternet:invocation[0]" | "error.platform.backup.backingUp.checkStorageAvailability:invocation[0]" | "error.platform.backup.backingUp.uploadBackupFile:invocation[0]" | "error.platform.backup.backingUp.zipBackupFile:invocation[0]";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          "checkIfAutoBackup": "STORE_ERROR" | "STORE_RESPONSE" | "done.invoke.backup.backingUp.checkInternet:invocation[0]" | "done.invoke.backup.backingUp.checkStorageAvailability:invocation[0]" | "done.invoke.backup.backingUp.uploadBackupFile:invocation[0]" | "error.platform.backup.backingUp.checkInternet:invocation[0]" | "error.platform.backup.backingUp.checkStorageAvailability:invocation[0]" | "error.platform.backup.backingUp.uploadBackupFile:invocation[0]" | "error.platform.backup.backingUp.zipBackupFile:invocation[0]";
"isInternetConnected": "done.invoke.backup.backingUp.checkInternet:invocation[0]";
"isMinimumStorageRequiredForBackupAvailable": "done.invoke.backup.backingUp.checkStorageAvailability:invocation[0]";
"isNetworkError": "error.platform.backup.fetchLastBackupDetails.checkCloud:invocation[0]";
"isVCFound": "STORE_RESPONSE";
        };
        eventsCausingServices: {
          "checkInternet": "DATA_BACKUP";
"checkStorageAvailability": "STORE_RESPONSE";
"getLastBackupDetailsFromCloud": "LAST_BACKUP_DETAILS" | "TRY_AGAIN";
"uploadBackupFile": "done.invoke.backup.backingUp.zipBackupFile:invocation[0]";
"writeDataToFile": "STORE_RESPONSE";
"zipBackupFile": "FILE_NAME";
        };
        matchesStates: "backingUp" | "backingUp.checkDataAvailabilityForBackup" | "backingUp.checkInternet" | "backingUp.checkStorageAvailability" | "backingUp.failure" | "backingUp.fetchDataFromDB" | "backingUp.idle" | "backingUp.silentFailure" | "backingUp.silentSuccess" | "backingUp.success" | "backingUp.uploadBackupFile" | "backingUp.writeDataToFile" | "backingUp.zipBackupFile" | "fetchLastBackupDetails" | "fetchLastBackupDetails.checkCloud" | "fetchLastBackupDetails.idle" | "fetchLastBackupDetails.noInternet" | { "backingUp"?: "checkDataAvailabilityForBackup" | "checkInternet" | "checkStorageAvailability" | "failure" | "fetchDataFromDB" | "idle" | "silentFailure" | "silentSuccess" | "success" | "uploadBackupFile" | "writeDataToFile" | "zipBackupFile";
"fetchLastBackupDetails"?: "checkCloud" | "idle" | "noInternet"; };
        tags: never;
      }
  