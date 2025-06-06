
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "done.invoke.GetVcModal.acceptingIdInput.requestingOtp:invocation[0]": { type: "done.invoke.GetVcModal.acceptingIdInput.requestingOtp:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.GetVcModal.acceptingOtpInput.resendOTP:invocation[0]": { type: "done.invoke.GetVcModal.acceptingOtpInput.resendOTP:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.GetVcModal.requestingUinVid:invocation[0]": { type: "done.invoke.GetVcModal.requestingUinVid:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"error.platform.GetVcModal.acceptingIdInput.requestingOtp:invocation[0]": { type: "error.platform.GetVcModal.acceptingIdInput.requestingOtp:invocation[0]"; data: unknown };
"error.platform.GetVcModal.acceptingOtpInput.resendOTP:invocation[0]": { type: "error.platform.GetVcModal.acceptingOtpInput.resendOTP:invocation[0]"; data: unknown };
"error.platform.GetVcModal.requestingUinVid:invocation[0]": { type: "error.platform.GetVcModal.requestingUinVid:invocation[0]"; data: unknown };
"xstate.after(100)#GetVcModal.acceptingIdInput.focusing": { type: "xstate.after(100)#GetVcModal.acceptingIdInput.focusing" };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          "requestOtp": "done.invoke.GetVcModal.acceptingIdInput.requestingOtp:invocation[0]" | "done.invoke.GetVcModal.acceptingOtpInput.resendOTP:invocation[0]";
"requestingUinVid": "done.invoke.GetVcModal.requestingUinVid:invocation[0]";
        };
        missingImplementations: {
          actions: never;
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          "clearIdError": "INPUT_ID";
"clearOtp": "DISMISS" | "done.invoke.GetVcModal.acceptingIdInput.requestingOtp:invocation[0]" | "error.platform.GetVcModal.acceptingOtpInput.resendOTP:invocation[0]" | "error.platform.GetVcModal.requestingUinVid:invocation[0]" | "xstate.init";
"focusInput": "INPUT_ID" | "VALIDATE_INPUT" | "error.platform.GetVcModal.acceptingIdInput.requestingOtp:invocation[0]" | "error.platform.GetVcModal.acceptingOtpInput.resendOTP:invocation[0]" | "error.platform.GetVcModal.requestingUinVid:invocation[0]" | "xstate.after(100)#GetVcModal.acceptingIdInput.focusing";
"forwardToParent": "DISMISS";
"resetIdInputRef": "DISMISS";
"setEmail": "done.invoke.GetVcModal.acceptingIdInput.requestingOtp:invocation[0]" | "done.invoke.GetVcModal.acceptingOtpInput.resendOTP:invocation[0]";
"setIconColorActivate": "ACTIVATE_ICON_COLOR";
"setIconColorDeactivate": "DEACTIVATE_ICON_COLOR";
"setId": "INPUT_ID";
"setIdBackendError": "error.platform.GetVcModal.acceptingIdInput.requestingOtp:invocation[0]" | "error.platform.GetVcModal.acceptingOtpInput.resendOTP:invocation[0]" | "error.platform.GetVcModal.requestingUinVid:invocation[0]";
"setIdErrorEmpty": "VALIDATE_INPUT";
"setIdErrorWrongFormat": "VALIDATE_INPUT";
"setIdInputRef": "READY";
"setIndividualId": "done.invoke.GetVcModal.requestingUinVid:invocation[0]";
"setOtp": "INPUT_OTP";
"setOtpError": "error.platform.GetVcModal.requestingUinVid:invocation[0]";
"setPhoneNumber": "done.invoke.GetVcModal.acceptingIdInput.requestingOtp:invocation[0]" | "done.invoke.GetVcModal.acceptingOtpInput.resendOTP:invocation[0]";
"setTransactionId": "DISMISS" | "error.platform.GetVcModal.acceptingOtpInput.resendOTP:invocation[0]" | "error.platform.GetVcModal.requestingUinVid:invocation[0]" | "xstate.init";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          "isEmptyId": "VALIDATE_INPUT";
"isIdInvalid": "error.platform.GetVcModal.requestingUinVid:invocation[0]";
"isWrongIdFormat": "VALIDATE_INPUT";
        };
        eventsCausingServices: {
          "AddVcModal": "INPUT_ID" | "xstate.after(100)#GetVcModal.acceptingIdInput.focusing";
"requestOtp": "RESEND_OTP" | "VALIDATE_INPUT";
"requestingUinVid": "INPUT_OTP";
        };
        matchesStates: "acceptingIdInput" | "acceptingIdInput.focusing" | "acceptingIdInput.idle" | "acceptingIdInput.invalid" | "acceptingIdInput.invalid.backend" | "acceptingIdInput.invalid.empty" | "acceptingIdInput.invalid.format" | "acceptingIdInput.rendering" | "acceptingIdInput.requestingOtp" | "acceptingOtpInput" | "acceptingOtpInput.idle" | "acceptingOtpInput.resendOTP" | "done" | "requestingUinVid" | { "acceptingIdInput"?: "focusing" | "idle" | "invalid" | "rendering" | "requestingOtp" | { "invalid"?: "backend" | "empty" | "format"; };
"acceptingOtpInput"?: "idle" | "resendOTP"; };
        tags: never;
      }
  