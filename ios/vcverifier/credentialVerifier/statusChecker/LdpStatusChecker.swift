import Foundation
import Gzip

// MARK: - Credential Status Result

public struct CredentialStatusResult {
  let isValid: Bool
  let statusListVC: [String: Any]?
  let error: StatusCheckException?
  
  init(isValid: Bool, statusListVC: [String: Any]? = nil, error: StatusCheckException? = nil) {
    self.isValid = isValid
    self.statusListVC = statusListVC
    self.error = error
  }
}

// MARK: - Error Types

enum StatusCheckErrorCode: String {
    case rangeError = "RANGE_ERROR"
    case statusVerificationError = "STATUS_VERIFICATION_ERROR"
    case invalidCredentialStatus = "INVALID_CREDENTIAL_STATUS"
    case statusRetrievalError = "STATUS_RETRIEVAL_ERROR"
    case invalidPurpose = "INVALID_PURPOSE"
    case invalidIndex = "INVALID_INDEX"
    case encodedListMissing = "ENCODED_LIST_MISSING"
    case base64DecodeFailed = "BASE64_DECODE_FAILED"
    case gzipDecompressFailed = "GZIP_DECOMPRESS_FAILED"
    case unknownError = "UNKNOWN_ERROR"
}

public struct StatusCheckException: Error {
    let message: String
    let errorCode: StatusCheckErrorCode
}

// MARK: - LDP Status Checker

final class LdpStatusChecker {
    private let networkManager: NetworkManaging
    private let minimumNumberOfEntries = 131072
    private let defaultStatusSize = 1

    init(networkManager: NetworkManaging = NetworkManagerClient.shared) {
        self.networkManager = networkManager
    }

  func getStatuses(credential: String, statusPurposes: [String]? = nil) async throws -> [String: CredentialStatusResult] {
        guard
            let data = credential.data(using: .utf8),
            let vc = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        else {
            throw StatusCheckException(message: "Invalid credential JSON", errorCode: .statusVerificationError)
        }

        let statusField = vc["credentialStatus"]
        guard let statusEntries = normalizeStatusField(statusField) else { throw StatusCheckException(
          message: "No valid credentialStatus entries found",
          errorCode: .invalidCredentialStatus
      ) }

        let filteredEntries = filterEntries(statusEntries, statusPurposes)
        guard !filteredEntries.isEmpty else {
          print("No matching credentialStatus entries found for purposes: \(statusPurposes ?? [])")
          return [:]
        }

        var results: [String: CredentialStatusResult] = [:]
        
        for entry in filteredEntries {
          let purpose = (entry["statusPurpose"] as? String)?.lowercased() ?? ""
          do {
            let result = try await checkStatusEntry(entry: entry, purpose: purpose)
            results[purpose] = result
          } catch let error as StatusCheckException {
            results[purpose] = CredentialStatusResult(isValid: false, statusListVC: nil, error: error)
          } catch {
            let genericError = StatusCheckException(message: error.localizedDescription, errorCode: .unknownError)
            results[purpose] = CredentialStatusResult(isValid: false, statusListVC: nil, error: genericError)
          }
        }
        return results
    }

    private func normalizeStatusField(_ statusField: Any?) -> [[String: Any]]? {
        if let entry = statusField as? [String: Any] {
            return [entry]
        } else if let array = statusField as? [[String: Any]] {
            return array
        }
        return nil
    }

    private func filterEntries(_ entries: [[String: Any]], _ purposes: [String]?) -> [[String: Any]] {
        guard let purposes = purposes, !purposes.isEmpty else { return entries }
        let lowerPurposes = purposes.map { $0.lowercased() }
        return entries.filter { entry in
            if let purpose = entry["statusPurpose"] as? String {
                return lowerPurposes.contains(purpose.lowercased())
            }
            return false
        }
    }

    private func checkStatusEntry(entry: [String: Any], purpose: String) async throws -> CredentialStatusResult {
        try validateCredentialStatusEntry(entry: entry)
        let statusListVC = try await fetchAndValidateStatusListVC(entry: entry, purpose: purpose)
        return try computeStatusResult(entry: entry, statusListVCCredentialSubject: statusListVC[0], purpose: purpose, statusListVC: statusListVC[1])
    }

    private func validateCredentialStatusEntry(entry: [String: Any]) throws {
        guard let type = entry["type"] as? String, type == "BitstringStatusListEntry" else {
            throw StatusCheckException(message: "Invalid credentialStatus.type", errorCode: .statusVerificationError)
        }
        guard let index = entry["statusListIndex"] as? String, Int(index) != nil else {
            throw StatusCheckException(message: "Invalid or missing statusListIndex", errorCode: .invalidIndex)
        }
        guard let url = entry["statusListCredential"] as? String, URL(string: url) != nil else {
            throw StatusCheckException(message: "statusListCredential must be a valid URL", errorCode: .invalidIndex)
        }
    }

