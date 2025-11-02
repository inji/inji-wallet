import Foundation

struct CredentialVerifierFactory {
    func get(format: StatusCheckCredentialFormat) -> VerifiableCredential {
        switch format {
        case .ldpVc:
            return LdpVerifiableCredential()
        }
    }
}
