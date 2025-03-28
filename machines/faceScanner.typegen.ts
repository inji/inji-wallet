
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "done.invoke.faceScanner.capturing:invocation[0]": { type: "done.invoke.faceScanner.capturing:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.faceScanner.verifying:invocation[0]": { type: "done.invoke.faceScanner.verifying:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"error.platform.faceScanner.capturing:invocation[0]": { type: "error.platform.faceScanner.capturing:invocation[0]"; data: unknown };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          "captureImage": "done.invoke.faceScanner.capturing:invocation[0]";
"checkPermission": "done.invoke.faceScanner.init.checkingPermission:invocation[0]";
"requestPermission": "done.invoke.faceScanner.init.requestingPermission:invocation[0]";
"verifyImage": "done.invoke.faceScanner.verifying:invocation[0]";
        };
        missingImplementations: {
          actions: never;
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          "openSettings": "OPEN_SETTINGS";
"setCameraRef": "READY";
"setCaptureError": "error.platform.faceScanner.capturing:invocation[0]";
"setCapturedImage": "done.invoke.faceScanner.capturing:invocation[0]";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          "canRequestPermission": "DENIED";
"doesFaceMatch": "done.invoke.faceScanner.verifying:invocation[0]";
        };
        eventsCausingServices: {
          "captureImage": "CAPTURE";
"checkPermission": "APP_FOCUSED" | "xstate.init";
"requestPermission": "DENIED";
"verifyImage": "done.invoke.faceScanner.capturing:invocation[0]";
        };
        matchesStates: "capturing" | "init" | "init.checkingPermission" | "init.permissionDenied" | "init.permissionGranted" | "init.requestingPermission" | "invalid" | "scanning" | "valid" | "verifying" | { "init"?: "checkingPermission" | "permissionDenied" | "permissionGranted" | "requestingPermission"; };
        tags: never;
      }
  