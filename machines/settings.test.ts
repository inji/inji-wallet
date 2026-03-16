import {
  SettingsEvents,
  selectName,
  selectAppId,
  selectShowAccountSelectionConfirmation,
  selectVcLabel,
  selectCredentialRegistry,
  selectEsignetHostUrl,
  selectCredentialRegistryResponse,
  selectBiometricUnlockEnabled,
  selectIsResetInjiProps,
  selectIsBiometricUnlock,
  selectIsPasscodeUnlock,
  selectIsKeyOrderSet,
  selectIsKeymanagementTourGuideExplored,
  createSettingsMachine,
  selectShowHardwareKeystoreNotExistsAlert,
  settingsMachine,
} from './settings';

jest.mock('../shared/storage', () => {
  const mockStorage = {
    setItem: jest.fn().mockResolvedValue(undefined),
    getItem: jest.fn().mockResolvedValue(null),
    removeItem: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
  };
  return {
    __esModule: true,
    default: mockStorage,
    MMKV: {
      removeItem: jest.fn(),
      getItem: jest.fn(),
      setItem: jest.fn(),
      clearStore: jest.fn(),
    },
    getItem: jest.fn().mockResolvedValue(null),
  };
});

jest.mock('../shared/constants', () => ({
  APP_ID_DICTIONARY: 'abcdef1234567890',
  APP_ID_LENGTH: 8,
  COMMON_PROPS_KEY: 'commonProps',
  ESIGNET_BASE_URL: 'https://esignet.default',
  isIOS: jest.fn(() => false),
  isAndroid: jest.fn(() => false),
  MIMOTO_BASE_URL: 'https://mimoto.default',
  SETTINGS_STORE_KEY: 'settings',
  isHardwareKeystoreExists: false,
  CREDENTIAL_REGISTRY_EDIT: 'credentialRegistry',
  MY_VCS_STORE_KEY: 'myVCs',
  RECEIVED_VCS_STORE_KEY: 'receivedVCs',
  SHOW_FACE_AUTH_CONSENT_SHARE_FLOW: 'faceAuthConsent',
  ENOENT: 'ENOENT',
}));

jest.mock('./store', () => ({
  StoreEvents: {
    GET: jest.fn((key: string) => ({type: 'GET', key})),
    SET: jest.fn((key: string, value: any) => ({type: 'SET', key, value})),
  },
}));

jest.mock('../shared/api', () =>
  jest.fn().mockResolvedValue({warningDomainName: 'test.registry'}),
);
jest.mock('../shared/GlobalContext', () => ({AppServices: {}}));
jest.mock('../i18n', () => ({default: {t: jest.fn(k => k)}}));
jest.mock('../shared/VCMetadata', () => {
  class MockVCMetadata {
    id: string;
    constructor(obj?: any) {
      this.id = obj?.id || '';
    }
    getVcKey() {
      return `vc_${this.id}`;
    }
    static isVCKey(key: string) {
      return key.startsWith('vc_');
    }
    static fromVC(obj: any) {
      return new MockVCMetadata(obj);
    }
  }
  return {
    __esModule: true,
    default: MockVCMetadata,
    VCMetadata: MockVCMetadata,
  };
});
jest.mock('../shared/fileStorage', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
  exists: jest.fn(),
  getAllFilesInDirectory: jest.fn(),
}));
jest.mock('../shared/telemetry/TelemetryUtils', () => ({
  getStartEventData: jest.fn(),
  getImpressionEventData: jest.fn(),
  getEndEventData: jest.fn(),
  getErrorEventData: jest.fn(),
  sendStartEvent: jest.fn(),
  sendEndEvent: jest.fn(),
  sendImpressionEvent: jest.fn(),
  sendErrorEvent: jest.fn(),
  sendInteractEvent: jest.fn(),
}));
jest.mock('../shared/telemetry/TelemetryConstants', () => ({
  TelemetryConstants: {
    FlowType: {VcDownload: 'vcDownload'},
    InteractEventSubtype: {Click: 'click'},
    EndEventStatus: {Success: 'success', Failure: 'failure'},
    Screens: {},
    ErrorId: {},
    ErrorMessage: {},
  },
}));
jest.mock('../shared/GlobalVariables', () => ({
  __AppId: {setValue: jest.fn(), getValue: jest.fn(() => 'test-app-id')},
  __SessionId: {setValue: jest.fn(), getValue: jest.fn(() => 'session')},
}));
jest.mock('short-unique-id', () => {
  return jest.fn().mockImplementation(() => ({
    randomUUID: jest.fn(() => 'mock-app-id'),
  }));
});
jest.mock('../shared/cryptoutil/cryptoUtil', () => ({
  isHardwareKeystoreExists: false,
  decryptJson: jest.fn(),
  encryptJson: jest.fn(),
  hmacSHA: jest.fn(),
  generateKeys: jest.fn(),
}));

