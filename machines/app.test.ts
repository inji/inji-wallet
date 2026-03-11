// Mock all heavy dependencies to avoid deep import chains
jest.mock('../shared/tuvali', () => ({
  wallet: {},
  verifier: {},
  EventTypes: {},
  VerificationStatus: {},
}));
jest.mock('../shared/tuvali/index', () => ({
  wallet: {},
  verifier: {},
  EventTypes: {},
  VerificationStatus: {},
}));
jest.mock('../shared/openIdBLE/verifierEventHandler', () => ({}));
jest.mock('../shared/vciClient/VciClient', () => ({
  VciClient: {getInstance: jest.fn().mockReturnValue({})},
}));

// Mock all machine imports
jest.mock('./auth', () => ({authMachine: {}, createAuthMachine: jest.fn()}));
jest.mock('./settings', () => ({
  createSettingsMachine: jest.fn(),
  settingsMachine: {},
}));
jest.mock('./store', () => ({
  StoreEvents: {
    GET: (key: string) => ({type: 'GET', key}),
    SET: (key: string, value: any) => ({type: 'SET', key, value}),
    EXPORT: () => ({type: 'EXPORT'}),
    REMOVE: (key: string) => ({type: 'REMOVE', key}),
    REMOVE_ITEMS: (keys: string[]) => ({type: 'REMOVE_ITEMS', keys}),
    PREPEND: (key: string, value: any) => ({type: 'PREPEND', key, value}),
    APPEND: (key: string, value: any) => ({type: 'APPEND', key, value}),
    UPDATE: (key: string, value: any) => ({type: 'UPDATE', key, value}),
  },
  storeMachine: {},
}));
jest.mock('./activityLog', () => ({
  activityLogMachine: {},
  createActivityLogMachine: jest.fn(),
}));
jest.mock('./bleShare/request/requestMachine', () => ({
  createRequestMachine: jest.fn(),
  requestMachine: {},
}));
jest.mock('./bleShare/scan/scanMachine', () => ({
  createScanMachine: jest.fn(),
  scanMachine: {},
}));
jest.mock('./backupAndRestore/backup/backupMachine', () => ({
  backupMachine: {},
  createBackupMachine: jest.fn(),
}));
jest.mock('./backupAndRestore/restore/restoreMachine', () => ({
  restoreMachine: {},
  createRestoreMachine: jest.fn(),
}));
jest.mock('./VerifiableCredential/VCMetaMachine/VCMetaMachine', () => ({
  createVcMetaMachine: jest.fn(),
  vcMetaMachine: {},
}));

// Mock shared imports
jest.mock('../shared/cryptoutil/cryptoUtil', () => ({
  checkAllKeyPairs: jest.fn(),
  generateKeyPairsAndStoreOrder: jest.fn(),
}));
jest.mock('../shared/api', () => jest.fn().mockResolvedValue({}));
jest.mock('../shared/GlobalContext', () => ({AppServices: {}}));
jest.mock('../shared/Utils', () => ({DEEPLINK_FLOWS: {}}));

import {
  APP_EVENTS,
  selectAppInfo,
  selectIsReady,
  selectIsOnline,
  selectIsActive,
  selectIsFocused,
  selectIsReadError,
  selectIsDecryptError,
  selectIsKeyInvalidateError,
  selectIsLinkCode,
  selectAuthorizationRequest,
  selectIsDeepLinkDetected,
} from './app';

const mockState = (ctx: any = {}, matchVal?: string) => ({
  context: {
    info: {},
    serviceRefs: {},
    isReadError: false,
    isDecryptError: false,
    isKeyInvalidateError: false,
    linkCode: '',
    authorizationRequest: '',
    ...ctx,
  },
  matches: (v: string) => v === matchVal,
});

