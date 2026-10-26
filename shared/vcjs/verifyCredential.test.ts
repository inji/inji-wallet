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
jest.mock('../mdoc/presentment/issuerSigned', () => ({
  readMsoValidUntil: (credential: string) => new Date(credential),
}));

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

describe('verifyCredential for formats the verifiers skip', () => {
  // The mocked mdoc reader treats the encoded credential as its expiry date.
  const storedMdoc = (validUntil: string) => ({credential: validUntil});
  const storedSdJwt = (exp: string) => ({
    credential: 'header.payload.signature',
    processedCredential: {
      fullResolvedPayload: {exp: new Date(exp).getTime() / 1000},
    },
  });

  beforeEach(() => jest.clearAllMocks());

  describe.each([
    ['Android', true],
    ['iOS', false],
  ])('on %s', (_platform, android) => {
    beforeEach(() => {
      (isAndroid as jest.Mock).mockReturnValue(android);
      (isIOS as jest.Mock).mockReturnValue(!android);
    });

    it('reports an expired mdoc as verified with ERR_VC_EXPIRED', async () => {
      const stored = storedMdoc(PAST);
      expect(
        await verifyCredential(
          stored.credential as any,
          VCFormat.mso_mdoc,
          stored,
        ),
      ).toEqual(
        expect.objectContaining({
          isVerified: true,
          verificationErrorCode: 'ERR_VC_EXPIRED',
        }),
      );
    });

    it('reports a valid mdoc without an error', async () => {
      const stored = storedMdoc(FUTURE);
      expect(
        await verifyCredential(
          stored.credential as any,
          VCFormat.mso_mdoc,
          stored,
        ),
      ).toEqual(
        expect.objectContaining({isVerified: true, verificationErrorCode: ''}),
      );
    });
  });

  describe('on iOS', () => {
    beforeEach(() => {
      (isAndroid as jest.Mock).mockReturnValue(false);
      (isIOS as jest.Mock).mockReturnValue(true);
    });

    it('reads SD-JWT expiry from the stored wrapper', async () => {
      const stored = storedSdJwt(PAST);
      expect(
        await verifyCredential(
          stored.credential as any,
          VCFormat.dc_sd_jwt,
          stored,
        ),
      ).toEqual(
        expect.objectContaining({
          isVerified: true,
          verificationErrorCode: 'ERR_VC_EXPIRED',
        }),
      );
    });

    it('reports a valid SD-JWT without an error', async () => {
      const stored = storedSdJwt(FUTURE);
      expect(
        await verifyCredential(
          stored.credential as any,
          VCFormat.vc_sd_jwt,
          stored,
        ),
      ).toEqual(
        expect.objectContaining({isVerified: true, verificationErrorCode: ''}),
      );
    });
  });
});
