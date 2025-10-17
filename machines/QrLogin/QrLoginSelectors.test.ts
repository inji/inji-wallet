/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  selectMyVcs,
  selectIsWaitingForData,
  selectDomainName,
  selectIsLinkTransaction,
  selectIsloadMyVcs,
  selectIsShowingVcList,
  selectIsisVerifyingIdentity,
  selectIsInvalidIdentity,
  selectIsShowError,
  selectIsRequestConsent,
  selectIsSendingAuthenticate,
  selectIsSendingConsent,
  selectIsVerifyingSuccesful,
  selectCredential,
  selectVerifiableCredentialData,
  selectLinkTransactionResponse,
  selectEssentialClaims,
  selectVoluntaryClaims,
  selectLogoUrl,
  selectClientName,
  selectErrorMessage,
  selectIsSharing,
  selectIsQrLoginViaDeepLink,
  selectIsFaceVerificationConsent,
} from './QrLoginSelectors';

describe('QrLoginSelectors', () => {
  const mockVc = {
    vcMetadata: {id: 'vc1', displayName: 'Test VC'},
    credential: {},
  };

  const mockState: any = {
    context: {
      myVcs: [mockVc],
      domainName: 'example.com',
      selectedVc: mockVc,
      senderInfo: {name: 'Test Sender'},
      linkTransactionResponse: {status: 'success'},
      verifiableCredentialData: {type: 'VerifiableCredential'},
      connectionParams: {uri: 'https://connect.example.com'},
    },
    matches: jest.fn((stateName: string) => stateName === 'waitingForData'),
  };

  describe('selectMyVcs', () => {
    it('should return my VCs from context', () => {
      const result = selectMyVcs(mockState);
      expect(result).toEqual([mockVc]);
    });

    it('should return array of VCs', () => {
      const result = selectMyVcs(mockState);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
    });
  });

  describe('selectIsWaitingForData', () => {
    it('should return true when in waitingForData state', () => {
      const result = selectIsWaitingForData(mockState);
      expect(result).toBe(true);
    });

    it('should call matches with correct state', () => {
      selectIsWaitingForData(mockState);
      expect(mockState.matches).toHaveBeenCalledWith('waitingForData');
    });

    it('should return false when not in waitingForData state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn(() => false),
      };
      const result = selectIsWaitingForData(state);
      expect(result).toBe(false);
    });
  });

  describe('selectDomainName', () => {
    it('should return domain name from context', () => {
      const result = selectDomainName(mockState);
      expect(result).toBe('example.com');
    });
  });

  describe('selectIsLinkTransaction', () => {
    it('should return true when in linkTransaction state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'linkTransaction'),
      };
      const result = selectIsLinkTransaction(state);
      expect(result).toBe(true);
    });

    it('should call matches with linkTransaction', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn(() => false),
      };
      selectIsLinkTransaction(state);
      expect(state.matches).toHaveBeenCalledWith('linkTransaction');
    });
  });

  describe('selectIsloadMyVcs', () => {
    it('should return true when in loadMyVcs state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'loadMyVcs'),
      };
      const result = selectIsloadMyVcs(state);
      expect(result).toBe(true);
    });

    it('should call matches with loadMyVcs', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn(() => false),
      };
      selectIsloadMyVcs(state);
      expect(state.matches).toHaveBeenCalledWith('loadMyVcs');
    });
  });

  describe('selectIsShowingVcList', () => {
    it('should return true when in showvcList state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'showvcList'),
      };
      const result = selectIsShowingVcList(state);
      expect(result).toBe(true);
    });

    it('should call matches with showvcList', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn(() => false),
      };
      selectIsShowingVcList(state);
      expect(state.matches).toHaveBeenCalledWith('showvcList');
    });
  });

  describe('selectIsisVerifyingIdentity', () => {
    it('should return true when in faceAuth state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'faceAuth'),
      };
      const result = selectIsisVerifyingIdentity(state);
      expect(result).toBe(true);
    });

    it('should call matches with faceAuth', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn(() => false),
      };
      selectIsisVerifyingIdentity(state);
      expect(state.matches).toHaveBeenCalledWith('faceAuth');
    });
  });

  describe('selectIsInvalidIdentity', () => {
    it('should return true when in invalidIdentity state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'invalidIdentity'),
      };
      const result = selectIsInvalidIdentity(state);
      expect(result).toBe(true);
    });

    it('should call matches with invalidIdentity', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn(() => false),
      };
      selectIsInvalidIdentity(state);
      expect(state.matches).toHaveBeenCalledWith('invalidIdentity');
    });
  });

  describe('selectIsShowError', () => {
    it('should return true when in ShowError state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'ShowError'),
      };
      const result = selectIsShowError(state);
      expect(result).toBe(true);
    });

    it('should call matches with ShowError', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn(() => false),
      };
      selectIsShowError(state);
      expect(state.matches).toHaveBeenCalledWith('ShowError');
    });
  });

  describe('selectIsRequestConsent', () => {
    it('should return true when in requestConsent state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'requestConsent'),
      };
      const result = selectIsRequestConsent(state);
      expect(result).toBe(true);
    });

    it('should call matches with requestConsent', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn(() => false),
      };
      selectIsRequestConsent(state);
      expect(state.matches).toHaveBeenCalledWith('requestConsent');
    });
  });

  describe('selectIsSendingAuthenticate', () => {
    it('should return true when in sendingAuthenticate state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'sendingAuthenticate'),
      };
      const result = selectIsSendingAuthenticate(state);
      expect(result).toBe(true);
    });

    it('should call matches with sendingAuthenticate', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn(() => false),
      };
      selectIsSendingAuthenticate(state);
      expect(state.matches).toHaveBeenCalledWith('sendingAuthenticate');
    });
  });

  describe('selectIsSendingConsent', () => {
    it('should return true when in sendingConsent state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'sendingConsent'),
      };
      const result = selectIsSendingConsent(state);
      expect(result).toBe(true);
    });

    it('should call matches with sendingConsent', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn(() => false),
      };
      selectIsSendingConsent(state);
      expect(state.matches).toHaveBeenCalledWith('sendingConsent');
    });
  });

  describe('selectIsVerifyingSuccesful', () => {
    it('should return true when in success state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'success'),
      };
      const result = selectIsVerifyingSuccesful(state);
      expect(result).toBe(true);
    });

    it('should call matches with success', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn(() => false),
      };
      selectIsVerifyingSuccesful(state);
      expect(state.matches).toHaveBeenCalledWith('success');
    });
  });

  describe('selectCredential', () => {
    it('should return credential from selectedVc', () => {
      const result = selectCredential(mockState);
      expect(result).toBeDefined();
    });

    it('should handle null selectedVc', () => {
      const state: any = {
        ...mockState,
        context: {...mockState.context, selectedVc: null},
      };
      const result = selectCredential(state);
      expect(result).toBeUndefined();
    });
  });

  describe('selectVerifiableCredentialData', () => {
    it('should return verifiable credential data', () => {
      const result = selectVerifiableCredentialData(mockState);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
    });

    it('should include vcMetadata, issuer, and issuerLogo', () => {
      const result = selectVerifiableCredentialData(mockState);
      expect(result[0]).toHaveProperty('vcMetadata');
      expect(result[0]).toHaveProperty('issuer');
      expect(result[0]).toHaveProperty('issuerLogo');
    });
  });

  describe('selectLinkTransactionResponse', () => {
    it('should return link transaction response from context', () => {
      const result = selectLinkTransactionResponse(mockState);
      expect(result).toEqual({status: 'success'});
    });
  });

  describe('selectEssentialClaims', () => {
    const stateWithClaims: any = {
      ...mockState,
      context: {...mockState.context, essentialClaims: ['name', 'age']},
    };

    it('should return essential claims from context', () => {
      const result = selectEssentialClaims(stateWithClaims);
      expect(result).toEqual(['name', 'age']);
    });
  });

  describe('selectVoluntaryClaims', () => {
    const stateWithClaims: any = {
      ...mockState,
      context: {...mockState.context, voluntaryClaims: ['email']},
    };

    it('should return voluntary claims from context', () => {
      const result = selectVoluntaryClaims(stateWithClaims);
      expect(result).toEqual(['email']);
    });
  });

  describe('selectLogoUrl', () => {
    const stateWithLogo: any = {
      ...mockState,
      context: {...mockState.context, logoUrl: 'https://example.com/logo.png'},
    };

    it('should return logo URL from context', () => {
      const result = selectLogoUrl(stateWithLogo);
      expect(result).toBe('https://example.com/logo.png');
    });
  });

  describe('selectClientName', () => {
    const stateWithClient: any = {
      ...mockState,
      context: {...mockState.context, clientName: 'Test Client'},
    };

    it('should return client name from context', () => {
      const result = selectClientName(stateWithClient);
      expect(result).toBe('Test Client');
    });
  });

  describe('selectErrorMessage', () => {
    const stateWithError: any = {
      ...mockState,
      context: {...mockState.context, errorMessage: 'Test error'},
    };

    it('should return error message from context', () => {
      const result = selectErrorMessage(stateWithError);
      expect(result).toBe('Test error');
    });
  });

  describe('selectIsSharing', () => {
    const stateWithSharing: any = {
      ...mockState,
      context: {...mockState.context, isSharing: true},
    };

    it('should return sharing status from context', () => {
      const result = selectIsSharing(stateWithSharing);
      expect(result).toBe(true);
    });

    it('should return false when not sharing', () => {
      const state: any = {
        ...mockState,
        context: {...mockState.context, isSharing: false},
      };
      const result = selectIsSharing(state);
      expect(result).toBe(false);
    });
  });

  describe('selectIsQrLoginViaDeepLink', () => {
    const stateWithDeepLink: any = {
      ...mockState,
      context: {...mockState.context, isQrLoginViaDeepLink: true},
    };

    it('should return deep link status from context', () => {
      const result = selectIsQrLoginViaDeepLink(stateWithDeepLink);
      expect(result).toBe(true);
    });

    it('should return false when not via deep link', () => {
      const state: any = {
        ...mockState,
        context: {...mockState.context, isQrLoginViaDeepLink: false},
      };
      const result = selectIsQrLoginViaDeepLink(state);
      expect(result).toBe(false);
    });
  });

  describe('selectIsFaceVerificationConsent', () => {
    it('should return true when in faceVerificationConsent state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'faceVerificationConsent'),
      };
      const result = selectIsFaceVerificationConsent(state);
      expect(result).toBe(true);
    });

    it('should call matches with faceVerificationConsent', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn(() => false),
      };
      selectIsFaceVerificationConsent(state);
      expect(state.matches).toHaveBeenCalledWith('faceVerificationConsent');
    });
  });

  describe('Selectors with empty/null values', () => {
    const emptyState: any = {
      context: {
        myVcs: [],
        domainName: '',
        selectedVc: null,
        linkTransactionResponse: null,
        essentialClaims: [],
        voluntaryClaims: [],
        logoUrl: '',
        clientName: '',
        errorMessage: '',
        isSharing: false,
        isQrLoginViaDeepLink: false,
      },
      matches: jest.fn(() => false),
    };

    it('should handle empty VCs array', () => {
      const result = selectMyVcs(emptyState);
      expect(result).toEqual([]);
    });

    it('should handle empty domain name', () => {
      const result = selectDomainName(emptyState);
      expect(result).toBe('');
    });

    it('should handle empty strings', () => {
      expect(selectLogoUrl(emptyState)).toBe('');
      expect(selectClientName(emptyState)).toBe('');
      expect(selectErrorMessage(emptyState)).toBe('');
    });

    it('should handle null responses', () => {
      expect(selectLinkTransactionResponse(emptyState)).toBeNull();
    });

    it('should handle empty arrays', () => {
      expect(selectEssentialClaims(emptyState)).toEqual([]);
      expect(selectVoluntaryClaims(emptyState)).toEqual([]);
    });

    it('should handle false boolean values', () => {
      expect(selectIsSharing(emptyState)).toBe(false);
      expect(selectIsQrLoginViaDeepLink(emptyState)).toBe(false);
    });

    it('should return false for all state checks', () => {
      expect(selectIsWaitingForData(emptyState)).toBe(false);
      expect(selectIsLinkTransaction(emptyState)).toBe(false);
      expect(selectIsloadMyVcs(emptyState)).toBe(false);
      expect(selectIsShowingVcList(emptyState)).toBe(false);
      expect(selectIsisVerifyingIdentity(emptyState)).toBe(false);
      expect(selectIsInvalidIdentity(emptyState)).toBe(false);
      expect(selectIsShowError(emptyState)).toBe(false);
      expect(selectIsRequestConsent(emptyState)).toBe(false);
      expect(selectIsSendingAuthenticate(emptyState)).toBe(false);
      expect(selectIsSendingConsent(emptyState)).toBe(false);
      expect(selectIsVerifyingSuccesful(emptyState)).toBe(false);
      expect(selectIsFaceVerificationConsent(emptyState)).toBe(false);
    });
  });
});
