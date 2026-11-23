import Foundation
import React
import UIKit

@objc(ScreenBrightness)
class RNScreenBrightnessModule: RCTEventEmitter {
  private var previousBrightness: CGFloat?
  private var expectedBrightness: CGFloat?
  private var hasExternalBrightnessChange = false
  private var isBoostApplied = false
  private var hasEventListeners = false

  override init() {
    super.init()
    NotificationCenter.default.addObserver(
      self, selector: #selector(suspendBoost),
      name: UIApplication.willResignActiveNotification, object: nil
    )
    NotificationCenter.default.addObserver(
      self, selector: #selector(brightnessChanged),
      name: UIScreen.brightnessDidChangeNotification, object: nil
    )
  }

  @objc
  func setBoostEnabled(_ enabled: Bool, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      if enabled && UIApplication.shared.applicationState == .active {
        if self.previousBrightness == nil {
          self.previousBrightness = UIScreen.main.brightness
          self.expectedBrightness = self.previousBrightness
        }
        self.brightnessChanged()
        guard !self.hasExternalBrightnessChange else { return resolve(false) }
        self.expectedBrightness = 1
        UIScreen.main.brightness = 1
        self.setBoostApplied(true)
        resolve(true)
      } else {
        self.suspendBoost()
        resolve(false)
      }
    }
  }

  @objc
  func releaseBoost(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      self.endBoost()
      resolve(nil)
    }
  }

  @objc private func suspendBoost() {
    brightnessChanged()
    if isBoostApplied && !hasExternalBrightnessChange, let previous = previousBrightness {
      expectedBrightness = previous
      UIScreen.main.brightness = previous
    }
    setBoostApplied(false)
  }

  @objc private func brightnessChanged() {
    guard previousBrightness != nil, let expected = expectedBrightness else { return }
    let brightness = UIScreen.main.brightness
    // Our own boost/restoration also emits notifications. Only external changes yield control.
    guard abs(brightness - expected) > 0.001 else { return }
    hasExternalBrightnessChange = true
    expectedBrightness = brightness
    setBoostApplied(false)
  }

  private func endBoost() {
    suspendBoost()
    previousBrightness = nil
    expectedBrightness = nil
    hasExternalBrightnessChange = false
  }

  private func setBoostApplied(_ applied: Bool) {
    guard isBoostApplied != applied else { return }
    isBoostApplied = applied
    if hasEventListeners {
      sendEvent(withName: "onBrightnessBoostChanged", body: ["isBoostApplied": applied])
    }
  }

  override func supportedEvents() -> [String]! {
    return ["onBrightnessBoostChanged"]
  }

  override func startObserving() {
    DispatchQueue.main.async { self.hasEventListeners = true }
  }

  override func stopObserving() {
    DispatchQueue.main.async { self.hasEventListeners = false }
  }

  override func invalidate() {
    NotificationCenter.default.removeObserver(self)
    DispatchQueue.main.async {
      self.hasEventListeners = false
      self.endBoost()
    }
    super.invalidate()
  }

  override static func moduleName() -> String {
    return "ScreenBrightness"
  }

  override static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
