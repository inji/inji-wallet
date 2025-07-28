
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "done.invoke.restore.restoreBackup.checkInternet:invocation[0]": { type: "done.invoke.restore.restoreBackup.checkInternet:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.restore.restoreBackup.checkStorageAvailability:invocation[0]": { type: "done.invoke.restore.restoreBackup.checkStorageAvailability:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.restore.restoreBackup.downloadBackupFileFromCloud:invocation[0]": { type: "done.invoke.restore.restoreBackup.downloadBackupFileFromCloud:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.restore.restoreBackup.unzipBackupFile:invocation[0]": { type: "done.invoke.restore.restoreBackup.unzipBackupFile:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"error.platform.restore.restoreBackup.checkInternet:invocation[0]": { type: "error.platform.restore.restoreBackup.checkInternet:invocation[0]"; data: unknown };
"error.platform.restore.restoreBackup.downloadBackupFileFromCloud:invocation[0]": { type: "error.platform.restore.restoreBackup.downloadBackupFileFromCloud:invocation[0]"; data: unknown };
"error.platform.restore.restoreBackup.unzipBackupFile:invocation[0]": { type: "error.platform.restore.restoreBackup.unzipBackupFile:invocation[0]"; data: unknown };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          "checkInternet": "done.invoke.restore.restoreBackup.checkInternet:invocation[0]";
"checkStorageAvailability": "done.invoke.restore.restoreBackup.checkStorageAvailability:invocation[0]";
"downloadLatestBackup": "done.invoke.restore.restoreBackup.downloadBackupFileFromCloud:invocation[0]";
"readBackupFile": "done.invoke.restore.restoreBackup.readBackupFile:invocation[0]";
"unzipBackupFile": "done.invoke.restore.restoreBackup.unzipBackupFile:invocation[0]";
        };
        missingImplementations: {
          actions: "cleanupFiles" | "downloadUnsyncedBackupFiles" | "loadDataToMemory" | "refreshVCs" | "sendDataRestoreErrorEvent" | "sendDataRestoreFailureEvent" | "sendDataRestoreStartEvent" | "sendDataRestoreSuccessEvent" | "setBackupFileName" | "setDataFromBackupFile" | "setRestoreErrorReason" | "setRestoreErrorReasonAsNetworkError" | "setRestoreTechnicalError" | "setShowRestoreInProgress" | "unsetShowRestoreInProgress";
          delays: never;
          guards: "isInternetConnected" | "isMinimumStorageRequiredForBackupRestorationReached";
          services: "checkInternet" | "checkStorageAvailability" | "downloadLatestBackup" | "readBackupFile" | "unzipBackupFile";
        };
        eventsCausingActions: {
          "cleanupFiles": "STORE_ERROR" | "STORE_RESPONSE" | "done.invoke.restore.restoreBackup.checkInternet:invocation[0]" | "done.invoke.restore.restoreBackup.checkStorageAvailability:invocation[0]" | "error.platform.restore.restoreBackup.checkInternet:invocation[0]" | "error.platform.restore.restoreBackup.downloadBackupFileFromCloud:invocation[0]" | "error.platform.restore.restoreBackup.unzipBackupFile:invocation[0]";
"downloadUnsyncedBackupFiles": "DOWNLOAD_UNSYNCED_BACKUP_FILES";
"loadDataToMemory": "DATA_FROM_FILE";
"refreshVCs": "STORE_RESPONSE";
"sendDataRestoreErrorEvent": "done.invoke.restore.restoreBackup.checkInternet:invocation[0]" | "error.platform.restore.restoreBackup.checkInternet:invocation[0]";
"sendDataRestoreFailureEvent": "STORE_ERROR" | "done.invoke.restore.restoreBackup.checkInternet:invocation[0]" | "done.invoke.restore.restoreBackup.checkStorageAvailability:invocation[0]" | "error.platform.restore.restoreBackup.checkInternet:invocation[0]" | "error.platform.restore.restoreBackup.downloadBackupFileFromCloud:invocation[0]" | "error.platform.restore.restoreBackup.unzipBackupFile:invocation[0]";
"sendDataRestoreStartEvent": "BACKUP_RESTORE";
"sendDataRestoreSuccessEvent": "STORE_RESPONSE";
"setBackupFileName": "done.invoke.restore.restoreBackup.downloadBackupFileFromCloud:invocation[0]";
"setDataFromBackupFile": "DATA_FROM_FILE";
"setRestoreErrorReason": "error.platform.restore.restoreBackup.downloadBackupFileFromCloud:invocation[0]" | "error.platform.restore.restoreBackup.unzipBackupFile:invocation[0]";
"setRestoreErrorReasonAsNetworkError": "done.invoke.restore.restoreBackup.checkInternet:invocation[0]" | "error.platform.restore.restoreBackup.checkInternet:invocation[0]";
"setRestoreTechnicalError": "STORE_ERROR" | "done.invoke.restore.restoreBackup.checkStorageAvailability:invocation[0]";
"setShowRestoreInProgress": "BACKUP_RESTORE";
"unsetShowRestoreInProgress": "DISMISS_SHOW_RESTORE_IN_PROGRESS" | "STORE_ERROR" | "STORE_RESPONSE" | "done.invoke.restore.restoreBackup.checkInternet:invocation[0]" | "done.invoke.restore.restoreBackup.checkStorageAvailability:invocation[0]" | "error.platform.restore.restoreBackup.checkInternet:invocation[0]" | "error.platform.restore.restoreBackup.downloadBackupFileFromCloud:invocation[0]" | "error.platform.restore.restoreBackup.unzipBackupFile:invocation[0]";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          "isInternetConnected": "done.invoke.restore.restoreBackup.checkInternet:invocation[0]";
"isMinimumStorageRequiredForBackupRestorationReached": "done.invoke.restore.restoreBackup.checkStorageAvailability:invocation[0]";
        };
        eventsCausingServices: {
          "checkInternet": "BACKUP_RESTORE";
"checkStorageAvailability": "done.invoke.restore.restoreBackup.checkInternet:invocation[0]";
"downloadLatestBackup": "done.invoke.restore.restoreBackup.checkStorageAvailability:invocation[0]";
"readBackupFile": "done.invoke.restore.restoreBackup.unzipBackupFile:invocation[0]";
"unzipBackupFile": "done.invoke.restore.restoreBackup.downloadBackupFileFromCloud:invocation[0]";
        };
        matchesStates: "init" | "restoreBackup" | "restoreBackup.checkInternet" | "restoreBackup.checkStorageAvailability" | "restoreBackup.downloadBackupFileFromCloud" | "restoreBackup.failure" | "restoreBackup.loadDataToMemory" | "restoreBackup.readBackupFile" | "restoreBackup.success" | "restoreBackup.unzipBackupFile" | { "restoreBackup"?: "checkInternet" | "checkStorageAvailability" | "downloadBackupFileFromCloud" | "failure" | "loadDataToMemory" | "readBackupFile" | "success" | "unzipBackupFile"; };
        tags: never;
      }
  