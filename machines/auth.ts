import {assign, ContextFrom, EventFrom, send, StateFrom} from 'xstate';
import {createModel} from 'xstate/lib/model';
import {initializeFaceModel} from '../shared/api';
import {AppServices} from '../shared/GlobalContext';
import {StoreEvents, StoreResponseEvent} from './store';
import {generateSecureRandom} from 'react-native-securerandom';
import binaryToBase64 from 'react-native/Libraries/Utilities/binaryToBase64';

const model = createModel(
  {
    serviceRefs: {} as AppServices,
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
  },
  {
    events: {
      SETUP_PASSCODE: (passcode: string) => ({passcode}),
      UPGRADE_PASSCODE_HASH: (passcode: string) => ({passcode}),
      SETUP_BIOMETRICS: (biometrics: string) => ({biometrics}),
      CHANGE_METHOD: (isToggleFromSettings: boolean) => ({
        isToggleFromSettings,
      }),
      LOGOUT: () => ({}),
      LOGIN: () => ({}),
      STORE_RESPONSE: (response?: unknown) => ({response}),
      SELECT: () => ({}),
      NEXT: () => ({}),
      ONBOARDING_DONE: () => ({}),
      INITIAL_DOWNLOAD_DONE: () => ({}),
      SET_TOUR_GUIDE: (set: boolean) => ({set}),
      BIOMETRIC_CANCELLED: () => ({}),
    },
  },
);

export const AuthEvents = model.events;

type SetupBiometricsEvent = EventFrom<typeof model, 'SETUP_BIOMETRICS'>;

