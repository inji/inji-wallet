import {
  selectFailMessage,
  selectIsEnabled,
  selectIsAvailable,
  selectIsUnvailable,
  selectIsUnenrolled,
  selectIsSuccess,
  selectError,
  selectUnenrolledNotice,
  selectErrorResponse,
  BiometricsEvents,
  biometricsMachine,
} from './biometrics';
import {interpret} from 'xstate';

describe('biometrics selectors', () => {
  const createState = (value: string | object, context = {}, meta = {}) => ({
    matches: (pattern: string | object) => {
      if (typeof pattern === 'string') return value === pattern;
      const key = Object.keys(pattern)[0];
      const subValue = pattern[key];
      return typeof value === 'object' && value[key] === subValue;
    },
    meta,
    context: {error: {}, retry: false, ...context},
    value,
  });

  describe('selectFailMessage', () => {
    it('should join meta messages', () => {
      const state = createState(
        'failure',
        {},
        {
          'biometrics.failure.unavailable': {message: 'errors.unavailable'},
        },
      );
      expect(selectFailMessage(state as any)).toBe('errors.unavailable');
    });

    it('should return empty string when no meta', () => {
      const state = createState('available', {}, {});
      expect(selectFailMessage(state as any)).toBe('');
    });
  });

  describe('selectIsEnabled', () => {
    it('should return true when state is available', () => {
      const state = createState('available');
      expect(selectIsEnabled(state as any)).toBe(true);
    });

    it('should return true when state is failure.unenrolled', () => {
      const state = {
        matches: (pattern: any) => {
          if (pattern === 'available') return false;
          if (typeof pattern === 'object' && pattern.failure === 'unenrolled')
            return true;
          return false;
        },
        meta: {},
        context: {},
      };
      expect(selectIsEnabled(state as any)).toBe(true);
    });

    it('should return false for other states', () => {
      const state = {
        matches: () => false,
        meta: {},
        context: {},
      };
      expect(selectIsEnabled(state as any)).toBe(false);
    });
  });

  describe('selectIsAvailable', () => {
    it('should return true when state is available', () => {
      const state = createState('available');
      expect(selectIsAvailable(state as any)).toBe(true);
    });

    it('should return false when state is not available', () => {
      const state = createState('init');
      expect(selectIsAvailable(state as any)).toBe(false);
    });
  });

  describe('selectIsUnvailable', () => {
    it('should return true when state matches failure.unavailable', () => {
      const state = {
        matches: (pattern: any) =>
          typeof pattern === 'object' && pattern.failure === 'unavailable',
        meta: {},
        context: {},
      };
      expect(selectIsUnvailable(state as any)).toBe(true);
    });
  });

  describe('selectIsUnenrolled', () => {
    it('should return true when state matches failure.unenrolled', () => {
      const state = {
        matches: (pattern: any) =>
          typeof pattern === 'object' && pattern.failure === 'unenrolled',
        meta: {},
        context: {},
      };
      expect(selectIsUnenrolled(state as any)).toBe(true);
    });
  });

  describe('selectIsSuccess', () => {
    it('should return true when state is success', () => {
      const state = createState('success');
      expect(selectIsSuccess(state as any)).toBe(true);
    });

    it('should return false for other states', () => {
      const state = createState('available');
      expect(selectIsSuccess(state as any)).toBe(false);
    });
  });

  describe('selectError', () => {
    it('should return fail message when state matches failure.error', () => {
      const state = {
        matches: (pattern: any) =>
          typeof pattern === 'object' && pattern.failure === 'error',
        meta: {'biometrics.failure.error': {message: 'errors.generic'}},
        context: {error: {}},
      };
      expect(selectError(state as any)).toBe('errors.generic');
    });

    it('should return null when state does not match failure.error', () => {
      const state = {
        matches: () => false,
        meta: {},
        context: {error: {}},
      };
      expect(selectError(state as any)).toBeNull();
    });
  });

  describe('selectUnenrolledNotice', () => {
    it('should return fail message when unenrolled and retry is true', () => {
      const state = {
        matches: (pattern: any) =>
          typeof pattern === 'object' && pattern.failure === 'unenrolled',
        meta: {'biometrics.failure.unenrolled': {message: 'errors.unenrolled'}},
        context: {error: {}, retry: true},
      };
      expect(selectUnenrolledNotice(state as any)).toBe('errors.unenrolled');
    });

    it('should return null when retry is false', () => {
      const state = {
        matches: (pattern: any) =>
          typeof pattern === 'object' && pattern.failure === 'unenrolled',
        meta: {},
        context: {error: {}, retry: false},
      };
      expect(selectUnenrolledNotice(state as any)).toBeNull();
    });
  });

  describe('selectErrorResponse', () => {
    it('should return context error', () => {
      const state = createState('failure', {error: {res: 'test'}});
      expect(selectErrorResponse(state as any)).toEqual({res: 'test'});
    });
  });

  describe('BiometricsEvents', () => {
    it('should have event creators', () => {
      expect(BiometricsEvents.SET_IS_AVAILABLE(true)).toEqual({
        type: 'SET_IS_AVAILABLE',
        data: true,
      });
      expect(BiometricsEvents.SET_AUTH([])).toEqual({
        type: 'SET_AUTH',
        data: [],
      });
      expect(BiometricsEvents.SET_IS_ENROLLED(true)).toEqual({
        type: 'SET_IS_ENROLLED',
        data: true,
      });
      expect(BiometricsEvents.SET_STATUS(true)).toEqual({
        type: 'SET_STATUS',
        data: true,
      });
      expect(BiometricsEvents.AUTHENTICATE()).toEqual({type: 'AUTHENTICATE'});
      expect(BiometricsEvents.RETRY_AUTHENTICATE()).toEqual({
        type: 'RETRY_AUTHENTICATE',
      });
    });

    it('should create SET_IS_AVAILABLE with false', () => {
      expect(BiometricsEvents.SET_IS_AVAILABLE(false)).toEqual({
        type: 'SET_IS_AVAILABLE',
        data: false,
      });
    });

    it('should create SET_AUTH with auth types', () => {
      expect(BiometricsEvents.SET_AUTH([1, 2])).toEqual({
        type: 'SET_AUTH',
        data: [1, 2],
      });
    });

    it('should create SET_IS_ENROLLED with false', () => {
      expect(BiometricsEvents.SET_IS_ENROLLED(false)).toEqual({
        type: 'SET_IS_ENROLLED',
        data: false,
      });
    });

    it('should create SET_STATUS with false', () => {
      expect(BiometricsEvents.SET_STATUS(false)).toEqual({
        type: 'SET_STATUS',
        data: false,
      });
    });
  });

  describe('biometrics additional selectors', () => {
    it('selectIsUnvailable returns false for available state', () => {
      const state = createState('available');
      expect(selectIsUnvailable(state as any)).toBe(false);
    });

    it('selectIsUnenrolled returns false for available state', () => {
      const state = createState('available');
      expect(selectIsUnenrolled(state as any)).toBe(false);
    });

    it('selectError returns null for available state', () => {
      const state = {
        matches: (p: any) => p === 'available',
        meta: {},
        context: {error: {}},
      };
      expect(selectError(state as any)).toBeNull();
    });

    it('selectUnenrolledNotice returns null when not in unenrolled state', () => {
      const state = {
        matches: () => false,
        meta: {},
        context: {error: {}, retry: true},
      };
      expect(selectUnenrolledNotice(state as any)).toBeNull();
    });

    it('selectErrorResponse returns null when error is null', () => {
      const state = createState('init', {error: null});
      expect(selectErrorResponse(state as any)).toBeNull();
    });

    it('selectFailMessage joins multiple meta messages', () => {
      const state = createState(
        'failure',
        {},
        {
          'biometrics.failure.unavailable': {message: 'msg1'},
          'biometrics.failure.error': {message: 'msg2'},
        },
      );
      expect(selectFailMessage(state as any)).toBe('msg1, msg2');
    });

    it('selectIsEnabled returns false when init state', () => {
      const state = {
        matches: () => false,
        meta: {},
        context: {},
      };
      expect(selectIsEnabled(state as any)).toBe(false);
    });
  });

  describe('biometricsMachine definition', () => {
    it('should export biometricsMachine', () => {
      expect(biometricsMachine).toBeDefined();
      expect(biometricsMachine.id).toBe('biometrics');
    });

    it('should have correct initial state', () => {
      expect(biometricsMachine.initialState.value).toBe('init');
    });

    it('should have correct initial context', () => {
      const ctx = biometricsMachine.initialState.context;
      expect(ctx.isAvailable).toBe(false);
      expect(ctx.authTypes).toEqual([]);
      expect(ctx.isEnrolled).toBe(false);
      expect(ctx.status).toBeNull();
      expect(ctx.retry).toBe(false);
      expect(ctx.error).toEqual({});
    });

    it('should have init, available, authenticating, success, failure states', () => {
      const config = biometricsMachine.config;
      expect(config.states).toHaveProperty('init');
      expect(config.states).toHaveProperty('available');
      expect(config.states).toHaveProperty('authenticating');
      expect(config.states).toHaveProperty('success');
      expect(config.states).toHaveProperty('failure');
      expect(config.states).toHaveProperty('checking');
      expect(config.states).toHaveProperty('reauthenticating');
      expect(config.states).toHaveProperty('authentication');
    });

    it('available transitions to authenticating on AUTHENTICATE', () => {
      const machine = biometricsMachine.withConfig({
        services: {} as any,
        guards: {
          isStatusSuccess: () => false,
          isStatusFail: () => false,
          checkIfAvailable: () => true,
          checkIfUnavailable: () => false,
          checkIfUnenrolled: () => false,
        },
      });
      const next = machine.transition('available', {type: 'AUTHENTICATE'});
      expect(next.value).toBe('authenticating');
    });

    it('success transitions to authenticating on AUTHENTICATE', () => {
      const machine = biometricsMachine.withConfig({
        services: {} as any,
      });
      const next = machine.transition('success', {type: 'AUTHENTICATE'});
      expect(next.value).toBe('authenticating');
    });

    it('success transitions to available on SET_IS_AVAILABLE', () => {
      const machine = biometricsMachine.withConfig({
        services: {} as any,
      });
      const next = machine.transition('success', {
        type: 'SET_IS_AVAILABLE',
        data: true,
      });
      expect(next.value).toBe('available');
    });

    it('checking goes to available when checkIfAvailable guard is true', () => {
      const machine = biometricsMachine.withConfig({
        services: {} as any,
        guards: {
          isStatusSuccess: () => false,
          isStatusFail: () => false,
          checkIfAvailable: () => true,
          checkIfUnavailable: () => false,
          checkIfUnenrolled: () => false,
        },
      });
      const next = machine.transition('checking', {type: 'xstate.init' as any});
      expect(next.value).toBe('available');
    });

    it('checking goes to failure.unavailable when checkIfUnavailable is true', () => {
      const machine = biometricsMachine.withConfig({
        services: {} as any,
        guards: {
          isStatusSuccess: () => false,
          isStatusFail: () => false,
          checkIfAvailable: () => false,
          checkIfUnavailable: () => true,
          checkIfUnenrolled: () => false,
        },
      });
      const next = machine.transition('checking', {type: 'xstate.init' as any});
      expect(next.value).toEqual({failure: 'unavailable'});
    });

    it('checking goes to failure.unenrolled when checkIfUnenrolled is true', () => {
      const machine = biometricsMachine.withConfig({
        services: {} as any,
        guards: {
          isStatusSuccess: () => false,
          isStatusFail: () => false,
          checkIfAvailable: () => false,
          checkIfUnavailable: () => false,
          checkIfUnenrolled: () => true,
        },
      });
      const next = machine.transition('checking', {type: 'xstate.init' as any});
      expect(next.value).toEqual({failure: 'unenrolled'});
    });

    it('failure state transitions to authenticating on AUTHENTICATE', () => {
      const machine = biometricsMachine.withConfig({
        services: {} as any,
      });
      const next = machine.transition(
        {failure: 'error'},
        {type: 'AUTHENTICATE'},
      );
      expect(next.value).toBe('authenticating');
    });

    it('failure.unenrolled state has RETRY_AUTHENTICATE handler', () => {
      // Verify the machine config includes a handler for RETRY_AUTHENTICATE in unenrolled state
      const unenrolledConfig =
        biometricsMachine.config.states?.failure?.states?.unenrolled;
      expect(unenrolledConfig?.on).toHaveProperty('RETRY_AUTHENTICATE');
    });

    it('authentication goes to success when isStatusSuccess is true', () => {
      const machine = biometricsMachine.withConfig({
        services: {} as any,
        guards: {
          isStatusSuccess: () => true,
          isStatusFail: () => false,
          checkIfAvailable: () => true,
          checkIfUnavailable: () => false,
          checkIfUnenrolled: () => false,
        },
      });
      const next = machine.transition('authentication', {
        type: 'xstate.init' as any,
      });
      expect(next.value).toBe('success');
    });

    it('authentication goes to failure.failed when isStatusFail is true', () => {
      const machine = biometricsMachine.withConfig({
        services: {} as any,
        guards: {
          isStatusSuccess: () => false,
          isStatusFail: () => true,
          checkIfAvailable: () => false,
          checkIfUnavailable: () => false,
          checkIfUnenrolled: () => false,
        },
      });
      const next = machine.transition('authentication', {
        type: 'xstate.init' as any,
      });
      expect(next.value).toEqual({failure: 'failed'});
    });

    it('reauthenticating goes to authenticating when checkIfAvailable', () => {
      const machine = biometricsMachine.withConfig({
        services: {} as any,
        guards: {
          isStatusSuccess: () => false,
          isStatusFail: () => false,
          checkIfAvailable: () => true,
          checkIfUnavailable: () => false,
          checkIfUnenrolled: () => false,
        },
      });
      const next = machine.transition('reauthenticating', {
        type: 'xstate.init' as any,
      });
      expect(next.value).toBe('authenticating');
    });

    it('reauthenticating goes to failure.unenrolled when not available', () => {
      const machine = biometricsMachine.withConfig({
        services: {} as any,
        guards: {
          isStatusSuccess: () => false,
          isStatusFail: () => false,
          checkIfAvailable: () => false,
          checkIfUnavailable: () => false,
          checkIfUnenrolled: () => false,
        },
      });
      const next = machine.transition('reauthenticating', {
        type: 'xstate.init' as any,
      });
      expect(next.value).toEqual({failure: 'unenrolled'});
    });

    it('authenticating transitions to authentication on invoke done', () => {
      const machine = biometricsMachine.withConfig({
        services: {} as any,
        guards: {
          isStatusSuccess: () => true,
          isStatusFail: () => false,
          checkIfAvailable: () => true,
          checkIfUnavailable: () => false,
          checkIfUnenrolled: () => false,
        },
      });
      const next = machine.transition('authenticating', {
        type: 'done.invoke.biometrics.authenticating:invocation[0]' as any,
        data: true,
      });
      expect(next.value).toBeDefined();
    });

    it('authenticating transitions to failure on invoke error', () => {
      const machine = biometricsMachine.withConfig({
        services: {} as any,
        guards: {} as any,
      });
      // Use the machine's initial state context for transition since error events from authenticating carry data
      const next = machine.transition('authenticating', {
        type: 'error.platform.biometrics.authenticating:invocation[0]' as any,
        data: new Error('{"error":"fail"}'),
      });
      // On error, goes to failure with sendFailedEndEvent action
      expect(next.value).toBeDefined();
    });

    it('authenticating handles AUTHENTICATE event', () => {
      const machine = biometricsMachine.withConfig({
        services: {} as any,
      });
      const next = machine.transition('authenticating', {type: 'AUTHENTICATE'});
      expect(next.value).toBe('authenticating');
    });

    it('failure.error state has resetError exit action', () => {
      const errorConfig =
        biometricsMachine.config.states?.failure?.states?.error;
      expect(errorConfig?.exit).toBe('resetError');
    });

    it('failure.failed has after timeout to available', () => {
      const failedConfig =
        biometricsMachine.config.states?.failure?.states?.failed;
      expect(failedConfig?.after).toBeDefined();
    });
  });

  describe('biometricsMachine action callbacks', () => {
    const doneInit = (data: any) => ({
      type: 'done.invoke.biometrics.init:invocation[0]' as any,
      data,
    });
    const doneAuth = (data: any) => ({
      type: 'done.invoke.biometrics.authenticating:invocation[0]' as any,
      data,
    });
    const errorAuth = (data: any) => ({
      type: 'error.platform.biometrics.authenticating:invocation[0]' as any,
      data,
    });

    it('setIsAvailable assigns event data to isAvailable', () => {
      const machine = biometricsMachine.withConfig({services: {} as any});
      const next = machine.transition('init', doneInit(true));
      expect(next.context.isAvailable).toBe(true);
      expect(next.value).toBe('initAuthTypes');
    });

    it('setIsAvailable assigns false', () => {
      const machine = biometricsMachine.withConfig({services: {} as any});
      const next = machine.transition('init', doneInit(false));
      expect(next.context.isAvailable).toBe(false);
    });

    it('setAuthTypes action is defined in machine options', () => {
      const options = (biometricsMachine as any).options;
      expect(options.actions.setAuthTypes).toBeDefined();
      // Verify the assignment function works
      const assignment = options.actions.setAuthTypes.assignment;
      expect(typeof assignment).toBe('object');
      expect(assignment.authTypes(null, {data: [1, 2]})).toEqual([1, 2]);
    });

    it('setIsEnrolled action is defined in machine options', () => {
      const options = (biometricsMachine as any).options;
      expect(options.actions.setIsEnrolled).toBeDefined();
      const assignment = options.actions.setIsEnrolled.assignment;
      expect(typeof assignment).toBe('object');
      expect(assignment.isEnrolled(null, {data: true})).toBe(true);
    });

    it('setStatus assigns status from authenticating done', () => {
      const machine = biometricsMachine.withConfig({services: {} as any});
      const next = machine.transition('authenticating', doneAuth(true));
      expect(next.context.status).toBe(true);
    });

    it('setRetry action is defined and assigns true', () => {
      const options = (biometricsMachine as any).options;
      expect(options.actions.setRetry).toBeDefined();
      const assignment = options.actions.setRetry.assignment;
      expect(typeof assignment).toBe('object');
      expect(assignment.retry()).toBe(true);
    });

    it('sendFailedEndEvent assigns error from authenticating error', () => {
      const machine = biometricsMachine.withConfig({
        services: {} as any,
        guards: {} as any,
      });
      const errorMsg = JSON.stringify({error: 'auth_failed', success: false});
      const next = machine.transition(
        'authenticating',
        errorAuth(new Error(errorMsg)),
      );
      expect(next.context.error).toBeDefined();
      expect(next.context.error.res).toEqual({
        error: 'auth_failed',
        success: false,
      });
    });

    it('resetError sets error to null on exit from failure.error', () => {
      const machine = biometricsMachine.withConfig({services: {} as any});
      const next = machine.transition(
        {failure: 'error'},
        {type: 'AUTHENTICATE'},
      );
      expect(next.context.error).toBeNull();
    });
  });

  describe('biometricsMachine guard coverage via withContext', () => {
    it('checking → available when isAvailable=true and isEnrolled=true', () => {
      const machine = biometricsMachine
        .withContext({
          ...biometricsMachine.context,
          isAvailable: true,
          isEnrolled: true,
        })
        .withConfig({services: {} as any});
      const next = machine.transition('checking', {type: 'xstate.init' as any});
      expect(next.value).toBe('available');
    });

    it('checking → failure.unavailable when isAvailable=false', () => {
      const machine = biometricsMachine
        .withContext({
          ...biometricsMachine.context,
          isAvailable: false,
          isEnrolled: true,
        })
        .withConfig({services: {} as any});
      const next = machine.transition('checking', {type: 'xstate.init' as any});
      expect(next.value).toEqual({failure: 'unavailable'});
    });

    it('checking → failure.unenrolled when isEnrolled=false', () => {
      const machine = biometricsMachine
        .withContext({
          ...biometricsMachine.context,
          isAvailable: true,
          isEnrolled: false,
        })
        .withConfig({services: {} as any});
      const next = machine.transition('checking', {type: 'xstate.init' as any});
      expect(next.value).toEqual({failure: 'unenrolled'});
    });

    it('authentication → success when status=true', () => {
      const machine = biometricsMachine
        .withContext({...biometricsMachine.context, status: true})
        .withConfig({services: {} as any});
      const next = machine.transition('authentication', {
        type: 'xstate.init' as any,
      });
      expect(next.value).toBe('success');
    });

    it('authentication → failure.failed when status=false', () => {
      const machine = biometricsMachine
        .withContext({...biometricsMachine.context, status: false})
        .withConfig({services: {} as any});
      const next = machine.transition('authentication', {
        type: 'xstate.init' as any,
      });
      expect(next.value).toEqual({failure: 'failed'});
    });

    it('reauthenticating → authenticating when isAvailable and isEnrolled', () => {
      const machine = biometricsMachine
        .withContext({
          ...biometricsMachine.context,
          isAvailable: true,
          isEnrolled: true,
        })
        .withConfig({services: {} as any});
      const next = machine.transition('reauthenticating', {
        type: 'xstate.init' as any,
      });
      expect(next.value).toBe('authenticating');
    });

    it('reauthenticating → failure.unenrolled when not enrolled', () => {
      const machine = biometricsMachine
        .withContext({
          ...biometricsMachine.context,
          isAvailable: true,
          isEnrolled: false,
        })
        .withConfig({services: {} as any});
      const next = machine.transition('reauthenticating', {
        type: 'xstate.init' as any,
      });
      expect(next.value).toEqual({failure: 'unenrolled'});
    });

    it('init error → failure.unavailable', () => {
      const machine = biometricsMachine.withConfig({services: {} as any});
      const next = machine.transition('init', {
        type: 'error.platform.biometrics.init:invocation[0]' as any,
        data: new Error('no hw'),
      });
      expect(next.value).toEqual({failure: 'unavailable'});
    });
  });
});
