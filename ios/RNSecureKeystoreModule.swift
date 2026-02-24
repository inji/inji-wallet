import Foundation
import Security
import React
import securekeystore

@objc(RNSecureKeystoreModule)
class RNSecureKeystoreModule: NSObject,RCTBridgeModule {
  static func moduleName() -> String! {
    return "RNSecureKeystoreModule"
  }
  
  
  private var secureKeystore:SecureKeystoreProtocol
  
  override init() {
    self.secureKeystore=SecureKeystoreImpl()
  }
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  @objc
  func generateKeyPair(_ type: String, isAuthRequired: Bool, authTimeout: Int, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let successLambda: (String) -> Void = { success in
      resolve(success)
    }
    
    let failureLambda: (String, String) -> Void = { code, message in
      reject(code, message, nil)
    }
    var tag=""
    if(type=="RS256")
    {
      tag="RSA"
    }
    else
    {
      tag="ECR1"

    }
      
      secureKeystore.generateKeyPair(type: tag, tag: tag, isAuthRequired: isAuthRequired, authTimeout: Int32(authTimeout), onSuccess: successLambda, onFailure: failureLambda)
      }
  
  @objc
  func deleteKeyPair(_ tag: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let successLambda: (Bool) -> Void = { success in
      resolve(success)
    }
    
    let failureLambda: (String, String) -> Void = { code, message in
      reject(code, message, nil)
    }
    
    
    secureKeystore.deleteKeyPair(tag: tag,onSuccess: successLambda,onFailure: failureLambda)
  }
  
  @objc
  func hasAlias(_ tag: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let successLambda: (Bool) -> Void = { success in
      resolve(success)
    }
    
    let failureLambda: (String, String) -> Void = { code, message in
      reject(code, message, nil)
    }
    
    secureKeystore.hasAlias(tag: tag,onSuccess: successLambda,onFailure: failureLambda)
  }
  
  @objc
  func sign(_ signAlgorithm: String, alias: String, data: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let successLambda: (String) -> Void = { success in
      resolve(success)
    }
    
    let failureLambda: (String, String) -> Void = { code, message in
      reject(code, message, nil)
    }
    var tag=""
    if(alias=="RS256")
    {
      tag="RSA"
    }
    else
    {
      tag="ECR1"

    }
    secureKeystore.sign(signAlgorithm: tag,alias: tag,data: data,onSuccess: successLambda,onFailure: failureLambda)
  }
  
  @objc
  func storeGenericKey(_ publickKey:String,privateKey:String, account: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let successLambda: (Bool) -> Void = { success in
      resolve(success)
    }
    
    let failureLambda: (String, String) -> Void = { code, message in
      reject(code, message, nil)
    }
    
    secureKeystore.storeGenericKey(publicKey: publickKey, privateKey: privateKey, account: account, onSuccess: successLambda, onFailure: failureLambda)
  }

  @objc
  func storeData(_ key:String,value:String,resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let successLambda: (Bool) -> Void = { success in
      resolve(success)
    }
    
    let failureLambda: (String, String) -> Void = { code, message in
      reject(code, message, nil)
    }
    
    secureKeystore.storeGenericKey(publicKey: value, privateKey: "", account: key, onSuccess: successLambda, onFailure: failureLambda)
  }
  
  @objc
  func retrieveGenericKey(_ account: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let successLambda: (String?,String?) -> Void = { privateKey,publicKey in
      let keyPair=[privateKey,publicKey]
      resolve(keyPair)
      
    }
    
    let failureLambda: (String, String) -> Void = { code, message in
      reject(code, message, nil)
    }
    
    secureKeystore.retrieveGenericKey(account: account,onSuccess: successLambda,onFailure: failureLambda)
  }

  @objc
  func getData(_ key: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock)
  {
     let successLambda: (String?,String?) -> Void = { privateKey,publicKey in
      let keyPair=[privateKey,publicKey]
      resolve(keyPair)
      
    }
    
    let failureLambda: (String, String) -> Void = { code, message in
      reject(code, message, nil)
    }
    
    secureKeystore.retrieveGenericKey(account: key,onSuccess: successLambda,onFailure: failureLambda)
  }

