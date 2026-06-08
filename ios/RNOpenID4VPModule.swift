import Foundation
import OpenID4VP
import React

@objc(InjiOpenID4VP)
class RNOpenId4VpModule: NSObject, RCTBridgeModule {

  private var openID4VP: OpenID4VP?
  private var pendingJsonLdCanonicalizeContinuation: CheckedContinuation<String, Error>?
  // private var pendingJsonLdCanonicalizeContinuation: ((Data) -> Void)?
  private var pendingJsonLdExpandContinuation: (([String: Any]) -> Void)?
  private var jsonLdCanonicalizeCallback: RCTResponseSenderBlock?

  static func moduleName() -> String {
    return "InjiOpenID4VP"
  }
  
  @objc
  func `initSdk`(_ appId: String, walletConfig: AnyObject?, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    do {
      guard let walletConfigDict = walletConfig as? [String: Any] else {
        reject("OPENID4VP", "Invalid wallet config format", nil)
        return
      }
      let walletConfig = try decode(WalletConfig.self, from: walletConfigDict)
      openID4VP = OpenID4VP(
        traceabilityId: appId,
        walletConfig: walletConfig,
        jsonLdCanonicalizer: { data in
          try await self.invokeJsonLdCanonicalize(data)
        }
      )
      resolve(true)
    } catch {
      os_log("Error occurred \(error)")
      reject("OPENID4VP", error.localizedDescription, error)
    }
  }
  
  private func invokeJsonLdCanonicalize(_ data: String) async throws -> String {
    print("data = \(data)")
    
    if let bridge = RCTBridge.current() {
      bridge.eventDispatcher().sendAppEvent(
        withName: "onJsonLdCanonicalize",
        body: [
          "data": data,
        ]
      )
    }
    
      return try await withCheckedThrowingContinuation { (continuation : CheckedContinuation<String, Error>) in
      self.pendingJsonLdCanonicalizeContinuation = continuation
    }
  }
  
