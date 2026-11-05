import Foundation
import DeviceCheck
import CryptoKit
import React

/**
 * Bridges Apple's App Attest service (DCAppAttestService) to React Native so mimoto can verify
 * that a device key is registered from a genuine, unmodified instance of Inji Wallet.
 *
 * iOS counterpart of RNPlayIntegrityModule on Android.
 * See https://developer.apple.com/documentation/devicecheck/establishing-your-app-s-integrity
 */
@objc(RNAppAttestModule)
class RNAppAttestModule: NSObject, RCTBridgeModule {

  // UserDefaults is cleared on reinstall, matching the App Attest key's own lifecycle
  // (keys survive app updates but not reinstall, device migration or backup restore).
  private static let keyIdStorageKey = "inji.appAttest.keyId"

  static func moduleName() -> String! {
    return "RNAppAttestModule"
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }

  private var service: DCAppAttestService {
    return DCAppAttestService.shared
  }

  /// Not every device supports App Attest (e.g. the simulator); callers must bypass gracefully.
  @objc
  func isSupported(_ resolve: @escaping RCTPromiseResolveBlock,
                   reject: @escaping RCTPromiseRejectBlock) {
    resolve(service.isSupported)
  }

  /// Creates a new Secure Enclave key and returns its keyId. The keyId cannot be retrieved later.
  @objc
  func generateKey(_ resolve: @escaping RCTPromiseResolveBlock,
                   reject: @escaping RCTPromiseRejectBlock) {
    guard service.isSupported else {
      return reject("FEATURE_UNSUPPORTED", "App Attest is not supported on this device", nil)
    }
    service.generateKey { keyId, error in
      if let error = error {
        return self.rejectWith(error, reject)
      }
      guard let keyId = keyId else {
        return reject("APP_ATTEST_ERROR", "App Attest returned no key identifier", nil)
      }
      resolve(keyId)
    }
  }

  /**
   * Asks Apple to attest the key. clientDataHash = SHA-256(UTF-8(challenge)), as the server expects.
   * @param challenge the one-time value from the server (for Inji: the integrity nonce)
   * @return base64-encoded CBOR attestation object
   */
  @objc
  func attestKey(_ keyId: String,
                 challenge: String,
                 resolve: @escaping RCTPromiseResolveBlock,
                 reject: @escaping RCTPromiseRejectBlock) {
    let clientDataHash = Data(SHA256.hash(data: Data(challenge.utf8)))
    service.attestKey(keyId, clientDataHash: clientDataHash) { attestation, error in
      if let error = error {
        return self.rejectWith(error, reject)
      }
      guard let attestation = attestation else {
        return reject("APP_ATTEST_ERROR", "App Attest returned no attestation", nil)
      }
      resolve(attestation.base64EncodedString())
    }
  }

  /**
   * Convenience used for registration: reuses the stored keyId or creates one, attests it, and
   * applies Apple's retry rule: on serverUnavailable keep the key and retry later with it;
   * on any other error discard the keyId so the next attempt starts with a new key.
   * @return { keyId, attestation } with attestation base64-encoded
   */
  @objc
  func attest(_ challenge: String,
              resolve: @escaping RCTPromiseResolveBlock,
              reject: @escaping RCTPromiseRejectBlock) {
    guard service.isSupported else {
      return reject("FEATURE_UNSUPPORTED", "App Attest is not supported on this device", nil)
    }
    let attestWith: (String) -> Void = { keyId in
      let clientDataHash = Data(SHA256.hash(data: Data(challenge.utf8)))
      self.service.attestKey(keyId, clientDataHash: clientDataHash) { attestation, error in
        if let error = error {
          if (error as? DCError)?.code != .serverUnavailable {
            UserDefaults.standard.removeObject(forKey: RNAppAttestModule.keyIdStorageKey)
          }
          return self.rejectWith(error, reject)
        }
        guard let attestation = attestation else {
          return reject("APP_ATTEST_ERROR", "App Attest returned no attestation", nil)
        }
        resolve(["keyId": keyId, "attestation": attestation.base64EncodedString()])
      }
    }

    if let storedKeyId = UserDefaults.standard.string(forKey: RNAppAttestModule.keyIdStorageKey) {
      return attestWith(storedKeyId)
    }
    service.generateKey { keyId, error in
      if let error = error {
        return self.rejectWith(error, reject)
      }
      guard let keyId = keyId else {
        return reject("APP_ATTEST_ERROR", "App Attest returned no key identifier", nil)
      }
      UserDefaults.standard.set(keyId, forKey: RNAppAttestModule.keyIdStorageKey)
      attestWith(keyId)
    }
  }

