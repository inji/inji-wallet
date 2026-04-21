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
      let walletMetadataObject : WalletMetadata = try getWalletMetadataFromDict(walletMetadata, reject: reject)
      openID4VP = OpenID4VP(traceabilityId: appId, walletMetadata: walletMetadataObject)
      resolve(true)
    } catch {
      os_log("Error occurred \(error)")
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
          trustedVerifiers: trustedVerifiersList,
          shouldValidateClient: shouldValidateClient
        )

        let response = try OpenId4VPUtils.toJsonString(jsonObject: authenticationResponse)
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

        let formattedCredentialsMap: [String: [FormatType: [AnyCodable]]] = OpenId4VPUtils.parseSelectedVCs(credentialsMap)

        let response = try await openID4VP?.constructUnsignedVPToken(
          verifiableCredentials: formattedCredentialsMap,
          holderId: holderId,
          signatureSuite: signatureSuite
        )
        
        let parsedResponse = try OpenId4VPUtils.toJson(response)
        resolve(parsedResponse)
      } catch {
        rejectWithOpenID4VPError(error, reject: reject)
      }
    }
  }

  @objc
  func shareVerifiablePresentation(_ vpTokenSigningResults: NSArray,
                                   resolver resolve: @escaping RCTPromiseResolveBlock,
                                   rejecter reject: @escaping RCTPromiseRejectBlock) {
    Task {
      do {
        let formattedVPTokenSigningResults: [VPTokenSigningResultV2]
        do {
          guard let signedVPTokens = vpTokenSigningResults as? [[String: Any]] else {
            throw NSError(
              domain: "VPTokenSigning",
              code: -1,
              userInfo: [NSLocalizedDescriptionKey: "Invalid VP token structure from JS"]
            )
          }

          formattedVPTokenSigningResults = try OpenId4VPUtils.parseVPTokenSigningResultV2(signedVPTokens)
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
      let exception: OpenID4VPException = OpenId4VPUtils.convertToOpenID4VPException(errorCode: errorCode, error: error, moduleName: Self.moduleName())
      
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
      
      return Verifier(clientId: clientId, responseUris: responseUris, jwksUri: jwksUri)
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
      
      guard let formatDictMap = formatDict as? [String: Any] else {
        throw NSError(domain: "", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid format dictionary for format: \(format)"])
      }
      
      let vpFormatSupported: VPFormatSupported
      switch formatType {
        case .ldp_vc, .ldp_vp:
          let proofTypes: [ProofType] = try mapStringsToRawEnum((formatDictMap["proof_type_values"] as? [String]) ?? [])
          let cryptoSuites: [String]? = formatDictMap["cryptosuite_values"] as? [String]
          vpFormatSupported = LdpVcFormatSupported(proofTypeValues: proofTypes, cryptoSuiteValues: cryptoSuites)
        case .mso_mdoc:
          let issuerAlgs: [Int]? = formatDictMap["issuerauth_alg_values"] as? [Int]
          let deviceAlgs: [Int]? = formatDictMap["deviceauth_alg_values"] as? [Int]
          vpFormatSupported = MsoMdocVcFormatSupported(issuerAuthAlgValues: issuerAlgs, deviceAuthAlgValues: deviceAlgs)
        case .dc_sd_jwt, .vc_sd_jwt:
          let sdjwtAlgValues: [String]? = formatDictMap["sd-jwt_alg_values"] as? [String]
          let kbJwtAlgValues: [String]? = formatDictMap["kb-jwt_alg_values"] as? [String]
          vpFormatSupported = SdJwtVcFormatSupported(sdJwtAlgValues: sdjwtAlgValues, kbJwtAlgValues: kbJwtAlgValues)
      }
      vpFormatsSupported[formatType] = vpFormatSupported
    }
  }
  
  let walletMetadataObject = try WalletMetadata(
    vpFormatsSupported: vpFormatsSupported,
    clientIdPrefixesSupported: mapStringsToEnum(metadata["client_id_prefixes_supported"] as? [String] ?? [], using: ClientIdPrefix.fromValue),
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

func mapStringsToRawEnum<T: RawRepresentable>(_ input: [String]) throws -> [T] where T.RawValue == String {
  return try input.map { str in
    guard let value = T(rawValue: str) else {
      throw NSError(
        domain: "EnumMappingError",
        code: 1002,
        userInfo: [NSLocalizedDescriptionKey: "Invalid value '\(str)' for enum \(T.self)"]
      )
    }
    return value
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

