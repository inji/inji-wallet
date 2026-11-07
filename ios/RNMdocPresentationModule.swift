import Foundation
import OpenID4VP
import React
import ios_tuvali_library

/// In-person (ISO 18013-5 proximity) mdoc presentation for JS: Tuvali's MdocPresenter runs the
/// session with the reader, OpenID4VP's MdocProximity builds the signed DeviceResponse. JS shows
/// the QR code, decides on each request (sendMdocDecisionFromJS) and signs (sendMdocSignatureFromJS).
/// The session transcript never leaves native code.
@objc(InjiMdocPresentation)
class RNMdocPresentationModule: NSObject, RCTBridgeModule {
  private static let errorCode = "MDOC_PRESENTATION_ERROR"

  private let lock = NSLock()
  // created on first use: creating Tuvali's Bluetooth central is what asks for Bluetooth permission
  private lazy var presenter = MdocPresenter()
  private var pendingDecision: CheckedContinuation<[String: Any], Error>?
  private var pendingSignature: CheckedContinuation<[String: Any], Error>?

  static func moduleName() -> String {
    return "InjiMdocPresentation"
  }

  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }

  /// Runs one presentation; resolves with the result as JSON, rejects if it cannot start.
  @objc
  func present(_ optionsJson: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    Task {
      do {
        let options = try parseOptions(optionsJson)
        let result = try await presenter.present(options: options, callbacks: Callbacks(module: self))
        resolve(try jsonString(resultObject(result)))
      } catch {
        reject(Self.errorCode, "\(error)", error)
      }
    }
  }

  @objc
  func cancel() {
    presenter.cancel()
  }

  @objc
  func sendMdocDecisionFromJS(_ decisionJson: String) {
    resume(&pendingDecision, with: decisionJson)
  }

  @objc
  func sendMdocSignatureFromJS(_ signatureJson: String) {
    resume(&pendingSignature, with: signatureJson)
  }

  // required by NativeEventEmitter
  @objc func addListener(_ eventName: String) {}
  @objc func removeListeners(_ count: Double) {}

  // MARK: waiting for JS

  /// Emits [eventName] and waits for JS to answer; a cancelled presentation stops the wait.
  fileprivate func askJS(
    _ eventName: String,
    _ body: [String: Any],
    pending: ReferenceWritableKeyPath<RNMdocPresentationModule, CheckedContinuation<[String: Any], Error>?>
  ) async throws -> [String: Any] {
    try await withTaskCancellationHandler {
      try await withCheckedThrowingContinuation { continuation in
        lock.lock()
        self[keyPath: pending] = continuation
        lock.unlock()
        emit(eventName, body)
      }
    } onCancel: {
      lock.lock()
      let waiting = self[keyPath: pending]
      self[keyPath: pending] = nil
      lock.unlock()
      waiting?.resume(throwing: CancellationError())
    }
  }

  private func resume(_ pending: inout CheckedContinuation<[String: Any], Error>?, with json: String) {
    lock.lock()
    let waiting = pending
    pending = nil
    lock.unlock()
    guard let waiting else { return }
    do {
      waiting.resume(returning: try jsonObject(json))
    } catch {
      waiting.resume(throwing: error)
    }
  }

  fileprivate func emit(_ eventName: String, _ body: [String: Any]) {
    RCTBridge.current()?.eventDispatcher().sendAppEvent(withName: eventName, body: body)
  }

  /// Asks JS to sign with the wallet's key; returns the raw signature.
  fileprivate func sign(_ input: MdocSigningInput) async throws -> Data {
    let answer = try await askJS("onMdocSignRequest", [
      "dataToSign": base64Url(input.dataToSign),
      "signatureAlgorithm": input.signatureAlgorithm,
      "holderKeyReference": input.holderKeyReference,
    ], pending: \.pendingSignature)
    if let message = answer["error"] as? String { throw MdocBridgeError(message) }
    guard let encoded = answer["signature"] as? String, let signature = Data(base64UrlEncoded: encoded) else {
      throw MdocBridgeError("JS sent no base64url signature")
    }
    return signature
  }

  fileprivate func decide(_ request: MdocRequest) async throws -> MdocSharingDecision {
    let answer = try await askJS("onMdocRequest", ["request": try jsonString(requestObject(request))], pending: \.pendingDecision)
    if let message = answer["error"] as? String { throw MdocBridgeError(message) }
    if answer["decline"] as? Bool == true { return .decline }
    guard let credentials = answer["share"] as? [String] else { throw MdocBridgeError("JS sent no credentials to share") }
    let deviceResponse = try await MdocProximity.buildDeviceResponse(
      sessionTranscriptBytes: request.sessionTranscript,
      credentials: credentials,
      sign: { input in try await self.sign(input) }
    )
    return .send(deviceResponse: deviceResponse)
  }

  // MARK: JSON

  private func parseOptions(_ json: String) throws -> MdocPresentationOptions {
    let object = try jsonObject(json)
    let defaults = MdocPresentationOptions()
    let roots = try (object["trustedReaderRoots"] as? [String] ?? []).map { root -> Data in
      guard let der = Data(base64Encoded: root) else { throw MdocBridgeError("A trusted reader root is not base64") }
      return der
    }
    return MdocPresentationOptions(
      trustedReaderRoots: roots,
      engagementTimeout: (object["engagementTimeoutSeconds"] as? NSNumber)?.doubleValue ?? defaults.engagementTimeout,
      inactivityTimeout: (object["inactivityTimeoutSeconds"] as? NSNumber)?.doubleValue ?? defaults.inactivityTimeout
    )
  }

  private func requestObject(_ request: MdocRequest) -> [String: Any] {
    [
      "requestNumber": request.requestNumber,
      "documents": request.documents.map { document in
        [
          "docType": document.docType,
          "nameSpaces": document.nameSpaces,
          "readerTrust": trustObject(document.readerTrust),
        ] as [String: Any]
      },
    ]
  }

  private func trustObject(_ trust: ReaderTrustStatus) -> [String: Any] {
    switch trust {
    case .notSigned: return ["status": "notSigned"]
    case let .verified(readerName): return ["status": "verified", "readerName": readerName as Any]
    case let .unverified(readerName, reason): return ["status": "unverified", "readerName": readerName as Any, "reason": reason]
    case let .invalid(reason): return ["status": "invalid", "reason": reason]
    }
  }

  private func resultObject(_ result: MdocResult) -> [String: Any] {
    switch result {
    case let .completed(confirmedByReader): return ["status": "completed", "confirmedByReader": confirmedByReader]
    case .declined: return ["status": "declined"]
    case .cancelled: return ["status": "cancelled"]
    case let .failed(failure, detail):
      var object: [String: Any] = ["status": "failed", "failure": failureName(failure)]
      if let detail { object["detail"] = detail }
      return object
    }
  }

  private func failureName(_ failure: MdocFailure) -> String {
    switch failure {
    case .readerReportedError: return "readerReportedError"
    default: return "\(failure)"
    }
  }

  private func jsonObject(_ json: String) throws -> [String: Any] {
    guard let object = try JSONSerialization.jsonObject(with: Data(json.utf8)) as? [String: Any] else {
      throw MdocBridgeError("Expected a JSON object from JS")
    }
    return object
  }

  private func jsonString(_ object: [String: Any]) throws -> String {
    String(decoding: try JSONSerialization.data(withJSONObject: object.compactMapValues { $0 is NSNull ? nil : $0 }), as: UTF8.self)
  }

  private func base64Url(_ data: Data) -> String {
    data.base64EncodedString()
      .replacingOccurrences(of: "+", with: "-")
      .replacingOccurrences(of: "/", with: "_")
      .replacingOccurrences(of: "=", with: "")
  }
}

/// MdocCallbacks for one presentation, forwarding to the module.
private final class Callbacks: MdocCallbacks {
  private weak var module: RNMdocPresentationModule?

  init(module: RNMdocPresentationModule) {
    self.module = module
  }

  func onQrReady(_ qrText: String) async throws {
    module?.emit("onMdocQrReady", ["qrText": qrText])
  }

  func onRequest(_ request: MdocRequest) async throws -> MdocSharingDecision {
    guard let module else { throw CancellationError() }
    return try await module.decide(request)
  }

  func onProgress(_ progress: MdocProgress) {
    module?.emit("onMdocProgress", ["progress": "\(progress)"])
  }
}

struct MdocBridgeError: Error, CustomStringConvertible {
  let description: String

  init(_ description: String) {
    self.description = description
  }
}
