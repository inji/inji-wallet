#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(VCVerifierModule, NSObject)

RCT_EXTERN_METHOD(
  getCredentialStatus:
  (NSString *)credential
  format:(NSString *)format
  resolve:(RCTPromiseResolveBlock)resolve
  reject:(RCTPromiseRejectBlock)reject
)

@end
