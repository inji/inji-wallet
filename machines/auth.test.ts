import {
  AuthEvents,
  selectPasscode,
  selectPasscodeSalt,
  selectBiometrics,
  selectCanUseBiometrics,
  selectIsOnboarding,
  selectIsInitialDownload,
  selectIsTourGuide,
  selectAuthorized,
  selectUnauthorized,
  selectSettingUp,
  selectLanguagesetup,
  selectIntroSlider,
  selectIsBiometricToggleFromSettings,
  selectAppSetupComplete,
  createAuthMachine,
  authMachine,
} from './auth';

const mockState = (ctx: any = {}, matchVal?: string) => ({
  context: {
    passcode: '',
    passcodeSalt: '',
    biometrics: '',
    canUseBiometrics: false,
    selectLanguage: false,
    toggleFromSettings: false,
    isOnboarding: true,
    isInitialDownload: true,
    isTourGuide: false,
    isAppSetupComplete: false,
    ...ctx,
  },
  matches: (v: string) => v === matchVal,
});

describe('auth selectors', () => {
  it('selectPasscode', () =>
    expect(selectPasscode(mockState({passcode: '1234'}) as any)).toBe('1234'));
  it('selectPasscode default', () =>
    expect(selectPasscode(mockState() as any)).toBe(''));
  it('selectPasscodeSalt', () =>
    expect(selectPasscodeSalt(mockState({passcodeSalt: 's'}) as any)).toBe(
      's',
    ));
  it('selectPasscodeSalt default', () =>
    expect(selectPasscodeSalt(mockState() as any)).toBe(''));
  it('selectBiometrics', () =>
    expect(selectBiometrics(mockState({biometrics: 'fp'}) as any)).toBe('fp'));
  it('selectBiometrics default', () =>
    expect(selectBiometrics(mockState() as any)).toBe(''));
  it('selectCanUseBiometrics true', () =>
    expect(
      selectCanUseBiometrics(mockState({canUseBiometrics: true}) as any),
    ).toBe(true));
  it('selectCanUseBiometrics false', () =>
    expect(selectCanUseBiometrics(mockState() as any)).toBe(false));
  it('selectIsOnboarding true', () =>
    expect(selectIsOnboarding(mockState() as any)).toBe(true));
  it('selectIsOnboarding false', () =>
    expect(selectIsOnboarding(mockState({isOnboarding: false}) as any)).toBe(
      false,
    ));
  it('selectIsInitialDownload false', () =>
    expect(
      selectIsInitialDownload(mockState({isInitialDownload: false}) as any),
    ).toBe(false));
  it('selectIsInitialDownload default', () =>
    expect(selectIsInitialDownload(mockState() as any)).toBe(true));
  it('selectIsTourGuide true', () =>
    expect(selectIsTourGuide(mockState({isTourGuide: true}) as any)).toBe(
      true,
    ));
  it('selectIsTourGuide default', () =>
    expect(selectIsTourGuide(mockState() as any)).toBe(false));
  it('selectAuthorized true', () =>
    expect(selectAuthorized(mockState({}, 'authorized') as any)).toBe(true));
  it('selectAuthorized false', () =>
    expect(selectAuthorized(mockState({}, 'idle') as any)).toBe(false));
  it('selectUnauthorized true', () =>
    expect(selectUnauthorized(mockState({}, 'unauthorized') as any)).toBe(
      true,
    ));
  it('selectUnauthorized false', () =>
    expect(selectUnauthorized(mockState({}, 'authorized') as any)).toBe(false));
  it('selectSettingUp true', () =>
    expect(selectSettingUp(mockState({}, 'settingUp') as any)).toBe(true));
  it('selectSettingUp false', () =>
    expect(selectSettingUp(mockState({}, 'authorized') as any)).toBe(false));
  it('selectLanguagesetup true', () =>
    expect(selectLanguagesetup(mockState({}, 'languagesetup') as any)).toBe(
      true,
    ));
  it('selectLanguagesetup false', () =>
    expect(selectLanguagesetup(mockState({}, 'authorized') as any)).toBe(
      false,
    ));
  it('selectIntroSlider true', () =>
    expect(selectIntroSlider(mockState({}, 'introSlider') as any)).toBe(true));
  it('selectIntroSlider false', () =>
    expect(selectIntroSlider(mockState({}, 'authorized') as any)).toBe(false));
  it('selectIsBiometricToggleFromSettings when settingUp', () =>
    expect(
      selectIsBiometricToggleFromSettings(
        mockState({toggleFromSettings: true}, 'settingUp') as any,
      ),
    ).toBe(true));
  it('selectIsBiometricToggleFromSettings when not settingUp', () =>
    expect(
      selectIsBiometricToggleFromSettings(
        mockState({toggleFromSettings: true}, 'authorized') as any,
      ),
    ).toBe(false));
  it('selectIsBiometricToggleFromSettings settingUp but toggle false', () =>
    expect(
      selectIsBiometricToggleFromSettings(
        mockState({toggleFromSettings: false}, 'settingUp') as any,
      ),
    ).toBe(false));
  it('selectAppSetupComplete true', () =>
    expect(
      selectAppSetupComplete(mockState({isAppSetupComplete: true}) as any),
    ).toBe(true));
  it('selectAppSetupComplete default', () =>
    expect(selectAppSetupComplete(mockState() as any)).toBe(false));
  it('createAuthMachine is a function', () =>
    expect(typeof createAuthMachine).toBe('function'));
});

