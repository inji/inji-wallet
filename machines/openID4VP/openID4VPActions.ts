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

    getVcsMatchingAuthRequest: model.assign({
      vcsMatchingAuthRequest: (context, event) => {
        result = getVcsMatchingAuthRequest(context, event);
        return result.matchingVCs;
      },
      requestedClaims: () => result.requestedClaims,

      purpose: context => {
        const response = context.authenticationResponse;
        const pd = response['presentation_definition'];
        return pd.purpose ?? '';
      },

      hasNoMatchingVCs: () => {
        return (
          !result.matchingVCs ||
          Object.keys(result.matchingVCs).length === 0 ||
          Object.values(result.matchingVCs).every(
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
        console.log('event in setUnsignedVPToken action:', event);
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
  };
};

function getVcsMatchingAuthRequest(context, event) {
  const vcs = event.vcs;
  const matchingVCs: Record<string, any[]> = {};
  const requestedClaimsByVerifier = new Set<string>();
  const presentationDefinition =
    context.authenticationResponse['presentation_definition'];
  const inputDescriptors = presentationDefinition['input_descriptors'];
  let hasFormatOrConstraints = false;

  vcs.forEach(vc => {
    inputDescriptors.forEach(inputDescriptor => {
      const format = inputDescriptor.format ?? presentationDefinition.format;
      hasFormatOrConstraints =
        hasFormatOrConstraints ||
        format !== undefined ||
        inputDescriptor.constraints.fields !== undefined;

      const areMatchingFormatAndProofType =
        areVCFormatAndProofTypeMatchingRequest(format, vc);
      if (areMatchingFormatAndProofType == false) {
        inputDescriptors.forEach(inputDescriptor => {
          if (inputDescriptor.constraints?.fields) {
            inputDescriptor.constraints.fields.forEach(field => {
              if (field.path) {
                field.path.forEach(path => {
                  try {
                    const pathArray = JSONPath.toPathArray(path);
                    const claimName = pathArray[pathArray.length - 1];
                    requestedClaimsByVerifier.add(claimName);
                  } catch (error) {
                    console.error('Error parsing path:', path, error);
                  }
                });
              }
            });
          }
        });
        return;
      }
      const isMatchingConstraints = isVCMatchingRequestConstraints(
        inputDescriptor.constraints,
        vc,
        requestedClaimsByVerifier,
      );

      let shouldInclude: boolean;
      if (inputDescriptor.constraints.fields && format) {
        shouldInclude = isMatchingConstraints && areMatchingFormatAndProofType;
      } else {
        shouldInclude = isMatchingConstraints || areMatchingFormatAndProofType;
      }

      if (shouldInclude) {
        if (!matchingVCs[inputDescriptor.id]) {
          matchingVCs[inputDescriptor.id] = [];
        }
        matchingVCs[inputDescriptor.id].push(vc);
      }
    });
  });

  if (!hasFormatOrConstraints && inputDescriptors.length > 0) {
    matchingVCs[inputDescriptors[0].id] = vcs;
  }

  if (Object.keys(matchingVCs).length === 0) {
    // Error is only sent when there are no VCs matching the request
    void OpenID4VP.sendErrorToVerifier(
      OVP_ERROR_MESSAGES.NO_MATCHING_VCS,
      OVP_ERROR_CODE.NO_MATCHING_VCS,
    );
  }

  return {
    matchingVCs,
    requestedClaims: Array.from(requestedClaimsByVerifier).join(','),
    purpose: presentationDefinition.purpose ?? '',
  };
}

function areVCFormatAndProofTypeMatchingRequest(
  requestFormat: Record<string, any> | undefined,
  vc: any,
): boolean {
  if (!requestFormat) {
    return false;
  }
  const vcFormatType = vc.format;
  if (vcFormatType === VCFormat.ldp_vc) {
    const vcProofType = vc?.verifiableCredential?.credential?.proof?.type;
    return Object.entries(requestFormat).some(
      ([type, value]) =>
        type === vcFormatType && value.proof_type.includes(vcProofType),
    );
  }

  if (vcFormatType === VCFormat.mso_mdoc) {
    try {
      const issuerAuth =
        vc.verifiableCredential.processedCredential.issuerSigned?.issuerAuth ??
        vc.verifiableCredential.processedCredential.issuerAuth;
      const issuerAuthenticationAlgorithm =
        getIssuerAuthenticationAlorithmForMdocVC(issuerAuth[0]['1']);
      const mdocAuthenticationAlgorithm = getMdocAuthenticationAlorithm(
        issuerAuth[2],
      );

      return Object.entries(requestFormat).some(
        ([type, value]) =>
          type === vcFormatType &&
          value.alg.includes(issuerAuthenticationAlgorithm) &&
          value.alg.includes(mdocAuthenticationAlgorithm),
      );
    } catch (error) {
      console.error('Error in processing mdoc VC format:', error);
      return false;
    }
  }

  if (
    vcFormatType === VCFormat.dc_sd_jwt ||
    vcFormatType === VCFormat.vc_sd_jwt
  ) {
    try {
      const sdJwt = vc.verifiableCredential?.credential;
      const alg = extractAlgFromSdJwt(sdJwt);

      return Object.entries(requestFormat).some(
        ([type, value]) =>
          type === vcFormatType && value['sd-jwt_alg_values']?.includes(alg),
      );
    } catch (e) {
      console.error('Error processing SD-JWT alg match:', e);
      return false;
    }
  }

  return false;
}

function isVCMatchingRequestConstraints(
  constraints: any,
  credential: any,
  requestedClaimsByVerifier: Set<string>,
): boolean {
  if (!constraints.fields) {
    return false;
  }
  return constraints.fields.every(field => {
    return field.path.some(path => {
      const pathArray = JSONPath.toPathArray(path);
      const claimName = pathArray[pathArray.length - 1];
      requestedClaimsByVerifier.add(claimName);
      const processedCredential = fetchCredentialBasedOnFormat(credential);
      const jsonPathMatches = JSONPath({
        path: path,
        json: processedCredential,
      });
      if (!jsonPathMatches || jsonPathMatches.length === 0) {
        return false;
      }
      return jsonPathMatches.some(match => {
        if (!field.filter) {
          return true;
        }
        return (
          field.filter.type === undefined || field.filter.type === typeof match
        );
      });
    });
  });
}
function extractAlgFromSdJwt(sdJwtCompact: string): string {
  const parts = sdJwtCompact.trim().split('~');
  const jwt = parts[0];

  const jwtParts = jwt.split('.');
  if (jwtParts.length < 3) {
    throw new Error('Invalid SD-JWT format');
  }

  const headerJson = JSON.parse(base64UrlDecode(jwtParts[0]));
  if (!headerJson.alg) {
    throw new Error('Missing alg in SD-JWT header');
  }
  return headerJson.alg;
}

function base64UrlDecode(input: string): string {
  input = input.replace(/-/g, '+').replace(/_/g, '/');
  while (input.length % 4) {
    input += '=';
  }
  return Buffer.from(input, 'base64').toString('utf8');
}

function fetchCredentialBasedOnFormat(vc: any) {
  const format = vc.format;
  let credential;
  switch (format.toString()) {
    case VCFormat.ldp_vc: {
      credential = vc.verifiableCredential.credential;
      break;
    }
    case VCFormat.mso_mdoc: {
      credential = getProcessedDataForMdoc(
        vc.verifiableCredential.processedCredential,
      );
      break;
    }
    case VCFormat.vc_sd_jwt:
    case VCFormat.dc_sd_jwt: {
      credential =
        vc.verifiableCredential.processedCredential.fullResolvedPayload;
      break;
    }
  }
  return credential;
}

function getProcessedDataForMdoc(processedCredential: any) {
  const namespaces =
    processedCredential.issuerSigned?.nameSpaces ??
    processedCredential.nameSpaces;
  const processedData = {...namespaces};
  for (const ns in processedData) {
    const elementsArray = processedData[ns];
    const asObject: Record<string, any> = {};
    elementsArray.forEach((item: any) => {
      asObject[item.elementIdentifier] = item.elementValue;
    });
    processedData[ns] = asObject;
  }
  return processedData;
}
