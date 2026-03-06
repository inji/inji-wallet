# Claim 169 QR Code Support

## Overview

- Inji Wallet supports the consumption of Claim 169 QR Code, a standardized format that uses CBOR Web Token (CWT) identity-data claim (key 169) to encode digitally signed identity information into QR codes.
- This issuer-generated QR code enables secure, offline verification of identity data, allowing users to present their credentials without requiring network connectivity.
- When displaying the credential detail view, Inji Wallet automatically detects and prioritizes the Claim 169 QR code if present in the VC. If the Claim 169 QR code is not available, the wallet generates a QR code using the Pixelpass library.

## References

- [Claim 169 QR Code Specification](https://docs.mosip.io/1.2.0/readme/standards-and-specifications/mosip-standards/169-qr-code-specification)

## Pre-requisites

- VC should be valid and should contain Claim 169 QR code data in the binary format. For e.g. for JSON-LD VC, Claim 169 QR code data should be present in the `credentialSubject` section of the VC with the key `claim169`.

  ```json
    "claim169" : {
    "identityQRCode": "NCF4:OCFBI%S:2EQ7NMC2558J6HW8VDQ0DW8V27MMSLYG%8WTGTEF9-8G7K6A5S+ORSWH4%F12802...",
    "faceQRCode": "NCF4:OCFBI%S:2EQ7NMC2558J6HW8VDQ0DW8V27MMSLYG%8WTSJSJGTEF9-8G7K6A5S+ORSWH4%F12802..."
    }
  ```

- The Claim 169 QR code data should be in the expected format as per the requirements of the application consuming it. Refer [Claim 169 QR Code specification](https://docs.mosip.io/1.2.0/readme/standards-and-specifications/mosip-standards/169-qr-code-specification) for further details.

## Credential Detail view - with Claim 169 QR code support

### Actors Involved

- **User**: The individual who holds the Verifiable Credential and interacts with the Inji Wallet to view the credential details.
- **Wallet**: The application that displays the credential details to the user, including the Claim 169 QR code if present.

```mermaid
sequenceDiagram
  participant user as 👤 User
  participant wallet as 👜 Wallet

  Note over user,wallet: Credential already downloaded and stored in wallet

  user->>wallet: Opens credential detail view
  wallet->>wallet: Retrieves credential from app storage
    wallet->>wallet: Checks for Claim 169 QR code data<br/>Is `claim169` key present in `credentialSubject` of credential data?
    alt Claim 169 QR code data is present
      wallet->>wallet: Create QR code using Claim 169 QR code data<br/> in the credential
      wallet->>user: Displays credential with Claim 169 QR code
    else Claim 169 QR code data is not present
      wallet->>wallet: Generates QR code using Pixelpass library
      wallet->>user: Displays credential with Pixelpass QR code
    end
```

**Detailed Flow:**

- The Wallet checks if the `claim169` key is present in the `credentialSubject` of the credential data
  - If present, the Wallet validates that the Claim 169 data is a non-empty string
  - The Wallet selects the first QR code data available in the `claim169` object by using the first key (e.g., `identityQRCode`)
  - The QR data is converted to QR format and displayed to the user in the credential detail view
- If the `claim169` key is not present, the wallet falls back to generating a QR code using the Pixelpass library and displays it to the user
