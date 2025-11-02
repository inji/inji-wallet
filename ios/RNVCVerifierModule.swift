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

                let responseArray = results.map { result in
                    return [
                      "status": result.status,
                      "purpose": result.purpose,
                      "errorCode": result.error?.errorCode.rawValue,
                      "errorMessage": result.error?.message,
                      "statusListVC": result.statusListVC
                    ]
                }
                resolve(responseArray)
            } catch {
                reject("VERIFICATION_FAILED", "Verification threw an error: \(error.localizedDescription)", error)
            }
        }
    }
}
