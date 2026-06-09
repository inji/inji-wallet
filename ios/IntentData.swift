import Foundation

@objc public class IntentData: NSObject {
  @objc public static let shared = IntentData()
  private let syncQueue = DispatchQueue(label: "com.intentdata.syncQueue", attributes: .concurrent)
  private var qrData: String = ""
  private var ovpQrData: String = ""
  private var credentialOfferData: String = ""

  private override init() {
    super.init()
  }

  @objc public func getQrData() -> String {
    var data: String = ""
    syncQueue.sync {
      data = qrData
    }
    return data
  }

  @objc public func setQrData(_ newValue: String) {
    syncQueue.async(flags: .barrier) {
      self.qrData = newValue
    }
  }

  @objc public func getOvpQrData() -> String {
    var data: String = ""
    syncQueue.sync {
      data = ovpQrData
    }
    return data
  }

  @objc public func setOvpQrData(_ newValue: String) {
    syncQueue.async(flags: .barrier) {
      self.ovpQrData = newValue
    }
  }

  // Read-once-and-clear: returning the URI also wipes the native bucket
  // so a re-entry of app.ready.focus.active cannot replay the same intent.
  @objc public func getCredentialOfferData() -> String {
    var data: String = ""
    syncQueue.sync(flags: .barrier) {
      data = self.credentialOfferData
      self.credentialOfferData = ""
    }
    return data
  }

  @objc public func setCredentialOfferData(_ newValue: String) {
    syncQueue.async(flags: .barrier) {
      self.credentialOfferData = newValue
    }
  }

  func getDataByFlow(_ flowType: String?) -> String {
    switch flowType {
    case "qrLoginFlow":
      return getQrData()
    case "ovpFlow":
      return getOvpQrData()
    case "credentialOfferFlow":
      return getCredentialOfferData()
    default:
      return ""
    }
  }

  func resetDataByFlow(_ flowType: String) {
    switch flowType {
    case "qrLoginFlow":
      setQrData("")
    case "ovpFlow":
      setOvpQrData("")
    case "credentialOfferFlow":
      setCredentialOfferData("")
    default:
      break
    }
  }
  
}
