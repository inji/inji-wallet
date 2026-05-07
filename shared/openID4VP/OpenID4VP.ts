import {NativeEventEmitter, NativeModules} from 'react-native';
import {__AppId} from '../GlobalVariables';
import {
  SelectedCredentialsForVPSharing,
  VC,
} from '../../machines/VerifiableCredential/VCMetaMachine/vc';
import {walletMetadata} from './walletMetadata';
import {
  getWalletMetadata,
  isClientValidationRequired,
  jsonLdCanonicalize,
} from './OpenID4VPHelper';
import {jsonLdExpand, parseJSON} from '../Utils';
import {VCFormat} from '../VCFormat';
import {VCMetadata} from '../VCMetadata';
import {JSONPath} from 'jsonpath-plus';
import {
  getIssuerAuthenticationAlorithmForMdocVC,
  getMdocAuthenticationAlorithm,
} from '../../components/VC/common/VCUtils';
import {OVP_ERROR_CODE, OVP_ERROR_MESSAGES} from '../constants';

export const OpenID4VP_Proof_Sign_Algo = 'EdDSA';
const emitter = new NativeEventEmitter(NativeModules.InjiOpenID4VP);

class OpenID4VP {
  private static instance: OpenID4VP;
  private InjiOpenID4VP = NativeModules.InjiOpenID4VP;

  private constructor(walletMetadata: any) {
    this.addJsonLdCanonicalizerCallback();
    this.InjiOpenID4VP.initSdk(__AppId.getValue(), walletMetadata);
  }

  private addJsonLdCanonicalizerCallback = () => {
    emitter.addListener('onJsonLdCanonicalize', ({data}: {data: string}) => {
      console.log('Data to be canonicalized received from native: ', data);
      jsonLdCanonicalize(data)
        .then(result => {
          console.log('Canonicalization result sent to native: ', result);
          this.InjiOpenID4VP.sendJsonLdCanonicalizeResultFromJS(result);
        })
        .catch(error => {
          //TODO: abort the canonicalizer and notify native about the failure so that it can handle the error gracefully
          console.error('Error during JSON-LD canonicalization: ', error);
        });
    });
  };

  private addJsonLdExpanderCallback = () => {
    emitter.addListener('onJsonLdExpand', ({data}: {data: any}) => {
      jsonLdExpand(data)
        .then(result => {
          console.log('Expansion result sent to native: ', result);
          this.InjiOpenID4VP.sendJsonLdExpandResultFromJS(result);
        })
        .catch(error => {
          //TODO: abort the canonicalizer and notify native about the failure so that it can handle the error gracefully
          console.error('Error during JSON-LD expansion: ', error);
        });
    });
  };

  private static async getInstance(): Promise<OpenID4VP> {
    if (!OpenID4VP.instance) {
      const walletMetadataConfig =
        (await getWalletMetadata()) || walletMetadata;
      OpenID4VP.instance = new OpenID4VP(walletMetadataConfig);
    }
    return OpenID4VP.instance;
  }

  static async authenticateVerifier(
    urlEncodedAuthorizationRequest: string,
    trustedVerifiersList: any,
  ) {
    const shouldValidateClient = await isClientValidationRequired();
    const openID4VP = await OpenID4VP.getInstance();

    const authenticationResponse =
      await openID4VP.InjiOpenID4VP.authenticateVerifier(
        urlEncodedAuthorizationRequest,
        trustedVerifiersList,
        shouldValidateClient,
      );
    return JSON.parse(authenticationResponse);
  }

