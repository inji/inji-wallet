import {readAutoLockMinutes, shouldLock} from './autoLock';

const stored: Record<string, number> = {};
jest.mock('../../shared/storage', () => ({
  MMKV: {getInt: (key: string) => stored[key]},
}));

describe('auto-lock', () => {
  beforeEach(() => {
    delete stored['settings.autoLockMinutes'];
  });

  it('defaults to one minute, also for an unknown stored value', () => {
    expect(readAutoLockMinutes()).toBe(1);
    stored['settings.autoLockMinutes'] = 7;
    expect(readAutoLockMinutes()).toBe(1);
  });

  it('reads a chosen value', () => {
    stored['settings.autoLockMinutes'] = 15;
    expect(readAutoLockMinutes()).toBe(15);
  });

  it('locks after the chosen time in the background', () => {
    expect(shouldLock(61_000, 1)).toBe(true);
    expect(shouldLock(60_000, 1)).toBe(true);
  });

  it('stays open after a shorter absence', () => {
    expect(shouldLock(59_000, 1)).toBe(false);
    expect(shouldLock(4 * 60_000, 5)).toBe(false);
  });

  it('never locks when set to never', () => {
    expect(shouldLock(24 * 60 * 60_000, 0)).toBe(false);
  });

  it('locks when the clock went back while away', () => {
    expect(shouldLock(-5 * 60_000, 1)).toBe(true);
  });
});
