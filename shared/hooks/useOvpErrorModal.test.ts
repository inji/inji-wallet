const mockT = jest.fn((key: string, opts?: any) => key);
const mockGetAdditionalMessage = jest.fn().mockReturnValue('additional info');
const mockGenerateAndStoreLogMessage = jest.fn();

describe('useOvpErrorModal', () => {
  let currentState: any;
  let setErrorModalFn: jest.Mock;

  function callHook(props: any) {
    const react = require('react');
    const origUseState = react.useState;
    const origUseEffect = react.useEffect;

    setErrorModalFn = jest.fn(val => {
      currentState = val;
    });
    currentState = {
      show: false,
      title: '',
      message: '',
      additionalMessage: '',
      showRetryButton: false,
    };

    react.useState = (init: any) => [currentState, setErrorModalFn];
    react.useEffect = (cb: Function) => {
      cb();
    };

    const {useOvpErrorModal} = require('./useOvpErrorModal');
    const result = useOvpErrorModal(props);

    react.useState = origUseState;
    react.useEffect = origUseEffect;

    // The last call to setErrorModal will be the state
    if (setErrorModalFn.mock.calls.length > 0) {
      currentState =
        setErrorModalFn.mock.calls[setErrorModalFn.mock.calls.length - 1][0];
    }
    return {modal: currentState, resetFn: result[1]};
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should export useOvpErrorModal', () => {
    expect(typeof require('./useOvpErrorModal').useOvpErrorModal).toBe(
      'function',
    );
  });

  it('should initialize with show as false when no error', () => {
    const {modal} = callHook({
      error: '',
      noCredentialsMatchingVPRequest: false,
      requestedClaimsByVerifier: '',
      getAdditionalMessage: mockGetAdditionalMessage,
      generateAndStoreLogMessage: mockGenerateAndStoreLogMessage,
      t: mockT,
    });
    expect(modal.show).toBe(false);
  });

  it('should show noMatchingCredentials error with claims', () => {
    const {modal} = callHook({
      error: '',
      noCredentialsMatchingVPRequest: true,
      requestedClaimsByVerifier: 'name,email',
      getAdditionalMessage: mockGetAdditionalMessage,
      generateAndStoreLogMessage: mockGenerateAndStoreLogMessage,
      t: mockT,
    });
    expect(modal.show).toBe(true);
    expect(mockT).toHaveBeenCalledWith('errors.noMatchingCredentials.title');
    expect(mockGenerateAndStoreLogMessage).toHaveBeenCalledWith(
      'NO_CREDENTIAL_MATCHING_REQUEST',
      'name,email',
    );
  });

  it('should show noMatchingCredentialsWithMissingClaims when claims empty', () => {
    const {modal} = callHook({
      error: '',
      noCredentialsMatchingVPRequest: true,
      requestedClaimsByVerifier: '',
      getAdditionalMessage: mockGetAdditionalMessage,
      generateAndStoreLogMessage: mockGenerateAndStoreLogMessage,
      t: mockT,
    });
    expect(modal.show).toBe(true);
    expect(mockT).toHaveBeenCalledWith(
      'errors.noMatchingCredentialsWithMissingClaims.title',
    );
    expect(modal.showRetryButton).toBe(false);
  });

  it('should show invalidVerifier for authentication failure', () => {
    const {modal} = callHook({
      error: 'Verifier authentication was unsuccessful',
      noCredentialsMatchingVPRequest: false,
      requestedClaimsByVerifier: '',
      getAdditionalMessage: mockGetAdditionalMessage,
      generateAndStoreLogMessage: mockGenerateAndStoreLogMessage,
      t: mockT,
    });
    expect(modal.show).toBe(true);
    expect(mockT).toHaveBeenCalledWith('errors.invalidVerifier.title');
    expect(mockGenerateAndStoreLogMessage).toHaveBeenCalledWith(
      'VERIFIER_AUTHENTICATION_FAILED',
    );
  });

  it('should show invalidVerifier for api error', () => {
    const {modal} = callHook({
      error: 'api error something went wrong',
      noCredentialsMatchingVPRequest: false,
      requestedClaimsByVerifier: '',
      getAdditionalMessage: mockGetAdditionalMessage,
      generateAndStoreLogMessage: mockGenerateAndStoreLogMessage,
      t: mockT,
    });
    expect(modal.show).toBe(true);
    expect(mockT).toHaveBeenCalledWith('errors.invalidVerifier.title');
  });

  it('should show credentialsMismatch error', () => {
    const {modal} = callHook({
      error: 'credential mismatch detected',
      noCredentialsMatchingVPRequest: false,
      requestedClaimsByVerifier: 'age',
      getAdditionalMessage: mockGetAdditionalMessage,
      generateAndStoreLogMessage: mockGenerateAndStoreLogMessage,
      t: mockT,
    });
    expect(modal.show).toBe(true);
    expect(mockT).toHaveBeenCalledWith('errors.credentialsMismatch.title');
    expect(mockGenerateAndStoreLogMessage).toHaveBeenCalledWith(
      'CREDENTIAL_MISMATCH_FROM_KEBAB',
      'age',
    );
  });

  it('should show noImage error', () => {
    const {modal} = callHook({
      error: 'none of the selected VC has image',
      noCredentialsMatchingVPRequest: false,
      requestedClaimsByVerifier: '',
      getAdditionalMessage: mockGetAdditionalMessage,
      generateAndStoreLogMessage: mockGenerateAndStoreLogMessage,
      t: mockT,
    });
    expect(modal.show).toBe(true);
    expect(mockT).toHaveBeenCalledWith('errors.noImage.title');
    expect(mockGenerateAndStoreLogMessage).toHaveBeenCalledWith(
      'NO_SELECTED_VC_HAS_IMAGE',
    );
  });

  it('should show invalidRequestURI error', () => {
    const {modal} = callHook({
      error: 'invalid_request_uri_method',
      noCredentialsMatchingVPRequest: false,
      requestedClaimsByVerifier: '',
      getAdditionalMessage: mockGetAdditionalMessage,
      generateAndStoreLogMessage: mockGenerateAndStoreLogMessage,
      t: mockT,
    });
    expect(modal.show).toBe(true);
    expect(mockT).toHaveBeenCalledWith('errors.invalidRequestURI.title');
    expect(mockGenerateAndStoreLogMessage).toHaveBeenCalledWith(
      'INVALID_REQUEST_URI_METHOD',
    );
  });

  it('should show invalidQrCode for invalid_request', () => {
    const {modal} = callHook({
      error: 'invalid_request',
      noCredentialsMatchingVPRequest: false,
      requestedClaimsByVerifier: '',
      getAdditionalMessage: mockGetAdditionalMessage,
      generateAndStoreLogMessage: mockGenerateAndStoreLogMessage,
      t: mockT,
    });
    expect(modal.show).toBe(true);
    expect(mockT).toHaveBeenCalledWith('errors.invalidQrCode.title');
    expect(mockGenerateAndStoreLogMessage).toHaveBeenCalledWith(
      'INVALID_AUTH_REQUEST',
    );
  });

  it('should show invalidQrCode for invalid_request_object', () => {
    const {modal} = callHook({
      error: 'invalid_request_object',
      noCredentialsMatchingVPRequest: false,
      requestedClaimsByVerifier: '',
      getAdditionalMessage: mockGetAdditionalMessage,
      generateAndStoreLogMessage: mockGenerateAndStoreLogMessage,
      t: mockT,
    });
    expect(modal.show).toBe(true);
    expect(mockT).toHaveBeenCalledWith('errors.invalidQrCode.title');
  });

  it('should show vpFormatsNotSupported error', () => {
    const {modal} = callHook({
      error: 'vp_formats_not_supported',
      noCredentialsMatchingVPRequest: false,
      requestedClaimsByVerifier: '',
      getAdditionalMessage: mockGetAdditionalMessage,
      generateAndStoreLogMessage: mockGenerateAndStoreLogMessage,
      t: mockT,
    });
    expect(modal.show).toBe(true);
    expect(mockT).toHaveBeenCalledWith('errors.vpFormatsNotSupported.title');
    expect(mockGenerateAndStoreLogMessage).toHaveBeenCalledWith(
      'REQUEST_COULD_NOT_BE_PROCESSED',
    );
  });

  it('should show invalidPresentationDefinitionURI error', () => {
    const {modal} = callHook({
      error: 'invalid_presentation_definition_uri',
      noCredentialsMatchingVPRequest: false,
      requestedClaimsByVerifier: '',
      getAdditionalMessage: mockGetAdditionalMessage,
      generateAndStoreLogMessage: mockGenerateAndStoreLogMessage,
      t: mockT,
    });
    expect(modal.show).toBe(true);
    expect(mockT).toHaveBeenCalledWith(
      'errors.invalidPresentationDefinitionURI.title',
    );
    expect(mockGenerateAndStoreLogMessage).toHaveBeenCalledWith(
      'INVALID_PRESENTATION_DEFINITION_URI',
    );
  });

  it('should show invalidPresentationDefinitionRef error', () => {
    const {modal} = callHook({
      error: 'invalid_presentation_definition_reference',
      noCredentialsMatchingVPRequest: false,
      requestedClaimsByVerifier: '',
      getAdditionalMessage: mockGetAdditionalMessage,
      generateAndStoreLogMessage: mockGenerateAndStoreLogMessage,
      t: mockT,
    });
    expect(modal.show).toBe(true);
    expect(mockT).toHaveBeenCalledWith(
      'errors.invalidPresentationDefinitionRef.title',
    );
    expect(mockGenerateAndStoreLogMessage).toHaveBeenCalledWith(
      'REQUEST_COULD_NOT_BE_PROCESSED',
    );
  });

  it('should show invalidQrCode for invalid_client', () => {
    const {modal} = callHook({
      error: 'invalid_client',
      noCredentialsMatchingVPRequest: false,
      requestedClaimsByVerifier: '',
      getAdditionalMessage: mockGetAdditionalMessage,
      generateAndStoreLogMessage: mockGenerateAndStoreLogMessage,
      t: mockT,
    });
    expect(modal.show).toBe(true);
    expect(mockT).toHaveBeenCalledWith('errors.invalidQrCode.title');
    expect(mockGenerateAndStoreLogMessage).toHaveBeenCalledWith(
      'REQUEST_COULD_NOT_BE_PROCESSED',
    );
  });

  it('should show verifierResponseError', () => {
    const {modal} = callHook({
      error: 'VERIFIER_RESPONSE_ERROR',
      noCredentialsMatchingVPRequest: false,
      requestedClaimsByVerifier: '',
      getAdditionalMessage: mockGetAdditionalMessage,
      generateAndStoreLogMessage: mockGenerateAndStoreLogMessage,
      t: mockT,
    });
    expect(modal.show).toBe(true);
    expect(mockT).toHaveBeenCalledWith('errors.verifierResponseError.title');
    expect(mockGenerateAndStoreLogMessage).toHaveBeenCalledWith(
      'SEND_VP_ERROR',
    );
  });

  it('should show sendVPError with retry button', () => {
    const {modal} = callHook({
      error: 'send vp failed due to network issue',
      noCredentialsMatchingVPRequest: false,
      requestedClaimsByVerifier: '',
      getAdditionalMessage: mockGetAdditionalMessage,
      generateAndStoreLogMessage: mockGenerateAndStoreLogMessage,
      t: mockT,
    });
    expect(modal.show).toBe(true);
    expect(mockT).toHaveBeenCalledWith('errors.sendVPError.title');
    expect(modal.showRetryButton).toBe(true);
    expect(mockGenerateAndStoreLogMessage).toHaveBeenCalledWith(
      'SEND_VP_ERROR',
    );
  });

  it('should show trustedVerifierListUpdateError', () => {
    const {modal} = callHook({
      error: 'failed to update trusted verifier list',
      noCredentialsMatchingVPRequest: false,
      requestedClaimsByVerifier: '',
      getAdditionalMessage: mockGetAdditionalMessage,
      generateAndStoreLogMessage: mockGenerateAndStoreLogMessage,
      t: mockT,
    });
    expect(modal.show).toBe(true);
    expect(mockT).toHaveBeenCalledWith(
      'errors.trustedVerifierListUpdateError.title',
    );
    expect(mockGenerateAndStoreLogMessage).toHaveBeenCalledWith(
      'TRUSTED_VERIFIER_LIST_UPDATE_ERROR',
    );
  });

  it('should show invalidTransactionData error', () => {
    const {modal} = callHook({
      error: 'invalid_transaction_data',
      noCredentialsMatchingVPRequest: false,
      requestedClaimsByVerifier: '',
      getAdditionalMessage: mockGetAdditionalMessage,
      generateAndStoreLogMessage: mockGenerateAndStoreLogMessage,
      t: mockT,
    });
    expect(modal.show).toBe(true);
    expect(mockT).toHaveBeenCalledWith('errors.invalidTransactionData.title');
    expect(mockGenerateAndStoreLogMessage).toHaveBeenCalledWith(
      'INVALID_TRANSACTION_DATA',
    );
  });

  it('should show genericError for unknown error strings', () => {
    const {modal} = callHook({
      error: 'some completely unknown error',
      noCredentialsMatchingVPRequest: false,
      requestedClaimsByVerifier: '',
      getAdditionalMessage: mockGetAdditionalMessage,
      generateAndStoreLogMessage: mockGenerateAndStoreLogMessage,
      t: mockT,
    });
    expect(modal.show).toBe(true);
    expect(mockT).toHaveBeenCalledWith('errors.genericError.title');
    expect(mockGenerateAndStoreLogMessage).toHaveBeenCalledWith(
      'TECHNICAL_ERROR',
    );
  });

  it('should include additionalMessage', () => {
    const {modal} = callHook({
      error: 'some error',
      noCredentialsMatchingVPRequest: false,
      requestedClaimsByVerifier: '',
      getAdditionalMessage: mockGetAdditionalMessage,
      generateAndStoreLogMessage: mockGenerateAndStoreLogMessage,
      t: mockT,
    });
    expect(modal.additionalMessage).toBe('additional info');
  });

  it('should return a reset function', () => {
    const {resetFn} = callHook({
      error: 'some error',
      noCredentialsMatchingVPRequest: false,
      requestedClaimsByVerifier: '',
      getAdditionalMessage: mockGetAdditionalMessage,
      generateAndStoreLogMessage: mockGenerateAndStoreLogMessage,
      t: mockT,
    });
    expect(typeof resetFn).toBe('function');
    resetFn();
    // Reset should set show to false
    const lastCall =
      setErrorModalFn.mock.calls[setErrorModalFn.mock.calls.length - 1][0];
    expect(lastCall.show).toBe(false);
  });
});