const mockState = (ctx: any = {}, matchVal?: string) => ({
  context: {
    name: '',
    vcLabel: {singular: 'Card', plural: 'Cards'},
    isBiometricUnlockEnabled: false,
    credentialRegistry: '',
    esignetHostUrl: '',
    appId: null,
    isBackupAndRestoreExplored: false,
    isKeyManagementTourGuideExplored: false,
    isKeyOrderSet: undefined,
    hasUserShownWithHardwareKeystoreNotExists: false,
    isAccountSelectionConfirmationShown: false,
    credentialRegistryResponse: '',
    isBiometricToggled: false,
    ...ctx,
  },
  matches: (v: string) => v === matchVal,
});

describe('settings selectors', () => {
  it('selectName', () =>
    expect(selectName(mockState({name: 'Bob'}) as any)).toBe('Bob'));
  it('selectAppId', () =>
    expect(selectAppId(mockState({appId: 'a1'}) as any)).toBe('a1'));
  it('selectShowAccountSelectionConfirmation true', () =>
    expect(selectShowAccountSelectionConfirmation(mockState() as any)).toBe(
      true,
    ));
  it('selectShowAccountSelectionConfirmation false', () =>
    expect(
      selectShowAccountSelectionConfirmation(
        mockState({isAccountSelectionConfirmationShown: true}) as any,
      ),
    ).toBe(false));
  it('selectVcLabel', () =>
    expect(
      selectVcLabel(
        mockState({vcLabel: {singular: 'ID', plural: 'IDs'}}) as any,
      ),
    ).toEqual({singular: 'ID', plural: 'IDs'}));
  it('selectCredentialRegistry', () =>
    expect(
      selectCredentialRegistry(
        mockState({credentialRegistry: 'https://r.com'}) as any,
      ),
    ).toBe('https://r.com'));
  it('selectEsignetHostUrl', () =>
    expect(
      selectEsignetHostUrl(mockState({esignetHostUrl: 'https://e.com'}) as any),
    ).toBe('https://e.com'));
  it('selectCredentialRegistryResponse', () =>
    expect(
      selectCredentialRegistryResponse(
        mockState({credentialRegistryResponse: 'ok'}) as any,
      ),
    ).toBe('ok'));
  it('selectBiometricUnlockEnabled', () =>
    expect(
      selectBiometricUnlockEnabled(
        mockState({isBiometricUnlockEnabled: true}) as any,
      ),
    ).toBe(true));
  it('selectIsResetInjiProps', () => {
    expect(selectIsResetInjiProps(mockState({}, 'resetInjiProps') as any)).toBe(
      true,
    );
    expect(selectIsResetInjiProps(mockState({}, 'idle') as any)).toBe(false);
  });
  it('selectIsBiometricUnlock', () =>
    expect(
      selectIsBiometricUnlock(
        mockState({
          isBiometricToggled: true,
          isBiometricUnlockEnabled: true,
        }) as any,
      ),
    ).toBe(true));
  it('selectIsPasscodeUnlock', () =>
    expect(
      selectIsPasscodeUnlock(
        mockState({
          isBiometricToggled: true,
          isBiometricUnlockEnabled: false,
        }) as any,
      ),
    ).toBe(true));
  it('selectIsKeyOrderSet', () =>
    expect(selectIsKeyOrderSet(mockState({isKeyOrderSet: true}) as any)).toBe(
      true,
    ));
  it('selectIsKeymanagementTourGuideExplored', () =>
    expect(
      selectIsKeymanagementTourGuideExplored(
        mockState({isKeyManagementTourGuideExplored: true}) as any,
      ),
    ).toBe(true));
  it('createSettingsMachine is a function', () =>
    expect(typeof createSettingsMachine).toBe('function'));
});

