import Foundation

public struct CredentialsVerifier {

    public init() {}

    public func getCredentialStatus(credential: String, format: StatusCheckCredentialFormat, statusPurposeList: [String] = []) async throws-> [CredentialStatusResult] {
        do {
            let verifier = CredentialVerifierFactory().get(format: format)
            let credentialStatusArray = try await verifier.checkStatus(credential: credential, statusPurposes: statusPurposeList)
            return credentialStatusArray ?? []
        } catch{
            throw error
        }
    }
}
