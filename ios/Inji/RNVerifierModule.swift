import Foundation
import React
import ios_tuvali_library

// events already reach JS through WalletModule, so subscribing here would deliver them twice
@objc(VerifierModule)
class VerifierModule: NSObject {
    private let verifier = Verifier()

    @objc
    func startAdvertisement(_ advIdentifier: String) -> String {
        return verifier.startAdvertisement(advIdentifier)
    }

    @objc
    func disconnect() -> NSNull {
        verifier.disconnect()
        return NSNull()
    }

    @objc
    func sendVerificationStatus(_ status: Int) {
        guard let verificationStatus = VerificationStatusEvent.VerificationStatus(rawValue: status) else {
            return
        }
        verifier.sendVerificationStatus(verificationStatus)
    }

    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }

    @objc
    static func moduleName() -> String {
        return "VerifierModule"
    }
}
