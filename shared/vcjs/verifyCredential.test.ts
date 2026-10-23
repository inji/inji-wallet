import vcjs from '@digitalcredentials/vc';
import {verifyCredential} from './verifyCredential';
import {isAndroid, isIOS} from '../constants';
import VCVerifier, {RevocationStatus} from '../vcVerifier/VcVerifier';
import {VCFormat} from '../VCFormat';

jest.mock('@digitalcredentials/vc', () => ({verifyCredential: jest.fn()}));
jest.mock('@digitalcredentials/jsonld', () => ({
  documentLoaders: {xhr: jest.fn()},
}));
jest.mock(
  '../../lib/jsonld-signatures/suites/rsa2018/RsaSignature2018',
  () => ({RsaSignature2018: jest.fn()}),
);
jest.mock(
  '../../lib/jsonld-signatures/suites/ed255192018/Ed25519Signature2018',
  () => ({Ed25519Signature2018: jest.fn()}),
);
jest.mock('../../lib/jsonld-signatures/purposes/AssertionProofPurpose', () => ({
  AssertionProofPurpose: jest.fn(),
}));
jest.mock('../../lib/jsonld-signatures/purposes/PublicKeyProofPurpose', () => ({
  PublicKeyProofPurpose: jest.fn(),
}));
jest.mock('../telemetry/TelemetryUtils', () => ({
  getErrorEventData: jest.fn(),
  sendErrorEvent: jest.fn(),
}));
jest.mock('../telemetry/TelemetryConstants', () => ({
  TelemetryConstants: {ErrorMessage: {}},
}));
jest.mock('../commonUtil', () => ({getMosipIdentifier: jest.fn()}));
jest.mock('../constants', () => ({isAndroid: jest.fn(), isIOS: jest.fn()}));

const mockVerifier = {
  getCredentialStatus: jest.fn(),
  getVerificationSummary: jest.fn(),
};
jest.spyOn(VCVerifier, 'getInstance').mockReturnValue(mockVerifier as any);

const ldpVc = (expirationDate?: string) =>
  ({
    credentialSubject: {},
    expirationDate,
    proof: {
      type: 'RsaSignature2018',
      proofPurpose: 'assertionMethod',
      verificationMethod: 'did:example:issuer#key-1',
    },
  } as any);

const PAST = '2020-01-01T00:00:00Z';
const FUTURE = '2999-01-01T00:00:00Z';
const notRevoked = {revocation: {isValid: true}};
const revoked = {revocation: {isValid: false}};

describe('verifyCredential for ldp_vc', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('on iOS', () => {
    beforeEach(() => {
      (isAndroid as jest.Mock).mockReturnValue(false);
      (isIOS as jest.Mock).mockReturnValue(true);
      (vcjs.verifyCredential as jest.Mock).mockResolvedValue({verified: true});
    });

    it('reports a valid credential', async () => {
      mockVerifier.getCredentialStatus.mockResolvedValue(notRevoked);
      expect(await verifyCredential(ldpVc(FUTURE), VCFormat.ldp_vc)).toEqual(
        expect.objectContaining({
          isVerified: true,
          verificationErrorCode: '',
          isRevoked: RevocationStatus.FALSE,
        }),
      );
    });

    it('reports an expired credential as verified with ERR_VC_EXPIRED', async () => {
      mockVerifier.getCredentialStatus.mockResolvedValue(notRevoked);
      expect(await verifyCredential(ldpVc(PAST), VCFormat.ldp_vc)).toEqual(
        expect.objectContaining({
          isVerified: true,
          verificationErrorCode: 'ERR_VC_EXPIRED',
          isRevoked: RevocationStatus.FALSE,
        }),
      );
    });

    it('reports a revoked credential', async () => {
      mockVerifier.getCredentialStatus.mockResolvedValue(revoked);
      expect(await verifyCredential(ldpVc(FUTURE), VCFormat.ldp_vc)).toEqual(
        expect.objectContaining({
          isVerified: true,
          isRevoked: RevocationStatus.TRUE,
        }),
      );
    });

    it('does not report expiry when the signature check fails', async () => {
      (vcjs.verifyCredential as jest.Mock).mockResolvedValue({
        verified: false,
        results: [{error: {name: 'VerificationError'}}],
      });
      expect(await verifyCredential(ldpVc(PAST), VCFormat.ldp_vc)).toEqual(
        expect.objectContaining({
          isVerified: false,
          verificationErrorCode: 'ERR_GENERIC',
        }),
      );
    });
  });

  describe('on Android', () => {
    beforeEach(() => {
      (isAndroid as jest.Mock).mockReturnValue(true);
      (isIOS as jest.Mock).mockReturnValue(false);
    });

    it('passes on the verifier library result for an expired credential', async () => {
      mockVerifier.getVerificationSummary.mockResolvedValue({
        verificationStatus: true,
        verificationMessage: 'VC is expired',
        verificationErrorCode: 'ERR_VC_EXPIRED',
        credentialStatus: notRevoked,
      });
      expect(await verifyCredential(ldpVc(PAST), VCFormat.ldp_vc)).toEqual(
        expect.objectContaining({
          isVerified: true,
          verificationErrorCode: 'ERR_VC_EXPIRED',
          isRevoked: RevocationStatus.FALSE,
        }),
      );
      expect(vcjs.verifyCredential).not.toHaveBeenCalled();
    });

    it('passes on the verifier library result for a revoked credential', async () => {
      mockVerifier.getVerificationSummary.mockResolvedValue({
        verificationStatus: true,
        verificationMessage: '',
        verificationErrorCode: '',
        credentialStatus: revoked,
      });
      expect(await verifyCredential(ldpVc(FUTURE), VCFormat.ldp_vc)).toEqual(
        expect.objectContaining({
          isVerified: true,
          isRevoked: RevocationStatus.TRUE,
        }),
      );
    });
  });
});
