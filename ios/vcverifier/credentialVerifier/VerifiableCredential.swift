import Foundation

protocol VerifiableCredential {
  func checkStatus(credential: String, statusPurposes: [String]?) async throws-> [String: CredentialStatusResult]
}