describe('SettingsEvents', () => {
  it('should create UPDATE_NAME event', () => {
    expect(SettingsEvents.UPDATE_NAME('John')).toEqual({
      type: 'UPDATE_NAME',
      name: 'John',
    });
  });

  it('should create UPDATE_VC_LABEL event', () => {
    expect(SettingsEvents.UPDATE_VC_LABEL('ID')).toEqual({
      type: 'UPDATE_VC_LABEL',
      label: 'ID',
    });
  });

  it('should create TOGGLE_BIOMETRIC_UNLOCK event', () => {
    const event = SettingsEvents.TOGGLE_BIOMETRIC_UNLOCK(true, false);
    expect(event).toEqual({
      type: 'TOGGLE_BIOMETRIC_UNLOCK',
      enable: true,
      isToggledFromSettings: false,
    });
  });

  it('should create STORE_RESPONSE event', () => {
    expect(SettingsEvents.STORE_RESPONSE({key: 'value'})).toEqual({
      type: 'STORE_RESPONSE',
      response: {key: 'value'},
    });
  });

  it('should create CHANGE_LANGUAGE event', () => {
    expect(SettingsEvents.CHANGE_LANGUAGE('en')).toEqual({
      type: 'CHANGE_LANGUAGE',
      language: 'en',
    });
  });

  it('should create UPDATE_HOST event', () => {
    const event = SettingsEvents.UPDATE_HOST(
      'https://registry.com',
      'https://esignet.com',
    );
    expect(event).toEqual({
      type: 'UPDATE_HOST',
      credentialRegistry: 'https://registry.com',
      esignetHostUrl: 'https://esignet.com',
    });
  });

  it('should create UPDATE_CREDENTIAL_REGISTRY_RESPONSE event', () => {
    const event =
      SettingsEvents.UPDATE_CREDENTIAL_REGISTRY_RESPONSE('response');
    expect(event).toEqual({
      type: 'UPDATE_CREDENTIAL_REGISTRY_RESPONSE',
      credentialRegistryResponse: 'response',
    });
  });

  it('should create INJI_TOUR_GUIDE event', () => {
    expect(SettingsEvents.INJI_TOUR_GUIDE()).toEqual({type: 'INJI_TOUR_GUIDE'});
  });

  it('should create BACK event', () => {
    expect(SettingsEvents.BACK()).toEqual({type: 'BACK'});
  });

  it('should create CANCEL event', () => {
    expect(SettingsEvents.CANCEL()).toEqual({type: 'CANCEL'});
  });

  it('should create ACCEPT_HARDWARE_SUPPORT_NOT_EXISTS event', () => {
    expect(SettingsEvents.ACCEPT_HARDWARE_SUPPORT_NOT_EXISTS()).toEqual({
      type: 'ACCEPT_HARDWARE_SUPPORT_NOT_EXISTS',
    });
  });

  it('should create SET_KEY_MANAGEMENT_EXPLORED event', () => {
    expect(SettingsEvents.SET_KEY_MANAGEMENT_EXPLORED()).toEqual({
      type: 'SET_KEY_MANAGEMENT_EXPLORED',
    });
  });

  it('should create SET_KEY_MANAGEMENT_TOUR_GUIDE_EXPLORED event', () => {
    expect(SettingsEvents.SET_KEY_MANAGEMENT_TOUR_GUIDE_EXPLORED()).toEqual({
      type: 'SET_KEY_MANAGEMENT_TOUR_GUIDE_EXPLORED',
    });
  });

  it('should create SET_KEY_ORDER_RESPONSE event', () => {
    expect(SettingsEvents.SET_KEY_ORDER_RESPONSE(true)).toEqual({
      type: 'SET_KEY_ORDER_RESPONSE',
      status: true,
    });
  });

  it('should create RESET_KEY_ORDER_RESPONSE event', () => {
    expect(SettingsEvents.RESET_KEY_ORDER_RESPONSE()).toEqual({
      type: 'RESET_KEY_ORDER_RESPONSE',
    });
  });

  it('should create SHOWN_ACCOUNT_SELECTION_CONFIRMATION event', () => {
    expect(SettingsEvents.SHOWN_ACCOUNT_SELECTION_CONFIRMATION()).toEqual({
      type: 'SHOWN_ACCOUNT_SELECTION_CONFIRMATION',
    });
  });

  it('should create DISMISS event', () => {
    expect(SettingsEvents.DISMISS()).toEqual({type: 'DISMISS'});
  });

  it('should create BIOMETRIC_CANCELLED event', () => {
    expect(SettingsEvents.BIOMETRIC_CANCELLED('settings')).toEqual({
      type: 'BIOMETRIC_CANCELLED',
      requester: 'settings',
    });
  });
});