export const authMachine = model.createMachine(
  {
    predictableActionArguments: true,
    preserveActionOrder: true,
    tsTypes: {} as import('./auth.typegen').Typegen0,
    schema: {
      context: model.initialContext,
      events: {} as EventFrom<typeof model>,
    },
    id: 'auth',
    initial: 'init',
    on: {
      ONBOARDING_DONE: {
        actions: ['setOnboardingDone', 'storeContext'],
      },
      INITIAL_DOWNLOAD_DONE: {
        actions: ['setInitialDownloadDone', 'storeContext'],
      },
      SET_TOUR_GUIDE: {
        actions: 'setTourGuide',
      },
      BIOMETRIC_CANCELLED: {
        target: 'init',
      },
    },
    states: {
      init: {
        entry: ['requestStoredContext'],
        on: {
          STORE_RESPONSE: [
            {
              cond: 'hasData',
              target: 'checkingAuth',
              actions: ['setContext'],
            },
            {target: 'savingDefaults'},
          ],
          BIOMETRIC_CANCELLED: [
            {
              target: 'init',
            },
          ],
        },
      },
      savingDefaults: {
        entry: ['storeContext'],
        on: {
          STORE_RESPONSE: 'checkingAuth',
        },
      },
      checkingAuth: {
        always: [
          {cond: 'hasLanguageset', target: 'languagesetup'},
          {cond: 'hasPasscodeSet', target: 'unauthorized'},
          {cond: 'hasBiometricSet', target: 'unauthorized'},
          {target: 'settingUp'},
        ],
      },
      languagesetup: {
        on: {
          SELECT: {
            target: 'introSlider',
          },
        },
      },
      introSlider: {
        invoke: {
          src: 'generatePasscodeSalt',
          onDone: {
            actions: ['setPasscodeSalt', 'storeContext'],
          },
        },
        on: {
          NEXT: {
            target: 'settingUp',
          },
        },
      },
      settingUp: {
        on: {
          SETUP_PASSCODE: {
            target: 'authorized',
            actions: [
              'setPasscode',
              'setLanguage',
              'setAppSetupComplete',
              'storeContext',
            ],
          },
          SETUP_BIOMETRICS: {
            target: 'authorized',
            actions: [
              'setBiometrics',
              'setLanguage',
              'setAppSetupComplete',
              'storeContext',
            ],
          },
        },
      },
      unauthorized: {
        on: {
          LOGIN: 'authorized',
          // Transparent KDF migration: a legacy v1 hash is re-hashed to the
          // current profile during unlock (before LOGIN), so the upgrade is
          // only accepted here, not from arbitrary states.
          UPGRADE_PASSCODE_HASH: {
            actions: ['setPasscode', 'storeContext'],
          },
        },
      },
      authorized: {
        invoke: {
          src: 'initializeFaceSdkModel',
          onDone: {
            actions: ['storeContext'],
          },
        },
        on: {
          LOGOUT: 'unauthorized',
          SETUP_BIOMETRICS: {
            actions: ['setBiometrics', 'storeContext'],
          },
          CHANGE_METHOD: {
            actions: ['setIsToggleFromSettings'],
            target: 'settingUp',
          },
        },
      },
    },
  },
  {
    actions: {
      setAppSetupComplete: assign({
        isAppSetupComplete: context => true,
      }),

      requestStoredContext: send(StoreEvents.GET('auth'), {
        to: context => context.serviceRefs.store,
      }),

      setIsToggleFromSettings: assign({
        toggleFromSettings: (_, event) => event.isToggleFromSettings,
      }),

      storeContext: send(
        context => {
          const {serviceRefs, toggleFromSettings, ...data} = context;
          return StoreEvents.SET('auth', data);
        },
        {to: context => context.serviceRefs.store},
      ),

      setContext: model.assign((_, event) => {
        const {serviceRefs, ...data} = event.response as ContextFrom<
          typeof model
        >;
        return data;
      }),

      setPasscode: model.assign({
        passcode: (_, event) => event.passcode,
      }),

      setBiometrics: model.assign({
        biometrics: (_, event: SetupBiometricsEvent) => event.biometrics,
      }),

      setLanguage: assign({
        selectLanguage: context => true,
      }),

      setPasscodeSalt: assign({
        passcodeSalt: (context, event) => {
          return event.data as string;
        },
      }),

      setOnboardingDone: assign({
        isOnboarding: context => false,
      }),

      setInitialDownloadDone: assign({
        isInitialDownload: context => false,
      }),

      setTourGuide: model.assign({
        isTourGuide: (_, event) => event.set,
      }),
    },

    services: {
      initializeFaceSdkModel: () => () => {
        initializeFaceModel();
      },
      generatePasscodeSalt: () => async () => {
        const randomBytes = await generateSecureRandom(16);
        return binaryToBase64(randomBytes) as string;
      },
    },

    guards: {
      hasData: (_, event: StoreResponseEvent) => event.response != null,

      hasPasscodeSet: context => {
        return context.passcode !== '';
      },
      hasBiometricSet: context => {
        return context.biometrics !== '';
      },
      hasLanguageset: context => {
        return !context.selectLanguage;
      },
    },
  },
);

export function createAuthMachine(serviceRefs: AppServices) {
  return authMachine.withContext({
    ...authMachine.context,
    serviceRefs,
  });
}

type State = StateFrom<typeof authMachine>;

export function selectPasscode(state: State) {
  return state?.context?.passcode;
}

export function selectPasscodeSalt(state: State) {
  return state.context.passcodeSalt;
}

export function selectBiometrics(state: State) {
  return state?.context?.biometrics;
}

export function selectCanUseBiometrics(state: State) {
  return state?.context?.canUseBiometrics;
}

export function selectIsOnboarding(state: State) {
  return state?.context?.isOnboarding;
}

export function selectIsInitialDownload(state: State) {
  return state?.context?.isInitialDownload;
}

export function selectIsTourGuide(state: State) {
  return state?.context?.isTourGuide;
}

export function selectAuthorized(state: State) {
  return state.matches('authorized');
}

export function selectUnauthorized(state: State) {
  return state.matches('unauthorized');
}

export function selectSettingUp(state: State) {
  return state?.matches('settingUp');
}

export function selectLanguagesetup(state: State) {
  return state.matches('languagesetup');
}
export function selectIntroSlider(state: State) {
  return state.matches('introSlider');
}

export function selectIsBiometricToggleFromSettings(state: State) {
  if (state.matches('settingUp')) {
    return state.context.toggleFromSettings;
  }
  return false;
}

export function selectAppSetupComplete(state: State) {
  return state.context.isAppSetupComplete;
}
