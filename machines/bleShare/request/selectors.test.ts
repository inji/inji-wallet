/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  selectSenderInfo,
  selectCredential,
  selectVerifiableCredentialData,
  selectIsReviewingInIdle,
  selectIsWaitingForConnection,
  selectIsCheckingBluetoothService,
  selectIsWaitingForVc,
  selectIsWaitingForVcTimeout,
  selectOpenId4VpUri,
  selectIsAccepting,
  selectIsDisplayingIncomingVC,
  selectIsSavingFailedInIdle,
  selectIsDone,
  selectIsNavigatingToReceivedCards,
  selectIsNavigatingToHome,
} from './selectors';

describe('requestMachine selectors', () => {
  describe('selectSenderInfo', () => {
    it('should return senderInfo from context', () => {
      const mockSenderInfo = {name: 'John Doe', deviceId: 'device-123'};
      const mockState: any = {
        context: {
          senderInfo: mockSenderInfo,
        },
      };
      expect(selectSenderInfo(mockState)).toBe(mockSenderInfo);
    });
  });

  describe('selectCredential', () => {
    it('should return verifiableCredential from incomingVc', () => {
      const mockVC = {credential: {id: 'cred-123'}};
      const mockState: any = {
        context: {
          incomingVc: {
            verifiableCredential: mockVC,
          },
        },
      };
      expect(selectCredential(mockState)).toBe(mockVC);
    });
  });

  describe('selectVerifiableCredentialData', () => {
    it('should return formatted verifiable credential data', () => {
      const mockState: any = {
        context: {
          incomingVc: {
            vcMetadata: {
              id: 'vc-001',
              issuer: 'Test Issuer',
            },
            verifiableCredential: {
              credential: {
                credentialSubject: {
                  face: 'base64-face-data',
                },
              },
              issuerLogo: 'https://example.com/logo.png',
              wellKnown: 'https://example.com/.well-known',
              credentialConfigurationId: 'config-123',
            },
          },
        },
      };

      const result = selectVerifiableCredentialData(mockState);
      expect(result.issuer).toBe('Test Issuer');
      expect(result.issuerLogo).toBe('https://example.com/logo.png');
      expect(result.wellKnown).toBe('https://example.com/.well-known');
      expect(result.credentialConfigurationId).toBe('config-123');
      expect(result.face).toBe('base64-face-data');
    });

    it('should use biometrics face when credentialSubject face is not available', () => {
      const mockState: any = {
        context: {
          incomingVc: {
            vcMetadata: {
              id: 'vc-002',
              issuer: 'Mosip',
            },
            credential: {
              biometrics: {
                face: 'biometric-face-data',
              },
            },
            verifiableCredential: {},
          },
        },
      };

      const result = selectVerifiableCredentialData(mockState);
      expect(result.face).toBe('biometric-face-data');
    });
  });

  describe('selectIsReviewingInIdle', () => {
    it('should return true when in reviewing.idle state', () => {
      const mockState: any = {
        matches: jest.fn((state: string) => state === 'reviewing.idle'),
      };
      expect(selectIsReviewingInIdle(mockState)).toBe(true);
    });

    it('should return false when not in reviewing.idle state', () => {
      const mockState: any = {
        matches: jest.fn(() => false),
      };
      expect(selectIsReviewingInIdle(mockState)).toBe(false);
    });
  });

  describe('selectIsWaitingForConnection', () => {
    it('should return true when in waitingForConnection state', () => {
      const mockState: any = {
        matches: jest.fn((state: string) => state === 'waitingForConnection'),
      };
      expect(selectIsWaitingForConnection(mockState)).toBe(true);
    });
  });

  describe('selectIsCheckingBluetoothService', () => {
    it('should return true when in checkingBluetoothService state', () => {
      const mockState: any = {
        matches: jest.fn(
          (state: string) => state === 'checkingBluetoothService',
        ),
      };
      expect(selectIsCheckingBluetoothService(mockState)).toBe(true);
    });
  });

  describe('selectIsWaitingForVc', () => {
    it('should return true when in waitingForVc.inProgress state', () => {
      const mockState: any = {
        matches: jest.fn(
          (state: string) => state === 'waitingForVc.inProgress',
        ),
      };
      expect(selectIsWaitingForVc(mockState)).toBe(true);
    });
  });

  describe('selectIsWaitingForVcTimeout', () => {
    it('should return true when in waitingForVc.timeout state', () => {
      const mockState: any = {
        matches: jest.fn((state: string) => state === 'waitingForVc.timeout'),
      };
      expect(selectIsWaitingForVcTimeout(mockState)).toBe(true);
    });
  });

  describe('selectOpenId4VpUri', () => {
    it('should return openId4VpUri from context', () => {
      const mockState: any = {
        context: {
          openId4VpUri: 'openid4vp://verify?request=abc123',
        },
      };
      expect(selectOpenId4VpUri(mockState)).toBe(
        'openid4vp://verify?request=abc123',
      );
    });
  });

  describe('selectIsAccepting', () => {
    it('should return true when in reviewing.accepting state', () => {
      const mockState: any = {
        matches: jest.fn((state: string) => state === 'reviewing.accepting'),
      };
      expect(selectIsAccepting(mockState)).toBe(true);
    });
  });

  describe('selectIsDisplayingIncomingVC', () => {
    it('should return true when in reviewing.displayingIncomingVC state', () => {
      const mockState: any = {
        matches: jest.fn(
          (state: string) => state === 'reviewing.displayingIncomingVC',
        ),
      };
      expect(selectIsDisplayingIncomingVC(mockState)).toBe(true);
    });
  });

  describe('selectIsSavingFailedInIdle', () => {
    it('should return true when in reviewing.savingFailed.idle state', () => {
      const mockState: any = {
        matches: jest.fn(
          (state: string) => state === 'reviewing.savingFailed.idle',
        ),
      };
      expect(selectIsSavingFailedInIdle(mockState)).toBe(true);
    });
  });

  describe('selectIsDone', () => {
    it('should return true when in reviewing.navigatingToHistory state', () => {
      const mockState: any = {
        matches: jest.fn(
          (state: string) => state === 'reviewing.navigatingToHistory',
        ),
      };
      expect(selectIsDone(mockState)).toBe(true);
    });
  });

  describe('selectIsNavigatingToReceivedCards', () => {
    it('should return true when in reviewing.navigatingToReceivedCards state', () => {
      const mockState: any = {
        matches: jest.fn(
          (state: string) => state === 'reviewing.navigatingToReceivedCards',
        ),
      };
      expect(selectIsNavigatingToReceivedCards(mockState)).toBe(true);
    });
  });

  describe('selectIsNavigatingToHome', () => {
    it('should return true when in reviewing.navigatingToHome state', () => {
      const mockState: any = {
        matches: jest.fn(
          (state: string) => state === 'reviewing.navigatingToHome',
        ),
      };
      expect(selectIsNavigatingToHome(mockState)).toBe(true);
    });
  });
});
