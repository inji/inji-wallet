import {EventFrom} from 'xstate';
import {openID4VPModel} from './openID4VPModel';
import {openID4VPServices} from './openID4VPServices';
import {openID4VPActions} from './openID4VPActions';
import {AppServices} from '../../shared/GlobalContext';
import {openID4VPGuards} from './openID4VPGuards';
import {send, sendParent} from 'xstate/lib/actions';

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
      LOG_ACTIVITY: {
        actions: 'logActivity',
      },
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
          onDone: {
            cond: 'hasKeyPair',
            target: 'authenticateVerifier',
          },
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
          onError: {
            actions: 'setAuthenticationError',
            target: 'showError',
          },
        },
        exit: 'resetIsShowLoadingScreen',
      },
      checkVerifierTrust: {
        invoke: {
          src: 'isVerifierTrusted',
          onDone: [
            {
              cond: (ctx, e) => e.data === true,
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
        after: {
          200: 'sendDismissToParent',
        },
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
          onError: {
            actions: model.assign({
              error: () => 'failed to update trusted verifier list',
            }),
            target: 'showError',
          },
        },
      },

      getVCsSatisfyingAuthRequest: {
        entry: ['dismissTrustModal'],
        on: {
          DOWNLOADED_VCS: [
            {
              cond: 'isSimpleOpenID4VPShare',
              actions: 'getVcsMatchingAuthRequest',
              target: 'selectingVCs',
            },
            {
              actions: 'getVcsMatchingAuthRequest',
              target: 'setSelectedVC',
            },
          ],
        },
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
          CANCEL: {
            actions: 'forwardToParent',
            target: 'waitingForData',
          },
        },
      },
      getConsentForVPSharing: {
        on: {
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
              actions: [
                model.assign({
                  error: () => 'none of the selected VC has image',
                }),
              ],
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
              target: 'success',
            },
            {
              actions: [
                send({
                  type: 'LOG_ACTIVITY',
                  logType: 'SHARED_SUCCESSFULLY',
                }),
                sendParent('SUCCESS'),
              ],
              target: 'success',
            },
          ],
          onError: {
            actions: [
              send({
                type: 'LOG_ACTIVITY',
                logType: 'RETRY_ATTEMPT_FAILED',
              }),
              'setSendVPShareError',
              sendParent('SHOW_ERROR'),
            ],
            target: 'showError',
          },
        },
        after: {
          SHARING_TIMEOUT: {
            actions: sendParent('TIMEOUT'),
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
            actions: sendParent('DISMISS'),
          },
        },
      },
      showError: {
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
      success: {},
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
