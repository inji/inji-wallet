#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>

#import <ExpoModulesCore-Swift.h>
#import "Inji-Swift.h"

@implementation AppDelegate

typedef NS_ENUM(NSInteger, URLScheme) {
    URLSchemeInji,
    URLSchemeOpenID4VP,
    URLSchemeCredentialOffer,
    URLSchemeUnknown
};

static NSString *const URLSchemeInjiValue = @"io.mosip.residentapp.inji";
static NSString *const URLSchemeOpenID4VPValue = @"openid4vp";
static NSString *const URLSchemeCredentialOfferValue = @"openid-credential-offer";

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"main";

  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@".expo/.virtual-metro-entry"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

/// This method controls whether the `concurrentRoot`feature of React18 is turned on or off.
///
/// @see: https://reactjs.org/blog/2022/03/29/react-v18.html
/// @note: This requires to be rendering on Fabric (i.e. on the New Architecture).
/// @return: `true` if the `concurrentRoot` feature is enabled. Otherwise, it returns `false`.
- (BOOL)concurrentRootEnabled
{
  return true;
}

// Linking API
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  [self handleIntent:url];
  return [super application:application openURL:url options:options] || [RCTLinkingManager application:application openURL:url options:options];
}

- (void)handleIntent:(NSURL *)url {
    
    URLScheme scheme = [self schemeFromURL:url];
    IntentData *intentData = [IntentData shared];
      
    switch (scheme) {
        case URLSchemeInji:
            [intentData setQrData:url.absoluteString];
            break;
        case URLSchemeOpenID4VP:
            [intentData setOvpQrData:url.absoluteString];
            break;
        case URLSchemeCredentialOffer:
            [intentData setCredentialOfferData:url.absoluteString];
            break;
        case URLSchemeUnknown:
            break;
    }
}

- (URLScheme)schemeFromURL:(NSURL *)url {
    if ([url.scheme isEqualToString:URLSchemeInjiValue]) {
        return URLSchemeInji;
    } else if ([url.scheme isEqualToString:URLSchemeOpenID4VPValue]) {
        return URLSchemeOpenID4VP;
    } else if ([url.scheme isEqualToString:URLSchemeCredentialOfferValue]) {
        return URLSchemeCredentialOffer;
    }
    return URLSchemeUnknown;
}

// Universal Links
- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler {
  BOOL result = [RCTLinkingManager application:application continueUserActivity:userActivity restorationHandler:restorationHandler];
  return [super application:application continueUserActivity:userActivity restorationHandler:restorationHandler] || result;
}

// Explicitly define remote notification delegates to ensure compatibility with some third-party libraries
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  return [super application:application didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

// Explicitly define remote notification delegates to ensure compatibility with some third-party libraries
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
  return [super application:application didFailToRegisterForRemoteNotificationsWithError:error];
}

// Explicitly define remote notification delegates to ensure compatibility with some third-party libraries
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  return [super application:application didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}

@end