describe('settings additional selectors', () => {
  it('selectShowHardwareKeystoreNotExistsAlert returns false when already shown', () => {
    expect(
      selectShowHardwareKeystoreNotExistsAlert(
        mockState({hasUserShownWithHardwareKeystoreNotExists: true}) as any,
      ),
    ).toBe(false);
  });

  it('selectBiometricUnlockEnabled returns false by default', () => {
    expect(selectBiometricUnlockEnabled(mockState() as any)).toBe(false);
  });

  it('selectName returns empty string by default', () => {
    expect(selectName(mockState() as any)).toBe('');
  });

  it('selectAppId returns null by default', () => {
    expect(selectAppId(mockState() as any)).toBeNull();
  });

  it('selectIsBiometricUnlock returns false when not toggled', () => {
    expect(
      selectIsBiometricUnlock(
        mockState({
          isBiometricToggled: false,
          isBiometricUnlockEnabled: true,
        }) as any,
      ),
    ).toBe(false);
  });

  it('selectIsPasscodeUnlock returns false when not toggled', () => {
    expect(
      selectIsPasscodeUnlock(
        mockState({
          isBiometricToggled: false,
          isBiometricUnlockEnabled: false,
        }) as any,
      ),
    ).toBe(false);
  });

  it('selectIsKeyOrderSet returns undefined by default', () => {
    expect(selectIsKeyOrderSet(mockState() as any)).toBeUndefined();
  });

  it('selectCredentialRegistryResponse returns empty string by default', () => {
    expect(selectCredentialRegistryResponse(mockState() as any)).toBe('');
  });

  it('selectIsKeymanagementTourGuideExplored returns false by default', () => {
    expect(selectIsKeymanagementTourGuideExplored(mockState() as any)).toBe(
      false,
    );
  });

  it('selectEsignetHostUrl returns empty string by default', () => {
    expect(selectEsignetHostUrl(mockState({esignetHostUrl: ''}) as any)).toBe(
      '',
    );
  });

  it('selectCredentialRegistry returns empty string by default', () => {
    expect(
      selectCredentialRegistry(mockState({credentialRegistry: ''}) as any),
    ).toBe('');
  });

  it('selectVcLabel returns default Card labels', () => {
    expect(selectVcLabel(mockState() as any)).toEqual({
      singular: 'Card',
      plural: 'Cards',
    });
  });
});

