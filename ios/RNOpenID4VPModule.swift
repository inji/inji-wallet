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

        let response = try OVPUtils.toJsonString(jsonObject: authenticationResponse)
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

        let formattedCredentialsMap: [String: [FormatType: [AnyCodable]]] = OVPUtils.parseSelectedVCs(credentialsMap)

        let response = try await openID4VP?.constructUnsignedVPToken(
          verifiableCredentials: formattedCredentialsMap,
          holderId: holderId,
          signatureSuite: signatureSuite
        )
        
        let parsedResponse = try OVPUtils.toJson(response)
        resolve(parsedResponse)
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
        let formattedVPTokenSigningResults: [FormatType: VPTokenSigningResult]
        do {
          formattedVPTokenSigningResults = try OVPUtils.parseVPTokenSigningResult(vpTokenSigningResults)
        } catch {
          reject("OPENID4VP", error.localizedDescription, nil)
          return
        }

        let verifierResponse = try await openID4VP?.sendVPResponseToVerifier(vpTokenSigningResults: formattedVPTokenSigningResults)
        try resolveToJsonData(verifierResponse, resolver: resolve, rejecter: reject)
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
      let exception: OpenID4VPException = OVPUtils.convertToOpenID4VPException(errorCode: errorCode, error: error, moduleName: Self.moduleName())
      
      do {
        let verifierResponse = try await openID4VP?.sendErrorInfoToVerifier(error: exception)
        try resolveToJsonData(verifierResponse, resolver: resolve, rejecter: reject)
      } catch {
        rejectWithOpenID4VPError(error, reject: reject)
      }
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

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }

  func rejectWithOpenID4VPError(_ error: Error, reject: RCTPromiseRejectBlock) {
    if let openidError = error as? OpenID4VPException {
        let errorMap: [String: Any] = [
            "errorCode": openidError.errorCode,
            "message": openidError.message,
            "verifierResponse": Inji.toJsonString(openidError.verifierResponse) ?? ""
        ]
        let nsError = NSError(
            domain: "OPENID4VP",
            code: 0,
            userInfo: errorMap
        )
        reject(openidError.errorCode, openidError.message, nsError)
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

fileprivate func resolveToJsonData(_ response: VerifierResponse?,resolver resolve: @escaping RCTPromiseResolveBlock,
                                   rejecter reject: @escaping RCTPromiseRejectBlock) throws {
  let jsonData = try toJsonData(response)
  
  if let jsonObject = try JSONSerialization.jsonObject(with: jsonData, options: []) as? [String: Any] {
    resolve(jsonObject)
  } else {
    reject("ERROR", "Failed to serialize JSON", nil)
  }
}

fileprivate func toJsonString<T>(_ input: T) -> String? where T: Encodable {
  if let jsonData = try? toJsonData(input),
     let jsonString = String(data: jsonData, encoding: .utf8) {
    return jsonString
  }
  return nil
}

fileprivate func toJsonData<T>(_ input: T) throws -> Data where T: Encodable {
  let encoder = JSONEncoder()
  encoder.keyEncodingStrategy = .convertToSnakeCase
  return try encoder.encode(input)
}
