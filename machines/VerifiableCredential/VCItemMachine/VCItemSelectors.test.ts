/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  selectVerificationStatus,
  selectIsVerificationInProgress,
  selectIsVerificationCompleted,
  selectShowVerificationStatusBanner,
  selectVerifiableCredential,
  getVerifiableCredential,
  selectCredential,
  selectVerifiableCredentialData,
  selectKebabPopUp,
  selectContext,
  selectGeneratedOn,
  selectWalletBindingSuccess,
  selectWalletBindingResponse,
  selectIsCommunicationDetails,
  selectWalletBindingError,
  selectBindingAuthFailedError,
  selectAcceptingBindingOtp,
  selectWalletBindingInProgress,
  selectBindingWarning,
  selectRemoveWalletWarning,
  selectIsPinned,
  selectOtpError,
  selectShowActivities,
  selectShowWalletBindingError,
  selectVc,
} from './VCItemSelectors';

describe('VCItemSelectors', () => {
  describe('selectVerificationStatus', () => {
    it('should return verification status from context', () => {
      const mockState: any = {
        context: {
          verificationStatus: 'verified',
        },
      };
      expect(selectVerificationStatus(mockState)).toBe('verified');
    });
  });

  describe('selectIsVerificationInProgress', () => {
    it('should return true when in verifyingCredential state', () => {
      const mockState: any = {
        matches: jest.fn(
          (state: string) => state === 'verifyState.verifyingCredential',
        ),
      };
      expect(selectIsVerificationInProgress(mockState)).toBe(true);
    });

    it('should return false when not in verifyingCredential state', () => {
      const mockState: any = {
        matches: jest.fn(() => false),
      };
      expect(selectIsVerificationInProgress(mockState)).toBe(false);
    });
  });

  describe('selectIsVerificationCompleted', () => {
    it('should return true when in verificationCompleted state', () => {
      const mockState: any = {
        matches: jest.fn(
          (state: string) => state === 'verifyState.verificationCompleted',
        ),
      };
      expect(selectIsVerificationCompleted(mockState)).toBe(true);
    });

    it('should return false when not in verificationCompleted state', () => {
      const mockState: any = {
        matches: jest.fn(() => false),
      };
      expect(selectIsVerificationCompleted(mockState)).toBe(false);
    });
  });

  describe('selectShowVerificationStatusBanner', () => {
    it('should return showVerificationStatusBanner from context', () => {
      const mockState: any = {
        context: {
          showVerificationStatusBanner: true,
        },
      };
      expect(selectShowVerificationStatusBanner(mockState)).toBe(true);
    });
  });

  describe('selectVerifiableCredential', () => {
    it('should return verifiableCredential from context', () => {
      const mockVC = {credential: {id: 'test-123'}};
      const mockState: any = {
        context: {
          verifiableCredential: mockVC,
        },
      };
      expect(selectVerifiableCredential(mockState)).toBe(mockVC);
    });
  });

  describe('getVerifiableCredential', () => {
    it('should return credential property if it exists', () => {
      const mockCredential = {id: 'cred-123'};
      const mockVC: any = {
        credential: mockCredential,
      };
      expect(getVerifiableCredential(mockVC)).toBe(mockCredential);
    });

    it('should return the whole object if credential property does not exist', () => {
      const mockCredential: any = {id: 'cred-456'};
      expect(getVerifiableCredential(mockCredential)).toBe(mockCredential);
    });
  });

  describe('selectCredential', () => {
    it('should return verifiableCredential from context', () => {
      const mockVC = {credential: {id: 'test-789'}};
      const mockState: any = {
        context: {
          verifiableCredential: mockVC,
        },
      };
      expect(selectCredential(mockState)).toBe(mockVC);
    });
  });

  describe('selectVerifiableCredentialData', () => {
    it('should return formatted verifiable credential data', () => {
      const mockState: any = {
        context: {
          vcMetadata: {
            id: 'vc-001',
            issuer: 'Test Issuer',
            format: 'ldp_vc',
          },
          verifiableCredential: {
            credential: {
              credentialSubject: {
                name: 'John Doe',
              },
            },
            issuerLogo: 'https://example.com/logo.png',
            wellKnown: 'https://example.com/.well-known',
            credentialConfigurationId: 'config-123',
          },
          format: 'ldp_vc',
          credential: null,
        },
      };

      const result = selectVerifiableCredentialData(mockState);
      expect(result.issuer).toBe('Test Issuer');
      expect(result.issuerLogo).toBe('https://example.com/logo.png');
      expect(result.wellKnown).toBe('https://example.com/.well-known');
      expect(result.credentialConfigurationId).toBe('config-123');
    });
  });

  describe('selectKebabPopUp', () => {
    it('should return isMachineInKebabPopupState from context', () => {
      const mockState: any = {
        context: {
          isMachineInKebabPopupState: true,
        },
      };
      expect(selectKebabPopUp(mockState)).toBe(true);
    });
  });

  describe('selectContext', () => {
    it('should return entire context', () => {
      const mockContext = {
        verificationStatus: 'verified',
        generatedOn: '2023-01-01',
      };
      const mockState: any = {
        context: mockContext,
      };
      expect(selectContext(mockState)).toBe(mockContext);
    });
  });

  describe('selectGeneratedOn', () => {
    it('should return generatedOn from context', () => {
      const mockState: any = {
        context: {
          generatedOn: '2023-12-25',
        },
      };
      expect(selectGeneratedOn(mockState)).toBe('2023-12-25');
    });
  });

  describe('selectWalletBindingSuccess', () => {
    it('should return walletBindingResponse from context', () => {
      const mockResponse = {walletBindingId: 'binding-123'};
      const mockState: any = {
        context: {
          walletBindingResponse: mockResponse,
        },
      };
      expect(selectWalletBindingSuccess(mockState)).toBe(mockResponse);
    });
  });

  describe('selectWalletBindingResponse', () => {
    it('should return walletBindingResponse from context', () => {
      const mockResponse = {walletBindingId: 'binding-456'};
      const mockState: any = {
        context: {
          walletBindingResponse: mockResponse,
        },
      };
      expect(selectWalletBindingResponse(mockState)).toBe(mockResponse);
    });
  });

  describe('selectIsCommunicationDetails', () => {
    it('should return communicationDetails from context', () => {
      const mockDetails = {email: 'test@example.com', phone: '1234567890'};
      const mockState: any = {
        context: {
          communicationDetails: mockDetails,
        },
      };
      expect(selectIsCommunicationDetails(mockState)).toBe(mockDetails);
    });
  });

  describe('selectWalletBindingError', () => {
    it('should return error from context', () => {
      const mockError = new Error('Binding failed');
      const mockState: any = {
        context: {
          error: mockError,
        },
      };
      expect(selectWalletBindingError(mockState)).toBe(mockError);
    });
  });

  describe('selectBindingAuthFailedError', () => {
    it('should return error from context', () => {
      const mockError = new Error('Auth failed');
      const mockState: any = {
        context: {
          error: mockError,
        },
      };
      expect(selectBindingAuthFailedError(mockState)).toBe(mockError);
    });
  });

  describe('selectAcceptingBindingOtp', () => {
    it('should return true when in acceptingBindingOTP state', () => {
      const mockState: any = {
        matches: jest.fn(
          (state: string) =>
            state === 'vcUtilitiesState.walletBinding.acceptingBindingOTP',
        ),
      };
      expect(selectAcceptingBindingOtp(mockState)).toBe(true);
    });

    it('should return false when not in acceptingBindingOTP state', () => {
      const mockState: any = {
        matches: jest.fn(() => false),
      };
      expect(selectAcceptingBindingOtp(mockState)).toBe(false);
    });
  });

  describe('selectWalletBindingInProgress', () => {
    it('should return true when in requestingBindingOTP state', () => {
      const mockState: any = {
        matches: jest.fn(
          (state: string) =>
            state === 'vcUtilitiesState.walletBinding.requestingBindingOTP',
        ),
      };
      expect(selectWalletBindingInProgress(mockState)).toBe(true);
    });

    it('should return true when in addingWalletBindingId state', () => {
      const mockState: any = {
        matches: jest.fn(
          (state: string) =>
            state === 'vcUtilitiesState.walletBinding.addingWalletBindingId',
        ),
      };
      expect(selectWalletBindingInProgress(mockState)).toBe(true);
    });

    it('should return true when in addKeyPair state', () => {
      const mockState: any = {
        matches: jest.fn(
          (state: string) =>
            state === 'vcUtilitiesState.walletBinding.addKeyPair',
        ),
      };
      expect(selectWalletBindingInProgress(mockState)).toBe(true);
    });

    it('should return true when in updatingPrivateKey state', () => {
      const mockState: any = {
        matches: jest.fn(
          (state: string) =>
            state === 'vcUtilitiesState.walletBinding.updatingPrivateKey',
        ),
      };
      expect(selectWalletBindingInProgress(mockState)).toBe(true);
    });

    it('should return false when not in any wallet binding progress state', () => {
      const mockState: any = {
        matches: jest.fn(() => false),
      };
      expect(selectWalletBindingInProgress(mockState)).toBe(false);
    });
  });

  describe('selectBindingWarning', () => {
    it('should return true when in showBindingWarning state', () => {
      const mockState: any = {
        matches: jest.fn(
          (state: string) =>
            state === 'vcUtilitiesState.walletBinding.showBindingWarning',
        ),
      };
      expect(selectBindingWarning(mockState)).toBe(true);
    });

    it('should return false when not in showBindingWarning state', () => {
      const mockState: any = {
        matches: jest.fn(() => false),
      };
      expect(selectBindingWarning(mockState)).toBe(false);
    });
  });

  describe('selectRemoveWalletWarning', () => {
    it('should return true when in removeWallet state', () => {
      const mockState: any = {
        matches: jest.fn(
          (state: string) =>
            state === 'vcUtilitiesState.kebabPopUp.removeWallet',
        ),
      };
      expect(selectRemoveWalletWarning(mockState)).toBe(true);
    });

    it('should return false when not in removeWallet state', () => {
      const mockState: any = {
        matches: jest.fn(() => false),
      };
      expect(selectRemoveWalletWarning(mockState)).toBe(false);
    });
  });

  describe('selectIsPinned', () => {
    it('should return isPinned from vcMetadata', () => {
      const mockState: any = {
        context: {
          vcMetadata: {
            isPinned: true,
          },
        },
      };
      expect(selectIsPinned(mockState)).toBe(true);
    });

    it('should return false when isPinned is false', () => {
      const mockState: any = {
        context: {
          vcMetadata: {
            isPinned: false,
          },
        },
      };
      expect(selectIsPinned(mockState)).toBe(false);
    });
  });

  describe('selectOtpError', () => {
    it('should return error from context', () => {
      const mockError = new Error('OTP invalid');
      const mockState: any = {
        context: {
          error: mockError,
        },
      };
      expect(selectOtpError(mockState)).toBe(mockError);
    });
  });

  describe('selectShowActivities', () => {
    it('should return true when in showActivities state', () => {
      const mockState: any = {
        matches: jest.fn(
          (state: string) =>
            state === 'vcUtilitiesState.kebabPopUp.showActivities',
        ),
      };
      expect(selectShowActivities(mockState)).toBe(true);
    });

    it('should return false when not in showActivities state', () => {
      const mockState: any = {
        matches: jest.fn(() => false),
      };
      expect(selectShowActivities(mockState)).toBe(false);
    });
  });

  describe('selectShowWalletBindingError', () => {
    it('should return true when in showingWalletBindingError state', () => {
      const mockState: any = {
        matches: jest.fn(
          (state: string) =>
            state ===
            'vcUtilitiesState.walletBinding.showingWalletBindingError',
        ),
      };
      expect(selectShowWalletBindingError(mockState)).toBe(true);
    });

    it('should return false when not in showingWalletBindingError state', () => {
      const mockState: any = {
        matches: jest.fn(() => false),
      };
      expect(selectShowWalletBindingError(mockState)).toBe(false);
    });
  });

  describe('selectVc', () => {
    it('should return context without serviceRefs', () => {
      const mockState: any = {
        context: {
          verificationStatus: 'verified',
          generatedOn: '2023-01-01',
          serviceRefs: {ref1: 'service1', ref2: 'service2'},
        },
      };
      const result: any = selectVc(mockState);
      expect(result.verificationStatus).toBe('verified');
      expect(result.generatedOn).toBe('2023-01-01');
      expect(result.serviceRefs).toBeUndefined();
    });
  });
});
