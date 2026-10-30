import {
  assign,
  ContextFrom,
  EventFrom,
  send,
  StateFrom,
  sendUpdate,
} from 'xstate';
import {createModel} from 'xstate/lib/model';
import {AppServices} from '../shared/GlobalContext';
import {
  APP_ID_DICTIONARY,
  APP_ID_LENGTH,
  COMMON_PROPS_KEY,
  ESIGNET_BASE_URL,
  isIOS,
  MIMOTO_BASE_URL,
  SETTINGS_STORE_KEY,
} from '../shared/constants';
import {VCLabel} from './VerifiableCredential/VCMetaMachine/vc';
import {StoreEvents} from './store';
import getAllConfigurations from '../shared/api';
import Storage from '../shared/storage';
import ShortUniqueId from 'short-unique-id';
import {__AppId} from '../shared/GlobalVariables';
import {
  isHardwareKeystoreExists,
  storeKeyPriorityOrder,
} from '../shared/cryptoutil/cryptoUtil';
import {INITIAL_CONFIG} from '../shared/InitialConfig';

const model = createModel(
  {
    serviceRefs: {} as AppServices,
    name: '',
    vcLabel: {
      singular: 'Card',
      plural: 'Cards',
    } as VCLabel,
    isBiometricUnlockEnabled: false,
    credentialRegistry: MIMOTO_BASE_URL,
    esignetHostUrl: ESIGNET_BASE_URL,
    appId: null,
    isBackupAndRestoreExplored: false as boolean,
    isKeyManagementTourGuideExplored: false as boolean,
    isKeyOrderSet: undefined as unknown as boolean,
    hasUserShownWithHardwareKeystoreNotExists: false,
    isAccountSelectionConfirmationShown: false,
    credentialRegistryResponse: '' as string,
    isBiometricToggled: false,
  },
  {
    events: {
      UPDATE_NAME: (name: string) => ({name}),
      UPDATE_VC_LABEL: (label: string) => ({label}),
      TOGGLE_BIOMETRIC_UNLOCK: (
        enable: boolean,
        isToggledFromSettings: boolean,
      ) => ({
        enable,
        isToggledFromSettings,
      }),
      STORE_RESPONSE: (response: unknown) => ({response}),
      CHANGE_LANGUAGE: (language: string) => ({language}),
      UPDATE_HOST: (credentialRegistry: string, esignetHostUrl: string) => ({
        credentialRegistry,
        esignetHostUrl,
      }),
      UPDATE_CREDENTIAL_REGISTRY_RESPONSE: (
        credentialRegistryResponse: string,
      ) => ({
        credentialRegistryResponse: credentialRegistryResponse,
      }),
      INJI_TOUR_GUIDE: () => ({}),
      BACK: () => ({}),
      CANCEL: () => ({}),
      ACCEPT_HARDWARE_SUPPORT_NOT_EXISTS: () => ({}),
      SET_KEY_MANAGEMENT_EXPLORED: () => ({}),
      SET_KEY_MANAGEMENT_TOUR_GUIDE_EXPLORED: () => ({}),
      SET_KEY_ORDER_RESPONSE: (status: boolean) => ({status}),
      RESET_KEY_ORDER_RESPONSE: () => ({}),
      SHOWN_ACCOUNT_SELECTION_CONFIRMATION: () => ({}),
      DISMISS: () => ({}),
      BIOMETRIC_CANCELLED: (requester?: string) => ({requester}),
    },
  },
);

export const SettingsEvents = model.events;

