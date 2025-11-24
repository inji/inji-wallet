import {NativeModules} from 'react-native';

export type CredentialStatusResult = {
  purpose: string;
  isValid: boolean;
  error?: ErrorResult;
  statusListVC?: string; // Available only in iOS
};

export type ErrorResult = {
  code: string;
  message: string;
}

export type VerificationSummaryResult = {
  verificationStatus: boolean;
  verificationMessage: string;
  verificationErrorCode: string;
  credentialStatus: CredentialStatusResult[];
};

class VCVerifier {
  private static instance: VCVerifier;
  private vcVerifier;

  private constructor() {
    this.vcVerifier = NativeModules.VCVerifierModule;
  }

  static getInstance(): VCVerifier {
    if (!VCVerifier.instance) {
      VCVerifier.instance = new VCVerifier();
    }
    return VCVerifier.instance;
  }

  async getCredentialStatus(
    credential: any,
    format: string,
  ): Promise<CredentialStatusResult[]> {
    try {
      const result: CredentialStatusResult[] =
        await this.vcVerifier.getCredentialStatus(
          JSON.stringify(credential),
          format,
        );
      return result;
    } catch (error) {
      throw new Error(`Failed to get credential status: ${error}`);
    }
  }

  async getVerificationSummary(
    credentialString: string,
    credentialFormat: string,
  ): Promise<VerificationSummaryResult> {
    try {
      const result = await this.vcVerifier.getVerificationSummary(
        credentialString,
        credentialFormat,
        [],
      );
      return result;
    } catch (error) {
      throw new Error(`Failed to get verification summary: ${error}`);
    }
  }
}
export default VCVerifier;
