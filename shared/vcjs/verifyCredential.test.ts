import {
  VerificationErrorType,
  VerificationErrorMessage,
  VERIFICATION_TIMEOUT_IN_MS,
} from './verifyCredential';

jest.mock('@digitalcredentials/jsonld', () => ({
  documentLoaders: {xhr: jest.fn(() => 'mockLoader')},
}));
jest.mock('@digitalcredentials/vc', () => ({
  verifyCredential: jest.fn(() => Promise.resolve({verified: true})),
}));
jest.mock(
  '../../lib/jsonld-signatures/suites/rsa2018/RsaSignature2018',
  () => ({
    RsaSignature2018: jest
      .fn()
      .mockImplementation(() => ({type: 'RsaSignature2018'})),
  }),
);
jest.mock(
  '../../lib/jsonld-signatures/suites/ed255192018/Ed25519Signature2018',
  () => ({
    Ed25519Signature2018: jest
      .fn()
      .mockImplementation(() => ({type: 'Ed25519Signature2018'})),
  }),
);
jest.mock('../../lib/jsonld-signatures/purposes/AssertionProofPurpose', () => ({
  AssertionProofPurpose: jest
    .fn()
    .mockImplementation(() => ({purpose: 'assertion'})),
}));
jest.mock('../../lib/jsonld-signatures/purposes/PublicKeyProofPurpose', () => ({
  PublicKeyProofPurpose: jest
    .fn()
    .mockImplementation(() => ({purpose: 'publicKey'})),
}));
jest.mock('../telemetry/TelemetryUtils', () => ({
  sendErrorEvent: jest.fn(),
  getErrorEventData: jest.fn((...args) => args),
}));
jest.mock('../telemetry/TelemetryConstants', () => ({
  TelemetryConstants: {
    FlowType: {vcVerification: 'vcVerification'},
    ErrorId: {
      vcVerificationFailed: 'vc_verification_failed',
      tampered: 'tampered',
    },
    ErrorMessage: {vcVerificationFailed: 'VC verification failed'},
  },
}));
jest.mock('../commonUtil', () => ({
  getMosipIdentifier: jest.fn(() => 'UIN123'),
}));
jest.mock('../constants', () => ({
  isAndroid: jest.fn(() => false),
  isIOS: jest.fn(() => false),
}));
jest.mock('../VCFormat', () => ({
  VCFormat: {
    mso_mdoc: 'mso_mdoc',
    vc_sd_jwt: 'vc+sd-jwt',
    dc_sd_jwt: 'dc+sd-jwt',
    ldp_vc: 'ldp_vc',
  },
}));
jest.mock('../vcVerifier/VcVerifier', () => ({
  __esModule: true,
  default: {
    getInstance: jest.fn(() => ({
      getVerificationSummary: jest.fn(() =>
        Promise.resolve({
          verificationStatus: true,
          verificationMessage: '',
          verificationErrorCode: '',
          credentialStatus: {},
        }),
      ),
      getCredentialStatus: jest.fn(() => Promise.resolve({})),
    })),
  },
  RevocationStatus: {
    FALSE: 'FALSE',
    TRUE: 'TRUE',
    UNDETERMINED: 'UNDETERMINED',
  },
  RevocationStatusType: {},
  CredentialStatusResult: {},
  VerificationSummaryResult: {},
}));

