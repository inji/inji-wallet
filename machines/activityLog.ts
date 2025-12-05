import {EventFrom, send, sendParent, StateFrom} from 'xstate';
import {createModel} from 'xstate/lib/model';
import {AppServices} from '../shared/GlobalContext';
import {ACTIVITY_LOG_STORE_KEY} from '../shared/constants';
import {StoreEvents} from './store';
import {VCActivityLog} from '../components/ActivityLogEvent';
import {IssuerWellknownResponse} from './VerifiableCredential/VCMetaMachine/vc';
import {VPShareActivityLog} from '../components/VPShareActivityLogEvent';
import {parseJSON} from '../shared/Utils';

const model = createModel(
  {
    serviceRefs: {} as AppServices,
    activities: [] as VCActivityLog[],
    wellKnownIssuerMap: {} as Record<string, Object>,
  },
  {
    events: {
      STORE_RESPONSE: (response: unknown) => ({response}),
      LOG_ACTIVITY: (
        log: VCActivityLog | VCActivityLog[] | VPShareActivityLog,
        wellknown?: any,
      ) => ({
        log,
        wellknown,
      }),
      REFRESH: () => ({}),
      STORE_INCOMING_VC_WELLKNOWN_CONFIG: (
        issuer: string,
        wellknown: IssuerWellknownResponse,
      ) => ({
        issuer,
        wellknown,
      }),
    },
  },
);

export const ActivityLogEvents = model.events;

