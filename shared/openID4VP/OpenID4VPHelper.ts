import {
  createSignature,
  createSignatureED,
  encodeB64,
  fetchKeyPair,
} from '../cryptoutil/cryptoUtil';
import {base64ToByteArray, canonicalize} from '../Utils';
import getAllConfigurations from '../api';
import {OpenID4VP_Proof_Sign_Algo} from './OpenID4VP';
import {VCFormat} from '../VCFormat';
import {isIOS, JWT_ALG_TO_KEY_TYPE} from '../constants';
import {getMdocAuthenticationAlorithm} from '../../components/VC/common/VCUtils';
import {KeyTypes} from '../cryptoutil/KeyTypes';
import {signatureSuite} from '../../machines/openID4VP/openID4VPServices';
import {UnsignedVPTokensV2, VPTokenSigningResultsV2} from './openid4vp.types';

export async function constructDetachedJWT(
  privateKey: any,
  vpToken: string,
  keyType: string,
): Promise<string> {
  const jwtHeader = {
    alg: OpenID4VP_Proof_Sign_Algo,
    crit: ['b64'],
    b64: false,
  };
  const header64 = encodeB64(JSON.stringify(jwtHeader));
  const headerBytes = new TextEncoder().encode(header64);
  const vpTokenBytes = base64ToByteArray(vpToken);
  const payloadBytes = new Uint8Array([...headerBytes, 46, ...vpTokenBytes]);

  const signature = await createSignatureED(privateKey, payloadBytes);

  return header64 + '..' + signature;
}

export async function isClientValidationRequired() {
  const config = await getAllConfigurations();
  return config.openid4vpClientValidation === 'true';
}

export async function getWalletMetadata() {
  const config = await getAllConfigurations();
  if (!config.walletMetadata) {
    return null;
  }
  const walletMetadata = JSON.parse(config.walletMetadata);
  return walletMetadata;
}

export const signDataForVpPreparation = async (
  unSignedVpTokens,
  context: any,
) => {
  // private key, key type and selected VCs are available in context
  const vpTokenSigningResultMap: Record<any, any> = {};
  for (const formatType in unSignedVpTokens) {
    const credentials = unSignedVpTokens[formatType];
    let dataToSign = credentials.dataToSign;
    if (formatType === VCFormat.ldp_vc.valueOf()) {
      if (isIOS()) {
        const canonicalized = await canonicalize(JSON.parse(dataToSign));
        if (!canonicalized) {
          throw new Error('Canonicalized data to sign is undefined');
        }
        dataToSign = canonicalized;
      }
      const proof = await constructDetachedJWT(
        context.privateKey,
        dataToSign,
        context.keyType,
      );
      vpTokenSigningResultMap[formatType] = {
        jws: proof,
        proofValue: null,
        signatureAlgorithm: signatureSuite,
      };
    } else if (formatType === VCFormat.mso_mdoc.valueOf()) {
      const signedData: Record<string, any> = {};

      const mdocCredentialsByDocType = Object.values(context.selectedVCs)
        .flat()
        .reduce((acc, credential) => {
          if (credential.format === 'mso_mdoc') {
            const docType =
              credential?.verifiableCredential?.processedCredential?.docType;
            if (docType) {
              acc[docType] = credential;
            }
          }
          return acc;
        }, {});

      await Promise.all(
        Object.entries(credentials.docTypeToDeviceAuthenticationBytes).map(
          async ([docType, payload]) => {
            const cred = mdocCredentialsByDocType[docType];

            if (!cred) return;

            const mdocAuthenticationAlgorithm = getMdocAuthenticationAlorithm(
              cred.verifiableCredential.processedCredential.issuerSigned
                ?.issuerAuth?.[2] ??
                cred.verifiableCredential.processedCredential?.issuerAuth?.[2],
            );

            if (mdocAuthenticationAlgorithm === KeyTypes.ES256.valueOf()) {
              const key = await fetchKeyPair(mdocAuthenticationAlgorithm);
              const signature = await createSignature(
                key.privateKey,
                payload,
                mdocAuthenticationAlgorithm,
              );

              if (signature) {
                signedData[docType] = {
                  signature,
                  mdocAuthenticationAlgorithm,
                };
              }
            } else {
              throw new Error(
                `Unsupported algorithm: ${mdocAuthenticationAlgorithm}`,
              );
            }
          },
        ),
      );

      vpTokenSigningResultMap[formatType] = signedData;
    } else if (
      formatType === VCFormat.vc_sd_jwt.valueOf() ||
      formatType === VCFormat.dc_sd_jwt.valueOf()
    ) {
      const uuidToUnsignedKBJWT = credentials.uuidToUnsignedKBT;
      const uuidToSignature: Record<string, string> = {};

      for (const [uuid, unsignedKBJWT] of Object.entries(uuidToUnsignedKBJWT)) {
        const header = JSON.parse(atob(unsignedKBJWT.split('.')[0]));
        const alg = header.alg;
        const keyType = JWT_ALG_TO_KEY_TYPE[alg];

        let privateKey: string;

        if (keyType === KeyTypes.ED25519) {
          privateKey = context.privateKey;
        } else {
          const keypair = await fetchKeyPair(keyType);
          privateKey = keypair.privateKey;
        }
        const signature = await createSignature(
          privateKey,
          unsignedKBJWT,
          keyType,
        );
        if (signature) {
          uuidToSignature[uuid] = signature;
        } else {
          throw new Error(`Failed to create signature for UUID: ${uuid}`);
        }
      }

      vpTokenSigningResultMap[formatType] = uuidToSignature;
    }
  }
  return vpTokenSigningResultMap;
};

