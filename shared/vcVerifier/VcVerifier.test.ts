import {
  RevocationStatus,
  RevocationStatusType,
  CredentialStatusResult,
  ErrorResult,
  VerificationSummaryResult,
} from './VcVerifier';

const mockGetCredentialStatus = jest.fn();
const mockGetVerificationSummary = jest.fn();

jest.mock('react-native', () => ({
  NativeModules: {
    VCVerifierModule: {
      getCredentialStatus: mockGetCredentialStatus,
      getVerificationSummary: mockGetVerificationSummary,
    },
  },
}));

describe('shared/vcVerifier/VcVerifier', () => {
  beforeEach(() => {
    jest.resetModules();
    mockGetCredentialStatus.mockReset();
    mockGetVerificationSummary.mockReset();
  });

  describe('RevocationStatus', () => {
    it('should have TRUE value', () => {
      expect(RevocationStatus.TRUE).toBe('TRUE');
    });

    it('should have FALSE value', () => {
      expect(RevocationStatus.FALSE).toBe('FALSE');
    });

    it('should have UNDETERMINED value', () => {
      expect(RevocationStatus.UNDETERMINED).toBe('UNDETERMINED');
    });

    it('should be frozen', () => {
      expect(Object.isFrozen(RevocationStatus)).toBe(true);
    });

    it('should not allow modification', () => {
      expect(() => {
        (RevocationStatus as any).NEW = 'NEW';
      }).toThrow();
    });
  });

  describe('VCVerifier singleton', () => {
    it('should create instance via getInstance', () => {
      const VCVerifier = require('./VcVerifier').default;
      const instance = VCVerifier.getInstance();
      expect(instance).toBeDefined();
    });

    it('should return same instance on multiple calls', () => {
      const VCVerifier = require('./VcVerifier').default;
      const instance1 = VCVerifier.getInstance();
      const instance2 = VCVerifier.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('getCredentialStatus', () => {
    it('should call native module getCredentialStatus', async () => {
      mockGetCredentialStatus.mockResolvedValue({'status-1': {isValid: true}});
      const VCVerifier = require('./VcVerifier').default;
      const instance = VCVerifier.getInstance();
      const result = await instance.getCredentialStatus({id: 'vc-1'}, 'ldp_vc');
      expect(result).toEqual({'status-1': {isValid: true}});
      expect(mockGetCredentialStatus).toHaveBeenCalledWith(
        '{"id":"vc-1"}',
        'ldp_vc',
      );
    });

    it('should throw on native error', async () => {
      mockGetCredentialStatus.mockRejectedValue(new Error('native fail'));
      const VCVerifier = require('./VcVerifier').default;
      const instance = VCVerifier.getInstance();
      await expect(instance.getCredentialStatus({}, 'ldp_vc')).rejects.toThrow(
        'Failed to get credential status',
      );
    });
  });

  describe('getVerificationSummary', () => {
    it('should call native module getVerificationSummary', async () => {
      mockGetVerificationSummary.mockResolvedValue({
        verificationStatus: true,
        verificationMessage: 'OK',
        verificationErrorCode: '',
        credentialStatus: {},
      });
      const VCVerifier = require('./VcVerifier').default;
      const instance = VCVerifier.getInstance();
      const result = await instance.getVerificationSummary(
        '{"id":"vc"}',
        'ldp_vc',
      );
      expect(result.verificationStatus).toBe(true);
      expect(mockGetVerificationSummary).toHaveBeenCalledWith(
        '{"id":"vc"}',
        'ldp_vc',
        [],
      );
    });

    it('should throw on native error', async () => {
      mockGetVerificationSummary.mockRejectedValue(new Error('summary fail'));
      const VCVerifier = require('./VcVerifier').default;
      const instance = VCVerifier.getInstance();
      await expect(
        instance.getVerificationSummary('{}', 'ldp_vc'),
      ).rejects.toThrow('Failed to get verification summary');
    });
  });

  describe('Type validations', () => {
    it('CredentialStatusResult shape', () => {
      const result: CredentialStatusResult = {
        isValid: true,
        error: undefined,
      };
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('CredentialStatusResult with error', () => {
      const error: ErrorResult = {code: 'ERR_01', message: 'Test error'};
      const result: CredentialStatusResult = {isValid: false, error};
      expect(result.isValid).toBe(false);
      expect(result.error?.code).toBe('ERR_01');
    });

    it('CredentialStatusResult with statusListVC', () => {
      const result: CredentialStatusResult = {
        isValid: true,
        statusListVC: {type: 'StatusList2021'},
      };
      expect(result.statusListVC).toHaveProperty('type');
    });

    it('VerificationSummaryResult shape', () => {
      const summary: VerificationSummaryResult = {
        verificationStatus: true,
        verificationMessage: '',
        verificationErrorCode: '',
        credentialStatus: {},
      };
      expect(summary.verificationStatus).toBe(true);
    });

    it('RevocationStatusType can be any RevocationStatus value', () => {
      const values: RevocationStatusType[] = ['TRUE', 'FALSE', 'UNDETERMINED'];
      expect(values).toHaveLength(3);
    });
  });
});
