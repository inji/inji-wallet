import Foundation
import OpenID4VP
import OpenID4VPBridge
import React
import VCIClient

@objc(InjiVciClient)
class RNVCIClientModule: NSObject, RCTBridgeModule {

  private var vciClient: VCIClient?

  private var pendingProofContinuation: ((String) -> Void)?
  private var pendingAuthCodeContinuation: ((String) -> Void)?
  private var pendingTxCodeContinuation: ((String) -> Void)?
  private var pendingTokenResponseContinuation: ((String) -> Void)?
  private var pendingIssuerTrustDecision: ((Bool) -> Void)?
  private var pendingSelectedCredentialsContinuation: CheckedContinuation<AnyObject, Error>?
  private var pendingSignVPContinuation: CheckedContinuation<NSArray, Error>?

  static func moduleName() -> String {
    return "InjiVciClient"
  }

  @objc
  func `init`(_ traceabilityId: String) {
    vciClient = VCIClient(traceabilityId: traceabilityId)
  }

  // MARK: - Public API

  fileprivate func getSupportedAuthorizationMethods(signatureSuite: String?)
    -> [AuthorizationMethod]
  {
    return [
      .redirectToWeb(openWebPage: { authUrl in
        let result: [String: String] = try await self.getAuthCodeContinuationHook(authUrl: authUrl)

        return result
      }),
//      .presentationDuringIssuance(
//        selectCredentialsForPresentation: { vpRequest in
//          try await self.getSelectedCredentialsContinuationHook(vpRequest: vpRequest)
//        },
//        signVerifiablePresentation: { unsignedVPTokens in
//          try await self.getSignVerifiablePresentationContinuationHook(
//            unsignedVPTokens: unsignedVPTokens)
//        },
//        ldpVpSignatureSuite: signatureSuite
//      ),
    ]
  }

  @objc
  func requestCredentialByOffer(
    _ credentialOffer: String,
    clientMetadata: String,
    signatureSuite: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Task {
      do {
        guard let vciClient = vciClient else {
          reject(nil, "VCIClient not initialized", nil)
          return
        }

        let clientMeta = try parseClientMetadata(from: clientMetadata)

        let response = try await vciClient.fetchCredentialUsingCredentialOffer(
          credentialOffer: credentialOffer,
          clientMetadata: clientMeta,
          getTxCode: { inputMode, description, length in
            try await self.getTxCodeHook(
              inputMode: inputMode,
              description: description,
              length: length
            )
          },
          authorizationMethods: getSupportedAuthorizationMethods(signatureSuite: signatureSuite),
          getTokenResponse: { tokenRequest in
            try await self.getTokenResponseHook(tokenRequest: tokenRequest)
          },
          getProofJwt: { credentialIssuer, cNonce, algos in
            try await self.getProofContinuationHook(
              credentialIssuer: credentialIssuer,
              cNonce: cNonce,
              proofSigningAlgorithmsSupported: algos
            )
          },
          onCheckIssuerTrust: { credentialIssuer, issuerDisplay in
            try await self.getIssuerTrustDecisionHook(
              credentialIssuer: credentialIssuer,
              issuerDisplay: issuerDisplay
            )
          }
        )

        resolve(try response?.toJsonString())
      } catch {
        rejectVCIError(error, reject: reject)
      }
    }
  }

  @objc
  func requestCredentialFromTrustedIssuer(
    _ credentialIssuer: String,
    credentialConfigurationId: String,
    clientMetadata: String,
    signatureSuite: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Task {
      do {
        guard let vciClient = vciClient else {
          reject(nil, "VCIClient not initialized", nil)
          return
        }

        let clientMeta = try parseClientMetadata(from: clientMetadata)

        let response = try await vciClient.fetchCredentialFromTrustedIssuer(
          credentialIssuer: credentialIssuer,
          credentialConfigurationId: credentialConfigurationId,
          clientMetadata: clientMeta,
          getTokenResponse: { tokenRequest in
            try await self.getTokenResponseHook(tokenRequest: tokenRequest)
          },
          authorizationMethods: getSupportedAuthorizationMethods(signatureSuite: signatureSuite),
          getProofJwt: { credentialIssuer, cNonce, algos in
            try await self.getProofContinuationHook(
              credentialIssuer: credentialIssuer,
              cNonce: cNonce,
              proofSigningAlgorithmsSupported: algos
            )
          },
          downloadTimeoutInMillis: 200000)

        resolve(try response?.toJsonString())
      } catch {
        rejectVCIError(error, reject: reject)
      }
    }
  }

  @objc
  func getIssuerMetadata(
    _ credentialIssuer: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Task {
      do {
        guard let vciClient = vciClient else {
          reject(nil, "VCIClient not initialized", nil)
          return
        }

        let metadata = try await vciClient.getIssuerMetadata(credentialIssuer: credentialIssuer)

        let data = try JSONSerialization.data(withJSONObject: metadata, options: [])
        guard let jsonString = String(data: data, encoding: .utf8) else {
          throw NSError(domain: "JSONEncodingError", code: 0)
        }

        resolve(jsonString)
      } catch {
        rejectVCIError(error, reject: reject)
      }
    }
  }