  static async getMatchingCredentials(
    vpRequest: object,
    availableWalletCredentials: VC[],
  ) {
    const presentationDefinition = vpRequest['presentation_definition'];
    if (presentationDefinition) {
      return getVcsMatchingAuthRequest(vpRequest, availableWalletCredentials);
    } else {
      const openID4VP = await OpenID4VP.getInstance();
      openID4VP.addJsonLdExpanderCallback();

      const updatedAvailableWalletCredentials: {
        format: string;
        credentialId: string;
        credential: any;
      }[] = availableWalletCredentials.map(vcData => {
        const credentialFormat = vcData.vcMetadata.format;
        return {
          format: credentialFormat,
          credentialId: vcData.vcMetadata.id,
          credential: vcData.verifiableCredential.credential,
        };
      });

      console.log(
        'Available wallet credentials sent to getMatchingCredentials API: ',
        updatedAvailableWalletCredentials,
      );

      const filtered = updatedAvailableWalletCredentials.filter(
        vc => vc.credential !== undefined,
      );
      const matchingCredentialsResult =
        await openID4VP.InjiOpenID4VP.getMatchingCredentials(
          vpRequest,
          filtered,
        );
      /**
       * {
       *  "credentialSets": [],
       *  "queryMatches": {
       *    "mvrc": {
       *      "allowMultipleCredentials": false,
       *      "failureReason": "no_matching_credentials_with_requested_credential_formats_found"
       *    }
       *  },
       *  "success": false
       *  }
       */

      const result = parseJSON(matchingCredentialsResult);
      console.log(
        'result from getMatchingCredentials API call: ',
        JSON.stringify(result, null, 2),
      );

      return {
        matchingVCs: {mvrc: availableWalletCredentials},
        requestedClaims: '',
        purpose: '',
      };
    }
  }

  static async prepareCredentialsForVPSharing(
    selectedVCs: Record<string, VC[]>,
    selectedDisclosuresByVc: any,
  ) {
    const openID4VP = await OpenID4VP.getInstance();

    return openID4VP.processSelectedVCs(selectedVCs, selectedDisclosuresByVc);
  }

  static getSignatureSuite(key: string): string {
    // The key is in did:jwk format, we need to extract the "crv" & "kty" parameter from the JWK to determine the signature algorithm
    try {
      const jwk = decodeDidJwk(key);
      if (jwk.kty === 'OKP' && jwk.crv === 'Ed25519') {
        return 'Ed25519Signature2020';
      } else if (jwk.kty === 'RSA') {
        return 'RsaSignature2018';
      } else {
        return 'JsonWebSignature2020';
      }
    } catch (error) {
      console.error('Error parsing JWK from key: ', error);
      return 'JsonWebSignature2020'; // default to JsonWebSignature2020 if we can't determine the algorithm
    }
  }

  static async constructUnsignedVPToken(
    vpRequest: any,
    selectedVCs: Record<string, VC[]>,
    selectedDisclosuresByVc: any,
    holderId: string,
    signatureAlgorithm: string,
  ) {
    const openID4VP = await OpenID4VP.getInstance();

    const isPresentationExchangeFlow = vpRequest.hasOwnProperty(
      'presentation_definition',
    );
    if (isPresentationExchangeFlow) {
      const updatedSelectedVCs = openID4VP.processSelectedVCs(
        selectedVCs,
        selectedDisclosuresByVc,
      );

      let holder = holderId;
      let signatureAlgorithmForCredential = signatureAlgorithm;

      for (const [_, vcsArray] of Object.entries(updatedSelectedVCs)) {
        if (vcsArray['ldp_vc']) {
          // extract the holderId from the very first entry
          const firstLdpVc = vcsArray['ldp_vc'][0];
          holder = firstLdpVc['credentialSubject']['id'];
          signatureAlgorithmForCredential = this.getSignatureSuite(holder);
          if (signatureAlgorithmForCredential === 'Ed25519Signature2020') {
            // convert holder from did:jwk to did:key format for Ed25519 keys
            holder = 'did:web:KiruthikaJeyashankar.github.io:did#key-0';
            console.log(
              'Holder uses Ed25519 key, converted holder id to did:key format: ',
              holder,
            );
          }
          break;
        }
      }

      console.log(
        'The holder id for signing the VP token is determined to be: ',
        holder,
      );
      console.log(
        'The signature algorithm for signing the VP token is determined to be: ',
        signatureAlgorithmForCredential,
      );
      const unSignedVpTokens =
        await openID4VP.InjiOpenID4VP.constructUnsignedVPToken(
          updatedSelectedVCs,
          holder,
          signatureAlgorithmForCredential,
        );
      return parseJSON(unSignedVpTokens);
    } else {
      // DCQL Query flow
      const updatedSelectedVCs: Record<
        string,
        Array<SelectedCredentialsForVPSharing>
      > = {};
      Object.entries(selectedVCs).forEach(([credentialQueryId, vcsArray]) => {
        updatedSelectedVCs[credentialQueryId] = vcsArray.map(credential => {
          const credentialFormat = credential.vcMetadata.format;
          return {
            format: credentialFormat,
            credentialId: credential.vcMetadata.id,
            credential: openID4VP.extractCredential(
              credential,
              credentialFormat,
              selectedDisclosuresByVc[
                VCMetadata.fromVcMetadataString(
                  credential.vcMetadata,
                ).getVcKey()
              ],
            ),
          };
        });
      });

      const unSignedVpTokens =
        await openID4VP.InjiOpenID4VP.constructUnsignedVPTokenDCQL(
          updatedSelectedVCs,
        );
      return parseJSON(unSignedVpTokens);
    }
  }

