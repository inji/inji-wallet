import Foundation

public struct CredentialsVerifier {

    public init() {}

  public func getCredentialStatus(credential: String, format: StatusCheckCredentialFormat, statusPurposeList: [String] = []) async throws-> [String: CredentialStatusResult] {
        do {
            let verifier = CredentialVerifierFactory().get(format: format)
            let credentialStatuses = try await verifier.checkStatus(credential: credential, statusPurposes: statusPurposeList)
          return credentialStatuses ?? [:]
        } catch{
            throw error
        }
    }
}
