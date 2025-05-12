import Foundation
import OpenID4VP
import React

@objc(InjiOpenID4VP)
class RNOpenId4VpModule: NSObject, RCTBridgeModule {
  
  private var openID4VP: OpenID4VP?
  
  static func moduleName() -> String {
    return "InjiOpenID4VP"
  }
  
  @objc
  func `init`(_ appId: String) {
    openID4VP = OpenID4VP(traceabilityId: appId)
  }
  
  @objc
  func authenticateVerifier(_ urlEncodedAuthorizationRequest: String,
                            trustedVerifierJSON: AnyObject,
                            walletMetadata: AnyObject?,
                            shouldValidateClient: Bool,
                            resolver resolve: @escaping RCTPromiseResolveBlock,
                            rejecter reject: @escaping RCTPromiseRejectBlock) {
    Task {
      do {
        guard let verifierMeta = trustedVerifierJSON as? [[String:Any]] else {
          reject("OPENID4VP", "Invalid verifier meta format", nil)
          return
        }
        
        let trustedVerifiersList: [Verifier] = try verifierMeta.map { verifierDict in
          guard let clientId = verifierDict["client_id"] as? String,
                let responseUris = verifierDict["response_uris"] as? [String] else {
            throw NSError(domain: "", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid Verifier data"])
          }
          return Verifier(clientId: clientId, responseUris: responseUris)
        }
        
        let walletMetadataObject = try getWalletMetadataFromDict(walletMetadata as Any, reject: reject)
        
        let authenticationResponse: AuthorizationRequest = try await openID4VP!.authenticateVerifier(
          urlEncodedAuthorizationRequest: urlEncodedAuthorizationRequest,
          trustedVerifierJSON: trustedVerifiersList,
          walletMetadata: walletMetadataObject,
          shouldValidateClient: shouldValidateClient
        )
        
        let response = try toJsonString(jsonObject: authenticationResponse)
        resolve(response)
      } catch {
        reject("OPENID4VP", error.localizedDescription, error)
      }
    }
  }
  
  @objc
  func constructUnsignedVPToken(_ credentialsMap: AnyObject, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    Task {
      do {
        guard let credentialsMap = credentialsMap as? [String: [String: Array<Any>]] else {
          reject("OPENID4VP", "Invalid credentials map format", nil)
          return
        }
        
        let formattedCredentialsMap = credentialsMap.mapValues { selectedVcsFormatMap -> [FormatType: [Any]] in
          selectedVcsFormatMap.reduce(into: [:]) { result, entry in
            let (credentialFormat, credentialsArray) = entry
            switch FormatType(rawValue: credentialFormat) {
            case .ldp_vc:
              result[.ldp_vc] = credentialsArray
            case .mso_mdoc:
              result[.mso_mdoc] = credentialsArray
            default:
              reject("OPENID4VP", "Credential format is not supported for OVP", nil)
            }
          }
        }
        
        let response = try await openID4VP?.constructUnsignedVPToken(credentialsMap: formattedCredentialsMap)
        let encodableDict = response?.mapKeys { $0.rawValue }
          .mapValues { EncodableWrapper($0) }
        
        do {
          let jsonData = try JSONEncoder().encode(encodableDict) // Convert Enum to String
          if let jsonObject = try JSONSerialization.jsonObject(with: jsonData, options: []) as? [String: Any] {
            resolve(jsonObject)
          } else {
            reject("ERROR", "Failed to serialize JSON", nil)
          }
        } catch {
          reject("ENCODING_ERROR", error.localizedDescription, nil)
        }
        
      } catch {
        reject("OPENID4VP", error.localizedDescription, error)
      }
    }
  }
  
  @objc
  func shareVerifiablePresentation(_ vpTokenSigningResults: [String: Any], resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    Task {
      do {
        var formattedVPTokenSigningResults: [FormatType: VPTokenSigningResult] = [:]
        
        for (credentialFormat, vpTokenSigningResult) in vpTokenSigningResults {
          switch credentialFormat {
          case FormatType.ldp_vc.rawValue:
            guard let vpResponse = vpTokenSigningResult as? [String:Any] else {
              reject("OPENID4VP", "Invalid VP token signing result format", nil)
              return
            }
            guard let jws = vpResponse["jws"] as! String?,
                  let signatureAlgorithm = vpResponse["signatureAlgorithm"] as! String?,
                  let publicKey = vpResponse["publicKey"] as! String?,
                  let domain = vpResponse["domain"] as! String?
            else {
              reject("OPENID4VP", "Invalid VP token signing result", nil)
              return
            }
            
            formattedVPTokenSigningResults[FormatType.ldp_vc] = LdpVPTokenSigningResult(jws: jws, signatureAlgorithm: signatureAlgorithm, publicKey: publicKey, domain: domain)
          case FormatType.mso_mdoc.rawValue:
            var docTypeToDeviceAuthentication : [String: DeviceAuthentication] = [:]
            guard let vpResponse = vpTokenSigningResult as? [String:[String: String]] else {
              reject("OPENID4VP", "Invalid VP token signing result format", nil)
              return
            }
            for (docType, deviceAuthentication) in vpResponse {
              guard let signature = deviceAuthentication["signature"],
                    let algorithm = deviceAuthentication["mdocAuthenticationAlgorithm"] else {
                reject("OPENID4VP", "Invalid VP token signing result provided for mdoc format", nil)
                return
              }
              
              docTypeToDeviceAuthentication[docType] = DeviceAuthentication(signature: signature, algorithm: algorithm)
            }
            formattedVPTokenSigningResults[.mso_mdoc] = MdocVPTokenSigningResult(docTypeToDeviceAuthentication: docTypeToDeviceAuthentication)
            
            
          default:
            reject("OPENID4VP", "Invalid VP response meta format", nil)
          }
        }
        
        let response = try await openID4VP?.shareVerifiablePresentation(vpTokenSigningResults: formattedVPTokenSigningResults)
        
        resolve(response)
      } catch {
        reject("OPENID4VP", error.localizedDescription, error)
      }
    }
  }
  
  @objc
  func sendErrorToVerifier(_ error: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    Task {
      enum VerifierError: Error {
        case customError(String)
      }
      
      await openID4VP?.sendErrorToVerifier(error: VerifierError.customError(error))
      resolve(true)
    }
  }
  
  func toJsonString(jsonObject: AuthorizationRequest) throws -> String {
    let encoder = JSONEncoder()
    encoder.keyEncodingStrategy = .convertToSnakeCase
    let jsonData = try encoder.encode(jsonObject)
    
    if let jsonString = String(data: jsonData, encoding: .utf8) {
      return jsonString
    } else {
      throw NSError(domain: "Error converting JSON data to String", code: 0, userInfo: nil)
    }
  }
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
}

struct EncodableWrapper: Encodable {
  private let value: Encodable
  
