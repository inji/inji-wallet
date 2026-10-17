# Inji Wallet - Key Management Feature

## Overview

The Inji Wallet supports **RSA, EC R1, EC K1, and ED** keys for signing operations. This document provides a detailed breakdown of the key management process for each key type and its interaction with different system components.

## Supported Key Types

- RSA-2048
- EC R1
- EC k1
- Ed25519

---

## Key Priority Order

When downloading a credential via OpenID4VCI, the wallet picks the first key type in the priority order whose algorithm is listed in the issuer's `proof_types_supported.jwt.proof_signing_alg_values_supported`. If no key type matches, or the issuer does not list any algorithms, the first key type in the order is used.

The default priority order is:

1. ED25519 (`Ed25519`)
2. EC K1 (`ES256K`)
3. EC R1 (`ES256`)
4. RSA (`RS256`)

The default order can be configured through Mimoto using the `mosip.inji.keyPriorityOrder` property, which is returned as `keyPriorityOrder` in the `/allProperties` response:

```properties
mosip.inji.keyPriorityOrder=Ed25519,ES256K,ES256,RS256
```

- The configured order is applied only when the wallet generates its keys, i.e. on a fresh install. Existing installations keep their current order.
- The user can change the order at any time from **Settings → Key Management**, and that order is never overwritten by the configuration.
- Unsupported or duplicate values are ignored, and supported key types missing from the configuration are appended in the default order.
- If the configuration cannot be fetched (e.g. no network on first launch) or the property is not set, the default order is used.

---

## Key Management Flow:

**_RSA & EC R1_**

**_Android Flow_**

```mermaid
sequenceDiagram
  participant User
  participant Inji Wallet
  participant Secure-Keystore(Android)
  participant Hardware Keystore

  Inji Wallet ->> Secure-Keystore(Android):EC R1|RSA Keys Generation Request
  Secure-Keystore(Android) ->> Hardware Keystore:EC R1|RSA Keys Generation Request
  Hardware Keystore ->> Hardware Keystore:Generate and store EC R1|RSA Keys
  Inji Wallet ->> Secure-Keystore(Android): Data Signing Request
  Secure-Keystore(Android) ->> Hardware Keystore: Retrieve EC R1|RSA Keys Request
  Hardware Keystore ->> Secure-Keystore(Android): Request Authentication
  Secure-Keystore(Android) ->> User: Request Authentication
  User -->> Secure-Keystore(Android): Provide Authentication
  Secure-Keystore(Android) -->> Hardware Keystore: Authentication Success Response
  Hardware Keystore -->> Secure-Keystore(Android): Return Key Alias
  Secure-Keystore(Android) ->> Hardware Keystore: Sign Data Request
  Hardware Keystore -->> Secure-Keystore(Android): Return Signed Data
  Secure-Keystore(Android) -->> Inji Wallet: Return Signed Data
```

**_iOS Flow_**

```mermaid
sequenceDiagram
  participant User
  participant Inji Wallet
  participant Secure-keystore(iOS)
  participant iOSKeychain
  participant SecureEnclave

  Inji Wallet ->> Secure-keystore(iOS): EC R1|RSA Keys Generation Request
  Secure-keystore(iOS) ->> Secure-keystore(iOS): Generate EC R1|RSA Keys
  Secure-keystore(iOS) ->> iOSKeychain: Store EC R1|RSA Keys Request
  iOSKeychain ->> SecureEnclave: Encrypt Keys
  SecureEnclave -->> iOSKeychain: Encrypted Keys
  iOSKeychain ->> iOSKeychain: Store encrypted EC R1|RSA Keys
  Inji Wallet ->> Secure-keystore(iOS): Data Signing Request
  Secure-keystore(iOS) ->> iOSKeychain: Retrieve Encrypted EC R1|RSA Keys Request
  iOSKeychain ->> Secure-keystore(iOS): Request Authentication
  Secure-keystore(iOS) ->> User: Request Authentication
  User -->> Secure-keystore(iOS): Provide Authentication
  Secure-keystore(iOS) -->> iOSKeychain: Authentication Success Response
  iOSKeychain ->> SecureEnclave: Decrypt keys Request
  SecureEnclave -->> iOSKeychain: Return Decrypted Keys
  iOSKeychain -->> Secure-keystore(iOS): Return Decrypted Keys
  Secure-keystore(iOS) ->> Secure-keystore(iOS): Sign Data
  Secure-keystore(iOS) -->> Inji Wallet: Return Signed Data
```

