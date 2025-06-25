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
  REQUEST_TIMEOUT,
  isIOS,
} from '../../shared/constants';
import {assign, send} from 'xstate';
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
import {KeyTypes} from '../../shared/cryptoutil/KeyTypes';
import {VCActivityLog} from '../../components/ActivityLogEvent';
import {isNetworkError} from '../../shared/Utils';
import {issuerType} from './IssuersMachine';

const {RNSecureKeystoreModule} = NativeModules;
export const IssuersActions = (model: any) => {
  return {
    setVerificationResult: assign({
      vcMetadata: (context: any, event: any) =>
        new VCMetadata({
          ...context.vcMetadata,
          isVerified: true,
          isExpired: event.data.verificationErrorCode == EXPIRED_VC_ERROR_CODE,
        }),
    }),
    resetVerificationResult: assign({
      vcMetadata: (context: any) =>
        new VCMetadata({
          ...context.vcMetadata,
          isVerified: false,
          isExpired: false,
        }),
    }),
    setIssuers: model.assign({
      issuers: (_: any, event: any) => event.data as issuerType[],
    }),
    setNoInternet: model.assign({
      errorMessage: () => ErrorMessage.NO_INTERNET,
    }),
    setLoadingReasonAsDisplayIssuers: model.assign({
      loadingReason: 'displayIssuers',
    }),
    setLoadingReasonAsDownloadingCredentials: model.assign({
      loadingReason: 'downloadingCredentials',
    }),
    setLoadingReasonAsSettingUp: model.assign({
      loadingReason: 'settingUp',
    }),
    resetLoadingReason: model.assign({
      loadingReason: null,
    }),
    setSelectedCredentialType: model.assign({
      selectedCredentialType: (_: any, event: any) => event.credType,
      wellknownKeyTypes: (_: any, event: any) => {
        const proofTypesSupported = event.credType.proof_types_supported;
        if (proofTypesSupported?.jwt) {
          return proofTypesSupported.jwt
            .proof_signing_alg_values_supported as string[];
        } else {
          return [KeyTypes.RS256] as string[];
        }
      },
    }),
    setSupportedCredentialTypes: model.assign({
      supportedCredentialTypes: (_: any, event: any) => event.data,
    }),
    resetSelectedCredentialType: model.assign({
      selectedCredentialType: {},
    }),
    setNetworkOrTechnicalError: model.assign({
      errorMessage: (_: any, event: any) => {
        console.error(
          `Error occurred during ${event} flow`,
          event.data.message,
        );
        return isNetworkError(event.data.message)
          ? ErrorMessage.NO_INTERNET
          : ErrorMessage.TECHNICAL_DIFFICULTIES;
      },
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
        if (isNetworkError(error)) {
          return ErrorMessage.NO_INTERNET;
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
    setOIDCConfigError: model.assign({
      errorMessage: (_: any, event: any) => event.data.toString(),
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

    updateIssuerFromWellknown: model.assign({
      selectedIssuer: (context: any, event: any) => ({
        ...context.selectedIssuer,
        credential_audience: event.data.credential_issuer,
        credential_endpoint: event.data.credential_endpoint,
        credential_configurations_supported:
          event.data.credential_configurations_supported,
        display: event.data.display,
        authorization_servers: event.data.authorization_servers,
      }),
    }),
    setCredential: model.assign({
      credential: (_: any, event: any) => event.data,
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
        return event.accessToken;
      },
    }),
    setCNonce: model.assign({
      cNonce: (_: any, event: any) => {
        return event.cNonce;
      },
    }),
    setOfferCredentialTypeContexts: model.assign({
      selectedCredentialType: (context: any, event: any) => {
        return event.credentialTypes[0];
      },
      supportedCredentialTypes: (context: any, event: any) => {
        return event.credentialTypes;
      },
      accessToken: (context: any, event: any) => {
        return event.accessToken;
      },
      cNonce: (context: any, event: any) => {
        return event.cNonce;
      },
    }),
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
      selectedIssuerWellknownResponse: (_: any, event: any) => {
        return event.issuerMetadata;
      },
      wellknownKeyTypes: (_: any, event: any) => {
        const credType = Object.entries(event.credentialTypes)[0][1];
        const proofTypesSupported = credType.proof_types_supported;
        if (proofTypesSupported?.jwt) {
          return proofTypesSupported.jwt
            .proof_signing_alg_values_supported as string[];
        } else {
          return [KeyTypes.RS256] as string[];
        }
      },
    }),
    updateSelectedIssuerWellknownResponse: model.assign({
      selectedIssuerWellknownResponse: (_: any, event: any) => event.data,
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
    setTxCodeDisplayDetails: model.assign({
      txCodeInputMode: (_: any, event: any) => event.inputMode,
      txCodeDescription: (_: any, event: any) => event.description,
      txCodeLength: (_: any, event: any) => event.length,
    }),
    setCredentialOfferIssuerMetadata: model.assign({
      credentialOfferIssuerMetadata: (_: any, event: any) => {
        return event.issuerMetadata;
      },
    }),
    setIssuerDisplayDetails: model.assign({
      issuerLogo: (context: any, _: any) => {
        const displayArray = context.credentialOfferIssuerMetadata?.display;
        const display = displayArray
          ? getDisplayObjectForCurrentLanguage(displayArray)
          : undefined;

        return display?.logo?.url ?? '';
      },
      issuerName: (context: any, _: any) => {
        const displayArray = context.credentialOfferIssuerMetadata?.display;
        const display = displayArray
          ? getDisplayObjectForCurrentLanguage(displayArray)
          : undefined;
        return display?.name ?? '';
      },
    }),

    setFlowType: model.assign({
      isCredentialOfferFlow: (_: any, event: any) => {
        return true;
      },
    }),

    resetFlowType: model.assign({
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
            issuer: context.selectedIssuerId,
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

    updateVerificationErrorMessage: assign({
      verificationErrorMessage: (_, event: any) =>
        (event.data as Error).message,
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
  };
};