export const activityLogMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMDGAXAlgN0+gngDID2UAdJgHZ4DEAygCoDyASgKID67dACkwHJ02iUAAdisPJmKURIAB6IAHAFYyAdgBM6pQE4AzAAZdK9SsOGAbABoQ+RNt1klezYYCM+pQBZ9m3wC+AbZoWLgEJOQATmDIEPgUEAA2YDSETADiHACCAMIMAJIAagUMAJpy4pJYMnKKCJrulmSaPobe6t4GKpY63rb2CEqWmmT67pq67kqGquNKQSEYOHhEpGQxcQmYyansAGLcABKVElK1SAoOfmS6htp6LpbT7tMDiJbeSs7u5q8W6l0ll0ixAoRWEXWm3iZCSpCgVCg9GY7C4bF4AiEp2q0lkl3qAFp3N4Wt5DGZxuovK0Jip3kNvKMppNNH5vL4WaDweE1tFYjCYgAzGKwAAWiORrE43D4gmElyq5zxoEJxNJ5P0X30+gMnS89JGTm8v3aKiBBnu6iCwRAlGIEDgcm5q0iFGo6GxSrqHxJrxUOp67gMQcM+npxNGnUsPleVLuKhUCxtzshfK2iRSnpqyquCFpGhePXajN0QJsdkQnTUujcJnGHn0Ok0XOWPNd0IScKgCMoUCzuO9Q30ZF8VgToZrVK09JM6ha+jNli8ieM5JbYRdUP5CSFIvFvf7FxVlacul8xIjja8Snc9K6w48wJGsw1CfXEN5G23h5zhK86opdwqSUGlNDpCsEEZQwyEfEwejA4wdW8d821IH9BwJEYAP9IDqRvMCDScKMlE1dRpk0T5DBUa0AiAA */
  model.createMachine(
    {
      predictableActionArguments: true,
      preserveActionOrder: true,
      tsTypes: {} as import('./activityLog.typegen').Typegen0,
      schema: {
        context: model.initialContext,
        events: {} as EventFrom<typeof model>,
      },
      id: 'activityLog',
      initial: 'init',
      states: {
        init: {
          entry: 'loadActivities',
          on: {
            STORE_RESPONSE: {
              actions: ['setActivities', sendParent('READY')],
              target: 'loadWellknownConfig',
            },
          },
        },
        loadWellknownConfig: {
          entry: 'fetchAllWellKnownConfigResponse',
          on: {
            STORE_RESPONSE: {
              actions: ['setAllWellknownConfigResponse'],
              target: 'ready',
            },
          },
        },
        ready: {
          initial: 'idle',
          states: {
            idle: {
              on: {
                LOG_ACTIVITY: {
                  target: 'logging',
                },
                REFRESH: {
                  target: 'refreshing',
                },
                STORE_INCOMING_VC_WELLKNOWN_CONFIG: {
                  actions: 'storeWellknownConfig',
                },
              },
            },
            logging: {
              entry: ['loadWellknownIntoContext', 'storeActivity'],
              on: {
                STORE_RESPONSE: {
                  actions: 'prependActivity',
                  target: 'idle',
                },
              },
            },
            refreshing: {
              entry: 'loadActivities',
              on: {
                STORE_RESPONSE: {
                  actions: 'setActivities',
                  target: 'idle',
                },
              },
            },
          },
        },
      },
    },
    {
      actions: {
        loadActivities: send(StoreEvents.GET(ACTIVITY_LOG_STORE_KEY), {
          to: context => context.serviceRefs.store,
        }),

        setActivities: model.assign({
          activities: (_, event) => {
            return (event.response || []) as VCActivityLog[];
          },
        }),

        storeActivity: send(
          (_, event) => StoreEvents.PREPEND(ACTIVITY_LOG_STORE_KEY, event.log),
          {to: context => context.serviceRefs.store},
        ),

        loadWellknownIntoContext: model.assign({
          wellKnownIssuerMap: (context, event) => {
            if (!!event.wellknown) {
              const updatedWellKnownIssuerMap = {
                ...context.wellKnownIssuerMap,
              };
              if (!updatedWellKnownIssuerMap[event.log.issuer])
                updatedWellKnownIssuerMap[event.log.issuer] = event.wellknown;
              return updatedWellKnownIssuerMap as unknown as Record<
                string,
                Object
              >;
            }
            return context.wellKnownIssuerMap;
          },
        }),

        prependActivity: model.assign({
          activities: (context, event) => {
            return (
              Array.isArray(event.response)
                ? [...event.response, ...context.activities]
                : [event.response, ...context.activities]
            ) as VCActivityLog[];
          },
        }),

        fetchAllWellKnownConfigResponse: send(
          () => StoreEvents.FETCH_ALL_WELLKNOWN_CONFIG(),
          {to: context => context.serviceRefs.store},
        ),

        setAllWellknownConfigResponse: model.assign({
          wellKnownIssuerMap: (_, event) => {
            Object.entries(event.response).forEach(([key, value]) => {
              event.response[key] = parseJSON(value).response;
            });

            return event.response as Record<string, Object>;
          },
        }),

        storeWellknownConfig: model.assign({
          wellKnownIssuerMap: (context, event) => {
            context.wellKnownIssuerMap[event.issuer] = event.wellknown;
            return context.wellKnownIssuerMap;
          },
        }),
      },
    },
  );

export function createActivityLogMachine(serviceRefs: AppServices) {
  return activityLogMachine.withContext({
    ...activityLogMachine.context,
    serviceRefs,
  });
}

export type ActivityLogType =
  | 'VC_SHARED'
  | 'VC_RECEIVED'
  | 'VC_RECEIVED_NOT_SAVED'
  | 'VC_DELETED'
  | 'VC_DOWNLOADED'
  | 'VC_SHARED_WITH_VERIFICATION_CONSENT'
  | 'VC_RECEIVED_WITH_PRESENCE_VERIFIED'
  | 'VC_RECEIVED_BUT_PRESENCE_VERIFICATION_FAILED'
  | 'PRESENCE_VERIFIED_AND_VC_SHARED'
  | 'PRESENCE_VERIFICATION_FAILED'
  | 'QRLOGIN_SUCCESFULL'
  | 'WALLET_BINDING_SUCCESSFULL'
  | 'WALLET_BINDING_FAILURE'
  | 'VC_REMOVED'
  | 'TAMPERED_VC_REMOVED';

type State = StateFrom<typeof activityLogMachine>;

export function selectActivities(state: State) {
  return state.context.activities;
}

export function selectWellknownIssuerMap(state: State) {
  return state.context.wellKnownIssuerMap;
}

export function selectIsRefreshing(state: State) {
  return state.matches('ready.refreshing');
}