The RSA and EC R1 keys are directly supported by the android hardware-keystore, hence all cryptographic operations like signing take place there itself.
For iOS we make use of keyWrapping to store the keys safely in keychain, and use them for necessary operations.

---

**_EC K1 & ED_**

**_Android Flow_**

```mermaid
sequenceDiagram
  participant User
  participant Inji-Wallet
  participant Secure-Keystore(Android)
  participant EncryptedPreferences
  participant HardwareKeystore

  Inji-Wallet ->> Inji-Wallet: Generate EC K1|ED25519 Keys
  Inji-Wallet ->> Secure-Keystore(Android): Store EC K1|ED25519 Keys Request
  Secure-Keystore(Android) ->> EncryptedPreferences: Store EC K1|ED25519 Keys Request
  EncryptedPreferences ->> HardwareKeystore: Encrypt Keys
  HardwareKeystore -->> EncryptedPreferences: Encrypted keys
  EncryptedPreferences ->> EncryptedPreferences: Store Encrypted Keys
  Inji-Wallet ->> Secure-Keystore(Android): Request EC K1|ED25519 Keys For Data Signing
  Secure-Keystore(Android) ->> User: Request Authentication
  User -->> Secure-Keystore(Android): Provide Authentication
  Secure-Keystore(Android) ->> EncryptedPreferences: Retrieve EC K1|ED25519 Keys
  EncryptedPreferences ->> HardwareKeystore: Decrypt Keys
  HardwareKeystore -->> EncryptedPreferences: Decrypted Keys
  EncryptedPreferences -->> Secure-Keystore(Android): Return Decrypted Keys
  Secure-Keystore(Android) ->> Inji-Wallet: Return Decrypted Keys
  Inji-Wallet ->> Inji-Wallet: Sign Data
  Inji-Wallet ->> Inji-Wallet: Return Signed Data
```

**_iOS Flow_**

```mermaid
sequenceDiagram
  participant User
  participant Inji-Wallet
  participant Secure-Keystore(iOS)
  participant iOSKeychain
  participant SecureEnclave

  Inji-Wallet -->> Inji-Wallet: Generate EC K1|ED25519 Keys
  Inji-Wallet ->> Secure-Keystore(iOS): Store EC K1|ED25519 Keys Request
  Secure-Keystore(iOS) ->> iOSKeychain: Store EC K1|ED25519 Keys Request
  iOSKeychain ->> SecureEnclave: Encrypt Keys
  SecureEnclave -->> iOSKeychain: Encrypted Keys
  iOSKeychain ->> iOSKeychain: Store encrypted EC R1|RSA Keys
  Inji-Wallet ->> Secure-Keystore(iOS): Request EC K1|ED25519 Keys For Data Signing
  Secure-Keystore(iOS) ->> iOSKeychain: Retrieve Encrypted EC K1 | ED25519 Keys
  iOSKeychain ->> Secure-Keystore(iOS): Request Authentication
  Secure-Keystore(iOS) ->> User: Request Authentication
  User -->> Secure-Keystore(iOS): Provide Authentication
  Secure-Keystore(iOS) -->> iOSKeychain: Authentication Success Response
  iOSKeychain ->> SecureEnclave: Decrypt Keys
  SecureEnclave -->> iOSKeychain: Return Decrypted Keys
  iOSKeychain-->>Secure-Keystore(iOS): Return Decrypted Keys
  Secure-Keystore(iOS) ->> Inji-Wallet: Return Decrypted Keys
  Inji-Wallet ->> Inji-Wallet: Sign Data
  Inji-Wallet ->> Inji-Wallet: Return Signed Data
```

The EC K1 and Ed25519 keys are not directly supported by hardware keystore in android or iOS, hence in both platforms we make use of secure storage areas; encryptedPreferences in android, keychain in ios, with the help of key wrapping.

---
