import Foundation
import OpenID4VP
import React

class OpenId4VPUtils: NSObject {
  static func toJsonString(jsonObject: AuthorizationRequest) throws -> String {
    let encoder = JSONEncoder()
    encoder.keyEncodingStrategy = .convertToSnakeCase
    let jsonData = try encoder.encode(jsonObject)
    guard let jsonString = String(data: jsonData, encoding: .utf8) else {
      throw NSError(domain: "OPENID4VP", code: -1, userInfo: [NSLocalizedDescriptionKey: "Unable to encode JSON"])
    }
    //TODO: append draft version into json string
    return jsonString
  }
  
  static func toJson(_ data: [UnsignedVPToken]?) throws -> [[String: Any]] {
    let encodableUnsignedVPToken : [[String: String]] = data?.map {
      [
        "dataToSign": $0.dataToSign.toBase64UrlEncoded(),
        "format": $0.format.rawValue,
        "holderKeyReference": $0.holderKeyReference,
        "signatureAlgorithm": $0.signatureAlgorithm
      ]
    } ?? []
    
    return encodableUnsignedVPToken
  }
  
  static func toJson(_ matchingCredentialsResult: MatchingCredentialsResult) throws -> [String: Any] {
    let data = try JSONEncoder().encode(matchingCredentialsResult)
    guard let jsonObject = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
      throw NSError(domain: "OPENID4VP", code: -1, userInfo: [NSLocalizedDescriptionKey: "Unable to serialize JSON"])
    }
    return jsonObject
  }
  
  static func parseSelectedVCs(_ credentialsMap: [String: [String: [Any]]]) -> [String: [FormatType: [AnyCodable]]] {
    return credentialsMap.mapValues { selectedVcsFormatMap -> [FormatType: [AnyCodable]] in
      selectedVcsFormatMap.reduce(into: [:]) { result, entry in
        let (credentialFormat, credentialsArray) = entry
        switch FormatType(rawValue: credentialFormat) {
        case .ldp_vc:
          result[.ldp_vc] = credentialsArray.map { AnyCodable($0) }
        case .mso_mdoc:
          result[.mso_mdoc] = credentialsArray.map { AnyCodable($0) }
        case .dc_sd_jwt:
          result[.dc_sd_jwt] = credentialsArray.map { AnyCodable($0) }
        case .vc_sd_jwt:
          result[.vc_sd_jwt] = credentialsArray.map { AnyCodable($0) }
        default:
          break
        }
      }
    }
  }
  
  static func parseSelectedVCs(_ credentialsMap: [String: [Any]]) throws -> [String: [Credential]] {
    var parsedCredentialsMap: [String: [Credential]] = [:]
    
    for (credentialQueryId, credentials) in credentialsMap {
      parsedCredentialsMap[credentialQueryId] = try credentials.map { credential in
        if let credentialDict = credential as? [String: Any],
           let formatString = credentialDict["format"] as? String,
           let format = FormatType(rawValue: formatString),
           let credentialData = credentialDict["credential"],
           let credentialId = credentialDict["credentialId"] as? String {
          return Credential(format: format, data: AnyCodable(credentialData), credentialId: credentialId)
        } else {
          throw NSError(
            domain: "OpenID4VP",
            code: -1,
            userInfo: [NSLocalizedDescriptionKey: "Unable to parse the provided credentials map"]
          )
        }
      }
    }
    
    return parsedCredentialsMap
  }
  
  static func parseCredentials(_ credentials: AnyObject) throws -> [Credential] {
    guard let credentials = credentials as? [[String: Any]] else {
      throw NSError(
        domain: "OpenID4VP",
        code: -1,
        userInfo: [NSLocalizedDescriptionKey: "Unable to parse the provided credentials"]
      )
    }
    
    var parsedCredentials: [Credential] = []
    
    for credential in credentials {
      if let formatString = credential["format"] as? String,
         let format = FormatType(rawValue: formatString),
         let credentialData = credential["credential"],
         let credentialId = credential["credentialId"] as? String {
        parsedCredentials.append(
          Credential(format: format, data: AnyCodable(credentialData), credentialId: credentialId)
        )
      } else {
        throw NSError(
          domain: "OpenID4VP",
          code: -1,
          userInfo: [NSLocalizedDescriptionKey: "Unable to parse the provided credentials map"]
        )
      }
    }
    
    return parsedCredentials
  }
  
  static func parseVPTokenSigningResult(_ vpTokenSigningResults: [[String: Any]]) throws -> [VPTokenSigningResult] {
    if(vpTokenSigningResults.isEmpty) {
      return []
    }
    
    let vpTokenSigningResultsData: [VPTokenSigningResult] = try vpTokenSigningResults.map { vpTokenSigningResult in
      guard let signedData = vpTokenSigningResult["signedData"] as? String else {  
        throw ParseError(message: "Invalid VP token signing result: missing or invalid 'signedData'")  
      }
      let decodedSignedData = try decodeBase64ToData(signedData)
      return VPTokenSigningResult(signedData: decodedSignedData)
    }
      
    return vpTokenSigningResultsData
  }
  
  private static func decodeBase64ToData(_ base64String: String) throws -> Data {
    guard let decodedData = Data(base64UrlEncoded: base64String) else {
      throw NSError(domain: "OPENID4VP", code: -1, userInfo: [NSLocalizedDescriptionKey: "Base64 decoding failed"])
    }
    return decodedData
  }
  
  static func convertToOpenID4VPException(errorCode: String, error: String, moduleName: String) -> OpenID4VPException {
      switch errorCode {
      case OpenID4VPErrorCodes.accessDenied:
        return AccessDenied(message: error, className: moduleName)
      case OpenID4VPErrorCodes.invalidTransactionData:
        return InvalidTransactionData(message: error, className: moduleName)
      default:
        return GenericFailure(message: error, className: moduleName)
      }
  }
}

struct ParseError: Error {
    let message: String
}
    
    
