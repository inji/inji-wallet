import {isSignedInResult} from '../../shared/CloudBackupAndRestoreUtils';
import {ErrorMessage, OIDCErrors} from '../../shared/openId4VCI/Utils';
import {isHardwareKeystoreExists} from '../../shared/cryptoutil/cryptoUtil';
import {BiometricCancellationError} from '../../shared/error/BiometricCancellationError';
import {VerificationErrorType} from '../../shared/vcjs/verifyCredential';

export const IssuersGuards = () => {
  return {
    isVerificationPendingBecauseOfNetworkIssue: (_context, event) =>
      (event.data as Error).message == VerificationErrorType.NETWORK_ERROR,
    isSignedIn: (_: any, event: any) =>
      (event.data as isSignedInResult).isSignedIn,
    hasKeyPair: (context: any) => {
      return !!context.publicKey;
    },
    isKeyTypeNotFound: (context: any) => {
      return context.keyType == '';
    },
    isInternetConnected: (_: any, event: any) => !!event.data.isConnected,
    isOIDCflowCancelled: (_: any, event: any) => {
      // iOS & Android have different error strings for user cancelled flow
      const err = [
        OIDCErrors.OIDC_FLOW_CANCELLED_ANDROID,
        OIDCErrors.OIDC_FLOW_CANCELLED_IOS,
      ];
      return (
        !!event.data &&
        typeof event.data.toString === 'function' &&
        err.some(e => event.data.toString().includes(e))
      );
    },
    isOIDCConfigError: (_: any, event: any) => {
      return (
        !!event.data &&
        typeof event.data.toString === 'function' &&
        event.data.toString().includes(OIDCErrors.OIDC_CONFIG_ERROR_PREFIX)
      );
    },
    isGrantTypeNotSupportedError: (_: any, event: any) => {
      return (
        !!event.data &&
        event.data.toString() ===
          OIDCErrors.AUTHORIZATION_ENDPOINT_DISCOVERY.GRANT_TYPE_NOT_SUPPORTED
      );
    },
    canSelectIssuerAgain: (context: any) => {
      return (
        context.errorMessage.includes(OIDCErrors.OIDC_CONFIG_ERROR_PREFIX) ||
        context.errorMessage.includes(ErrorMessage.REQUEST_TIMEDOUT)
      );
    },
    shouldFetchIssuersAgain: (context: any) => context.issuers.length === 0,
    isCustomSecureKeystore: () => isHardwareKeystoreExists,
    hasUserCancelledBiometric: (_: any, event: any) =>
      event.data instanceof BiometricCancellationError,
    isGenericError: (_: any, event: any) => {
      const errorMessage = event.data.message;
      return errorMessage === ErrorMessage.GENERIC;
    },
    isCredentialOfferFlow: (context: any) => {
      return context.isCredentialOfferFlow;
    },
    isIssuerIdInTrustedIssuers: (_: any,event:any) => {
      return event.data;
    }
  };
};
