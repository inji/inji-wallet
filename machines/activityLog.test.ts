import {ActivityLogEvents, activityLogMachine} from './activityLog';
// activityLog imports i18n.ts, which calls getLocales() at load time.
jest.mock('expo-localization', () => ({
  getLocales: () => [{languageTag: 'en-US', languageCode: 'en'}],
}));

describe('activityLogMachine', () => {
  const storeError = ActivityLogEvents.STORE_ERROR(new Error('write failed'));

  it('returns to idle when saving an activity fails, so later ones are still logged', () => {
    const failed = activityLogMachine.transition(
      {ready: 'logging'},
      storeError,
    );
    expect(failed.matches('ready.idle')).toBe(true);
    expect(failed.context.activities).toEqual([]);
    expect(failed.nextEvents).toContain('LOG_ACTIVITY');
  });

  it('returns to idle when reloading activities fails', () => {
    const failed = activityLogMachine.transition(
      {ready: 'refreshing'},
      storeError,
    );
    expect(failed.matches('ready.idle')).toBe(true);
  });
});