describe('AuthEvents', () => {
  it('should create SETUP_PASSCODE event', () => {
    expect(AuthEvents.SETUP_PASSCODE('1234')).toEqual({
      type: 'SETUP_PASSCODE',
      passcode: '1234',
    });
  });
  it('SETUP_PASSCODE with different value', () => {
    expect(AuthEvents.SETUP_PASSCODE('9999')).toEqual({
      type: 'SETUP_PASSCODE',
      passcode: '9999',
    });
  });
  it('should create SETUP_BIOMETRICS event', () => {
    expect(AuthEvents.SETUP_BIOMETRICS('bio')).toEqual({
      type: 'SETUP_BIOMETRICS',
      biometrics: 'bio',
    });
  });
  it('SETUP_BIOMETRICS with face', () => {
    expect(AuthEvents.SETUP_BIOMETRICS('face')).toEqual({
      type: 'SETUP_BIOMETRICS',
      biometrics: 'face',
    });
  });
  it('should create CHANGE_METHOD event', () => {
    expect(AuthEvents.CHANGE_METHOD(true)).toEqual({
      type: 'CHANGE_METHOD',
      isToggleFromSettings: true,
    });
  });
  it('CHANGE_METHOD false', () => {
    expect(AuthEvents.CHANGE_METHOD(false)).toEqual({
      type: 'CHANGE_METHOD',
      isToggleFromSettings: false,
    });
  });
  it('should create LOGOUT event', () => {
    expect(AuthEvents.LOGOUT()).toEqual({type: 'LOGOUT'});
  });
  it('should create LOGIN event', () => {
    expect(AuthEvents.LOGIN()).toEqual({type: 'LOGIN'});
  });
  it('should create STORE_RESPONSE event', () => {
    expect(AuthEvents.STORE_RESPONSE({data: 'x'})).toEqual({
      type: 'STORE_RESPONSE',
      response: {data: 'x'},
    });
  });
  it('STORE_RESPONSE undefined', () => {
    expect(AuthEvents.STORE_RESPONSE()).toEqual({
      type: 'STORE_RESPONSE',
      response: undefined,
    });
  });
  it('should create SELECT event', () => {
    expect(AuthEvents.SELECT()).toEqual({type: 'SELECT'});
  });
  it('should create NEXT event', () => {
    expect(AuthEvents.NEXT()).toEqual({type: 'NEXT'});
  });
  it('should create ONBOARDING_DONE event', () => {
    expect(AuthEvents.ONBOARDING_DONE()).toEqual({type: 'ONBOARDING_DONE'});
  });
  it('should create INITIAL_DOWNLOAD_DONE event', () => {
    expect(AuthEvents.INITIAL_DOWNLOAD_DONE()).toEqual({
      type: 'INITIAL_DOWNLOAD_DONE',
    });
  });
  it('should create SET_TOUR_GUIDE event', () => {
    expect(AuthEvents.SET_TOUR_GUIDE(true)).toEqual({
      type: 'SET_TOUR_GUIDE',
      set: true,
    });
  });
  it('SET_TOUR_GUIDE false', () => {
    expect(AuthEvents.SET_TOUR_GUIDE(false)).toEqual({
      type: 'SET_TOUR_GUIDE',
      set: false,
    });
  });
  it('should create BIOMETRIC_CANCELLED event', () => {
    expect(AuthEvents.BIOMETRIC_CANCELLED()).toEqual({
      type: 'BIOMETRIC_CANCELLED',
    });
  });
});

