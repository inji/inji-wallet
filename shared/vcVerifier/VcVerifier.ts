import {NativeModules} from 'react-native';

export type CredentialStatusResult = {
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
  credentialStatus: Record<string, CredentialStatusResult>;
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
  ): Promise<Record<string, CredentialStatusResult>> {
    try {
      return await this.vcVerifier.getCredentialStatus(
          JSON.stringify(credential),
          format,
      );
    } catch (error) {
      throw new Error(`Failed to get credential status: ${error}`);
    }
  }

  async getVerificationSummary(
    credentialString: string,
    credentialFormat: string,
  ): Promise<VerificationSummaryResult> {
    try {
      return await this.vcVerifier.getVerificationSummary(
          credentialString,
          credentialFormat,
          [],
      );
    } catch (error) {
      throw new Error(`Failed to get verification summary: ${error}`);
    }
  }
}
export default VCVerifier;
