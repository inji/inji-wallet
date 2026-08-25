import {assign} from 'xstate';
import {send, sendParent} from 'xstate/lib/actions';
import {
  OVP_ERROR_CODE,
  OVP_ERROR_MESSAGES,
  SHOW_FACE_AUTH_CONSENT_SHARE_FLOW,
} from '../../shared/constants';
import {VC} from '../VerifiableCredential/VCMetaMachine/vc';
import {StoreEvents} from '../store';

import {parseJSON, VCShareFlowType} from '../../shared/Utils';
import {ActivityLogEvents} from '../activityLog';
import {VPShareActivityLog} from '../../components/VPShareActivityLogEvent';
import {
  MatchingVcsResult,
  MatchingVCsResultForDcql,
  MatchingVCsResultForPresentationExchangeRequest,
  VCInfo,
  VcWithMatchedClaims,
} from '../../shared/openID4VP/openid4vp.types';
import OpenID4VP from '../../shared/openID4VP/OpenID4VP';
import {isDcqlFlow} from '../../shared/openID4VP/OpenID4VPHelper';
import {openURLInSelectedBrowser} from '../../shared/browserUtils';

// TODO - get this presentation definition list which are alias for scope param
// from the verifier end point after the endpoint is created and exposed.

export const openID4VPActions = (model: any) => {
  return {
    setPresentationRequest: model.assign({
      presentationRequest: (_, event) => event.presentationRequest,
    }),

    setAuthenticationResponse: model.assign({
      authenticationResponse: (_, event) => event.data,
    }),

    setUrlEncodedAuthorizationRequest: model.assign({
      urlEncodedAuthorizationRequest: (_, event) => event.encodedAuthRequest,
    }),

    setFlowType: model.assign({
      flowType: (_, event) => event.flowType,
    }),

    setMatchingVCs: model.assign({
      matchingVCsResult: (_: any, event: {data: MatchingVcsResult}) =>
        event.data,
      requestedClaims: (
        _: any,
        event: {data: MatchingVCsResultForPresentationExchangeRequest},
      ) => event.data.requestedClaims,
      purpose: (
        _: any,
        event: {data: MatchingVCsResultForPresentationExchangeRequest},
      ) => event.data.purpose,
      hasNoMatchingVCs: (
        _: any,
        event: {data: MatchingVCsResultForPresentationExchangeRequest},
      ) => event.data.success === false,
    }),

    sendNoMatchingVcsErrorToVerifier: () => {
      void OpenID4VP.sendErrorToVerifier(
        OVP_ERROR_MESSAGES.NO_MATCHING_VCS,
        OVP_ERROR_CODE.NO_MATCHING_VCS,
      );
    },

    setAuthenticationResponseForPresentationAuthFlow: model.assign({
      authenticationResponse: (context, _) => context.presentationRequest,
    }),

    setSelectedVCs: model.assign({
      selectedVCs: (_, event) => event.selectedVCs,
      selectedDisclosuresByVc: (_, event) => event.selectedDisclosuresByVc,
    }),

    setUnsignedVPToken: model.assign({
      unsignedVPToken: (_, event) => {
        try {
          return parseJSON(event.data);
        } catch (error) {
          console.error('Error parsing unsignedVPToken:', error);
          return null;
        }
      },
    }),

    compareAndStoreSelectedVC: model.assign({
      selectedVCs: context => {
        const matchingVcs = {};
        const matchingVcsResult = context.matchingVCsResult;
        if (isDcqlFlow(context.authenticationResponse)) {
          Object.entries(
            (matchingVcsResult as MatchingVCsResultForDcql).matchingVCs,
          ).map(([credetialQueryId, mathingResult]) => {
            (mathingResult.matchingVcs as VcWithMatchedClaims[]).map(
              ({matchingVcInfo}) => {
                if (
                  matchingVcInfo.metadata.requestId ===
                  context.miniViewSelectedVC.vcMetadata.requestId
                ) {
                  matchingVcs[credetialQueryId] = [context.miniViewSelectedVC];
                }
              },
            );
          });
        } else {
          Object.entries(
            (
              matchingVcsResult as MatchingVCsResultForPresentationExchangeRequest
            ).matchingVCs,
          ).map(([inputDescriptorId, vcs]) =>
            (vcs as VCInfo[]).map(vcData => {
              if (
                vcData.metadata.requestId ===
                context.miniViewSelectedVC.vcMetadata.requestId
              ) {
                matchingVcs[inputDescriptorId] = [context.miniViewSelectedVC];
              }
            }),
          );
        }
        return matchingVcs;
      },
    }),

    setMiniViewShareSelectedVC: model.assign({
      miniViewSelectedVC: (_, event) => event.selectedVC,
    }),

    setIsShareWithSelfie: model.assign({
      isShareWithSelfie: (_, event) =>
        event.flowType ===
        VCShareFlowType.MINI_VIEW_SHARE_WITH_SELFIE_OPENID4VP,
    }),

    setIsOVPViaDeepLink: model.assign({
      isOVPViaDeepLink: (_, event) => event.isOVPViaDeepLink,
    }),

    resetIsOVPViaDeepLink: model.assign({
      isOVPViaDeepLink: () => false,
    }),

    setShowFaceAuthConsent: model.assign({
      showFaceAuthConsent: (_, event) => {
        return !event.isDoNotAskAgainChecked;
      },
    }),

    storeShowFaceAuthConsent: send(
      (_, event) =>
        StoreEvents.SET(
          SHOW_FACE_AUTH_CONSENT_SHARE_FLOW,
          !event.isDoNotAskAgainChecked,
        ),
      {
        to: context => context.serviceRefs.store,
      },
    ),

    getFaceAuthConsent: send(
      StoreEvents.GET(SHOW_FACE_AUTH_CONSENT_SHARE_FLOW),
      {
        to: (context: any) => context.serviceRefs.store,
      },
    ),

    updateShowFaceAuthConsent: model.assign({
      showFaceAuthConsent: (_, event) => {
        return event.response || event.response === null;
      },
    }),

    forwardToParent: sendParent('DISMISS'),

    setError: model.assign({
      error: (_, event) => {
        console.error('Error:', event.data.message);
        return event.data.message;
      },
    }),

    resetError: model.assign({
      error: () => '',
    }),

    resetIsShareWithSelfie: model.assign({isShareWithSelfie: () => false}),

    incrementOpenID4VPRetryCount: model.assign({
      openID4VPRetryCount: context => context.openID4VPRetryCount + 1,
    }),

    resetOpenID4VPRetryCount: model.assign({
      openID4VPRetryCount: () => 0,
    }),

    setAuthenticationError: model.assign({
      error: (_, event) => {
        console.error(
          'Error occurred during the authenticateVerifier call :',
          event.data.userInfo,
        );
        return event.data.code ?? 'unknown_error';
      },
    }),

    showTrustConsentModal: assign({
      showTrustConsentModal: () => true,
    }),

    dismissTrustModal: assign({
      showTrustConsentModal: () => false,
    }),

    setSignVPError: model.assign({
      error: (_, event) => {
        console.error(
          'Error during send VP:',
          event.data.message,
          event.data.code,
          event.data.cause,
        );
        return 'sign vp-' + event.data.message + '-' + event.data.code;
      },
    }),

    setSendVPShareError: model.assign({
      error: (_, event) => {
        console.error(
          'Error during send VP:',
          event.data.message,
          event.data.code,
          event.data.cause,
        );
        return 'send vp-' + event.data.message + '-' + event.data.code;
      },
    }),

    setTrustedVerifiers: model.assign({
      trustedVerifiers: (_: any, event: any) => event.data.response.verifiers,
    }),

    updateFaceCaptureBannerStatus: model.assign({
      showFaceCaptureSuccessBanner: () => true,
    }),

    resetFaceCaptureBannerStatus: model.assign({
      showFaceCaptureSuccessBanner: false,
    }),

    logActivity: send(
      (context: any, event: any) => {
        let logType = event.logType;

        if (logType === 'RETRY_ATTEMPT_FAILED') {
          logType =
            context.openID4VPRetryCount === 0
              ? 'SHARING_FAILED'
              : context.openID4VPRetryCount === 3
              ? 'MAX_RETRY_ATTEMPT_FAILED'
              : logType;
        }

        if (context.openID4VPRetryCount > 1) {
          switch (logType) {
            case 'SHARED_SUCCESSFULLY':
              logType = 'SHARED_AFTER_RETRY';
              break;
            case 'SHARED_WITH_FACE_VERIFIACTION':
              logType = 'SHARED_WITH_FACE_VERIFICATION_AFTER_RETRY';
          }
        }
        return ActivityLogEvents.LOG_ACTIVITY(
          VPShareActivityLog.getLogFromObject({
            type: logType,
            timestamp: Date.now(),
          }),
        );
      },
      {to: (context: any) => context.serviceRefs.activityLog},
    ),

    setIsFaceVerificationRetryAttempt: model.assign({
      isFaceVerificationRetryAttempt: () => true,
    }),

    resetIsFaceVerificationRetryAttempt: model.assign({
      isFaceVerificationRetryAttempt: () => false,
    }),

    setIsShowLoadingScreen: model.assign({
      showLoadingScreen: () => true,
    }),

    resetIsShowLoadingScreen: model.assign({
      showLoadingScreen: () => false,
    }),

    setAvailableWalletCredentials: model.assign({
      availableWalletCredentials: (_, event) => event.vcs,
    }),

    redirectToVerifier: async (_, event) => {
      const redirectUri = event?.data?.redirect_uri;

      if (!redirectUri || typeof redirectUri !== 'string') {
        return;
      }

      try {
        new URL(redirectUri);
        await openURLInSelectedBrowser(redirectUri);
      } catch (error) {
        console.warn('Error during redirection:', error);
        return;
      }
    },
  };
};