describe('settings machine creation', () => {
  it('creates machine with service refs', () => {
    const serviceRefs = {store: {} as any} as any;
    const machine = createSettingsMachine(serviceRefs);
    expect(machine).toBeDefined();
    expect(machine.context.serviceRefs).toBe(serviceRefs);
  });
});

describe('SettingsEvents additional', () => {
  it('STORE_RESPONSE with null response', () => {
    expect(SettingsEvents.STORE_RESPONSE(null)).toEqual({
      type: 'STORE_RESPONSE',
      response: null,
    });
  });

  it('TOGGLE_BIOMETRIC_UNLOCK as toggled from settings', () => {
    const event = SettingsEvents.TOGGLE_BIOMETRIC_UNLOCK(false, true);
    expect(event.enable).toBe(false);
    expect(event.isToggledFromSettings).toBe(true);
  });

  it('UPDATE_HOST with empty strings', () => {
    const event = SettingsEvents.UPDATE_HOST('', '');
    expect(event.credentialRegistry).toBe('');
    expect(event.esignetHostUrl).toBe('');
  });

  it('UPDATE_NAME with empty string', () => {
    expect(SettingsEvents.UPDATE_NAME('')).toEqual({
      type: 'UPDATE_NAME',
      name: '',
    });
  });

  it('UPDATE_VC_LABEL creates singular and expects event shape', () => {
    const event = SettingsEvents.UPDATE_VC_LABEL('Certificate');
    expect(event.label).toBe('Certificate');
  });

  it('CHANGE_LANGUAGE with different languages', () => {
    expect(SettingsEvents.CHANGE_LANGUAGE('hi').language).toBe('hi');
    expect(SettingsEvents.CHANGE_LANGUAGE('fr').language).toBe('fr');
  });
});

describe('settingsMachine definition', () => {
  it('should be defined with id settings', () => {
    expect(settingsMachine).toBeDefined();
    expect(settingsMachine.id).toBe('settings');
  });

  it('should have initial state init', () => {
    expect(settingsMachine.initialState.value).toBe('init');
  });

  it('should have states: init, storingDefaults, idle, resetInjiProps, showInjiTourGuide', () => {
    const states = settingsMachine.config.states;
    expect(states).toHaveProperty('init');
    expect(states).toHaveProperty('storingDefaults');
    expect(states).toHaveProperty('idle');
    expect(states).toHaveProperty('resetInjiProps');
    expect(states).toHaveProperty('showInjiTourGuide');
  });
});

