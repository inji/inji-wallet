import Foundation
import React
import InjiVcRenderer


@objc(InjiVcRenderer)
class RNInjiVcRenderer: NSObject {

  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }
  

  @objc(renderSvg:resolver:rejecter:)
  func renderSvg(vcJsonString: String,
                 resolve:  @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.global(qos: .userInitiated).async {
      do {
        print("::::VcJson: \(vcJsonString)")
        let renderer = InjiVcRenderer()
        let results = renderer.renderSvg(vcJsonString: vcJsonString)
        print("::::Rendered SVGs: \(results)")
        resolve(results)
      } catch {
        reject("INJI_VC_RENDER_ERROR", "Failed to render SVG", error)
      }
    }
  }
}
