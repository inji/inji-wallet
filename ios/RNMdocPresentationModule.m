#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(InjiMdocPresentation, NSObject)

RCT_EXTERN_METHOD(present:(NSString *)optionsJson
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(cancel)

RCT_EXTERN_METHOD(sendMdocDecisionFromJS:(NSString *)decisionJson)

RCT_EXTERN_METHOD(sendMdocSignatureFromJS:(NSString *)signatureJson)

RCT_EXTERN_METHOD(addListener:(NSString *)eventName)

RCT_EXTERN_METHOD(removeListeners:(double)count)

@end
