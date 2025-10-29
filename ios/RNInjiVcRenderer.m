#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(InjiVcRenderer, NSObject)

RCT_EXTERN_METHOD(init:(NSString *)traceabilityId)


RCT_EXTERN_METHOD(generateCredentialDisplayContent: (NSString *)credentialFormat
                  wellKnown:(NSString * _Nullable)wellKnown
                  vcJsonString:(NSString *)vcJsonString
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
