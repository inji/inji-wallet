import {createMachine} from 'xstate';
import type {ActorRefFrom} from 'xstate';
import {MdocPresentationActions} from './mdocPresentationActions';
import {
  countApprovedElements,
  hasCompleteSelection,
} from './mdocPresentationGuards';
import {mdocPresentationModel as presentationModel} from './mdocPresentationModel';
import type {
  MdocPresentationContext,
  MdocPresentationDependencies,
  MdocPresentationEvent,
} from './mdocPresentationModel';
import {
  MdocPresentationServices,
  resolvePresentationDependencies,
} from './mdocPresentationServices';

export function createMdocPresentationMachine(
  overrides: Partial<MdocPresentationDependencies> = {},
) {
  const dependencies = resolvePresentationDependencies(overrides);
  return createMachine<MdocPresentationContext, MdocPresentationEvent>(
    {
      id: 'mdocPresentation',
      predictableActionArguments: true,
      preserveActionOrder: true,
      initial: 'presenting',
      context: {
        ...presentationModel.initialContext,
        selection: {},
        checkedFields: {},
        matches: [],
      },
      states: {
        presenting: {
          initial: 'showingCode',
          entry: 'resetSession',
          invoke: {id: 'presentation', src: 'present'},
          on: {
            QR_READY: {actions: 'setQr'},
            PROGRESS: [
              {
                cond: (_, event) => event.progress === 'connecting',
                target: '.connecting',
                actions: ['setProgress', 'hideQr'],
              },
              {
                cond: (_, event) => event.progress === 'connected',
                target: '.waitingForRequest',
                actions: ['setProgress', 'hideQr'],
              },
              {
                cond: (_, event) => event.progress === 'sendingResponse',
                target: '.sending',
                actions: ['setProgress', 'markSending'],
              },
              {actions: 'setProgress'},
            ],
            REQUEST_RECEIVED: {
              target: '.reviewingRequest',
              actions: 'setRequest',
            },
            RESULT: {
              target: '#mdocPresentation.outcome',
              actions: ['setResult', 'recordActivity'],
            },
            CANCEL: {target: '.stopping'},
            STOP: {target: '.stopping'},
            APP_INACTIVE: {target: '.stopping'},
            DISMISS: {target: '.stopping', actions: 'dismissAfterStop'},
          },
          states: {
            showingCode: {},
            connecting: {},
            waitingForRequest: {},
            reviewingRequest: {
              on: {
                SELECT_CARD: {actions: 'selectCard'},
                TOGGLE_FIELD: {actions: 'toggleField'},
                SELECT_ALL_FIELDS: {actions: 'setAllFields'},
                CLEAR_ALL_FIELDS: {actions: 'setAllFields'},
                SHARE: {cond: 'hasCompleteSelection', target: 'preparing'},
                VERIFY_AND_SHARE: [
                  {
                    cond: context =>
                      hasCompleteSelection(context) &&
                      dependencies.showFaceAuthConsent,
                    target: 'faceVerificationConsent',
                  },
                  {cond: 'hasCompleteSelection', target: 'verifyingIdentity'},
                ],
                DECLINE: {target: 'declining', actions: 'declineRequest'},
              },
            },
            faceVerificationConsent: {
              on: {
                FACE_VERIFICATION_CONSENT: 'verifyingIdentity',
                DECLINE: {target: 'declining', actions: 'declineRequest'},
              },
            },
            verifyingIdentity: {
              on: {
                FACE_VALID: {
                  target: 'preparing',
                  actions: 'markIdentityVerified',
                },
                FACE_INVALID: {
                  target: 'invalidIdentity',
                  actions: 'recordFaceVerificationFailure',
                },
              },
            },
            invalidIdentity: {
              on: {
                RETRY_VERIFICATION: 'verifyingIdentity',
                DECLINE: {target: 'declining', actions: 'declineRequest'},
              },
            },
            preparing: {
              entry: 'clearError',
              invoke: {
                src: 'prepare',
                onDone: {
                  target: 'sending',
                  actions: ['rememberResponse', 'shareRequest', 'markSending'],
                },
                onError: {
                  target: 'preparationFailed',
                  actions: 'setPreparationError',
                },
              },
            },
            preparationFailed: {
              on: {
                TOGGLE_FIELD: {
                  target: 'reviewingRequest',
                  actions: 'toggleField',
                },
                RETRY: 'preparing',
                SELECT_CARD: {
                  target: 'reviewingRequest',
                  actions: 'selectCard',
                },
                DECLINE: {target: 'declining', actions: 'declineRequest'},
              },
            },
            sending: {
              on: {ANSWER: {actions: 'forwardAnswerToPresentation'}},
            },
            declining: {
              on: {ANSWER: {actions: 'forwardAnswerToPresentation'}},
            },
            stopping: {
              entry: 'cancelPresentation',
              on: {
                CANCEL: {},
                STOP: {},
                APP_INACTIVE: {},
                QR_READY: {},
                PROGRESS: {},
                REQUEST_RECEIVED: {},
                DISMISS: {actions: 'dismissAfterStop'},
              },
            },
          },
        },
        outcome: {
          always: {cond: context => context.dismissAfterStop, target: 'done'},
          on: {NEW_CODE: 'presenting', DONE: 'done', DISMISS: 'done'},
        },
        done: {
          type: 'final',
          data: context => ({
            result: context.result,
            outcome: context.outcome,
            nothingShared: !context.responseStarted,
            sharedDetailCount:
              context.outcome === 'shared'
                ? countApprovedElements(
                    context.matches,
                    context.selection,
                    context.checkedFields,
                  )
                : 0,
          }),
        },
      },
    },
    {
      actions: MdocPresentationActions(dependencies),
      guards: {hasCompleteSelection},
      services: MdocPresentationServices(dependencies),
    },
  );
}
export type MdocPresentationRef = ActorRefFrom<
  ReturnType<typeof createMdocPresentationMachine>
>;
export {MdocPresentationEvents} from './mdocPresentationModel';
