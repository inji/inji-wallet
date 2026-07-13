import jsonld from '@digitalcredentials/jsonld';
import vcjs from '@digitalcredentials/vc';
import {RsaSignature2018} from '../../lib/jsonld-signatures/suites/rsa2018/RsaSignature2018';
import {Ed25519Signature2018} from '../../lib/jsonld-signatures/suites/ed255192018/Ed25519Signature2018';
import {AssertionProofPurpose} from '../../lib/jsonld-signatures/purposes/AssertionProofPurpose';
import {PublicKeyProofPurpose} from '../../lib/jsonld-signatures/purposes/PublicKeyProofPurpose';
import {
  Credential,
  VerifiableCredential,
} from '../../machines/VerifiableCredential/VCMetaMachine/vc';
import {getErrorEventData, sendErrorEvent} from '../telemetry/TelemetryUtils';
import {TelemetryConstants} from '../telemetry/TelemetryConstants';
import {getMosipIdentifier} from '../commonUtil';
import {NativeModules} from 'react-native';
import {isAndroid, isIOS} from '../constants';
import {VCFormat} from '../VCFormat';
import VCVerifier, {
  CredentialStatusResult,
  RevocationStatus,
  RevocationStatusType,
  VerificationSummaryResult,
} from '../vcVerifier/VcVerifier';

// FIXME: Ed25519Signature2018 not fully supported yet.
// Ed25519Signature2018 proof type check is not tested with its real credential
const ProofType = {
  ED25519_2018: 'Ed25519Signature2018',
  RSA: 'RsaSignature2018',
  ED25519_2020: 'Ed25519Signature2020',
};

const ProofPurpose = {
  Assertion: 'assertionMethod',
  PublicKey: 'publicKey',
};

const vcVerifier = NativeModules.VCVerifierModule;

// ---- HCERT QR verification (new) ----------------------------------------

const HCERT_DECODE_URL = 'https://hcert-validator.racsel.org/decode/hcert';
const HCERT_VERIFY_SIGNATURE_URL =
  'https://hcert-validator.racsel.org/verify/signature';
const HCERT_VERIFICATION_FAILED_MESSAGE =
  'The credential could not be verified and cannot be downloaded to your wallet. Please contact the issuer for assistance.';

function decodeBase64QrCode(qrData: string): string {
  try {
    // React Native has a global atob/Buffer depending on setup; use Buffer for reliability
    const decoded = Buffer.from(qrData, 'base64').toString('utf-8');
    return decoded;
  } catch (error) {
    console.log(
      '[HCERT] Failed to base64-decode qr_data, using raw value. Error:',
      error,
    );
    return qrData;
  }
}

async function decodeHcertQrCode(qrData: string) {
  const decodedQrData = decodeBase64QrCode(qrData);
  const response = await fetch(HCERT_DECODE_URL, {
    method: 'POST',
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({qr_data: decodedQrData, include_raw: true}),
  });
  if (!response.ok) {
    throw new Error(
      `HCERT decode request failed with status ${response.status}`,
    );
  }

  const decodeJson = await response.json();
  return decodeJson;
}

async function verifyHcertSignature(coseRaw: Record<string, any>) {
  const response = await fetch(HCERT_VERIFY_SIGNATURE_URL, {
    method: 'POST',
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cose_raw: coseRaw,
      use_gdhcn: true,
      gdhcn_env: 'dev',
      participant: '-',
      domain: 'PH4H',
      usage: 'DSC',
      verify_did_proof: false,
      allow_remote_contexts: true,
      allow_unverified_trustlist: true,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `HCERT signature verification request failed with status ${response.status}`,
    );
  }

  const signatureJson = await response.json();
  console.log(
    '[HCERT] Verify-signature response body:',
    JSON.stringify(signatureJson),
  );
  return signatureJson;
}

/**
 * Decodes the HCERT QR code and verifies its signature.
 * Returns null when verification succeeds -> caller should continue the normal flow.
 * Returns a VerificationResult (failure) when it should short-circuit verifyCredential.
 */
async function verifyHcertQrCode(
  qrData: string,
): Promise<VerificationResult | null> {
  try {
    const decodeResult = await decodeHcertQrCode(qrData);
    const coseRaw = decodeResult?.cose?._raw;

    if (!coseRaw) {
      return createHcertVerificationFailedResult(
        'HCERT decode did not return COSE payload',
      );
    }
    const signatureResult = await verifyHcertSignature(coseRaw);

    if (!signatureResult?.valid) {
      return createHcertVerificationFailedResult(
        signatureResult?.message ?? 'Signature not valid',
      );
    }

    // Signature valid -> let the existing flow continue
    return null;
  } catch (error) {
    return createHcertVerificationFailedResult(error);
  }
}

function createHcertVerificationFailedResult(
  error: unknown,
): VerificationResult {
  console.error('[HCERT] QR credential verification failed:', error);
  return {
    isVerified: false,
    verificationMessage: HCERT_VERIFICATION_FAILED_MESSAGE,
    verificationErrorCode: VerificationErrorType.HCERT_VERIFICATION_FAILED,
  };
}

