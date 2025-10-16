import {useEffect, useState} from 'react';

interface OvpErrorModal {
  show: boolean;
  title: string;
  message: string;
  additionalMessage: string;
  showRetryButton: boolean;
}

interface UseOvpErrorModalProps {
  error: string;
  noCredentialsMatchingVPRequest: boolean;
  requestedClaimsByVerifier: string;
  getAdditionalMessage: () => string;
  generateAndStoreLogMessage: (logType: string, errorInfo?: string) => void;
  t: (key: string, options?: any) => string;
}
export function useOvpErrorModal({
  error,
  noCredentialsMatchingVPRequest,
  requestedClaimsByVerifier,
  getAdditionalMessage,
  generateAndStoreLogMessage,
  t,
}: UseOvpErrorModalProps): [OvpErrorModal, () => void] {
  const [errorModal, setErrorModal] = useState<OvpErrorModal>({
    show: false,
    title: '',
    message: '',
    additionalMessage: '',
    showRetryButton: false,
  });

  useEffect(() => {
    const isClaimsEmpty =
      !requestedClaimsByVerifier || requestedClaimsByVerifier.trim() === '';
    const additionalMessage = getAdditionalMessage();

    if (noCredentialsMatchingVPRequest) {
      setErrorModal({
        show: true,
        title: isClaimsEmpty
          ? t('errors.noMatchingCredentialsWithMissingClaims.title')
          : t('errors.noMatchingCredentials.title'),
        message: isClaimsEmpty
          ? t('errors.noMatchingCredentialsWithMissingClaims.message')
          : t('errors.noMatchingCredentials.message', {
              claims: requestedClaimsByVerifier,
            }),
        additionalMessage,
        showRetryButton: false,
      });
      generateAndStoreLogMessage(
        'NO_CREDENTIAL_MATCHING_REQUEST',
        requestedClaimsByVerifier,
      );
    } else if (
      error.includes('Verifier authentication was unsuccessful') ||
      error.startsWith('api error')
    ) {
      setErrorModal({
        show: true,
        title: t('errors.invalidVerifier.title'),
        message: t('errors.invalidVerifier.message'),
        additionalMessage,
        showRetryButton: false,
      });
      generateAndStoreLogMessage('VERIFIER_AUTHENTICATION_FAILED');
    } else if (error.includes('credential mismatch detected')) {
      setErrorModal({
        show: true,
        title: t('errors.credentialsMismatch.title'),
        message: t('errors.credentialsMismatch.message', {
          claims: requestedClaimsByVerifier,
        }),
        additionalMessage,
        showRetryButton: false,
      });
      generateAndStoreLogMessage(
        'CREDENTIAL_MISMATCH_FROM_KEBAB',
        requestedClaimsByVerifier,
      );
    } else if (error.includes('none of the selected VC has image')) {
      setErrorModal({
        show: true,
        title: t('errors.noImage.title'),
        message: t('errors.noImage.message'),
        additionalMessage,
        showRetryButton: false,
      });
      generateAndStoreLogMessage('NO_SELECTED_VC_HAS_IMAGE');
    } else if (error.includes('invalid_request_uri_method')) {
      setErrorModal({
        show: true,
        title: t('errors.invalidRequestURI.title'),
        message: t('errors.invalidRequestURI.message'),
        additionalMessage,
        showRetryButton: false,
      });
      generateAndStoreLogMessage('INVALID_REQUEST_URI_METHOD');
    } else if (
      error.includes('invalid_request') ||
      error.includes('invalid_request_object')
    ) {
      setErrorModal({
        show: true,
        title: t('errors.invalidQrCode.title'),
        message: t('errors.invalidQrCode.message'),
        additionalMessage,
        showRetryButton: false,
      });
      generateAndStoreLogMessage('INVALID_AUTH_REQUEST');
    } else if (error.includes('vp_formats_not_supported')) {
      setErrorModal({
        show: true,
        title: t('errors.vpFormatsNotSupported.title'),
        message: t('errors.vpFormatsNotSupported.message'),
        additionalMessage,
        showRetryButton: false,
      });
      generateAndStoreLogMessage('REQUEST_COULD_NOT_BE_PROCESSED');
    } else if (error.includes('invalid_presentation_definition_uri')) {
      setErrorModal({
        show: true,
        title: t('errors.invalidPresentationDefinitionURI.title'),
        message: t('errors.invalidPresentationDefinitionURI.message'),
        additionalMessage,
        showRetryButton: false,
      });
      generateAndStoreLogMessage('INVALID_PRESENTATION_DEFINITION_URI');
    } else if (error.includes('invalid_presentation_definition_reference')) {
      setErrorModal({
        show: true,
        title: t('errors.invalidPresentationDefinitionRef.title'),
        message: t('errors.invalidPresentationDefinitionRef.message'),
        additionalMessage,
        showRetryButton: false,
      });
      generateAndStoreLogMessage('REQUEST_COULD_NOT_BE_PROCESSED');
    } else if (error.includes('invalid_client')) {
      setErrorModal({
        show: true,
        title: t('errors.invalidQrCode.title'),
        message: t('errors.invalidQrCode.message'),
        additionalMessage,
        showRetryButton: false,
      });
      generateAndStoreLogMessage('REQUEST_COULD_NOT_BE_PROCESSED');
    } else if (error.includes('VERIFIER_RESPONSE_ERROR')) {
      setErrorModal({
        show: true,
        title: t('errors.verifierResponseError.title'),
        message: t('errors.verifierResponseError.message'),
        additionalMessage,
        showRetryButton: false,
      });
      generateAndStoreLogMessage('SEND_VP_ERROR');
    } else if (error.startsWith('send vp')) {
      setErrorModal({
        show: true,
        title: t('errors.sendVPError.title'),
        message: t('errors.sendVPError.message'),
        additionalMessage,
        showRetryButton: true,
      });
      generateAndStoreLogMessage('SEND_VP_ERROR');
    } else if (error.includes('failed to update trusted verifier list')) {
      setErrorModal({
        show: true,
        title: t('errors.trustedVerifierListUpdateError.title'),
        message: t('errors.trustedVerifierListUpdateError.message'),
        additionalMessage,
        showRetryButton: false,
      });
      generateAndStoreLogMessage('TRUSTED_VERIFIER_LIST_UPDATE_ERROR');
    } else if(error.includes("invalid_transaction_data")){
        setErrorModal({
            show: true,
            title: t('errors.invalidTransactionData.title'),
            message: t('errors.invalidTransactionData.message'),
            additionalMessage,
            showRetryButton: false,
        });
        generateAndStoreLogMessage('INVALID_TRANSACTION_DATA');
    } else if (error !== '') {
      setErrorModal({
        show: true,
        title: t('errors.genericError.title'),
        message: t('errors.genericError.message'),
        additionalMessage,
        showRetryButton: false,
      });
      generateAndStoreLogMessage('TECHNICAL_ERROR');
    } else {
      setErrorModal({
        show: false,
        title: '',
        message: '',
        additionalMessage: '',
        showRetryButton: false,
      });
    }
  }, [
    error,
    noCredentialsMatchingVPRequest,
    requestedClaimsByVerifier,
    getAdditionalMessage,
    t,
  ]);

  const resetErrorModal = () => {
    setErrorModal({
      show: false,
      title: '',
      message: '',
      additionalMessage: '',
      showRetryButton: false,
    });
  };

  return [errorModal, resetErrorModal];
}