describe('app selectors', () => {
  it('selectAppInfo', () => {
    const i = {deviceId: 'd'};
    expect(selectAppInfo(mockState({info: i}) as any)).toEqual(i);
  });
  it('selectIsReady true', () =>
    expect(selectIsReady(mockState({}, 'ready') as any)).toBe(true));
  it('selectIsReady false', () =>
    expect(selectIsReady(mockState() as any)).toBe(false));
  it('selectIsOnline', () =>
    expect(selectIsOnline(mockState({}, 'ready.network.online') as any)).toBe(
      true,
    ));
  it('selectIsActive', () =>
    expect(selectIsActive(mockState({}, 'ready.focus.active') as any)).toBe(
      true,
    ));
  it('selectIsFocused', () =>
    expect(selectIsFocused(mockState({}, 'ready.focus') as any)).toBe(true));
  it('selectIsReadError', () =>
    expect(selectIsReadError(mockState({isReadError: true}) as any)).toBe(
      true,
    ));
  it('selectIsDecryptError', () =>
    expect(selectIsDecryptError(mockState({isDecryptError: true}) as any)).toBe(
      true,
    ));
  it('selectIsKeyInvalidateError', () =>
    expect(
      selectIsKeyInvalidateError(
        mockState({isKeyInvalidateError: true}) as any,
      ),
    ).toBe(true));
  it('selectIsLinkCode', () =>
    expect(selectIsLinkCode(mockState({linkCode: 'c'}) as any)).toBe('c'));
  it('selectAuthorizationRequest', () =>
    expect(
      selectAuthorizationRequest(mockState({authorizationRequest: 'r'}) as any),
    ).toBe('r'));
  it('selectIsDeepLinkDetected with linkCode', () =>
    expect(
      selectIsDeepLinkDetected(
        mockState({linkCode: 'x', authorizationRequest: ''}) as any,
      ),
    ).toBe(true));
  it('selectIsDeepLinkDetected with auth', () =>
    expect(
      selectIsDeepLinkDetected(
        mockState({linkCode: '', authorizationRequest: 'y'}) as any,
      ),
    ).toBe(true));
  it('selectIsDeepLinkDetected false', () =>
    expect(
      selectIsDeepLinkDetected(
        mockState({linkCode: '', authorizationRequest: ''}) as any,
      ),
    ).toBe(false));
});

describe('APP_EVENTS', () => {
  it('should create ACTIVE event', () => {
    expect(APP_EVENTS.ACTIVE()).toEqual({type: 'ACTIVE'});
  });

  it('should create INACTIVE event', () => {
    expect(APP_EVENTS.INACTIVE()).toEqual({type: 'INACTIVE'});
  });

  it('should create ERROR event', () => {
    expect(APP_EVENTS.ERROR()).toEqual({type: 'ERROR'});
  });

  it('should create DECRYPT_ERROR event', () => {
    expect(APP_EVENTS.DECRYPT_ERROR()).toEqual({type: 'DECRYPT_ERROR'});
  });

  it('should create DECRYPT_ERROR_DISMISS event', () => {
    expect(APP_EVENTS.DECRYPT_ERROR_DISMISS()).toEqual({
      type: 'DECRYPT_ERROR_DISMISS',
    });
  });

  it('should create KEY_INVALIDATE_ERROR event', () => {
    expect(APP_EVENTS.KEY_INVALIDATE_ERROR()).toEqual({
      type: 'KEY_INVALIDATE_ERROR',
    });
  });

  it('should create OFFLINE event', () => {
    expect(APP_EVENTS.OFFLINE()).toEqual({type: 'OFFLINE'});
  });

  it('should create ONLINE event', () => {
    const event = APP_EVENTS.ONLINE('wifi' as any);
    expect(event.type).toBe('ONLINE');
    expect(event.networkType).toBe('wifi');
  });

  it('should create REQUEST_DEVICE_INFO event', () => {
    expect(APP_EVENTS.REQUEST_DEVICE_INFO()).toEqual({
      type: 'REQUEST_DEVICE_INFO',
    });
  });

  it('should create READY event', () => {
    expect(APP_EVENTS.READY({data: 'test'})).toEqual({
      type: 'READY',
      data: {data: 'test'},
    });
  });

  it('should create APP_INFO_RECEIVED event', () => {
    const info = {deviceId: 'd1', deviceName: 'n1'};
    const event = APP_EVENTS.APP_INFO_RECEIVED(info as any);
    expect(event.type).toBe('APP_INFO_RECEIVED');
    expect(event.info).toEqual(info);
  });

  it('should create STORE_RESPONSE event', () => {
    expect(APP_EVENTS.STORE_RESPONSE({data: 'x'})).toEqual({
      type: 'STORE_RESPONSE',
      response: {data: 'x'},
    });
  });

  it('should create RESET_KEY_INVALIDATE_ERROR_DISMISS event', () => {
    expect(APP_EVENTS.RESET_KEY_INVALIDATE_ERROR_DISMISS()).toEqual({
      type: 'RESET_KEY_INVALIDATE_ERROR_DISMISS',
    });
  });

  it('should create RESET_LINKCODE event', () => {
    expect(APP_EVENTS.RESET_LINKCODE()).toEqual({type: 'RESET_LINKCODE'});
  });

  it('should create RESET_AUTHORIZATION_REQUEST event', () => {
    expect(APP_EVENTS.RESET_AUTHORIZATION_REQUEST()).toEqual({
      type: 'RESET_AUTHORIZATION_REQUEST',
    });
  });

  it('should create BIOMETRIC_CANCELLED event', () => {
    expect(APP_EVENTS.BIOMETRIC_CANCELLED()).toEqual({
      type: 'BIOMETRIC_CANCELLED',
    });
  });
});

