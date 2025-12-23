
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "": { type: "" };
"done.invoke.OpenID4VP.authenticateVerifier:invocation[0]": { type: "done.invoke.OpenID4VP.authenticateVerifier:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.OpenID4VP.checkIfClientValidationIsRequired:invocation[0]": { type: "done.invoke.OpenID4VP.checkIfClientValidationIsRequired:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.OpenID4VP.checkKeyPair:invocation[0]": { type: "done.invoke.OpenID4VP.checkKeyPair:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.OpenID4VP.checkVerifierTrust:invocation[0]": { type: "done.invoke.OpenID4VP.checkVerifierTrust:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.OpenID4VP.getKeyPairFromKeystore:invocation[0]": { type: "done.invoke.OpenID4VP.getKeyPairFromKeystore:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.OpenID4VP.getTrustedVerifiersList:invocation[0]": { type: "done.invoke.OpenID4VP.getTrustedVerifiersList:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.OpenID4VP.sendingVP.sendVP:invocation[0]": { type: "done.invoke.OpenID4VP.sendingVP.sendVP:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.OpenID4VP.storeTrustedVerifier:invocation[0]": { type: "done.invoke.OpenID4VP.storeTrustedVerifier:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"error.platform.OpenID4VP.authenticateVerifier:invocation[0]": { type: "error.platform.OpenID4VP.authenticateVerifier:invocation[0]"; data: unknown };
"error.platform.OpenID4VP.checkKeyPair:invocation[0]": { type: "error.platform.OpenID4VP.checkKeyPair:invocation[0]"; data: unknown };
"error.platform.OpenID4VP.checkVerifierTrust:invocation[0]": { type: "error.platform.OpenID4VP.checkVerifierTrust:invocation[0]"; data: unknown };
"error.platform.OpenID4VP.getKeyPairFromKeystore:invocation[0]": { type: "error.platform.OpenID4VP.getKeyPairFromKeystore:invocation[0]"; data: unknown };
"error.platform.OpenID4VP.getTrustedVerifiersList:invocation[0]": { type: "error.platform.OpenID4VP.getTrustedVerifiersList:invocation[0]"; data: unknown };
"error.platform.OpenID4VP.sendingVP.constructVP.constructing:invocation[0]": { type: "error.platform.OpenID4VP.sendingVP.constructVP.constructing:invocation[0]"; data: unknown };
"error.platform.OpenID4VP.sendingVP.sendVP:invocation[0]": { type: "error.platform.OpenID4VP.sendingVP.sendVP:invocation[0]"; data: unknown };
"xstate.after(200)#OpenID4VP.delayBeforeDismissToParent": { type: "xstate.after(200)#OpenID4VP.delayBeforeDismissToParent" };
"xstate.init": { type: "xstate.init" };
"xstate.stop": { type: "xstate.stop" };
        };
        invokeSrcNameMap: {
          "fetchTrustedVerifiers": "done.invoke.OpenID4VP.getTrustedVerifiersList:invocation[0]";
"getAuthenticationResponse": "done.invoke.OpenID4VP.authenticateVerifier:invocation[0]";
"getKeyPair": "done.invoke.OpenID4VP.getKeyPairFromKeystore:invocation[0]";
"getSelectedKey": "done.invoke.OpenID4VP.checkKeyPair:invocation[0]";
"isVerifierTrusted": "done.invoke.OpenID4VP.checkVerifierTrust:invocation[0]";
"sendSelectedCredentialsForVP": "done.invoke.OpenID4VP.sendingVP.constructVP.constructing:invocation[0]";
"sendVP": "done.invoke.OpenID4VP.sendingVP.sendVP:invocation[0]";
"shareDeclineStatus": "done.invoke.OpenID4VP.shareVPDeclineStatusToVerifier:invocation[0]";
"shouldValidateClient": "done.invoke.OpenID4VP.checkIfClientValidationIsRequired:invocation[0]";
"signVP": "done.invoke.signVP:invocation[0]";
"storeTrustedVerifier": "done.invoke.OpenID4VP.storeTrustedVerifier:invocation[0]";
        };
        missingImplementations: {
          actions: "compareAndStoreSelectedVC" | "dismissTrustModal" | "forwardToParent" | "getFaceAuthConsent" | "getVcsMatchingAuthRequest" | "incrementOpenID4VPRetryCount" | "loadKeyPair" | "logActivity" | "resetError" | "resetFaceCaptureBannerStatus" | "resetIsFaceVerificationRetryAttempt" | "resetIsShareWithSelfie" | "resetIsShowLoadingScreen" | "resetOpenID4VPRetryCount" | "setAuthenticationError" | "setAuthenticationResponse" | "setAuthorizer" | "setConstructVPError" | "setError" | "setFlowType" | "setIsFaceVerificationRetryAttempt" | "setIsOVPViaDeepLink" | "setIsShareWithSelfie" | "setIsShowLoadingScreen" | "setMiniViewShareSelectedVC" | "setPresentationRequest" | "setSelectedVCs" | "setSendVPShareError" | "setShareLogTypeUnverified" | "setShowFaceAuthConsent" | "setTrustedVerifiers" | "setTrustedVerifiersApiCallError" | "setUrlEncodedAuthorizationRequest" | "showTrustConsentModal" | "storeShowFaceAuthConsent" | "updateFaceCaptureBannerStatus" | "updateShowFaceAuthConsent";
          delays: never;
          guards: "hasKeyPair" | "isAnyVCHasImage" | "isAuthorizationFlow" | "isClientValidationRequred" | "isFaceVerificationRetryAttempt" | "isSelectedVCMatchingRequest" | "isShareWithSelfie" | "isSimpleOpenID4VPShare" | "showFaceAuthConsentScreen";
          services: "fetchTrustedVerifiers" | "getAuthenticationResponse" | "getKeyPair" | "getSelectedKey" | "isVerifierTrusted" | "sendSelectedCredentialsForVP" | "sendVP" | "shareDeclineStatus" | "shouldValidateClient" | "signVP" | "storeTrustedVerifier";
        };
        eventsCausingActions: {
          "compareAndStoreSelectedVC": "SET_SELECTED_VC";
"dismissTrustModal": "CANCEL" | "VERIFIER_TRUST_CONSENT_GIVEN" | "done.invoke.OpenID4VP.checkVerifierTrust:invocation[0]" | "done.invoke.OpenID4VP.storeTrustedVerifier:invocation[0]";
"forwardToParent": "CANCEL" | "DISMISS_POPUP";
"getFaceAuthConsent": "AUTHENTICATE" | "AUTHENTICATE_VIA_PRESENTATION";
"getVcsMatchingAuthRequest": "DOWNLOADED_VCS";
"incrementOpenID4VPRetryCount": "RETRY";
"loadKeyPair": "done.invoke.OpenID4VP.getKeyPairFromKeystore:invocation[0]";
"logActivity": "LOG_ACTIVITY";
"resetError": "RESET_ERROR" | "RESET_RETRY_COUNT" | "RETRY";
"resetFaceCaptureBannerStatus": "ACCEPT_REQUEST" | "CLOSE_BANNER";
"resetIsFaceVerificationRetryAttempt": "DISMISS";
"resetIsShareWithSelfie": "CANCEL" | "DISMISS_POPUP";
"resetIsShowLoadingScreen": "AUTHENTICATE_VIA_PRESENTATION" | "DISMISS_POPUP" | "done.invoke.OpenID4VP.authenticateVerifier:invocation[0]" | "done.invoke.OpenID4VP.checkKeyPair:invocation[0]" | "error.platform.OpenID4VP.authenticateVerifier:invocation[0]" | "error.platform.OpenID4VP.getTrustedVerifiersList:invocation[0]" | "xstate.stop";
"resetOpenID4VPRetryCount": "RESET_RETRY_COUNT";
"setAuthenticationError": "error.platform.OpenID4VP.authenticateVerifier:invocation[0]";
"setAuthenticationResponse": "done.invoke.OpenID4VP.authenticateVerifier:invocation[0]";
"setAuthorizer": "AUTHENTICATE_VIA_PRESENTATION";
"setConstructVPError": "error.platform.OpenID4VP.sendingVP.constructVP.constructing:invocation[0]";
"setError": "error.platform.OpenID4VP.checkKeyPair:invocation[0]" | "error.platform.OpenID4VP.getKeyPairFromKeystore:invocation[0]";
"setFlowType": "AUTHENTICATE" | "AUTHENTICATE_VIA_PRESENTATION";
"setIsFaceVerificationRetryAttempt": "FACE_INVALID";
"setIsOVPViaDeepLink": "AUTHENTICATE";
"setIsShareWithSelfie": "AUTHENTICATE";
"setIsShowLoadingScreen": "AUTHENTICATE" | "AUTHENTICATE_VIA_PRESENTATION";
"setMiniViewShareSelectedVC": "AUTHENTICATE";
"setPresentationRequest": "AUTHENTICATE_VIA_PRESENTATION";
"setSelectedVCs": "ACCEPT_REQUEST" | "VERIFY_AND_ACCEPT_REQUEST";
"setSendVPShareError": "error.platform.OpenID4VP.sendingVP.sendVP:invocation[0]";
"setShareLogTypeUnverified": "ACCEPT_REQUEST";
"setShowFaceAuthConsent": "FACE_VERIFICATION_CONSENT";
"setTrustedVerifiers": "done.invoke.OpenID4VP.getTrustedVerifiersList:invocation[0]";
"setTrustedVerifiersApiCallError": "error.platform.OpenID4VP.getTrustedVerifiersList:invocation[0]";
"setUrlEncodedAuthorizationRequest": "AUTHENTICATE";
"showTrustConsentModal": "done.invoke.OpenID4VP.checkVerifierTrust:invocation[0]" | "error.platform.OpenID4VP.checkVerifierTrust:invocation[0]";
"storeShowFaceAuthConsent": "FACE_VERIFICATION_CONSENT";
"updateFaceCaptureBannerStatus": "FACE_VALID";
"updateShowFaceAuthConsent": "done.invoke.OpenID4VP.checkIfClientValidationIsRequired:invocation[0]";
        };
        eventsCausingDelays: {
          "SHARING_TIMEOUT": "";
        };
        eventsCausingGuards: {
          "hasKeyPair": "FACE_VALID" | "done.invoke.OpenID4VP.checkKeyPair:invocation[0]";
"isAnyVCHasImage": "CHECK_FOR_IMAGE";
"isAuthorizationFlow": "" | "done.invoke.OpenID4VP.checkKeyPair:invocation[0]";
"isClientValidationRequred": "done.invoke.OpenID4VP.checkIfClientValidationIsRequired:invocation[0]";
"isFaceVerificationRetryAttempt": "FACE_INVALID";
"isSelectedVCMatchingRequest": "CHECK_SELECTED_VC";
"isShareWithSelfie": "CONFIRM" | "done.invoke.OpenID4VP.sendingVP.sendVP:invocation[0]";
"isSimpleOpenID4VPShare": "CANCEL" | "DISMISS" | "DISMISS_POPUP" | "DOWNLOADED_VCS" | "FACE_VERIFICATION_CONSENT";
"showFaceAuthConsentScreen": "CONFIRM";
        };
        eventsCausingServices: {
          "fetchTrustedVerifiers": "done.invoke.OpenID4VP.checkIfClientValidationIsRequired:invocation[0]";
"getAuthenticationResponse": "done.invoke.OpenID4VP.checkKeyPair:invocation[0]";
"getKeyPair": "done.invoke.OpenID4VP.checkIfClientValidationIsRequired:invocation[0]" | "done.invoke.OpenID4VP.getTrustedVerifiersList:invocation[0]";
"getSelectedKey": "FACE_VALID" | "done.invoke.OpenID4VP.getKeyPairFromKeystore:invocation[0]";
"isVerifierTrusted": "done.invoke.OpenID4VP.authenticateVerifier:invocation[0]" | "done.invoke.OpenID4VP.checkKeyPair:invocation[0]";
"sendSelectedCredentialsForVP": "" | "SIGN_VP";
"sendVP": "";
"shareDeclineStatus": "CONFIRM";
"shouldValidateClient": "STORE_RESPONSE";
"signVP": "SIGN_VP";
"storeTrustedVerifier": "VERIFIER_TRUST_CONSENT_GIVEN";
        };
        matchesStates: "authenticateVerifier" | "checkFaceAuthConsent" | "checkIfAnySelectedVCHasImage" | "checkIfClientValidationIsRequired" | "checkIfMatchingVCsHasSelectedVC" | "checkKeyPair" | "checkVerifierTrust" | "delayBeforeDismissToParent" | "faceVerificationConsent" | "getConsentForVPSharing" | "getKeyPairFromKeystore" | "getTrustedVerifiersList" | "getVCsSatisfyingAuthRequest" | "invalidIdentity" | "requestVerifierConsent" | "selectingVCs" | "sendDismissToParent" | "sendingVP" | "sendingVP.constructVP" | "sendingVP.constructVP.constructing" | "sendingVP.constructVP.signVP" | "sendingVP.prepare" | "sendingVP.sendVP" | "setSelectedVC" | "shareVPDeclineStatusToVerifier" | "showConfirmationPopup" | "showError" | "storeTrustedVerifier" | "success" | "verifyingIdentity" | "waitingForData" | { "sendingVP"?: "constructVP" | "prepare" | "sendVP" | { "constructVP"?: "constructing" | "signVP"; }; };
        tags: never;
      }
  
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "": { type: "" };
"done.invoke.OpenID4VP.authenticateVerifier:invocation[0]": { type: "done.invoke.OpenID4VP.authenticateVerifier:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.OpenID4VP.checkIfClientValidationIsRequired:invocation[0]": { type: "done.invoke.OpenID4VP.checkIfClientValidationIsRequired:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.OpenID4VP.checkKeyPair:invocation[0]": { type: "done.invoke.OpenID4VP.checkKeyPair:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.OpenID4VP.checkVerifierTrust:invocation[0]": { type: "done.invoke.OpenID4VP.checkVerifierTrust:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.OpenID4VP.getKeyPairFromKeystore:invocation[0]": { type: "done.invoke.OpenID4VP.getKeyPairFromKeystore:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.OpenID4VP.getTrustedVerifiersList:invocation[0]": { type: "done.invoke.OpenID4VP.getTrustedVerifiersList:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.OpenID4VP.sendingVP.sendVP:invocation[0]": { type: "done.invoke.OpenID4VP.sendingVP.sendVP:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.OpenID4VP.storeTrustedVerifier:invocation[0]": { type: "done.invoke.OpenID4VP.storeTrustedVerifier:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"error.platform.OpenID4VP.authenticateVerifier:invocation[0]": { type: "error.platform.OpenID4VP.authenticateVerifier:invocation[0]"; data: unknown };
"error.platform.OpenID4VP.checkKeyPair:invocation[0]": { type: "error.platform.OpenID4VP.checkKeyPair:invocation[0]"; data: unknown };
"error.platform.OpenID4VP.checkVerifierTrust:invocation[0]": { type: "error.platform.OpenID4VP.checkVerifierTrust:invocation[0]"; data: unknown };
"error.platform.OpenID4VP.getKeyPairFromKeystore:invocation[0]": { type: "error.platform.OpenID4VP.getKeyPairFromKeystore:invocation[0]"; data: unknown };
"error.platform.OpenID4VP.getTrustedVerifiersList:invocation[0]": { type: "error.platform.OpenID4VP.getTrustedVerifiersList:invocation[0]"; data: unknown };
"error.platform.OpenID4VP.sendingVP.constructVP.constructing:invocation[0]": { type: "error.platform.OpenID4VP.sendingVP.constructVP.constructing:invocation[0]"; data: unknown };
"error.platform.OpenID4VP.sendingVP.sendVP:invocation[0]": { type: "error.platform.OpenID4VP.sendingVP.sendVP:invocation[0]"; data: unknown };
"xstate.after(200)#OpenID4VP.delayBeforeDismissToParent": { type: "xstate.after(200)#OpenID4VP.delayBeforeDismissToParent" };
"xstate.init": { type: "xstate.init" };
"xstate.stop": { type: "xstate.stop" };
        };
        invokeSrcNameMap: {
          "fetchTrustedVerifiers": "done.invoke.OpenID4VP.getTrustedVerifiersList:invocation[0]";
"getAuthenticationResponse": "done.invoke.OpenID4VP.authenticateVerifier:invocation[0]";
"getKeyPair": "done.invoke.OpenID4VP.getKeyPairFromKeystore:invocation[0]";
"getSelectedKey": "done.invoke.OpenID4VP.checkKeyPair:invocation[0]";
"isVerifierTrusted": "done.invoke.OpenID4VP.checkVerifierTrust:invocation[0]";
"sendSelectedCredentialsForVP": "done.invoke.OpenID4VP.sendingVP.constructVP.constructing:invocation[0]";
"sendVP": "done.invoke.OpenID4VP.sendingVP.sendVP:invocation[0]";
"shareDeclineStatus": "done.invoke.OpenID4VP.shareVPDeclineStatusToVerifier:invocation[0]";
"shouldValidateClient": "done.invoke.OpenID4VP.checkIfClientValidationIsRequired:invocation[0]";
"signVP": "done.invoke.signVP:invocation[0]";
"storeTrustedVerifier": "done.invoke.OpenID4VP.storeTrustedVerifier:invocation[0]";
        };
        missingImplementations: {
          actions: "compareAndStoreSelectedVC" | "dismissTrustModal" | "forwardToParent" | "getFaceAuthConsent" | "getVcsMatchingAuthRequest" | "incrementOpenID4VPRetryCount" | "loadKeyPair" | "logActivity" | "resetError" | "resetFaceCaptureBannerStatus" | "resetIsFaceVerificationRetryAttempt" | "resetIsShareWithSelfie" | "resetIsShowLoadingScreen" | "resetOpenID4VPRetryCount" | "setAuthenticationError" | "setAuthenticationResponse" | "setAuthorizer" | "setConstructVPError" | "setError" | "setFlowType" | "setIsFaceVerificationRetryAttempt" | "setIsOVPViaDeepLink" | "setIsShareWithSelfie" | "setIsShowLoadingScreen" | "setMiniViewShareSelectedVC" | "setPresentationRequest" | "setSelectedVCs" | "setSendVPShareError" | "setShareLogTypeUnverified" | "setShowFaceAuthConsent" | "setTrustedVerifiers" | "setTrustedVerifiersApiCallError" | "setUrlEncodedAuthorizationRequest" | "showTrustConsentModal" | "storeShowFaceAuthConsent" | "updateFaceCaptureBannerStatus" | "updateShowFaceAuthConsent";
          delays: never;
          guards: "hasKeyPair" | "isAnyVCHasImage" | "isAuthorizationFlow" | "isClientValidationRequred" | "isFaceVerificationRetryAttempt" | "isSelectedVCMatchingRequest" | "isShareWithSelfie" | "isSimpleOpenID4VPShare" | "showFaceAuthConsentScreen";
          services: "fetchTrustedVerifiers" | "getAuthenticationResponse" | "getKeyPair" | "getSelectedKey" | "isVerifierTrusted" | "sendSelectedCredentialsForVP" | "sendVP" | "shareDeclineStatus" | "shouldValidateClient" | "signVP" | "storeTrustedVerifier";
        };
        eventsCausingActions: {
          "compareAndStoreSelectedVC": "SET_SELECTED_VC";
"dismissTrustModal": "CANCEL" | "VERIFIER_TRUST_CONSENT_GIVEN" | "done.invoke.OpenID4VP.checkVerifierTrust:invocation[0]" | "done.invoke.OpenID4VP.storeTrustedVerifier:invocation[0]";
"forwardToParent": "CANCEL" | "DISMISS_POPUP";
"getFaceAuthConsent": "AUTHENTICATE" | "AUTHENTICATE_VIA_PRESENTATION";
"getVcsMatchingAuthRequest": "DOWNLOADED_VCS";
"incrementOpenID4VPRetryCount": "RETRY";
"loadKeyPair": "done.invoke.OpenID4VP.getKeyPairFromKeystore:invocation[0]";
"logActivity": "LOG_ACTIVITY";
"resetError": "RESET_ERROR" | "RESET_RETRY_COUNT" | "RETRY";
"resetFaceCaptureBannerStatus": "ACCEPT_REQUEST" | "CLOSE_BANNER";
"resetIsFaceVerificationRetryAttempt": "DISMISS";
"resetIsShareWithSelfie": "CANCEL" | "DISMISS_POPUP";
"resetIsShowLoadingScreen": "AUTHENTICATE_VIA_PRESENTATION" | "DISMISS_POPUP" | "done.invoke.OpenID4VP.authenticateVerifier:invocation[0]" | "done.invoke.OpenID4VP.checkKeyPair:invocation[0]" | "error.platform.OpenID4VP.authenticateVerifier:invocation[0]" | "error.platform.OpenID4VP.getTrustedVerifiersList:invocation[0]" | "xstate.stop";
"resetOpenID4VPRetryCount": "RESET_RETRY_COUNT";
"setAuthenticationError": "error.platform.OpenID4VP.authenticateVerifier:invocation[0]";
"setAuthenticationResponse": "done.invoke.OpenID4VP.authenticateVerifier:invocation[0]";
"setAuthorizer": "AUTHENTICATE_VIA_PRESENTATION";
"setConstructVPError": "error.platform.OpenID4VP.sendingVP.constructVP.constructing:invocation[0]";
"setError": "error.platform.OpenID4VP.checkKeyPair:invocation[0]" | "error.platform.OpenID4VP.getKeyPairFromKeystore:invocation[0]";
"setFlowType": "AUTHENTICATE" | "AUTHENTICATE_VIA_PRESENTATION";
"setIsFaceVerificationRetryAttempt": "FACE_INVALID";
"setIsOVPViaDeepLink": "AUTHENTICATE";
"setIsShareWithSelfie": "AUTHENTICATE";
"setIsShowLoadingScreen": "AUTHENTICATE" | "AUTHENTICATE_VIA_PRESENTATION";
"setMiniViewShareSelectedVC": "AUTHENTICATE";
"setPresentationRequest": "AUTHENTICATE_VIA_PRESENTATION";
"setSelectedVCs": "ACCEPT_REQUEST" | "VERIFY_AND_ACCEPT_REQUEST";
"setSendVPShareError": "error.platform.OpenID4VP.sendingVP.sendVP:invocation[0]";
"setShareLogTypeUnverified": "ACCEPT_REQUEST";
"setShowFaceAuthConsent": "FACE_VERIFICATION_CONSENT";
"setTrustedVerifiers": "done.invoke.OpenID4VP.getTrustedVerifiersList:invocation[0]";
"setTrustedVerifiersApiCallError": "error.platform.OpenID4VP.getTrustedVerifiersList:invocation[0]";
"setUrlEncodedAuthorizationRequest": "AUTHENTICATE";
"showTrustConsentModal": "done.invoke.OpenID4VP.checkVerifierTrust:invocation[0]" | "error.platform.OpenID4VP.checkVerifierTrust:invocation[0]";
"storeShowFaceAuthConsent": "FACE_VERIFICATION_CONSENT";
"updateFaceCaptureBannerStatus": "FACE_VALID";
"updateShowFaceAuthConsent": "done.invoke.OpenID4VP.checkIfClientValidationIsRequired:invocation[0]";
        };
        eventsCausingDelays: {
          "SHARING_TIMEOUT": "";
        };
        eventsCausingGuards: {
          "hasKeyPair": "FACE_VALID" | "done.invoke.OpenID4VP.checkKeyPair:invocation[0]";
"isAnyVCHasImage": "CHECK_FOR_IMAGE";
"isAuthorizationFlow": "" | "done.invoke.OpenID4VP.checkKeyPair:invocation[0]";
"isClientValidationRequred": "done.invoke.OpenID4VP.checkIfClientValidationIsRequired:invocation[0]";
"isFaceVerificationRetryAttempt": "FACE_INVALID";
"isSelectedVCMatchingRequest": "CHECK_SELECTED_VC";
"isShareWithSelfie": "CONFIRM" | "done.invoke.OpenID4VP.sendingVP.sendVP:invocation[0]";
"isSimpleOpenID4VPShare": "CANCEL" | "DISMISS" | "DISMISS_POPUP" | "DOWNLOADED_VCS" | "FACE_VERIFICATION_CONSENT";
"showFaceAuthConsentScreen": "CONFIRM";
        };
        eventsCausingServices: {
          "fetchTrustedVerifiers": "done.invoke.OpenID4VP.checkIfClientValidationIsRequired:invocation[0]";
"getAuthenticationResponse": "done.invoke.OpenID4VP.checkKeyPair:invocation[0]";
"getKeyPair": "done.invoke.OpenID4VP.checkIfClientValidationIsRequired:invocation[0]" | "done.invoke.OpenID4VP.getTrustedVerifiersList:invocation[0]";
"getSelectedKey": "FACE_VALID" | "done.invoke.OpenID4VP.getKeyPairFromKeystore:invocation[0]";
"isVerifierTrusted": "done.invoke.OpenID4VP.authenticateVerifier:invocation[0]" | "done.invoke.OpenID4VP.checkKeyPair:invocation[0]";
"sendSelectedCredentialsForVP": "" | "SIGN_VP";
"sendVP": "";
"shareDeclineStatus": "CONFIRM";
"shouldValidateClient": "STORE_RESPONSE";
"signVP": "SIGN_VP";
"storeTrustedVerifier": "VERIFIER_TRUST_CONSENT_GIVEN";
        };
        matchesStates: "authenticateVerifier" | "checkFaceAuthConsent" | "checkIfAnySelectedVCHasImage" | "checkIfClientValidationIsRequired" | "checkIfMatchingVCsHasSelectedVC" | "checkKeyPair" | "checkVerifierTrust" | "delayBeforeDismissToParent" | "faceVerificationConsent" | "getConsentForVPSharing" | "getKeyPairFromKeystore" | "getTrustedVerifiersList" | "getVCsSatisfyingAuthRequest" | "invalidIdentity" | "requestVerifierConsent" | "selectingVCs" | "sendDismissToParent" | "sendingVP" | "sendingVP.constructVP" | "sendingVP.constructVP.constructing" | "sendingVP.constructVP.signVP" | "sendingVP.prepare" | "sendingVP.sendVP" | "setSelectedVC" | "shareVPDeclineStatusToVerifier" | "showConfirmationPopup" | "showError" | "storeTrustedVerifier" | "success" | "verifyingIdentity" | "waitingForData" | { "sendingVP"?: "constructVP" | "prepare" | "sendVP" | { "constructVP"?: "constructing" | "signVP"; }; };
        tags: never;
      }
  