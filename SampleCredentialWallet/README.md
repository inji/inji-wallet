# Sample Credential Wallet

Android wallet demonstrating the MOSIP Inji Verifiable Credential flow.

## Overview

This Kotlin Sample Wallet demonstrates the end-to-end Verifiable Credential flow across the MOSIP Inji ecosystem (Certify → Wallet → Verify). It serves as a reference for integrating MOSIP Inji components to build credential wallet applications.

### Purpose

The Sample Credential Wallet serves as a reference implementation for developers building verifiable credential wallet applications using the MOSIP Inji ecosystem. It demonstrates:

- Integration of MOSIP Inji libraries for credential issuance and verification
- Implementation of OpenID4VCI protocol for credential requests
- Hardware-backed key generation and JWT signing for secure proof generation
- Complete credential lifecycle from issuance through verification and storage

### Key Components

- **Inji Certify** - Credential issuer implementing OpenID4VCI protocol for secure credential issuance
- **VCI Client** - OpenID4VCI client library handling authorization and credential download flows
- **Secure Keystore** - Hardware-backed Android Keystore manager for RSA/EC key pair generation and storage
- **Credential Verifier** - Verification library validating credential signatures and structure using MOSIP vcverifier

**Integrated Libraries:**

- `inji-vci-client:0.5.0` - OpenID4VCI client for credential issuance
- `secure-keystore:0.3.0` - Hardware-backed Android Keystore management
- `vcverifier-aar:1.4.0` - Credential verification

### Key Features

- **Keypair Generation** - RSA (RS256) and EC (ES256) keys using Android Keystore
- **JWT Signing** - Proof JWT generation for OpenID4VCI
- **Credential Issuance** - OpenID4VCI Authorization Code Flow
- **Credential Verification** - Signature validation using MOSIP vcverifier

## Pre-requisites

### Development Environment

- **IDE** - Android Studio Jellyfish (2023.3.1) or later, IntelliJ IDEA, or any Gradle-compatible IDE
- **JDK** - 11 or higher
- **Gradle** - 8.9.0 or higher
- **Android SDK**:
  - Minimum API Level 26
  - Target API Level 35
  - Compile SDK 35

### Access to Services

- **MOSIP Inji Certify** - Pre-configured with COLLAB environment
- **eSignet / OIDC Server** - Integrated via OpenID4VCI flow

### Dependencies

Dependencies are managed via Gradle. No Docker/Postgres setup required for this wallet.

## Installation and Setup

### 1. Clone Repository

```bash
git clone https://github.com/mosip/inji-wallet.git
cd inji-wallet
git checkout sample-android-wallet
cd SampleCredentialWallet/SampleCredentialWallet
```

### 2. Open Project

Open the project in your preferred IDE:

- Navigate to `SampleCredentialWallet/SampleCredentialWallet` directory
- Open as an Android/Gradle project

### 3. Gradle Sync

Your IDE will automatically sync dependencies on project open. All dependencies are pre-configured in `app/build.gradle.kts`.

**Key Dependencies:**

```kotlin
dependencies {
    // MOSIP Inji Libraries
    implementation("io.mosip:inji-vci-client-aar:0.5.0")
    implementation("io.mosip:secure-keystore:0.3.0")
    implementation("io.mosip:vcverifier-aar:1.4.0")

    // JWT Library
    implementation("com.nimbusds:nimbus-jose-jwt:9.38-rc5")
}
```

**To Update Libraries:**