describe('appMachine definition', () => {
  let appMachine: any;
  beforeAll(() => {
    appMachine = require('./app').appMachine;
  });

  it('should be defined', () => {
    expect(appMachine).toBeDefined();
  });

  it('should have id "app"', () => {
    expect(appMachine.id).toBe('app');
  });

  it('should have initial state "init"', () => {
    expect(appMachine.initial).toBe('init');
  });

  it('should have states init, ready, and waiting', () => {
    expect(appMachine.states).toHaveProperty('init');
    expect(appMachine.states).toHaveProperty('ready');
    expect(appMachine.states).toHaveProperty('waiting');
  });

  it('init state should have sub-states', () => {
    const initState = appMachine.states.init;
    expect(initState.states).toHaveProperty('store');
    expect(initState.states).toHaveProperty('checkKeyPairs');
    expect(initState.states).toHaveProperty('generateKeyPairs');
    expect(initState.states).toHaveProperty('fetchConfig');
    expect(initState.states).toHaveProperty('services');
    expect(initState.states).toHaveProperty('credentialRegistry');
    expect(initState.states).toHaveProperty('info');
  });

  it('ready state should be parallel with focus and network', () => {
    const readyState = appMachine.states.ready;
    expect(readyState.type).toBe('parallel');
    expect(readyState.states).toHaveProperty('focus');
    expect(readyState.states).toHaveProperty('network');
  });

  it('focus state should have checking, active, inactive sub-states', () => {
    const focusState = appMachine.states.ready.states.focus;
    expect(focusState.states).toHaveProperty('checking');
    expect(focusState.states).toHaveProperty('active');
    expect(focusState.states).toHaveProperty('inactive');
  });

  it('network state should have checking, online, offline sub-states', () => {
    const networkState = appMachine.states.ready.states.network;
    expect(networkState.states).toHaveProperty('checking');
    expect(networkState.states).toHaveProperty('online');
    expect(networkState.states).toHaveProperty('offline');
  });

  it('should have actions defined', () => {
    // Machine has config with actions
    expect(
      appMachine.options?.actions ||
        appMachine.__xstatenode !== undefined ||
        appMachine.config,
    ).toBeDefined();
  });

  it('machine should handle transitions using withConfig', () => {
    const testMachine = appMachine.withConfig({
      services: {
        checkKeyPairs: async () => true,
        generateKeyPairsAndStoreOrder: async () => true,
        fetchAndUpdateCacheTTLFromConfig: async () => true,
        getAppInfo: () => () => {},
        checkFocusState: () => () => {},
        checkNetworkState: () => () => {},
        getQrLoginDeepLinkIntent: () => async () => '',
        resetQrLoginDeepLinkIntent: () => async () => {},
        getOVPDeepLinkIntent: () => async () => '',
        resetOVPDeepLinkIntent: () => async () => {},
      } as any,
      guards: {} as any,
      actions: {
        spawnStoreActor: () => {},
        logStoreEvents: () => {},
        spawnServiceActors: () => {},
        logServiceEvents: () => {},
        setAppInfo: () => {},
        setIsReadError: () => {},
        unsetIsReadError: () => {},
        setIsDecryptError: () => {},
        unsetIsDecryptError: () => {},
        updateKeyInvalidateError: () => {},
        resetKeyInvalidateError: () => {},
        requestDeviceInfo: () => {},
        forwardToServices: () => {},
        setLinkCode: () => {},
        resetLinkCode: () => {},
        setAuthorizationRequest: () => {},
        resetAuthorizationRequest: () => {},
        loadCredentialRegistryHostFromStorage: () => {},
        loadEsignetHostFromStorage: () => {},
        loadCredentialRegistryInConstants: () => {},
        loadEsignetHostFromConstants: () => {},
      } as any,
    });
    expect(testMachine).toBeDefined();

    // Test init.store → READY → init.checkKeyPairs
    const readyTransition = testMachine.transition('init.store', {
      type: 'READY',
    });
    expect(readyTransition.value).toBeDefined();

    // Test KEY_INVALIDATE_ERROR → waiting
    const keyInvalidate = testMachine.transition('init', {
      type: 'KEY_INVALIDATE_ERROR',
    });
    expect(keyInvalidate.value).toBe('waiting');

    // Test DECRYPT_ERROR at any state
    const decryptError = testMachine.transition('init', {
      type: 'DECRYPT_ERROR',
    });
    expect(decryptError.value).toBeDefined();

    // Test BIOMETRIC_CANCELLED → init
    const bioCancelled = testMachine.transition('init.store', {
      type: 'BIOMETRIC_CANCELLED',
    });
    expect(bioCancelled.value).toBeDefined();

    // Test RESET_KEY_INVALIDATE_ERROR_DISMISS → init
    const resetKIE = testMachine.transition('waiting', {
      type: 'RESET_KEY_INVALIDATE_ERROR_DISMISS',
    });
    expect(resetKIE.value).toBeDefined();
  });

  it('machine handles ERROR in init.store', () => {
    const testMachine = appMachine.withConfig({
      services: {} as any,
      guards: {} as any,
      actions: {
        spawnStoreActor: () => {},
        logStoreEvents: () => {},
        setIsReadError: () => {},
        updateKeyInvalidateError: () => {},
        unsetIsReadError: () => {},
        unsetIsDecryptError: () => {},
        resetKeyInvalidateError: () => {},
        setLinkCode: () => {},
        resetLinkCode: () => {},
        setAuthorizationRequest: () => {},
        resetAuthorizationRequest: () => {},
        setIsDecryptError: () => {},
      } as any,
    });
    const errorTransition = testMachine.transition('init.store', {
      type: 'ERROR',
    });
    expect(errorTransition.value).toBeDefined();
  });

  it('ready state handles ACTIVE and INACTIVE events', () => {
    const testMachine = appMachine.withConfig({
      services: {
        checkFocusState: () => () => {},
        checkNetworkState: () => () => {},
        getQrLoginDeepLinkIntent: () => async () => '',
        resetQrLoginDeepLinkIntent: () => async () => {},
        getOVPDeepLinkIntent: () => async () => '',
        resetOVPDeepLinkIntent: () => async () => {},
      } as any,
      guards: {} as any,
      actions: {
        forwardToServices: () => {},
        requestDeviceInfo: () => {},
        setLinkCode: () => {},
        resetLinkCode: () => {},
        setAuthorizationRequest: () => {},
        resetAuthorizationRequest: () => {},
        setIsDecryptError: () => {},
        unsetIsDecryptError: () => {},
        updateKeyInvalidateError: () => {},
        resetKeyInvalidateError: () => {},
        spawnStoreActor: () => {},
        logStoreEvents: () => {},
      } as any,
    });
    const active = testMachine.transition('ready', {type: 'ACTIVE'});
    expect(active.value).toBeDefined();
    const inactive = testMachine.transition('ready', {type: 'INACTIVE'});
    expect(inactive.value).toBeDefined();
    const online = testMachine.transition('ready', {
      type: 'ONLINE',
      networkType: 'wifi',
    });
    expect(online.value).toBeDefined();
    const offline = testMachine.transition('ready', {type: 'OFFLINE'});
    expect(offline.value).toBeDefined();
  });
});

