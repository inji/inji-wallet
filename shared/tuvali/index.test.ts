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

  it('handleDataEvents subscribes to DATA_EVENT with the provided callback', () => {
    jest.isolateModules(() => {
      const {NativeModules, NativeEventEmitter} = require('react-native');
      const addListenerSpy = jest.spyOn(
        NativeEventEmitter.prototype,
        'addListener',
      );
      NativeModules.WalletModule = {startTransfer: jest.fn()};
      const tuvali = require('./index');
      const cb = jest.fn();
      tuvali.wallet.handleDataEvents(cb);
      expect(addListenerSpy).toHaveBeenCalledWith('DATA_EVENT', cb);
      addListenerSpy.mockRestore();
    });
  });

  it('handleDataEvents returns a subscription with a remove function', () => {
    jest.isolateModules(() => {
      const {NativeModules} = require('react-native');
      NativeModules.WalletModule = {startTransfer: jest.fn()};
      const tuvali = require('./index');
      const cb = jest.fn();
      const sub = tuvali.wallet.handleDataEvents(cb);
      expect(sub).toBeDefined();
      expect(sub.remove).toBeDefined();
      expect(typeof sub.remove).toBe('function');
    });
  });

  it('subscription returned by handleDataEvents can be removed', () => {
    jest.isolateModules(() => {
      const {NativeModules} = require('react-native');
      NativeModules.WalletModule = {startTransfer: jest.fn()};
      const tuvali = require('./index');
      const cb = jest.fn();
      const sub = tuvali.wallet.handleDataEvents(cb);
      expect(() => sub.remove()).not.toThrow();
    });
  });
});
