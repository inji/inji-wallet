
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "": { type: "" };
"xstate.after(INITIAL_FOCUS_DELAY)#pinInput.idle": { type: "xstate.after(INITIAL_FOCUS_DELAY)#pinInput.idle" };
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
          "clearInput": "KEY_PRESS";
"focusSelected": "KEY_PRESS" | "UPDATE_INPUT" | "xstate.after(INITIAL_FOCUS_DELAY)#pinInput.idle";
"selectInput": "FOCUS_INPUT";
"selectNextInput": "UPDATE_INPUT";
"selectPrevInput": "KEY_PRESS";
"updateInput": "UPDATE_INPUT";
        };
        eventsCausingDelays: {
          "INITIAL_FOCUS_DELAY": "" | "xstate.init";
        };
        eventsCausingGuards: {
          "canGoBack": "KEY_PRESS";
"hasNextInput": "UPDATE_INPUT";
"isBlank": "UPDATE_INPUT";
        };
        eventsCausingServices: {
          
        };
        matchesStates: "idle" | "selectingNext" | "selectingPrev";
        tags: never;
      }
  
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "": { type: "" };
"xstate.after(INITIAL_FOCUS_DELAY)#pinInput.idle": { type: "xstate.after(INITIAL_FOCUS_DELAY)#pinInput.idle" };
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
          "clearInput": "KEY_PRESS";
"focusSelected": "KEY_PRESS" | "UPDATE_INPUT" | "xstate.after(INITIAL_FOCUS_DELAY)#pinInput.idle";
"selectInput": "FOCUS_INPUT";
"selectNextInput": "UPDATE_INPUT";
"selectPrevInput": "KEY_PRESS";
"updateInput": "UPDATE_INPUT";
        };
        eventsCausingDelays: {
          "INITIAL_FOCUS_DELAY": "" | "xstate.init";
        };
        eventsCausingGuards: {
          "canGoBack": "KEY_PRESS";
"hasNextInput": "UPDATE_INPUT";
"isBlank": "UPDATE_INPUT";
        };
        eventsCausingServices: {
          
        };
        matchesStates: "idle" | "selectingNext" | "selectingPrev";
        tags: never;
      }
  