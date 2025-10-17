/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  selectFlowType,
  selectOpenID4VPFlowType,
  selectReceiverInfo,
  selectVcName,
  selectCredential,
  selectVerifiableCredentialData,
  selectQrLoginRef,
  selectIsScanning,
  selectIsQuickShareDone,
  selectShowQuickShareSuccessBanner,
  selectIsConnecting,
  selectIsConnectingTimeout,
  selectIsSelectingVc,
  selectIsSendingVc,
  selectIsSendingVP,
  selectIsSendingVPError,
  selectIsSendingVPSuccess,
  selectIsFaceIdentityVerified,
  selectIsSendingVcTimeout,
  selectIsSendingVPTimeout,
  selectIsSent,
  selectIsInvalid,
  selectIsLocationDenied,
  selectIsLocationDisabled,
  selectIsShowQrLogin,
  selectIsQrLoginDone,
  selectIsQrLoginDoneViaDeeplink,
  selectIsQrLoginStoring,
  selectIsDone,
  selectIsMinimumStorageRequiredForAuditEntryLimitReached,
  selectIsFaceVerificationConsent,
  selectIsOVPViaDeepLink,
} from './scanSelectors';

describe('scanSelectors', () => {
  const mockState: any = {
    context: {
      flowType: '',
      openID4VPFlowType: '',
      receiverInfo: null,
      vcName: '',
      selectedVc: null,
      QrLoginRef: null,
      showQuickShareSuccessBanner: false,
      isOVPViaDeepLink: false,
      showFaceCaptureSuccessBanner: false,
    },
    matches: jest.fn(() => false),
  };

  describe('selectFlowType', () => {
    it('should return flowType from context', () => {
      const state = {
        ...mockState,
        context: {...mockState.context, flowType: 'simple_share'},
      };
      expect(selectFlowType(state)).toBe('simple_share');
    });
  });

  describe('selectOpenID4VPFlowType', () => {
    it('should return openID4VPFlowType from context', () => {
      const state = {
        ...mockState,
        context: {...mockState.context, openID4VPFlowType: 'ovp_flow'},
      };
      expect(selectOpenID4VPFlowType(state)).toBe('ovp_flow');
    });
  });

  describe('selectReceiverInfo', () => {
    it('should return receiverInfo from context', () => {
      const receiverInfo = {name: 'Test', id: '123'};
      const state = {
        ...mockState,
        context: {...mockState.context, receiverInfo},
      };
      expect(selectReceiverInfo(state)).toBe(receiverInfo);
    });
  });

  describe('selectVcName', () => {
    it('should return vcName from context', () => {
      const state = {
        ...mockState,
        context: {...mockState.context, vcName: 'National ID'},
      };
      expect(selectVcName(state)).toBe('National ID');
    });
  });

  describe('selectCredential', () => {
    it('should return credential when verifiableCredential has credential property', () => {
      const mockCredential = {id: 'cred123'};
      const state = {
        ...mockState,
        context: {
          ...mockState.context,
          selectedVc: {
            verifiableCredential: {credential: mockCredential},
          },
        },
      };
      const result = selectCredential(state);
      expect(result).toEqual([mockCredential]);
    });

    it('should return verifiableCredential when no credential property', () => {
      const mockVC = {id: 'vc456'};
      const state = {
        ...mockState,
        context: {
          ...mockState.context,
          selectedVc: {
            verifiableCredential: mockVC,
          },
        },
      };
      const result = selectCredential(state);
      expect(result).toEqual([mockVC]);
    });
  });

  describe('selectVerifiableCredentialData', () => {
    it('should return formatted credential data with face from credentialSubject', () => {
      const mockCredential = {
        credentialSubject: {
          face: '/9j/4AAQSkZJRgABAQAAAQ...',
          gender: 'Male',
          UIN: '123456789',
        },
        issuer: 'did:web:example.com',
        issuanceDate: '2023-01-01T00:00:00Z',
      };
      const state = {
        ...mockState,
        context: {
          ...mockState.context,
          selectedVc: {
            verifiableCredential: {credential: mockCredential},
            vcMetadata: {},
            credential: mockCredential,
            format: 'ldp_vc',
          },
        },
      };
      const result = selectVerifiableCredentialData(state);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toBeDefined();
      expect(result[0].face).toBeDefined();
    });

    it('should use biometrics face when credentialSubject face is not available', () => {
      const mockCredential = {
        credentialSubject: {
          gender: 'Male',
          UIN: '123456789',
        },
        biometrics: {
          face: '/9j/4AAQSkZJRgABAQBBBB...',
        },
        issuer: 'did:web:example.com',
        issuanceDate: '2023-01-01T00:00:00Z',
      };
      const state = {
        ...mockState,
        context: {
          ...mockState.context,
          selectedVc: {
            verifiableCredential: {credential: mockCredential},
            vcMetadata: {},
            credential: mockCredential,
            format: 'ldp_vc',
          },
        },
      };
      const result = selectVerifiableCredentialData(state);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].face).toBe('/9j/4AAQSkZJRgABAQBBBB...');
    });

    it('should handle credential without face data', () => {
      const mockCredential = {
        credentialSubject: {
          gender: 'Male',
          UIN: '123456789',
        },
        issuer: 'did:web:example.com',
        issuanceDate: '2023-01-01T00:00:00Z',
      };
      const state = {
        ...mockState,
        context: {
          ...mockState.context,
          selectedVc: {
            verifiableCredential: {credential: mockCredential},
            vcMetadata: {},
            credential: mockCredential,
            format: 'ldp_vc',
          },
        },
      };
      const result = selectVerifiableCredentialData(state);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].face).toBeUndefined();
    });
  });

  describe('selectQrLoginRef', () => {
    it('should return QrLoginRef from context', () => {
      const ref = {current: 'test'};
      const state = {
        ...mockState,
        context: {...mockState.context, QrLoginRef: ref},
      };
      expect(selectQrLoginRef(state)).toBe(ref);
    });
  });

  describe('selectIsScanning', () => {
    it('should return true when in findingConnection state', () => {
      const state = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'findingConnection'),
      };
      expect(selectIsScanning(state)).toBe(true);
    });

    it('should return false when not in findingConnection state', () => {
      expect(selectIsScanning(mockState)).toBe(false);
    });
  });

  describe('selectIsQuickShareDone', () => {
    it('should return true when in loadVCS.navigatingToHome state', () => {
      const state = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'loadVCS.navigatingToHome'),
      };
      expect(selectIsQuickShareDone(state)).toBe(true);
    });

    it('should return false when not in state', () => {
      expect(selectIsQuickShareDone(mockState)).toBe(false);
    });
  });

  describe('selectShowQuickShareSuccessBanner', () => {
    it('should return showQuickShareSuccessBanner from context', () => {
      const state = {
        ...mockState,
        context: {...mockState.context, showQuickShareSuccessBanner: true},
      };
      expect(selectShowQuickShareSuccessBanner(state)).toBe(true);
    });
  });

  describe('selectIsConnecting', () => {
    it('should return true when in connecting.inProgress state', () => {
      const state = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'connecting.inProgress'),
      };
      expect(selectIsConnecting(state)).toBe(true);
    });
  });

  describe('selectIsConnectingTimeout', () => {
    it('should return true when in connecting.timeout state', () => {
      const state = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'connecting.timeout'),
      };
      expect(selectIsConnectingTimeout(state)).toBe(true);
    });
  });

  describe('selectIsSelectingVc', () => {
    it('should return true when in reviewing.selectingVc state', () => {
      const state = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'reviewing.selectingVc'),
      };
      expect(selectIsSelectingVc(state)).toBe(true);
    });
  });

  describe('selectIsSendingVc', () => {
    it('should return true when in reviewing.sendingVc.inProgress state', () => {
      const state = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'reviewing.sendingVc.inProgress'),
      };
      expect(selectIsSendingVc(state)).toBe(true);
    });
  });

  describe('selectIsSendingVP', () => {
    it('should return true when in startVPSharing.inProgress state', () => {
      const state = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'startVPSharing.inProgress'),
      };
      expect(selectIsSendingVP(state)).toBe(true);
    });
  });

  describe('selectIsSendingVPError', () => {
    it('should return true when in startVPSharing.showError state', () => {
      const state = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'startVPSharing.showError'),
      };
      expect(selectIsSendingVPError(state)).toBe(true);
    });
  });

  describe('selectIsSendingVPSuccess', () => {
    it('should return true when in startVPSharing.success state', () => {
      const state = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'startVPSharing.success'),
      };
      expect(selectIsSendingVPSuccess(state)).toBe(true);
    });
  });

  describe('selectIsFaceIdentityVerified', () => {
    it('should return true when sendingVc and banner is true', () => {
      const state = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'reviewing.sendingVc.inProgress'),
        context: {...mockState.context, showFaceCaptureSuccessBanner: true},
      };
      expect(selectIsFaceIdentityVerified(state)).toBe(true);
    });

    it('should return false when not in sendingVc state', () => {
      const state = {
        ...mockState,
        context: {...mockState.context, showFaceCaptureSuccessBanner: true},
      };
      expect(selectIsFaceIdentityVerified(state)).toBe(false);
    });
  });

  describe('selectIsSendingVcTimeout', () => {
    it('should return true when in reviewing.sendingVc.timeout state', () => {
      const state = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'reviewing.sendingVc.timeout'),
      };
      expect(selectIsSendingVcTimeout(state)).toBe(true);
    });
  });

  describe('selectIsSendingVPTimeout', () => {
    it('should return true when in startVPSharing.timeout state', () => {
      const state = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'startVPSharing.timeout'),
      };
      expect(selectIsSendingVPTimeout(state)).toBe(true);
    });
  });

  describe('selectIsSent', () => {
    it('should return true when in reviewing.sendingVc.sent state', () => {
      const state = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'reviewing.sendingVc.sent'),
      };
      expect(selectIsSent(state)).toBe(true);
    });
  });

  describe('selectIsInvalid', () => {
    it('should return true when in invalid state', () => {
      const state = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'invalid'),
      };
      expect(selectIsInvalid(state)).toBe(true);
    });
  });

  describe('selectIsLocationDenied', () => {
    it('should return true when in checkingLocationState.denied state', () => {
      const state = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'checkingLocationState.denied'),
      };
      expect(selectIsLocationDenied(state)).toBe(true);
    });
  });

  describe('selectIsLocationDisabled', () => {
    it('should return true when in checkingLocationState.disabled state', () => {
      const state = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'checkingLocationState.disabled'),
      };
      expect(selectIsLocationDisabled(state)).toBe(true);
    });
  });

  describe('selectIsShowQrLogin', () => {
    it('should return true when in showQrLogin state', () => {
      const state = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'showQrLogin'),
      };
      expect(selectIsShowQrLogin(state)).toBe(true);
    });
  });

  describe('selectIsQrLoginDone', () => {
    it('should return true when in showQrLogin.navigatingToHistory state', () => {
      const state = {
        ...mockState,
        matches: jest.fn(
          (s: string) => s === 'showQrLogin.navigatingToHistory',
        ),
      };
      expect(selectIsQrLoginDone(state)).toBe(true);
    });
  });

  describe('selectIsQrLoginDoneViaDeeplink', () => {
    it('should return true when in showQrLogin.navigatingToHome state', () => {
      const state = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'showQrLogin.navigatingToHome'),
      };
      expect(selectIsQrLoginDoneViaDeeplink(state)).toBe(true);
    });
  });

  describe('selectIsQrLoginStoring', () => {
    it('should return true when in showQrLogin.storing state', () => {
      const state = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'showQrLogin.storing'),
      };
      expect(selectIsQrLoginStoring(state)).toBe(true);
    });
  });

  describe('selectIsDone', () => {
    it('should return true when in reviewing.disconnect state', () => {
      const state = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'reviewing.disconnect'),
      };
      expect(selectIsDone(state)).toBe(true);
    });
  });

  describe('selectIsMinimumStorageRequiredForAuditEntryLimitReached', () => {
    it('should return true when in restrictSharingVc state', () => {
      const state = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'restrictSharingVc'),
      };
      expect(
        selectIsMinimumStorageRequiredForAuditEntryLimitReached(state),
      ).toBe(true);
    });
  });

  describe('selectIsFaceVerificationConsent', () => {
    it('should return true when in reviewing.faceVerificationConsent state', () => {
      const state = {
        ...mockState,
        matches: jest.fn(
          (s: string) => s === 'reviewing.faceVerificationConsent',
        ),
      };
      expect(selectIsFaceVerificationConsent(state)).toBe(true);
    });
  });

  describe('selectIsOVPViaDeepLink', () => {
    it('should return isOVPViaDeepLink from context', () => {
      const state = {
        ...mockState,
        context: {...mockState.context, isOVPViaDeepLink: true},
      };
      expect(selectIsOVPViaDeepLink(state)).toBe(true);
    });
  });
});
