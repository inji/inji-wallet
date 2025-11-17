# Sample Credential Wallet

## Introduction

This README provides a step-by-step [guide](https://docs.inji.io/inji-wallet/inji-mobile/technical-overview/integration-guide/building-verifiable-credentials-wallet-with-inji-libraries#inji-libraries-used-for-building-a-custom-wallet) for developers to build their own Verifiable Credential (VC) wallet using the Inji [libraries](https://docs.inji.io/inji-wallet/inji-mobile/technical-overview/integration-guide). By leveraging Inji’s modular SDKs, developers can easily integrate core VC wallet capabilities such as downloading, storing, sharing, and verifying credentials. The implementation examples are based on Kotlin for Android, but the same libraries are also available in Swift for iOS, enabling developers to create secure, interoperable, and cross-platform wallet applications powered by Inji. The **Sample Verifiable Credential Wallet** is a **Kotlin-based Android application** that demonstrates the **end-to-end Verifiable Credential (VC) lifecycle** within the **Inji ecosystem** — covering:

- **Credential issuance** via [Inji Certify](https://docs.inji.io/inji-certify/overview)
- **Secure storage and management** through [Inji Libraries/SDKs](https://docs.inji.io/inji-wallet/inji-mobile/technical-overview/integration-guide)
- **Verification** using [Inji Verify](https://docs.inji.io/inji-verify/overview)

It serves as a reference implementation for developers integrating Inji Mobile Wallet library components to build secure and standards-compliant credential wallet applications.

### Purpose

The purpose of the Sample Credential Wallet is to help developers understand and implement the verifiable credential lifecycle using the Inji ecosystem. It demonstrates:

- Implementation of OpenID4VCI protocol for credential requests using Inji Library components
- Hardware-backed key generation and JWT signing for proof generation
- Full credential lifecycle — issuance → verification → storage

### Key Components

| Component       | Description                                                                           |
| --------------- | ------------------------------------------------------------------------------------- |
| Inji Certify    | Credential issuer implementing the OpenID4VCI protocol for secure issuance            |
| VCI Client      | OpenID4VCI client library handling authorization and credential download flows        |
| Secure Keystore | Android hardware-backed Keystore manager for RSA/EC key pair generation               |
| VC Verifier     | Verification library validating credential signatures and structure using vc verifier |

To get more details, click [here](https://docs.inji.io/inji-wallet/inji-mobile/technical-overview/integration-guide/building-verifiable-credentials-wallet-with-inji-libraries#inji-libraries-used-for-building-a-custom-wallet) !

**Integrated Libraries:**

- `inji-vci-client:0.5.0`
- `secure-keystore:0.3.0`
- `vcverifier-aar:1.4.0`

### Key Features

- **Keypair Generation** – RSA (RS256) and EC (ES256) key generation
- **JWT Proof Signing** – Proof JWT generation for OpenID4VCI
- **Credential Issuance** – Authorization Code Flow-based issuance
- **Credential Verification** – Signature validation via vc verifier

To get more details, [click here](https://docs.inji.io/inji-wallet/inji-mobile/technical-overview/integration-guide/building-verifiable-credentials-wallet-with-inji-libraries#inji-libraries-used-for-building-a-custom-wallet) !

## Pre-requisites

### Development Environment

- **Android Studio** – Jellyfish (2023.3.1) or later
- **JDK** – 11 or higher
- **Gradle** – 8.9.0 or higher
- **Android SDK**
  - Min API: 26
  - Target API: 35
  - Compile SDK: 35

### Dependencies

Managed via Gradle (no Docker/Postgres setup required).

## Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/mosip/inji-wallet.git
cd inji-wallet
```

### 2. Open in Android Studio

- Launch Android Studio
- Go to **File → Open**
- Select `sample-application/sample-application` directory
- Wait for Gradle sync to complete

### 3. Verify Dependencies

```kotlin
dependencies {
    implementation("io.mosip:inji-vci-client-aar:0.5.0")
    implementation("io.mosip:secure-keystore:0.3.0")
    implementation("io.mosip:vcverifier-aar:1.4.0")
    implementation("com.nimbusds:nimbus-jose-jwt:10.6")
}
```

Update versions if needed:

```bash
./gradlew build --refresh-dependencies
```

## Configuration

Configuration resides in `navigation/AppNavHost.kt`:

```kotlin
object Constants {
    var credentialIssuerHost = "https://injicertify-mosipid.collab.mosip.net"
    var credentialTypeId = "MosipVerifiableCredential"
    var clientId = "mpartner-default-mimoto-mosipid-oidc"
    var redirectUri = "io.mosip.residentapp.inji://oauthredirect"
}
```

**Available Issuers:**

- Mosip National ID
- Insurance Credential
- Tax Account Credential
- Land Registry Credential

## Build & Run

### Build and Install (Debug Mode)

```bash
adb devices
./gradlew installDebug
```

### Generate APK

```bash
./gradlew assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk
```

## How to Use

### Step 1. App Launch → Keystore Initialization

Automatically generates hardware-backed RSA/EC key pairs.

### Step 2. Select Issuer

Choose a credential issuer (e.g., Veridonia National ID or Insurance).

### Step 3. Request Credential (OpenID4VCI Flow)

Performs Authorization Code Flow → Proof JWT generation → Credential download.

### Step 4. Verify Credential

Credential is validated via vc verifier library.

### Step 5. View Stored Credentials

Downloaded credentials are listed in-app and can be verified offline.

## API Usage Examples

### SecureKeystoreManager

```kotlin
val keystoreManager = SecureKeystoreManager.getInstance(context)
keystoreManager.initializeKeystore()
val publicKey = keystoreManager.getPublicKey(KeyType.RS256).getOrNull()
```

### VCIClient Integration

```kotlin
val client = VCIClient("instance-id")
val metadata = ClientMetadata(clientId, redirectUri)
val authUrl = client.getAuthorizationUrl(issuerHost, metadata, credentialType)
```

### CredentialStore

```kotlin
CredentialStore.addCredential(credentialJson)
val credentials = CredentialStore.getAllCredentials()
```

## Project Structure

```
app/src/main/java/com/example/samplecredentialwallet/
├── MainActivity.kt                    # Entry point, keystore initialization
├── navigation/
│   └── AppNavHost.kt                  # Navigation & issuer configuration
├── screens/
│   ├── HomeScreen.kt                  # Issuer selection
│   ├── CredentialDownloadScreen.kt    # OpenID4VCI flow
│   ├── CredentialListScreen.kt        # Credential list
│   └── CredentialDetailScreen.kt      # Credential details
└── utils/
    ├── SecureKeystoreManager.kt       # Android Keystore wrapper
    ├── CredentialVerifier.kt          # vc verifier integration
    └── CredentialStore.kt             # In-memory storage
```

## Error Handling

| Error                          | Cause                    | Solution                       |
| ------------------------------ | ------------------------ | ------------------------------ |
| Keystore Initialization Failed | Hardware not supported   | Use API 26+ physical device    |
| No Internet Connection         | Network issues           | Verify connectivity            |
| Authorization Failed           | Invalid redirect or code | Check redirect URI             |
| Credential Download Failed     | Token or nonce error     | Regenerate proof JWT           |
| Verification Skipped           | Incompatible verifier    | JSON structure validation used |
| Invalid JSON Structure         | Malformed credential     | Validate issuer response       |

**Debug Commands:**

```bash
./gradlew clean
adb logcat -c && adb logcat MainActivity:D AuthCodeHolder:D CredentialDownload:D AppNavHost:D PROOF_JWT:D PROOF_JWT_CLAIMS:D PROOF_JWT_FINAL:D *:S
```

## Demo Reference

A demo video will be `available soon`, providing a walkthrough of the following features:

- Keystore initialization
- Issuer selection and credential request
- OpenID4VCI authorization flow
- JWT proof generation
- Credential download, verification, and storage

## Additional Resources

- [Inji Wallet GitHub Repository](https://github.com/mosip/inji-wallet)
- [Inji VCI Client Repository](https://github.com/mosip/inji-vci-client)
- [Secure Keystore Repository](https://github.com/mosip/secure-keystore/tree/master)
- [VC Verifier Repository](https://github.com/mosip/vc-verifier)
- [OpenID4VCI Specification Draft 13](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0-ID1.html)
- [Building Verifiable Credentials Wallet with Inji Libraries](https://docs.inji.io/inji-wallet/inji-mobile/technical-overview/integration-guide/building-verifiable-credentials-wallet-with-inji-libraries)
- [OpenID4VP Specification Draft 23](https://openid.net/specs/openid-4-verifiable-presentations-1_0-ID3.html)

## License

This project is licensed under the [MOSIP Open License](https://docs.mosip.io/1.2.0/readme/license).