// ---------------------------------------------------------------------------

export async function verifyCredential(
  verifiableCredential: Credential,
  credentialFormat: string,
): Promise<VerificationResult> {
  try {
    const vcQrCode = (verifiableCredential?.credentialSubject as any)?.qrCode;

    if (vcQrCode) {
      const hcertFailure = await verifyHcertQrCode(vcQrCode);
      if (hcertFailure) {
        return hcertFailure;
      }
    }

    if (isAndroid()) {
      return await verifyCredentialForAndroid(
        verifiableCredential,
        credentialFormat,
      );
    }
    return await verifyCredentialForIos(verifiableCredential, credentialFormat);
  } catch (error) {
    console.error('Error occurred during credential verification:', error);

    return {
      isVerified: false,
      verificationMessage: error.message,
      verificationErrorCode: VerificationErrorType.GENERIC_TECHNICAL_ERROR,
    };
  }
}

async function verifyCredentialForAndroid(
  verifiableCredential: Credential,
  credentialFormat: string,
): Promise<VerificationResult> {
  const credentialString =
    typeof verifiableCredential === 'string'
      ? verifiableCredential
      : JSON.stringify(verifiableCredential);
  const vcVerifierResult =
    await VCVerifier.getInstance().getVerificationSummary(
      credentialString,
      credentialFormat,
    );
  return handleVcVerifierResponse(vcVerifierResult, verifiableCredential);
}

async function verifyCredentialForIos(
  verifiableCredential: Credential,
  credentialFormat: string,
): Promise<VerificationResult> {
  if (
    credentialFormat === VCFormat.mso_mdoc ||
    credentialFormat === VCFormat.vc_sd_jwt ||
    credentialFormat === VCFormat.dc_sd_jwt
  ) {
    return createSuccessfulVerificationResult();
  }
  /*
  Since Digital Bazaar library is not able to verify ProofType: "Ed25519Signature2020",
  defaulting it to return true until VcVerifier is implemented for iOS.
  */
  let verificationResponse: VerificationResult;
  if (verifiableCredential.proof.type === ProofType.ED25519_2020) {
    verificationResponse = createSuccessfulVerificationResult();
  } else {
    const purpose = getPurposeFromProof(
      verifiableCredential.proof.proofPurpose,
    );
    const suite = selectVerificationSuite(verifiableCredential.proof);
    const vcjsOptions = {
      purpose,
      suite,
      credential: verifiableCredential,
      documentLoader: jsonld.documentLoaders.xhr(),
    };

    const result = await vcjs.verifyCredential(vcjsOptions);
    verificationResponse = handleResponse(result, verifiableCredential);
  }

  if (verificationResponse.isVerified) {
    const statusArray = await VCVerifier.getInstance().getCredentialStatus(
      verifiableCredential,
      credentialFormat,
    );
    verificationResponse.isRevoked = await checkIsStatusRevoked(statusArray);
  }
  return verificationResponse;
}

function getPurposeFromProof(proofPurpose) {
  switch (proofPurpose) {
    case ProofPurpose.PublicKey:
      return new PublicKeyProofPurpose();
    case ProofPurpose.Assertion:
      return new AssertionProofPurpose();
    default:
      throw new Error('Unsupported proof purpose');
  }
}

function selectVerificationSuite(proof: any) {
  const suiteOptions = {
    verificationMethod: proof.verificationMethod,
    date: proof.created,
  };

  switch (proof.type) {
    case ProofType.RSA:
      return new RsaSignature2018(suiteOptions);
    case ProofType.ED25519_2018:
      return new Ed25519Signature2018(suiteOptions);
    default:
      throw new Error('Unsupported proof type');
  }
}

function handleResponse(
  result: any,
  verifiableCredential: VerifiableCredential | Credential,
) {
  let errorMessage = VerificationErrorMessage.NO_ERROR;
  let errorCode = VerificationErrorType.NO_ERROR;
  let isVerifiedFlag = true;

  if (!result?.verified) {
    let errorCodeName = result['results'][0].error.name;
    errorMessage = VerificationErrorType.GENERIC_TECHNICAL_ERROR;
    isVerifiedFlag = false;
    errorCode = VerificationErrorType.GENERIC_TECHNICAL_ERROR;

    if (errorCodeName == 'jsonld.InvalidUrl') {
      errorMessage = VerificationErrorMessage.NETWORK_ERROR;
      errorCode = VerificationErrorType.NETWORK_ERROR;
    } else if (errorCodeName == VerificationErrorMessage.RANGE_ERROR) {
      errorMessage = VerificationErrorMessage.RANGE_ERROR;
      sendVerificationErrorEvent(
        TelemetryConstants.ErrorMessage.vcVerificationFailed,
        verifiableCredential,
      );
      isVerifiedFlag = true;
      errorCode = VerificationErrorType.RANGE_ERROR;
    }
  }

  const verificationResult: VerificationResult = {
    isVerified: isVerifiedFlag,
    verificationMessage: errorMessage,
    verificationErrorCode: errorCode,
  };
  return verificationResult;
}

