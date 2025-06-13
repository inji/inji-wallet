import {NativeModules} from 'react-native';
import {__AppId} from '../GlobalVariables';
import {
  SelectedCredentialsForVPSharing,
  VC,
} from '../../machines/VerifiableCredential/VCMetaMachine/vc';
import {createSignatureED, encodeB64} from '../cryptoutil/cryptoUtil';
import getAllConfigurations from '../api';
import {base64ToByteArray, parseJSON} from '../Utils';
import {walletMetadata} from './walletMetadata';

export const OpenID4VP_Proof_Sign_Algo = 'EdDSA';

export class OpenID4VP {
  static InjiOpenID4VP = NativeModules.InjiOpenID4VP;

  static initialize() {
    OpenID4VP.InjiOpenID4VP.init(__AppId.getValue());
  }

  static async authenticateVerifier(
    urlEncodedAuthorizationRequest: string,
    trustedVerifiersList: any,
  ) {
    const shouldValidateClient = await isClientValidationRequired();
    const metadata = (await getWalletMetadata()) || walletMetadata;

    const authenticationResponse =
      await OpenID4VP.InjiOpenID4VP.authenticateVerifier(
        urlEncodedAuthorizationRequest,
        trustedVerifiersList,
        metadata,
        shouldValidateClient,
      );
    return JSON.parse(authenticationResponse);
  }

  static async constructUnsignedVPToken(
    selectedVCs: Record<string, VC[]>,
    holderId,
    signatureAlgorithm,
  ) {
    let updatedSelectedVCs = this.processSelectedVCs(selectedVCs);

    const unSignedVpTokens =
      await OpenID4VP.InjiOpenID4VP.constructUnsignedVPToken(
        updatedSelectedVCs,
        holderId,
        signatureAlgorithm,
      );
    return parseJSON(unSignedVpTokens);
  }

  static async shareVerifiablePresentation(
    vpTokenSigningResultMap: Record<string, any>,
  ) {
    return await OpenID4VP.InjiOpenID4VP.shareVerifiablePresentation(
      vpTokenSigningResultMap,
    );
  }

  static sendErrorToVerifier(error: string) {
    OpenID4VP.InjiOpenID4VP.sendErrorToVerifier(error);
  }

  private static processSelectedVCs(selectedVCs: Record<string, VC[]>) {
    const selectedVcsData: SelectedCredentialsForVPSharing = {};
    Object.entries(selectedVCs).forEach(([inputDescriptorId, vcsArray]) => {
      vcsArray.forEach(vcData => {
        const credentialFormat = vcData.vcMetadata.format;
        vcData = vcData.verifiableCredential.credential;
        if (!selectedVcsData[inputDescriptorId]) {
          selectedVcsData[inputDescriptorId] = {};
        }
        if (!selectedVcsData[inputDescriptorId][credentialFormat]) {
          selectedVcsData[inputDescriptorId][credentialFormat] = [];
        }
        selectedVcsData[inputDescriptorId][credentialFormat].push(vcData);
      });
    });
    return selectedVcsData;
  }
}

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