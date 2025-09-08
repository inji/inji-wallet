## Support of credential format vc+sd-jwt/dc+sd-jwt in Inji Wallet

This document provides a comprehensive overview of the process for downloading and rendering an IETF SD-JWT VC, adhering to the OpenID4VCI specification.

### Scope
- SD-JWT VC download, verification, and rendering in Inji Wallet.
- `vc+sd-jwt` / `dc+sd-jwt` credential format for SD-JWT. All non-normative examples are referred for `vc+sd-jwt` format.
- Cryptographic Key Binding - JWK is being used for cryptographic key binding in SD-JWT VC.


### Actors involved
1. Inji Wallet
2. Issuing authority
3. _inji-vci-client_ (Library for downloading credential)
4. _vc-verifier_ (library for verification of downloaded VC)

###  Sequence diagram - download & view vc+sd-jwt credential format VC for Wallet Initiated Flow

```mermaid
sequenceDiagram
  participant W as Inji Wallet (Mobile App)
  participant VCI_Lib as Inji VCI Client (Library)
  participant Issuer as Issuing Authority
  participant VCVerifier as VC Verifier (Library)

  W ->> VCI_Lib: 1. Get Issuer Metadata for given credential issuer
  VCI_Lib ->> Issuer: 2. Fetch Issuer Metadata (GET /.well-known/openid-credential-issuer)
  Issuer -->> VCI_Lib: 3. Return Issuer well-known metadata
  Note over VCI_Lib: Issuer Metadata is temporarily cached
  VCI_Lib -->> W: 4. Return Issuer well-known metadata
  Note over W: Cache the Issuer Metadata for future use
  Note over W: User selects one of the supported credentials
  W ->> VCI_Lib: 5. Request Credential from Issuer
  VCI_Lib -->> W: 6. Authorize user for credential request and get authorization code
  W ->> VCI_Lib: 7. Provide authorization code
  VCI_Lib -->> W: 8. Get access token to access credential endpoint from authorized wallet
  W ->> VCI_Lib: 9. Provide access token
  W ->> VCI_Lib: 11. Provide jwt proof
  VCI_Lib -->> W: 10. Get jwt proof - proof of possession to bind the credential to wallet
  VCI_Lib ->> Issuer: 12. Credential Request
  Note over VCI_Lib: Construct the request body for credential request
  Issuer -->> VCI_Lib: 13. Return vc+sd-jwt format specific Credential response
  VCI_Lib -->> W: 14. Return vc+sd-jwt Credential
  W ->> VCVerifier: 15. Verify sd-jwt Credential
  VCVerifier -->> W: 16. Return Verification Result
  Note over W: If verification is successful, proceed to save the credential
  Note over W: Use cached Issuer Metadata for rendering
  

```

#### Steps involved
##### 1. Get Issuer Metadata

Establish communication with the _inji-vci-client_
Fetch Issuer Metadata

````
VCIClient.getIssuerMetadata(credentialIssuer)

Note: credentialIssuer is Credential Issuer Uri received from trusted issuers list.
````

##### 2. Fetch Issuer Metadata
The _inji-vci-client_ fetch issuer's metadata from issuing authority.

````
GET credentialIssuer/.well-known/openid-credential-issuer
````


##### 3. Receive Issuer Metadata Response
_inji-vci-client_ receives Issuer's metadata response.

````
{  
    "credential_issuer": "https://example.com/issuer",
    "credential_endpoint": "https://example.com/issuer/credential",    
    "credential_configurations_supported": 
    {
      "SD_JWT_VC_example_in_OpenID4VCI": {
        "format": "vc+sd-jwt",
        "scope": "vc_scope",
        "claims": {
            "cliam1": {
                "display": [
                {
                    "name": "Claim 1",
                    "locale": "en"
                }
                ]
              },
            "claim2": {
                "display": [
                {
                    "name": "Claim 1",
                    "locale": "en"
                }
                ]
              }
        },
        "vct": "SD_JWT_VC_example_in_OpenID4VCI",
      }
    }
}
````

##### 4. Return Issuer Metadata Response
Once the response is received in _inji-vci-client_, it is returned to the Wallet.

##### 5. Request Credential from Issuer

````
VCIClient.requestCredentialFromTrustedIssuer(
  credentialIssuer,
  credentialConfigurationId,
  clientMetadata,
  authorizeUser: () -> authcode,
  getTokenResponse: () -> tokenResponse,
  getProofJwt: () -> proof
)

