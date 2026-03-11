import {
  ActivityLogEvents,
  selectActivities,
  selectWellknownIssuerMap,
  selectIsRefreshing,
  createActivityLogMachine,
  activityLogMachine,
} from './activityLog';

const mockState = (ctx: any = {}, matchVal?: string) => ({
  context: {activities: [], wellKnownIssuerMap: {}, ...ctx},
  matches: (v: string) => v === matchVal,
});

describe('activityLog selectors', () => {
  it('selectActivities returns activities', () => {
    const a = [{action: 'dl', timestamp: 1}];
    expect(selectActivities(mockState({activities: a}) as any)).toEqual(a);
  });
  it('selectActivities returns empty by default', () =>
    expect(selectActivities(mockState() as any)).toEqual([]));
  it('selectWellknownIssuerMap returns map', () => {
    const m = {i1: {name: 'I'}};
    expect(
      selectWellknownIssuerMap(mockState({wellKnownIssuerMap: m}) as any),
    ).toEqual(m);
  });
  it('selectIsRefreshing true', () =>
    expect(selectIsRefreshing(mockState({}, 'ready.refreshing') as any)).toBe(
      true,
    ));
  it('selectIsRefreshing false', () =>
    expect(selectIsRefreshing(mockState({}, 'ready.idle') as any)).toBe(false));
  it('createActivityLogMachine is a function', () =>
    expect(typeof createActivityLogMachine).toBe('function'));
});

describe('activityLog', () => {
  describe('ActivityLogEvents', () => {
    it('should create STORE_RESPONSE event', () => {
      const event = ActivityLogEvents.STORE_RESPONSE({data: 'test'});
      expect(event).toEqual({type: 'STORE_RESPONSE', response: {data: 'test'}});
    });

    it('should create LOG_ACTIVITY event with log only', () => {
      const log = {timestamp: Date.now(), _vcKey: 'vc1', type: 'VC_DOWNLOADED'};
      const event = ActivityLogEvents.LOG_ACTIVITY(log as any);
      expect(event.type).toBe('LOG_ACTIVITY');
      expect(event.log).toEqual(log);
    });

    it('should create LOG_ACTIVITY event with wellknown', () => {
      const log = {timestamp: Date.now(), _vcKey: 'vc1', type: 'VC_DOWNLOADED'};
      const wellknown = {issuer: 'test'};
      const event = ActivityLogEvents.LOG_ACTIVITY(log as any, wellknown);
      expect(event.type).toBe('LOG_ACTIVITY');
      expect(event.log).toEqual(log);
      expect(event.wellknown).toEqual(wellknown);
    });

    it('should create REFRESH event', () => {
      const event = ActivityLogEvents.REFRESH();
      expect(event).toEqual({type: 'REFRESH'});
    });

    it('should create STORE_INCOMING_VC_WELLKNOWN_CONFIG event', () => {
      const event = ActivityLogEvents.STORE_INCOMING_VC_WELLKNOWN_CONFIG(
        'issuer1',
        {issuer: 'test'} as any,
      );
      expect(event.type).toBe('STORE_INCOMING_VC_WELLKNOWN_CONFIG');
      expect(event.issuer).toBe('issuer1');
      expect(event.wellknown).toEqual({issuer: 'test'});
    });
  });
});

describe('activityLogMachine', () => {
  it('has id "activityLog"', () => {
    expect(activityLogMachine.id).toBe('activityLog');
  });

  it('has initial state "init"', () => {
    expect(activityLogMachine.initialState.value).toBe('init');
  });

  it('has correct initial context', () => {
    const ctx = activityLogMachine.context;
    expect(ctx.activities).toEqual([]);
    expect(ctx.wellKnownIssuerMap).toEqual({});
  });

  it('machine options has actions defined', () => {
    const config = activityLogMachine.options;
    expect(config.actions).toBeDefined();
  });
});

