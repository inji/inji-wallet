#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(InjiOpenID4VP, NSObject)

RCT_EXTERN_METHOD(initSdk:(NSString *)appId
                  walletConfig:(id)walletConfig
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(sendJsonLdCanonicalizeResultFromJS:(NSString *)result)
RCT_EXTERN_METHOD(notifyCanonicalizationFailureFromJS:(NSString *)code
                  message:(NSString *)message
                  )

RCT_EXTERN_METHOD(authenticateVerifier:(NSString *)urlEncodedAuthorizationRequest
                  shouldValidateClient:(BOOL)shouldValidateClient
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(sendJsonLdExpandResultFromJS:(id)result
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  )

RCT_EXTERN_METHOD(getMatchingCredentials:(id)vpRequest
                  availableWalletCredentials:(id)availableWalletCredentials
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(constructUnsignedVPToken:(id)credentialsMap
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(constructUnsignedVPTokenDCQL:(id)credentialsMap
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(shareVerifiablePresentation:(id)vpResponseMetadata
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(sendErrorToVerifier:(NSString *)error
                  :(NSString *)errorCode
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(requiresMainQueueSetup:(BOOL))

@end
