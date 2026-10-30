// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  internalEvents: {
    'done.invoke.settings.resetInjiProps:invocation[0]': {
      type: 'done.invoke.settings.resetInjiProps:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'error.platform.settings.resetInjiProps:invocation[0]': {
      type: 'error.platform.settings.resetInjiProps:invocation[0]';
      data: unknown;
    };
    'xstate.init': {type: 'xstate.init'};
  };
  invokeSrcNameMap: {
    resetInjiProps: 'done.invoke.settings.resetInjiProps:invocation[0]';
  };
  missingImplementations: {
    actions: 'setKeyManagementExplored';
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {
    requestStoredContext: 'BIOMETRIC_CANCELLED' | 'xstate.init';
    resetCredentialRegistryResponse: 'CANCEL' | 'UPDATE_HOST';
    resetIsBiometricToggled: 'DISMISS';
    resetKeyOrderingResponse: 'RESET_KEY_ORDER_RESPONSE';
    setContext: 'STORE_RESPONSE';
    setIsBiometricToggled: 'TOGGLE_BIOMETRIC_UNLOCK';
    setKeyManagementExplored: 'SET_KEY_MANAGEMENT_EXPLORED';
    setKeyManagementTourGuideExplored: 'SET_KEY_MANAGEMENT_TOUR_GUIDE_EXPLORED';
    setKeyOrderingResponse: 'SET_KEY_ORDER_RESPONSE';
    storeContext:
      | 'ACCEPT_HARDWARE_SUPPORT_NOT_EXISTS'
      | 'SET_KEY_MANAGEMENT_EXPLORED'
      | 'SHOWN_ACCOUNT_SELECTION_CONFIRMATION'
      | 'STORE_RESPONSE'
      | 'TOGGLE_BIOMETRIC_UNLOCK'
      | 'UPDATE_HOST'
      | 'UPDATE_NAME'
      | 'UPDATE_VC_LABEL'
      | 'done.invoke.settings.resetInjiProps:invocation[0]';
    storeKeyPriorityOrderOfEnvironment: 'done.invoke.settings.resetInjiProps:invocation[0]';
    toggleBiometricUnlock: 'TOGGLE_BIOMETRIC_UNLOCK';
    updateCredentialRegistry: 'done.invoke.settings.resetInjiProps:invocation[0]';
    updateCredentialRegistryResponse: 'error.platform.settings.resetInjiProps:invocation[0]';
    updateCredentialRegistrySuccess: 'done.invoke.settings.resetInjiProps:invocation[0]';
    updateDefaults: 'STORE_RESPONSE';
    updateEsignetHostUrl: 'UPDATE_HOST';
    updateIsAccountSelectionConfirmationShown: 'SHOWN_ACCOUNT_SELECTION_CONFIRMATION';
    updateName: 'UPDATE_NAME';
    updatePartialDefaults: 'STORE_RESPONSE';
    updateUserShownWithHardwareKeystoreNotExists: 'ACCEPT_HARDWARE_SUPPORT_NOT_EXISTS';
    updateVcLabel: 'UPDATE_VC_LABEL';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {
    hasData: 'STORE_RESPONSE';
    hasPartialData: 'STORE_RESPONSE';
  };
  eventsCausingServices: {
    resetInjiProps: 'UPDATE_HOST';
  };
  matchesStates:
    | 'idle'
    | 'init'
    | 'resetInjiProps'
    | 'showInjiTourGuide'
    | 'storingDefaults';
  tags: never;
}