export const settingsMachine = model.createMachine(
  {
    predictableActionArguments: true,
    preserveActionOrder: true,
    tsTypes: {} as import('./settings.typegen').Typegen0,
    schema: {
      context: model.initialContext,
      events: {} as EventFrom<typeof model>,
    },
    id: 'settings',
    initial: 'init',
    states: {
      init: {
        entry: ['requestStoredContext'],
        on: {
          STORE_RESPONSE: [
            {
              cond: 'hasPartialData',
              target: 'idle',
              actions: ['setContext', 'updatePartialDefaults', 'storeContext'],
            },
            {
              cond: 'hasData',
              target: 'idle',
              actions: ['setContext'],
            },
            {target: 'storingDefaults'},
          ],
          BIOMETRIC_CANCELLED: {
            actions: [
              send(
                (_, event) => model.events.BIOMETRIC_CANCELLED(event.requester),
                {
                  to: (_, event) => event.requester,
                },
              ),
              sendUpdate(),
            ],
            target: 'init',
          },
        },
      },
      storingDefaults: {
        entry: ['updateDefaults', 'storeContext'],
        on: {
          STORE_RESPONSE: 'idle',
        },
      },
      idle: {
        on: {
          TOGGLE_BIOMETRIC_UNLOCK: {
            actions: [
              'toggleBiometricUnlock',
              'setIsBiometricToggled',
              'storeContext',
            ],
          },
          UPDATE_NAME: {
            actions: ['updateName', 'storeContext'],
          },
          SET_KEY_MANAGEMENT_EXPLORED: {
            actions: ['setKeyManagementExplored', 'storeContext'],
          },
          UPDATE_VC_LABEL: {
            actions: ['updateVcLabel', 'storeContext'],
          },
          SET_KEY_ORDER_RESPONSE: {
            actions: ['setKeyOrderingResponse'],
          },
          RESET_KEY_ORDER_RESPONSE: {
            actions: ['resetKeyOrderingResponse'],
          },
          SET_KEY_MANAGEMENT_TOUR_GUIDE_EXPLORED: {
            actions: ['setKeyManagementTourGuideExplored'],
          },
          UPDATE_HOST: {
            actions: [
              'resetCredentialRegistryResponse',
              'updateEsignetHostUrl',
              'storeContext',
            ],
            target: 'resetInjiProps',
          },
          CANCEL: {
            actions: ['resetCredentialRegistryResponse'],
          },
          INJI_TOUR_GUIDE: {
            target: 'showInjiTourGuide',
          },
          ACCEPT_HARDWARE_SUPPORT_NOT_EXISTS: {
            actions: [
              'updateUserShownWithHardwareKeystoreNotExists',
              'storeContext',
            ],
            target: 'idle',
          },
          SHOWN_ACCOUNT_SELECTION_CONFIRMATION: {
            actions: [
              'updateIsAccountSelectionConfirmationShown',
              'storeContext',
            ],
            target: 'idle',
          },
          DISMISS: {
            actions: 'resetIsBiometricToggled',
            target: 'idle',
          },
        },
      },
      resetInjiProps: {
        invoke: {
          src: 'resetInjiProps',
          onDone: {
            actions: [
              'updateCredentialRegistrySuccess',
              'storeKeyPriorityOrderOfEnvironment',
              'updateCredentialRegistry',
              'storeContext',
            ],
            target: 'idle',
          },
          onError: {
            actions: ['updateCredentialRegistryResponse'],
            target: 'idle',
          },
        },
        on: {
          CANCEL: {
            actions: ['resetCredentialRegistryResponse'],
            target: 'idle',
          },
        },
      },
      showInjiTourGuide: {
        on: {
          BACK: {
            target: 'idle',
          },
        },
      },
    },
  },
  {
    actions: {
      requestStoredContext: send(StoreEvents.GET(SETTINGS_STORE_KEY), {
        to: context => context.serviceRefs.store,
      }),

      setIsBiometricToggled: model.assign({
        isBiometricToggled: (_context, event) => event.isToggledFromSettings,
      }),

      resetIsBiometricToggled: model.assign({
        isBiometricToggled: () => false,
      }),

      updateDefaults: model.assign({
        appId: (_, event) => {
          const appId =
            event.response != null &&
            event.response.encryptedData == null &&
            event.response.appId != null
              ? event.response.appId
              : generateAppId();
          __AppId.setValue(appId);
          return appId;
        },

        hasUserShownWithHardwareKeystoreNotExists: () => false,
      }),

      updatePartialDefaults: model.assign({
        appId: context => context.appId || generateAppId(),
      }),

      storeContext: send(
        context => {
          const {serviceRefs, isBiometricToggled, ...data} = context;
          return StoreEvents.SET(SETTINGS_STORE_KEY, data);
        },
        {to: context => context.serviceRefs.store},
      ),

      setContext: model.assign((context, event) => {
        const newContext = event.response as ContextFrom<typeof model>;
        __AppId.setValue(newContext.appId);
        return {
          ...context,
          ...newContext.encryptedData,
          appId: newContext.appId,
        };
      }),

      updateName: model.assign({
        name: (_, event) => event.name,
      }),
      setBackupAndRestoreOptionExplored: model.assign({
        isBackupAndRestoreExplored: () => true,
      }),
      setKeyOrderingResponse: model.assign({
        isKeyOrderSet: (_, event: any) => event.status,
      }),
      resetKeyOrderingResponse: model.assign({
        isKeyOrderSet: undefined,
      }),
      setKeyManagementTourGuideExplored: model.assign({
        isKeyManagementTourGuideExplored: true,
      }),
      updateEsignetHostUrl: model.assign({
        esignetHostUrl: (_, event) => event.esignetHostUrl,
      }),

      updateVcLabel: model.assign({
        vcLabel: (_, event) => ({
          singular: event.label,
          plural: event.label + 's',
        }),
      }),
      updateCredentialRegistry: assign({
        credentialRegistry: (_context, event) => event.data.warningDomainName,
      }),

      updateCredentialRegistryResponse: assign({
        credentialRegistryResponse: () => 'error',
      }),

      updateCredentialRegistrySuccess: assign({
        credentialRegistryResponse: () => 'success',
      }),

      storeKeyPriorityOrderOfEnvironment: (_context, event: any) => {
        if (event.data !== INITIAL_CONFIG.allProperties) {
          storeKeyPriorityOrder(event.data?.keyPriorityOrder).catch(error =>
            console.warn(
              'Failed to store keyPriorityOrder of the new environment',
              error,
            ),
          );
        }
      },

      resetCredentialRegistryResponse: model.assign({
        credentialRegistryResponse: () => '',
      }),

      updateUserShownWithHardwareKeystoreNotExists: model.assign({
        hasUserShownWithHardwareKeystoreNotExists: () => true,
      }),

      updateIsAccountSelectionConfirmationShown: model.assign({
        isAccountSelectionConfirmationShown: () => true,
      }),

      toggleBiometricUnlock: model.assign({
        isBiometricUnlockEnabled: (_, event) => event.enable,
      }),
    },

    services: {
      resetInjiProps: async (context, event) => {
        try {
          await Storage.removeItem(COMMON_PROPS_KEY);
          return await getAllConfigurations(event.credentialRegistry, false);
        } catch (error) {
          console.error('Error from resetInjiProps ', error);
          throw error;
        }
      },
    },

    guards: {
      hasData: (_, event) =>
        event.response != null &&
        event.response.encryptedData != null &&
        event.response.appId != null,
      hasPartialData: (_, event) =>
        event.response != null && event.response.appId == null,
    },
  },
);

