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
import {isCredentialExpired} from '../credentialExpiry';
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

/**
 * `expiryCredential` is the stored credential wrapper: the expiry of mdoc and SD-JWT credentials
 * is read from its `credential` and `processedCredential`, which the bare credential doesn't have.
 */
export async function verifyCredential(
  verifiableCredential: Credential,
  credentialFormat: string,
  expiryCredential: unknown = verifiableCredential,
): Promise<VerificationResult> {
  try {
    if (isAndroid()) {
      return await verifyCredentialForAndroid(
        verifiableCredential,
        credentialFormat,
        expiryCredential,
      );
    }
    return await verifyCredentialForIos(
      verifiableCredential,
      credentialFormat,
      expiryCredential,
    );
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
  expiryCredential: unknown,
): Promise<VerificationResult> {
  // Skip verification for mso_mdoc on Android - vcverifier-aar:1.6.0 crashes
  // with "Index 1 out of bounds for length 1" when parsing mdoc CBOR.
  // This mirrors the iOS behavior (see verifyCredentialForIos).
  if (credentialFormat === VCFormat.mso_mdoc) {
    return markExpiredIfNeeded(
      createSuccessfulVerificationResult(),
      expiryCredential,
      credentialFormat,
    );
  }
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
  expiryCredential: unknown,
): Promise<VerificationResult> {
  if (
    credentialFormat === VCFormat.mso_mdoc ||
    credentialFormat === VCFormat.vc_sd_jwt ||
    credentialFormat === VCFormat.dc_sd_jwt
  ) {
    return markExpiredIfNeeded(
      createSuccessfulVerificationResult(),
      expiryCredential,
      credentialFormat,
    );
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

  // vcjs only checks the date is well formed, and the iOS verifier only checks status.
  markExpiredIfNeeded(verificationResponse, expiryCredential, credentialFormat);

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

/** Reports an expired credential the way the Android verifier does: still verified. */
function markExpiredIfNeeded(
  verificationResponse: VerificationResult,
  expiryCredential: unknown,
  credentialFormat: string,
): VerificationResult {
  if (
    verificationResponse.isVerified &&
    isCredentialExpired(expiryCredential, credentialFormat)
  ) {
    verificationResponse.verificationMessage = VerificationErrorMessage.EXPIRED;
    verificationResponse.verificationErrorCode =
      VerificationErrorType.EXPIRATION_ERROR;
  }
  return verificationResponse;
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
};

export const VerificationErrorMessage = {
  NO_ERROR: '',
  RANGE_ERROR: 'RangeError',
  NETWORK_ERROR: 'NetworkError',
  EXPIRED: 'VC is expired',
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
