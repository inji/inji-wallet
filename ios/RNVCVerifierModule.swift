import Foundation
import React

@objc(VCVerifierModule)
class VCVerifierModule: NSObject, RCTBridgeModule {

    static func moduleName() -> String {
        return "VCVerifier"
    }

    static func requiresMainQueueSetup() -> Bool {
        return false
    }

    @objc
    func getCredentialStatus(
        _ credential: String,
        format: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        Task {
            do {
                guard let credentialFormat = StatusCheckCredentialFormat(rawValue: format) else {
                    reject("INVALID_FORMAT", "Unsupported credential format: \(format)", nil)
                    return
                }

                let verifier = CredentialsVerifier()
                let results = try await verifier.getCredentialStatus(credential: credential, format: credentialFormat)

                var response: [String: Any] = [:]
                for (purpose, credentialStatusResult) in results {
                  let error : [String: Any]? = credentialStatusResult.error != nil ? [
                        "code": credentialStatusResult.error?.errorCode ?? "UNKNOWN_ERROR",
                        "message": credentialStatusResult.error?.message ?? "An unknown error occurred"
                    ] : nil
                    response[purpose] = [
                        "isValid": credentialStatusResult.isValid,
                        "statusListVC": credentialStatusResult.statusListVC,
                        "error": error
                    ]
                }
                resolve(response)
            } catch {
                reject("VERIFICATION_FAILED", "Verification threw an error: \(error.localizedDescription)", error)
            }
        }
    }
}