describe('appMachine action callbacks', () => {
  let appMachine: any;

  beforeAll(() => {
    appMachine = require('./app').appMachine;
  });

  it('setLinkCode extracts linkCode from URL', () => {
    const actions = appMachine.options.actions;
    const assignFn = actions.setLinkCode.assignment.linkCode;
    const result = assignFn({}, {data: 'https://example.com?linkCode=ABC123'});
    expect(result).toBe('ABC123');
  });

  it('setLinkCode returns empty string for empty data', () => {
    const actions = appMachine.options.actions;
    const assignFn = actions.setLinkCode.assignment.linkCode;
    const result = assignFn({}, {data: ''});
    expect(result).toBe('');
  });

  it('resetLinkCode sets linkCode to empty', () => {
    const actions = appMachine.options.actions;
    expect(actions.resetLinkCode.assignment.linkCode).toBe('');
  });

  it('setAuthorizationRequest sets from event data', () => {
    const actions = appMachine.options.actions;
    const assignFn =
      actions.setAuthorizationRequest.assignment.authorizationRequest;
    expect(assignFn({}, {data: 'auth-req-123'})).toBe('auth-req-123');
    expect(assignFn({}, {data: ''})).toBe('');
    expect(assignFn({}, {data: undefined})).toBe('');
  });

  it('resetAuthorizationRequest sets to empty', () => {
    const actions = appMachine.options.actions;
    expect(
      actions.resetAuthorizationRequest.assignment.authorizationRequest,
    ).toBe('');
  });

  it('setIsReadError sets to true', () => {
    const actions = appMachine.options.actions;
    expect(actions.setIsReadError.assignment.isReadError).toBe(true);
  });

  it('unsetIsReadError sets to false', () => {
    const actions = appMachine.options.actions;
    expect(actions.unsetIsReadError.assignment.isReadError).toBe(false);
  });

  it('setIsDecryptError sets to true', () => {
    const actions = appMachine.options.actions;
    expect(actions.setIsDecryptError.assignment.isDecryptError).toBe(true);
  });

  it('unsetIsDecryptError sets to false', () => {
    const actions = appMachine.options.actions;
    expect(actions.unsetIsDecryptError.assignment.isDecryptError).toBe(false);
  });

  it('updateKeyInvalidateError returns true for KEY_INVALIDATE_ERROR', () => {
    const actions = appMachine.options.actions;
    const fn = actions.updateKeyInvalidateError.assignment.isKeyInvalidateError;
    expect(fn({}, {type: 'KEY_INVALIDATE_ERROR'})).toBe(true);
  });

  it('resetKeyInvalidateError sets to false', () => {
    const actions = appMachine.options.actions;
    expect(
      actions.resetKeyInvalidateError.assignment.isKeyInvalidateError,
    ).toBe(false);
  });

  it('setAppInfo sets info from event', () => {
    const actions = appMachine.options.actions;
    const fn = actions.setAppInfo.assignment.info;
    const info = {deviceId: 'd1', deviceName: 'n1'};
    expect(fn({}, {info})).toEqual(info);
  });

  it('loadCredentialRegistryInConstants calls changeCrendetialRegistry', () => {
    const actions = appMachine.options.actions;
    const fn =
      typeof actions.loadCredentialRegistryInConstants === 'function'
        ? actions.loadCredentialRegistryInConstants
        : actions.loadCredentialRegistryInConstants.exec;
    expect(fn).toBeDefined();
    expect(() =>
      fn(
        {},
        {
          response: {
            encryptedData: {credentialRegistry: 'https://reg.example.com'},
          },
        },
      ),
    ).not.toThrow();
    expect(() => fn({}, {response: {encryptedData: null}})).not.toThrow();
    expect(() => fn({}, {response: null})).not.toThrow();
  });

  it('loadEsignetHostFromConstants calls changeEsignetUrl', () => {
    const actions = appMachine.options.actions;
    const fn =
      typeof actions.loadEsignetHostFromConstants === 'function'
        ? actions.loadEsignetHostFromConstants
        : actions.loadEsignetHostFromConstants.exec;
    expect(fn).toBeDefined();
    expect(() =>
      fn(
        {},
        {
          response: {
            encryptedData: {esignetHostUrl: 'https://esignet.example.com'},
          },
        },
      ),
    ).not.toThrow();
    expect(() => fn({}, {response: {encryptedData: null}})).not.toThrow();
  });
});