Note: 
- credentialIssuer is Credential Issuer Uri received from trusted issuers list.
- credentialConfigurationId is one of the supported credential configuration id user has selected.
- clientMetadata for client authentication - client-id and redirect-uri
- authorizeUser is a callback function to authorize the user for the credential request and return authorization code.
- getTokenResponse is a callback function to get the token response from the authorization server.
- getProofJwt is a callback function to create the proof JWT for the credential request.
````


##### 6. Authorize user for credential request and get authorization code
_inji-vci-client_ uses `authorizeUser` callback function to authorize the user for the credential request.
This typically involves redirecting the user to an authorization server where they can log in and grant permission
for the credential request.
Once authorization code is received, _inji-vci-client_ uses `getTokenResponse` callback function to exchange the
authorization code for an access token.
For more details check [VCI Client Library](https://github.com/mosip/inji-vci-client/blob/master/kotlin/README.md)

##### 7. Provide authorization code
When the user has successfully authorized, the _inji-vci-client_ will receive an authorization code and return it back
to _inji-vci-client_.


##### 8. Get access token to access credential endpoint from authorized wallet
Once authorization code is received, _inji-vci-client_ uses `getTokenResponse` callback function to exchange the
authorization code for an access token.

##### 9. Provide access token
Wallet receives the token request from _inji-vci-client_. It makes an api call to get access token from authroization
server and return it back to _inji-vci-client_.

##### 10. Get jwt proof - proof of possession to bind the credential to wallet
Once access token is received, _inji-vci-client_ uses `getProofJwt` callback function to create the proof JWT for the
credential request.

##### 11. Provide jwt proof
Wallet constructs JWT proof and return it back to _inji-vci-client_.

##### 12. Create Credential Request and send to Issuing Authority
_inji-vci-client_ will use `CredentialRequestFactory` and create `SdJwtCredentialRequest` request with following body:

````
{
   "format": "vc+sd-jwt",
   "vct": "SD_JWT_VC_example_in_OpenID4VCI"
   "proof": {
      "proof_type": "jwt",
      "jwt": "eyJraWQiOiJkaWQ6ZXhhbXBsZ...KPxgihac0aW9EkL1nOzM"
   }
}

````
and send it to the issuing authority.

##### 13. Receive the Credential Response
The _inji-vci-client_ receives the credential response as jwt string

```
"eyJraWQiOiJkaWQ6ZXhhbXBsZ.eyJpc3N1YW5jZURhdGUiOiIyM.KPxgihac0aW9EkL1nOzM~disclousure1~disclousure1~"
```

##### 14. Return the Credential Response
Once the response is received in _inji-vci-client_, it is returned to the Wallet.

````
{
  "credential": "eyJraWQiOiJkaWQ6ZXhhbXBsZ.eyJpc3N1YW5jZURhdGUiOiIyM.KPxgihac0aW9EkL1nOzM~disclousure1~disclousure1~",
  "credentialIssuer": "https://example.com/issuer",
  "credentialConfigurationId": "SD_JWT_VC_example_in_OpenID4VCI"
}
````

##### 15. Perform vc verification
After obtaining the credential from the issuing authority through the _inji-vci-client_ library, a verification process ensures that the issued Verifiable Credential (VC) remains unaltered through _vc-verifier_ library.

_vc-verifier_ will use `CredentialVerifierFactory` and create `SdJwtVerifiableCredential` to perform validation and verification of the credential.

1. [x] Confirm the credential is not tampered. (Cryptographic Signature Verification)
2. [x] Disclosure Verification to confirm sd claims are not tampered. (Cryptographic Hash Verification)

````
VCVerifier.verify(
  credential: "eyJraWQiOiJkaWQ6ZXhhbXBsZ.eyJpc3N1YW5jZURhdGUiOiIyM.KPxgihac0aW9EkL1nOzM~disclousure1~disclousure1~",
  credentialFormat: "vc+sd-jwt"
)
````

##### 16. Return VC verification Result
After verifying the VC, return verification result

````
{
    "verificationStatus": true,
    "verificationMessage": "",
    "verificationErrorCode": null
}

````

- #####  VC Rendering:
  - Field Labels:
    The labels displayed for each field are derived from the Credential Issuer's metadata claims under the display attribute.
    Reference: OpenID4VCI Spec - Credential Issuer Metadata.
  - Field Ordering:
    - As per OpenID4VCI Draft 13, the order property in the issuer’s well-known configuration defines the order of fields to be displayed.

This structured approach ensures that the credential is rendered accurately and efficiently while maintaining a lightweight storage and transmission footprint.


### Out of scope
- Revocation - Inji Wallet doesn't support revocation for any credential format. So this document does not cover revocation of IETF SD-JWT VC.
- SVG Rendering - Inji Wallet does not support SVG rendering for any credential format. So this document does not cover SVG rendering of IETF SD-JWT VC.