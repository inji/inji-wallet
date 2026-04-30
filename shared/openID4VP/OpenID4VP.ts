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
import {parseJSON} from '../Utils';
import {VCFormat} from '../VCFormat';
import {VCMetadata} from '../VCMetadata';

export const OpenID4VP_Proof_Sign_Algo = 'EdDSA';
const emitter = new NativeEventEmitter(NativeModules.InjiOpenID4VP);

class OpenID4VP {
  private static instance: OpenID4VP;
  private InjiOpenID4VP = NativeModules.InjiOpenID4VP;

  private constructor(walletMetadata: any) {
    const jsonLdCanonicalListener = emitter.addListener(
      'onJsonLdCanonicalize',
      ({data}: {data: string}) => {
        jsonLdCanonicalize(data)
          .then(result => {
            console.log('Canonicalization result sent to native: ', result);
            this.InjiOpenID4VP.sendJsonLdCanonicalizeResultFromJS(result);
          })
          .catch(error => {
            //TODO: abort the canonicalizer and notify native about the failure so that it can handle the error gracefully
            console.error('Error during JSON-LD canonicalization: ', error);
          });
      },
    );
    this.InjiOpenID4VP.initSdk(__AppId.getValue(), walletMetadata);
  }

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

  static async prepareCredentialsForVPSharing(
    selectedVCs: Record<string, VC[]>,
    selectedDisclosuresByVc: any,
  ) {
    const openID4VP = await OpenID4VP.getInstance();

    return openID4VP.processSelectedVCs(selectedVCs, selectedDisclosuresByVc);
  }

  static async constructUnsignedVPToken(
    vpRequest: any,
    selectedVCs: Record<string, VC[]>,
    selectedDisclosuresByVc: any,
    holderId: string,
    signatureAlgorithm: string,
  ) {
    const openID4VP = await OpenID4VP.getInstance();

    console.debug(
      'Constructing unsigned VP token with the following parameters:',
    );
    console.debug(
      'Has presentation_definition: ',
      vpRequest.hasOwnProperty('presentation_definition'),
    );

    if (vpRequest.hasOwnProperty('presentation_definition')) {
      const updatedSelectedVCs = openID4VP.processSelectedVCs(
        selectedVCs,
        selectedDisclosuresByVc,
      );
      const unSignedVpTokens =
        await openID4VP.InjiOpenID4VP.constructUnsignedVPToken(
          updatedSelectedVCs,
          holderId,
          signatureAlgorithm,
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
          const newVar = {
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
          console.debug('Credential prepared for VP sharing: ', newVar);
          return newVar;
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
