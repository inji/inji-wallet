import {NativeEventEmitter, NativeModules} from 'react-native';
import {__AppId} from '../GlobalVariables';
import {SelectedCredentialForVPSharing, VC,} from '../../machines/VerifiableCredential/VCMetaMachine/vc';
import {getWalletConfig, isDcqlFlow, jsonLdCanonicalize,} from './OpenID4VPHelper';
import {jsonLdExpand, parseJSON} from '../Utils';
import {VCFormat} from '../VCFormat';
import {getVcKey, VCMetadata} from '../VCMetadata';
import {JSONPath} from 'jsonpath-plus';
import {
  getIssuerAuthenticationAlgorithmForMdocVC,
  getMdocAuthenticationAlgorithm,
} from '../../components/VC/common/VCUtils';
import {isIOS} from '../constants';
import {CACHED_API} from '../api';
import {getDisclosuresForPath} from '../claimsPathMatching';
import {
  CredentialSetOption,
  MatchingVcsResult,
  MatchingVCsResultForDcql,
  MatchingVCsResultForPresentationExchangeRequest,
  MatchResult,
  VCInfo,
  VcWithMatchedClaims,
} from './openid4vp.types';

const emitter = new NativeEventEmitter(NativeModules.InjiOpenID4VP);

class OpenID4VP {
  private static instance: OpenID4VP;
  private InjiOpenID4VP = NativeModules.InjiOpenID4VP;

  private constructor(walletConfig: Record<string, any>) {
    if (isIOS()) {
      this.addJsonLdCanonicalizerCallback();
    }

    this.InjiOpenID4VP.initSdk(__AppId.getValue(), walletConfig)
  }

  private addJsonLdCanonicalizerCallback = () => {
    emitter.addListener('onJsonLdCanonicalize', ({data}: { data: string }) => {
      jsonLdCanonicalize(data)
        .then(result => {
          this.InjiOpenID4VP.sendJsonLdCanonicalizeResultFromJS(result);
        })
        .catch(error => {
          console.error("Error during canonicaliozation ", error)
          this.InjiOpenID4VP.notifyCanonicalizationFailureFromJS(
            'server_error',
            'An error occurred during JSON-LD canonicalization',
          );
        });
    });
  };

  private addJsonLdExpanderCallback = () => {
    emitter.addListener('onJsonLdExpand', ({data}: { data: any }) => {
      jsonLdExpand(data)
        .then(result => {
          this.InjiOpenID4VP.sendJsonLdExpandResultFromJS(result);
        })
        .catch(error => {
          console.error('Error during JSON-LD expansion: ', error);
          this.InjiOpenID4VP.notifyJsonLdExpansionFailureFromJS(
            'server_error',
            'An error occurred during JSON-LD canonicalization',
          );
        });
    });
  };

  private static async getInstance(): Promise<OpenID4VP> {
    if (!OpenID4VP.instance) {
      const walletConfig: Record<string, any> = await getWalletConfig()
      OpenID4VP.instance = new OpenID4VP(walletConfig);
    }

    return OpenID4VP.instance;
  }

  static async authenticateVerifier(urlEncodedAuthorizationRequest: string) {
    const openID4VP = await OpenID4VP.getInstance();

    const authenticationResponse =
      await openID4VP.InjiOpenID4VP.authenticateVerifier(
        urlEncodedAuthorizationRequest,
      );
    return JSON.parse(authenticationResponse);
  }

