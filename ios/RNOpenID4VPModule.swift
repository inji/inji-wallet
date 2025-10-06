import Foundation
import OpenID4VP
import React

@objc(InjiOpenID4VP)
class RNOpenId4VpModule: NSObject, RCTBridgeModule {

  private var openID4VP: OpenID4VP?

  static func moduleName() -> String {
    return "InjiOpenID4VP"
  }

  @objc
  func `initSdk`(_ appId: String, walletMetadata: AnyObject?,resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    do {
      let walletMetadataObject = try getWalletMetadataFromDict(walletMetadata, reject: reject)
      openID4VP = OpenID4VP(traceabilityId: appId, walletMetadata: walletMetadataObject)
      resolve(true)
    } catch {
      reject("OPENID4VP", error.localizedDescription, error)
    }
  }

  @objc
  func authenticateVerifier(_ urlEncodedAuthorizationRequest: String,
                            trustedVerifierJSON: AnyObject,
                            shouldValidateClient: Bool,
                            resolver resolve: @escaping RCTPromiseResolveBlock,
                            rejecter reject: @escaping RCTPromiseRejectBlock) {
    Task {
      do {
        guard let verifierMeta = trustedVerifierJSON as? [[String:Any]] else {
          reject("OPENID4VP", "Invalid verifier meta format", nil)
          return
        }

        let trustedVerifiersList: [Verifier] = try parseVerifiers(verifierMeta)

        let authenticationResponse: AuthorizationRequest = try await openID4VP!.authenticateVerifier(
          urlEncodedAuthorizationRequest: urlEncodedAuthorizationRequest,
          trustedVerifierJSON: trustedVerifiersList,
          shouldValidateClient: shouldValidateClient
        )

        let response = try toJsonString(jsonObject: authenticationResponse)
        resolve(response)
      } catch {
        rejectWithOpenID4VPError(error, reject: reject)

      }
    }
  }

