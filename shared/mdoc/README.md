# ISO 18013-5 mDoc QR (DeviceEngagement)

This folder implements the **compact QR** from ISO/IEC 18013-5 (device engagement), **not** the full OpenID4VCI / `issuerSigned` blob.

## What the QR contains

**Default (`interopCborMap`)** — many verifier apps and `mdoc:` samples use a CBOR **map** (not the CDDL array):

| Key   | Content                                                                   |
| ----- | ------------------------------------------------------------------------- |
| **0** | Version string `"1.0"`                                                    |
| **1** | **Security** — `[ cipherSuiteIdentifier, #6.24(bstr .cbor COSE_Key) ]`    |
| **2** | **TransferMethods** — e.g. `[[2, 1, BleOptions]]` (BLE type 2, version 1) |
| **3** | **Options** (WebAPI / OIDC) — only present if non-empty                   |
| **4** | **Doc types** — only if `includeDocTypesInEngagement: true`               |
| **5** | **ApplicationSpecific** — only if non-empty                               |

The first CBOR byte is **`0xa3`** for a minimal 3-key map (version + security + BLE).

**Optional `iso18013Array`** — set `deviceEngagementEncoding: 'iso18013Array'` for the strict CDDL **array** from ISO/IEC 18013-5:2020 §8.1.1.1 (first byte **`0x86`** for a 6-element array).

**BLE `BleOptions`** (ISO §8.1.1.1): map keys **0** / **1** = peripheral server / central client support; **10** / **11** = 16-byte UUIDs; key **21** is an extra interop field seen in ecosystem QRs (not in the short ISO CDDL excerpt).

**Default proximity shape (VC QR)** — `buildMdocDeviceEngagementQrForVc` uses `proximityPresentationProfile: 'tap2id'` by default. Decoded, it matches the working **Multipaz-style map**:

- `0` → `"1.0"`
- `1` → `[ 1, #6.24(COSE_Key) ]` (ephemeral P-256 public key: `kty=2`, `crv=1`, `x` / `y` as in your sample)
- `2` → `[ [ 2, 1, { 0: true, 1: false, 10: <16-byte uuid>, 21: 130 } ] ]` — **one** BLE transfer method row (`~119` byte CBOR body)

**Dual-row variant** — pass `proximityPresentationProfile: 'multipaz'` for two BLE rows (first row `21: 128`, second row central `11: <uuid>`) when a deployment requires that encoding.

Override with `ble.dualBleTransferRows` / `ble.interopPairingHint21` when you need explicit control.

The QR value is:

- **`mdoc:`** + base64url (**no padding**) — **default** URI scheme for ecosystem verifiers.
- **`mDL:`** — ISO §8.1.2.3; pass `uriScheme: MDL_QR_URI_SCHEME` if your reader requires it.

## Verifier says “invalid QR” (e.g. error code 111)

That message is **defined by the verifier app**, not ISO. Typical causes:

1. **Wrong URI scheme** — Use **`mdoc:`** (default) vs **`mDL:`** (`uriScheme: MDL_QR_URI_SCHEME`).
2. **Wrong CBOR shape** — Verifier expects the **uint-key map** (`interopCborMap`, default), not the ISO **array** (`deviceEngagementEncoding: 'iso18013Array'`).
3. **Wrong `BleOptions` keys** — Must use ISO keys **0** / **1** / **10** / **11** (not the old mistaken 1/10/11 semantics for flags).
4. **Wrong protocol** — App expects **OpenID4VP** / **EUDI** URL, not engagement CBOR.
5. **Session not implemented** — BLE/Web + **DeviceResponse** still required after a valid scan.

## After scan: “Unable to verify” (e.g. Tap2iD / Top2iD **code 115**)

**Code 115** is defined **only inside the verifier app** (Credence ID Tap2iD Mobile, etc.). It is **not** an ISO standard code. Public docs rarely list it; use **Credence / Tap2iD support** or in-app help for the exact meaning.