describe('activityLogMachine actions', () => {
  const machineActions = activityLogMachine.options.actions as any;

  describe('setActivities', () => {
    it('sets activities from event response', () => {
      const assignment = machineActions.setActivities?.assignment;
      expect(assignment?.activities).toBeDefined();
      const logs = [{action: 'dl'}];
      const result = assignment.activities({}, {response: logs});
      expect(result).toEqual(logs);
    });

    it('returns empty array when response is null', () => {
      const assignment = machineActions.setActivities?.assignment;
      expect(assignment?.activities).toBeDefined();
      const result = assignment.activities({}, {response: null});
      expect(result).toEqual([]);
    });
  });

  describe('loadWellknownIntoContext', () => {
    it('adds wellknown to map when provided', () => {
      const assignment = machineActions.loadWellknownIntoContext?.assignment;
      expect(assignment?.wellKnownIssuerMap).toBeDefined();
      const ctx = {wellKnownIssuerMap: {}};
      const event = {
        wellknown: {display: [{name: 'Issuer'}]},
        log: {issuer: 'issuer1'},
      };
      const result = assignment.wellKnownIssuerMap(ctx, event);
      expect(result.issuer1).toBeDefined();
    });

    it('returns existing map when no wellknown', () => {
      const assignment = machineActions.loadWellknownIntoContext?.assignment;
      expect(assignment?.wellKnownIssuerMap).toBeDefined();
      const existing = {i1: {name: 'I'}};
      const ctx = {wellKnownIssuerMap: existing};
      const result = assignment.wellKnownIssuerMap(ctx, {log: {}});
      expect(result).toEqual(existing);
    });

    it('does not overwrite existing issuer entry', () => {
      const assignment = machineActions.loadWellknownIntoContext?.assignment;
      expect(assignment?.wellKnownIssuerMap).toBeDefined();
      const existing = {issuer1: {name: 'old'}};
      const ctx = {wellKnownIssuerMap: existing};
      const event = {
        wellknown: {name: 'new'},
        log: {issuer: 'issuer1'},
      };
      const result = assignment.wellKnownIssuerMap(ctx, event);
      expect(result.issuer1).toEqual({name: 'old'});
    });
  });

  describe('prependActivity', () => {
    it('prepends single response to activities', () => {
      const assignment = machineActions.prependActivity?.assignment;
      expect(assignment?.activities).toBeDefined();
      const ctx = {activities: [{action: 'old'}]};
      const result = assignment.activities(ctx, {response: {action: 'new'}});
      expect(result[0]).toEqual({action: 'new'});
      expect(result[1]).toEqual({action: 'old'});
    });

    it('prepends array response to activities', () => {
      const assignment = machineActions.prependActivity?.assignment;
      expect(assignment?.activities).toBeDefined();
      const ctx = {activities: [{action: 'old'}]};
      const result = assignment.activities(ctx, {
        response: [{action: 'new1'}, {action: 'new2'}],
      });
      expect(result.length).toBe(3);
    });
  });

  describe('storeWellknownConfig', () => {
    it('adds config to map', () => {
      const assignment = machineActions.storeWellknownConfig?.assignment;
      expect(assignment?.wellKnownIssuerMap).toBeDefined();
      const ctx = {wellKnownIssuerMap: {}};
      const event = {
        issuer: 'newIssuer',
        wellknown: {display: [{name: 'New'}]},
      };
      const result = assignment.wellKnownIssuerMap(ctx, event);
      expect(result.newIssuer).toBeDefined();
    });
  });
});

describe('createActivityLogMachine', () => {
  it('creates machine with custom serviceRefs', () => {
    const mockRefs = {store: 'storeRef', settings: 'settingsRef'} as any;
    const machine = createActivityLogMachine(mockRefs);
    expect(machine.context.serviceRefs).toBe(mockRefs);
  });

  it('preserves default context values', () => {
    const machine = createActivityLogMachine({} as any);
    expect(machine.context.activities).toEqual([]);
    expect(machine.context.wellKnownIssuerMap).toEqual({});
  });
});
