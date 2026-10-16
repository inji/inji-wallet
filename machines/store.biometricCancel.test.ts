import {createMachine, interpret} from 'xstate';

// The shared jest setup replaces the store with a stub; this test needs the real machine.
jest.unmock('./store');

jest.mock('../shared/cryptoutil/cryptoUtil', () => ({
  isHardwareKeystoreExists: true,
  AUTH_TIMEOUT: 300,
  ENCRYPTION_ID: 'enc',
  HMAC_ALIAS: 'hmac',
}));
jest.mock('../shared/storage', () => ({
  __esModule: true,
  default: {},
  MMKV: {},
}));
jest.mock('../shared/VCMetadata', () => ({VCMetadata: class {}}));
jest.mock('../shared/fileStorage', () => ({isVCStorageInitialised: jest.fn()}));
jest.mock('../shared/telemetry/TelemetryUtils', () => ({
  getErrorEventData: jest.fn(),
  sendErrorEvent: jest.fn(),
}));

import {storeMachine, StoreEvents} from './store';

const tick = () => new Promise(resolve => setTimeout(resolve, 0));

describe('store: cancelled fingerprint', () => {
  it('waits after a cancel, then checks the key again on retry', async () => {
    let keyChecks = 0;
    const machine = storeMachine.withConfig({
      services: {
        checkFreshInstall: () => Promise.resolve('data'),
        // Answers after a tick, as the real check does once the keystore call returns.
        hasEncryptionKey: () => callback => {
          keyChecks++;
          const answer =
            keyChecks === 1
              ? StoreEvents.BIOMETRIC_CANCELLED()
              : StoreEvents.READY();
          setTimeout(() => callback(answer), 0);
        },
        store: () => () => undefined,
      },
      actions: {notifyParent: () => undefined},
    });
    // The store reports to its parent (the app machine), so it runs under a stand-in one.
    const parent = interpret(
      createMachine({
        predictableActionArguments: true,
        invoke: {id: 'store', src: machine},
      }),
    ).start();
    const service = parent.children.get('store') as any;

    await tick();
    await tick();
    expect(service.getSnapshot().matches('biometricCancelled')).toBe(true);
    expect(keyChecks).toBe(1);

    // No new prompt until the holder asks for one.
    await tick();
    expect(keyChecks).toBe(1);

    service.send(StoreEvents.RETRY_BIOMETRIC());
    await tick();
    expect(keyChecks).toBe(2);
    expect(service.getSnapshot().matches('ready')).toBe(true);
    parent.stop();
  });
});