  @objc
  func constructUnsignedVPToken(_ credentialsMap: AnyObject,
                                holderId: String,
                                signatureSuite: String,
                                resolver resolve: @escaping RCTPromiseResolveBlock,
                                rejecter reject: @escaping RCTPromiseRejectBlock) {
    Task {
      do {
        guard let credentialsMap = credentialsMap as? [String: [String: [Any]]] else {
          reject("OPENID4VP", "Invalid credentials map format", nil)
          return
        }

        let formattedCredentialsMap: [String: [FormatType: [AnyCodable]]] = credentialsMap.mapValues { selectedVcsFormatMap -> [FormatType: [AnyCodable]] in
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


        let response = try await openID4VP?.constructUnsignedVPToken(
          verifiableCredentials: formattedCredentialsMap,
          holderId: holderId,
          signatureSuite: signatureSuite
        )

        let encodableDict = response?.mapKeys { $0.rawValue }.mapValues { EncodableWrapper($0) }
        let jsonData = try JSONEncoder().encode(encodableDict)

        if let jsonObject = try JSONSerialization.jsonObject(with: jsonData, options: []) as? [String: Any] {
          resolve(jsonObject)
        } else {
          reject("ERROR", "Failed to serialize JSON", nil)
        }
      } catch {
        rejectWithOpenID4VPError(error, reject: reject)
      }
    }
  }

  @objc
  func shareVerifiablePresentation(_ vpTokenSigningResults: [String: Any],
                                   resolver resolve: @escaping RCTPromiseResolveBlock,
                                   rejecter reject: @escaping RCTPromiseRejectBlock) {
    Task {
      do {
        var formattedVPTokenSigningResults: [FormatType: VPTokenSigningResult] = [:]

        for (credentialFormat, vpTokenSigningResult) in vpTokenSigningResults {
          switch credentialFormat {
          case FormatType.ldp_vc.rawValue:
            guard let vpResponse = vpTokenSigningResult as? [String: Any],
                     let signatureAlgorithm = vpResponse["signatureAlgorithm"] as? String else {
                   reject("OPENID4VP", "Invalid VP token signing result for LDP_VC", nil)
                   return
               }

               let jws = vpResponse["jws"] as? String
               let proofValue = vpResponse["proofValue"] as? String
            formattedVPTokenSigningResults[.ldp_vc] = LdpVPTokenSigningResult(jws: jws, proofValue: proofValue, signatureAlgorithm: signatureAlgorithm)

          case FormatType.mso_mdoc.rawValue:
            var docTypeToDeviceAuthentication : [String: DeviceAuthentication] = [:]
            guard let vpResponse = vpTokenSigningResult as? [String:[String: String]] else {
              reject("OPENID4VP", "Invalid VP token signing result format", nil)
              return
            }
            for (docType, deviceAuthentication) in vpResponse {
              guard let signature = deviceAuthentication["signature"],
                    let algorithm = deviceAuthentication["mdocAuthenticationAlgorithm"] else {
                reject("OPENID4VP", "Invalid VP token signing result provided for mdoc format", nil)
                return
              }
              docTypeToDeviceAuthentication[docType] = DeviceAuthentication(signature: signature, algorithm: algorithm)
            }
            formattedVPTokenSigningResults[.mso_mdoc] = MdocVPTokenSigningResult(docTypeToDeviceAuthentication: docTypeToDeviceAuthentication)
            
          case FormatType.vc_sd_jwt.rawValue :
            guard let vpResponse = vpTokenSigningResult as? [String:String] else {
              reject("OPENID4VP", "Invalid VP token signing result format", nil)
              return
            }
            formattedVPTokenSigningResults[.vc_sd_jwt] = SdJwtVpTokenSigningResult(uuidToKbJWTSignature: vpResponse)
          case FormatType.dc_sd_jwt.rawValue :
            guard let vpResponse = vpTokenSigningResult as? [String:String] else {
              reject("OPENID4VP", "Invalid VP token signing result format", nil)
              return
            }
            formattedVPTokenSigningResults[.dc_sd_jwt] = SdJwtVpTokenSigningResult(uuidToKbJWTSignature: vpResponse)

          default:
            let error = NSError(domain: "Credential format '\(credentialFormat)' is not supported", code: 0)
            rejectWithOpenID4VPError(error, reject: reject)
            return
          }
        }

        let response = try await openID4VP?.shareVerifiablePresentation(vpTokenSigningResults: formattedVPTokenSigningResults)
        resolve(response)
      } catch {
        rejectWithOpenID4VPError(error, reject: reject)
      }
    }
  }

@objc
func sendErrorToVerifier(_ error: String, _ errorCode: String,
                         resolver resolve: @escaping RCTPromiseResolveBlock,
                         rejecter reject: @escaping RCTPromiseRejectBlock) {
    Task {
        let exception: OpenID4VPException = {
            switch errorCode {
            case OpenID4VPErrorCodes.accessDenied:
                return AccessDenied(message: error, className: Self.moduleName())
            case OpenID4VPErrorCodes.invalidTransactionData:
                return InvalidTransactionData(message: error, className: Self.moduleName())
            default:
                return GenericFailure(message: error, className: Self.moduleName())
            }
        }()

        await openID4VP?.sendErrorToVerifier(error: exception)
        resolve(true)
    }
}
  
  private func parseVerifiers(_ verifiers: [[String: Any]]) throws -> [Verifier] {
    return try verifiers.map { verifierDict in
      guard let clientId = verifierDict["client_id"] as? String,
            let responseUris = verifierDict["response_uris"] as? [String] else {
        throw NSError(domain: "OpenID4VP", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid Verifier data"])
      }
      
      let jwksUri: String? = verifierDict["jwks_uri"] as? String
      
      if let allowUnsignedRequest = verifierDict["allow_unsigned_request"] as? Bool {
        return Verifier(clientId: clientId, responseUris: responseUris, jwksUri: jwksUri, allowUnsignedRequest: allowUnsignedRequest)
      }
      
      return Verifier(clientId: clientId, responseUris: responseUris,jwksUri: jwksUri)
    }
  }

  func toJsonString(jsonObject: AuthorizationRequest) throws -> String {
    let encoder = JSONEncoder()
    encoder.keyEncodingStrategy = .convertToSnakeCase
    let jsonData = try encoder.encode(jsonObject)
    guard let jsonString = String(data: jsonData, encoding: .utf8) else {
      throw NSError(domain: "OPENID4VP", code: -1, userInfo: [NSLocalizedDescriptionKey: "Unable to encode JSON"])
    }
    return jsonString
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }

  func rejectWithOpenID4VPError(_ error: Error, reject: RCTPromiseRejectBlock) {
      if let openidError = error as? OpenID4VPException {
          reject(openidError.errorCode, openidError.message, openidError)
      } else {
        let nsError = NSError(domain: error.localizedDescription, code: 0)
        reject("ERR_UNKNOWN", nsError.localizedDescription, nsError)
      }
  }


}

struct EncodableWrapper: Encodable {
  private let value: Encodable
  init(_ value: Encodable) {
    self.value = value
  }
  func encode(to encoder: Encoder) throws {
    try value.encode(to: encoder)
  }
}

extension Dictionary {
  func mapKeys<T: Hashable>(_ transform: (Key) -> T) -> [T: Value] {
    Dictionary<T, Value>(uniqueKeysWithValues: map { (transform($0.key), $0.value) })
  }
}

func getWalletMetadataFromDict(_ walletMetadata: Any,
                               reject: RCTPromiseRejectBlock) throws -> WalletMetadata {
  guard let metadata = walletMetadata as? [String: Any] else {
    reject("OPENID4VP", "Invalid wallet metadata format", nil)
    throw NSError(domain: "", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid Wallet Metadata"])
  }
  
  var vpFormatsSupported: [VPFormatType: VPFormatSupported] = [:]
  if let vpFormatsSupportedDict = metadata["vp_formats_supported"] as? [String: Any] {
    for (format, formatDict) in vpFormatsSupportedDict {
      guard let formatType = VPFormatType.fromValue(format) else {
        throw NSError(domain: "", code: -1, userInfo: [NSLocalizedDescriptionKey: "Unsupported VP format: \(format)"])
      }
      if let formatDetails = formatDict as? [String: Any] {
        let algValuesSupported = formatDetails["alg_values_supported"] as? [String]
        vpFormatsSupported[formatType] = VPFormatSupported(algValuesSupported: algValuesSupported)
      } else {
        vpFormatsSupported[formatType] = VPFormatSupported(algValuesSupported: nil)
      }
    }
  }
  
  let walletMetadataObject = try WalletMetadata(
    presentationDefinitionURISupported: metadata["presentation_definition_uri_supported"] as? Bool ?? true,
    vpFormatsSupported: vpFormatsSupported,
    clientIdSchemesSupported: mapStringsToEnum(metadata["client_id_schemes_supported"] as? [String] ?? [], using: ClientIdScheme.fromValue),
    requestObjectSigningAlgValuesSupported: mapStringsToEnum(metadata["request_object_signing_alg_values_supported"] as? [String] ?? [], using: RequestSigningAlgorithm.fromValue),
    authorizationEncryptionAlgValuesSupported: mapStringsToEnum(metadata["authorization_encryption_alg_values_supported"] as? [String] ?? [], using: KeyManagementAlgorithm.fromValue),
    authorizationEncryptionEncValuesSupported: mapStringsToEnum(metadata["authorization_encryption_enc_values_supported"] as? [String] ?? [], using: ContentEncryptionAlgorithm.fromValue),
    responseTypesSupported: mapStringsToEnum(metadata["response_types_supported"] as? [String] ?? [], using: ResponseType.fromValue)
  )
  return walletMetadataObject
}

func mapStringsToEnum<T: RawRepresentable>(
  _ input: [String],
  using fromValue: (String) -> T?
) throws -> [T] where T.RawValue == String {
  return try input.map { str in
    guard let match = fromValue(str) else {
      throw NSError(
        domain: "EnumMappingError",
        code: 1001,
        userInfo: [NSLocalizedDescriptionKey: "Invalid value '\(str)' for enum \(T.self)"]
      )
    }
    return match
  }
}
