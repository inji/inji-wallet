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
import {isIOS} from '../../shared/constants';
import {canonicalize} from '../../shared/Utils';
import {
  constructDetachedJWT,
  isClientValidationRequired,
} from '../../shared/openID4VP/OpenID4VPHelper';

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
      const serviceRes = await OpenID4VP.getInstance().authenticateVerifier(
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
      const openid = OpenID4VP.getInstance();

      const jwk = await getJWK(context.publicKey, context.keyType);
      const holderId = 'did:jwk:' + base64url(JSON.stringify(jwk)) + '#0';

      const unSignedVpTokens = await openid.constructUnsignedVPToken(
        context.selectedVCs,
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
        }
      }
      return await openid.shareVerifiablePresentation(vpTokenSigningResultMap);
    },
  };
};
