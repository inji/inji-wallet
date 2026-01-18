import {
  ErrorMessage,
  getDisplayObjectForCurrentLanguage,
  Issuers_Key_Ref,
  OIDCErrors,
  selectCredentialRequestKey,
} from '../../shared/openId4VCI/Utils';
import {
  EXPIRED_VC_ERROR_CODE,
  MY_VCS_STORE_KEY,
  NO_INTERNET,
  REQUEST_TIMEOUT,
  isIOS,
  AuthorizationType,
  OVP_ERROR_CODE,
  OVP_ERROR_MESSAGES,
} from '../../shared/constants';
import {assign, send, spawn} from 'xstate';
import {StoreEvents} from '../store';
import {BackupEvents} from '../backupAndRestore/backup/backupMachine';
import {getVCMetadata, VCMetadata} from '../../shared/VCMetadata';
import {isHardwareKeystoreExists} from '../../shared/cryptoutil/cryptoUtil';
import {ActivityLogEvents} from '../activityLog';
import {
  getEndEventData,
  getImpressionEventData,
  sendEndEvent,
  sendImpressionEvent,
} from '../../shared/telemetry/TelemetryUtils';
import {TelemetryConstants} from '../../shared/telemetry/TelemetryConstants';
import {NativeModules} from 'react-native';
import {VCActivityLog} from '../../components/ActivityLogEvent';
import {isNetworkError, parseJSON, VCShareFlowType} from '../../shared/Utils';
import {issuerType} from './IssuersMachine';
import {RevocationStatus} from '../../shared/vcVerifier/VcVerifier';
import {logState} from '../../shared/commonUtil';
import {createOpenID4VPMachine} from '../openID4VP/openID4VPMachine';
import VciClient from '../../shared/vciClient/VciClient';

const {RNSecureKeystoreModule} = NativeModules;

