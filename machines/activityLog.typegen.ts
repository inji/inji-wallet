
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          
        };
        missingImplementations: {
          actions: never;
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          "fetchAllWellKnownConfigResponse": "STORE_RESPONSE";
"loadActivities": "REFRESH" | "xstate.init";
"loadWellknownIntoContext": "LOG_ACTIVITY";
"prependActivity": "STORE_RESPONSE";
"setActivities": "STORE_RESPONSE";
"setAllWellknownConfigResponse": "STORE_RESPONSE";
"storeActivity": "LOG_ACTIVITY";
"storeWellknownConfig": "STORE_INCOMING_VC_WELLKNOWN_CONFIG";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          
        };
        eventsCausingServices: {
          
        };
        matchesStates: "init" | "loadWellknownConfig" | "ready" | "ready.idle" | "ready.logging" | "ready.refreshing" | { "ready"?: "idle" | "logging" | "refreshing"; };
        tags: never;
      }
  