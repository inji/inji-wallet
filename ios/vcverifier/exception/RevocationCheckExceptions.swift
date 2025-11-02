import Foundation

enum RevocationCheckException: Error, LocalizedError {
    case invalidCredentialJSON
    case missingStatusListCredential
    case invalidStatusListIndex
    case invalidStatusListContent
    case failed(String)

    var errorDescription: String? {
        switch self {
        case .invalidCredentialJSON:
            return "Invalid or malformed credential JSON."
        case .missingStatusListCredential:
            return "Missing 'statusListCredential' field in credentialStatus."
        case .invalidStatusListIndex:
            return "Invalid or missing 'statusListIndex' in credentialStatus."
        case .invalidStatusListContent:
            return "Missing or malformed 'credentialSubject.encodedList' in the status list VC."
        case .failed(let message):
            return "Failed to check revocation: \(message)"
        }
    }
}
