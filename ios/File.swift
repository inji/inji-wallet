//
//  File.swift
//  Inji
//
//  Created by Kiruthika J on 16/12/25.
//


var formattedVPTokenSigningResults: [FormatType: VPTokenSigningResult] = [:]

        for (credentialFormat, vpTokenSigningResult) in vpTokenSigningResults {
          switch credentialFormat {
          case FormatType.ldp_vc.rawValue:
            guard let vpResponse = vpTokenSigningResult as? [String: Any],
                     let signatureAlgorithm = vpResponse["signatureAlgorithm"] as? String else {
                   reject("OPENID4VP", "Invalid VP token signing result for LDP_VC", nil)
                   return
               }

               let jws = vpResponse["jws"] as? String
               let proofValue = vpResponse["proofValue"] as? String
            formattedVPTokenSigningResults[.ldp_vc] = LdpVPTokenSigningResult(jws: jws, proofValue: proofValue, signatureAlgorithm: signatureAlgorithm)

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
            
          case FormatType.vc_sd_jwt.rawValue :
            guard let vpResponse = vpTokenSigningResult as? [String:String] else {
              reject("OPENID4VP", "Invalid VP token signing result format", nil)
              return
            }
            formattedVPTokenSigningResults[.vc_sd_jwt] = SdJwtVpTokenSigningResult(uuidToKbJWTSignature: vpResponse)
          case FormatType.dc_sd_jwt.rawValue :
            guard let vpResponse = vpTokenSigningResult as? [String:String] else {
              reject("OPENID4VP", "Invalid VP token signing result format", nil)
              return
            }
            formattedVPTokenSigningResults[.dc_sd_jwt] = SdJwtVpTokenSigningResult(uuidToKbJWTSignature: vpResponse)

          default:
            let error = NSError(domain: "Credential format '\(credentialFormat)' is not supported", code: 0)
            rejectWithOpenID4VPError(error, reject: reject)
            return
          }
        }