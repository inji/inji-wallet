import { isSignedInResult } from '../../shared/CloudBackupAndRestoreUtils'
import { ErrorMessage, OIDCErrors } from '../../shared/openId4VCI/Utils'
import { BiometricCancellationError } from '../../shared/error/BiometricCancellationError'
import { VerificationErrorType } from '../../shared/vcjs/verifyCredential'
import { AuthorizationType } from '../../shared/constants'
import { VCIServerErrorCode } from './IssuersActions'

export const IssuersGuards = () => {

  const shouldRetryOnError = (context: any) =>
    retryableErrors.has(context.errorMessage)

  const guards = {

    isVerificationPendingBecauseOfNetworkIssue: (_context: any, event: any) =>
      (event.data as Error)?.message === VerificationErrorType.NETWORK_ERROR,

    isVerificationFailed: (context: any) =>
      context.errorMessage === VCIServerErrorCode.VERIFICATION_FAILED,

    isSignedIn: (_: any, event: any) =>
      (event.data as isSignedInResult)?.isSignedIn,

    hasKeyPair: (context: any) =>
      !!context.publicKey,

    isKeyTypeNotFound: (context: any) =>
      context.keyType === '',

    isInternetConnected: (_: any, event: any) =>
      !!event.data?.isConnected,

    canSelectIssuerAgain: (context: any) => {
      const msg = context.errorMessage || ''
      return (
        msg.includes(OIDCErrors.OIDC_CONFIG_ERROR_PREFIX) ||
        msg.includes(ErrorMessage.REQUEST_TIMEDOUT)
      )
    },

    shouldFetchIssuersAgain: (context: any) =>
      context.issuers.length === 0,

    hasUserCancelledBiometric: (_: any, event: any) =>
      event.data instanceof BiometricCancellationError,

    isCredentialOfferFlow: (context: any) =>
      context.isCredentialOfferFlow,

    isIssuerIdInTrustedIssuers: (_: any, event: any) =>
      Boolean(event.data),

    isPresentationAuthorization: (context: any) =>
      context.authorizationType === AuthorizationType.OPENID4VP_PRESENTATION,

    shouldGoBackHomeOnError: (context: any) =>
      goHomeErrors.has(context.errorMessage),

    shouldRetryOnError,

    shouldGoBack: (context: any) =>
      goBackErrors.has(context.errorMessage),

    shouldRetryOnErrorAndCredentialOfferFlow: (context: any) =>
      context.isCredentialOfferFlow && shouldRetryOnError(context)
  }

  return guards
}