  @objc
  func hasBiometricsEnabled(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        let success = secureKeystore.hasBiometricsEnabled()
        resolve(success)
    }

    @objc
    func getSupportedBiometricType(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        let biometricType = secureKeystore.getSupportedBiometricType()
        resolve(biometricType)
    }

    @objc
    func updatePopup(_ title: String, desc: String) {
        secureKeystore.updatePopup(title: title, desc: desc)
    }
    
    @objc
    func generateKey(_ alias: String, authRequired: Bool, authTimeout: Int, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        let successLambda: (Bool) -> Void = { success in
            resolve(success)
        }
        
        let failureLambda: (String, String) -> Void = { code, message in
            reject(code, message, nil)
        }
        
        secureKeystore.generateKey(alias: alias, authRequired: authRequired, authTimeout: Int32(authTimeout), onSuccess: successLambda, onFailure: failureLambda)
    }
    
    @objc
    func encryptData(_ alias: String, data: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        let successLambda: (String) -> Void = { encryptedData in
            resolve(encryptedData)
        }
        
        let failureLambda: (String, String) -> Void = { code, message in
            reject(code, message, nil)
        }
        
        secureKeystore.encryptData(alias: alias, data: data, onSuccess: successLambda, onFailure: failureLambda)
    }
    
    @objc
    func decryptData(_ alias: String, data: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        let successLambda: (String) -> Void = { decryptedData in
            resolve(decryptedData)
        }
        
        let failureLambda: (String, String) -> Void = { code, message in
            reject(code, message, nil)
        }
        
        secureKeystore.decryptData(alias: alias, data: data, onSuccess: successLambda, onFailure: failureLambda)
    }
    
    @available(iOS 13.0, *)
    @objc
    func generateHmacshaKey(_ alias: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        let successLambda: (Bool) -> Void = { success in
            resolve(success)
        }
        
        let failureLambda: (String, String) -> Void = { code, message in
            reject(code, message, nil)
        }
        
        secureKeystore.generateHmacshaKey(alias: alias, onSuccess: successLambda, onFailure: failureLambda)
    }
    
    @available(iOS 13.0, *)
    @objc
    func generateHmacSha(_ alias: String, data: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        let successLambda: (String?) -> Void = { hash in
            resolve(hash)
        }
        
        let failureLambda: (String, String) -> Void = { code, message in
            reject(code, message, nil)
        }
        
        secureKeystore.generateHmacSha(alias: alias, data: data, onSuccess: successLambda, onFailure: failureLambda)
    }
    
    @objc
    func clearKeys(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        let successLambda: (Bool) -> Void = { success in
            resolve(success)
        }
        
        let failureLambda: (String, String) -> Void = { code, message in
            reject(code, message, nil)
        }
        
        secureKeystore.clearKeys(onSuccess: successLambda, onFailure: failureLambda)
    }

  @objc
  func retrieveKey(_ alias:String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock){
    let successLambda: (String) -> Void = { success in
      resolve(success)
    }
    
    let failureLambda: (String, String) -> Void = { code, message in
      reject(code, message, nil)
    }
    secureKeystore.retrieveKey(tag: alias, onSuccess: successLambda, onFailure: failureLambda)
  }
  
  @objc
    func storeValueInCloud(_ key: String, value: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        let successLambda: (Bool) -> Void = { success in
            resolve(success)
        }
        
        let failureLambda: (String, String) -> Void = { code, message in
            reject(code, message, nil)
        }
        
        secureKeystore.storeValueInCloud(key: key, value: value, onSuccess: successLambda, onFailure: failureLambda)
    }
    
    @objc
    func retrieveValueFromCloud(_ key: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        let successLambda: (String?) -> Void = { value in
            resolve(value)
        }
        
        let failureLambda: (String, String) -> Void = { code, message in
            reject(code, message, nil)
        }
        
        secureKeystore.retrieveValueFromCloud(key: key, onSuccess: successLambda, onFailure: failureLambda)
    }
  
  
}
