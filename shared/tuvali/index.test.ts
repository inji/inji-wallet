jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => ({
  __esModule: true,
  default: class MockNativeEventEmitter {
    addListener = jest.fn(() => ({remove: jest.fn()}));
    removeAllListeners = jest.fn();
    removeSubscription = jest.fn();
  },
}));

import {EventTypes, VerificationStatus} from './types/events';

describe('tuvali types', () => {
  it('EventTypes is defined', () => {
    expect(EventTypes).toBeDefined();
  });

  it('VerificationStatus is defined', () => {
    expect(VerificationStatus).toBeDefined();
  });

  it('VerificationStatus has expected values', () => {
    expect(VerificationStatus.ACCEPTED).toBeDefined();
    expect(VerificationStatus.REJECTED).toBeDefined();
  });
});

describe('tuvali module', () => {
  // The module-level code runs on require. Since NativeEventEmitter is mocked,
  // setupModule executes without errors. But WalletModule/VerifierModule may
  // not be in NativeModules mock, so wallet could be a Proxy.

  it('exports EventTypes and VerificationStatus', () => {
    const tuvali = require('./index');
    expect(tuvali.EventTypes).toBeDefined();
    expect(tuvali.VerificationStatus).toBeDefined();
  });

  it('wallet is defined', () => {
    const tuvali = require('./index');
    expect(tuvali.wallet).toBeDefined();
  });

  it('setupModule executes on Android and adds handleDataEvents', () => {
    jest.isolateModules(() => {
      const {NativeModules} = require('react-native');
      NativeModules.WalletModule = {startTransfer: jest.fn()};
      NativeModules.VerifierModule = {startVerification: jest.fn()};
      const tuvali = require('./index');
      expect(typeof tuvali.wallet.handleDataEvents).toBe('function');
      expect(typeof tuvali.verifier.handleDataEvents).toBe('function');
    });
  });

  it('handleDataEvents returns listener result', () => {
    jest.isolateModules(() => {
      const {NativeModules} = require('react-native');
      NativeModules.WalletModule = {startTransfer: jest.fn()};
      const tuvali = require('./index');
      const cb = jest.fn();
      const sub = tuvali.wallet.handleDataEvents(cb);
      expect(sub).toBeDefined();
    });
  });
});