describe('authMachine definition', () => {
  it('should export authMachine', () => {
    expect(authMachine).toBeDefined();
    expect(authMachine.id).toBe('auth');
  });

  it('should have correct initial state', () => {
    expect(authMachine.initialState.value).toBe('init');
  });

  it('should have correct initial context', () => {
    const ctx = authMachine.initialState.context;
    expect(ctx.passcode).toBe('');
    expect(ctx.passcodeSalt).toBe('');
    expect(ctx.biometrics).toBe('');
    expect(ctx.canUseBiometrics).toBe(false);
    expect(ctx.selectLanguage).toBe(false);
    expect(ctx.toggleFromSettings).toBe(false);
    expect(ctx.isOnboarding).toBe(true);
    expect(ctx.isInitialDownload).toBe(true);
    expect(ctx.isTourGuide).toBe(false);
    expect(ctx.isAppSetupComplete).toBe(false);
  });

  it('should have all expected states', () => {
    const config = authMachine.config;
    expect(config.states).toHaveProperty('init');
    expect(config.states).toHaveProperty('savingDefaults');
    expect(config.states).toHaveProperty('checkingAuth');
    expect(config.states).toHaveProperty('languagesetup');
    expect(config.states).toHaveProperty('introSlider');
    expect(config.states).toHaveProperty('settingUp');
    expect(config.states).toHaveProperty('unauthorized');
    expect(config.states).toHaveProperty('authorized');
  });

  it('languagesetup transitions to introSlider on SELECT', () => {
    const machine = authMachine.withConfig({
      services: {} as any,
      actions: {
        requestStoredContext: () => {},
        storeContext: () => {},
        setContext: () => {},
        setPasscode: () => {},
        setBiometrics: () => {},
        setLanguage: () => {},
        setAppSetupComplete: () => {},
        setPasscodeSalt: () => {},
        setOnboardingDone: () => {},
        setInitialDownloadDone: () => {},
        setTourGuide: () => {},
        setIsToggleFromSettings: () => {},
      } as any,
    });
    const next = machine.transition('languagesetup', {type: 'SELECT'});
    expect(next.value).toBe('introSlider');
  });

  it('introSlider transitions to settingUp on NEXT', () => {
    const machine = authMachine.withConfig({
      services: {
        generatePasscodeSalt: () => Promise.resolve('salt'),
        initializeFaceSdkModel: () => () => {},
      } as any,
      actions: {
        requestStoredContext: () => {},
        storeContext: () => {},
        setContext: () => {},
        setPasscode: () => {},
        setBiometrics: () => {},
        setLanguage: () => {},
        setAppSetupComplete: () => {},
        setPasscodeSalt: () => {},
        setOnboardingDone: () => {},
        setInitialDownloadDone: () => {},
        setTourGuide: () => {},
        setIsToggleFromSettings: () => {},
      } as any,
    });
    const next = machine.transition('introSlider', {type: 'NEXT'});
    expect(next.value).toBe('settingUp');
  });

  it('settingUp transitions to authorized on SETUP_PASSCODE', () => {
    const machine = authMachine.withConfig({
      services: {
        generatePasscodeSalt: () => Promise.resolve('salt'),
        initializeFaceSdkModel: () => () => {},
      } as any,
      actions: {
        requestStoredContext: () => {},
        storeContext: () => {},
        setContext: () => {},
        setPasscode: () => {},
        setBiometrics: () => {},
        setLanguage: () => {},
        setAppSetupComplete: () => {},
        setPasscodeSalt: () => {},
        setOnboardingDone: () => {},
        setInitialDownloadDone: () => {},
        setTourGuide: () => {},
        setIsToggleFromSettings: () => {},
      } as any,
    });
    const next = machine.transition('settingUp', {
      type: 'SETUP_PASSCODE',
      passcode: '1234',
    });
    expect(next.value).toBe('authorized');
  });

  it('settingUp transitions to authorized on SETUP_BIOMETRICS', () => {
    const machine = authMachine.withConfig({
      services: {
        generatePasscodeSalt: () => Promise.resolve('salt'),
        initializeFaceSdkModel: () => () => {},
      } as any,
      actions: {
        requestStoredContext: () => {},
        storeContext: () => {},
        setContext: () => {},
        setPasscode: () => {},
        setBiometrics: () => {},
        setLanguage: () => {},
        setAppSetupComplete: () => {},
        setPasscodeSalt: () => {},
        setOnboardingDone: () => {},
        setInitialDownloadDone: () => {},
        setTourGuide: () => {},
        setIsToggleFromSettings: () => {},
      } as any,
    });
    const next = machine.transition('settingUp', {
      type: 'SETUP_BIOMETRICS',
      biometrics: 'face',
    });
    expect(next.value).toBe('authorized');
  });

  it('unauthorized transitions to authorized on LOGIN', () => {
    const machine = authMachine.withConfig({
      services: {
        generatePasscodeSalt: () => Promise.resolve('salt'),
        initializeFaceSdkModel: () => () => {},
      } as any,
      actions: {
        requestStoredContext: () => {},
        storeContext: () => {},
        setContext: () => {},
        setPasscode: () => {},
        setBiometrics: () => {},
        setLanguage: () => {},
        setAppSetupComplete: () => {},
        setPasscodeSalt: () => {},
        setOnboardingDone: () => {},
        setInitialDownloadDone: () => {},
        setTourGuide: () => {},
        setIsToggleFromSettings: () => {},
      } as any,
    });
    const next = machine.transition('unauthorized', {type: 'LOGIN'});
    expect(next.value).toBe('authorized');
  });

  it('authorized transitions to unauthorized on LOGOUT', () => {
    const machine = authMachine.withConfig({
      services: {
        generatePasscodeSalt: () => Promise.resolve('salt'),
        initializeFaceSdkModel: () => () => {},
      } as any,
      actions: {
        requestStoredContext: () => {},
        storeContext: () => {},
        setContext: () => {},
        setPasscode: () => {},
        setBiometrics: () => {},
        setLanguage: () => {},
        setAppSetupComplete: () => {},
        setPasscodeSalt: () => {},
        setOnboardingDone: () => {},
        setInitialDownloadDone: () => {},
        setTourGuide: () => {},
        setIsToggleFromSettings: () => {},
      } as any,
    });
    const next = machine.transition('authorized', {type: 'LOGOUT'});
    expect(next.value).toBe('unauthorized');
  });

  it('authorized transitions to settingUp on CHANGE_METHOD', () => {
    const machine = authMachine.withConfig({
      services: {
        generatePasscodeSalt: () => Promise.resolve('salt'),
        initializeFaceSdkModel: () => () => {},
      } as any,
      actions: {
        requestStoredContext: () => {},
        storeContext: () => {},
        setContext: () => {},
        setPasscode: () => {},
        setBiometrics: () => {},
        setLanguage: () => {},
        setAppSetupComplete: () => {},
        setPasscodeSalt: () => {},
        setOnboardingDone: () => {},
        setInitialDownloadDone: () => {},
        setTourGuide: () => {},
        setIsToggleFromSettings: () => {},
      } as any,
    });
    const next = machine.transition('authorized', {
      type: 'CHANGE_METHOD',
      isToggleFromSettings: true,
    });
    expect(next.value).toBe('settingUp');
  });

  it('checkingAuth goes to languagesetup when hasLanguageset', () => {
    const machine = authMachine.withConfig({
      services: {} as any,
      actions: {
        requestStoredContext: () => {},
        storeContext: () => {},
        setContext: () => {},
        setPasscode: () => {},
        setBiometrics: () => {},
        setLanguage: () => {},
        setAppSetupComplete: () => {},
        setPasscodeSalt: () => {},
        setOnboardingDone: () => {},
        setInitialDownloadDone: () => {},
        setTourGuide: () => {},
        setIsToggleFromSettings: () => {},
      } as any,
      guards: {
        hasData: () => false,
        hasPasscodeSet: () => false,
        hasBiometricSet: () => false,
        hasLanguageset: () => true,
      },
    });
    const next = machine.transition('checkingAuth', {
      type: 'xstate.init' as any,
    });
    expect(next.value).toBe('languagesetup');
  });

  it('checkingAuth goes to unauthorized when hasPasscodeSet', () => {
    const machine = authMachine.withConfig({
      services: {} as any,
      actions: {
        requestStoredContext: () => {},
        storeContext: () => {},
        setContext: () => {},
        setPasscode: () => {},
        setBiometrics: () => {},
        setLanguage: () => {},
        setAppSetupComplete: () => {},
        setPasscodeSalt: () => {},
        setOnboardingDone: () => {},
        setInitialDownloadDone: () => {},
        setTourGuide: () => {},
        setIsToggleFromSettings: () => {},
      } as any,
      guards: {
        hasData: () => false,
        hasPasscodeSet: () => true,
        hasBiometricSet: () => false,
        hasLanguageset: () => false,
      },
    });
    const next = machine.transition('checkingAuth', {
      type: 'xstate.init' as any,
    });
    expect(next.value).toBe('unauthorized');
  });

  it('checkingAuth goes to settingUp when no guards match', () => {
    const machine = authMachine.withConfig({
      services: {} as any,
      actions: {
        requestStoredContext: () => {},
        storeContext: () => {},
        setContext: () => {},
        setPasscode: () => {},
        setBiometrics: () => {},
        setLanguage: () => {},
        setAppSetupComplete: () => {},
        setPasscodeSalt: () => {},
        setOnboardingDone: () => {},
        setInitialDownloadDone: () => {},
        setTourGuide: () => {},
        setIsToggleFromSettings: () => {},
      } as any,
      guards: {
        hasData: () => false,
        hasPasscodeSet: () => false,
        hasBiometricSet: () => false,
        hasLanguageset: () => false,
      },
    });
    const next = machine.transition('checkingAuth', {
      type: 'xstate.init' as any,
    });
    expect(next.value).toBe('settingUp');
  });

  it('createAuthMachine returns machine with serviceRefs in context', () => {
    const mockServiceRefs = {store: {send: jest.fn()}} as any;
    const machine = createAuthMachine(mockServiceRefs);
    expect(machine.context.serviceRefs).toBe(mockServiceRefs);
    expect(machine.context.passcode).toBe('');
  });
});

