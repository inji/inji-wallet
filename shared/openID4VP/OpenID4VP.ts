import {NativeModules} from 'react-native';
import {__AppId} from '../GlobalVariables';
import {
  SelectedCredentialsForVPSharing,
  VC,
} from '../../machines/VerifiableCredential/VCMetaMachine/vc';
import {fallbackWalletMetadata} from './fallbackWalletMetadata';
import {getWalletMetadata, isClientValidationRequired} from './OpenID4VPHelper';
import {parseJSON} from '../Utils';

export const OpenID4VP_Proof_Sign_Algo = 'EdDSA';

class OpenID4VP {
  private static instance: OpenID4VP;
  private InjiOpenID4VP = NativeModules.InjiOpenID4VP;

  private constructor(walletMetadata: any) {
    this.InjiOpenID4VP.initSdk(__AppId.getValue(), walletMetadata);
  }

  private static async getInstance(): Promise<OpenID4VP> {
    if (!OpenID4VP.instance) {
      const walletMetadata =
        (await getWalletMetadata()) || fallbackWalletMetadata;
      OpenID4VP.instance = new OpenID4VP(walletMetadata);
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

  static async constructUnsignedVPToken(
    selectedVCs: Record<string, VC[]>,
    holderId: string,
    signatureAlgorithm: string,
  ) {
    const openID4VP = await OpenID4VP.getInstance();

    const updatedSelectedVCs = openID4VP.processSelectedVCs(selectedVCs);
    const unSignedVpTokens =
      await openID4VP.InjiOpenID4VP.constructUnsignedVPToken(
        updatedSelectedVCs,
        holderId,
        signatureAlgorithm,
      );
    return parseJSON(unSignedVpTokens);
  }

  static async shareVerifiablePresentation(
    vpTokenSigningResultMap: Record<string, any>,
  ) {
    const openID4VP = await OpenID4VP.getInstance();

    return await openID4VP.InjiOpenID4VP.shareVerifiablePresentation(
      vpTokenSigningResultMap,
    );
  }

  static sendErrorToVerifier(errorMessage: string, errorCode: string) {
    OpenID4VP.getInstance().then(openID4VP => {
      openID4VP.InjiOpenID4VP.sendErrorToVerifier(errorMessage, errorCode);
    });
  }

  private processSelectedVCs(selectedVCs: Record<string, VC[]>) {
    const selectedVcsData: SelectedCredentialsForVPSharing = {};
    Object.entries(selectedVCs).forEach(([inputDescriptorId, vcsArray]) => {
      vcsArray.forEach(vcData => {
        const credentialFormat = vcData.vcMetadata.format;
        const credential = vcData.verifiableCredential.credential;
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
}

export default OpenID4VP;
