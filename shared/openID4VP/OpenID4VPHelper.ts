import {
  createSignature, createSignatureECK1, createSignatureECR1, createSignatureED, createSignatureRSA,
  encodeB64,
  fetchKeyPair,
} from '../cryptoutil/cryptoUtil';
import {base64ToByteArray, canonicalize, canonicalize2} from '../Utils';
import getAllConfigurations from '../api';
import {OpenID4VP_Proof_Sign_Algo} from './OpenID4VP';
import {VCFormat} from '../VCFormat';
import {isIOS, JWT_ALG_TO_KEY_TYPE} from '../constants';
import {getMdocAuthenticationAlorithm} from '../../components/VC/common/VCUtils';
import {KeyTypes, SignatureAlgorithms} from '../cryptoutil/KeyTypes';
import {signatureSuite} from '../../machines/openID4VP/openID4VPServices';
import {
  UnsignedVPToken,
  VPTokenSigningResult,
} from './openid4vp.types';

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
  const vpTokenBytes = base64ToByteArray(vpToken); // base64 encoded canonicalized data
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

export async function getWalletConfig() {
  const config = await getAllConfigurations();
  if (!config.walletConfig) {
    return null;
  }
  const walletMetadata = JSON.parse(config.walletMetadata);
  return walletMetadata;
}

export const jsonLdCanonicalize = async (data: string) => {
  console.log('Canonicalizing data: ', data);
  console.log('Canonicalizing data: ', typeof data);
  const parsedData = JSON.parse(data);
  console.log('type of parsedData: ', typeof parsedData);
  // const canonicalized = await canonicalize(parsedData);
  const canonicalized = await canonicalize2(parsedData);
  if (!canonicalized) {
    throw new Error('Canonicalized data to sign is undefined');
  }
  return canonicalized;
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
 */
export const signDataForVpPreparation = async (
  unSignedVpTokens: Array<UnsignedVPToken>,
): Promise<Array<VPTokenSigningResult>> => {
  const keyTypeToKeys: Record<string, any> = {};

  const getKeyInfo = async (keyType: string) => {
    if (keyTypeToKeys[keyType]) {
      return keyTypeToKeys[keyType];
    } else {
      const key = await fetchKeyPair(keyType);
      keyTypeToKeys[keyType] = key;
      return key
    }
  }

  const result: Promise<VPTokenSigningResult>[] = unSignedVpTokens.map(
    async unsignedVPToken => {
      let signature: string | undefined = '';
      const formatType = unsignedVPToken.format;
      const payload: string = unsignedVPToken.dataToSign;
      const signatureAlgorithm: string = unsignedVPToken.signatureAlgorithm;
      console.log("Signing VP Token with format: ", formatType);
      console.log("Signature Algorithm: ", signatureAlgorithm);

      const keyType =
        JWT_ALG_TO_KEY_TYPE[
          signatureAlgorithm as keyof typeof JWT_ALG_TO_KEY_TYPE
          ];
      const key = await getKeyInfo(keyType);
      console.log("Key Info = ", JSON.stringify(key, null, 2))
      signature = await signData(
        key.privateKey,
        payload, // Payload is in base64 url encoded form - decode it before signing
        signatureAlgorithm,
      );
      return {signedData: signature} as VPTokenSigningResult;
    },
  );

  const vpTokenSigningResults = await Promise.all(result);
  return vpTokenSigningResults as Array<VPTokenSigningResult>;
};


async function signData(
  privateKey: string,
  base64EncodedPayload: string,
  keyType: string,
) {
  const payloadBytes = base64ToByteArray(base64EncodedPayload);
  // const payloadBytes = base64UrlToUint8Array(base64EncodedPayload);
  console.log("Signing data with key type: ", keyType);
  console.log("payloadBytes: ", payloadBytes);
  // const hexString = Array.from(payloadBytes)
  //   .map(b => b.toString(16).padStart(2, '0'))
  //   .join(' ');
  // console.log("payloadBytes in hex: ", hexString);

  switch (keyType) {
    case SignatureAlgorithms.RS256: // Life Insurance credential
      return createSignatureRSA(privateKey, payloadBytes);
    case SignatureAlgorithms.ES256: // Insurance credential
      return createSignatureECR1(privateKey, payloadBytes);
    case SignatureAlgorithms.ES256K: // Mock VC DM 1.1
      return createSignatureECK1(privateKey, payloadBytes);
    case SignatureAlgorithms.EdDSA: {
      return createSignatureED(privateKey, payloadBytes);
    }
    default:
      break;
  }
}