  private func rejectVCIError(
    _ error: Error,
    reject: RCTPromiseRejectBlock
  ) {
    if let vciError = error as? VCIClientException {

      var userInfo: [String: Any] = [
        "code": vciError.code
      ]

      if let sourceErrorCode = vciError.sourceErrorCode {
        userInfo["sourceErrorCode"] = sourceErrorCode
      }

      if let serverErrorCode = vciError.serverErrorCode {
        userInfo["serverErrorCode"] = serverErrorCode
      }

      if let serverErrorDescription = vciError.serverErrorDescription {
        userInfo["serverErrorDescription"] = serverErrorDescription
      }

      let nsError = NSError(
        domain: "InjiVciClient",
        code: 0,
        userInfo: userInfo
      )

      reject(vciError.code, vciError.message, nsError)

    } else {
      reject(
        "UNKNOWN_ERROR",
        (error as NSError).localizedDescription,
        error
      )
    }
  }

  // MARK: - Callbacks to JS

  private func getTxCodeHook(
    inputMode: String?,
    description: String?,
    length: Int?
  ) async throws -> String {
    if let bridge = RCTBridge.current() {
      bridge.eventDispatcher().sendAppEvent(
        withName: "onRequestTxCode",
        body: [
          "inputMode": inputMode,
          "description": description,
          "length": length,
        ]
      )
    }

    return try await withCheckedThrowingContinuation { continuation in
      self.pendingTxCodeContinuation = { code in continuation.resume(returning: code) }
    }
  }

  private func getAuthCodeContinuationHook(authUrl: String) async throws -> [String: String] {
    if let bridge = RCTBridge.current() {
      bridge.eventDispatcher().sendAppEvent(
        withName: "onRequestAuthCode",
        body: ["authorizationUrl": authUrl]
      )
    }

    return try await withCheckedThrowingContinuation { continuation in
      self.pendingAuthCodeContinuation = { code in continuation.resume(returning: ["code": code]) }
    }
  }

  private func getProofContinuationHook(
    credentialIssuer: String,
    cNonce: String?,
    proofSigningAlgorithmsSupported: [String]
  ) async throws -> String {
    let jsonData = try JSONSerialization.data(
      withJSONObject: proofSigningAlgorithmsSupported, options: [])
    let jsonString = String(data: jsonData, encoding: .utf8) ?? "[]"
    if let bridge = RCTBridge.current() {
      bridge.eventDispatcher().sendAppEvent(
        withName: "onRequestProof",
        body: [
          "credentialIssuer": credentialIssuer,
          "cNonce": cNonce,
          "proofSigningAlgorithmsSupported": jsonString,
        ]
      )
    }

    return try await withCheckedThrowingContinuation { continuation in
      self.pendingProofContinuation = { jwt in continuation.resume(returning: jwt) }
    }
  }

//  private func getSelectedCredentialsContinuationHook(vpRequest: AuthorizationRequest) async throws
//    -> [String: [FormatType: [OpenID4VPAnyCodable]]]
//  {
//    let vpRequestJson = try OpenId4VPUtils.toJsonString(jsonObject: vpRequest)
//    if let bridge = RCTBridge.current() {
//      bridge.eventDispatcher().sendAppEvent(
//        withName: "onPresentationRequest",
//        body: [
//          "presentationRequest": vpRequestJson
//        ]
//      )
//    }
//
//    let selectedCredentials = try await withCheckedThrowingContinuation {
//      (continuation: CheckedContinuation<AnyObject, Error>) in
//      self.pendingSelectedCredentialsContinuation = continuation
//    }
//
//    guard let credentialsMap = selectedCredentials as? [String: [String: [Any]]] else {
//      print("Invalid credentials map format")
//      return [:]
//    }
//
//    return OpenId4VPUtils.parseSelectedVCs(credentialsMap)
//  }

  private func getSignVerifiablePresentationContinuationHook(
    unsignedVPTokens: [UnsignedVPTokenV2]
  ) async throws -> [VPTokenSigningResultV2] {
    let unsignedVPTokensJson = try OpenId4VPUtils.toJson(unsignedVPTokens)
    if let bridge = RCTBridge.current() {
      bridge.eventDispatcher().sendAppEvent(
        withName: "onRequestSignedVPToken",
        body: [
          "vpTokenSigningRequest": unsignedVPTokensJson
        ]
      )
    }

    let signedVPTokensAny = try await withCheckedThrowingContinuation { continuation in
      self.pendingSignVPContinuation = continuation
    }
    guard let signedVPTokens = signedVPTokensAny as? [[String: Any]] else {
      throw NSError(
        domain: "VPTokenSigning",
        code: -1,
        userInfo: [NSLocalizedDescriptionKey: "Invalid VP token structure from JS"]
      )
    }

    return try OpenId4VPUtils.parseVPTokenSigningResultV2(signedVPTokens)
  }

