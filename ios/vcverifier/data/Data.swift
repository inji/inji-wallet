public struct VerificationResult {
    let verificationStatus: Bool
    let verificationMessage: String
    let verificationErrorCode: String
    let statusListVC: String?

    init(
        verificationStatus: Bool,
        verificationMessage: String = "",
        verificationErrorCode: String,
        statusListVC: String? = nil
    ) {
        self.verificationStatus = verificationStatus
        self.verificationMessage = verificationMessage
        self.verificationErrorCode = verificationErrorCode
        self.statusListVC = statusListVC
    }
}