describe('settingsMachine transitions', () => {
  const getMachine = (guards: any = {}) =>
    settingsMachine.withConfig({
      services: {
        resetInjiProps: async () => ({warningDomainName: 'new.registry'}),
      } as any,
      guards: {
        hasData: () => false,
        hasPartialData: () => false,
        ...guards,
      },
      actions: {
        requestStoredContext: () => {},
        setContext: () => {},
        updateDefaults: () => {},
        updatePartialDefaults: () => {},
        storeContext: () => {},
        setIsBiometricToggled: () => {},
        resetIsBiometricToggled: () => {},
        updateName: () => {},
        setBackupAndRestoreOptionExplored: () => {},
        setKeyOrderingResponse: () => {},
        resetKeyOrderingResponse: () => {},
        setKeyManagementTourGuideExplored: () => {},
        updateEsignetHostUrl: () => {},
        updateVcLabel: () => {},
        updateCredentialRegistry: () => {},
        updateCredentialRegistryResponse: () => {},
        updateCredentialRegistrySuccess: () => {},
        resetCredentialRegistryResponse: () => {},
        updateUserShownWithHardwareKeystoreNotExists: () => {},
        updateIsAccountSelectionConfirmationShown: () => {},
        toggleBiometricUnlock: () => {},
        setKeyManagementExplored: () => {},
      } as any,
    });

  it('init STORE_RESPONSE → storingDefaults when no guards match', () => {
    const machine = getMachine();
    const next = machine.transition('init', {
      type: 'STORE_RESPONSE',
      response: null,
    });
    expect(next.value).toBe('storingDefaults');
  });

  it('init STORE_RESPONSE → idle when hasData', () => {
    const machine = getMachine({hasData: () => true});
    const next = machine.transition('init', {
      type: 'STORE_RESPONSE',
      response: {encryptedData: {}, appId: 'a1'},
    });
    expect(next.value).toBe('idle');
  });

  it('storingDefaults STORE_RESPONSE → idle', () => {
    const machine = getMachine();
    const next = machine.transition('storingDefaults', {
      type: 'STORE_RESPONSE',
      response: {},
    });
    expect(next.value).toBe('idle');
  });

  it('idle TOGGLE_BIOMETRIC_UNLOCK stays idle', () => {
    const machine = getMachine();
    const next = machine.transition('idle', {
      type: 'TOGGLE_BIOMETRIC_UNLOCK',
      enable: true,
      isToggledFromSettings: true,
    });
    expect(next.value).toBe('idle');
  });

  it('idle UPDATE_NAME stays idle', () => {
    const machine = getMachine();
    const next = machine.transition('idle', {
      type: 'UPDATE_NAME',
      name: 'Test',
    });
    expect(next.value).toBe('idle');
  });

  it('idle SET_KEY_MANAGEMENT_EXPLORED stays idle', () => {
    const machine = getMachine();
    const next = machine.transition('idle', {
      type: 'SET_KEY_MANAGEMENT_EXPLORED',
    });
    expect(next.value).toBe('idle');
  });

  it('idle UPDATE_VC_LABEL stays idle', () => {
    const machine = getMachine();
    const next = machine.transition('idle', {
      type: 'UPDATE_VC_LABEL',
      label: 'ID',
    });
    expect(next.value).toBe('idle');
  });

  it('idle SET_KEY_ORDER_RESPONSE stays idle', () => {
    const machine = getMachine();
    const next = machine.transition('idle', {
      type: 'SET_KEY_ORDER_RESPONSE',
      status: true,
    });
    expect(next.value).toBe('idle');
  });

  it('idle RESET_KEY_ORDER_RESPONSE stays idle', () => {
    const machine = getMachine();
    const next = machine.transition('idle', {type: 'RESET_KEY_ORDER_RESPONSE'});
    expect(next.value).toBe('idle');
  });

  it('idle SET_KEY_MANAGEMENT_TOUR_GUIDE_EXPLORED stays idle', () => {
    const machine = getMachine();
    const next = machine.transition('idle', {
      type: 'SET_KEY_MANAGEMENT_TOUR_GUIDE_EXPLORED',
    });
    expect(next.value).toBe('idle');
  });

  it('idle UPDATE_HOST → resetInjiProps', () => {
    const machine = getMachine();
    const next = machine.transition('idle', {
      type: 'UPDATE_HOST',
      credentialRegistry: 'https://new.com',
      esignetHostUrl: 'https://e.com',
    });
    expect(next.value).toBe('resetInjiProps');
  });

  it('idle CANCEL stays idle', () => {
    const machine = getMachine();
    const next = machine.transition('idle', {type: 'CANCEL'});
    expect(next.value).toBe('idle');
  });

  it('idle INJI_TOUR_GUIDE → showInjiTourGuide', () => {
    const machine = getMachine();
    const next = machine.transition('idle', {type: 'INJI_TOUR_GUIDE'});
    expect(next.value).toBe('showInjiTourGuide');
  });

  it('idle ACCEPT_HARDWARE_SUPPORT_NOT_EXISTS → idle', () => {
    const machine = getMachine();
    const next = machine.transition('idle', {
      type: 'ACCEPT_HARDWARE_SUPPORT_NOT_EXISTS',
    });
    expect(next.value).toBe('idle');
  });

  it('idle SHOWN_ACCOUNT_SELECTION_CONFIRMATION → idle', () => {
    const machine = getMachine();
    const next = machine.transition('idle', {
      type: 'SHOWN_ACCOUNT_SELECTION_CONFIRMATION',
    });
    expect(next.value).toBe('idle');
  });

  it('idle DISMISS → idle', () => {
    const machine = getMachine();
    const next = machine.transition('idle', {type: 'DISMISS'});
    expect(next.value).toBe('idle');
  });

  it('resetInjiProps CANCEL → idle', () => {
    const machine = getMachine();
    const next = machine.transition('resetInjiProps', {type: 'CANCEL'});
    expect(next.value).toBe('idle');
  });

  it('showInjiTourGuide BACK → idle', () => {
    const machine = getMachine();
    const next = machine.transition('showInjiTourGuide', {type: 'BACK'});
    expect(next.value).toBe('idle');
  });
});