describe('auth action implementations', () => {
  const options = authMachine.options as any;

  it('setAppSetupComplete sets isAppSetupComplete to true', () => {
    const result =
      options.actions.setAppSetupComplete.assignment.isAppSetupComplete({
        isAppSetupComplete: false,
      });
    expect(result).toBe(true);
  });

  it('setIsToggleFromSettings uses event value', () => {
    const result =
      options.actions.setIsToggleFromSettings.assignment.toggleFromSettings(
        {},
        {isToggleFromSettings: true},
      );
    expect(result).toBe(true);
  });

  it('setIsToggleFromSettings with false', () => {
    const result =
      options.actions.setIsToggleFromSettings.assignment.toggleFromSettings(
        {},
        {isToggleFromSettings: false},
      );
    expect(result).toBe(false);
  });

  it('storeContext is defined as a send action', () => {
    const action = options.actions.storeContext;
    expect(action).toBeDefined();
    expect(action.type).toBeDefined();
  });

  it('storeContext opts.to returns store service ref', () => {
    const store = {send: jest.fn()};
    const ctx = {serviceRefs: {store}};
    const action = options.actions.storeContext;
    const toFn = action.opts?.to || action.to;
    expect(typeof toFn).toBe('function');
    expect(toFn(ctx)).toBe(store);
  });

  it('setContext uses event response data', () => {
    const assignFn = options.actions.setContext.assignment;
    const event = {
      response: {
        passcode: '5678',
        passcodeSalt: 'salt',
        biometrics: 'face',
        serviceRefs: {},
      },
    };
    const result = typeof assignFn === 'function' ? assignFn({}, event) : null;
    expect(result).toBeTruthy();
    expect(result.passcode).toBe('5678');
    expect(result.passcodeSalt).toBe('salt');
    expect(result.biometrics).toBe('face');
    expect(result).not.toHaveProperty('serviceRefs');
  });

  it('setPasscode uses event passcode', () => {
    const result = options.actions.setPasscode.assignment.passcode(
      {},
      {passcode: 'abcd'},
    );
    expect(result).toBe('abcd');
  });

  it('setBiometrics uses event biometrics', () => {
    const result = options.actions.setBiometrics.assignment.biometrics(
      {},
      {biometrics: 'fingerprint'},
    );
    expect(result).toBe('fingerprint');
  });

  it('setLanguage sets selectLanguage to true', () => {
    const result = options.actions.setLanguage.assignment.selectLanguage({
      selectLanguage: false,
    });
    expect(result).toBe(true);
  });

  it('setPasscodeSalt uses event data', () => {
    const result = options.actions.setPasscodeSalt.assignment.passcodeSalt(
      {},
      {data: 'randomSalt'},
    );
    expect(result).toBe('randomSalt');
  });

  it('setOnboardingDone sets isOnboarding to false', () => {
    const result = options.actions.setOnboardingDone.assignment.isOnboarding({
      isOnboarding: true,
    });
    expect(result).toBe(false);
  });

  it('setInitialDownloadDone sets isInitialDownload to false', () => {
    const result =
      options.actions.setInitialDownloadDone.assignment.isInitialDownload({
        isInitialDownload: true,
      });
    expect(result).toBe(false);
  });

  it('setTourGuide uses event set value', () => {
    const result = options.actions.setTourGuide.assignment.isTourGuide(
      {},
      {set: true},
    );
    expect(result).toBe(true);
  });

  it('setTourGuide with false', () => {
    const result = options.actions.setTourGuide.assignment.isTourGuide(
      {},
      {set: false},
    );
    expect(result).toBe(false);
  });

  it('requestStoredContext sends GET auth event', () => {
    const action = options.actions.requestStoredContext;
    expect(action).toBeDefined();
    const toFn = action.opts?.to || action.to;
    expect(toFn).toBeDefined();
    const store = {send: jest.fn()};
    const ctx = {serviceRefs: {store}};
    expect(toFn(ctx)).toBe(store);
  });
});