export function createSettingsMachine(serviceRefs: AppServices) {
  return settingsMachine.withContext({
    ...settingsMachine.context,
    serviceRefs,
  });
}

function generateAppId() {
  const shortUUID = new ShortUniqueId({
    length: APP_ID_LENGTH,
    dictionary: APP_ID_DICTIONARY,
  });
  return shortUUID.randomUUID();
}

function deviceSupportsHardwareKeystore() {
  return isIOS() ? true : isHardwareKeystoreExists;
}

type State = StateFrom<typeof settingsMachine>;

export function selectName(state: State) {
  return state?.context?.name;
}

export function selectAppId(state: State) {
  return state?.context?.appId;
}

/** Alerting the user when the hardware keystore not supported by device and
 * not shown to user atlease once */

export function selectShowHardwareKeystoreNotExistsAlert(state: State) {
  const hasShown = state.context.hasUserShownWithHardwareKeystoreNotExists;
  const deviceSupports = deviceSupportsHardwareKeystore();
  return !hasShown && !deviceSupports;
}

export function selectShowAccountSelectionConfirmation(state: State) {
  return !state.context.isAccountSelectionConfirmationShown;
}

export function selectVcLabel(state: State) {
  return state?.context?.vcLabel;
}

export function selectCredentialRegistry(state: State) {
  return state?.context?.credentialRegistry;
}

export function selectEsignetHostUrl(state: State) {
  return state?.context?.esignetHostUrl;
}

export function selectCredentialRegistryResponse(state: State) {
  return state?.context?.credentialRegistryResponse;
}

export function selectBiometricUnlockEnabled(state: State) {
  return state?.context?.isBiometricUnlockEnabled;
}

export function selectIsResetInjiProps(state: State) {
  return state?.matches('resetInjiProps');
}

export function selectIsBiometricUnlock(state: State) {
  return (
    state.context.isBiometricToggled && state.context.isBiometricUnlockEnabled
  );
}

export function selectIsPasscodeUnlock(state: State) {
  return (
    state.context.isBiometricToggled && !state.context.isBiometricUnlockEnabled
  );
}

export function selectIsKeyOrderSet(state: State) {
  return state.context.isKeyOrderSet;
}

export function selectIsKeymanagementTourGuideExplored(state: State) {
  return state.context.isKeyManagementTourGuideExplored;
}