**Multipaz:** There is **no** definition of Tap2iD / Credence **“error 115”** in Multipaz. Holder-side codes Multipaz _does_ use are the ISO/IEC 18013-5 numeric statuses in [`multipaz/.../util/Constants.kt`](https://github.com/openwallet-foundation/multipaz/blob/main/multipaz/src/commonMain/kotlin/org/multipaz/util/Constants.kt) (e.g. `DEVICE_RESPONSE_STATUS_OK` = 0, `..._GENERAL_ERROR` = 10, `..._CBOR_DECODING_ERROR` = 11, `..._CBOR_VALIDATION_ERROR` = 12; session data statuses 10, 11, 20). ZKP verifier enums in Longfellow are small integers (0–5), not 115. So **115 is not something Multipaz can map** — it stays **Tap2iD’s internal code**.

In practice, **115 usually means the failure moved past QR parsing** and failed in one of these buckets:

1. **No ISO 18013-5 presentation session** — After a valid engagement QR, the reader expects a **BLE** (or **WebAPI**) session, **DeviceRequest** / **DeviceResponse**, and **DeviceAuth**. If nothing answers the reader’s BLE handshake, or no valid **DeviceResponse** is returned, many apps show a generic “unable to verify” with an internal code.

   **Credence engineering (May 2026):** Their verifier logs showed the **DeviceEngagement request is correct** and the reader **attempts to connect to the GATT service UUID** embedded in the engagement (example UUID `50bbf5f3-fa42-7d9d-a6da-50e080ad6dd5`). Failure matched **no connectable GATT** — same when testing with **Multipaz Verifier** if the holder app is not advertising. So the holder must **advertise that BLE service** for the whole time in-person presentation is active (not only after expanding a QR modal). Inji wires **Multipaz `Iso18013Presentment`** on Android for that path; keep QR + native presentment lifetimes aligned.

2. **Trust / cryptography** — Issuer **DS certificate chain** not anchored in the verifier’s **trust program**, revoked credential, wrong **docType**, or **MSO** validation failure after data is received.
3. **BLE / transport mismatch** — Less common once the engagement shape matches Tap2iD; Credence can confirm from diagnostics.

**What to do:** Confirm with **Credence ID** what **115** maps to for Tap2iD Mobile, whether they require **peripheral vs central** BLE for your integration, and whether your **issuer** is on their **trusted issuer list**. Plan engineering for **ISO 18013-5 §8.2 BLE (or WebAPI) + DeviceResponse** if they confirm the failure is post-QR transport, not trust.

## Why Multipaz works with Tap2iD but Inji can still show **115**

|                | **Multipaz**                                                                                                                                                  | **Inji (current)**                                                                                                                                                                                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **QR**         | Shows ISO **DeviceEngagement** (`mdoc:` …)                                                                                                                    | Same style of engagement QR                                                                                                                                                                                                                                                                        |
| **After scan** | App runs **BLE** (or NFC) **ISO 18013-5 session**: pairing, **SessionTranscript**, receives **DeviceRequest**                                                 | **Android:** Multipaz-based `MdocIso18013Presentment` advertises the engagement **BLE service UUID** and runs **Iso18013Presentment** while the `mdoc:` QR flow is active. **iOS:** not wired here yet.                                                                                            |
| **Consent**    | Wallet shows **which data** the verifier asked for; user **approves** → wallet builds **DeviceResponse** (`issuerSigned` + **deviceSigned** / **DeviceAuth**) | Android bridges Multipaz consent to RN: parses `deviceRequestInfo.purposeHints` + requested elements → `MdocPresentmentConsentRequired` → `components/mdocShare/MdocConsentStep` (verifier / purpose / attributes) → **Share** (`approvePresentment`) or **Cancel** (`denyPresentment`, no DeviceResponse). |
| **Verifier**   | Receives real mDL bytes and crypto → **verify** OK                                                                                                            | If **GATT is not advertising** (e.g. presentment stopped while QR still visible), connection fails before **DeviceResponse** — same symptom Multipaz Verifier sees against a non-advertising wallet.                                                                                               |

**Parity gap (shrinking):** Engagement QR + **Android BLE presentment** + consent (purposeHints / attributes) can match Multipaz; remaining work includes **iOS** and field QA on **Tap2iD + Multipaz Verifier** with logs.

**What you need for full parity:** Same **ISO mdoc proximity presentation** stack everywhere you ship: BLE (or Web API per **Options**), **DeviceRequest** / **DeviceResponse**, **DeviceAuth** — Multipaz on Android covers the heavy lifting once lifecycle matches verifier expectations.

## End-to-end Tap2iD / proximity — can we implement it?

**Yes**, but treat it as a **programme** (native-heavy crypto + BLE + UX), not a small feature. Roughly:

| Approach                                                                                                                                     | Effort                                          | Notes                                                                                                                                                                                                                                                                            |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Integrate [Multipaz](https://github.com/openwallet-foundation/multipaz)** (Kotlin Multiplatform; Android has **ISO 18013 presentment**) | **Medium–high**, fastest path to spec behaviour | Apache 2.0. Expose **one RN native module** that takes MSO / credential handle + starts `Iso18013Presentment`-style flow; consent UI can be **Compose** inside native or events bridged to RN. Reuse Multipaz’s BLE/NFC/session/DeviceRequest handling instead of rewriting ISO. |
| **B. Credence / Tap2iD holder SDK** (if offered commercially)                                                                                | **Medium**                                      | Often shortest for **Tap2iD-specific** quirks; depends on licensing.                                                                                                                                                                                                             |
| **C. Android Identity Credential / framework APIs**                                                                                          | **High** (API levels, OEM variance)             | Possible on some devices; still need careful mapping from Inji’s stored **mso_mdoc** bytes to what the API expects.                                                                                                                                                              |
| **D. Pure JS + `react-native-ble-*` from scratch**                                                                                           | **Very high**, high risk                        | Full §8.2 GATT, cipher suite 1, SessionTranscript, COSE, **DeviceAuth** — months and hard to certify. **Not recommended.**                                                                                                                                                       |

### Suggested phases (for option A — Multipaz-style integration)

1. **Credential bridge** — Define how Inji passes **issuer MSO bytes** (and **DeviceKey** / namespaces if stored separately) into native code; align with how **Pixelpass** / `RNPixelpassModule` already exposes mdoc payloads.
2. **Native module** — Android: add Multipaz (Maven), implement `startProximityPresentation(vcId | credentialRef)` that uses library presentment APIs; iOS: Multipaz Swift or separate plan (second track).
3. **Lifecycle** — After user opens “show QR”, keep presentation **active** until timeout or success: Bluetooth on, **foreground** service if needed, clear session on cancel.
4. **Consent** — Either use Multipaz UI components or forward **requested data elements** to an RN screen and call back into native to approve **DeviceResponse**.
5. **Engagement key** — Either let **Multipaz** own ephemeral keys for the session or prove compatibility if Inji keeps generating QR + key in JS (may require aligning session transcript inputs with the library).
6. **QA** — Matrix: Tap2iD Mobile + real reader, **peripheral** vs **central** BLE, regression on **OpenID4VP** (existing path must stay intact).

### What stays in TypeScript vs native

- **TS (current):** DeviceEngagement QR encoding, app navigation, consent copy, telemetry.
- **Native (new):** BLE GATT / NFC timing, session crypto, **DeviceRequest** parsing, **DeviceResponse** CBOR, **DeviceAuth** signatures — this is where Multipaz or a vendor SDK earns its keep.

If product agrees on **option A**, the next concrete step is a **spike**: add Multipaz to a branch, prove `Iso18013Presentment` (or equivalent) with a **static** test credential on one Android device + Tap2iD, then wire to Inji’s VC store.

### Matching Multipaz: “downloaded VC” + verify on Tap2iD

To behave **like Multipaz** for a credential the user obtained in the wallet (same as your OpenID4VCI **download**, but **mso_mdoc**):

1. **Store** the credential in a form the presentment library can use (raw **MSO** / **DeviceKey** / namespaces — same logical content Multipaz holds after issuance).
2. **Show proximity QR** (DeviceEngagement) when the user chooses “present / verify” — you already generate this in Inji.
3. **Run holder presentment** (native): BLE (or NFC) per engagement until **DeviceRequest** arrives.
4. **Consent UI**: show requested **data elements** / purpose; on approve, build **DeviceResponse** + **DeviceAuth** (library does this in Multipaz).
5. **Do not** rely on JS-only BLE for ISO §8.2; reuse **Multipaz** (or vendor SDK) so behaviour matches what Tap2iD already interops with.

Inji’s **OpenID4VP** path is a **different** protocol (HTTP / DCQL, etc.); “like Multipaz for Tap2iD” specifically means adding this **ISO proximity** path alongside it, not replacing VCI download.

## Full proximity presentation — requirement map (Multipaz reference)

The list below is the **complete** ISO/IEC 18013-5 holder proximity path Tap2iD expects after it scans `mdoc:…`. **Multipaz implements this in Kotlin (KMP)** — see [`MdocProximityQrPresentment`](https://developer.multipaz.org/docs/getting-started/holder/presentation/), `MdocProximityQrSettings`, `MdocConnectionMethodBle`, `PresentmentSource` / `SimplePresentmentSource`, and the [getting-started presentment module](https://github.com/openwallet-foundation/multipaz-samples/tree/main/MultipazGettingStartedSample/feature/presentment). **Inji does not yet ship this stack in JS or Java**; the practical route is a **native module** that delegates to Multipaz (or a vendor SDK), with RN only orchestrating UX and passing MSO bytes.

| #   | Requirement                                           | Multipaz-shaped implementation                                                         | Inji today                                                          |
| --- | ----------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 1   | Ephemeral P-256 + COSE_Key in engagement              | Library + sample (`MdocProximityQrPresentment`)                                        | `deviceEngagement.ts` (QR only)                                     |
| 2   | DeviceEngagement CBOR (map / tags)                    | Same as sample settings                                                                | `cborEncodeMinimal.ts`                                              |
| 3   | BLE UUID = advertised GATT service UUID               | Sample creates `bleUuid` **before** `generateQrCode`, passes `MdocConnectionMethodBle` | Persisted in keystore; **no GATT server** yet                       |
| 4   | QR = `mdoc:` + base64url(DeviceEngagement CBOR)       | Multipaz pipeline                                                                      | Implemented (**no DEFLATE** — not in ISO §8.1.2.3 / common interop) |
| 5   | Session establishment, SessionTranscript              | Native crypto + reader ephemeral key                                                   | **Android:** `Iso18013Presentment` (Multipaz) after BLE connect     |
| 6   | Session encryption (ECDH, session keys)               | Native                                                                                 | **Android:** inside `Iso18013Presentment`                           |
| 7   | DeviceRequest parse + decrypt                         | Native                                                                                 | **Android:** inside `Iso18013Presentment`                           |
| 8   | DeviceResponse CBOR (`issuerSigned` + `deviceSigned`) | Native                                                                                 | **Android:** `mdocPresentment` + `SimplePresentmentSource`          |
| 9   | DeviceAuthentication structure                        | Native                                                                                 | **Android:** Multipaz signing path                                  |
| 10  | COSE_Sign1 (headers, alg, signature)                  | Native                                                                                 | **Android:** Multipaz                                               |
| 11  | Encrypt DeviceResponse for transport                  | Native                                                                                 | **Android:** Multipaz session encryption                            |
| 12  | Send over BLE (chunking if any)                       | Native GATT                                                                            | **Android:** Multipaz `MdocTransport`                               |

**Tuvali** (`RNWalletModule` / `io.mosip.tuvali`) is used elsewhere for MOSIP **VC BLE transfer** — it is **not** a drop-in substitute for **ISO 18013-5 §8.2 mdoc reader** sessions with Tap2iD.

### RN bridge contract (TypeScript)

- `shared/mdoc/iso18013PresentmentInterop.ts` — dispatches to whichever engine the platform has: the common TypeScript engine (`shared/mdoc/presentment/`, iOS) or Android `NativeModules.MdocIso18013Presentment.startPresentment`. Throws `Iso18013PresentmentNotImplementedError` only when neither is available.

## Two engines, one protocol implementation

| | **Android (today)** | **iOS (today)** |
| --- | --- | --- |
| Protocol (CBOR, session keys, SessionTranscript, DeviceRequest/Response, DeviceAuth) | Kotlin, delegating to Multipaz | **`shared/mdoc/presentment/` — common TypeScript** |
| BLE GATT transport | Multipaz `MdocTransport` | `ios/Inji/MdocBleTransport.swift` (~420 lines, bytes only) |
| Native lines | ~2500 Kotlin | ~420 Swift |

The iOS path implements the protocol **once, in TypeScript**, and keeps native to the one thing that cannot be JavaScript: operating a GATT peripheral (`CBPeripheralManager` / `BluetoothGattServer` are unreachable from Hermes, and no maintained RN package exposes peripheral mode — the peripheral-capable ones were last published in 2022). Multipaz makes the same split; its BLE lives in `.android.kt` / `.ios.kt` actuals under a common protocol layer.

Android is **deliberately unchanged**: it has a working presenter, and `isMdocBleTransportAvailable()` is iOS-only so nothing reroutes. When Android does adopt the common engine it implements the same `MdocBleTransport` native contract and everything above it is reused as-is. The one thing that must be designed for now is signing: `Es256Signer` is **injected**, because iOS can hand the ES256 private key to JS (`useSoftwareDeviceKey`) while Android's device key is non-extractable and can only sign across the bridge.

### Verifying without a reader

`shared/mdoc/presentment/presentment.test.ts` plays the **reader**: it derives the session keys independently from the reader side, decrypts what the holder sends, and verifies the DeviceAuth signature the way a verifier would — plus a negative test proving a response bound to one session does not validate in another. That covers everything except the BLE bytes themselves.

For byte-parity against the known-good Android session, `logByteCommitment` prints `sha256` of SessionTranscriptBytes, DeviceRequest, DeviceAuthenticationBytes and DeviceResponse in `__DEV__`. Compare those hashes with Android's for the same reader and credential; a mismatch localises the divergence to one structure.

### Multipaz holder flow vs Inji (Tap2iD / ISO proximity)

**What Multipaz does** (see `multipaz-compose` `MdocProximityQrPresentment.android.kt` and common default):

1. **Single pipeline** — `availableConnectionMethods.advertise(...)` **first**, then `buildDeviceEngagement` from those same transports so **QR CBOR and BLE advertising always match** (UUID, optional PSM, flags).
2. **Ephemeral COSE_Key** — generated in Kotlin (`Crypto.createEcPrivateKey`), never split across JS and native.
3. **Android UX** — launches `PresentmentActivity` for consent / state while transacting; uses `PromptModel` callbacks wired into `Iso18013Presentment`.
4. **Permissions** — test UI checks Bluetooth permission + radio enabled **before** starting GATT (`IsoMdocProximitySharingScreen`).
5. **Transport options** — test app defaults include `presentmentBlePeripheralServerModeEnabled` and often `bleUseL2CAPInEngagement` when the built engagement includes a PSM; options stay consistent with the generated CBOR.

**What Inji does today**

| Area                             | Status                                                                                                                                                                                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| DeviceEngagement + `mdoc:` QR    | Built in **TypeScript** (`deviceEngagement.ts`), persisted with ephemeral key (`mdocProximitySessionStore`).                                                                                                                               |
| BLE + `Iso18013Presentment`      | **Android native** `InjiIso18013ProximityPresenter`: parses persisted CBOR → `advertise` → `waitForConnection` → Multipaz `Iso18013Presentment`.                                                                                           |
| CBOR / transport parity          | **Risk:** JS and native must agree on every BLE option byte. Inji sets `MdocTransportOptions.bleUseL2CAPInEngagement` from **whether the parsed engagement lists a PSM** so we do not start an L2CAP server that the QR did not advertise. |
| Consent UX                       | RN overlay after `DeviceRequest` (`promptModelRnBridgedConsent`); Allow/Deny before `DeviceResponse`.                                                                                                                                      |
| iOS                              | Common TypeScript engine (`shared/mdoc/presentment/`) over the thin `MdocBleTransport` Swift module. Requires `UIBackgroundModes: bluetooth-peripheral` so advertising survives screen lock — the counterpart to Android's foreground service. |
| Runtime BLE on API 31+           | `MainActivity` requests **CONNECT** + **ADVERTISE**; native module **refuses** presentment if still denied (avoids hard crashes).                                                                                                          |
| Multipaz `initializeApplication` | **Not** called from `Application.onCreate` anymore (cold-start stability); `MdocMultipazBootstrap.initFrom` runs at the start of the presenter coroutine.                                                                                  |

**Ideal long-term parity:** move engagement generation into native (same as Multipaz) **or** export TS-built CBOR into native without reinterpretation drift; add real consent UI; iOS Multipaz/Swift path.

### Byte parity / debugging (when native exists)

- Compare **DeviceEngagement** CBOR, **inner COSE_Key** bstr, **SessionTranscript** CBOR, **DeviceRequest** / **DeviceResponse** AAD+ciphertext, and **COSE_Sign1** bytes against Multipaz **golden traces** (same reader, same credential) — log **SHA-256** of each blob in `__DEV__` only. A **single** extra byte in SessionTranscript breaks verification.

## What the QR does _not_ contain

- `issuerSigned` / `nameSpaces` / portrait / issuer certs / full VC JSON — those stay in **wallet storage** (and/or your backend).

## After the verifier scans the QR

1. The reader **decodes** base64url → **DeviceEngagement** CBOR and reads **Security** (ephemeral device public key) and **TransferMethods** / **Options**.
2. It establishes a **secure session** (e.g. **BLE** GATT per 18013-5 **§8.2**, or **HTTPS** using **WebAPI** URL + token from **Options**).
3. **SessionTranscript** is built from engagement material and reader ephemeral key (see **§9.1.1.1** / **DeviceEngagementBytes** as tagged CBOR bstr in transcript inputs — exact composition matches your profile: WebAPI vs BLE).
4. The reader sends **DeviceRequest**; the wallet responds with **DeviceResponse** (contains **documents** with **issuerSigned** + **deviceSigned**) — that is when the **actual credential** is transferred.

## Wallet responsibilities

- Generate a **fresh ephemeral P-256** key pair per presentation (`createMdocDeviceEngagementSession`).
- Show QR = **`mdoc:`** + base64url (default). Use **`mDL:`** when the reader documents ISO §8.1.2.3 only.
- **Persist** the **ephemeral private key** (and optionally engagement bytes) until the session ends — `QrCodeOverlay` stores JSON under keystore key `` `${vcId}:iso18013_de` `` for later **DeviceResponse** signing (full response flow is not implemented in this repo).

### Proximity session stability (QR vs future BLE)

`QrCodeOverlay` **reuses** the persisted DeviceEngagement for a VC (`loadOrCreateMdocProximityQrPayload`): the **same** `mdoc:` URI, **same** CBOR bytes, **same** BLE UUID (key **10**), and **same** ephemeral key as stored under `` `${vcId}:iso18013_de` `` until that entry is cleared or invalidated. A **new** engagement is only created when nothing valid is on disk. This avoids remount / zoom overlay / navigation regenerating UUID or EC keys while Tap2ID still expects the scanned QR.

When you add a **native BLE** proximity presenter, it **must** advertise the **exact** 16-byte service UUID taken from the **same** persisted `deviceEngagementCbor` (or from the decoded Engagement map key **10**) — not a second random UUID. Optionally pass `advertisedBleServiceUuidHex` into `QrCodeOverlay` so `__DEV__` logs can compare QR vs GATT. **SessionTranscript** is still derived only after the reader contributes its ephemeral key over BLE; the wallet does not log its hash until that flow exists.

## API

- `shared/mdoc/mdocProximitySessionStore.ts` — keystore load/save, `mdocUri` in JSON, diagnostics.
- `shared/mdoc/mdocProximitySessionCoordinator.ts` — single-flight **load or create** per VC id (StrictMode-safe).

- `shared/mdoc/iso18013PresentmentInterop.ts` — **placeholder** RN contract for full proximity (throws until native Multipaz module exists).

- `shared/mdoc/deviceEngagement.ts` — `createMdocDeviceEngagementSession`, `generateEphemeralP256KeyPair`, constants.
- `shared/mdoc/buildMdocQrData.ts` — `buildMdocDeviceEngagementQrForVc` (defaults `proximityPresentationProfile: 'tap2id'` = map `{0,1,2}` + single BLE row `21:130`).
- `validateDeviceEngagementInteroperability` — decodes CBOR and checks COSE_Key **kty=2**, **crv=1**, **raw 32-byte** `x`/`y` (no nested CBOR), BLE UUID **16** bytes.

## Tap2ID / COSE_Key encoding (critical)

- **COSE_Key** map values for **`-2` (x)** and **`-3` (y)** must be **definite-length CBOR byte strings** of **32 raw P-256 coordinate bytes** — not pre-CBOR-encoded blobs, not integers.
- **Security** second element is **CBOR tag 24** whose immediate argument is a **bstr** whose **payload bytes** are the **single** CBOR encoding of the COSE_Key map (`d8 18 58 … a4 …`).
- Maps are encoded in **RFC 8949 canonical key order** (sorted by the bytewise order of each key’s CBOR form) so bytes match common verifier stacks.
- BLE **key 10** is a **16-byte** UUID as a raw **bstr** (no string UUID, no extra wrapping).

In **dev** builds (`__DEV__` and not `NODE_ENV=test`), `createMdocDeviceEngagementSession` logs CBOR prefix hex, decoded COSE lengths, and BLE UUID hex. **SessionTranscript** is **not** built in the wallet at QR time; it is derived after BLE with the reader’s ephemeral key.

## Dependencies

- **`shared/mdoc/cborEncodeMinimal.ts`** — small RFC 8949 encoder (no Node `stream`; Metro-safe; canonical map keys).
- **`shared/mdoc/cborDecodeMinimal.ts`** — minimal decoder used for validation/tests (COSE_Key + BLE UUID).
- **`@noble/curves`** — P-256 key generation (already in the app).

For verifier-side parsing and **DeviceResponse** verification, **`@animo-id/mdoc`** is a good match on Node; the wallet only needs encoding + session key handling for this QR slice.
