// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  internalEvents: {
    'done.invoke.HomeScreen.tabs.checkStorage:invocation[0]': {
      type: 'done.invoke.HomeScreen.tabs.checkStorage:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'xstate.after(100)#HomeScreen.tabs.init': {
      type: 'xstate.after(100)#HomeScreen.tabs.init';
    };
    'xstate.init': {type: 'xstate.init'};
  };
  invokeSrcNameMap: {
    checkStorageAvailability: 'done.invoke.HomeScreen.tabs.checkStorage:invocation[0]';
  };
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {
    resetSelectedVc: 'DISMISS_MODAL' | 'xstate.init';
    sendAddEvent: 'DOWNLOAD_ID';
    setSelectedVc: 'VIEW_VC';
    spawnTabActors: 'xstate.init';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {
    isMinimumStorageLimitReached: 'done.invoke.HomeScreen.tabs.checkStorage:invocation[0]';
  };
  eventsCausingServices: {
    checkStorageAvailability: 'GOTO_ISSUERS';
    issuersMachine: 'done.invoke.HomeScreen.tabs.checkStorage:invocation[0]';
  };
  matchesStates:
    | 'modals'
    | 'modals.none'
    | 'modals.viewingVc'
    | 'tabs'
    | 'tabs.checkStorage'
    | 'tabs.gotoIssuers'
    | 'tabs.history'
    | 'tabs.idle'
    | 'tabs.init'
    | 'tabs.myVcs'
    | 'tabs.receivedVcs'
    | 'tabs.storageLimitReached'
    | {
        modals?: 'none' | 'viewingVc';
        tabs?:
          | 'checkStorage'
          | 'gotoIssuers'
          | 'history'
          | 'idle'
          | 'init'
          | 'myVcs'
          | 'receivedVcs'
          | 'storageLimitReached';
      };
  tags: never;
}