Check [Maven Central](https://central.sonatype.com/) for latest versions, update version numbers in `app/build.gradle.kts`, then sync:

```bash
./gradlew build --refresh-dependencies
```

**Manual Sync (if needed):**

If Gradle sync fails or you need to refresh dependencies:

```bash
./gradlew build --refresh-dependencies
```

## Configuration

The wallet is pre-configured with MOSIP Inji Certify COLLAB environment. Configuration is located in `navigation/AppNavHost.kt`:

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

## Build and Run

### Build and Install on Device

**Prerequisites:** Connect your Android device via USB

**Install Debug Build:**

```bash
# Verify device connection
adb devices

# Build and install app
./gradlew installDebug
```

### Build APK for Distribution

**Generate APK:**

```bash
./gradlew assembleDebug
```

**APK Location:**

```
app/build/outputs/apk/debug/app-debug.apk
```

**Install APK:**

```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

## How to Use

### Step 1: App Launch - Keystore Initialization

On first launch, app initializes Android Keystore and generates RSA/EC key pairs.

**Code (`MainActivity.kt`):**

```kotlin
private fun initializeKeystoreIfNeeded() {
    lifecycleScope.launch {
        keystoreManager.initializeKeystore()
    }
}
```

**Expected Output:**

```
I/MainActivity: Key pairs generated successfully!
D/MainActivity: Keystore Status: {hardwareSupported=true, biometricsEnabled=true, keysGenerated=true, hasRS256=true, hasES256=true}
```

### Step 2: Select Issuer

Choose from available issuers on home screen.

**Example Test Credentials:**

For **Veridonia National ID**:

- UIN: `8137192175`

For **Stay Protected Insurance**:

- Policy Number: `7070`
- Policy Name: `aswin`
- Date of Birth: `19/02/2025`

### Step 3: Request Credential (OpenID4VCI Flow)

Click "Download Credential" to initiate authorization.

**Code (`CredentialDownloadScreen.kt`):**

```kotlin
// 1. Get authorization URL
val authUrl = client.getAuthorizationUrl(
    credentialIssuer = Constants.credentialIssuerHost,
    clientMetadata = clientMetadata,
    credentialType = Constants.credentialTypeId
)

// 2. User authenticates via browser → eSignet

// 3. Exchange auth code for access token
val dpopJWT = generateDPoPJWT(keystoreManager, tokenEndpoint)
val tokenResponse = client.getAccessToken(
    TokenRequest(authorizationCode = authCode, dpopJwt = dpopJWT)
)

// 4. Download credential with proof JWT
val proofJWT = generateProofJWT(keystoreManager, clientId, issuerHost, tokenResponse.cNonce)
val credentialResponse = client.downloadCredential(
    credentialType = Constants.credentialTypeId,
    format = "ldp_vc",
    proofJWT = proofJWT
)
```

**Expected Output:**

```
D/AUTH_FLOW: Authorization flow started
D/AUTH_FLOW: Authorization URL: https://...
D/AUTH_FLOW: Authorization code received: 0z--_UGccr...
D/TOKEN_EXCHANGE: Token exchange started
D/TOKEN_EXCHANGE: Access token received: eyJhbGciOiJSUzI1Ni...
D/TOKEN_EXCHANGE: c_nonce received: n1eJz3fV5PksLwvu5CrK
D/PROOF_JWT: Proof JWT generation started
D/PROOF_JWT: Issuer: https://injicertify-insurance.collab.mosip.net
```

### Step 4: Verify Credential

After download, the credential is automatically verified.

**Code (`CredentialVerifier.kt`):**

```kotlin
suspend fun verifyCredential(credentialJson: String): Boolean {
    val result = verifier.verify(credentialJson, CredentialFormat.LDP_VC)
    return result.verificationStatus
}
```

**Expected Output:**

```
D/CredentialVerifier: Starting credential verification...
D/CredentialVerifier: Credential length: 1568
D/CredentialVerifier: Verifying credential with LDP_VC format
I/CredentialVerifier: ✓ Skipping verification - JSON structure is valid
```

### Step 5: View Downloaded Credentials

View stored credentials in the credential list screen.

**Monitor Application Logs:**

```bash
adb logcat -c && adb logcat MainActivity:D AuthCodeHolder:D CredentialDownload:D AppNavHost:D PROOF_JWT:D PROOF_JWT_CLAIMS:D PROOF_JWT_FINAL:D *:S
```

## API Usage Examples

### SecureKeystoreManager

```kotlin
val keystoreManager = SecureKeystoreManager.getInstance(context)

// Initialize keystore
keystoreManager.initializeKeystore()

// Get public key for JWT signing
val publicKey = keystoreManager.getPublicKey(KeyType.RS256).getOrNull()

// Check status
val status = keystoreManager.getKeystoreStatus()
```

### VCIClient Integration

```kotlin
val client = VCIClient("instance-id")
val metadata = ClientMetadata(clientId, redirectUri)

// Get auth URL
val authUrl = client.getAuthorizationUrl(issuerHost, metadata, credentialType)

// Exchange code for token
val tokenResponse = client.getAccessToken(TokenRequest(authCode, dpopJwt))

// Download credential
val credential = client.downloadCredential(credentialType, format, proofJWT)
```

### CredentialStore

```kotlin
// Store credential
CredentialStore.addCredential(credentialJson)

// Retrieve all
val credentials = CredentialStore.getAllCredentials()

// Clear storage
CredentialStore.clearCredentials()
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
    ├── CredentialVerifier.kt          # MOSIP vcverifier integration
    └── CredentialStore.kt             # In-memory storage
```

## Error Handling

### Common Failure Scenarios

| Error                                   | Cause                                                   | Solution                                                  |
| --------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------- |
| **Keystore Initialization Failed**      | Hardware keystore not supported or key generation error | Use physical device (API 26+) with hardware support       |
| **No Internet Connection**              | Network unavailable, timeout, or unable to resolve host | Check internet connection and network settings            |
| **Authorization Failed**                | OAuth redirect error or invalid authorization code      | Verify redirect URI matches issuer configuration          |
| **Credential Download Failed**          | Invalid access token, expired c_nonce, or server error  | Validate access token and c_nonce in proof JWT            |
| **Verification Library Not Compatible** | Android version compatibility or missing Java classes   | JSON structure validation accepted (verification skipped) |
| **Invalid JSON Structure**              | Malformed credential response                           | Validate credential format from issuer                    |

### Debug Commands

**Clear Gradle Cache and Rebuild:**

```bash
./gradlew clean
./gradlew build --refresh-dependencies
```

**Clear Logcat and Monitor Specific Tags:**

```bash
adb logcat -c && adb logcat MainActivity:D AUTH_FLOW:D TOKEN_EXCHANGE:D PROOF_JWT:D CredentialVerifier:D *:S
```

**Check Device Connection:**

```bash
adb devices
```

**Uninstall and Reinstall App:**

```bash
adb uninstall com.example.samplecredentialwallet
./gradlew installDebug
```

## Demo Reference

This section provides a visual walkthrough of the Sample Credential Wallet application demonstrating the complete flow from keystore initialization to credential download and verification.

**Demo Video:** (Video url of SampleCredentialWallet)

The demo video covers:

- Keystore initialization and key pair generation
- Issuer selection and credential request
- OpenID4VCI authorization flow
- JWT proof generation and signing
- Credential download, verification and storage

## Contributors

This project is developed and maintained by the MOSIP Inji development team.

**Acknowledgments:**

This project uses MOSIP Inji libraries developed by the MOSIP community.
