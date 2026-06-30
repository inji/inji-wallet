# OpenID4VP - DCQL Query Support

This document provides comprehensive documentation on Inji Wallet's support for **Digital Credentials Query Language (DCQL)** as part of the OpenID4VP specification.

> **Prerequisite:**
>
> Please read [OpenID4VP - Online Sharing](./openid4vp-support.md) first to understand the general OpenID4VP flow, authentication, and credential handling. This document focuses exclusively on DCQL-specific query handling and differs from traditional Presentation Exchange requests.

## Overview

**DCQL (Digital Credentials Query Language)** is an alternative credential request format supported by OpenID4VP that allows verifiers to define **complex, declarative queries** for requesting credentials with:

- **Fine-grained claim matching:** Specify exact claims needed via JSONPath expressions
- **Multiple credential combinations:** Define alternative ways to satisfy a requirement
- **Selective disclosure:** Request only necessary information while maintaining privacy
- **Flexible credential sets:** Mark credential groups as required or optional

### Key Differences from Presentation Exchange (PE)

| Aspect                  | DCQL                                         | Presentation Exchange              |
|-------------------------|----------------------------------------------|------------------------------------|
| **Request Property**    | `dcql_query`                                 | `presentation_definition`          |
| **Query Language**      | Declarative queries with claims path, meta   | Input descriptors with constraints |
| **Claim Matching**      | Path-based with exact value matching         | Schema-based constraint matching   |
| **Credential Sets**     | Explicit options with AND/OR logic           | Implicit based on descriptors      |
| **Library Complexity**  | **High** (claims path evaluation, set logic) | Medium (Schema validation)         |
| **Disclosure Handling** | More comprehensive for SD-JWT                | -                                  |

---

## DCQL Request Structure

When a verifier sends a DCQL request, the wallet receives it as part of the Authorization Request (refer to [openid4vp-support.md](./openid4vp-support.md) for request reception). The DCQL request contains:

```json
{
  "dcql_query": {
    "query": [
      {
        "id": "query-1",
        "credentials": [
          {
            "format": "ldp_vc",
            "meta": {
              "type_values":[
                [
                  "https://www.w3.org/2018/credentials#VerifiableCredential",
                  "https://example.org/examples#UniversityDegreeCredential"
                ]
              ]

            },
            "claims": [
              {
                "id": "claim-1",
                "path": ["credentialSubject", "givenName"],
                "values": ["John"]   // Optional: specific value required
              },
              {
                "id": "claim-2",
                "path": ["credentialSubject", "familyName"]
                // No values = any value acceptable
              }
            ]
          }
        ]
      }
    ],
    "credential_sets": [
      {
        "options": [["query-1"]],
        "required": true
      }
    ]
  }
}
```

### Claim Path Pointers

DCQL uses **claim path pointers** (arrays) to specify where a claim is located. The wallet converts these to JSONPath expressions for matching:

```typescript
// Examples of claim paths handled by the library
['credentialSubject', 'givenName']           // Simple property: "credentialSubject.givenName"
['credentialSubject', null, 'givenName']     // Array wildcard: "credentialSubject[*].givenName" - Any entry of credentialSubject with property givenName
['credentialSubject', 0, 'givenName']        // Array index: "credentialSubject[0].givenName"
```

### Credential Sets with Options

A DCQL request can define multiple credential set combinations:

```json
{
  "credential_sets": [
    {
      "options": [
        ["query-1"],              // Option 1: Credential from query-1 alone
        ["query-2", "query-3"]    // Option 2: Credentials from both query-2 AND query-3
      ],
      "required": true            // User MUST fulfill at least one option
    },
    {
      "options": [["query-4"]],
      "required": false           // Optional: nice-to-have credentials
    }
  ]
}
```

---

## How the Library Processes DCQL Queries

The core processing is handled by the native Inji OpenID4VP libraries (`inji-openid4vp-android` and `inji-openid4vp-ios-swift`). The processing flow is as follows:

### 1. DCQL Query Validation in the VP Request

* The library receives the VP request from the wallet.
* It parses the DCQL query and validates its basic structure to ensure it complies with the DCQL specification.

### 2. Credential Matching Algorithm

The library evaluates available credentials against the DCQL criteria using the following steps:

1. **Format Filtering:** Only credentials that match the requested credential formats are considered.
2. **Claim Extraction:** For each credential, the required claims are extracted using the specified claim paths.
3. **Value Matching:** For claims with expected values, the library verifies that the credential contains exact matching values.
4. **Multiple Credential Support:** The library evaluates whether the request can be satisfied by combining multiple credentials.
5. **Claim Set Satisfaction:** It determines which credential set options defined in the query can be fulfilled.