  private func invokeJsonLdExpand(_ data: [String: Any]) async throws -> [String: Any] {
    print("data = \(data)")
    
    if let bridge = RCTBridge.current() {
      bridge.eventDispatcher().sendAppEvent(
        withName: "onJsonLdExpand",
        body: [
          "data": data,
        ]
      )
    }
    
    return try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<[String: Any], Error>) in
      self.pendingJsonLdExpandContinuation = { result in
        continuation.resume(returning: result)
      }
    }
  }
  
  @objc(sendJsonLdCanonicalizeResultFromJS:)
  func sendJsonLdCanonicalizeResultFromJS(_ result: String) {
    // let decodedData = (try? decodeBase64URL(result)) ?? Data()
    // pendingJsonLdCanonicalizeContinuation?(decodedData)
    pendingJsonLdCanonicalizeContinuation?.resume(returning: result)
    pendingJsonLdCanonicalizeContinuation = nil
  }
  
  @objc
  func notifyCanonicalizationFailureFromJS(_ code: String, message: String) {
    let error = OpenId4VPUtils.convertToOpenID4VPException(
      errorCode: code, error: message, moduleName: Self.moduleName())

    pendingJsonLdCanonicalizeContinuation?.resume(throwing: error)
    pendingJsonLdCanonicalizeContinuation = nil
  }
  
  @objc
  func sendJsonLdExpandResultFromJS(_ result: AnyObject,
                                    resolver resolve: @escaping RCTPromiseResolveBlock,
                                    rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard let resultDict = result as? [[String: Any]] else {
      os_log("Invalid result format for JSON-LD expand")
      rejectWithOpenID4VPError(NSError(domain: "OPENID4VP", code: 0, userInfo: nil), reject: reject)
      return
    }
    pendingJsonLdExpandContinuation?(resultDict[0])
    pendingJsonLdExpandContinuation = nil
  }

  @objc
  func authenticateVerifier(_ urlEncodedAuthorizationRequest: String,
                            resolver resolve: @escaping RCTPromiseResolveBlock,
                            rejecter reject: @escaping RCTPromiseRejectBlock) {
    Task {
      do {
        let authenticationResponse: AuthorizationRequest = try await openID4VP!.authenticateVerifier(
          urlEncodedAuthorizationRequest: urlEncodedAuthorizationRequest
        )

        let response = try OpenId4VPUtils.toJsonString(jsonObject: authenticationResponse)
        resolve(response)
      } catch {
        rejectWithOpenID4VPError(error, reject: reject)

      }
    }
  }
  
  @objc
  func getMatchingCredentials(_ vpRequest: AnyObject,
                              availableWalletCredentials: AnyObject,
                                resolver resolve: @escaping RCTPromiseResolveBlock,
                              rejecter reject: @escaping RCTPromiseRejectBlock) {
    Task {
      do {
        guard let vpRequest = vpRequest as? [String: Any],
          let dcqlQuery = vpRequest["dcql_query"] as? [String: Any] else {
          reject("OPENID4VP", "Invalid VP request format or missing DCQL query", nil)
          return
        }
        let parsedDCQLQuery: DCQLQuery = try JSONDecoder().decode(DCQLQuery.self, from: try JSONSerialization.data(withJSONObject: dcqlQuery, options: []))
        let credentials : [Credential] = try OpenId4VPUtils.parseCredentials(availableWalletCredentials)
        
        let response = try await DCQLHelper(
          jsonLdExpander: { data in
            try await self.invokeJsonLdExpand(data)
          }
        ).getMatchingCredentials(inputCredentials: credentials, dcqlQuery: parsedDCQLQuery)
        let parsedResponse = try OpenId4VPUtils.toJson(response)
        
        resolve(parsedResponse)
      } catch {
        rejectWithOpenID4VPError(error, reject: reject)
      }
    }
  }
  
  @objc
  func constructUnsignedVPToken(_ credentialsMap: AnyObject,
                                resolver resolve: @escaping RCTPromiseResolveBlock,
                                rejecter reject: @escaping RCTPromiseRejectBlock) {
    Task {
      do {
        guard let rawCredentialsMap = credentialsMap as? [String: [Any]] else {
          reject("OPENID4VP", "Invalid credentials map format", nil)
          return
        }

        let formattedCredentialsMap: [String: [Credential]] = try OpenId4VPUtils.parseSelectedVCs(rawCredentialsMap)

        let response = try await openID4VP?.constructUnsignedVPToken(
          selectedCredentials: formattedCredentialsMap
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
        let formattedVPTokenSigningResults: [VPTokenSigningResult]
        do {
          guard let signedVPTokens = vpTokenSigningResults as? [[String: Any]] else {
            throw NSError(
              domain: "VPTokenSigning",
              code: -1,
              userInfo: [NSLocalizedDescriptionKey: "Invalid VP token structure from JS"]
            )
          }

          formattedVPTokenSigningResults = try OpenId4VPUtils.parseVPTokenSigningResult(signedVPTokens)
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
        
        guard
            let clientId = verifierDict["client_id"] as? String,
            let responseUris = verifierDict["response_uris"] as? [String]
        else {
            throw NSError(
                domain: "OpenID4VP",
                code: -1,
                userInfo: [
                    NSLocalizedDescriptionKey: "Invalid Verifier data"
                ]
            )
        }
        
        let jwksUri = verifierDict["jwks_uri"] as? String
        
        let specVersion: SpecVersion = {
            switch verifierDict["spec_version"] as? String {
            case "draft23":
                return .draft23
            default:
                return .v1
            }
        }()
        
        let allowUnsignedRequest = verifierDict["allow_unsigned_request"] as? Bool ?? false
        
        return Verifier(
            clientId: clientId,
            responseUris: responseUris,
            jwksUri: jwksUri,
            allowUnsignedRequest: allowUnsignedRequest,
            specVersion: specVersion
        )
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
            "verifierResponse": Inji.toJsonString(openidError.verifierResponse) ?? "",
            "cause": openidError.cause?.localizedDescription ?? ""
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

