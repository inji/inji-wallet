
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "done.invoke.AddVcModal": { type: "done.invoke.AddVcModal"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.GetVcModal": { type: "done.invoke.GetVcModal"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.MyVcsTab.addVc.checkNetwork:invocation[0]": { type: "done.invoke.MyVcsTab.addVc.checkNetwork:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          "checkNetworkStatus": "done.invoke.MyVcsTab.addVc.checkNetwork:invocation[0]";
        };
        missingImplementations: {
          actions: never;
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          "resetStoringVcItemStatus": "RESET_STORE_VC_ITEM_STATUS";
"sendDownloadingFailedToVcMeta": "STORE_ERROR";
"sendVcAdded": "STORE_RESPONSE";
"setStoringVcItemStatus": "SET_STORE_VC_ITEM_STATUS" | "STORE_RESPONSE";
"storeVcItem": "done.invoke.AddVcModal";
"viewVcFromParent": "VIEW_VC";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          "isNetworkOn": "done.invoke.MyVcsTab.addVc.checkNetwork:invocation[0]";
        };
        eventsCausingServices: {
          "AddVcModal": "done.invoke.GetVcModal" | "done.invoke.MyVcsTab.addVc.checkNetwork:invocation[0]";
"GetVcModal": "GET_VC";
"checkNetworkStatus": "ADD_VC" | "TRY_AGAIN";
        };
        matchesStates: "addVc" | "addVc.checkNetwork" | "addVc.networkOff" | "addingVc" | "addingVc.savingFailed" | "addingVc.savingFailed.idle" | "addingVc.storing" | "addingVc.waitingForvcKey" | "gettingVc" | "gettingVc.waitingForvcKey" | "idle" | "viewingVc" | { "addVc"?: "checkNetwork" | "networkOff";
"addingVc"?: "savingFailed" | "storing" | "waitingForvcKey" | { "savingFailed"?: "idle"; };
"gettingVc"?: "waitingForvcKey"; };
        tags: never;
      }
  
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "done.invoke.AddVcModal": { type: "done.invoke.AddVcModal"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.GetVcModal": { type: "done.invoke.GetVcModal"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.MyVcsTab.addVc.checkNetwork:invocation[0]": { type: "done.invoke.MyVcsTab.addVc.checkNetwork:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          "checkNetworkStatus": "done.invoke.MyVcsTab.addVc.checkNetwork:invocation[0]";
        };
        missingImplementations: {
          actions: never;
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          "resetStoringVcItemStatus": "RESET_STORE_VC_ITEM_STATUS";
"sendDownloadingFailedToVcMeta": "STORE_ERROR";
"sendVcAdded": "STORE_RESPONSE";
"setStoringVcItemStatus": "SET_STORE_VC_ITEM_STATUS" | "STORE_RESPONSE";
"storeVcItem": "done.invoke.AddVcModal";
"viewVcFromParent": "VIEW_VC";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          "isNetworkOn": "done.invoke.MyVcsTab.addVc.checkNetwork:invocation[0]";
        };
        eventsCausingServices: {
          "AddVcModal": "done.invoke.GetVcModal" | "done.invoke.MyVcsTab.addVc.checkNetwork:invocation[0]";
"GetVcModal": "GET_VC";
"checkNetworkStatus": "ADD_VC" | "TRY_AGAIN";
        };
        matchesStates: "addVc" | "addVc.checkNetwork" | "addVc.networkOff" | "addingVc" | "addingVc.savingFailed" | "addingVc.savingFailed.idle" | "addingVc.storing" | "addingVc.waitingForvcKey" | "gettingVc" | "gettingVc.waitingForvcKey" | "idle" | "viewingVc" | { "addVc"?: "checkNetwork" | "networkOff";
"addingVc"?: "savingFailed" | "storing" | "waitingForvcKey" | { "savingFailed"?: "idle"; };
"gettingVc"?: "waitingForvcKey"; };
        tags: never;
      }
  