/**
 *
 * unsignedVPTokens : [{
 *   format: 'ldp_vc' | 'mso_mdoc' | 'vc_sd_jwt' | 'dc_sd_jwt',
 *   holderKeyReference: string,
 *   signatureAlgorithm: string,
 *   dataToSign: string
 * }]
 * @param unSignedVpTokens
 * @param context
 */
export const signDataForVpPreparationV2 = async (
  unSignedVpTokens: UnsignedVPTokensV2,
  context: any,
): Promise<VPTokenSigningResultsV2> => {
  // private key, key type and selected VCs are available in context
  const vpTokenSigningResults: VPTokenSigningResultsV2 = [];

  for (const unsignedVPToken of unSignedVpTokens) {
    const formatType = unsignedVPToken.format;
    let payload = unsignedVPToken.dataToSign;
    const signatureAlgorithm: string = unsignedVPToken.signatureAlgorithm;
    switch (formatType) {
      case VCFormat.ldp_vc.valueOf():
        if (isIOS()) {
          const canonicalized = await canonicalize(JSON.parse(payload));
          if (!canonicalized) {
            throw new Error('Canonicalized data to sign is undefined');
          }
          payload = canonicalized;
        }
        // eslint-disable-next-line no-case-declarations
        const proof = await constructDetachedJWT(
          context.privateKey,
          payload,
          signatureAlgorithm,
        );
        vpTokenSigningResults.push({signedData: proof});
        break;
      case VCFormat.mso_mdoc.valueOf():
        // eslint-disable-next-line no-case-declarations
        if (signatureAlgorithm === KeyTypes.ES256.valueOf()) {
          const key = await fetchKeyPair(signatureAlgorithm);
          const signature = await createSignature(
            key.privateKey,
            payload,
            KeyTypes.ES256,
          );
          if (signature) {
            vpTokenSigningResults.push({signedData: signature});
          } else {
            throw new Error(
              `Failed to create signature for VP Token of format: ${formatType}`,
            );
          }
        } else {
          throw new Error(`Unsupported algorithm: ${signatureAlgorithm}`);
        }
        break;
      case VCFormat.vc_sd_jwt.valueOf():
      case VCFormat.dc_sd_jwt.valueOf():
        // eslint-disable-next-line no-case-declarations
        const keyType: KeyTypes = JWT_ALG_TO_KEY_TYPE[signatureAlgorithm];

        // eslint-disable-next-line no-case-declarations
        let privateKey: string;

        if (keyType === KeyTypes.ED25519) {
          privateKey = context.privateKey;
        } else {
          const keypair = await fetchKeyPair(keyType);
          privateKey = keypair.privateKey;
        }
        // eslint-disable-next-line no-case-declarations
        const signature = await createSignature(privateKey, payload, keyType);
        if (signature) {
          vpTokenSigningResults.push({signedData: signature});
        } else {
          throw new Error(
            `Failed to create signature for VP Token of format: ${formatType}`,
          );
        }
        break;
      default:
        throw new Error(`Unsupported VP Token format: ${formatType}`);
    }
  }

  return vpTokenSigningResults;
};
