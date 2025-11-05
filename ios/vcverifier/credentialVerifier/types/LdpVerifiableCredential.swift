import Foundation

struct LdpVerifiableCredential: VerifiableCredential {
    func checkStatus(credential: String, statusPurposes: [String]?) async throws-> [CredentialStatusResult]? {
        try await LdpStatusChecker().getStatuses(credential: credential)
    }
}

