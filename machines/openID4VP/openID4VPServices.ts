import {CACHED_API} from '../../shared/api';
import {
  createSignature,
  fetchKeyPair,
} from '../../shared/cryptoutil/cryptoUtil';
import {getJWK, hasKeyPair} from '../../shared/openId4VCI/Utils';
import base64url from 'base64url';
import OpenID4VP from '../../shared/openID4VP/OpenID4VP';
import {VCFormat} from '../../shared/VCFormat';
import {KeyTypes} from '../../shared/cryptoutil/KeyTypes';
import {getMdocAuthenticationAlorithm} from '../../components/VC/common/VCUtils';
import {
  isIOS,
  JWT_ALG_TO_KEY_TYPE,
  OVP_ERROR_CODE,
  OVP_ERROR_MESSAGES,
} from '../../shared/constants';
import {canonicalize, getVerifierKey} from '../../shared/Utils';
import {
  constructDetachedJWT,
  isClientValidationRequired,
} from '../../shared/openID4VP/OpenID4VPHelper';
import {NativeModules} from 'react-native';

const signatureSuite = 'JsonWebSignature2020';

export const openID4VPServices = () => {
  return {
    fetchTrustedVerifiers: async () => {
      return await CACHED_API.fetchTrustedVerifiersList();
    },

    shouldValidateClient: async () => {
      return await isClientValidationRequired();
    },

    getAuthenticationResponse: (context: any) => async () => {
      return await OpenID4VP.authenticateVerifier(
        context.urlEncodedAuthorizationRequest,
        context.trustedVerifiers,
      );
    },

    isVerifierTrusted: (context: any) => async () => {
      const {RNSecureKeystoreModule} = NativeModules;
      const verifier = context.authenticationResponse?.client_id;
      try {
        return await RNSecureKeystoreModule.hasAlias(getVerifierKey(verifier));
      } catch (error) {
        console.error(
          `Error while checking verifier client ID in trusted verifiers:`,
          error,
        );
        return false;
      }
    },

    storeTrustedVerifier: (context: any) => async () => {
      const {RNSecureKeystoreModule} = NativeModules;
      const verifier = context.authenticationResponse?.client_id;
      const trustValue = JSON.stringify({
        trusted: true,
        createdAt: new Date().toISOString(),
      });
      try {
        return await RNSecureKeystoreModule.storeData(
          getVerifierKey(verifier),
          trustValue,
        );
      } catch (error) {
        console.error(
          `Error while storing verifier client ID in trusted verifiers:`,
          error,
        );
        return false;
      }
    },

    getKeyPair: async (context: any) => {
      if (!!(await hasKeyPair(context.keyType))) {
        return await fetchKeyPair(context.keyType);
      }
    },

    getSelectedKey: async (context: any) => {
      return await fetchKeyPair(context.keyType);
    },

    shareDeclineStatus: async () => {
      return await OpenID4VP.sendErrorToVerifier(
        OVP_ERROR_MESSAGES.DECLINED,
        OVP_ERROR_CODE.DECLINED,
      );
    },

    sendVP: (context: any) => async () => {
      const jwk = await getJWK(context.publicKey, context.keyType);
      const holderId = 'did:jwk:' + base64url(JSON.stringify(jwk)) + '#0';

      const unSignedVpTokens = await OpenID4VP.constructUnsignedVPToken(
        context.selectedVCs,
        context.selectedDisclosuresByVc,
        holderId,
        signatureSuite,
      );
      let vpTokenSigningResultMap: Record<any, any> = {};
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
          let proof = await constructDetachedJWT(
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
                  credential?.verifiableCredential?.processedCredential
                    ?.docType;
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

                const mdocAuthenticationAlgorithm =
                  getMdocAuthenticationAlorithm(
                    cred.verifiableCredential.processedCredential.issuerSigned
                      ?.issuerAuth?.[2] ??
                      cred.verifiableCredential.processedCredential
                        ?.issuerAuth?.[2],
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

          for (const [uuid, unsignedKBJWT] of Object.entries(
            uuidToUnsignedKBJWT,
          )) {
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
      return await OpenID4VP.shareVerifiablePresentation(
        vpTokenSigningResultMap,
      );
    },
  };
};