  private func getTokenResponseHook(tokenRequest: TokenRequest) async throws -> TokenResponse {
    if let bridge = RCTBridge.current() {
      let tokenRequest: [String: Any] = [
        "grantType": tokenRequest.grantType.rawValue,
        "tokenEndpoint": tokenRequest.tokenEndpoint,
        "authCode": tokenRequest.authCode ?? NSNull(),
        "preAuthCode": tokenRequest.preAuthCode ?? NSNull(),
        "txCode": tokenRequest.txCode ?? NSNull(),
        "clientId": tokenRequest.clientId ?? NSNull(),
        "redirectUri": tokenRequest.redirectUri ?? NSNull(),
        "codeVerifier": tokenRequest.codeVerifier ?? NSNull(),
      ]

      bridge.eventDispatcher().sendAppEvent(
        withName: "onRequestTokenResponse",
        body: ["tokenRequest": tokenRequest]
      )
    }

    let json = try await withCheckedThrowingContinuation { continuation in
      self.pendingTokenResponseContinuation = { json in continuation.resume(returning: json) }
    }

    guard let data = json.data(using: .utf8) else {
      throw NSError(domain: "Invalid JSON", code: 0)
    }

    return try JSONDecoder().decode(TokenResponse.self, from: data)
  }

  private func getIssuerTrustDecisionHook(
    credentialIssuer: String,
    issuerDisplay: [[String: Any]]
  ) async throws -> Bool {
    // Convert issuerDisplay to JSON string
    let jsonData = try JSONSerialization.data(withJSONObject: issuerDisplay, options: [])
    let jsonString = String(data: jsonData, encoding: .utf8) ?? "[]"
    if let bridge = RCTBridge.current() {
      bridge.eventDispatcher().sendAppEvent(
        withName: "onCheckIssuerTrust",
        body: [
          "credentialIssuer": credentialIssuer,
          "issuerDisplay": jsonString,
        ]
      )
    }

    return try await withCheckedThrowingContinuation { continuation in
      self.pendingIssuerTrustDecision = { decision in continuation.resume(returning: decision) }
    }
  }

  // MARK: - Receivers from JS

  @objc(sendProofFromJS:)
  func sendProofFromJS(_ jwt: String) {
    pendingProofContinuation?(jwt)
    pendingProofContinuation = nil
  }

  @objc(sendSelectedCredentialsForVPSharingFromJS:)
  func sendSelectedCredentialsForVPSharingFromJS(_ selectedCredentials: AnyObject) {
    pendingSelectedCredentialsContinuation?.resume(returning: selectedCredentials)
    pendingSelectedCredentialsContinuation = nil
  }

  @objc(sendVPTokenSigningResultFromJS:)
  func sendVPTokenSigningResultFromJS(_ vpTokenSigningResult: NSArray) {
    pendingSignVPContinuation?.resume(returning: vpTokenSigningResult)
    pendingSignVPContinuation = nil
  }

  @objc(sendAuthCodeFromJS:)
  func sendAuthCodeFromJS(_ code: String) {
    pendingAuthCodeContinuation?(code)
    pendingAuthCodeContinuation = nil
  }

  @objc(sendTxCodeFromJS:)
  func sendTxCodeFromJS(_ code: String) {
    pendingTxCodeContinuation?(code)
    pendingTxCodeContinuation = nil
  }

  @objc(sendTokenResponseFromJS:)
  func sendTokenResponseFromJS(_ json: String) {
    pendingTokenResponseContinuation?(json)
    pendingTokenResponseContinuation = nil
  }

  @objc(sendIssuerTrustResponseFromJS:)
  func sendIssuerTrustResponseFromJS(_ trusted: Bool) {
    pendingIssuerTrustDecision?(trusted)
    pendingIssuerTrustDecision = nil
  }

  // MARK: - JSON Parsing

  private func parseClientMetadata(from jsonString: String) throws -> VciClientMetadata {
    guard let data = jsonString.data(using: .utf8) else {
      throw NSError(domain: "Invalid JSON string for clientMetadata", code: 0)
    }
    return try JSONDecoder().decode(VciClientMetadata.self, from: data)
  }

  @objc static func requiresMainQueueSetup() -> Bool {
    return true
  }

  @objc(abortPresentationFlowFromJS:message:)
  func abortPresentationFlowFromJS(_ code: String, message: String) {
    let error = OpenId4VPUtils.convertToOpenID4VPException(
      errorCode: code, error: message, moduleName: Self.moduleName())

    pendingSelectedCredentialsContinuation?.resume(throwing: error)
    pendingSignVPContinuation?.resume(throwing: error)

    pendingSelectedCredentialsContinuation = nil
    pendingSignVPContinuation = nil

    pendingProofContinuation = nil
    pendingAuthCodeContinuation = nil
    pendingTxCodeContinuation = nil
    pendingTokenResponseContinuation = nil
    pendingIssuerTrustDecision = nil
  }
}
