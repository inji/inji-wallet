import {assign} from 'xstate';
import {send, sendParent} from 'xstate/lib/actions';
import {
  OVP_ERROR_MESSAGES,
  SHOW_FACE_AUTH_CONSENT_SHARE_FLOW,
} from '../../shared/constants';
import {VC} from '../VerifiableCredential/VCMetaMachine/vc';
import {StoreEvents} from '../store';
import {JSONPath} from 'jsonpath-plus';

import {VCShareFlowType} from '../../shared/Utils';
import {ActivityLogEvents} from '../activityLog';
import {VPShareActivityLog} from '../../components/VPShareActivityLogEvent';
import {OpenID4VP} from '../../shared/openID4VP/OpenID4VP';

// TODO - get this presentation definition list which are alias for scope param
// from the verifier end point after the endpoint is created and exposed.

export const openID4VPActions = (model: any) => {
  let requestedClaimsByVerifier;
  return {
    setAuthenticationResponse: model.assign({
      authenticationResponse: (_, event) => event.data,
    }),

    setUrlEncodedAuthorizationRequest: model.assign({
      urlEncodedAuthorizationRequest: (_, event) => event.encodedAuthRequest,
    }),

    setFlowType: model.assign({
      flowType: (_, event) => event.flowType,
    }),

    getVcsMatchingAuthRequest: model.assign({
      vcsMatchingAuthRequest: (context, event) => {
        let vcs = event.vcs;
        let matchingVCs = {} as Record<string, [VC]>;
        let presentationDefinition =
          context.authenticationResponse['presentation_definition'];
        let anyInputDescriptorHasFormatOrConstraints = false;
        requestedClaimsByVerifier = new Set();
        vcs.forEach(vc => {
          presentationDefinition['input_descriptors'].forEach(
            inputDescriptor => {
              const format =
                inputDescriptor.format ?? presentationDefinition.format;
              anyInputDescriptorHasFormatOrConstraints =
                anyInputDescriptorHasFormatOrConstraints ||
                format !== undefined ||
                inputDescriptor.constraints.fields !== undefined;

              const isMatchingConstraints = isVCMatchingRequestConstraints(
                inputDescriptor.constraints,
                vc.verifiableCredential.credential,
                requestedClaimsByVerifier,
              );

              const areMatchingFormatAndProofType =
                areVCFormatAndProofTypeMatchingRequest(
                  format,
                  vc.format,
                  vc?.verifiableCredential?.credential?.proof?.type,
                );

              if (inputDescriptor.constraints.fields && format) {
                if (isMatchingConstraints && areMatchingFormatAndProofType) {
                  matchingVCs[inputDescriptor.id]?.push(vc) ||
                    (matchingVCs[inputDescriptor.id] = [vc]);
                }
              } else if (
                isMatchingConstraints ||
                areMatchingFormatAndProofType
              ) {
                matchingVCs[inputDescriptor.id]?.push(vc) ||
                  (matchingVCs[inputDescriptor.id] = [vc]);
              }
            },
          );
        });
        if (!anyInputDescriptorHasFormatOrConstraints) {
          matchingVCs[presentationDefinition['input_descriptors'][0].id] = vcs;
        }
        if (Object.keys(matchingVCs).length === 0) {
          OpenID4VP.sendErrorToVerifier(OVP_ERROR_MESSAGES.NO_MATCHING_VCS);
        }
        return matchingVCs;
      },
      requestedClaims: () => Array.from(requestedClaimsByVerifier).join(','),
      purpose: context => {
        const response = context.authenticationResponse;
        const pd = response['presentation_definition'];
        return pd.purpose ?? '';
      },
    }),

    setSelectedVCs: model.assign({
      selectedVCs: (_, event) => event.selectedVCs,
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
        console.error('Error:', event.data.message);
        return 'vc validation - ' + event.data.message;
      },
    }),

    setTrustedVerifiersApiCallError: model.assign({
      error: (_, event) => {
        console.error('Error:', event.data.message);
        return 'api error - ' + event.data.message;
      },
    }),

    setSendVPShareError: model.assign({
      error: (_, event) => {
        console.error('Error:', event.data.message);
        return 'send vp - ' + event.data.message;
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

    shareDeclineStatus: () => {
      OpenID4VP.sendErrorToVerifier(OVP_ERROR_MESSAGES.DECLINED);
    },

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
  };
};

function areVCFormatAndProofTypeMatchingRequest(
  format: Record<string, any>,
  vcFormatType: string,
  vcProofType: string,
): boolean {
  if (!format) {
    return false;
  }
  return Object.entries(format).some(
    ([type, value]) =>
      type === vcFormatType && value.proof_type.includes(vcProofType),
  );
}

function isVCMatchingRequestConstraints(
  constraints,
  credential,
  requestedClaimsByVerifier,
): boolean {
  if (!constraints.fields) {
    return false;
  }
  for (const field of constraints.fields) {
    for (const path of field.path) {
      const pathArray = JSONPath.toPathArray(path);
      requestedClaimsByVerifier.add(pathArray[pathArray.length - 1]);
      const valueMatchingPath = JSONPath({
        path: path,
        json: credential,
      })[0];

      if (
        valueMatchingPath !== undefined &&
        field.filter?.type === typeof valueMatchingPath &&
        String(valueMatchingPath).includes(field.filter?.pattern)
      ) {
        return true;
      }
    }
  }
  return false;
}