  static async shareVerifiablePresentation(
    vpTokenSigningResultMap: Record<string, any>,
  ) {
    const openID4VP = await OpenID4VP.getInstance();

    const verifierResponse =
      await openID4VP.InjiOpenID4VP.shareVerifiablePresentation(
        vpTokenSigningResultMap,
      );
    return parseJSON(verifierResponse);
  }

  static async sendErrorToVerifier(errorMessage: string, errorCode: string) {
    const openID4VP = await OpenID4VP.getInstance();

    return openID4VP.InjiOpenID4VP.sendErrorToVerifier(errorMessage, errorCode);
  }

  static async sendCanonicalizedData(data: string) {
    const openID4VP = await OpenID4VP.getInstance();

    openID4VP.InjiOpenID4VP.sendJsonLdCanonicalizeResultFromJS(data);
  }

  private processSelectedVCs(
    selectedVCs: Record<string, VC[]>,
    selectedDisclosuresByVc: any,
  ) {
    const selectedVcsData: SelectedCredentialsForVPSharing = {};
    Object.entries(selectedVCs).forEach(([inputDescriptorId, vcsArray]) => {
      vcsArray.forEach(vcData => {
        const credentialFormat = vcData.vcMetadata.format;
        const credential = this.extractCredential(
          vcData,
          credentialFormat,
          selectedDisclosuresByVc[
            VCMetadata.fromVcMetadataString(vcData.vcMetadata).getVcKey()
          ],
        );
        if (!selectedVcsData[inputDescriptorId]) {
          selectedVcsData[inputDescriptorId] = {};
        }
        if (!selectedVcsData[inputDescriptorId][credentialFormat]) {
          selectedVcsData[inputDescriptorId][credentialFormat] = [];
        }
        selectedVcsData[inputDescriptorId][credentialFormat].push(credential);
      });
    });
    return selectedVcsData;
  }

  private extractCredential(
    vcData: VC,
    credentialFormat: string,
    selectedDisclosures: any,
  ) {
    if (
      credentialFormat === VCFormat.mso_mdoc ||
      credentialFormat === VCFormat.ldp_vc
    ) {
      return vcData.verifiableCredential.credential;
    }
    if (
      credentialFormat === VCFormat.vc_sd_jwt ||
      credentialFormat === VCFormat.dc_sd_jwt
    ) {
      return this.processSdJwtVcForSharing(vcData, selectedDisclosures);
    }
  }

  private processSdJwtVcForSharing(
    vcData: VC,
    selectedDisclosures: string[],
  ): string {
    if (!vcData?.verifiableCredential?.credential) {
      throw new Error('Invalid VC: missing credential');
    }

    const compact = vcData.verifiableCredential.credential;
    const [jwt] = compact.split('~');

    const pathToDisclosures: Record<string, string[]> =
      vcData.verifiableCredential?.processedCredential.pathToDisclosures || {};

    const disclosureSet = new Set<string>();
    selectedDisclosures?.forEach(path => {
      const disclosures = pathToDisclosures[path];
      if (disclosures) {
        disclosures.forEach(d => disclosureSet.add(d));
      }
    });

    const finalSdJwt =
      disclosureSet.size > 0
        ? [jwt, ...disclosureSet].join('~') + '~'
        : jwt + '~';

    return finalSdJwt;
  }
}

