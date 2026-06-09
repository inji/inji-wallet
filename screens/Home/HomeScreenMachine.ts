import {ActorRefFrom, assign, EventFrom, send, spawn, StateFrom} from 'xstate';
import {createModel} from 'xstate/lib/model';
import {AppServices} from '../../shared/GlobalContext';
import {createMyVcsTabMachine, MyVcsTabMachine} from './MyVcsTabMachine';
import {
  createReceivedVcsTabMachine,
  ReceivedVcsTabMachine,
} from './ReceivedVcsTabMachine';
import {IssuersMachine} from '../../machines/Issuers/IssuersMachine';
import Storage, {isMinimumStorageLimitReached} from '../../shared/storage';
import {VCItemMachine} from '../../machines/VerifiableCredential/VCItemMachine/VCItemMachine';

const model = createModel(
  {
    serviceRefs: {} as AppServices,
    tabRefs: {
      myVcs: {} as ActorRefFrom<typeof MyVcsTabMachine>,
      receivedVcs: {} as ActorRefFrom<typeof ReceivedVcsTabMachine>,
    },
    selectedVc: null as ActorRefFrom<typeof VCItemMachine> | null,
    activeTab: 0,
  },
  {
    events: {
      SELECT_MY_VCS: () => ({}),
      SELECT_RECEIVED_VCS: () => ({}),
      SELECT_HISTORY: () => ({}),
      VIEW_VC: (vcItemActor: ActorRefFrom<typeof VCItemMachine>) => ({
        vcItemActor,
      }),
      DISMISS_MODAL: () => ({}),
      GOTO_ISSUERS: () => ({}),
      DOWNLOAD_ID: () => ({}),
      DISMISS: () => ({}),
    },
  },
);

const MY_VCS_TAB_REF_ID = 'myVcsTab';
const RECEIVED_VCS_TAB_REF_ID = 'receivedVcsTab';

export const HomeScreenEvents = model.events;

export type TabRef =
  | ActorRefFrom<typeof MyVcsTabMachine>
  | ActorRefFrom<typeof ReceivedVcsTabMachine>;

export const HomeScreenMachine = model.createMachine(
  {
    predictableActionArguments: true,
    preserveActionOrder: true,
    tsTypes: {} as import('./HomeScreenMachine.typegen').Typegen0,
    schema: {
      context: model.initialContext,
      events: {} as EventFrom<typeof model>,
    },
    id: 'HomeScreen',
    type: 'parallel',
    states: {
      tabs: {
        id: 'tabs',
        initial: 'init',
        on: {
          SELECT_MY_VCS: '.myVcs',
          SELECT_RECEIVED_VCS: '.receivedVcs',
          SELECT_HISTORY: '.history',
          GOTO_ISSUERS: '.checkStorage',
        },
        states: {
          init: {
            entry: ['spawnTabActors'],
            after: {
              100: 'myVcs',
            },
          },
          myVcs: {
            entry: [setActiveTab(0)],
            on: {
              DISMISS_MODAL: {
                actions: [
                  send('DISMISS', {
                    to: context => context.tabRefs.myVcs,
                  }),
                ],
              },
            },
          },
          receivedVcs: {
            entry: [setActiveTab(1)],
            on: {
              DISMISS_MODAL: {
                actions: [
                  send('DISMISS', {
                    to: context => context.tabRefs.receivedVcs,
                  }),
                ],
              },
            },
          },
          history: {
            entry: [setActiveTab(2)],
          },
          checkStorage: {
            invoke: {
              src: 'checkStorageAvailability',
              onDone: [
                {
                  cond: 'isMinimumStorageLimitReached',
                  target: 'storageLimitReached',
                },
                {
                  target: 'gotoIssuers',
                },
              ],
            },
          },
          storageLimitReached: {
            on: {
              DISMISS: 'idle',
            },
          },
          gotoIssuers: {
            invoke: {
              id: 'issuersMachine',
              src: IssuersMachine,
              data: context => ({
                ...IssuersMachine.context,
                serviceRefs: context.serviceRefs, // the value you want to pass to child machine
              }),
              onDone: 'idle',
            },
            on: {
              DOWNLOAD_ID: {
                actions: 'sendAddEvent',
                target: 'idle',
              },
              GOTO_ISSUERS: 'checkStorage',
            },
          },
          idle: {
            on: {
              DOWNLOAD_ID: {
                actions: 'sendAddEvent',
                target: 'idle',
              },
              GOTO_ISSUERS: 'checkStorage',
            },
          },
        },
      },
      modals: {
        initial: 'none',
        states: {
          none: {
            entry: ['resetSelectedVc'],
            on: {
              VIEW_VC: {
                target: 'viewingVc',
                actions: ['setSelectedVc'],
              },
            },
          },
          viewingVc: {
            on: {
              DISMISS_MODAL: 'none',
            },
          },
        },
      },
    },
  },
  {
    services: {
      checkStorageAvailability: () => async () => {
        return Promise.resolve(
          isMinimumStorageLimitReached('minStorageRequired'),
        );
      },
    },
    actions: {
      spawnTabActors: assign({
        tabRefs: context => ({
          myVcs: spawn(
            createMyVcsTabMachine(context.serviceRefs),
            MY_VCS_TAB_REF_ID,
          ),
          receivedVcs: spawn(
            createReceivedVcsTabMachine(context.serviceRefs),
            RECEIVED_VCS_TAB_REF_ID,
          ),
        }),
      }),

      sendAddEvent: send('ADD_VC', {
        to: context => context.tabRefs.myVcs,
      }),

      setSelectedVc: model.assign({
        selectedVc: (_, event) => event.vcItemActor,
      }),

      resetSelectedVc: model.assign({
        selectedVc: null,
      }),
    },
    guards: {
      isMinimumStorageLimitReached: (_context, event) => Boolean(event.data),
    },
  },
);

function setActiveTab(activeTab: number) {
  return model.assign({activeTab});
}

type State = StateFrom<typeof HomeScreenMachine>;

export function selectIssuersMachine(state: State) {
  return state.children.issuersMachine as ActorRefFrom<typeof IssuersMachine>;
}

export function selectTabRefs(state: State) {
  return state.context.tabRefs;
}

export function selectActiveTab(state: State) {
  return state.context.activeTab;
}

export function selectSelectedVc(state: State) {
  return state.context.selectedVc;
}

export function selectViewingVc(state: State) {
  return state.matches('modals.viewingVc');
}

export function selectTabsLoaded(state: State) {
  return !state.matches('tabs.init');
}

export function selectIsMinimumStorageLimitReached(state: State) {
  return state.matches('tabs.storageLimitReached');
}

export function selectIsIssuerMachineBusyForDeepLink(state: State) {
  const issuersService = state.children.issuersMachine as
    | ActorRefFrom<typeof IssuersMachine>
    | undefined;

  const issuerState = issuersService?.getSnapshot?.();

  if (!issuerState) return false;

  const activeStates = issuerState.toStrings();

  return activeStates.some(activeState =>
    [
      'credentialDownloadFromOffer',
      'downloadCredentials',
      'proccessingCredential',
      'processingCredential',
      'verifyingCredential',
      'storing',
    ].some(busyState => activeState.includes(busyState)),
  );
}
