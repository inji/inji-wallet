import {actions, EventFrom, send, sendParent} from 'xstate';
import {AppServices} from '../../../shared/GlobalContext';
import {VCMetamodel} from './VCMetaModel';
import {VCMetaActions} from './VCMetaActions';
import {VCMetaGuards} from './VCMetaGuards';
import {VCMetaServices} from './VCMetaServices';

const model = VCMetamodel;
export const VcMetaEvents = model.events;

export const vcMetaMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QDcDGA6AlgO0wF3QFsBPANVVgGIBlAFQHkAlAUQH0XqAFegOWucSgADgHtY+TCOyCQAD0QBmABwAmdAEYALCoCsANgAMOgJx6dAdnNmANCGKIlBvemWbLKvcc06FVgL5+tmhYuAQATmCoYJjIkORUdExsHNx8AkggouJ4ktIZ8gjKalq65qrmmup6SpqatvYI6k6a6HoKmko6OkpK5sb9AUEYEQCGEMREZBRYEAA2YJQsAGIcABKsALIAmqykAMLUMlkSUjIF6uom6JV6ujrqxo7qZfWITRUamgpOKubdWuYVIMQMFRuNJvF0BEAGYRWAACxwUBoDBY7GYXF4-COYhOeVA50u5nQxh8fyKCm6uleCFMxKayjaBgUCjaFmBoLAYwmESiMTi00wcwWyzW6L2zAAkqRmAARXYHHHZXJnN7qXwacwGAyVJymJTqGnqlnoToqFS+XzqA1ODnDLng3nRWIQSEwuGI7DIxJolJY9LCXE5U75NV6dToJy+YwGXrGFRuI0WiNKUnqvS3LwGcwKO1Qh3ESgAcWYtHFUpl8v2hwyx2D+LkbxUplangzPVumhjdTsiEMBg0XWb6rp1vMebBhZLZf2rEltGYGyVeNVjQuEeZvi1zO1Nl7CH7g50w4Uo56E4LlFnAEFZbK5cv66vjAoI1ahyz9OSaYfLsfjCOejmGOF7cleeysLK9AAOo8AAMvQt4PrWQYqqGjTHgokbxhaKgPF46gqEoP7akeug1H0x7aKB4zgeW0rIYGyohgSfa6C4NRVO0mh6DxlQ0n8OitE0mhOD4OpuLmwLYCIEBwDIwQ4PgEIUI+aGsYU1ToBY0baM2Si3LxP5WJGNTNgYeFUgMgQghgSnhJEzoCvAKHMQ2BTtPSRg6o4omVBUNIAcUqgKCoTg9DqJh5vZaksY2hQWho3kdDqOrPD2DSGFhsbaAZDyAjxNETCQkJCvMsXuYgjzOOafxakorJuBaRoWUJ3wWRUHQ+AZehFSpsD5rCcCelAFWriOKbtg1XUmC8+79MYpras2Zj9H0CZ9SVqmuSu6GmGotUWLGjWAgoNKpi0DIhfoFhmFJQz5ty+Z8i6pXCmNe2dBoZj3BZlw1KyRqvhGGYWGtxhlAZSh9U6-KutM7rDUiH0aSOag+I8zQ-N4SYGd9VIPIRzZETDjlw-EKPxaYEZVF0TSWQDehGv9pqkgYENVJcvhFZTBQvvSP30-9XxM-ulgDldvjVA15qaHavOIM2i1NDoPmpf5GWIMe9JDjotSGFm6gBAEQA */
  model.createMachine(
    {
      predictableActionArguments: true,
      preserveActionOrder: true,
      tsTypes: {} as import('./VCMetaMachine.typegen').Typegen0,
      schema: {
        context: model.initialContext,
        events: {} as EventFrom<typeof model>,
      },
      id: 'vcMeta',
      initial: 'ready',
      on: {
        VC_DOWNLOADING_FAILED: {
          actions: 'setDownloadCreadentialsFailed',
        },
        RESET_DOWNLOADING_SUCCESS: {
          actions: 'resetDownloadCredentialsSuccess',
        },
        RESET_DOWNLOADING_FAILED: {
          actions: 'resetDownloadCreadentialsFailed',
        },
        REMOVE_VC_FROM_IN_PROGRESS_DOWNLOADS: {
          actions: 'removeVcFromInProgressDownlods',
        },
      },
      states: {
        ready: {
          entry: sendParent('READY'),
          initial: 'myVcs',
          states: {
            myVcs: {
              entry: 'loadMyVcs',
              on: {
                STORE_RESPONSE: {
                  actions: 'setMyVcs',
                  target: 'receivedVcs',
                },
              },
            },
            receivedVcs: {
              entry: 'loadReceivedVcs',
              on: {
                STORE_RESPONSE: {
                  actions: 'setReceivedVcs',
                  target: 'showTamperedPopup',
                },
              },
            },
            showTamperedPopup: {
              entry: send('SHOW_TAMPERED_POPUP'),
              on: {
                SHOW_TAMPERED_POPUP: [
                  {
                    cond: 'isAnyVcTampered',
                    target: 'tamperedVCs',
                  },
                ],
              },
            },
            tamperedVCs: {
              initial: 'idle',
              on: {
                REMOVE_TAMPERED_VCS: {
                  actions: ['resetTamperedVcs'],
                  target: '.triggerAutoBackupForTamperedVcDeletion',
                },
              },
              states: {
                idle: {},
                triggerAutoBackupForTamperedVcDeletion: {
                  invoke: {
                    src: 'isUserSignedAlready',
                    onDone: [
                      {
                        cond: 'isSignedIn',
                        actions: ['sendBackupEvent', 'logTamperedVCsremoved'],
                        target: '#vcMeta.ready',
                      },
                      {
                        actions: 'logTamperedVCsremoved',
                        target: '#vcMeta.ready',
                      },
                    ],
                  },
                },
              },
            },
          },
          on: {
            REFRESH_MY_VCS: {
              target: '#vcMeta.ready',
            },
            WALLET_BINDING_SUCCESS: {
              actions: 'setWalletBindingSuccess',
            },
            REVERIFY_VC_SUCCESS: {
              actions: 'setReverificationSuccess',
            },
            RESET_REVERIFY_VC_SUCCESS: {
              actions: 'resetReverificationSuccess',
            },
            REVERIFY_VC_FAILED: {
              actions: 'setReverificationFailed',
            },
            RESET_REVERIFY_VC_FAILED: {
              actions: 'resetReverificationFailed',
            },
            RESET_HIGHLIGHT: {
              actions: 'resetHighlightVcKey',
            },
            GET_VC_ITEM: {
              actions: 'getVcItemResponse',
            },
            VC_ADDED: {
              actions: 'prependToMyVcsMetadata',
            },
            REMOVE_VC_FROM_CONTEXT: {
              actions: 'removeVcFromMyVcsMetadata',
            },
            VC_METADATA_UPDATED: {
              actions: ['updateMyVcsMetadata', 'setUpdatedVcMetadatas'],
            },
            VC_DOWNLOADED: {
              actions: ['setDownloadCredentialsSuccess', 'setDownloadedVc'],
            },
            ADD_VC_TO_IN_PROGRESS_DOWNLOADS: {
              actions: 'addVcToInProgressDownloads',
            },
            REMOVE_VC_FROM_IN_PROGRESS_DOWNLOADS: {
              actions: 'removeVcFromInProgressDownlods',
            },
            RESET_IN_PROGRESS_VCS_DOWNLOADED: {
              actions: 'resetInProgressVcsDownloaded',
            },
            RESET_WALLET_BINDING_SUCCESS: {
              actions: 'resetWalletBindingSuccess',
            },
            REFRESH_RECEIVED_VCS: {
              target: '#vcMeta.ready.receivedVcs',
            },
            DOWNLOAD_LIMIT_EXPIRED: {
              actions: [
                'removeVcFromInProgressDownlods',
                'setDownloadingFailedVcs',
              ],
            },
            DELETE_VC: {
              target: 'deletingFailedVcs',
            },
            VERIFY_VC_FAILED: {
              actions: [
                'removeVcFromInProgressDownlods',
                'setVerificationErrorMessage',
              ],
              target: '#vcMeta.ready',
            },
            RESET_VERIFY_ERROR: {
              actions: 'resetVerificationErrorMessage',
            },
            SET_VERIFICATION_STATUS: {
              actions: 'setVerificationStatus',
            },
            RESET_VERIFICATION_STATUS: {
              actions: 'resetVerificationStatus',
            },
          },
        },
        deletingFailedVcs: {
          entry: 'removeDownloadFailedVcsFromStorage',
          on: {
            STORE_RESPONSE: {
              actions: [
                'removeDownloadingFailedVcsFromMyVcs',
                'resetDownloadFailedVcs',
              ],
              target: '#vcMeta.ready',
            },
          },
        },
      },
    },
    {
      actions: VCMetaActions(model),
      guards: VCMetaGuards(),
      services: VCMetaServices(),
    },
  );

export function createVcMetaMachine(serviceRefs: AppServices) {
  return vcMetaMachine.withContext({
    ...vcMetaMachine.context,
    serviceRefs,
  });
}
