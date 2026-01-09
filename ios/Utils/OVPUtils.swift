import Foundation
import OpenID4VP
import React

class OVPUtils: NSObject {
  static func toJsonString(jsonObject: AuthorizationRequest) throws -> String {
    let encoder = JSONEncoder()
    encoder.keyEncodingStrategy = .convertToSnakeCase
    let jsonData = try encoder.encode(jsonObject)
    guard let jsonString = String(data: jsonData, encoding: .utf8) else {
      throw NSError(domain: "OPENID4VP", code: -1, userInfo: [NSLocalizedDescriptionKey: "Unable to encode JSON"])
    }
    return jsonString
  }
  
  static func toJson(_ data:  [FormatType : any UnsignedVPToken]?) throws -> [String: Any] {
    let encodableDict = data?.mapKeys { $0.rawValue }.mapValues { EncodableWrapper($0) }
    let jsonData = try JSONEncoder().encode(encodableDict)

    if let jsonObject = try JSONSerialization.jsonObject(with: jsonData, options: []) as? [String: Any] {
      return jsonObject
    } else {
      throw ParseError(message: "Failed to serialize JSON")
    }
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
  
  static func parseVPTokenSigningResult(_ vpTokenSigningResults: [String: Any]) throws -> [FormatType: VPTokenSigningResult] {
    var formattedVPTokenSigningResults: [FormatType: VPTokenSigningResult] = [:]

    for (credentialFormat, vpTokenSigningResult) in vpTokenSigningResults {
      switch credentialFormat {
      case FormatType.ldp_vc.rawValue:
        guard let vpResponse = vpTokenSigningResult as? [String: Any],
                 let signatureAlgorithm = vpResponse["signatureAlgorithm"] as? String else {
               throw ParseError(message: "Invalid VP token signing result for LDP_VC")
           }

           let jws = vpResponse["jws"] as? String
           let proofValue = vpResponse["proofValue"] as? String
        formattedVPTokenSigningResults[.ldp_vc] = LdpVPTokenSigningResult(jws: jws, proofValue: proofValue, signatureAlgorithm: signatureAlgorithm)

      case FormatType.mso_mdoc.rawValue:
        var docTypeToDeviceAuthentication : [String: DeviceAuthentication] = [:]
        guard let vpResponse = vpTokenSigningResult as? [String:[String: String]] else {
         throw ParseError(message: "Invalid VP token signing result format")
        }
        for (docType, deviceAuthentication) in vpResponse {
          guard let signature = deviceAuthentication["signature"],
                let algorithm = deviceAuthentication["mdocAuthenticationAlgorithm"] else {
            throw ParseError(message: "Invalid VP token signing result provided for mdoc format")
          }
          docTypeToDeviceAuthentication[docType] = DeviceAuthentication(signature: signature, algorithm: algorithm)
        }
        formattedVPTokenSigningResults[.mso_mdoc] = MdocVPTokenSigningResult(docTypeToDeviceAuthentication: docTypeToDeviceAuthentication)
        
      case FormatType.vc_sd_jwt.rawValue :
        guard let vpResponse = vpTokenSigningResult as? [String:String] else {
          throw ParseError(message: "Invalid VP token signing result format")
        }
        formattedVPTokenSigningResults[.vc_sd_jwt] = SdJwtVpTokenSigningResult(uuidToKbJWTSignature: vpResponse)
      case FormatType.dc_sd_jwt.rawValue :
        guard let vpResponse = vpTokenSigningResult as? [String:String] else {
          throw ParseError(message: "Invalid VP token signing result format")
        }
        formattedVPTokenSigningResults[.dc_sd_jwt] = SdJwtVpTokenSigningResult(uuidToKbJWTSignature: vpResponse)

      default:
        let error = NSError(domain: "Credential format '\(credentialFormat)' is not supported", code: 0)
        throw ParseError(message: error.localizedDescription)
      }
    }
    
    return formattedVPTokenSigningResults
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
    
    
