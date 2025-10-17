/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  selectVerificationStatus,
  selectMyVcsMetadata,
  selectShareableVcsMetadata,
  selectShareableVcs,
  selectReceivedVcsMetadata,
  selectIsRefreshingMyVcs,
  selectIsRefreshingReceivedVcs,
  selectAreAllVcsDownloaded,
  selectBindedVcsMetadata,
  selectInProgressVcDownloads,
  selectWalletBindingSuccess,
  selectIsTampered,
  selectDownloadingFailedVcs,
  selectMyVcs,
  selectVerificationErrorMessage,
  selectIsDownloadingFailed,
  selectIsDownloadingSuccess,
} from './VCMetaSelectors';
import {VCMetadata} from '../../../shared/VCMetadata';

describe('VCMetaSelectors', () => {
  const mockVcMetadata1 = new VCMetadata({
    id: 'vc1',
    idType: 'NationalID',
    issuer: 'Test Issuer 1',
  });

  const mockVcMetadata2 = new VCMetadata({
    id: 'vc2',
    idType: 'Passport',
    issuer: 'Test Issuer 2',
  });

  const mockVcMetadata3 = new VCMetadata({
    id: 'vc3',
    idType: 'DriversLicense',
    issuer: 'Test Issuer 3',
  });

  const mockVc1 = {
    verifiableCredential: {credential: {id: 'cred1'}},
    walletBindingResponse: null,
  };

  const mockVc2 = {
    verifiableCredential: {credential: {id: 'cred2'}},
    walletBindingResponse: {walletBindingId: 'binding123'},
  };

  const mockVc3 = {
    verifiableCredential: null,
    walletBindingResponse: null,
  };

  const mockState: any = {
    context: {
      verificationStatus: 'verified',
      myVcsMetadata: [mockVcMetadata1, mockVcMetadata2, mockVcMetadata3],
      receivedVcsMetadata: [mockVcMetadata1],
      myVcs: {
        [mockVcMetadata1.getVcKey()]: mockVc1,
        [mockVcMetadata2.getVcKey()]: mockVc2,
        [mockVcMetadata3.getVcKey()]: mockVc3,
      },
      areAllVcsDownloaded: true,
      inProgressVcDownloads: [],
      walletBindingSuccess: false,
      downloadingFailedVcs: [],
    },
    matches: jest.fn((stateName: string) => stateName === 'ready.myVcs'),
  };

  describe('selectVerificationStatus', () => {
    it('should return verification status from context', () => {
      const result = selectVerificationStatus(mockState);
      expect(result).toBe('verified');
    });

    it('should handle different status values', () => {
      const statuses = ['verified', 'pending', 'failed', 'invalid'];
      statuses.forEach(status => {
        const state: any = {
          ...mockState,
          context: {...mockState.context, verificationStatus: status},
        };
        expect(selectVerificationStatus(state)).toBe(status);
      });
    });
  });

  describe('selectMyVcsMetadata', () => {
    it('should return all VCs metadata from context', () => {
      const result = selectMyVcsMetadata(mockState);
      expect(result).toHaveLength(3);
      expect(result).toEqual([
        mockVcMetadata1,
        mockVcMetadata2,
        mockVcMetadata3,
      ]);
    });

    it('should return empty array when no VCs', () => {
      const state: any = {
        ...mockState,
        context: {...mockState.context, myVcsMetadata: []},
      };
      const result = selectMyVcsMetadata(state);
      expect(result).toEqual([]);
    });
  });

  describe('selectShareableVcsMetadata', () => {
    it('should filter VCs that have verifiableCredential', () => {
      const result = selectShareableVcsMetadata(mockState);
      expect(result).toHaveLength(2);
      expect(result).toContain(mockVcMetadata1);
      expect(result).toContain(mockVcMetadata2);
      expect(result).not.toContain(mockVcMetadata3);
    });

    it('should return empty array when no shareable VCs', () => {
      const state: any = {
        ...mockState,
        context: {
          ...mockState.context,
          myVcs: {
            [mockVcMetadata1.getVcKey()]: {verifiableCredential: null},
            [mockVcMetadata2.getVcKey()]: {verifiableCredential: null},
          },
        },
      };
      const result = selectShareableVcsMetadata(state);
      expect(result).toEqual([]);
    });
  });

  describe('selectShareableVcs', () => {
    it('should filter VCs that have verifiableCredential', () => {
      const result = selectShareableVcs(mockState);
      expect(result).toHaveLength(2);
      expect(result).toContainEqual(mockVc1);
      expect(result).toContainEqual(mockVc2);
      expect(result).not.toContainEqual(mockVc3);
    });

    it('should return empty array when no VCs have verifiableCredential', () => {
      const state: any = {
        ...mockState,
        context: {
          ...mockState.context,
          myVcs: {
            vc1: {verifiableCredential: null},
            vc2: {verifiableCredential: null},
          },
        },
      };
      const result = selectShareableVcs(state);
      expect(result).toEqual([]);
    });
  });

  describe('selectReceivedVcsMetadata', () => {
    it('should return received VCs metadata', () => {
      const result = selectReceivedVcsMetadata(mockState);
      expect(result).toHaveLength(1);
      expect(result).toContain(mockVcMetadata1);
    });

    it('should return empty array when no received VCs', () => {
      const state: any = {
        ...mockState,
        context: {...mockState.context, receivedVcsMetadata: []},
      };
      const result = selectReceivedVcsMetadata(state);
      expect(result).toEqual([]);
    });
  });

  describe('selectIsRefreshingMyVcs', () => {
    it('should return true when in ready.myVcs state', () => {
      const result = selectIsRefreshingMyVcs(mockState);
      expect(result).toBe(true);
    });

    it('should call matches with ready.myVcs', () => {
      selectIsRefreshingMyVcs(mockState);
      expect(mockState.matches).toHaveBeenCalledWith('ready.myVcs');
    });

    it('should return false when not in ready.myVcs state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn(() => false),
      };
      const result = selectIsRefreshingMyVcs(state);
      expect(result).toBe(false);
    });
  });

  describe('selectIsRefreshingReceivedVcs', () => {
    it('should return true when in ready.receivedVcs state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'ready.receivedVcs'),
      };
      const result = selectIsRefreshingReceivedVcs(state);
      expect(result).toBe(true);
    });

    it('should call matches with ready.receivedVcs', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn(() => false),
      };
      selectIsRefreshingReceivedVcs(state);
      expect(state.matches).toHaveBeenCalledWith('ready.receivedVcs');
    });
  });

  describe('selectAreAllVcsDownloaded', () => {
    it('should return true when all VCs are downloaded', () => {
      const result = selectAreAllVcsDownloaded(mockState);
      expect(result).toBe(true);
    });

    it('should return false when not all VCs are downloaded', () => {
      const state: any = {
        ...mockState,
        context: {...mockState.context, areAllVcsDownloaded: false},
      };
      const result = selectAreAllVcsDownloaded(state);
      expect(result).toBe(false);
    });
  });

  describe('selectBindedVcsMetadata', () => {
    it('should return VCs with wallet binding', () => {
      const result = selectBindedVcsMetadata(mockState);
      expect(result).toHaveLength(1);
      expect(result).toContain(mockVcMetadata2);
      expect(result).not.toContain(mockVcMetadata1);
      expect(result).not.toContain(mockVcMetadata3);
    });

    it('should filter out VCs with null walletBindingResponse', () => {
      const state: any = {
        ...mockState,
        context: {
          ...mockState.context,
          myVcs: {
            [mockVcMetadata1.getVcKey()]: {walletBindingResponse: null},
            [mockVcMetadata2.getVcKey()]: {walletBindingResponse: {}},
          },
        },
      };
      const result = selectBindedVcsMetadata(state);
      expect(result).toEqual([]);
    });

    it('should filter out VCs with empty walletBindingId', () => {
      const state: any = {
        ...mockState,
        context: {
          ...mockState.context,
          myVcs: {
            [mockVcMetadata1.getVcKey()]: {
              walletBindingResponse: {walletBindingId: ''},
            },
            [mockVcMetadata2.getVcKey()]: {
              walletBindingResponse: {walletBindingId: null},
            },
          },
        },
      };
      const result = selectBindedVcsMetadata(state);
      expect(result).toEqual([]);
    });

    it('should return empty array when no binded VCs', () => {
      const state: any = {
        ...mockState,
        context: {
          ...mockState.context,
          myVcs: {
            [mockVcMetadata1.getVcKey()]: {walletBindingResponse: null},
          },
        },
      };
      const result = selectBindedVcsMetadata(state);
      expect(result).toEqual([]);
    });
  });

  describe('selectInProgressVcDownloads', () => {
    it('should return in-progress VC downloads', () => {
      const downloads = ['vc1', 'vc2'];
      const state: any = {
        ...mockState,
        context: {...mockState.context, inProgressVcDownloads: downloads},
      };
      const result = selectInProgressVcDownloads(state);
      expect(result).toEqual(downloads);
    });

    it('should return empty array when no downloads in progress', () => {
      const result = selectInProgressVcDownloads(mockState);
      expect(result).toEqual([]);
    });
  });

  describe('selectWalletBindingSuccess', () => {
    it('should return wallet binding success status', () => {
      const result = selectWalletBindingSuccess(mockState);
      expect(result).toBe(false);
    });

    it('should return true when wallet binding is successful', () => {
      const state: any = {
        ...mockState,
        context: {...mockState.context, walletBindingSuccess: true},
      };
      const result = selectWalletBindingSuccess(state);
      expect(result).toBe(true);
    });
  });

  describe('selectIsTampered', () => {
    it('should return true when in ready.tamperedVCs state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn((s: string) => s === 'ready.tamperedVCs'),
      };
      const result = selectIsTampered(state);
      expect(result).toBe(true);
    });

    it('should call matches with ready.tamperedVCs', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn(() => false),
      };
      selectIsTampered(state);
      expect(state.matches).toHaveBeenCalledWith('ready.tamperedVCs');
    });

    it('should return false when not in tampered state', () => {
      const state: any = {
        ...mockState,
        matches: jest.fn(() => false),
      };
      const result = selectIsTampered(state);
      expect(result).toBe(false);
    });
  });

  describe('selectDownloadingFailedVcs', () => {
    it('should return downloading failed VCs', () => {
      const failedVcs = ['vc1', 'vc2'];
      const state: any = {
        ...mockState,
        context: {...mockState.context, downloadingFailedVcs: failedVcs},
      };
      const result = selectDownloadingFailedVcs(state);
      expect(result).toEqual(failedVcs);
    });

    it('should return empty array when no failed VCs', () => {
      const result = selectDownloadingFailedVcs(mockState);
      expect(result).toEqual([]);
    });
  });

  describe('selectMyVcs', () => {
    it('should return all my VCs object', () => {
      const result = selectMyVcs(mockState);
      expect(result).toEqual(mockState.context.myVcs);
    });

    it('should return object with VC keys', () => {
      const result = selectMyVcs(mockState);
      expect(result).toHaveProperty(mockVcMetadata1.getVcKey());
      expect(result).toHaveProperty(mockVcMetadata2.getVcKey());
    });

    it('should return empty object when no VCs', () => {
      const state: any = {
        ...mockState,
        context: {...mockState.context, myVcs: {}},
      };
      const result = selectMyVcs(state);
      expect(result).toEqual({});
    });
  });

  describe('Edge cases and boundary conditions', () => {
    it('should handle undefined values in walletBindingResponse', () => {
      const state: any = {
        ...mockState,
        context: {
          ...mockState.context,
          myVcs: {
            [mockVcMetadata1.getVcKey()]: {
              walletBindingResponse: undefined,
            },
          },
        },
      };
      const result = selectBindedVcsMetadata(state);
      expect(result).toEqual([]);
    });

    it('should handle empty string in walletBindingId', () => {
      const state: any = {
        ...mockState,
        context: {
          ...mockState.context,
          myVcs: {
            [mockVcMetadata1.getVcKey()]: {
              walletBindingResponse: {walletBindingId: ''},
            },
          },
        },
      };
      const result = selectBindedVcsMetadata(state);
      expect(result).toEqual([]);
    });

    it('should handle null verifiableCredential in filtering', () => {
      const state: any = {
        ...mockState,
        context: {
          ...mockState.context,
          myVcs: {
            [mockVcMetadata1.getVcKey()]: {verifiableCredential: null},
          },
        },
      };
      const result = selectShareableVcsMetadata(state);
      expect(result).toEqual([]);
    });
  });

  describe('selectVerificationErrorMessage', () => {
    it('should return verification error message from context', () => {
      const state: any = {
        context: {
          verificationErrorMessage: 'Invalid signature',
        },
      };
      const result = selectVerificationErrorMessage(state);
      expect(result).toBe('Invalid signature');
    });

    it('should return empty string when no error', () => {
      const state: any = {
        context: {
          verificationErrorMessage: '',
        },
      };
      const result = selectVerificationErrorMessage(state);
      expect(result).toBe('');
    });
  });

  describe('selectIsDownloadingFailed', () => {
    it('should return DownloadingCredentialsFailed status', () => {
      const state: any = {
        context: {
          DownloadingCredentialsFailed: true,
        },
      };
      const result = selectIsDownloadingFailed(state);
      expect(result).toBe(true);
    });

    it('should return false when downloading not failed', () => {
      const state: any = {
        context: {
          DownloadingCredentialsFailed: false,
        },
      };
      const result = selectIsDownloadingFailed(state);
      expect(result).toBe(false);
    });
  });

  describe('selectIsDownloadingSuccess', () => {
    it('should return DownloadingCredentialsSuccess status', () => {
      const state: any = {
        context: {
          DownloadingCredentialsSuccess: true,
        },
      };
      const result = selectIsDownloadingSuccess(state);
      expect(result).toBe(true);
    });

    it('should return false when downloading not successful', () => {
      const state: any = {
        context: {
          DownloadingCredentialsSuccess: false,
        },
      };
      const result = selectIsDownloadingSuccess(state);
      expect(result).toBe(false);
    });
  });
});