describe('shared/vcjs/verifyCredential', () => {
  describe('VerificationErrorType', () => {
    it('should have NO_ERROR as empty string', () => {
      expect(VerificationErrorType.NO_ERROR).toBe('');
    });

    it('should have GENERIC_TECHNICAL_ERROR', () => {
      expect(VerificationErrorType.GENERIC_TECHNICAL_ERROR).toBe('ERR_GENERIC');
    });

    it('should have NETWORK_ERROR', () => {
      expect(VerificationErrorType.NETWORK_ERROR).toBe('ERR_NETWORK');
    });

    it('should have EXPIRATION_ERROR', () => {
      expect(VerificationErrorType.EXPIRATION_ERROR).toBe('ERR_VC_EXPIRED');
    });

    it('should have RANGE_ERROR', () => {
      expect(VerificationErrorType.RANGE_ERROR).toBe('ERR_RANGE');
    });
  });

  describe('VerificationErrorMessage', () => {
    it('should have NO_ERROR as empty string', () => {
      expect(VerificationErrorMessage.NO_ERROR).toBe('');
    });

    it('should have RANGE_ERROR', () => {
      expect(VerificationErrorMessage.RANGE_ERROR).toBe('RangeError');
    });

    it('should have NETWORK_ERROR', () => {
      expect(VerificationErrorMessage.NETWORK_ERROR).toBe('NetworkError');
    });
  });

  describe('VERIFICATION_TIMEOUT_IN_MS', () => {
    it('should be 5000ms', () => {
      expect(VERIFICATION_TIMEOUT_IN_MS).toBe(5000);
    });
  });

  describe('checkIsStatusRevoked', () => {
    it('should return FALSE for null vcStatus', async () => {
      const {checkIsStatusRevoked} = require('./verifyCredential');
      const result = await checkIsStatusRevoked(null);
      expect(result).toBe('FALSE');
    });

    it('should return FALSE for empty vcStatus', async () => {
      const {checkIsStatusRevoked} = require('./verifyCredential');
      const result = await checkIsStatusRevoked({});
      expect(result).toBe('FALSE');
    });

    it('should return FALSE when no revocation key', async () => {
      const {checkIsStatusRevoked} = require('./verifyCredential');
      const result = await checkIsStatusRevoked({suspension: {isValid: true}});
      expect(result).toBe('FALSE');
    });

    it('should return FALSE when revocation isValid is true', async () => {
      const {checkIsStatusRevoked} = require('./verifyCredential');
      const result = await checkIsStatusRevoked({
        revocation: {isValid: true},
      });
      expect(result).toBe('FALSE');
    });

    it('should return UNDETERMINED when there is an error', async () => {
      const {checkIsStatusRevoked} = require('./verifyCredential');
      const result = await checkIsStatusRevoked({
        revocation: {
          isValid: false,
          error: {code: 'ERR', message: 'Network error'},
        },
      });
      expect(result).toBe('UNDETERMINED');
    });

    it('should return TRUE when revoked (isValid false, no error)', async () => {
      const {checkIsStatusRevoked} = require('./verifyCredential');
      const result = await checkIsStatusRevoked({
        revocation: {isValid: false},
      });
      expect(result).toBe('TRUE');
    });
  });

  describe('verifyCredential', () => {
    it('returns success for iOS with mso_mdoc format', async () => {
      const {isIOS, isAndroid} = require('../constants');
      isAndroid.mockReturnValue(false);
      isIOS.mockReturnValue(true);
      const {verifyCredential} = require('./verifyCredential');
      const result = await verifyCredential(
        {proof: {type: 'Ed25519Signature2020'}},
        'mso_mdoc',
      );
      expect(result.isVerified).toBe(true);
      expect(result.verificationErrorCode).toBe('');
    });

    it('returns success for iOS with vc+sd-jwt format', async () => {
      const {isIOS, isAndroid} = require('../constants');
      isAndroid.mockReturnValue(false);
      isIOS.mockReturnValue(true);
      const {verifyCredential} = require('./verifyCredential');
      const result = await verifyCredential({proof: {}}, 'vc+sd-jwt');
      expect(result.isVerified).toBe(true);
    });

    it('returns success for iOS with dc+sd-jwt format', async () => {
      const {isIOS, isAndroid} = require('../constants');
      isAndroid.mockReturnValue(false);
      isIOS.mockReturnValue(true);
      const {verifyCredential} = require('./verifyCredential');
      const result = await verifyCredential({proof: {}}, 'dc+sd-jwt');
      expect(result.isVerified).toBe(true);
    });

    it('returns success for iOS with Ed25519Signature2020 proof type', async () => {
      const {isIOS, isAndroid} = require('../constants');
      isAndroid.mockReturnValue(false);
      isIOS.mockReturnValue(true);
      const {verifyCredential} = require('./verifyCredential');
      const result = await verifyCredential(
        {
          proof: {
            type: 'Ed25519Signature2020',
            proofPurpose: 'assertionMethod',
          },
        },
        'ldp_vc',
      );
      expect(result.isVerified).toBe(true);
    });

    it('calls Android VcVerifier for Android platform', async () => {
      const {isAndroid} = require('../constants');
      isAndroid.mockReturnValue(true);
      const {verifyCredential} = require('./verifyCredential');
      const result = await verifyCredential(
        {proof: {type: 'RsaSignature2018'}},
        'ldp_vc',
      );
      expect(result).toBeDefined();
      expect(result.isVerified).toBe(true);
    });

    it('returns generic error on exception', async () => {
      const {isAndroid} = require('../constants');
      isAndroid.mockReturnValue(true);
      const VCVerifier = require('../vcVerifier/VcVerifier').default;
      VCVerifier.getInstance.mockReturnValueOnce({
        getVerificationSummary: jest.fn(() =>
          Promise.reject(new Error('crash')),
        ),
      });
      const {verifyCredential} = require('./verifyCredential');
      const result = await verifyCredential({proof: {}}, 'ldp_vc');
      expect(result.isVerified).toBe(false);
      expect(result.verificationErrorCode).toBe('ERR_GENERIC');
    });

    it('handles vcVerifier returning failed verification on Android', async () => {
      const {isAndroid} = require('../constants');
      isAndroid.mockReturnValue(true);
      const VCVerifier = require('../vcVerifier/VcVerifier').default;
      VCVerifier.getInstance.mockReturnValueOnce({
        getVerificationSummary: jest.fn(() =>
          Promise.resolve({
            verificationStatus: false,
            verificationMessage: 'Invalid signature',
            verificationErrorCode: '',
            credentialStatus: {},
          }),
        ),
      });
      const {verifyCredential} = require('./verifyCredential');
      const result = await verifyCredential(
        {proof: {type: 'RsaSignature2018'}, credentialSubject: {UIN: '123'}},
        'ldp_vc',
      );
      expect(result.isVerified).toBe(false);
    });

    it('verifies on iOS with RsaSignature2018 proof using vcjs', async () => {
      const {isIOS, isAndroid} = require('../constants');
      isAndroid.mockReturnValue(false);
      isIOS.mockReturnValue(true);
      const vcjs = require('@digitalcredentials/vc');
      vcjs.verifyCredential.mockResolvedValueOnce({verified: true});
      const {verifyCredential} = require('./verifyCredential');
      const result = await verifyCredential(
        {
          proof: {
            type: 'RsaSignature2018',
            proofPurpose: 'assertionMethod',
            verificationMethod: 'key1',
            created: '2024-01-01',
          },
        },
        'ldp_vc',
      );
      expect(result.isVerified).toBe(true);
    });

    it('handles failed vcjs verification on iOS with InvalidUrl', async () => {
      const {isIOS, isAndroid} = require('../constants');
      isAndroid.mockReturnValue(false);
      isIOS.mockReturnValue(true);
      const vcjs = require('@digitalcredentials/vc');
      vcjs.verifyCredential.mockResolvedValueOnce({
        verified: false,
        results: [{error: {name: 'jsonld.InvalidUrl'}}],
      });
      const {verifyCredential} = require('./verifyCredential');
      const result = await verifyCredential(
        {
          proof: {
            type: 'RsaSignature2018',
            proofPurpose: 'assertionMethod',
            verificationMethod: 'k',
            created: '2024',
          },
        },
        'ldp_vc',
      );
      expect(result.isVerified).toBe(false);
      expect(result.verificationErrorCode).toBe('ERR_NETWORK');
    });

    it('handles RangeError in vcjs verification on iOS', async () => {
      const {isIOS, isAndroid} = require('../constants');
      isAndroid.mockReturnValue(false);
      isIOS.mockReturnValue(true);
      const vcjs = require('@digitalcredentials/vc');
      vcjs.verifyCredential.mockResolvedValueOnce({
        verified: false,
        results: [{error: {name: 'RangeError'}}],
      });
      const {verifyCredential} = require('./verifyCredential');
      const result = await verifyCredential(
        {
          proof: {
            type: 'RsaSignature2018',
            proofPurpose: 'assertionMethod',
            verificationMethod: 'k',
            created: '2024',
          },
        },
        'ldp_vc',
      );
      // RangeError is treated as verified but with error code
      expect(result.isVerified).toBe(true);
      expect(result.verificationErrorCode).toBe('ERR_RANGE');
    });

    it('handles publicKey proof purpose on iOS', async () => {
      const {isIOS, isAndroid} = require('../constants');
      isAndroid.mockReturnValue(false);
      isIOS.mockReturnValue(true);
      const vcjs = require('@digitalcredentials/vc');
      vcjs.verifyCredential.mockResolvedValueOnce({verified: true});
      const {verifyCredential} = require('./verifyCredential');
      const result = await verifyCredential(
        {
          proof: {
            type: 'RsaSignature2018',
            proofPurpose: 'publicKey',
            verificationMethod: 'k',
            created: '2024',
          },
        },
        'ldp_vc',
      );
      expect(result.isVerified).toBe(true);
    });

    it('handles Ed25519Signature2018 proof type on iOS', async () => {
      const {isIOS, isAndroid} = require('../constants');
      isAndroid.mockReturnValue(false);
      isIOS.mockReturnValue(true);
      const vcjs = require('@digitalcredentials/vc');
      vcjs.verifyCredential.mockResolvedValueOnce({verified: true});
      const {verifyCredential} = require('./verifyCredential');
      const result = await verifyCredential(
        {
          proof: {
            type: 'Ed25519Signature2018',
            proofPurpose: 'assertionMethod',
            verificationMethod: 'k',
            created: '2024',
          },
        },
        'ldp_vc',
      );
      expect(result.isVerified).toBe(true);
    });

    it('handles Android string credential', async () => {
      const {isAndroid} = require('../constants');
      isAndroid.mockReturnValue(true);
      const {verifyCredential} = require('./verifyCredential');
      const result = await verifyCredential('{"proof":{}}', 'ldp_vc');
      expect(result).toBeDefined();
    });

    it('handles unsupported proof purpose on iOS', async () => {
      const {isIOS, isAndroid} = require('../constants');
      isAndroid.mockReturnValue(false);
      isIOS.mockReturnValue(true);
      const {verifyCredential} = require('./verifyCredential');
      const result = await verifyCredential(
        {
          proof: {
            type: 'RsaSignature2018',
            proofPurpose: 'unknownPurpose',
            verificationMethod: 'k',
            created: '2024',
          },
        },
        'ldp_vc',
      );
      expect(result.isVerified).toBe(false);
      expect(result.verificationErrorCode).toBe('ERR_GENERIC');
    });

    it('handles unsupported proof type on iOS', async () => {
      const {isIOS, isAndroid} = require('../constants');
      isAndroid.mockReturnValue(false);
      isIOS.mockReturnValue(true);
      const {verifyCredential} = require('./verifyCredential');
      const result = await verifyCredential(
        {
          proof: {
            type: 'UnknownSuiteType',
            proofPurpose: 'assertionMethod',
            verificationMethod: 'k',
            created: '2024',
          },
        },
        'ldp_vc',
      );
      expect(result.isVerified).toBe(false);
      expect(result.verificationErrorCode).toBe('ERR_GENERIC');
    });

    it('handles vcVerifier handleVcVerifierResponse catch block on Android', async () => {
      const {isAndroid} = require('../constants');
      isAndroid.mockReturnValue(true);
      const VCVerifier = require('../vcVerifier/VcVerifier').default;
      VCVerifier.getInstance.mockReturnValueOnce({
        getVerificationSummary: jest.fn(() =>
          Promise.resolve({
            verificationStatus: true,
            verificationMessage: '',
            verificationErrorCode: '',
            credentialStatus: {revocation: {isValid: false}},
          }),
        ),
      });
      const {isIOS: isIOSFn} = require('../constants');
      isIOSFn.mockReturnValue(false);
      const {verifyCredential} = require('./verifyCredential');
      const result = await verifyCredential({proof: {}}, 'ldp_vc');
      expect(result.isVerified).toBe(true);
      expect(result.isRevoked).toBe('TRUE');
    });
  });

  describe('checkIsStatusRevoked iOS paths', () => {
    it('calls handleStatusListVCVerification for valid status on iOS', async () => {
      const {isIOS} = require('../constants');
      isIOS.mockReturnValue(true);
      const {checkIsStatusRevoked} = require('./verifyCredential');
      const result = await checkIsStatusRevoked({
        revocation: {isValid: true, statusListVC: {}},
      });
      expect(result).toBe('FALSE');
    });

    it('calls handleStatusListVCVerification for revoked status on iOS', async () => {
      const {isIOS} = require('../constants');
      isIOS.mockReturnValue(true);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const {checkIsStatusRevoked} = require('./verifyCredential');
      const result = await checkIsStatusRevoked({
        revocation: {isValid: false},
      });
      expect(result).toBe('TRUE');
      consoleSpy.mockRestore();
    });
  });
});