export default OpenID4VP;

function decodeDidJwk(didJwk: string) {
  const encoded = didJwk.replace('did:jwk:', '').split('#')[0];
  const json = Buffer.from(encoded, 'base64').toString('utf-8');
  return JSON.parse(json);
}

function getVcsMatchingAuthRequest(
  vpRequest: object,
  availableWalletCredentials: VC[],
) {
  const vcs = availableWalletCredentials;
  const matchingVCs: Record<string, any[]> = {};
  const requestedClaimsByVerifier = new Set<string>();
  const presentationDefinition = vpRequest['presentation_definition'];
  if (presentationDefinition) {
    const inputDescriptors = presentationDefinition['input_descriptors'];
    let hasFormatOrConstraints = false;

    vcs.forEach(vc => {
      inputDescriptors.forEach(inputDescriptor => {
        const format = inputDescriptor.format ?? presentationDefinition.format;
        hasFormatOrConstraints =
          hasFormatOrConstraints ||
          format !== undefined ||
          inputDescriptor.constraints.fields !== undefined;

        const areMatchingFormatAndProofType =
          areVCFormatAndProofTypeMatchingRequest(format, vc);
        if (areMatchingFormatAndProofType == false) {
          inputDescriptors.forEach(inputDescriptor => {
            if (inputDescriptor.constraints?.fields) {
              inputDescriptor.constraints.fields.forEach(field => {
                if (field.path) {
                  field.path.forEach(path => {
                    try {
                      const pathArray = JSONPath.toPathArray(path);
                      const claimName = pathArray[pathArray.length - 1];
                      requestedClaimsByVerifier.add(claimName);
                    } catch (error) {
                      console.error('Error parsing path:', path, error);
                    }
                  });
                }
              });
            }
          });
          return;
        }
        const isMatchingConstraints = isVCMatchingRequestConstraints(
          inputDescriptor.constraints,
          vc,
          requestedClaimsByVerifier,
        );

        let shouldInclude: boolean;
        if (inputDescriptor.constraints.fields && format) {
          shouldInclude =
            isMatchingConstraints && areMatchingFormatAndProofType;
        } else {
          shouldInclude =
            isMatchingConstraints || areMatchingFormatAndProofType;
        }

        if (shouldInclude) {
          if (!matchingVCs[inputDescriptor.id]) {
            matchingVCs[inputDescriptor.id] = [];
          }
          matchingVCs[inputDescriptor.id].push(vc);
        }
      });
    });

    if (!hasFormatOrConstraints && inputDescriptors.length > 0) {
      matchingVCs[inputDescriptors[0].id] = vcs;
    }

    if (Object.keys(matchingVCs).length === 0) {
      // Error is only sent when there are no VCs matching the request
      void OpenID4VP.sendErrorToVerifier(
        OVP_ERROR_MESSAGES.NO_MATCHING_VCS,
        OVP_ERROR_CODE.NO_MATCHING_VCS,
      );
    }

    return {
      matchingVCs,
      requestedClaims: Array.from(requestedClaimsByVerifier).join(','),
      purpose: presentationDefinition.purpose ?? '',
    };
  } else {
    // DCQL query
    OpenID4VP.getMatchingCredentials(context.authenticationResponse, vcs)
      .then((result: any) => {
        console.log('result from getMatchingCredentials API call: ', result);
      })
      .catch(error => {
        console.error('Error fetching matching credentials for DCQL:', error);
      });

    return {
      matchingVCs: {mvrc: vcs},
      requestedClaims: '',
      purpose: '',
    };
  }
}

