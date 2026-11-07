# iOS mdoc development build

Open `ios/Inji.xcworkspace` in Xcode and select the **Inji** scheme. The workspace includes
both the app and CocoaPods; opening only `Inji.xcodeproj` omits the Pods project.

The current development dependency setup is:

| Component | Source                                                                                                    |
| --------- | --------------------------------------------------------------------------------------------------------- |
| OpenID4VP | `https://github.com/abhip2565/inji-openid4vp-ios-swift.git`, branch `feat/mdoc-proximity-device-response` |
| VCIClient | `https://github.com/abhip2565/inji-vci-client-ios-swift.git`, branch `build/mdoc-proximity-ovp`           |
| Tuvali    | `https://github.com/abhip2565/tuvali-ios-swift`, branch `feat/iso-mdoc-session`                           |
| SwiftCBOR | Shared fork `https://github.com/abhip2565/SwiftCBOR`, pinned by the workspace lockfile                    |
| CocoaPods | Existing `ios/Pods` installation and `Podfile.lock`                                                       |

Xcode now resolves OpenID4VP from the remote feature branch. Its library product is
**OpenID4VP**, linked to the Inji app target. `Package.resolved` records the exact commit.
A sibling OpenID4VP checkout is no longer required to build the wallet. VCIClient uses a companion manifest branch so its transitive OVP dependency requires the same branch; SwiftPM rejects combining its original `develop` requirement with the wallet’s feature branch. The existing wallet
bridges continue to import the same module; no additional library product should be added.

The existing `.xcode.env.local` selects the installed fnm Node binary for Xcode build phases.

From the wallet repository root, a simulator compile/link check is:

```sh
xcodebuild -workspace ios/Inji.xcworkspace -scheme Inji \
  -configuration Debug -sdk iphonesimulator \
  -destination 'generic/platform=iOS Simulator' \
  -skipPackageUpdates CODE_SIGNING_ALLOWED=NO build
```

For device compilation, replace the SDK/destination with `-sdk iphoneos` and
`-destination 'generic/platform=iOS'`. `CODE_SIGNING_ALLOWED=NO` validates compilation/linking;
it does not validate signing, provisioning, installation, or running on a physical phone.

The existing simulator configuration excludes arm64 because of the project's binary SDK
setup. This source build configuration was preserved; changing simulator architectures is
not an OpenID4VP package-linking fix.

## Earlier local-package verification on 2026-11-02

With Xcode 26.6, the current workspace successfully completed Debug compile/link builds for
both the iOS Simulator and arm64 iOS device SDKs, with signing disabled. The build logs include
successful OpenID4VP product linkage and compilation of both wallet Swift bridges. Package
resolution also succeeded using Xcode's default cache location (without a custom DerivedData
argument), resolving OpenID4VP to the local sibling checkout.

No OpenID4VP linker failure was reproduced. No speculative package/project changes were made.
Xcode computer access was unavailable, so the active window's scheme/destination was not
changed. Signing, provisioning, and device installation were not validated.

## Remote branch verification on 2026-11-02

The wallet now uses these remote branch pins:

- OpenID4VP `feat/mdoc-proximity-device-response` at `af5d76d0ff8878bd00bcfee2c9d07d33901f52ef`.
- VCIClient `build/mdoc-proximity-ovp` at `7f666d6e41e842e0f72794164105262143710fdd`.

VCIClient's companion commit changes only two manifest dependency entries: its OVP URL/branch
and its SwiftCBOR URL. This resolves the incompatible `develop`/feature-branch requirements.
It is based on the previously pinned VCIClient revision and contains no unrelated library changes.
The existing local VCIClient working changes were preserved in their original checkout.

Package resolution and Debug builds for both Simulator and arm64 iOS completed successfully
using the downloaded remote packages and `-onlyUsePackageVersionsFromResolvedFile`.
Code signing was disabled; no signing/provisioning/device-run claim is made. The Swift ASN.1
pin was retained at the earlier version instead of accepting an unrelated resolver upgrade.
