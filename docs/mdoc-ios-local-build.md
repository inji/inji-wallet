# Building the mdoc proximity integration

Open `ios/Inji.xcworkspace` and select the Inji scheme. The app links Tuvali for the native
session and OpenID4VP for DeviceResponse construction; JavaScript provides consent and holder
signatures using the existing wallet signing helper.

## Remote Swift dependencies

| Component | Source                                                     | Integration branch                  |
| --------- | ---------------------------------------------------------- | ----------------------------------- |
| Tuvali    | https://github.com/abhip2565/tuvali-ios-swift              | `pr/iso-mdoc-session`               |
| OpenID4VP | https://github.com/abhip2565/inji-openid4vp-ios-swift.git  | `pr/mdoc-proximity-device-response` |
| VCIClient | https://github.com/abhip2565/inji-vci-client-ios-swift.git | `pr/mdoc-proximity-ovp`             |

The workspace lockfile pins exact revisions. VCIClient must require the same OpenID4VP branch:
SwiftPM rejects conflicting branch requirements for the same package identity. SwiftCBOR uses
the common fork already required by the wallet dependencies. No sibling Swift checkout is needed.
These are integration references; promote them to upstream merged/released dependencies before
merging the wallet feature.

After installing npm dependencies and CocoaPods, resolve and compile without signing:

```sh
xcodebuild -workspace ios/Inji.xcworkspace -scheme Inji \
  -resolvePackageDependencies -onlyUsePackageVersionsFromResolvedFile
xcodebuild -workspace ios/Inji.xcworkspace -scheme Inji \
  -configuration Debug -sdk iphoneos -destination 'generic/platform=iOS' \
  -onlyUsePackageVersionsFromResolvedFile CODE_SIGNING_ALLOWED=NO build
```

The existing simulator architecture exclusions are retained for binary SDK compatibility.
Unsigned compile/link checks do not validate provisioning or installation.

## Android dependencies and merge gate

The draft wallet integration currently uses `io.inji:tuvali:1.0.0-mdoc-local` and
`io.inji:inji-openid4vp-aar:1.0.0-mdoc-local` from Maven local. These coordinates are **not
published**. A clean checkout cannot build the mdoc native bridge until matching library artifacts
are published, or a developer builds/publishes the companion sources locally. The PR remains a
draft until both dependencies use published versions. Do not silently fall back to older artifacts:
they do not expose the mdoc APIs.

Use JDK 17 and the Android SDK to build:

```sh
cd android
./gradlew :app:assembleResidentappDebug -PreactNativeArchitectures=arm64-v8a --max-workers=4
```

## Final review validation

The integrated wallet passed 4,719 tests across 335 suites and 330 snapshots. Native library
results: Tuvali Android 325, Tuvali iOS 368, OpenID4VP JVM 938, OpenID4VP Android 888 and
OpenID4VP Swift 936. Both Tuvali demos compile. The mock issuer passed 7 tests. Scoped mdoc lint
has no errors; existing repository lint errors remain outside the new feature. Physical iPhone
sharing completed with reader confirmation, including a Certify credential; an earlier intermittent
sending failure has not been reproduced or diagnosed. Full rendered Figma/device-size review,
translations and broader reader/device interoperability remain pending.
