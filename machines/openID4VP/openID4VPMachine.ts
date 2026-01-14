import {EventFrom} from 'xstate';
import {openID4VPModel} from './openID4VPModel';
import {openID4VPServices} from './openID4VPServices';
import {openID4VPActions} from './openID4VPActions';
import {AppServices} from '../../shared/GlobalContext';
import {openID4VPGuards} from './openID4VPGuards';
import {send, sendParent} from 'xstate/lib/actions';
import {IssuersModel} from '../Issuers/IssuersModel';
import {VCShareFlowType} from '../../shared/Utils';
import {OVP_ERROR_MESSAGES} from '../../shared/constants';

const model = openID4VPModel;

export const OpenID4VPEvents = model.events;

export const openID4VPMachine = model.createMachine(
  {
    predictableActionArguments: true,
    preserveActionOrder: true,
    tsTypes: {} as import('./openID4VPMachine.typegen').Typegen0,
    schema: {
      context: model.initialContext,
      events: {} as EventFrom<typeof model>,
    },
    id: 'OpenID4VP',
    initial: 'waitingForData',
    on: {
      AUTHENTICATE_VIA_PRESENTATION: {
        actions: ['setPresentationRequest', 'setFlowType'],
        target: 'checkFaceAuthConsent',
      },
      DISMISS_POPUP: [
        {
          cond: 'isSimpleOpenID4VPShare',
          actions: 'resetIsShareWithSelfie',
          target: 'selectingVCs',
        },
        {
          actions: 'forwardToParent',
          target: 'waitingForData',
        },
      ],
      LOG_ACTIVITY: [
        {
          cond: 'isNotAuthorizationFlow',
          actions: 'logActivity',
        },
      ],
    },
    states: {
      waitingForData: {
        on: {
          AUTHENTICATE: {
            actions: [
              'setUrlEncodedAuthorizationRequest',
              'setFlowType',
              'setMiniViewShareSelectedVC',
              'setIsShareWithSelfie',
              'setIsOVPViaDeepLink',
            ],
            target: 'checkFaceAuthConsent',
          },
        },
      },
      checkFaceAuthConsent: {
        entry: ['setIsShowLoadingScreen', 'getFaceAuthConsent'],
        on: {
          STORE_RESPONSE: {target: 'checkIfClientValidationIsRequired'},
        },
      },
      checkIfClientValidationIsRequired: {
        invoke: {
          src: 'shouldValidateClient',
          onDone: [
            {
              cond: 'isClientValidationRequred',
              actions: 'updateShowFaceAuthConsent',
              target: 'getTrustedVerifiersList',
            },
            {
              actions: 'updateShowFaceAuthConsent',
              target: 'getKeyPairFromKeystore',
            },
          ],
        },
      },
      getTrustedVerifiersList: {
        invoke: {
          src: 'fetchTrustedVerifiers',
          onDone: {
            actions: 'setTrustedVerifiers',
            target: 'getKeyPairFromKeystore',
          },
          onError: {
            actions: [
              'setTrustedVerifiersApiCallError',
              'resetIsShowLoadingScreen',
            ],
          },
        },
      },
      getKeyPairFromKeystore: {
        invoke: {
          src: 'getKeyPair',
          onDone: {
            actions: ['loadKeyPair'],
            target: 'checkKeyPair',
          },
          onError: [
            {
              actions: 'setError',
            },
          ],
        },
      },
      checkKeyPair: {
        description: 'checks whether key pair is generated',
        invoke: {
          src: 'getSelectedKey',
          onDone: [
            {
              cond: 'isAuthorizationFlow',
              actions: [
                'setAuthenticationResponseForPresentationAuthFlow',
                'resetIsShowLoadingScreen',
              ],
              target: 'checkVerifierTrust',
            },
            {
              cond: 'hasKeyPair',
              target: 'authenticateVerifier',
            },
          ],
          onError: [
            {
              actions: 'setError',
            },
          ],
        },
      },
      authenticateVerifier: {
        invoke: {
          src: 'getAuthenticationResponse',
          onDone: {
            actions: 'setAuthenticationResponse',
            target: 'checkVerifierTrust',
          },
          onError: [
            {
              cond: 'isAuthorizationFlow',
              actions: 'setAuthenticationError',
              target: '#OpenID4VP.authFlowFailed',
            },
            {
              actions: 'setAuthenticationError',
              target: 'showError',
            },
          ],
        },
        exit: 'resetIsShowLoadingScreen',
      },
      checkVerifierTrust: {
        invoke: {
          src: 'isVerifierTrusted',
          onDone: [
            {
              cond: (_, e) => e.data === true,
              target: 'getVCsSatisfyingAuthRequest',
            },
            {
              target: 'requestVerifierConsent',
            },
          ],
          onError: {
            target: 'requestVerifierConsent',
          },
        },
      },

      requestVerifierConsent: {
        entry: ['showTrustConsentModal'],
        on: {
          VERIFIER_TRUST_CONSENT_GIVEN: {
            actions: 'dismissTrustModal',
            target: 'storeTrustedVerifier',
          },
          CANCEL: {
            actions: 'dismissTrustModal',
            target: 'delayBeforeDismissToParent',
          },
        },
      },

      delayBeforeDismissToParent: {
        always: [
          {
            cond: 'isAuthorizationFlow',
            actions: [sendParent('VP_CONSENT_REJECT')],
            target: 'waitingForData',
          },
          {
            target: 'sendDismissToParent',
          },
        ],
      },
      sendDismissToParent: {
        entry: sendParent('DISMISS'),
        always: 'waitingForData',
      },

      storeTrustedVerifier: {
        invoke: {
          src: 'storeTrustedVerifier',
          onDone: {
            target: 'getVCsSatisfyingAuthRequest',
          },
          onError: [
            {
              cond: 'isAuthorizationFlow',
              actions: model.assign({
                error: () => 'failed to update trusted verifier list',
              }),
              target: '#OpenID4VP.authFlowFailed',
            },
            {
              actions: model.assign({
                error: () => 'failed to update trusted verifier list',
              }),
              target: 'showError',
            },
          ],
        },
      },

      getVCsSatisfyingAuthRequest: {
        entry: ['dismissTrustModal'],
        on: {
          DOWNLOADED_VCS: {
            actions: 'getVcsMatchingAuthRequest',
            target: 'checkIfAnyMatchingVCs',
          },
        },
      },

      checkIfAnyMatchingVCs: {
        always: [
          {
            cond: 'hasNoMatchingVCsAndIsAuthorizationFlow',
            target: 'noMatchingVCs',
          },
          {
            cond: 'isSimpleOpenID4VPShare',
            target: 'selectingVCs',
          },
          {
            target: 'setSelectedVC',
          },
        ],
      },

      noMatchingVCs: {
        entry: [
          model.assign({
            error: () => OVP_ERROR_MESSAGES.NO_MATCHING_VCS,
          }),
        ],
        always: [{target: 'authFlowFailed'}],
      },

      setSelectedVC: {
        entry: send('SET_SELECTED_VC'),
        on: {
          SET_SELECTED_VC: [
            {
              actions: 'compareAndStoreSelectedVC',
              target: 'checkIfMatchingVCsHasSelectedVC',
            },
          ],
        },
      },
      checkIfMatchingVCsHasSelectedVC: {
        entry: send('CHECK_SELECTED_VC'),
        on: {
          CHECK_SELECTED_VC: [
            {
              cond: 'isSelectedVCMatchingRequest',
              target: 'getConsentForVPSharing',
            },
            {
              cond: 'isAuthorizationFlow',
              actions: [
                model.assign({
                  error: () => 'credential mismatch detected',
                }),
              ],
              target: '#OpenID4VP.authFlowFailed',
            },
            {
              actions: [
                model.assign({
                  error: () => 'credential mismatch detected',
                }),
              ],
              target: 'showError',
            },
          ],
        },
      },
      selectingVCs: {
        // TODO: On entering this state, an event can be sent to parent stating VCs matching done and ready for selection
        on: {
          VERIFY_AND_ACCEPT_REQUEST: {
            actions: [
              'setSelectedVCs',
              model.assign({isShareWithSelfie: () => true}),
            ],
            target: 'getConsentForVPSharing',
          },
          ACCEPT_REQUEST: {
            target: 'getConsentForVPSharing',
            actions: [
              'setSelectedVCs',
              'setShareLogTypeUnverified',
              'resetFaceCaptureBannerStatus',
            ],
          },
          CANCEL: [
            {
              cond: 'isAuthorizationFlow',
              actions: [
                () => console.warn('User cancelled the authorization flow'),
                sendParent({type: 'VP_CONSENT_REJECT'}),
              ],
              target: 'waitingForData',
            },
            {
              actions: 'forwardToParent',
              target: 'waitingForData',
            },
          ],
        },
      },
      getConsentForVPSharing: {
        entry: send('CHECK_FOR_CONSENT'),
        on: {
          CHECK_FOR_CONSENT: [
            {
              cond: 'isAuthorizationFlow',
              actions: send('CONFIRM'),
            },
          ],
          CONFIRM: [
            {
              cond: 'showFaceAuthConsentScreen',
              target: 'faceVerificationConsent',
            },
            {
              cond: 'isShareWithSelfie',
              target: 'checkIfAnySelectedVCHasImage',
            },
            {
              target: 'sendingVP',
            },
          ],
          CANCEL: {
            target: 'showConfirmationPopup',
          },
        },
      },
      showConfirmationPopup: {
        on: {
          CONFIRM: {
            actions: [
              send({
                type: 'LOG_ACTIVITY',
                logType: 'USER_DECLINED_CONSENT',
              }),
            ],
            target: 'shareVPDeclineStatusToVerifier',
          },
          GO_BACK: {
            target: 'getConsentForVPSharing',
          },
        },
      },
      faceVerificationConsent: {
        on: {
          FACE_VERIFICATION_CONSENT: [
            {
              cond: 'isSimpleOpenID4VPShare',
              actions: ['setShowFaceAuthConsent', 'storeShowFaceAuthConsent'],
              target: 'checkIfAnySelectedVCHasImage',
            },
            {
              actions: ['setShowFaceAuthConsent', 'storeShowFaceAuthConsent'],
              target: 'verifyingIdentity',
            },
          ],
        },
      },
      checkIfAnySelectedVCHasImage: {
        entry: send('CHECK_FOR_IMAGE'),
        on: {
          CHECK_FOR_IMAGE: [
            {
              cond: 'isAnyVCHasImage',
              target: 'verifyingIdentity',
            },
            {
              cond: 'isAuthorizationFlow',
              actions: model.assign({
                error: () => 'none of the selected VC has image',
              }),
              target: '#OpenID4VP.authFlowFailed',
            },
            {
              actions: model.assign({
                error: () => 'none of the selected VC has image',
              }),
              target: 'showError',
            },
          ],
        },
      },
      verifyingIdentity: {
        on: {
          FACE_VALID: [
            {
              cond: 'hasKeyPair',
              actions: 'updateFaceCaptureBannerStatus',
              target: 'sendingVP',
            },
            {
              target: 'checkKeyPair',
            },
          ],
          FACE_INVALID: [
            {
              cond: 'isFaceVerificationRetryAttempt',
              actions: send({
                type: 'LOG_ACTIVITY',
                logType: 'FACE_VERIFICATION_FAILED_AFTER_RETRY_ATTEMPT',
              }),
              target: 'invalidIdentity',
            },
            {
              actions: [
                send({
                  type: 'LOG_ACTIVITY',
                  logType: 'FACE_VERIFICATION_FAILED',
                }),
                'setIsFaceVerificationRetryAttempt',
              ],
              target: 'invalidIdentity',
            },
          ],
          CANCEL: [
            {
              cond: 'isAuthorizationFlow',
              actions: 'resetIsShareWithSelfie',
              target: 'selectingVCs',
            },
            {
              cond: 'isSimpleOpenID4VPShare',
              actions: 'resetIsShareWithSelfie',
              target: 'selectingVCs',
            },
            {
              actions: sendParent('DISMISS'),
            },
          ],
        },
      },
      invalidIdentity: {
        on: {
          DISMISS: [
            {
              cond: 'isAuthorizationFlow',
              actions: [
                model.assign({error: () => 'face verification failed'}),
                sendParent(ctx => ({
                  type: 'SHOW_ERROR',
                  error: ctx.error,
                  source: 'OpenID4VP',
                })),
              ],
              target: 'selectingVCs',
            },
            {
              cond: 'isSimpleOpenID4VPShare',
              actions: 'resetIsFaceVerificationRetryAttempt',
              target: 'selectingVCs',
            },
            {
              actions: [
                'resetIsFaceVerificationRetryAttempt',
                sendParent('DISMISS'),
              ],
            },
          ],

          RETRY_VERIFICATION: {
            target: 'verifyingIdentity',
          },
        },
      },
      sendingVP: {
        entry: sendParent('IN_PROGRESS'),
        on: {
          CLOSE_BANNER: {
            actions: 'resetFaceCaptureBannerStatus',
          },
        },
        initial: 'prepare',
        states: {
          prepare: {
            // if isAuthorizationFlow go to constructVP else sendVP
            always: [
              {
                cond: 'isAuthorizationFlow',
                target: 'constructVP',
              },
              {
                target: 'sendVP',
              },
            ],
          },
          constructVP: {
            initial: 'constructing',
            on: {
              SIGN_VP: {
                actions: ['setUnsignedVPToken'],
                target: '#signVP',
              },
            },
            states: {
              constructing: {
                invoke: {
                  src: 'sendSelectedCredentialsForVP',
                  onDone: {},
                  onError: [
                    {
                      cond: 'isAuthorizationFlow',
                      actions: 'setConstructVPError',
                      target: '#OpenID4VP.authFlowFailed',
                    },
                    {
                      actions: [
                        send({
                          type: 'LOG_ACTIVITY',
                          logType: 'RETRY_ATTEMPT_FAILED',
                        }),
                        'setConstructVPError',
                        sendParent('SHOW_ERROR'),
                      ],
                      target: '#OpenID4VP.showError',
                    },
                  ],
                },
              },
              signVP: {
                id: 'signVP',
                invoke: {
                  src: 'signVP',
                  onDone: {
                    actions: [
                      sendParent((_context, event) =>
                        IssuersModel.events.SIGNED_DATA_FOR_VP(event),
                      ),
                    ],
                  },
                  onError: [
                    {
                      cond: 'isAuthorizationFlow',
                      actions: 'setSignVPError',
                      target: '#OpenID4VP.authFlowFailed',
                    },
                    {
                      actions: ['setSignVPError', sendParent('SHOW_ERROR')],
                      target: '#showError',
                    },
                  ],
                },
              },
            },
          },
          sendVP: {
            invoke: {
              src: 'sendVP',
              onDone: [
                {
                  cond: 'isShareWithSelfie',
                  actions: [
                    send({
                      type: 'LOG_ACTIVITY',
                      logType: 'SHARED_WITH_FACE_VERIFIACTION',
                    }),
                    sendParent('SUCCESS'),
                  ],
                  target: '#success',
                },
                {
                  actions: [
                    send({
                      type: 'LOG_ACTIVITY',
                      logType: 'SHARED_SUCCESSFULLY',
                    }),
                    sendParent('SUCCESS'),
                  ],
                  target: '#success',
                },
              ],
              onError: [
                {
                  cond: 'isAuthorizationFlow',
                  actions: 'setSendVPShareError',
                  target: '#OpenID4VP.authFlowFailed',
                },
                {
                  actions: [
                    send({
                      type: 'LOG_ACTIVITY',
                      logType: 'RETRY_ATTEMPT_FAILED',
                    }),
                    'setSendVPShareError',
                    sendParent('SHOW_ERROR'),
                  ],
                  target: '#showError',
                },
              ],
            },
            after: {
              SHARING_TIMEOUT: {
                actions: sendParent('TIMEOUT'),
              },
            },
          },
        },
      },
      shareVPDeclineStatusToVerifier: {
        invoke: {
          src: 'shareDeclineStatus',
          onError: (_, event) =>
            console.error(
              'Failed to send decline status to verifier - ',
              event.data,
            ),
        },
        after: {
          200: {
            actions: sendParent(ctx =>
              ctx.flowType === VCShareFlowType.OPENID4VP_AUTHORIZATION
                ? {type: 'VP_CONSENT_REJECT'}
                : {type: 'DISMISS'},
            ),
          },
        },
      },
      showError: {
        id: 'showError',
        on: {
          RETRY: {
            actions: ['resetError', 'incrementOpenID4VPRetryCount'],
            target: 'sendingVP',
          },
          RESET_RETRY_COUNT: {
            actions: ['resetError', 'resetOpenID4VPRetryCount'],
          },
          RESET_ERROR: {
            actions: 'resetError',
          },
        },
      },
      success: {
        id: 'success',
      },
      authFlowFailed: {
        entry: [
          sendParent(context => ({
            type: 'SHOW_ERROR',
            source: 'OpenID4VP',
            error: context.error,
          })),
        ],
        always: 'waitingForData',
      },
    },
  },
  {
    actions: openID4VPActions(model),
    services: openID4VPServices(),
    guards: openID4VPGuards(),
    delays: {
      SHARING_TIMEOUT: 15 * 1000,
    },
  },
);

export function createOpenID4VPMachine(serviceRefs: AppServices) {
  return openID4VPMachine.withContext({
    ...openID4VPMachine.context,
    serviceRefs,
  });
}