    private func fetchAndValidateStatusListVC(entry: [String: Any], purpose: String) async throws -> [[String: Any]] {
        let url = entry["statusListCredential"] as! String
        let vc: [String: Any]
        do {
            vc = try await networkManager.sendHTTPRequest(url: url, method: .get, bodyParams: nil, headers: nil)
        } catch {
            throw StatusCheckException(message: "Retrieval of the status list failed: \(error.localizedDescription)", errorCode: .statusRetrievalError)
        }

        guard let subject = vc["credentialSubject"] as? [String: Any] else {
            throw StatusCheckException(message: "Missing credentialSubject", errorCode: .statusVerificationError)
        }
        guard (subject["type"] as? String) == "BitstringStatusList" else {
            throw StatusCheckException(message: "Invalid credentialSubject.type", errorCode: .statusVerificationError)
        }
        guard (subject["statusPurpose"] as? String)?.lowercased() == purpose else {
            throw StatusCheckException(message: "Status list VC purpose mismatch", errorCode: .invalidPurpose)
        }

        let now = Date().timeIntervalSince1970 * 1000
        if let validFromStr = subject["validFrom"] as? String,
           let validFromMillis = ISO8601DateFormatter().date(from: validFromStr)?.timeIntervalSince1970, now < validFromMillis * 1000 {
            throw StatusCheckException(message: "Status list VC is not yet valid (validFrom=\(validFromStr))", errorCode: .statusVerificationError)
        }
        if let validUntilStr = subject["validUntil"] as? String,
           let validUntilMillis = ISO8601DateFormatter().date(from: validUntilStr)?.timeIntervalSince1970, now > validUntilMillis * 1000 {
            throw StatusCheckException(message: "Status list VC has expired (validUntil=\(validUntilStr))", errorCode: .statusVerificationError)
        }

        return [subject, vc]
    }

    private func computeStatusResult(entry: [String: Any], statusListVCCredentialSubject: [String: Any], purpose: String, statusListVC: [String: Any]) throws -> CredentialStatusResult {
        guard
            let encodedList = statusListVCCredentialSubject["encodedList"] as? String,
            let indexStr = entry["statusListIndex"] as? String,
            let index = Int(indexStr)
        else {
            throw StatusCheckException(message: "Missing encodedList or statusListIndex", errorCode: .encodedListMissing)
        }

        let statusSize = (statusListVCCredentialSubject["statusSize"] as? Int) ?? defaultStatusSize
        guard statusSize > 0 else {
            throw StatusCheckException(message: "Invalid statusSize", errorCode: .statusVerificationError)
        }

        if statusSize > 1 {
            guard
                let statusMessage = entry["statusMessage"] as? [String: Any],
                statusMessage.count == (1 << statusSize)
            else {
                throw StatusCheckException(message: "statusMessage count mismatch", errorCode: .statusVerificationError)
            }
          
          print("Status message for purpose '\(purpose): $\(statusMessage)")
        }

        let bitSet = try decodeEncodedList(encodedList)
        let bitPosition = index * statusSize
        let totalBits = bitSet.count * 8
        guard bitPosition < totalBits else {
            throw StatusCheckException(message: "Bit position out of range", errorCode: .rangeError)
        }

        let statusValue = readBits(from: bitSet, start: bitPosition, count: statusSize)
        let isValid = (statusValue == 0)
        print("Status value for purpose \(purpose) at index \(indexStr): \(statusValue)")

      return .init(isValid: isValid, statusListVC: statusListVC, error: nil)
    }

    private func readBits(from bitSet: [UInt8], start: Int, count: Int) -> Int {
        var value = 0
        for i in 0 ..< count {
            if readBit(bitSet, position: start + i) {
                value |= (1 << (count - i - 1))
            }
        }
        return value
    }

    private func readBit(_ bitSet: [UInt8], position: Int) -> Bool {
        let byteIndex = position / 8
        let bitIndex = position % 8
        guard byteIndex < bitSet.count else { return false }
        let byte = bitSet[byteIndex]
        return ((byte >> (7 - bitIndex)) & 1) == 1
    }

    private func decodeEncodedList(_ encodedList: String) throws -> [UInt8] {
        let base64url = encodedList.hasPrefix("u") ? String(encodedList.dropFirst()) : encodedList
        guard let compressed = try? decodeBase64URL(base64url) else {
            throw StatusCheckException(message: "Base64url decoding failed", errorCode: .base64DecodeFailed)
        }
        return try decompressGzip(data: compressed)
    }

    private func decompressGzip(data: Data) throws -> [UInt8] {
        guard let decompressed = try? data.gunzipped() else {
            throw StatusCheckException(message: "GZIP decompression failed", errorCode: .gzipDecompressFailed)
        }
        return [UInt8](decompressed)
    }
}
