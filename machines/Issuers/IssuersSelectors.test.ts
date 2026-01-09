/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  selectIssuers,
  selectSelectedIssuer,
  selectAuthWebViewStatus,
  selectAuthEndPoint,
  selectErrorMessageType,
  selectLoadingReason,
  selectIsDownloadCredentials,
  selectIsTxCodeRequested,
  selectIsConsentRequested,
  selectIssuerLogo,
  selectIssuerName,
  selectTxCodeDisplayDetails,
  selectIsNonGenericError,
  selectIsDone,
  selectIsIdle,
  selectStoring,
  selectIsError,
  selectVerificationErrorMessage,
  selectSelectingCredentialType,
  selectSupportedCredentialTypes,
  selectIsQrScanning,
  selectOVPMachine,
  selectIsAuthorizationSuccess,
  selectAuthorizationType,
  selectIsPresentationAuthorizationInProgress,
  selectIsPresentationAuthorization,
  selectSelectedCredentialType,
} from './IssuersSelectors';

describe('IssuersSelectors', () => {
  const mockState: any = {
    context: {
      issuers: [{issuer_id: '1'}, {issuer_id: '2'}],
      selectedIssuer: {issuer_id: '1', credential_issuer: 'test.example.com'},
      authEndpointToOpen: 'https://auth.example.com',
      authEndpoint: 'https://auth.example.com/authorize',
      errorMessage: 'Test error',
      loadingReason: 'Loading data',
      isTransactionCodeRequested: true,
      isConsentRequested: false,
      issuerLogo: 'https://example.com/logo.png',
      issuerName: 'Test Issuer',
      txCodeInputMode: 'numeric',
      txCodeDescription: 'Enter transaction code',
      txCodeLength: 6,
    },
    matches: jest.fn(
      (stateName: string) => stateName === 'downloadCredentials',
    ),
  };

  describe('selectIssuers', () => {
    it('should return issuers from context', () => {
      const result = selectIssuers(mockState);
      expect(result).toEqual(mockState.context.issuers);
    });

    it('should return array of issuers', () => {
      const result = selectIssuers(mockState);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });
  });

  describe('selectSelectedIssuer', () => {
    it('should return selected issuer from context', () => {
      const result = selectSelectedIssuer(mockState);
      expect(result).toEqual(mockState.context.selectedIssuer);
    });

    it('should return issuer with issuer_id property', () => {
      const result = selectSelectedIssuer(mockState);
      expect(result.issuer_id).toBe('1');
      expect(result.credential_issuer).toBe('test.example.com');
    });
  });

  describe('selectAuthWebViewStatus', () => {
    it('should return auth endpoint to open', () => {
      const result = selectAuthWebViewStatus(mockState);
      expect(result).toBe('https://auth.example.com');
    });
  });

  describe('selectAuthEndPoint', () => {
    it('should return auth endpoint', () => {
      const result = selectAuthEndPoint(mockState);
      expect(result).toBe('https://auth.example.com/authorize');
    });
  });

  describe('selectErrorMessageType', () => {
    it('should return error message from context', () => {
      const result = selectErrorMessageType(mockState);
      expect(result).toBe('Test error');
    });
  });

  describe('selectLoadingReason', () => {
    it('should return loading reason from context', () => {
      const result = selectLoadingReason(mockState);
      expect(result).toBe('Loading data');
    });
  });

  describe('selectIsDownloadCredentials', () => {
    it('should return true when in downloadCredentials state', () => {
      const result = selectIsDownloadCredentials(mockState);
      expect(result).toBe(true);
    });

    it('should call matches with correct state name', () => {
      selectIsDownloadCredentials(mockState);
      expect(mockState.matches).toHaveBeenCalledWith('downloadCredentials');
    });
  });

  describe('selectIsTxCodeRequested', () => {
    it('should return transaction code requested status', () => {
      const result = selectIsTxCodeRequested(mockState);
      expect(result).toBe(true);
    });

    it('should return false when not requested', () => {
      const stateWithFalse: any = {
        ...mockState,
        context: {...mockState.context, isTransactionCodeRequested: false},
      };
      const result = selectIsTxCodeRequested(stateWithFalse);
      expect(result).toBe(false);
    });
  });

  describe('selectIsConsentRequested', () => {
    it('should return consent requested status', () => {
      const result = selectIsConsentRequested(mockState);
      expect(result).toBe(false);
    });

    it('should return true when consent requested', () => {
      const stateWithConsent: any = {
        ...mockState,
        context: {...mockState.context, isConsentRequested: true},
      };
      const result = selectIsConsentRequested(stateWithConsent);
      expect(result).toBe(true);
    });
  });

  describe('selectIssuerLogo', () => {
    it('should return issuer logo URL', () => {
      const result = selectIssuerLogo(mockState);
      expect(result).toBe('https://example.com/logo.png');
    });
  });

  describe('selectIssuerName', () => {
    it('should return issuer name', () => {
      const result = selectIssuerName(mockState);
      expect(result).toBe('Test Issuer');
    });
  });

  describe('selectTxCodeDisplayDetails', () => {
    it('should return transaction code display details', () => {
      const result = selectTxCodeDisplayDetails(mockState);
      expect(result).toEqual({
        inputMode: 'numeric',
        description: 'Enter transaction code',
        length: 6,
      });
    });

    it('should have all required properties', () => {
      const result = selectTxCodeDisplayDetails(mockState);
      expect(result).toHaveProperty('inputMode');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('length');
    });

    it('should return correct input mode', () => {
      const result = selectTxCodeDisplayDetails(mockState);
      expect(result.inputMode).toBe('numeric');
    });

    it('should return correct description', () => {
      const result = selectTxCodeDisplayDetails(mockState);
      expect(result.description).toBe('Enter transaction code');
    });

    it('should return correct length', () => {
      const result = selectTxCodeDisplayDetails(mockState);
      expect(result.length).toBe(6);
    });
  });

  describe('Selectors with empty/null values', () => {
    const emptyState: any = {
      context: {
        issuers: [],
        selectedIssuer: null,
        authEndpointToOpen: '',
        authEndpoint: '',
        errorMessage: '',
        loadingReason: '',
        isTransactionCodeRequested: false,
        isConsentRequested: false,
        issuerLogo: '',
        issuerName: '',
        txCodeInputMode: '',
        txCodeDescription: '',
        txCodeLength: 0,
      },
      matches: jest.fn(() => false),
    };

    it('should handle empty issuers array', () => {
      const result = selectIssuers(emptyState);
      expect(result).toEqual([]);
    });

    it('should handle null selected issuer', () => {
      const result = selectSelectedIssuer(emptyState);
      expect(result).toBeNull();
    });

    it('should handle empty strings', () => {
      expect(selectAuthWebViewStatus(emptyState)).toBe('');
      expect(selectAuthEndPoint(emptyState)).toBe('');
      expect(selectErrorMessageType(emptyState)).toBe('');
      expect(selectLoadingReason(emptyState)).toBe('');
      expect(selectIssuerLogo(emptyState)).toBe('');
      expect(selectIssuerName(emptyState)).toBe('');
    });

    it('should handle false boolean values', () => {
      expect(selectIsTxCodeRequested(emptyState)).toBe(false);
      expect(selectIsConsentRequested(emptyState)).toBe(false);
      expect(selectIsDownloadCredentials(emptyState)).toBe(false);
    });

    it('should handle zero length', () => {
      const result = selectTxCodeDisplayDetails(emptyState);
      expect(result.length).toBe(0);
    });
  });

  describe('selectIsNonGenericError', () => {
    it('should return true when error message is not generic and not empty', () => {
      const stateWithError: any = {
        context: {errorMessage: 'NETWORK_ERROR'},
      };
      const result = selectIsNonGenericError(stateWithError);
      expect(result).toBe(true);
    });

    it('should return false when error message is GENERIC', () => {
      const stateWithGenericError: any = {
        context: {errorMessage: 'generic'},
      };
      const result = selectIsNonGenericError(stateWithGenericError);
      expect(result).toBe(false);
    });

    it('should return false when error message is empty', () => {
      const stateWithNoError: any = {
        context: {errorMessage: ''},
      };
      const result = selectIsNonGenericError(stateWithNoError);
      expect(result).toBe(false);
    });
  });

  describe('selectIsDone', () => {
    it('should return true when state matches done', () => {
      const doneState: any = {
        matches: jest.fn((name: string) => name === 'done'),
      };
      const result = selectIsDone(doneState);
      expect(result).toBe(true);
      expect(doneState.matches).toHaveBeenCalledWith('done');
    });

    it('should return false when state does not match done', () => {
      const notDoneState: any = {
        matches: jest.fn(() => false),
      };
      const result = selectIsDone(notDoneState);
      expect(result).toBe(false);
    });
  });

  describe('selectIsIdle', () => {
    it('should return true when state matches idle', () => {
      const idleState: any = {
        matches: jest.fn((name: string) => name === 'idle'),
      };
      const result = selectIsIdle(idleState);
      expect(result).toBe(true);
      expect(idleState.matches).toHaveBeenCalledWith('idle');
    });
  });

  describe('selectStoring', () => {
    it('should return true when state matches storing', () => {
      const storingState: any = {
        matches: jest.fn((name: string) => name === 'storing'),
      };
      const result = selectStoring(storingState);
      expect(result).toBe(true);
      expect(storingState.matches).toHaveBeenCalledWith('storing');
    });
  });

  describe('selectIsError', () => {
    it('should return true when state matches error', () => {
      const errorState: any = {
        matches: jest.fn((name: string) => name === 'error'),
      };
      const result = selectIsError(errorState);
      expect(result).toBe(true);
      expect(errorState.matches).toHaveBeenCalledWith('error');
    });
  });

  describe('selectVerificationErrorMessage', () => {
    it('should return verification error message', () => {
      const stateWithVerificationError: any = {
        context: {verificationErrorMessage: 'Signature verification failed'},
      };
      const result = selectVerificationErrorMessage(stateWithVerificationError);
      expect(result).toBe('Signature verification failed');
    });
  });

  describe('selectSelectingCredentialType', () => {
    it('should return true when selecting credential type', () => {
      const selectingState: any = {
        matches: jest.fn((name: string) => name === 'selectingCredentialType'),
      };
      const result = selectSelectingCredentialType(selectingState);
      expect(result).toBe(true);
      expect(selectingState.matches).toHaveBeenCalledWith(
        'selectingCredentialType',
      );
    });
  });

  describe('selectSupportedCredentialTypes', () => {
    it('should return supported credential types', () => {
      const stateWithCredTypes: any = {
        context: {
          supportedCredentialTypes: [
            {id: 'type1', name: 'Type 1'},
            {id: 'type2', name: 'Type 2'},
          ],
        },
      };
      const result = selectSupportedCredentialTypes(stateWithCredTypes);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('type1');
      expect(result[1].id).toBe('type2');
    });
  });

  describe('selectIsQrScanning', () => {
    it('should return true when waiting for QR scan', () => {
      const scanningState: any = {
        matches: jest.fn((name: string) => name === 'waitingForQrScan'),
      };
      const result = selectIsQrScanning(scanningState);
      expect(result).toBe(true);
      expect(scanningState.matches).toHaveBeenCalledWith('waitingForQrScan');
    });
  });

  describe('selectOVPMachine', () => {
    it('should return the OVP machine state', () => {
      const state: any = {
        context: {
          OpenId4VPRef: {id: 'OpenID4VP_1'},
        },
      };
      const result = selectOVPMachine(state);

      expect(result).toEqual({id: 'OpenID4VP_1'});
    });
  });

  describe('selectIsPresentationAuthorization', () => {
    it('should return true when in downloadCredentials.presentationAuthorization state', () => {
      const state = {
        matches: jest.fn(
          (statePath: string) =>
            statePath === 'downloadCredentials.presentationAuthorization',
        ),
      };
      expect(selectIsPresentationAuthorization(state as any)).toBe(true);
    });

    it('should return true when in credentialDownloadFromOffer.presentationAuthorization state', () => {
      const state = {
        matches: jest.fn(
          (statePath: string) =>
            statePath ===
            'credentialDownloadFromOffer.presentationAuthorization',
        ),
      };
      expect(selectIsPresentationAuthorization(state as any)).toBe(true);
    });

    it('should return false when not in any presentationAuthorization state', () => {
      const state = {
        matches: jest.fn(() => false),
      };
      expect(selectIsPresentationAuthorization(state as any)).toBe(false);
    });
  });

  describe('selectIsPresentationAuthorizationInProgress', () => {
    it('should return true when in downloadCredentials.presentationAuthorization.inProgress state', () => {
      const state = {
        matches: jest.fn(
          (statePath: string) =>
            statePath ===
            'downloadCredentials.presentationAuthorization.inProgress',
        ),
      };
      expect(selectIsPresentationAuthorizationInProgress(state as any)).toBe(
        true,
      );
    });

    it('should return true when in credentialDownloadFromOffer.presentationAuthorization.inProgress state', () => {
      const state = {
        matches: jest.fn(
          (statePath: string) =>
            statePath ===
            'credentialDownloadFromOffer.presentationAuthorization.inProgress',
        ),
      };
      expect(selectIsPresentationAuthorizationInProgress(state as any)).toBe(
        true,
      );
    });

    it('should return false when not in any presentationAuthorization.inProgress state', () => {
      const state = {
        matches: jest.fn(() => false),
      };
      expect(selectIsPresentationAuthorizationInProgress(state as any)).toBe(
        false,
      );
    });
  });

  describe('selectAuthorizationType', () => {
    it('should return the authorization type from context', () => {
      const state = {
        context: {
          authorizationType: 'presentation',
        },
      };
      expect(selectAuthorizationType(state as any)).toBe('presentation');
    });

    it('should return undefined when authorization type is not set', () => {
      const state = {
        context: {},
      };
      expect(selectAuthorizationType(state as any)).toBeUndefined();
    });

    it('should return code authorization type', () => {
      const state = {
        context: {
          authorizationType: 'code',
        },
      };
      expect(selectAuthorizationType(state as any)).toBe('code');
    });
  });

  describe('selectSelectedCredentialType', () => {
    it('should return the selected credential type from context', () => {
      const state = {
        context: {
          selectedCredentialType: 'VerifiableCredential',
        },
      };
      expect(selectSelectedCredentialType(state as any)).toBe(
        'VerifiableCredential',
      );
    });

    it('should return undefined when selected credential type is not set', () => {
      const state = {
        context: {},
      };
      expect(selectSelectedCredentialType(state as any)).toBeUndefined();
    });

    it('should return insurance credential type', () => {
      const state = {
        context: {
          selectedCredentialType: 'InsuranceCredential',
        },
      };
      expect(selectSelectedCredentialType(state as any)).toBe(
        'InsuranceCredential',
      );
    });
  });

  describe('selectIsAuthorizationSuccess', () => {
    it('should return true when authorizationSuccess is true in context', () => {
      const state = {
        context: {
          authorizationSuccess: true,
        },
      };
      expect(selectIsAuthorizationSuccess(state as any)).toBe(true);
    });

    it('should return false when authorizationSuccess is false in context', () => {
      const state = {
        context: {
          authorizationSuccess: false,
        },
      };
      expect(selectIsAuthorizationSuccess(state as any)).toBe(false);
    });

    it('should return undefined when authorizationSuccess is not set in context', () => {
      const state = {
        context: {},
      };
      expect(selectIsAuthorizationSuccess(state as any)).toBeUndefined();
    });
  });
});
