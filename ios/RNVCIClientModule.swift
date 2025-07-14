import Foundation
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

    static func moduleName() -> String {
        return "InjiVciClient"
    }

    @objc
    func `init`(_ traceabilityId: String) {
        vciClient = VCIClient(traceabilityId: traceabilityId)
    }

    // MARK: - Public API

    @objc
    func requestCredentialByOffer(
        _ credentialOffer: String,
        clientMetadata: String,
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

                let response = try await vciClient.requestCredentialByCredentialOffer(
                    credentialOffer: credentialOffer,
                    clientMetadata: clientMeta,
                    getTxCode: { inputMode, description, length in
                        try await self.getTxCodeHook(
                            inputMode: inputMode,
                            description: description,
                            length: length
                        )
                    },
                    authorizeUser: { authUrl in
                        try await self.getAuthCodeContinuationHook(authUrl: authUrl)
                    },
                    getTokenResponse: { tokenRequest in
                        try await self.getTokenResponseHook(tokenRequest: tokenRequest)
                    },
                    getProofJwt: { credentialIssuer, cNonce, algos in
                        try await self.getProofContinuationHook(
                            credentialIssuer: credentialIssuer,
                            cNonce: cNonce,
                            proofSigningAlgosSupported: algos
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
                reject(nil, error.localizedDescription, nil)
            }
        }
    }

    @objc
    func requestCredentialFromTrustedIssuer(
        _ credentialIssuerUri: String,
        credentialConfigurationId: String,
        clientMetadata: String,
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

                let response = try await vciClient.requestCredentialFromTrustedIssuer(
                    credentialIssuerUri: credentialIssuerUri,
                    credentialConfigurationId: credentialConfigurationId,
                    clientMetadata: clientMeta,
                    authorizeUser: { authUrl in
                        try await self.getAuthCodeContinuationHook(authUrl: authUrl)
                    },
                    getTokenResponse: { tokenRequest in
                        try await self.getTokenResponseHook(tokenRequest: tokenRequest)
                    },
                    getProofJwt: { credentialIssuer, cNonce, algos in
                        try await self.getProofContinuationHook(
                            credentialIssuer: credentialIssuer,
                            cNonce: cNonce,
                            proofSigningAlgosSupported: algos
                        )
                    }
                )

                resolve(try response?.toJsonString())
            } catch {
                reject(nil, error.localizedDescription, nil)
            }
        }
    }
  
    @objc
    func getIssuerMetadata(
        _ credentialIssuerUri: String,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        Task {
            do {
                guard let vciClient = vciClient else {
                    reject(nil, "VCIClient not initialized", nil)
                    return
                }

                let metadata = try await vciClient.getIssuerMetadata(credentialIssuerUri: credentialIssuerUri)

                let data = try JSONSerialization.data(withJSONObject: metadata, options: [])
                guard let jsonString = String(data: data, encoding: .utf8) else {
                    throw NSError(domain: "JSONEncodingError", code: 0)
                }

                resolve(jsonString)
            } catch {
                reject(nil, error.localizedDescription, nil)
            }
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
                    "length": length
                ]
            )
        }

        return try await withCheckedThrowingContinuation { continuation in
            self.pendingTxCodeContinuation = { code in continuation.resume(returning: code) }
        }
    }

    private func getAuthCodeContinuationHook(authUrl: String) async throws -> String {
        if let bridge = RCTBridge.current() {
            bridge.eventDispatcher().sendAppEvent(
                withName: "onRequestAuthCode",
                body: ["authorizationUrl": authUrl]
            )
        }

        return try await withCheckedThrowingContinuation { continuation in
            self.pendingAuthCodeContinuation = { code in continuation.resume(returning: code) }
        }
    }

    private func getProofContinuationHook(
        credentialIssuer: String,
        cNonce: String?,
        proofSigningAlgosSupported: [String]
    ) async throws -> String {
        if let bridge = RCTBridge.current() {
            bridge.eventDispatcher().sendAppEvent(
                withName: "onRequestProof",
                body: [
                    "credentialIssuer": credentialIssuer,
                    "cNonce": cNonce ?? NSNull(),
                    "proofSigningAlgosSupported": proofSigningAlgosSupported
                ]
            )
        }

        return try await withCheckedThrowingContinuation { continuation in
            self.pendingProofContinuation = { jwt in continuation.resume(returning: jwt) }
        }
    }

    private func getTokenResponseHook(tokenRequest: TokenRequest) async throws -> TokenResponse {
        if let bridge = RCTBridge.current() {
            let payload: [String: Any] = [
                "grantType": tokenRequest.grantType.rawValue,
                "tokenEndpoint": tokenRequest.tokenEndpoint,
                "authCode": tokenRequest.authCode ?? NSNull(),
                "preAuthorizedCode": tokenRequest.preAuthorizedCode ?? NSNull(),
                "txCode": tokenRequest.txCode ?? NSNull(),
                "clientId": tokenRequest.clientId ?? NSNull(),
                "redirectUri": tokenRequest.redirectUri ?? NSNull(),
                "codeVerifier": tokenRequest.codeVerifier ?? NSNull()
            ]

            bridge.eventDispatcher().sendAppEvent(
                withName: "onRequestTokenResponse",
                body: payload
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
        if let bridge = RCTBridge.current() {
            bridge.eventDispatcher().sendAppEvent(
                withName: "onCheckIssuerTrust",
                body: [
                    "credentialIssuer": credentialIssuer,
                    "issuerDisplay": issuerDisplay
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

    private func parseClientMetadata(from jsonString: String) throws -> ClientMetadata {
        guard let data = jsonString.data(using: .utf8) else {
            throw NSError(domain: "Invalid JSON string for clientMetadata", code: 0)
        }
        return try JSONDecoder().decode(ClientMetadata.self, from: data)
    }

    @objc static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
