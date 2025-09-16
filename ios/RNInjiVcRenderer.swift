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


    @objc(renderVC:wellKnown:vcJsonString:resolver:rejecter:)
    func renderVC(
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
            let format = CredentialFormat.fromValue(credentialFormat)
            let result = try renderer.renderVC(
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