async function handleVcVerifierResponse(
  verificationResult: VerificationSummaryResult,
  verifiableCredential: VerifiableCredential | Credential,
): Promise<VerificationResult> {
  try {
    if (!verificationResult.verificationStatus) {
      verificationResult.verificationErrorCode =
        verificationResult.verificationErrorCode === ''
          ? VerificationErrorType.GENERIC_TECHNICAL_ERROR
          : verificationResult.verificationErrorCode;
      sendVerificationErrorEvent(
        verificationResult.verificationMessage,
        verifiableCredential,
      );
    }
    const isRevoked = await checkIsStatusRevoked(
      verificationResult.credentialStatus,
    );
    return {
      isVerified: verificationResult.verificationStatus,
      verificationMessage: verificationResult.verificationMessage,
      verificationErrorCode: verificationResult.verificationErrorCode,
      isRevoked: isRevoked,
    };
  } catch (error) {
    console.error(
      'Error occurred while verifying the VC using VcVerifier Library:',
      error,
    );
    sendVerificationErrorEvent(error, verifiableCredential);
    return {
      isVerified: false,
      verificationMessage: verificationResult.verificationMessage,
      verificationErrorCode: verificationResult.verificationErrorCode,
    };
  }
}

const handleStatusListVCVerification = (
  status: CredentialStatusResult,
  type: 'revoked' | 'valid',
) => {
  const isValid = verifyStatusListVC(status.statusListVC);
  if (!isValid) {
    throw new Error(
      `StatusListVC verification failed for ${type} entry  ${status.error}`,
    );
  }
};

export async function checkIsStatusRevoked(
  vcStatus: Record<string, CredentialStatusResult>,
): Promise<RevocationStatusType> {
  if (!vcStatus || !Object.keys(vcStatus).length) return RevocationStatus.FALSE;

  const revocationStatus = vcStatus['revocation'] as CredentialStatusResult;
  if (!revocationStatus) return RevocationStatus.FALSE;

  const {isValid, error} = revocationStatus;

  if (isValid) {
    // Validate the valid statuses statusList VC for iOS
    if (isIOS()) {
      handleStatusListVCVerification(revocationStatus, 'valid');
    }
    return RevocationStatus.FALSE;
  }

  // if there is an error fetching revocation status itself, throw error (isValid = true, error = Error)
  if (error) {
    console.error(
      `Error fetching revocation status. Error: ${error.code}, Message: ${error.message}`,
    );
    return RevocationStatus.UNDETERMINED;
  }
  // There is no error fetching revocation status, but the status is invalid (isValid = false, error = undefined) - VC is revoked
  // Validate the valid statuses statusList VC for iOS
  if (isIOS()) {
    handleStatusListVCVerification(revocationStatus, 'revoked');
  }
  console.error(`Credential is revoked`);
  // If revocation status is invalid, the credential is revoked
  return RevocationStatus.TRUE;
}

function createSuccessfulVerificationResult(): VerificationResult {
  return {
    isVerified: true,
    verificationMessage: VerificationErrorMessage.NO_ERROR,
    verificationErrorCode: VerificationErrorType.NO_ERROR,
  };
}

function sendVerificationErrorEvent(
  errorMessage: string,
  verifiableCredential: any,
) {
  const stacktrace = __DEV__ ? verifiableCredential : {};
  //Add only UIN / VID in the credential into telemetry error message and not document_number or other identifiers to avoid sensitivity issues
  let detailedError = errorMessage;
  if (verifiableCredential.credentialSubject)
    detailedError += `-${getMosipIdentifier(
      verifiableCredential.credentialSubject,
    )}`;

  sendErrorEvent(
    getErrorEventData(
      TelemetryConstants.FlowType.vcVerification,
      TelemetryConstants.ErrorId.vcVerificationFailed,
      detailedError,
      stacktrace,
    ),
  );
}

export const VerificationErrorType = {
  NO_ERROR: '',
  GENERIC_TECHNICAL_ERROR: 'ERR_GENERIC',
  NETWORK_ERROR: 'ERR_NETWORK',
  EXPIRATION_ERROR: 'ERR_VC_EXPIRED',
  RANGE_ERROR: 'ERR_RANGE',
  HCERT_VERIFICATION_FAILED: 'ERR_HCERT_VERIFICATION_FAILED',
};

export const VerificationErrorMessage = {
  NO_ERROR: '',
  RANGE_ERROR: 'RangeError',
  NETWORK_ERROR: 'NetworkError',
};

export interface VerificationResult {
  isVerified: boolean;
  verificationMessage: string;
  verificationErrorCode: string;
  isRevoked?: RevocationStatusType;
}

//TODO: Implement status list VC verification for iOS.
//Currently Digital Bazaar library does not support VC 2.0 status list VC verification.
function verifyStatusListVC(statusListVC: Record<string, any> | undefined) {
  return true;
}

export const VERIFICATION_TIMEOUT_IN_MS = 5000;