### 3. Can the Request Be Successfully Satisfied?

The library determines which credential set options are satisfiable and returns:

* **`success`**: Indicates whether the request can be successfully satisfied.
* **`queryMatches`**: Identifies the credentials that match each query.
* **`credentialSets`**: Lists the credential set options that can be fulfilled.
* **`allowMultipleCredentials`**: Indicates whether multiple credentials can be used to satisfy the query.


---

## How Wallet Consumes Library for DCQL Processing

Refer to [openid4vp-support.md](./openid4vp-support.md) for the general flow. The DCQL-specific wallet processing happens in these key areas:

### Flow Detection
**File:** `shared/openID4VP/OpenID4VPHelper.ts`

The wallet checks the authorization request structure to determine which flow to use:
- **DCQL flow:** If `dcql_query` property exists in the request
- **Presentation Exchange flow:** If `presentation_definition` property exists

This simple check routes the request to the appropriate handling logic.

### Credential Matching (DCQL-Specific)
**File:** `shared/openID4VP/OpenID4VP.ts` - `getMatchingCredentials()`

**What happens:** Once the wallet receives an authorization request with a DCQL query, it delegates the matching work to the native library.

**The wallet's role:**
1. Checks if this is a DCQL flow (by looking for `dcql_query` property)
2. Collects all available credentials from the device
3. Calls the native library's matching function: `getMatchingCredentials(dcqlQuery, credentials)`
4. Receives structured results back

**What the library returns:**
- `queryMatches`: For each query ID, which credentials satisfy it
- `credentialSets`: Which credential set options are satisfiable
- `success`: Boolean indicating if any matches were found

The library does all the heavy lifting: Claims path evaluation, claim matching, and credential query satisfaction logic.

### Refining Matching Results: Removing Unsatisfiable Credential Options (Wallet Layer)
**File:** `shared/openID4VP/OpenID4VP.ts` - `filterSatisfiableCredentialSetOptions()`

**What happens:** After the library returns matching results, the wallet performs an additional filtering step BEFORE showing the UI.

**Why this is important:**
- The library returns which credential sets CAN theoretically be satisfied
- But some options may not be practical for this specific situation
- The wallet filters to show only combinations that actually work

**Example:**
- Library says: "You can satisfy this request using (query-1 AND query-2) OR (query-3)"
- But if query-2 has no matching credentials, remove that option
- Result: User only sees "(query-3)" which they can actually fulfill
- This prevents showing users options they cannot complete

**Net result:** Users see only valid credential combinations they can actually select and share.

### Credential Selection UI (DCQL-Specific)
**File:** `components/openid4vp/matchingVc/MatchingVcListContainer.tsx`

**What happens:** The wallet renders different UI components based on which flow is detected:
- **For DCQL:** Shows `DcqlMatchingVcList` component
- **For Presentation Exchange:** Shows `PresentationExchangeMatchingVcList` component

**Why this matters:**
- DCQL UI presents credential set options (pick one of these combinations)
- PE UI presents input descriptors (fill these requirements)
- Different data structures require different presentation logic

The UI components transform the matching results into a user-friendly selection interface.

---

## DCQL-Specific Wallet Integration Details

Refer to [openid4vp-support.md](./openid4vp-support.md) for the general SDK initialization and request authentication flow (Steps 0-1). The DCQL-specific processing begins after step 1 with credential matching.

### iOS JSON-LD Expansion for DCQL Matching
**File:** `shared/openID4VP/OpenID4VP.ts`

**What happens:** On iOS, when processing DCQL queries with linked data VCs (ldp_vc), the native library may need to expand JSON-LD contexts to properly locate and match claims.

**How it works:**
1. Native library needs JSON-LD context expansion
2. Calls back to wallet's TypeScript layer via event emitter
3. Wallet expands the context
4. Returns result back to native library
5. Native library continues claim matching

**Why this matters:** DCQL matching may need semantic context to properly understand where claims are located in the credential structure. This callback mechanism allows the library to request this support from the wallet on-demand.

This is unique to iOS and required for ldp_vc credentials with complex nested structures.


---

## DCQL-Specific Error Scenarios

### 1. JSON-LD Expansion Failure (iOS - Library)

**What happens:** During DCQL matching on iOS, the JSON-LD context expansion fails (network issue, invalid context format).

**Error code:** `server_error`

**User impact:** Claim matching fails, user sees error about credential format processing.

---

## DCQL-Specific Data Structures

**File:** `shared/openID4VP/openid4vp.types.ts`

The wallet works with these key DCQL result types:

