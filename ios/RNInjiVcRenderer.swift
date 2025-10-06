import Foundation
import React
import InjiVcRenderer
@objc(InjiVcRenderer)
class RNInjiVcRenderer: NSObject, RCTBridgeModule {
  
  private var vcRenderer: InjiVcRenderer?
  
  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  static func moduleName() -> String {
    return "InjiVcRenderer"
  }
  
  @objc
  func `init`(_ traceabilityId: String) {
    vcRenderer = InjiVcRenderer(traceabilityId: traceabilityId)
  }
  
  
  @objc(generateCredentialDisplayContent:wellKnown:vcJsonString:resolver:rejecter:)
  func generateCredentialDisplayContent(
    credentialFormat: String,
    wellKnown: String?,
    vcJsonString: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let renderer = self.vcRenderer else {
      reject(nil, "InjiVcRenderer not initialized", nil)
      return
    }
    
    do {
      guard let format = CredentialFormat.fromValue(credentialFormat) else {
        throw NSError(domain: "Invalid credential format", code: 0)
      }
      let result = try renderer.generateCredentialDisplayContent(
        credentialFormat: format,
        wellKnownJson: wellKnown,
        vcJsonString: vcJsonString
      )
      resolve(result)
    } catch {
      rejectWithVcRendererError(error, reject: reject)
    }
  }
  
  func rejectWithVcRendererError(_ error: Error, reject: RCTPromiseRejectBlock) {
    if let vcRendererError = error as? VcRendererException {
      reject(vcRendererError.errorCode, vcRendererError.message, vcRendererError)
    } else {
      let nsError = NSError(domain: error.localizedDescription, code: 0)
      reject("ERR_UNKNOWN", nsError.localizedDescription, nsError)
    }
  }
}