  /// Optional: signs request data with the attested key. clientDataHash = SHA-256(UTF-8(clientData)).
  @objc
  func generateAssertion(_ keyId: String,
                         clientData: String,
                         resolve: @escaping RCTPromiseResolveBlock,
                         reject: @escaping RCTPromiseRejectBlock) {
    let clientDataHash = Data(SHA256.hash(data: Data(clientData.utf8)))
    service.generateAssertion(keyId, clientDataHash: clientDataHash) { assertion, error in
      if let error = error {
        return self.rejectWith(error, reject)
      }
      guard let assertion = assertion else {
        return reject("APP_ATTEST_ERROR", "App Attest returned no assertion", nil)
      }
      resolve(assertion.base64EncodedString())
    }
  }

  /// Forgets the stored keyId, e.g. after mimoto rejects the attestation.
  @objc
  func resetKey(_ resolve: @escaping RCTPromiseResolveBlock,
                reject: @escaping RCTPromiseRejectBlock) {
    UserDefaults.standard.removeObject(forKey: RNAppAttestModule.keyIdStorageKey)
    resolve(true)
  }

  // MARK: - Device key (Secure Enclave, ES256)
  //
  // The device key registered with mimoto and used to sign get-token device proofs. It lives in the
  // Secure Enclave and signs with ECDSA P-256 / SHA-256, matching the Android hardware keystore key.
  // It is kept separate from RNSecureKeystoreModule, whose iOS EC keys are not Secure Enclave keys and
  // sign with SHA-1. Like on Android, the key is not gated by biometrics: it proves the app install
  // and unlocks no user data.

  private static let deviceKeyTagPrefix = "io.mosip.inji.device-attestation."

  /// DER SubjectPublicKeyInfo header for an EC P-256 public key, followed by the 65-byte X9.62 uncompressed point.
  private static let p256SpkiHeader: [UInt8] = [
    0x30, 0x59, 0x30, 0x13, 0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01,
    0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07, 0x03, 0x42, 0x00,
  ]

  /// Returns the device key's public key as a PEM SubjectPublicKeyInfo, creating the key on first use.
  @objc
  func getOrCreateDeviceKey(_ alias: String,
                            resolve: @escaping RCTPromiseResolveBlock,
                            reject: @escaping RCTPromiseRejectBlock) {
    do {
      let privateKey = try findDeviceKey(alias) ?? createDeviceKey(alias)
      resolve(try publicKeyPem(privateKey))
    } catch let error as DeviceKeyError {
      reject(error.code, error.message, nil)
    } catch {
      reject("DEVICE_KEY_ERROR", error.localizedDescription, error)
    }
  }

  /**
   * Signs data with the device key using ECDSA P-256 / SHA-256.
   * @param dataBase64 base64 of the bytes to sign
   * @return base64 of the DER-encoded signature, as RNSecureKeystoreModule.signBytes returns on Android
   */
  @objc
  func signWithDeviceKey(_ alias: String,
                         dataBase64: String,
                         resolve: @escaping RCTPromiseResolveBlock,
                         reject: @escaping RCTPromiseRejectBlock) {
    guard let data = Data(base64Encoded: dataBase64) else {
      return reject("INVALID_INPUT", "Data to sign is not base64", nil)
    }
    do {
      guard let privateKey = try findDeviceKey(alias) else {
        return reject("DEVICE_KEY_NOT_FOUND", "Device key does not exist", nil)
      }
      var error: Unmanaged<CFError>?
      guard let signature = SecKeyCreateSignature(privateKey, .ecdsaSignatureMessageX962SHA256,
                                                  data as CFData, &error) as Data? else {
        let cause = error?.takeRetainedValue()
        return reject("SIGNING_FAILED", (cause as Error?)?.localizedDescription ?? "Signing failed", cause)
      }
      resolve(signature.base64EncodedString())
    } catch let error as DeviceKeyError {
      reject(error.code, error.message, nil)
    } catch {
      reject("DEVICE_KEY_ERROR", error.localizedDescription, error)
    }
  }

