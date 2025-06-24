#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(InjiOpenID4VP, NSObject)

RCT_EXTERN_METHOD(init:(NSString *)appId)

RCT_EXTERN_METHOD(authenticateVerifier:(NSString *)urlEncodedAuthorizationRequest
                  trustedVerifierJSON:(id)trustedVerifierJSON
                  walletMetadata:(id)walletMetadata
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