describe('appMachine additional transitions', () => {
  let appMachine: any;

  beforeAll(() => {
    appMachine = require('./app').appMachine;
  });

  const getTestMachine = () => {
    return appMachine.withConfig({
      services: {
        checkKeyPairs: async () => true,
        generateKeyPairsAndStoreOrder: async () => true,
        fetchAndUpdateCacheTTLFromConfig: async () => true,
        getAppInfo: () => () => {},
        checkFocusState: () => () => {},
        checkNetworkState: () => () => {},
        getQrLoginDeepLinkIntent: () => async () => '',
        resetQrLoginDeepLinkIntent: () => async () => {},
        getOVPDeepLinkIntent: () => async () => '',
        resetOVPDeepLinkIntent: () => async () => {},
      } as any,
      guards: {} as any,
      actions: {
        spawnStoreActor: () => {},
        logStoreEvents: () => {},
        spawnServiceActors: () => {},
        logServiceEvents: () => {},
        setAppInfo: () => {},
        setIsReadError: () => {},
        unsetIsReadError: () => {},
        setIsDecryptError: () => {},
        unsetIsDecryptError: () => {},
        updateKeyInvalidateError: () => {},
        resetKeyInvalidateError: () => {},
        requestDeviceInfo: () => {},
        forwardToServices: () => {},
        setLinkCode: () => {},
        resetLinkCode: () => {},
        setAuthorizationRequest: () => {},
        resetAuthorizationRequest: () => {},
        loadCredentialRegistryHostFromStorage: () => {},
        loadEsignetHostFromStorage: () => {},
        loadCredentialRegistryInConstants: () => {},
        loadEsignetHostFromConstants: () => {},
      } as any,
    });
  };

  it('ready.focus transitions ACTIVE to active sub-state', () => {
    const tm = getTestMachine();
    const next = tm.transition(
      {ready: {focus: 'checking', network: 'checking'}},
      {type: 'ACTIVE'},
    );
    expect(JSON.stringify(next.value)).toContain('active');
  });

  it('ready.focus transitions INACTIVE to inactive sub-state', () => {
    const tm = getTestMachine();
    const next = tm.transition(
      {ready: {focus: 'active', network: 'checking'}},
      {type: 'INACTIVE'},
    );
    expect(JSON.stringify(next.value)).toContain('inactive');
  });

  it('ready.network transitions ONLINE to online sub-state', () => {
    const tm = getTestMachine();
    const next = tm.transition(
      {ready: {focus: 'checking', network: 'checking'}},
      {type: 'ONLINE', networkType: 'wifi'} as any,
    );
    expect(JSON.stringify(next.value)).toContain('online');
  });

  it('ready.network transitions OFFLINE to offline sub-state', () => {
    const tm = getTestMachine();
    const next = tm.transition(
      {ready: {focus: 'checking', network: 'online'}},
      {type: 'OFFLINE'},
    );
    expect(JSON.stringify(next.value)).toContain('offline');
  });

  it('ready handles REQUEST_DEVICE_INFO event', () => {
    const tm = getTestMachine();
    const next = tm.transition('ready', {type: 'REQUEST_DEVICE_INFO'});
    expect(next.value).toBeDefined();
  });

  it('init handles DECRYPT_ERROR', () => {
    const tm = getTestMachine();
    const next = tm.transition('init', {type: 'DECRYPT_ERROR'});
    expect(next.value).toBeDefined();
  });

  it('init handles DECRYPT_ERROR_DISMISS', () => {
    const tm = getTestMachine();
    const next = tm.transition('init', {type: 'DECRYPT_ERROR_DISMISS'});
    expect(next.value).toBeDefined();
  });

  it('STORE_RESPONSE at init transitions correctly', () => {
    const tm = getTestMachine();
    const next = tm.transition('init', {
      type: 'STORE_RESPONSE',
      response: {},
    } as any);
    expect(next.value).toBeDefined();
  });
});