const OPENID4VP_REF_ID = 'Presentation_During_Issuance_OpenID4VP_Service';
export const IssuersActions = (model: any) => {
  return {
    setVerificationResult: assign({
      vcMetadata: (context: any, event: any) =>
        new VCMetadata({
          ...context.vcMetadata,
          isVerified: true,
          isExpired: event.data.verificationErrorCode == EXPIRED_VC_ERROR_CODE,
          isRevoked: event.data.isRevoked,
          lastKnownStatusTimestamp: new Date().toISOString(),
        }),
    }),
    resetVerificationResult: assign({
      vcMetadata: (context: any) =>
        new VCMetadata({
          ...context.vcMetadata,
          isVerified: false,
          isExpired: false,
          isRevoked: RevocationStatus.FALSE,
        }),
    }),
    setIssuers: model.assign({
      issuers: (_: any, event: any) => event.data as issuerType[],
    }),
    setLoadingReasonAsDisplayIssuers: model.assign({
      loadingReason: 'displayIssuers',
    }),
    setLoadingReasonAsDownloadingCredentials: model.assign({
      loadingReason: 'downloadingCredentials',
    }),
    setLoadingReasonAsPreparingRequest: model.assign({
      loadingReason: 'preparingRequest',
    }),
    setLoadingReasonAsSettingUp: model.assign({
      loadingReason: 'settingUp',
    }),
    resetLoadingReason: model.assign({
      loadingReason: null,
    }),
    resetAuthorization: model.assign({
      authorizationType: AuthorizationType.IMPLICIT,
      authorizationSuccess: false,
    }),
    setSelectedCredentialType: model.assign({
      selectedCredentialType: (_: any, event: any) => event.credType,
      wellknownKeyTypes: (_: any, event: any) => {
        const proofTypesSupported = event.credType.proof_types_supported;
        if (proofTypesSupported?.jwt) {
          return proofTypesSupported.jwt
            .proof_signing_alg_values_supported as string[];
        } else {
          return [] as string[];
        }
      },
    }),
    setSupportedCredentialTypes: model.assign({
      supportedCredentialTypes: (_: any, event: any) => event.data,
    }),
    resetSelectedCredentialType: model.assign({
      selectedCredentialType: {},
    }),
    setCredentialTypeListDownloadFailureError: model.assign({
      errorMessage: (_: any, event: any) => {
        if (isNetworkError(event.data.message)) {
          return ErrorMessage.NO_INTERNET;
        }
        return ErrorMessage.CREDENTIAL_TYPE_DOWNLOAD_FAILURE;
      },
    }),

    setError: model.assign({
      errorMessage: (_: any, event: any) => {
        console.error(`Error occurred while ${event} -> `, event.data.message);
        const error = event.data.message;
        if (error.includes(NO_INTERNET)) {
          return ErrorMessage.NO_INTERNET;
        }
        if (isNetworkError(error)) {
          return ErrorMessage.NETWORK_REQUEST_FAILED;
        }
        if (error.includes(REQUEST_TIMEOUT)) {
          return ErrorMessage.REQUEST_TIMEDOUT;
        }
        if (
          error.includes(
            OIDCErrors.AUTHORIZATION_ENDPOINT_DISCOVERY
              .GRANT_TYPE_NOT_SUPPORTED,
          )
        ) {
          return ErrorMessage.AUTHORIZATION_GRANT_TYPE_NOT_SUPPORTED;
        }
        return ErrorMessage.GENERIC;
      },
    }),
    resetError: model.assign({
      errorMessage: '',
    }),

    loadKeyPair: assign({
      publicKey: (_, event: any) => event.data?.publicKey as string,
      privateKey: (context: any, event: any) =>
        event.data?.privateKey
          ? event.data.privateKey
          : (context.privateKey as string),
    }),
    getKeyPairFromStore: send(StoreEvents.GET(Issuers_Key_Ref), {
      to: (context: any) => context.serviceRefs.store,
    }),
    sendBackupEvent: send(BackupEvents.DATA_BACKUP(true), {
      to: (context: any) => context.serviceRefs.backup,
    }),
    storeKeyPair: async (context: any) => {
      const keyType = context.keyType;
      if ((keyType != 'ES256' && keyType != 'RS256') || isIOS())
        await RNSecureKeystoreModule.storeGenericKey(
          context.publicKey,
          context.privateKey,
          keyType,
        );
    },

    storeVerifiableCredentialMeta: send(
      context => StoreEvents.PREPEND(MY_VCS_STORE_KEY, context.vcMetadata),
      {
        to: (context: any) => context.serviceRefs.store,
      },
    ),

    setMetadataInCredentialData: (context: any) => {
      context.credentialWrapper = {
        ...context.credentialWrapper,
        vcMetadata: context.vcMetadata,
      };
    },

    setVCMetadata: assign({
      vcMetadata: (context: any) => {
        return getVCMetadata(context, context.keyType);
      },
    }),

    storeVerifiableCredentialData: send(
      (context: any) => {
        const vcMetadata = context.vcMetadata;
        const credentialWrapper = context.credentialWrapper;
        const storableData = {
          ...credentialWrapper,
          verifiableCredential: {
            ...credentialWrapper.verifiableCredential,
          },
        };
        return StoreEvents.SET(vcMetadata.getVcKey(), {
          ...storableData,
          vcMetadata: vcMetadata,
        });
      },
      {
        to: (context: any) => context.serviceRefs.store,
      },
    ),

    storeVcMetaContext: send(
      context => {
        return {
          type: 'VC_ADDED',
          vcMetadata: context.vcMetadata,
        };
      },
      {
        to: (context: any) => context.serviceRefs.vcMeta,
      },
    ),

    storeVcsContext: send(
      (context: any) => {
        return {
          type: 'VC_DOWNLOADED',
          vcMetadata: context.vcMetadata,
          vc: context.credentialWrapper,
        };
      },
      {
        to: context => context.serviceRefs.vcMeta,
      },
    ),

    setSelectedKey: model.assign({
      keyType: (context: any, event: any) => {
        const keyType = selectCredentialRequestKey(
          context.wellknownKeyTypes,
          event.data,
        );
        return keyType;
      },
    }),

    setSelectedIssuers: model.assign({
      selectedIssuer: (context: any, event: any) => {
        return context.issuers.find(issuer => issuer.issuer_id === event.id);
      },
    }),
    resetSelectedIssuer: model.assign({
      selectedIssuer: () => ({} as issuerType),
    }),
    updateIssuerFromWellknown: model.assign({
      selectedIssuer: (context: any, event: any) => ({
        ...context.selectedIssuer,
        credential_endpoint: event.data.credential_endpoint,
        credential_configurations_supported:
          event.data.credential_configurations_supported,
        display: event.data.display,
        authorization_servers: event.data.authorization_servers,
      }),
      selectedIssuerWellknownResponse: (_: any, event: any) => {
        return event.data;
      },
    }),
    setCredential: model.assign({
      credential: (_: any, event: any) => event.data.credential,
    }),
    setQrData: model.assign({
      qrData: (_: any, event: any) => event.data,
    }),
    setCredentialOfferIssuer: model.assign({
      selectedIssuer: (_: any, event: any) => {
        return event.issuer;
      },
    }),
    setAccessToken: model.assign({
      accessToken: (_: any, event: any) => {
        return event.data.access_token;
      },
    }),
    setCNonce: model.assign({
      cNonce: (_: any, event: any) => {
        return event.cNonce;
      },
    }),
    setCredentialConfigurationId: model.assign({
      credentialConfigurationId: (_: any, event: any) => {
        return event.data.credentialConfigurationId;
      },
    }),
    setCredentialOfferCredentialType: model.assign({
      selectedCredentialType: (context: any, event: any) => {
        let credentialTypes: Array<{id: string; [key: string]: any}> = [];
        const credentialConfigurationId = context.credentialConfigurationId;
        const issuerMetadata = context.selectedIssuerWellknownResponse;
        if (
          issuerMetadata.credential_configurations_supported[
            credentialConfigurationId
          ]
        ) {
          credentialTypes.push({
            id: credentialConfigurationId,
            ...issuerMetadata.credential_configurations_supported[
              credentialConfigurationId
            ],
          });
          return credentialTypes[0];
        }
      },
    }),
    setAuthorizationTypeAsPresentation: model.assign({
      authorizationType: AuthorizationType.OPENID4VP_PRESENTATION,
    }),
    setPresentationAuthorizationSuccess: model.assign({
      authorizationSuccess: true,
    }),
    supportedCredentialTypes: (context: any, event: any) => {
      return event.credentialTypes;
    },
    accessToken: (context: any, event: any) => {
      return event.accessToken;
    },
    cNonce: (context: any, event: any) => {
      return event.cNonce;
    },

    setRequestTxCode: model.assign({
      isTransactionCodeRequested: (_: any, event: any) => {
        return true;
      },
    }),

    resetRequestTxCode: model.assign({
      isTransactionCodeRequested: (_: any, event: any) => {
        return false;
      },
    }),
    setCredentialOfferIssuerWellknownResponse: model.assign({
      selectedIssuer: (_: any, event: any) => {
        return event.data;
      },
      selectedIssuerWellknownResponse: (_: any, event: any) => {
        return event.data;
      },
    }),
    setWellknwonKeyTypes: model.assign({
      wellknownKeyTypes: (_: any, event: any) => {
        return event.proofSigningAlgosSupported;
      },
    }),
    setSelectedCredentialIssuer: model.assign({
      credentialOfferCredentialIssuer: (_: any, event: any) => {
        return event.issuer;
      },
    }),
    setTokenRequestObject: model.assign({
      tokenRequestObject: (_: any, event: any) => {
        return parseJSON(event.tokenRequest);
      },
    }),
    setTokenResponseObject: model.assign({
      tokenResponse: (_: any, event: any) => {
        return event.data;
      },
    }),
    setSelectedIssuerId: model.assign({
      selectedIssuerId: (_: any, event: any) => event.id,
    }),
    setTxCode: model.assign({
      txCode: (_: any, event: any) => {
        return event.txCode;
      },
    }),
    setRequestConsentToTrustIssuer: model.assign({
      isConsentRequested: (_: any, event: any) => {
        return true;
      },
    }),
    resetTrustedIssuerConsentStatus: model.assign({
      trustedIssuerConsentStatus: () => {
        return 'idle';
      },
    }),
    setTrustedIssuerConsentInProgress: model.assign({
      trustedIssuerConsentStatus: () => {
        return 'loading';
      },
    }),
    setTrustedIssuerConsentSuccess: model.assign({
      trustedIssuerConsentStatus: () => {
        return 'success';
      },
    }),
    setTxCodeDisplayDetails: model.assign({
      txCodeInputMode: (_: any, event: any) => event.inputMode,
      txCodeDescription: (_: any, event: any) => event.description,
      txCodeLength: (_: any, event: any) => event.length,
    }),
    setIssuerDisplayDetails: model.assign({
      issuerLogo: (_: any, event: any) => {
        const displayArray = event.issuerDisplay;
        const display = displayArray
          ? getDisplayObjectForCurrentLanguage(displayArray)
          : undefined;

        return display?.logo?.url ?? '';
      },
      issuerName: (_: any, event: any) => {
        const displayArray = event.issuerDisplay;
        const display = displayArray
          ? getDisplayObjectForCurrentLanguage(displayArray)
          : undefined;
        return display?.name ?? '';
      },
    }),

    setCredentialOfferFlowType: model.assign({
      isCredentialOfferFlow: (_: any, event: any) => {
        return true;
      },
    }),

    resetCredentialOfferFlowType: model.assign({
      isCredentialOfferFlow: (_: any, event: any) => {
        return false;
      },
    }),

    resetRequestConsentToTrustIssuer: model.assign({
      isConsentRequested: (_: any, event: any) => {
        return false;
      },
    }),
    setVerifiableCredential: model.assign({
      verifiableCredential: (_: any, event: any) => {
        return event.data.verifiableCredential;
      },
    }),
    setCredentialWrapper: model.assign({
      credentialWrapper: (_: any, event: any) => {
        return event.data;
      },
    }),
    setPublicKey: assign({
      publicKey: (_, event: any) => {
        if (!isHardwareKeystoreExists) {
          return event.data.publicKey as string;
        }
        return event.data.publicKey as string;
      },
    }),

    setPrivateKey: assign({
      privateKey: (_, event: any) => event.data.privateKey as string,
    }),

    logDownloaded: send(
      context => {
        const vcMetadata = context.vcMetadata;
        return ActivityLogEvents.LOG_ACTIVITY(
          VCActivityLog.getLogFromObject({
            _vcKey: vcMetadata.getVcKey(),
            type: 'VC_DOWNLOADED',
            timestamp: Date.now(),
            deviceName: '',
            issuer:
              context.selectedIssuer.credential_issuer_host ??
              context.credentialOfferCredentialIssuer,
            credentialConfigurationId: context.selectedCredentialType.id,
          }),
          context.selectedIssuerWellknownResponse,
        );
      },
      {
        to: (context: any) => context.serviceRefs.activityLog,
      },
    ),
    sendSuccessEndEvent: (context: any) => {
      sendEndEvent(
        getEndEventData(
          TelemetryConstants.FlowType.vcDownload,
          TelemetryConstants.EndEventStatus.success,
          {'VC Key': context.keyType},
        ),
      );
    },

    sendErrorEndEvent: (context: any) => {
      sendEndEvent(
        getEndEventData(
          TelemetryConstants.FlowType.vcDownload,
          TelemetryConstants.EndEventStatus.failure,
          {'VC Key': context.keyType},
        ),
      );
    },

    sendImpressionEvent: () => {
      sendImpressionEvent(
        getImpressionEventData(
          TelemetryConstants.FlowType.vcDownload,
          TelemetryConstants.Screens.issuerList,
        ),
      );
    },

    sendPresentationAuthorizationImpressionEvent: () => {
      sendImpressionEvent(
        getImpressionEventData(
          TelemetryConstants.FlowType.presentationAuthorizationForVcDownload,
          TelemetryConstants.Screens.issuerList,
        ),
      );
    },

    updateVerificationErrorMessage: assign({
      verificationErrorMessage: (_, event: any) => {
        return (event.data as Error).message;
      },
    }),

    resetVerificationErrorMessage: model.assign({
      verificationErrorMessage: () => '',
    }),

    resetQrData: model.assign({
      qrData: () => '',
    }),

    sendDownloadingFailedToVcMeta: send(
      (_: any) => ({
        type: 'VC_DOWNLOADING_FAILED',
      }),
      {
        to: context => context.serviceRefs.vcMeta,
      },
    ),

    setOpenId4VPRef: assign({
      OpenId4VPRef: (context: any) => {
        const service = spawn(
          createOpenID4VPMachine(context.serviceRefs),
          OPENID4VP_REF_ID,
        );
        if (__DEV__) {
          service.subscribe(logState);
        }
        return service;
      },
    }),

    sendVPScanData: (context, event) => {
      return context.OpenId4VPRef.send({
        type: 'AUTHENTICATE_VIA_PRESENTATION',
        presentationRequest: event.presentationRequest,
        flowType: VCShareFlowType.OPENID4VP_AUTHORIZATION,
      });
    },

    sendSignedVP: (context, event) => {
      VciClient.getInstance().sendSignedVP(event.signedVPToken.data);
    },

    sendVPConsentReject: () => {
      console.error('User declined to share VP for issuance authorization');
      VciClient.getInstance().abortPresentationFlow({
        code: OVP_ERROR_CODE.DECLINED,
        message: OVP_ERROR_MESSAGES.DECLINED,
      });
    },

    sendPresentationAuthorizationError: (_, event) => {
      console.error(
        'PRESENTATION_AUTHORIZATION_ERROR for issuance authorization',
      );
      VciClient.getInstance().abortPresentationFlow({
        code: 'PRESENTATION_AUTHORIZATION_ERROR',
        message: event.error,
      });
    },
  };
};