function areVCFormatAndProofTypeMatchingRequest(
  requestFormat: Record<string, any> | undefined,
  vc: any,
): boolean {
  if (!requestFormat) {
    return false;
  }
  const vcFormatType = vc.format;
  if (vcFormatType === VCFormat.ldp_vc) {
    const vcProofType = vc?.verifiableCredential?.credential?.proof?.type;
    return Object.entries(requestFormat).some(
      ([type, value]) =>
        type === vcFormatType && value.proof_type.includes(vcProofType),
    );
  }

  if (vcFormatType === VCFormat.mso_mdoc) {
    try {
      const issuerAuth =
        vc.verifiableCredential.processedCredential.issuerSigned?.issuerAuth ??
        vc.verifiableCredential.processedCredential.issuerAuth;
      const issuerAuthenticationAlgorithm =
        getIssuerAuthenticationAlorithmForMdocVC(issuerAuth[0]['1']);
      const mdocAuthenticationAlgorithm = getMdocAuthenticationAlorithm(
        issuerAuth[2],
      );

      return Object.entries(requestFormat).some(
        ([type, value]) =>
          type === vcFormatType &&
          value.alg.includes(issuerAuthenticationAlgorithm) &&
          value.alg.includes(mdocAuthenticationAlgorithm),
      );
    } catch (error) {
      console.error('Error in processing mdoc VC format:', error);
      return false;
    }
  }

  if (
    vcFormatType === VCFormat.dc_sd_jwt ||
    vcFormatType === VCFormat.vc_sd_jwt
  ) {
    try {
      const sdJwt = vc.verifiableCredential?.credential;
      const alg = extractAlgFromSdJwt(sdJwt);

      return Object.entries(requestFormat).some(
        ([type, value]) =>
          type === vcFormatType && value['sd-jwt_alg_values']?.includes(alg),
      );
    } catch (e) {
      console.error('Error processing SD-JWT alg match:', e);
      return false;
    }
  }

  return false;
}

function isVCMatchingRequestConstraints(
  constraints: any,
  credential: any,
  requestedClaimsByVerifier: Set<string>,
): boolean {
  if (!constraints.fields) {
    return false;
  }
  return constraints.fields.every(field => {
    return field.path.some(path => {
      const pathArray = JSONPath.toPathArray(path);
      const claimName = pathArray[pathArray.length - 1];
      requestedClaimsByVerifier.add(claimName);
      const processedCredential = fetchCredentialBasedOnFormat(credential);
      const jsonPathMatches = JSONPath({
        path: path,
        json: processedCredential,
      });
      if (!jsonPathMatches || jsonPathMatches.length === 0) {
        return false;
      }
      return jsonPathMatches.some(match => {
        if (!field.filter) {
          return true;
        }
        return (
          field.filter.type === undefined || field.filter.type === typeof match
        );
      });
    });
  });
}

function extractAlgFromSdJwt(sdJwtCompact: string): string {
  const parts = sdJwtCompact.trim().split('~');
  const jwt = parts[0];

  const jwtParts = jwt.split('.');
  if (jwtParts.length < 3) {
    throw new Error('Invalid SD-JWT format');
  }

  const headerJson = JSON.parse(base64UrlDecode(jwtParts[0]));
  if (!headerJson.alg) {
    throw new Error('Missing alg in SD-JWT header');
  }
  return headerJson.alg;
}

function base64UrlDecode(input: string): string {
  input = input.replace(/-/g, '+').replace(/_/g, '/');
  while (input.length % 4) {
    input += '=';
  }
  return Buffer.from(input, 'base64').toString('utf8');
}

function fetchCredentialBasedOnFormat(vc: any) {
  const format = vc.format;
  let credential;
  switch (format.toString()) {
    case VCFormat.ldp_vc: {
      credential = vc.verifiableCredential.credential;
      break;
    }
    case VCFormat.mso_mdoc: {
      credential = getProcessedDataForMdoc(
        vc.verifiableCredential.processedCredential,
      );
      break;
    }
    case VCFormat.vc_sd_jwt:
    case VCFormat.dc_sd_jwt: {
      credential =
        vc.verifiableCredential.processedCredential.fullResolvedPayload;
      break;
    }
  }
  return credential;
}

function getProcessedDataForMdoc(processedCredential: any) {
  const namespaces =
    processedCredential.issuerSigned?.nameSpaces ??
    processedCredential.nameSpaces;
  const processedData = {...namespaces};
  for (const ns in processedData) {
    const elementsArray = processedData[ns];
    const asObject: Record<string, any> = {};
    elementsArray.forEach((item: any) => {
      asObject[item.elementIdentifier] = item.elementValue;
    });
    processedData[ns] = asObject;
  }
  return processedData;
}
