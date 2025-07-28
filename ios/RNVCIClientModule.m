#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(InjiVciClient, NSObject)

// Initializes the VCIClient with a traceability ID
RCT_EXTERN_METHOD(init:(NSString *)traceabilityId)

// Requests a credential using a credential offer string and client metadata (both as JSON strings)
RCT_EXTERN_METHOD(requestCredentialByOffer:(NSString *)credentialOffer
                  clientMetadata:(NSString *)clientMetadata
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

// Requests a credential from a trusted issuer using issuer URI, configuration ID, and client metadata (all as strings)
RCT_EXTERN_METHOD(requestCredentialFromTrustedIssuer:(NSString *)credentialIssuer
                  credentialConfigurationId:(NSString *)credentialConfigurationId
                  clientMetadata:(NSString *)clientMetadata
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

// Gets issuer metadata (discovery)
RCT_EXTERN_METHOD(getIssuerMetadata:(NSString *)credentialIssuer
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

// Sends proof JWT back to native side (in response to onRequestProof)
RCT_EXTERN_METHOD(sendProofFromJS:(NSString *)jwtProof)

// Sends authorization code back to native side (in response to onRequestAuthCode)
RCT_EXTERN_METHOD(sendAuthCodeFromJS:(NSString *)authCode)

// Sends tx_code back to native side (in response to onRequestTxCode)
RCT_EXTERN_METHOD(sendTxCodeFromJS:(NSString *)txCode)

// Sends issuer trust decision (true/false) back to native side (in response to onCheckIssuerTrust)
RCT_EXTERN_METHOD(sendIssuerTrustResponseFromJS:(BOOL)isTrusted)

// Sends token response JSON back to native side (in response to onRequestTokenResponse)
RCT_EXTERN_METHOD(sendTokenResponseFromJS:(NSString *)tokenResponseJson)

// Required by React Native
RCT_EXTERN_METHOD(requiresMainQueueSetup:(BOOL)isRequired)

@end