| Type                       | Purpose                                                                                     |
|----------------------------|---------------------------------------------------------------------------------------------|
| `MatchingVCsResultForDcql` | Overall result containing matching credentials and credential set options                   |
| `MatchResult`              | Result for a single query: which credentials match, can multiple be used, any failed claims |
| `CredentialSetOption`      | Credential set requirement: valid queryId combinations and whether it's required            |

These types structure the library's response so the wallet can:
- Display which credentials match each query
- Show valid credential set combinations to the user
- Track which claims couldn't be satisfied (for error messages)

---

## Key Library Classes (Android: inji-openid4vp)

These classes handle DCQL processing in the native library:

| Class                       | Purpose                                                                 |
|-----------------------------|-------------------------------------------------------------------------|
| `DCQLQuery`                 | Represents parsed DCQL query structure                                  |
| `DCQLHelper`                | Evaluates credentials against DCQL queries → `getMatchingCredentials()` |
| `MatchingCredentialsResult` | Result with `queryMatches`, `credentialSets`, `success`                 |
| `AuthorizationDcqlRequest`  | Represents DCQL authorization request (caches parsed query)             |
| `Credential`                | Represents a credential with format, data, and metadata                 |

---

## Format-Specific Processing in DCQL

Refer to [openid4vp-support.md](./openid4vp-support.md) for general format handling.

**DCQL-Specific Differences:**

### ldp_vc (Linked Data Proof)
- JSON-LD contexts expanded during matching (iOS requires callback)
- Claims matched via expanded JSON-LD structure

### vc_sd_jwt & dc_sd_jwt (Selective Disclosure JWTs)
- **DCQL:** Uses `getDisclosuresForPath()` for comprehensive disclosure handling due to DCQL's different claim path matching
- **PE:** Direct path mapping only
- Different because DCQL may need related/nested disclosures for claim matching

---

## DCQL-Specific Implementation Notes

| Gotcha                                 | Impact                                 | Solution                                                       |
|----------------------------------------|----------------------------------------|----------------------------------------------------------------|
| **Credential Set Filtering Before UI** | User sees options they cannot fulfill  | Always filter impossible combinations before rendering UI      |
| **Flow-Based SD-JWT Handling**         | Different disclosures for DCQL vs PE   | Intentional - DCQL needs broader disclosure for matching       |
| **Android Request Caching**            | Serialization issues with claim values | Reuse cached parsed objects from authenticateVerifier call     |
| **iOS JSON-LD Callbacks**              | ldp_vc claim matching fails            | Register JSON-LD expansion callbacks during SDK initialization |

---

## Testing DCQL Flows

The wallet includes DCQL-specific tests in:

- `shared/openID4VP/OpenID4VP.test.ts` - Tests for DCQL credential matching logic
- `screens/openid4vp/SendVPScreenController.test.ts` - Tests for DCQL vs PE flow detection

**Key test scenarios covered:**
- Credential matching against DCQL queries
- Filtering of credential set options (removes impossible combinations)
- Flow detection (DCQL vs Presentation Exchange)
- Mini-view VC selection mapping

**What's verified:** That the wallet correctly delegates to the library, filters results appropriately, and presents matching credentials to users without showing impossible combinations.

---

## Summary: Wallet's Role in DCQL Processing

| Task                                       | Who        | Where                                     |
|--------------------------------------------|------------|-------------------------------------------|
| **Parse DCQL query**                       | Library    | `inji-openid4vp`                          |
| **Evaluate credentials against DCQL**      | Library    | `DCQLHelper.getMatchingCredentials()`     |
| **Filter credential set options**          | **Wallet** | `filterSatisfiableCredentialSetOptions()` |
| **Display UI for selection**               | **Wallet** | `DcqlMatchingVcList` component            |
| **Extract correct disclosures for SD-JWT** | **Wallet** | `processSdJwtVcForSharing()`              |
| **Construct VP token**                     | Library    | `constructUnsignedVPToken()`              |
| **Sign VP token**                          | **Wallet** | `signDataForVpPreparation()`              |
| **Submit response**                        | Library    | `shareVerifiablePresentation()`           |

**Key Insight:** The library handles complex DCQL logic (query parsing, credential matching, Claims path evaluation). The wallet handles UI orchestration, filtering for user experience, and disclosure processing specific to DCQL vs PE flows.

---

## References

- [Inji Wallet DCQL Card](https://github.com/inji/inji-wallet/issues/2416)
- **DCQL Specification:** [OpenID4VP DCQL Queries](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html#name-digital-credentials-query-l)
- **Android Library:** [inji-openid4vp](https://github.com/inji-project/inji-openid4vp)
- **iOS Library:** [inji-openid4vp-ios-swift](https://github.com/inji-project/inji-openid4vp-ios-swift)
- **Base Reference:** [OpenID4VP - Online Sharing](./openid4vp-support.md)