  static async getMatchingCredentials(
    vpRequest: object,
    availableWalletCredentials: VC[],
  ): Promise<MatchingVcsResult> {
    const presentationDefinition = vpRequest['presentation_definition'];
    if (presentationDefinition) {
      const result = getVcsMatchingPresentationExchangeAuthRequest(
        vpRequest,
        availableWalletCredentials,
      );
      return {
        matchingVCs: result.matchingVCs,
        requestedClaims: result.requestedClaims,
        purpose: result.purpose,
        success: result.success,
      } as MatchingVCsResultForPresentationExchangeRequest;
    } else {
      const openID4VP = await OpenID4VP.getInstance();
      if (isIOS()) {
        openID4VP.addJsonLdExpanderCallback();
      }

      const idToCredentialMap: Record<string, VC> = {};
      availableWalletCredentials.forEach(vc => {
        idToCredentialMap[vc.vcMetadata.id] = vc;
      });

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

      const matchingCredentialsResult =
        await openID4VP.InjiOpenID4VP.getMatchingCredentials(
          vpRequest,
          updatedAvailableWalletCredentials,
        );

      const result = parseJSON(matchingCredentialsResult);
      const requestedClaims: Set<string> = new Set<string>();
      const filteredCredentialSetOptions = result.success ? filterSatisfiableCredentialSetOptions(
        result.queryMatches ?? {},
        result.credentialSets ?? [],
      ) : result.credentialSets;

      const updatedMatchingVCs: Record<string, MatchResult> = {};
      Object.entries(result.queryMatches ?? {}).forEach(
        ([queryId, queryMatch]: [string, any]) => {
          if (queryMatch && Array.isArray(queryMatch.matchingCredentials)) {
            updatedMatchingVCs[queryId] = {
              matchingVcs: queryMatch.matchingCredentials.map(
                (matchedCredential: any) => {
                  const credentialData = idToCredentialMap[matchedCredential.credentialId];
                  return {
                    matchingVcInfo: new VCInfo(
                      getVcKey(credentialData),
                      credentialData.vcMetadata,
                    ),
                    matchedClaims: matchedCredential.matchingClaims,
                  } as VcWithMatchedClaims;
                },
              ),
              allowMultipleCredentials:
                queryMatch.allowMultipleCredentials === true,
            };
          } else if (queryMatch.failedClaims) {
            console.warn("Failed claims - ", JSON.stringify(queryMatch.failedClaims, null, 2));
            (queryMatch.failedClaims as any[]).forEach(failedClaim => {
              requestedClaims.add(getClaimName(failedClaim.claim.path));
            });
          }
        },
      );

      return {
        matchingVCs: updatedMatchingVCs,
        success: result.success,
        requestedClaims,
        purpose: '',
        credentialSetOptions: filteredCredentialSetOptions,
      } as MatchingVCsResultForDcql;
    }
  }

  static async prepareCredentialsForVPSharing(
    vpRequest: object,
    selectedVCs: Record<string, VC[]>,
    selectedDisclosuresByVc: any,
  ) {
    return this.processSelectedVCs(vpRequest, selectedVCs, selectedDisclosuresByVc);
  }