describe('auth guard implementations', () => {
  const guards = authMachine.options.guards as any;

  it('hasData returns true when event response is not null', () => {
    expect(guards.hasData({}, {response: {passcode: '1234'}})).toBe(true);
  });

  it('hasData returns false when event response is null', () => {
    expect(guards.hasData({}, {response: null})).toBe(false);
  });

  it('hasData returns false when event response is undefined', () => {
    expect(guards.hasData({}, {response: undefined})).toBe(false);
  });

  it('hasPasscodeSet returns true when passcode is set', () => {
    expect(guards.hasPasscodeSet({passcode: '1234'})).toBe(true);
  });

  it('hasPasscodeSet returns false when passcode is empty', () => {
    expect(guards.hasPasscodeSet({passcode: ''})).toBe(false);
  });

  it('hasBiometricSet returns true when biometrics is set', () => {
    expect(guards.hasBiometricSet({biometrics: 'fingerprint'})).toBe(true);
  });

  it('hasBiometricSet returns false when biometrics is empty', () => {
    expect(guards.hasBiometricSet({biometrics: ''})).toBe(false);
  });

  it('hasLanguageset returns true when selectLanguage is false', () => {
    expect(guards.hasLanguageset({selectLanguage: false})).toBe(true);
  });

  it('hasLanguageset returns false when selectLanguage is true', () => {
    expect(guards.hasLanguageset({selectLanguage: true})).toBe(false);
  });
});

describe('auth service implementations', () => {
  const services = authMachine.options.services as any;

  it('initializeFaceSdkModel returns a cleanup function', () => {
    const result = services.initializeFaceSdkModel();
    expect(typeof result).toBe('function');
  });

  it('generatePasscodeSalt returns an async function', () => {
    const outerFn = services.generatePasscodeSalt();
    expect(typeof outerFn).toBe('function');
  });
});
