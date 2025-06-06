import Foundation
import React
import VCIClient

@objc(InjiVciClient)
class RNVCIClientModule: NSObject, RCTBridgeModule {
    private var vciClient: VCIClient?
    private var pendingProofContinuation: ((String) -> Void)?
    private var pendingAuthCodeContinuation: ((String) -> Void)?
    private var pendingTxCodeContinuation: ((String) -> Void)?
    private var pendingIssuerTrustDecision: ((Bool) -> Void)?

    static func moduleName() -> String {
        return "InjiVciClient"
    }

    @objc
    func `init`(_ traceabilityId: String) {
        vciClient = VCIClient(traceabilityId: traceabilityId)
    }

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
                    getProofJwt: { accessToken, cNonce, issuerMetadata, credentialConfigId in
                        try await self.getProofContinuationHook(
                            accessToken: accessToken,
                            cNonce: cNonce,
                            issuerMetadata: issuerMetadata,
                            credentialConfigId: credentialConfigId
                        )
                    },
                    getAuthCode: { authUrl in
                        try await self.getAuthCodeContinuationHook(authUrl: authUrl)
                    },
                    onCheckIssuerTrust: { issuerMetadata in
                        try await self.getIssuerTrustDecisionHook(issuerMetadata: issuerMetadata)
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
        _ issuerMetadata: String,
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

                let issuer = try parseIssuerMeta(from: issuerMetadata)
                let clientMeta = try parseClientMetadata(from: clientMetadata)

                let response = try await vciClient.requestCredentialFromTrustedIssuer(
                    issuerMetadata: issuer,
                    clientMetadata: clientMeta,
                    getProofJwt: { accessToken, cNonce, issuerMetadata, credentialConfigId in
                        try await self.getProofContinuationHook(
                            accessToken: accessToken,
                            cNonce: cNonce,
                            issuerMetadata: issuerMetadata,
                            credentialConfigId: credentialConfigId
                        )
                    },
                    getAuthCode: { authUrl in
                        try await self.getAuthCodeContinuationHook(authUrl: authUrl)
                    }
                )

                resolve(try response?.toJsonString())
            } catch {
                reject(nil, error.localizedDescription, nil)
            }
        }
    }

    private func getProofContinuationHook(
        accessToken: String,
        cNonce: String?,
        issuerMetadata: [String: Any]?,
        credentialConfigId: String?
    ) async throws -> String {
        var issuerMetadataJson: String = ""

        if let issuerMetadata = issuerMetadata {
            if let data = try? JSONSerialization.data(withJSONObject: issuerMetadata, options: []),
               let jsonString = String(data: data, encoding: .utf8) {
                issuerMetadataJson = jsonString
            }
        }

        if let bridge = RCTBridge.current() {
            let payload: [String: Any] = [
                "accessToken": accessToken,
                "cNonce": cNonce ?? NSNull(),
                "issuerMetadata": issuerMetadataJson,
                "credentialConfigurationId": credentialConfigId ?? NSNull(),
            ]
            bridge.eventDispatcher().sendAppEvent(withName: "onRequestProof", body: payload)
        }

        return try await withCheckedThrowingContinuation { continuation in
            self.pendingProofContinuation = { jwt in continuation.resume(returning: jwt) }
        }
    }

    private func getAuthCodeContinuationHook(authUrl: String) async throws -> String {
        if let bridge = RCTBridge.current() {
            bridge.eventDispatcher().sendAppEvent(withName: "onRequestAuthCode", body: ["authorizationEndpoint": authUrl])
        }

        return try await withCheckedThrowingContinuation { continuation in
            self.pendingAuthCodeContinuation = { code in continuation.resume(returning: code) }
        }
    }

    private func getTxCodeHook(inputMode: String?, description: String?, length: Int? ) async throws -> String {
        if let bridge = RCTBridge.current() {
            bridge.eventDispatcher().sendAppEvent(withName: "onRequestTxCode", body: [
                "inputMode": inputMode,
                "description": description,
                "length": length
            ])
        }

        return try await withCheckedThrowingContinuation { continuation in
            self.pendingTxCodeContinuation = { code in continuation.resume(returning: code) }
        }
    }

    private func getIssuerTrustDecisionHook(issuerMetadata: [String: Any]) async throws -> Bool {
        var metadataJson = ""
        if let data = try? JSONSerialization.data(withJSONObject: issuerMetadata, options: []),
           let string = String(data: data, encoding: .utf8) {
            metadataJson = string
        }

        if let bridge = RCTBridge.current() {
            bridge.eventDispatcher().sendAppEvent(withName: "onCheckIssuerTrust", body: ["issuerMetadata": metadataJson])
        }

        return try await withCheckedThrowingContinuation { continuation in
            self.pendingIssuerTrustDecision = { decision in continuation.resume(returning: decision) }
        }
    }

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

    @objc(sendIssuerTrustResponseFromJS:)
    func sendIssuerTrustResponseFromJS(_ trusted: Bool) {
        pendingIssuerTrustDecision?(trusted)
        pendingIssuerTrustDecision = nil
    }

    private func parseClientMetadata(from jsonString: String) throws -> ClientMetaData {
        guard let data = jsonString.data(using: .utf8) else {
            throw NSError(domain: "Invalid JSON string for clientMetadata", code: 0)
        }
        return try JSONDecoder().decode(ClientMetaData.self, from: data)
    }

    private func parseIssuerMeta(from jsonString: String) throws -> IssuerMetadata {
        guard let data = jsonString.data(using: .utf8) else {
            throw NSError(domain: "Invalid JSON string for issuerMetadata", code: 0)
        }
        return try JSONDecoder().decode(IssuerMetadata.self, from: data)
    }

    @objc static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
