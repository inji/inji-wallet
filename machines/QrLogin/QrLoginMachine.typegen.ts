
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "done.invoke.QrLogin.linkTransaction:invocation[0]": { type: "done.invoke.QrLogin.linkTransaction:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.QrLogin.sendingAuthenticate:invocation[0]": { type: "done.invoke.QrLogin.sendingAuthenticate:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"error.platform.QrLogin.linkTransaction:invocation[0]": { type: "error.platform.QrLogin.linkTransaction:invocation[0]"; data: unknown };
"error.platform.QrLogin.sendingAuthenticate:invocation[0]": { type: "error.platform.QrLogin.sendingAuthenticate:invocation[0]"; data: unknown };
"error.platform.QrLogin.sendingConsent:invocation[0]": { type: "error.platform.QrLogin.sendingConsent:invocation[0]"; data: unknown };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          "linkTransaction": "done.invoke.QrLogin.linkTransaction:invocation[0]";
"sendAuthenticate": "done.invoke.QrLogin.sendingAuthenticate:invocation[0]";
"sendConsent": "done.invoke.QrLogin.sendingConsent:invocation[0]";
        };
        missingImplementations: {
          actions: "SetErrorMessage" | "expandLinkTransResp" | "forwardToParent" | "getFaceAuthConsent" | "loadMyVcs" | "loadThumbprint" | "resetFlowType" | "resetIsQrLoginViaDeepLink" | "resetLinkTransactionId" | "resetSelectedVc" | "resetSelectedVoluntaryClaims" | "setClaims" | "setConsentClaims" | "setLinkedTransactionId" | "setMyVcs" | "setScanData" | "setSelectedVc" | "setShowFaceAuthConsent" | "setThumbprint" | "setlinkTransactionResponse" | "storeShowFaceAuthConsent" | "updateShowFaceAuthConsent";
          delays: never;
          guards: "isConsentAlreadyCaptured" | "isSimpleShareFlow" | "showFaceAuthConsentScreen";
          services: "linkTransaction" | "sendAuthenticate" | "sendConsent";
        };
        eventsCausingActions: {
          "SetErrorMessage": "error.platform.QrLogin.linkTransaction:invocation[0]" | "error.platform.QrLogin.sendingAuthenticate:invocation[0]" | "error.platform.QrLogin.sendingConsent:invocation[0]";
"expandLinkTransResp": "done.invoke.QrLogin.linkTransaction:invocation[0]";
"forwardToParent": "CANCEL" | "DISMISS";
"getFaceAuthConsent": "GET";
"loadMyVcs": "done.invoke.QrLogin.linkTransaction:invocation[0]";
"loadThumbprint": "FACE_VALID";
"resetFlowType": "xstate.init";
"resetIsQrLoginViaDeepLink": "error.platform.QrLogin.linkTransaction:invocation[0]" | "error.platform.QrLogin.sendingAuthenticate:invocation[0]" | "error.platform.QrLogin.sendingConsent:invocation[0]" | "xstate.init";
"resetLinkTransactionId": "GET";
"resetSelectedVc": "xstate.init";
"resetSelectedVoluntaryClaims": "GET";
"setClaims": "done.invoke.QrLogin.linkTransaction:invocation[0]";
"setConsentClaims": "TOGGLE_CONSENT_CLAIM";
"setLinkedTransactionId": "done.invoke.QrLogin.sendingAuthenticate:invocation[0]";
"setMyVcs": "STORE_RESPONSE";
"setScanData": "GET";
"setSelectedVc": "SELECT_VC";
"setShowFaceAuthConsent": "FACE_VERIFICATION_CONSENT";
"setThumbprint": "STORE_RESPONSE";
"setlinkTransactionResponse": "done.invoke.QrLogin.linkTransaction:invocation[0]";
"storeShowFaceAuthConsent": "FACE_VERIFICATION_CONSENT";
"updateShowFaceAuthConsent": "STORE_RESPONSE";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          "isConsentAlreadyCaptured": "done.invoke.QrLogin.sendingAuthenticate:invocation[0]";
"isSimpleShareFlow": "CANCEL" | "DISMISS" | "done.invoke.QrLogin.linkTransaction:invocation[0]";
"showFaceAuthConsentScreen": "VERIFY" | "done.invoke.QrLogin.linkTransaction:invocation[0]";
        };
        eventsCausingServices: {
          "linkTransaction": "STORE_RESPONSE";
"sendAuthenticate": "STORE_RESPONSE";
"sendConsent": "CONFIRM";
        };
        matchesStates: "ShowError" | "checkFaceAuthConsent" | "done" | "faceAuth" | "faceVerificationConsent" | "invalidIdentity" | "linkTransaction" | "loadMyVcs" | "loadingThumbprint" | "requestConsent" | "sendingAuthenticate" | "sendingConsent" | "showvcList" | "success" | "waitingForData";
        tags: never;
      }
  