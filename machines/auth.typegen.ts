
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "": { type: "" };
"done.invoke.auth.authorized:invocation[0]": { type: "done.invoke.auth.authorized:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.auth.introSlider:invocation[0]": { type: "done.invoke.auth.introSlider:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          "generatePasscodeSalt": "done.invoke.auth.introSlider:invocation[0]";
"initializeFaceSdkModel": "done.invoke.auth.authorized:invocation[0]";
        };
        missingImplementations: {
          actions: never;
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          "requestStoredContext": "BIOMETRIC_CANCELLED" | "xstate.init";
"setBiometrics": "SETUP_BIOMETRICS";
"setContext": "STORE_RESPONSE";
"setInitialDownloadDone": "INITIAL_DOWNLOAD_DONE";
"setIsToggleFromSettings": "CHANGE_METHOD";
"setLanguage": "SETUP_BIOMETRICS" | "SETUP_PASSCODE";
"setOnboardingDone": "ONBOARDING_DONE";
"setPasscode": "SETUP_PASSCODE";
"setPasscodeSalt": "done.invoke.auth.introSlider:invocation[0]";
"setTourGuide": "SET_TOUR_GUIDE";
"storeContext": "INITIAL_DOWNLOAD_DONE" | "ONBOARDING_DONE" | "SETUP_BIOMETRICS" | "SETUP_PASSCODE" | "STORE_RESPONSE" | "done.invoke.auth.authorized:invocation[0]" | "done.invoke.auth.introSlider:invocation[0]";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          "hasBiometricSet": "";
"hasData": "STORE_RESPONSE";
"hasLanguageset": "";
"hasPasscodeSet": "";
        };
        eventsCausingServices: {
          "generatePasscodeSalt": "SELECT";
"initializeFaceSdkModel": "LOGIN" | "SETUP_BIOMETRICS" | "SETUP_PASSCODE";
        };
        matchesStates: "authorized" | "checkingAuth" | "init" | "introSlider" | "languagesetup" | "savingDefaults" | "settingUp" | "unauthorized";
        tags: never;
      }
  