describe('settingsMachine action callbacks', () => {
  const getMachineWithCtx = (
    ctxOverrides: any = {},
    guardOverrides: any = {},
  ) => {
    return settingsMachine
      .withContext({
        ...settingsMachine.context,
        serviceRefs: {store: {}} as any,
        ...ctxOverrides,
      })
      .withConfig({
        services: {} as any,
        guards: {
          hasData: () => true,
          hasPartialData: () => false,
          ...guardOverrides,
        },
      });
  };

  it('setIsBiometricToggled assigns isToggledFromSettings', () => {
    const machine = getMachineWithCtx();
    const next = machine.transition('idle', {
      type: 'TOGGLE_BIOMETRIC_UNLOCK',
      enable: true,
      isToggledFromSettings: true,
    } as any);
    expect(next.context.isBiometricToggled).toBe(true);
  });

  it('toggleBiometricUnlock assigns enable value', () => {
    const machine = getMachineWithCtx({isBiometricUnlockEnabled: false});
    const next = machine.transition('idle', {
      type: 'TOGGLE_BIOMETRIC_UNLOCK',
      enable: true,
      isToggledFromSettings: false,
    } as any);
    expect(next.context.isBiometricUnlockEnabled).toBe(true);
  });

  it('updateName assigns name from event', () => {
    const machine = getMachineWithCtx();
    const next = machine.transition('idle', {
      type: 'UPDATE_NAME',
      name: 'Alice',
    } as any);
    expect(next.context.name).toBe('Alice');
  });

  it('updateVcLabel assigns singular and plural', () => {
    const machine = getMachineWithCtx();
    const next = machine.transition('idle', {
      type: 'UPDATE_VC_LABEL',
      label: 'Certificate',
    } as any);
    expect(next.context.vcLabel).toEqual({
      singular: 'Certificate',
      plural: 'Certificates',
    });
  });

  it('setKeyOrderingResponse assigns status', () => {
    const machine = getMachineWithCtx();
    const next = machine.transition('idle', {
      type: 'SET_KEY_ORDER_RESPONSE',
      status: true,
    } as any);
    expect(next.context.isKeyOrderSet).toBe(true);
  });

  it('resetKeyOrderingResponse resets isKeyOrderSet', () => {
    const machine = getMachineWithCtx({isKeyOrderSet: true});
    const next = machine.transition('idle', {
      type: 'RESET_KEY_ORDER_RESPONSE',
    } as any);
    expect(next.context.isKeyOrderSet).toBeUndefined();
  });

  it('setKeyManagementTourGuideExplored assigns true', () => {
    const machine = getMachineWithCtx();
    const next = machine.transition('idle', {
      type: 'SET_KEY_MANAGEMENT_TOUR_GUIDE_EXPLORED',
    } as any);
    expect(next.context.isKeyManagementTourGuideExplored).toBe(true);
  });

  it('updateEsignetHostUrl assigns esignetHostUrl from event', () => {
    const machine = getMachineWithCtx();
    const next = machine.transition('idle', {
      type: 'UPDATE_HOST',
      credentialRegistry: 'x',
      esignetHostUrl: 'https://e.new',
    } as any);
    expect(next.context.esignetHostUrl).toBe('https://e.new');
  });

  it('resetCredentialRegistryResponse resets to empty string', () => {
    const machine = getMachineWithCtx({credentialRegistryResponse: 'error'});
    const next = machine.transition('idle', {type: 'CANCEL'} as any);
    expect(next.context.credentialRegistryResponse).toBe('');
  });

  it('updateUserShownWithHardwareKeystoreNotExists assigns true', () => {
    const machine = getMachineWithCtx();
    const next = machine.transition('idle', {
      type: 'ACCEPT_HARDWARE_SUPPORT_NOT_EXISTS',
    } as any);
    expect(next.context.hasUserShownWithHardwareKeystoreNotExists).toBe(true);
  });

  it('updateIsAccountSelectionConfirmationShown assigns true', () => {
    const machine = getMachineWithCtx();
    const next = machine.transition('idle', {
      type: 'SHOWN_ACCOUNT_SELECTION_CONFIRMATION',
    } as any);
    expect(next.context.isAccountSelectionConfirmationShown).toBe(true);
  });

  it('resetIsBiometricToggled resets toggled to false', () => {
    const machine = getMachineWithCtx({isBiometricToggled: true});
    const next = machine.transition('idle', {type: 'DISMISS'} as any);
    expect(next.context.isBiometricToggled).toBe(false);
  });

  it('updateDefaults assigns appId in storingDefaults entry', () => {
    const machine = getMachineWithCtx(
      {},
      {hasData: () => false, hasPartialData: () => false},
    );
    const next = machine.transition('init', {
      type: 'STORE_RESPONSE',
      response: null,
    } as any);
    expect(next.value).toBe('storingDefaults');
    expect(next.context.appId).toBeDefined();
    expect(typeof next.context.appId).toBe('string');
  });

  it('setContext assigns context from event response on hasData', () => {
    const machine = getMachineWithCtx(
      {},
      {hasData: () => true, hasPartialData: () => false},
    );
    const response = {
      encryptedData: {
        name: 'TestUser',
        vcLabel: {singular: 'ID', plural: 'IDs'},
      },
      appId: 'app123',
    };
    const next = machine.transition('init', {
      type: 'STORE_RESPONSE',
      response,
    } as any);
    expect(next.value).toBe('idle');
    expect(next.context.appId).toBe('app123');
  });
});

