import {CACHED_API} from '../../shared/api';
import {
  createSignature,
  fetchKeyPair,
} from '../../shared/cryptoutil/cryptoUtil';
import {getJWK, hasKeyPair} from '../../shared/openId4VCI/Utils';
import base64url from 'base64url';
import {
  constructProofJWT,
  isClientValidationRequired,
  OpenID4VP,
  OpenID4VP_Domain,
  OpenID4VP_Proof_Sign_Algo_Suite,
} from '../../shared/openID4VP/OpenID4VP';
import {VCFormat} from '../../shared/VCFormat';
import {KeyTypes} from '../../shared/cryptoutil/KeyTypes';
import {getMdocAuthenticationAlorithm} from '../../components/VC/common/VCUtils';

export const openID4VPServices = () => {
  return {
    fetchTrustedVerifiers: async () => {
      return await CACHED_API.fetchTrustedVerifiersList();
    },

    shouldValidateClient: async () => {
      return await isClientValidationRequired();
    },

    getAuthenticationResponse: (context: any) => async () => {
      OpenID4VP.initialize();
      const serviceRes = await OpenID4VP.authenticateVerifier(
        context.urlEncodedAuthorizationRequest,
        context.trustedVerifiers,
      );
      return serviceRes;
    },

    getKeyPair: async (context: any) => {
      if (!!(await hasKeyPair(context.keyType))) {
        return await fetchKeyPair(context.keyType);
      }
    },

    getSelectedKey: async (context: any) => {
      return await fetchKeyPair(context.keyType);
    },

    sendVP: (context: any) => async () => {
      const unSignedVpTokens = await OpenID4VP.constructUnsignedVPToken(
        context.selectedVCs,
      );

      let vpTokenSigningResultMap: Record<any, any> = {};
      for (const formatType in unSignedVpTokens) {
        const credentials = unSignedVpTokens[formatType];

        if (formatType === VCFormat.ldp_vc.valueOf()) {
          const proofJWT = await constructProofJWT(
            context.publicKey,
            context.privateKey,
            credentials,
            context.keyType,
          );

          vpTokenSigningResultMap[formatType] = {
            jws: proofJWT,
            signatureAlgorithm: OpenID4VP_Proof_Sign_Algo_Suite,
            publicKey:
              'did:jwk:' +
              base64url(
                JSON.stringify(
                  await getJWK(context.publicKey, KeyTypes.ED25519),
                ),
              ),
            domain: OpenID4VP_Domain,
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
                      .issuerAuth[2],
                  );

                if (mdocAuthenticationAlgorithm === KeyTypes.ES256.valueOf()) {
                  const key = await fetchKeyPair(mdocAuthenticationAlgorithm);
                  const signature = await createSignature(
                    key.privateKey,
                    '',
                    payload,
                    mdocAuthenticationAlgorithm,
                    '',
                    payload,
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
        }
      }
      return await OpenID4VP.shareVerifiablePresentation(
        vpTokenSigningResultMap,
      );
    },
  };
};