  init(_ value: Encodable) {
    self.value = value
  }
  
  func encode(to encoder: Encoder) throws {
    try value.encode(to: encoder)
  }
}

extension Dictionary {
  func mapKeys<T: Hashable>(_ transform: (Key) -> T) -> [T: Value] {
    Dictionary<T, Value>(uniqueKeysWithValues: map { (transform($0.key), $0.value) })
  }
}

func getWalletMetadataFromDict(
  _ walletMetadata: Any,
  reject: RCTPromiseRejectBlock
) throws -> WalletMetadata {
  
  guard let metadata = walletMetadata as? [String: Any] else {
    reject("OPENID4VP", "Invalid wallet metadata format", nil)
    throw NSError(domain: "", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid Wallet Metadata data"])
  }
  
  var vpFormatsSupported: [String: VPFormatSupported] = [:]
  if
    let vpFormatsSupportedDict = metadata["vp_formats_supported"] as? [String: Any],
    let ldpVcDict = vpFormatsSupportedDict["ldp_vc"] as? [String: Any]
  {
    let algValuesSupported = ldpVcDict["alg_values_supported"] as? [String]
    vpFormatsSupported["ldp_vc"] = VPFormatSupported(algValuesSupported: algValuesSupported)
  } else {
    vpFormatsSupported["ldp_vc"] = VPFormatSupported(algValuesSupported: nil)
  }
  
  let walletMetadataObject = try WalletMetadata(
    presentationDefinitionURISupported: metadata["presentation_definition_uri_supported"] as? Bool,
    vpFormatsSupported: vpFormatsSupported,
    clientIdSchemesSupported: metadata["client_id_schemes_supported"] as? [String],
    requestObjectSigningAlgValuesSupported: metadata["request_object_signing_alg_values_supported"] as? [String],
    authorizationEncryptionAlgValuesSupported: metadata["authorization_encryption_alg_values_supported"] as? [String],
    authorizationEncryptionEncValuesSupported: metadata["authorization_encryption_enc_values_supported"] as? [String]
  )
  
  return walletMetadataObject
}

