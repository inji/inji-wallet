import {NativeEventEmitter, NativeModules, Platform} from 'react-native';
import type {Verifier, Wallet} from './types/interface';
import {EventTypes, VerificationStatus} from './types/events';
import {isAndroid, isIOS} from '../constants';

const LINKING_ERROR =
  `The package 'tuvali' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ios: "- You have run 'pod install'\n", default: ''}) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const VERIFIER_NOT_IMPLEMENTATED_ERROR = `Verifier is not yet implemented on IOS. Please remove Verifier usage on IOS Platform`;

const wallet: Wallet = NativeModules.WalletModule
  ? NativeModules.WalletModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      },
    );

// TODO: Use Actual Verifier module on IOS once Verifier is implemented
const verifier: Verifier = NativeModules.VerifierModule;

if (!isIOS()) {
  if (verifier) setupModule(verifier);
  else
    new Proxy(
      {},
      {
        get() {
          throw new Error(VERIFIER_NOT_IMPLEMENTATED_ERROR);
        },
      },
    );
}

setupModule(wallet);

function setupModule(module: any) {
  if (isAndroid()) {
    const eventEmitter = new NativeEventEmitter();
    module.handleDataEvents = (callback: (event: any) => void) =>
      eventEmitter.addListener('DATA_EVENT', callback);
  }

  if (isIOS()) {
    const eventEmitter = new NativeEventEmitter(module);
    module.handleDataEvents = (callback: (event: any) => void) =>
      eventEmitter.addListener('DATA_EVENT', callback);
  }
}

export {verifier, wallet, EventTypes, VerificationStatus};