  static async constructUnsignedVPToken(
    vpRequest: object,
    selectedVCs: Record<string, VC[]>,
    selectedDisclosuresByVc: any,
  ) {
    const openID4VP = await OpenID4VP.getInstance();
    const unSignedVpTokens =
      await openID4VP.InjiOpenID4VP.constructUnsignedVPToken(
        this.processSelectedVCs(vpRequest, selectedVCs, selectedDisclosuresByVc),
      );
    return parseJSON(unSignedVpTokens);
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

  private static processSelectedVCs(vpRequest: object, selectedVCs: Record<string, VC[]>, selectedDisclosuresByVc: Record<string, Array<string>>) {
    const updatedSelectedVCs: Record<
      string,
      Array<SelectedCredentialForVPSharing>
    > = {};
    const isDcqlRequestFlow = isDcqlFlow(vpRequest);
    Object.entries(selectedVCs).forEach(([credentialRequestId, vcsArray]) => {
      updatedSelectedVCs[credentialRequestId] = vcsArray.map(credential => {
        const credentialFormat = credential.vcMetadata.format;
        return {
          format: credentialFormat,
          credentialId: credential.vcMetadata.id,
          credential: this.extractCredential(
            credential,
            credentialFormat,
            selectedDisclosuresByVc[
              VCMetadata.fromVcMetadataString(credential.vcMetadata).getVcKey()
              ],
            isDcqlRequestFlow,
          ),
        };
      });
    });
    return updatedSelectedVCs;
  }

  private static extractCredential(
    vcData: VC,
    credentialFormat: string,
    selectedDisclosures: any,
    isDcqlRequestFlow = true,
  ) {
    if (
      credentialFormat === VCFormat.mso_mdoc ||
      credentialFormat === VCFormat.ldp_vc
    ) {
      return vcData.verifiableCredential.credential;
    }
    const isSelectivelyDisclosableCredential =
      credentialFormat === VCFormat.vc_sd_jwt ||
      credentialFormat === VCFormat.dc_sd_jwt;
    if (isSelectivelyDisclosableCredential && isDcqlRequestFlow) {
      return this.processSdJwtVcForSharing(vcData, selectedDisclosures);
    } else if (isSelectivelyDisclosableCredential) {
      return this.processSdJwtVcForSharingWithSdClaimsOnly(
        vcData,
        selectedDisclosures,
      );
    }
  }

  private static processSdJwtVcForSharingWithSdClaimsOnly(
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

    return disclosureSet.size > 0
      ? [jwt, ...disclosureSet].join('~') + '~'
      : jwt + '~';
  }

  private static processSdJwtVcForSharing(vcData: VC, claimsPath: string[]): string {
    if (!vcData?.verifiableCredential?.credential) {
      throw new Error('Invalid VC: missing credential');
    }

    const compact = vcData.verifiableCredential.credential;
    const [jwt] = compact.split('~');

    const pathToDisclosures: Record<string, string[]> =
      vcData.verifiableCredential?.processedCredential.pathToDisclosures || {};

    const disclosureSet = new Set<string>();
    claimsPath?.forEach(path => {
      const disclosures = getDisclosuresForPath(pathToDisclosures, path);
      if (disclosures) {
        disclosures.forEach(d => disclosureSet.add(d));
      }
    });

    return disclosureSet.size > 0
      ? [jwt, ...disclosureSet].join('~') + '~'
      : jwt + '~';
  }
}

export default OpenID4VP;

function decodeDidJwk(didJwk: string) {
  const encoded = didJwk.replace('did:jwk:', '').split('#')[0];
  const json = Buffer.from(encoded, 'base64').toString('utf-8');
  return JSON.parse(json);
}

function getVcsMatchingPresentationExchangeAuthRequest(
  vpRequest: object,
  availableWalletCredentials: VC[],
): MatchingVCsResultForPresentationExchangeRequest {
  const vcs = availableWalletCredentials;
  const matchingVCs: Record<string, VCInfo[]> = {};
  const requestedClaimsByVerifier = new Set<string>();

  const presentationDefinition = vpRequest['presentation_definition'];

  const inputDescriptors = presentationDefinition['input_descriptors'];
  let hasFormatOrConstraints = false;

  vcs.forEach(vc => {
    inputDescriptors.forEach(
      (inputDescriptor: {
        format: any;
        constraints: { fields: undefined };
        id: string | number;
      }) => {
        const format = inputDescriptor.format ?? presentationDefinition.format;
        hasFormatOrConstraints =
          hasFormatOrConstraints ||
          format !== undefined ||
          inputDescriptor.constraints.fields !== undefined;

        const areMatchingFormatAndProofType =
          areVCFormatAndProofTypeMatchingRequest(format, vc);
        if (areMatchingFormatAndProofType == false) {
          inputDescriptors.forEach(
            (inputDescriptor: { constraints: { fields: { path: any[] }[] } }) => {
              if (inputDescriptor.constraints?.fields) {
                inputDescriptor.constraints.fields.forEach(
                  (field: { path: any[] }) => {
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
                  },
                );
              }
            },
          );
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
          matchingVCs[inputDescriptor.id].push(new VCInfo(getVcKey(vc), vc.vcMetadata));
        }
      },
    );
  });

  if (!hasFormatOrConstraints && inputDescriptors.length > 0) {
    matchingVCs[inputDescriptors[0].id] = vcs.map(vc => new VCInfo(getVcKey(vc), vc.vcMetadata));
  }

  const success =
    Object.keys(matchingVCs).length > 0 &&
    Object.values(matchingVCs).every(
      value => Array.isArray(value) && value.length > 0,
    );

  return {
    success,
    matchingVCs,
    requestedClaims: requestedClaimsByVerifier,
    purpose: presentationDefinition.purpose ?? '',
  };
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
        getIssuerAuthenticationAlgorithmForMdocVC(issuerAuth[0]['1']);
      const mdocAuthenticationAlgorithm = getMdocAuthenticationAlgorithm(
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

function getClaimName(claimPath: Array<string | number | null>): string {
  return (
    claimPath.findLast(
      (segment): segment is string => typeof segment === 'string',
    ) ?? ''
  );
}

function filterSatisfiableCredentialSetOptions(
  queryMatches: Record<string, any>,
  credentialSetOptions: CredentialSetOption[],
): CredentialSetOption[] {
  return credentialSetOptions
    .map(credentialSet => ({
      ...credentialSet,
      options: credentialSet.options.filter(option =>
        option.every(queryId => {
          const matchingResult = queryMatches[queryId];
          return (
            matchingResult &&
            Array.isArray(matchingResult.matchingCredentials) &&
            matchingResult.matchingCredentials.length > 0
          );
        }),
      ),
    }))
    .filter(credentialSet => credentialSet.options.length > 0);
}

