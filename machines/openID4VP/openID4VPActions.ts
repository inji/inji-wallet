import {assign} from 'xstate';
import {send, sendParent} from 'xstate/lib/actions';
import {
  OVP_ERROR_CODE,
  OVP_ERROR_MESSAGES,
  SHOW_FACE_AUTH_CONSENT_SHARE_FLOW,
} from '../../shared/constants';
import {VC} from '../VerifiableCredential/VCMetaMachine/vc';
import {StoreEvents} from '../store';
import {JSONPath} from 'jsonpath-plus';

import {parseJSON, VCShareFlowType} from '../../shared/Utils';
import {ActivityLogEvents} from '../activityLog';
import {VPShareActivityLog} from '../../components/VPShareActivityLogEvent';
import OpenID4VP from '../../shared/openID4VP/OpenID4VP';
import {VCFormat} from '../../shared/VCFormat';
import {
  getIssuerAuthenticationAlorithmForMdocVC,
  getMdocAuthenticationAlorithm,
} from '../../components/VC/common/VCUtils';

// TODO - get this presentation definition list which are alias for scope param
// from the verifier end point after the endpoint is created and exposed.

export const openID4VPActions = (model: any) => {
  let result;
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

    // getVcsMatchingAuthRequest: model.assign({
    //   vcsMatchingAuthRequest: (context, event) => {
    //     result = getVcsMatchingAuthRequest(context, event);
    //     return result.matchingVCs;
    //   },
    //   requestedClaims: () => result.requestedClaims,
    //
    //   purpose: context => {
    //     return result.purpose ?? '';
    //   },
    //
    //   hasNoMatchingVCs: () => {
    //     return (
    //       !result.matchingVCs ||
    //       Object.keys(result.matchingVCs).length === 0 ||
    //       Object.values(result.matchingVCs).every(
    //         value => Array.isArray(value) && value.length === 0,
    //       )
    //     );
    //   },
    // }),

    setMatchingVCs: model.assign({
      vcsMatchingAuthRequest: (_, event) => {
        return event.data.matchingVCs;
      },
      requestedClaims: (_, event) => event.data.requestedClaims,
      purpose: (_, event) => event.data.purpose,
      hasNoMatchingVCs: (_, event) => {
        const matchingVCs = event.data.matchingVCs;
        return (
          !matchingVCs ||
          Object.keys(matchingVCs).length === 0 ||
          Object.values(matchingVCs).every(
            value => Array.isArray(value) && value.length === 0,
          )
        );
      },
    }),

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
        Object.entries(context.vcsMatchingAuthRequest).map(
          ([inputDescriptorId, vcs]) =>
            (vcs as VC[]).map(vcData => {
              if (
                vcData.vcMetadata.requestId ===
                context.miniViewSelectedVC.vcMetadata.requestId
              ) {
                matchingVcs[inputDescriptorId] = [vcData];
              }
            }),
        );
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

    loadKeyPair: assign({
      publicKey: (_, event: any) => event.data?.publicKey as string,
      privateKey: (context: any, event: any) =>
        event.data?.privateKey
          ? event.data.privateKey
          : (context.privateKey as string),
    }),

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
        return event.data.code;
      },
    }),

    setTrustedVerifiersApiCallError: model.assign({
      error: (_, event) => {
        console.error('Error while fetching trusted verifiers:', event.data);
        return 'api error - ' + event.data.message;
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
        return 'sign vp-' + event.data.message + '-' + event.data.code;
      },
    }),

    setSendVPShareError: model.assign({
      error: (_, event) => {
        console.error('Error:', event.data.message, event.data.code);
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
  };
};
