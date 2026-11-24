#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(VerifierModule, NSObject)

RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(startAdvertisement:(NSString *)advIdentifier)

RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(disconnect)

RCT_EXTERN_METHOD(sendVerificationStatus:(NSInteger)status)

@end