describe('settingsMachine guards', () => {
  it('hasData returns true when encryptedData and appId present', () => {
    const machine = settingsMachine
      .withContext({
        ...settingsMachine.context,
        serviceRefs: {store: {}} as any,
      })
      .withConfig({services: {} as any});
    const next = machine.transition('init', {
      type: 'STORE_RESPONSE',
      response: {encryptedData: {name: 'X'}, appId: 'a1'},
    } as any);
    expect(next.value).toBe('idle');
  });

  it('hasData returns false when encryptedData is null', () => {
    const machine = settingsMachine
      .withContext({
        ...settingsMachine.context,
        serviceRefs: {store: {}} as any,
      })
      .withConfig({services: {} as any});
    const next = machine.transition('init', {
      type: 'STORE_RESPONSE',
      response: {encryptedData: null, appId: 'a1'},
    } as any);
    expect(next.value).not.toBe('idle');
  });

  it('hasPartialData matches when response exists but appId is null', () => {
    const machine = settingsMachine
      .withContext({
        ...settingsMachine.context,
        serviceRefs: {store: {}} as any,
      })
      .withConfig({services: {} as any});
    const next = machine.transition('init', {
      type: 'STORE_RESPONSE',
      response: {encryptedData: null, appId: null},
    } as any);
    // hasPartialData: response != null && appId == null → true → idle with setContext + updatePartialDefaults
    expect(next.value).toBe('idle');
  });
});
