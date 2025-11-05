import Foundation

enum NetworkManagerClientException: Error, LocalizedError {
    case timeout
    case failed(String)

    var errorDescription: String? {
        switch self {
        case .timeout:
            return "Connection timed out"
        case .failed(let message):
            return "Network request failed with error response - \(message)"
        }
    }
}
