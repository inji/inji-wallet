#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(InjiVcRenderer, NSObject)

RCT_EXTERN_METHOD(init:(NSString *)traceabilityId)

RCT_EXTERN_METHOD(renderVC:(NSString *)vcJsonString
                  wellKnown:(NSString *)wellKnown
                  credentialFormat:(NSString *)credentialFormat
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
