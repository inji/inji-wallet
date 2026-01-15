import {
  selectIsGetVCsSatisfyingAuthRequest,
  selectVCsMatchingAuthRequest,
  selectSelectedVCs,
  selectAreAllVCsChecked,
  selectIsGetVPSharingConsent,
  selectIsFaceVerificationConsent,
  selectIsVerifyingIdentity,
  selectIsInvalidIdentity,
  selectIsSharingVP,
  selectIsShowLoadingScreen,
  selectCredentials,
  selectVerifiableCredentialsData,
  selectPurpose,
  selectShowConfirmationPopup,
  selectIsSelectingVcs,
  selectIsError,
  selectOpenID4VPRetryCount,
  selectIsOVPViaDeeplink,
  selectIsFaceVerifiedInVPSharing,
  selectVerifierNameInVPSharing,
  selectRequestedClaimsByVerifier,
  selectshowTrustConsentModal,
  selectVerifierNameInTrustModal,
  selectVerifierLogoInTrustModal,
  selectIsAuthorization,
} from './openID4VPSelectors';
import {VCShareFlowType} from '../../shared/Utils';

describe('openID4VPSelectors', () => {
  describe('selectIsGetVCsSatisfyingAuthRequest', () => {
    it('should return true when in getVCsSatisfyingAuthRequest state', () => {
      const state = {
        matches: jest.fn(() => true),
        context: {},
      } as any;

      expect(selectIsGetVCsSatisfyingAuthRequest(state)).toBe(true);
      expect(state.matches).toHaveBeenCalledWith('getVCsSatisfyingAuthRequest');
    });
  });

  describe('selectVCsMatchingAuthRequest', () => {
    it('should return vcsMatchingAuthRequest from context', () => {
      const mockVCs = [{id: 'vc1'}, {id: 'vc2'}];
      const state = {
        context: {
          vcsMatchingAuthRequest: mockVCs,
        },
      } as any;

      expect(selectVCsMatchingAuthRequest(state)).toEqual(mockVCs);
    });
  });

  describe('selectSelectedVCs', () => {
    it('should return selectedVCs from context', () => {
      const mockSelectedVCs = {vc1: {data: 'test'}};
      const state = {
        context: {
          selectedVCs: mockSelectedVCs,
        },
      } as any;

      expect(selectSelectedVCs(state)).toEqual(mockSelectedVCs);
    });
  });

  describe('selectAreAllVCsChecked', () => {
    it('should return checkedAll from context', () => {
      const state = {
        context: {
          checkedAll: true,
        },
      } as any;

      expect(selectAreAllVCsChecked(state)).toBe(true);
    });
  });

  describe('selectIsGetVPSharingConsent', () => {
    it('should return true when in getConsentForVPSharing state', () => {
      const state = {
        matches: jest.fn(() => true),
        context: {},
      } as any;

      expect(selectIsGetVPSharingConsent(state)).toBe(true);
      expect(state.matches).toHaveBeenCalledWith('getConsentForVPSharing');
    });
  });

  describe('selectIsFaceVerificationConsent', () => {
    it('should return true when in faceVerificationConsent state', () => {
      const state = {
        matches: jest.fn(() => true),
        context: {},
      } as any;

      expect(selectIsFaceVerificationConsent(state)).toBe(true);
      expect(state.matches).toHaveBeenCalledWith('faceVerificationConsent');
    });
  });

  describe('selectIsVerifyingIdentity', () => {
    it('should return true when in verifyingIdentity state', () => {
      const state = {
        matches: jest.fn(() => true),
        context: {},
      } as any;

      expect(selectIsVerifyingIdentity(state)).toBe(true);
      expect(state.matches).toHaveBeenCalledWith('verifyingIdentity');
    });
  });

  describe('selectIsInvalidIdentity', () => {
    it('should return true when in invalidIdentity state', () => {
      const state = {
        matches: jest.fn(() => true),
        context: {},
      } as any;

      expect(selectIsInvalidIdentity(state)).toBe(true);
      expect(state.matches).toHaveBeenCalledWith('invalidIdentity');
    });
  });

  describe('selectIsSharingVP', () => {
    it('should return true when in sendingVP state', () => {
      const state = {
        matches: jest.fn(() => true),
        context: {},
      } as any;

      expect(selectIsSharingVP(state)).toBe(true);
      expect(state.matches).toHaveBeenCalledWith('sendingVP');
    });
  });

  describe('selectIsShowLoadingScreen', () => {
    it('should return showLoadingScreen from context', () => {
      const state = {
        context: {
          showLoadingScreen: true,
        },
      } as any;

      expect(selectIsShowLoadingScreen(state)).toBe(true);
    });
  });

  describe('selectCredentials', () => {
    it('should return empty array when selectedVCs is empty', () => {
      const state = {
        context: {
          selectedVCs: {},
        },
      } as any;

      expect(selectCredentials(state)).toEqual([]);
    });

    it('should process and return credentials from selectedVCs', () => {
      const mockCredential = {data: 'test'};
      const state = {
        context: {
          selectedVCs: {
            key1: {
              inner1: [
                {
                  verifiableCredential: {
                    credential: mockCredential,
                  },
                },
              ],
            },
          },
        },
      } as any;

      const result = selectCredentials(state);
      expect(result).toEqual([mockCredential]);
    });

    it('should handle credentials without nested credential property', () => {
      const mockCredential = {data: 'test'};
      const state = {
        context: {
          selectedVCs: {
            key1: {
              inner1: [
                {
                  verifiableCredential: mockCredential,
                },
              ],
            },
          },
        },
      } as any;

      const result = selectCredentials(state);
      expect(result).toEqual([mockCredential]);
    });
  });

  describe('selectVerifiableCredentialsData', () => {
    it('should return empty array when no selectedVCs', () => {
      const state = {
        context: {
          selectedVCs: {},
        },
      } as any;

      expect(selectVerifiableCredentialsData(state)).toEqual([]);
    });

    it('should process and return verifiable credentials data', () => {
      const state = {
        context: {
          selectedVCs: {
            key1: {
              inner1: [
                {
                  vcMetadata: {
                    issuer: 'TestIssuer',
                  },
                  verifiableCredential: {
                    issuerLogo: 'logo.png',
                    wellKnown: 'wellknown',
                    credentialTypes: ['type1'],
                    credential: {
                      credentialSubject: {
                        face: 'faceData',
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      } as any;

      const result = selectVerifiableCredentialsData(state);
      expect(result).toHaveLength(1);
      expect(result[0].issuer).toBe('TestIssuer');
      expect(result[0].face).toBe('faceData');
    });
  });

  describe('selectPurpose', () => {
    it('should return purpose from context', () => {
      const state = {
        context: {
          purpose: 'verification',
        },
      } as any;

      expect(selectPurpose(state)).toBe('verification');
    });
  });

  describe('selectShowConfirmationPopup', () => {
    it('should return true when in showConfirmationPopup state', () => {
      const state = {
        matches: jest.fn(() => true),
        context: {},
      } as any;

      expect(selectShowConfirmationPopup(state)).toBe(true);
      expect(state.matches).toHaveBeenCalledWith('showConfirmationPopup');
    });
  });

  describe('selectIsSelectingVcs', () => {
    it('should return true when in selectingVCs state', () => {
      const state = {
        matches: jest.fn(() => true),
        context: {},
      } as any;

      expect(selectIsSelectingVcs(state)).toBe(true);
      expect(state.matches).toHaveBeenCalledWith('selectingVCs');
    });
  });

  describe('selectIsError', () => {
    it('should return error from context', () => {
      const mockError = new Error('Test error');
      const state = {
        context: {
          error: mockError,
        },
      } as any;

      expect(selectIsError(state)).toBe(mockError);
    });
  });

  describe('selectOpenID4VPRetryCount', () => {
    it('should return openID4VPRetryCount from context', () => {
      const state = {
        context: {
          openID4VPRetryCount: 3,
        },
      } as any;

      expect(selectOpenID4VPRetryCount(state)).toBe(3);
    });
  });

  describe('selectIsOVPViaDeeplink', () => {
    it('should return isOVPViaDeepLink from context', () => {
      const state = {
        context: {
          isOVPViaDeepLink: true,
        },
      } as any;

      expect(selectIsOVPViaDeeplink(state)).toBe(true);
    });
  });

  describe('selectIsFaceVerifiedInVPSharing', () => {
    it('should return true when in sendingVP state and banner shown', () => {
      const state = {
        matches: jest.fn(() => true),
        context: {
          showFaceCaptureSuccessBanner: true,
        },
      } as any;

      expect(selectIsFaceVerifiedInVPSharing(state)).toBe(true);
      expect(state.matches).toHaveBeenCalledWith('sendingVP');
    });

    it('should return false when not in sendingVP state', () => {
      const state = {
        matches: jest.fn(() => false),
        context: {
          showFaceCaptureSuccessBanner: true,
        },
      } as any;

      expect(selectIsFaceVerifiedInVPSharing(state)).toBe(false);
    });
  });

  describe('selectVerifierNameInVPSharing', () => {
    it('should return client_name from client_metadata', () => {
      const state = {
        context: {
          authenticationResponse: {
            client_metadata: {
              client_name: 'TestVerifier',
            },
          },
        },
      } as any;

      expect(selectVerifierNameInVPSharing(state)).toBe('TestVerifier');
    });

    it('should return client_id when client_name not available', () => {
      const state = {
        context: {
          authenticationResponse: {
            client_id: 'verifier123',
          },
        },
      } as any;

      expect(selectVerifierNameInVPSharing(state)).toBe('verifier123');
    });
  });

  describe('selectRequestedClaimsByVerifier', () => {
    it('should return requestedClaims from context', () => {
      const mockClaims = ['name', 'age'];
      const state = {
        context: {
          requestedClaims: mockClaims,
        },
      } as any;

      expect(selectRequestedClaimsByVerifier(state)).toEqual(mockClaims);
    });
  });

  describe('selectshowTrustConsentModal', () => {
    it('should return showTrustConsentModal from context', () => {
      const state = {
        context: {
          showTrustConsentModal: true,
        },
      } as any;

      expect(selectshowTrustConsentModal(state)).toBe(true);
    });
  });

  describe('selectVerifierNameInTrustModal', () => {
    it('should return client_name from client_metadata', () => {
      const state = {
        context: {
          authenticationResponse: {
            client_metadata: {
              client_name: 'TrustedVerifier',
            },
          },
        },
      } as any;

      expect(selectVerifierNameInTrustModal(state)).toBe('TrustedVerifier');
    });
  });

  describe('selectVerifierLogoInTrustModal', () => {
    it('should return logo_uri from client_metadata', () => {
      const state = {
        context: {
          authenticationResponse: {
            client_metadata: {
              logo_uri: 'https://example.com/logo.png',
            },
          },
        },
      } as any;

      expect(selectVerifierLogoInTrustModal(state)).toBe(
        'https://example.com/logo.png',
      );
    });
  });

  describe('selectCredentials', () => {
    it('should return array of credentials from selectedVCs', () => {
      const mockState: any = {
        context: {
          selectedVCs: {
            type1: {
              vc1: {
                verifiableCredential: {
                  credential: {id: 'cred-1', name: 'John'},
                },
              },
            },
            type2: {
              vc2: {
                verifiableCredential: {id: 'cred-2', name: 'Jane'},
              },
            },
          },
        },
      };

      const result: any = selectCredentials(mockState);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });

    it('should handle verifiableCredential without credential property', () => {
      const mockState: any = {
        context: {
          selectedVCs: {
            type1: {
              vc1: {
                verifiableCredential: {id: 'direct-vc', name: 'Direct'},
              },
            },
          },
        },
      };

      const result: any = selectCredentials(mockState);
      expect(result.length).toBe(1);
    });

    it('should return undefined when no credentials selected', () => {
      const mockState: any = {
        context: {
          selectedVCs: {},
        },
      };

      const result: any = selectCredentials(mockState);
      expect(Array.isArray(result) ? result.length : result).toBe(0);
    });

    it('should flatten nested credential structures', () => {
      const mockState: any = {
        context: {
          selectedVCs: {
            type1: {
              vc1: {verifiableCredential: {credential: {id: '1'}}},
              vc2: {verifiableCredential: {credential: {id: '2'}}},
            },
            type2: {
              vc3: {verifiableCredential: {credential: {id: '3'}}},
            },
          },
        },
      };

      const result: any = selectCredentials(mockState);
      expect(result.length).toBe(3);
    });
  });

  describe('selectVerifiableCredentialsData', () => {
    it('should return array of formatted verifiable credential data', () => {
      const mockState: any = {
        context: {
          selectedVCs: {
            type1: {
              vc1: {
                vcMetadata: {
                  id: 'vc-001',
                  issuer: 'Test Issuer',
                },
                verifiableCredential: {
                  issuerLogo: 'https://example.com/logo.png',
                  wellKnown: 'https://example.com/.well-known',
                  credentialTypes: ['VerifiableCredential', 'NationalID'],
                  credential: {
                    credentialSubject: {
                      face: 'base64-image-data',
                    },
                  },
                },
              },
            },
          },
        },
      };

      const result = selectVerifiableCredentialsData(mockState);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0].issuer).toBe('Test Issuer');
      expect(result[0].issuerLogo).toBe('https://example.com/logo.png');
      expect(result[0].wellKnown).toBe('https://example.com/.well-known');
    });

    it('should use getMosipLogo when issuerLogo is not available', () => {
      const mockState: any = {
        context: {
          selectedVCs: {
            type1: {
              vc1: {
                vcMetadata: {
                  id: 'vc-002',
                  issuer: 'Mosip',
                },
                verifiableCredential: {
                  credential: {
                    credentialSubject: {},
                  },
                },
              },
            },
          },
        },
      };

      const result = selectVerifiableCredentialsData(mockState);
      expect(result[0].issuerLogo).toBeDefined();
    });

    it('should handle face from credential.biometrics.face', () => {
      const mockState: any = {
        context: {
          selectedVCs: {
            type1: {
              vc1: {
                vcMetadata: {
                  id: 'vc-003',
                  issuer: 'Issuer',
                },
                credential: {
                  biometrics: {
                    face: 'biometric-face-data',
                  },
                },
                verifiableCredential: {},
              },
            },
          },
        },
      };

      const result = selectVerifiableCredentialsData(mockState);
      expect(result[0].face).toBe('biometric-face-data');
    });

    it('should handle empty selectedVCs', () => {
      const mockState: any = {
        context: {
          selectedVCs: {},
        },
      };

      const result = selectVerifiableCredentialsData(mockState);
      expect(result).toEqual([]);
    });

    it('should handle multiple VCs from different types', () => {
      const mockState: any = {
        context: {
          selectedVCs: {
            type1: {
              vc1: {
                vcMetadata: {id: '1', issuer: 'Issuer1'},
                verifiableCredential: {},
              },
            },
            type2: {
              vc2: {
                vcMetadata: {id: '2', issuer: 'Issuer2'},
                verifiableCredential: {},
              },
              vc3: {
                vcMetadata: {id: '3', issuer: 'Issuer3'},
                verifiableCredential: {},
              },
            },
          },
        },
      };

      const result = selectVerifiableCredentialsData(mockState);
      expect(result.length).toBe(3);
      expect(result[0].issuer).toBe('Issuer1');
      expect(result[1].issuer).toBe('Issuer2');
      expect(result[2].issuer).toBe('Issuer3');
    });
  });

  describe('selectIsAuthorization', () => {
    it('should return true when flowType is OPENID4VP_AUTHORIZATION', () => {
      const mockState = {
        context: {
          flowType: VCShareFlowType.OPENID4VP_AUTHORIZATION,
        },
      };

      const result = selectIsAuthorization(mockState as any);
      expect(result).toBe(true);
    });

    it('should return false when flowType is SIMPLE_SHARE', () => {
      const mockState = {
        context: {
          flowType: VCShareFlowType.SIMPLE_SHARE,
        },
      };

      const result = selectIsAuthorization(mockState as any);
      expect(result).toBe(false);
    });

    it('should return false when flowType is OPENID4VP', () => {
      const mockState = {
        context: {
          flowType: 'OpenID4VP',
        },
      };

      const result = selectIsAuthorization(mockState as any);
      expect(result).toBe(false);
    });

    it('should return false when flowType is empty', () => {
      const mockState = {
        context: {
          flowType: '',
        },
      };

      const result = selectIsAuthorization(mockState as any);
      expect(result).toBe(false);
    });

    it('should return false when flowType is undefined', () => {
      const mockState = {
        context: {},
      };

      const result = selectIsAuthorization(mockState as any);
      expect(result).toBe(false);
    });
  });

  describe('selectIsGetVPSharingConsent', () => {
    it('should return true when state matches getConsentForVPSharing and flowType is not OPENID4VP_AUTHORIZATION', () => {
      const mockState = {
        matches: jest.fn(
          (statePath: string) => statePath === 'getConsentForVPSharing',
        ),
        context: {
          flowType: VCShareFlowType.SIMPLE_SHARE,
        },
      };

      const result = selectIsGetVPSharingConsent(mockState as any);
      expect(result).toBe(true);
    });

    it('should return true when state matches getConsentForVPSharing and flowType is OpenID4VP', () => {
      const mockState = {
        matches: jest.fn(
          (statePath: string) => statePath === 'getConsentForVPSharing',
        ),
        context: {
          flowType: 'OpenID4VP',
        },
      };

      const result = selectIsGetVPSharingConsent(mockState as any);
      expect(result).toBe(true);
    });

    it('should return false when state matches getConsentForVPSharing but flowType is OPENID4VP_AUTHORIZATION', () => {
      const mockState = {
        matches: jest.fn(
          (statePath: string) => statePath === 'getConsentForVPSharing',
        ),
        context: {
          flowType: VCShareFlowType.OPENID4VP_AUTHORIZATION,
        },
      };

      const result = selectIsGetVPSharingConsent(mockState as any);
      expect(result).toBe(false);
    });

    it('should return false when state does not match getConsentForVPSharing', () => {
      const mockState = {
        matches: jest.fn(() => false),
        context: {
          flowType: VCShareFlowType.SIMPLE_SHARE,
        },
      };

      const result = selectIsGetVPSharingConsent(mockState as any);
      expect(result).toBe(false);
    });

    it('should return false when state matches different state', () => {
      const mockState = {
        matches: jest.fn((statePath: string) => statePath === 'sendingVP'),
        context: {
          flowType: VCShareFlowType.SIMPLE_SHARE,
        },
      };

      const result = selectIsGetVPSharingConsent(mockState as any);
      expect(result).toBe(false);
    });
  });

  describe('selectVerifierNameInTrustModal', () => {
    it('should return client_name when flowType is not OPENID4VP_AUTHORIZATION', () => {
      const mockState = {
        context: {
          flowType: VCShareFlowType.SIMPLE_SHARE,
          authenticationResponse: {
            client_metadata: {
              client_name: 'Verifier Company',
            },
            client_id: 'client123',
          },
        },
      };

      const result = selectVerifierNameInTrustModal(mockState as any);
      expect(result).toBe('Verifier Company');
    });

    it('should return undefined when flowType is not OPENID4VP_AUTHORIZATION and client_name is missing', () => {
      const mockState = {
        context: {
          flowType: 'OpenID4VP',
          authenticationResponse: {
            client_metadata: {},
            client_id: 'client123',
          },
        },
      };

      const result = selectVerifierNameInTrustModal(mockState as any);
      expect(result).toBeUndefined();
    });

    it('should return undefined when flowType is not OPENID4VP_AUTHORIZATION and client_metadata is missing', () => {
      const mockState = {
        context: {
          flowType: VCShareFlowType.SIMPLE_SHARE,
          authenticationResponse: {
            client_id: 'client123',
          },
        },
      };

      const result = selectVerifierNameInTrustModal(mockState as any);
      expect(result).toBeUndefined();
    });

    it('should handle empty authenticationResponse', () => {
      const mockState = {
        context: {
          flowType: VCShareFlowType.SIMPLE_SHARE,
          authenticationResponse: {},
        },
      };

      const result = selectVerifierNameInTrustModal(mockState as any);
      expect(result).toBeUndefined();
    });
  });
});