  @objc
  func deleteDeviceKey(_ alias: String,
                       resolve: @escaping RCTPromiseResolveBlock,
                       reject: @escaping RCTPromiseRejectBlock) {
    let status = SecItemDelete(deviceKeyQuery(alias) as CFDictionary)
    if status == errSecSuccess || status == errSecItemNotFound {
      resolve(true)
    } else {
      reject("DEVICE_KEY_ERROR", "Deleting the device key failed with status \(status)", nil)
    }
  }

  private struct DeviceKeyError: Error {
    let code: String
    let message: String
  }

  private func deviceKeyTag(_ alias: String) -> Data {
    return Data((RNAppAttestModule.deviceKeyTagPrefix + alias).utf8)
  }

  private func deviceKeyQuery(_ alias: String) -> [String: Any] {
    return [
      kSecClass as String: kSecClassKey,
      kSecAttrApplicationTag as String: deviceKeyTag(alias),
      kSecAttrKeyType as String: kSecAttrKeyTypeECSECPrimeRandom,
      kSecAttrKeyClass as String: kSecAttrKeyClassPrivate,
    ]
  }

  private func findDeviceKey(_ alias: String) throws -> SecKey? {
    var query = deviceKeyQuery(alias)
    query[kSecReturnRef as String] = true
    var item: CFTypeRef?
    let status = SecItemCopyMatching(query as CFDictionary, &item)
    switch status {
    case errSecSuccess:
      return (item as! SecKey)
    case errSecItemNotFound:
      return nil
    default:
      throw DeviceKeyError(code: "DEVICE_KEY_ERROR", message: "Looking up the device key failed with status \(status)")
    }
  }

  private func createDeviceKey(_ alias: String) throws -> SecKey {
    var error: Unmanaged<CFError>?
    guard let access = SecAccessControlCreateWithFlags(kCFAllocatorDefault,
                                                       kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
                                                       .privateKeyUsage, &error) else {
      throw DeviceKeyError(code: "DEVICE_KEY_ERROR", message: "Unable to create the device key access control")
    }
    let attributes: [String: Any] = [
      kSecAttrKeyType as String: kSecAttrKeyTypeECSECPrimeRandom,
      kSecAttrKeySizeInBits as String: 256,
      kSecAttrTokenID as String: kSecAttrTokenIDSecureEnclave,
      kSecPrivateKeyAttrs as String: [
        kSecAttrIsPermanent as String: true,
        kSecAttrApplicationTag as String: deviceKeyTag(alias),
        kSecAttrAccessControl as String: access,
      ],
    ]
    guard let key = SecKeyCreateRandomKey(attributes as CFDictionary, &error) else {
      let cause = error?.takeRetainedValue()
      throw DeviceKeyError(code: "SECURE_ENCLAVE_UNAVAILABLE",
                           message: (cause as Error?)?.localizedDescription ?? "Unable to create a Secure Enclave key")
    }
    return key
  }

  private func publicKeyPem(_ privateKey: SecKey) throws -> String {
    var error: Unmanaged<CFError>?
    guard let publicKey = SecKeyCopyPublicKey(privateKey),
          let point = SecKeyCopyExternalRepresentation(publicKey, &error) as Data?,
          point.count == 65 else {
      throw DeviceKeyError(code: "DEVICE_KEY_ERROR", message: "Unable to export the device public key")
    }
    let spki = Data(RNAppAttestModule.p256SpkiHeader) + point
    let body = spki.base64EncodedString(options: [.lineLength64Characters, .endLineWithLineFeed])
    return "-----BEGIN PUBLIC KEY-----\n\(body)\n-----END PUBLIC KEY-----"
  }

  private func rejectWith(_ error: Error, _ reject: RCTPromiseRejectBlock) {
    let code: String
    switch (error as? DCError)?.code {
    case .some(.serverUnavailable): code = "SERVER_UNAVAILABLE"
    case .some(.invalidKey): code = "INVALID_KEY"
    case .some(.invalidInput): code = "INVALID_INPUT"
    case .some(.featureUnsupported): code = "FEATURE_UNSUPPORTED"
    case .some(.unknownSystemFailure): code = "UNKNOWN_SYSTEM_FAILURE"
    default: code = "APP_ATTEST_ERROR"
    }
    reject(code, error.localizedDescription, error)
  }
}