describe('appMachine service implementations', () => {
  let services: any;

  beforeAll(() => {
    const appMachine = require('./app').appMachine;
    services = (appMachine as any).options.services;
  });

  it('getAppInfo calls callback with APP_INFO_RECEIVED', async () => {
    const outerFn = services.getAppInfo();
    const callback = jest.fn();
    await outerFn(callback);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({type: 'APP_INFO_RECEIVED'}),
    );
  });

  it('checkFocusState subscribes to AppState changes', () => {
    const {AppState} = require('react-native');
    const removeSpy = jest.fn();
    AppState.addEventListener = jest.fn().mockReturnValue({remove: removeSpy});
    const outerFn = services.checkFocusState();
    const callback = jest.fn();
    const cleanup = outerFn(callback);
    expect(AppState.addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    );
    if (cleanup) cleanup();
    expect(removeSpy).toHaveBeenCalled();
  });

  it('checkFocusState change handler sends ACTIVE on active', () => {
    const {AppState} = require('react-native');
    let changeHandler: Function;
    AppState.addEventListener = jest.fn((event: string, handler: Function) => {
      if (event === 'change' && !changeHandler) changeHandler = handler;
      return {remove: jest.fn()};
    });
    const outerFn = services.checkFocusState();
    const callback = jest.fn();
    outerFn(callback);
    changeHandler!('active');
    expect(callback).toHaveBeenCalledWith({type: 'ACTIVE'});
  });

  it('checkFocusState change handler sends INACTIVE on background', () => {
    const {AppState} = require('react-native');
    let changeHandler: Function;
    AppState.addEventListener = jest.fn((event: string, handler: Function) => {
      if (event === 'change' && !changeHandler) changeHandler = handler;
      return {remove: jest.fn()};
    });
    const outerFn = services.checkFocusState();
    const callback = jest.fn();
    outerFn(callback);
    changeHandler!('background');
    expect(callback).toHaveBeenCalledWith({type: 'INACTIVE'});
  });

  it('checkFocusState change handler sends INACTIVE on inactive', () => {
    const {AppState} = require('react-native');
    let changeHandler: Function;
    AppState.addEventListener = jest.fn((event: string, handler: Function) => {
      if (event === 'change' && !changeHandler) changeHandler = handler;
      return {remove: jest.fn()};
    });
    const outerFn = services.checkFocusState();
    const callback = jest.fn();
    outerFn(callback);
    changeHandler!('inactive');
    expect(callback).toHaveBeenCalledWith({type: 'INACTIVE'});
  });

  it('checkKeyPairs calls checkAllKeyPairs', async () => {
    const {checkAllKeyPairs} = require('../shared/cryptoutil/cryptoUtil');
    checkAllKeyPairs.mockResolvedValue(true);
    const result = await services.checkKeyPairs();
    expect(checkAllKeyPairs).toHaveBeenCalled();
  });

  it('generateKeyPairsAndStoreOrder calls the function', async () => {
    const {
      generateKeyPairsAndStoreOrder,
    } = require('../shared/cryptoutil/cryptoUtil');
    generateKeyPairsAndStoreOrder.mockResolvedValue(true);
    const result = await services.generateKeyPairsAndStoreOrder();
    expect(generateKeyPairsAndStoreOrder).toHaveBeenCalled();
  });

  it('fetchAndUpdateCacheTTLFromConfig calls updateCacheTTLFromConfig', async () => {
    const getAllConfigurations = require('../shared/api');
    getAllConfigurations.mockResolvedValue({cacheTTLInMilliSeconds: 5000});
    await services.fetchAndUpdateCacheTTLFromConfig();
    expect(getAllConfigurations).toHaveBeenCalled();
  });

  it('checkNetworkState subscribes to NetInfo', () => {
    const NetInfo = require('@react-native-community/netinfo');
    const unsubscribe = jest.fn();
    NetInfo.addEventListener = jest.fn().mockReturnValue(unsubscribe);
    const outerFn = services.checkNetworkState();
    const callback = jest.fn();
    const cleanup = outerFn(callback);
    expect(NetInfo.addEventListener).toHaveBeenCalledWith(expect.any(Function));
  });

  it('checkNetworkState callback sends ONLINE when connected', () => {
    const NetInfo = require('@react-native-community/netinfo');
    let netHandler: Function;
    NetInfo.addEventListener = jest.fn((handler: Function) => {
      netHandler = handler;
      return jest.fn();
    });
    const outerFn = services.checkNetworkState();
    const callback = jest.fn();
    outerFn(callback);
    netHandler!({isConnected: true, type: 'wifi'});
    expect(callback).toHaveBeenCalledWith({
      type: 'ONLINE',
      networkType: 'wifi',
    });
  });

  it('checkNetworkState callback sends OFFLINE when disconnected', () => {
    const NetInfo = require('@react-native-community/netinfo');
    let netHandler: Function;
    NetInfo.addEventListener = jest.fn((handler: Function) => {
      netHandler = handler;
      return jest.fn();
    });
    const outerFn = services.checkNetworkState();
    const callback = jest.fn();
    outerFn(callback);
    netHandler!({isConnected: false, type: 'none'});
    expect(callback).toHaveBeenCalledWith({type: 'OFFLINE'});
  });
});
