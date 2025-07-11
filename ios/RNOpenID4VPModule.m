#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(InjiOpenID4VP, NSObject)

RCT_EXTERN_METHOD(initSdk:(NSString *)appId
                  walletMetadata:(id)walletMetadata
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(authenticateVerifier:(NSString *)urlEncodedAuthorizationRequest
                  trustedVerifierJSON:(id)trustedVerifierJSON
                  shouldValidateClient:(BOOL)shouldValidateClient
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(constructUnsignedVPToken:(id)credentialsMap
                  holderId:(NSString *)holderId
                  signatureSuite:(NSString *)signatureSuite
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(shareVerifiablePresentation:(id)vpResponseMetadata
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(sendErrorToVerifier:(NSString *)error
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(requiresMainQueueSetup:(BOOL))

@end
