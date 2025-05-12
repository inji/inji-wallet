import {NativeModules} from 'react-native';
import {__AppId} from '../GlobalVariables';
import {
  SelectedCredentialsForVPSharing,
  VC,
} from '../../machines/VerifiableCredential/VCMetaMachine/vc';
import {getJWT} from '../cryptoutil/cryptoUtil';
import {getJWK} from '../openId4VCI/Utils';
import getAllConfigurations from '../api';
import {parseJSON} from '../Utils';
import {walletMetadata} from './walletMetadata';
import {VCFormat} from '../VCFormat';

export const OpenID4VP_Key_Ref = 'OpenID4VP_KeyPair';
export const OpenID4VP_Proof_Sign_Algo_Suite = 'Ed25519Signature2020';
export const OpenID4VP_Domain = 'OpenID4VP';
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

  static async constructUnsignedVPToken(selectedVCs: Record<string, VC[]>) {
    let updatedSelectedVCs = this.stringifyValues(
      this.processSelectedVCs(selectedVCs),
    );

    const unSignedVpTokens =
      await OpenID4VP.InjiOpenID4VP.constructUnsignedVPToken(
        updatedSelectedVCs,
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

  private static stringifyValues = (
    data: Record<string, Record<string, Array<any>>>,
  ): Record<string, Record<string, string[]>> => {
    const result = {};
    for (const [outerKey, innerObject] of Object.entries(data)) {
      result[outerKey] = {};
      for (const [innerKey, array] of Object.entries(innerObject)) {
        if (innerKey === VCFormat.ldp_vc.valueOf())
          result[outerKey][innerKey] = array.map(item => JSON.stringify(item));
        else result[outerKey][innerKey] = array;
      }
    }
    return result;
  };

  private static processSelectedVCs(selectedVCs: Record<string, VC[]>) {
    const selectedVcsData: SelectedCredentialsForVPSharing = {};
    Object.entries(selectedVCs).forEach(([inputDescriptorId, vcsArray]) => {
      vcsArray.forEach(vcData => {
        const credentialFormat = vcData.vcMetadata.format;
        //TODO: this should be done irrespective of the format.
        if (credentialFormat === VCFormat.mso_mdoc.valueOf()) {
          vcData = vcData.verifiableCredential.credential;
        }
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

export async function constructProofJWT(
  publicKey: any,
  privateKey: any,
  vpToken: Object,
  keyType: string,
): Promise<string> {
  const jwtHeader = {
    alg: OpenID4VP_Proof_Sign_Algo,
    jwk: await getJWK(publicKey, keyType),
  };

  const jwtPayload = createJwtPayload(vpToken);

  return await getJWT(
    jwtHeader,
    jwtPayload,
    OpenID4VP_Key_Ref,
    privateKey,
    keyType,
  );
}

function createJwtPayload(vpToken: {[key: string]: any}) {
  const {'@context': context, type, verifiableCredential, id, holder} = vpToken;
  return {
    '@context': context,
    type,
    verifiableCredential,
    id,
    holder,
  };
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
