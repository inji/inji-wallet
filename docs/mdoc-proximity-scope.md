# mdoc proximity: v1 scope and deferred work

## Current scope: selected mdocs with selective disclosure

The review flow matches requested document types, offers each card holding at least one requested
field, and shares only the ticked fields that the selected card holds. Missing fields are shown as
“Not on your card” and are never shared. One selected card with at least one approved available
field is required for every requested document. Revoked cards are blocked; expired cards show a
warning and can be selected.

`prepareApprovedElements` reuses the selective-disclosure helper from `develop`:
`shared/openID4VP/mdocSelectiveDisclosure.ts`. It keeps each selected IssuerSignedItemBytes and
issuerAuth untouched, preserving issuer digests/signatures. Both native OpenID4VP builders validate
the retained digests and sign DeviceAuthentication over Tuvali's session transcript. Original stored
CBOR is required; decoded presentation JSON is never reconstructed as a credential.

The earlier whole-card-only scope is superseded. Partial document responses and explicit
protocol omission errors remain deferred as described below.

## Screen decisions

- Use draft 3 for the Share nearby entry and QR flow, and draft 2 for the request,
  sending, outcomes, and history flow, subject to the complete-response scope above.
- For the shared confirmation shown after returning Home (draft 2, frame 50), reuse
  the wallet's existing `BannerNotification` with `BannerStatusType.SUCCESS`.
  User decision on 2026-11-01: replace the Figma dark floating "5 details shared / View"
  toast with the existing banner. Preserve its established appearance and dismissal
  behavior; do not introduce a separate toast component or add a View action just to
  reproduce the Figma toast. Keep the shared detail count in the localized message.

Request help now covers verifier details for each trust status, “Who is asking?”,
“About kept copies”, and “What the verifier can see”. Verifier details link to the identity
explanation; privacy help links to retention help. The top question icon opens scan help
while showing/connecting the code and privacy help after that. Linked content uses one modal.
Help copy reflects selective disclosure; unticking a field excludes it from the response.
Certificate issuer, certificate expiry, organisation details, and trusted-list update date
are not supplied by the current native `ReaderTrust` contract and are not fabricated in the UI.
These richer verifier metadata rows and exact Figma visual verification remain pending.

## Wallet state machine

`machines/mdocPresentation` contains the invoked presentation machine. It handles QR/progress,
request matching, explicit consent, one selected card per docType, the optional share-with-selfie
states, preparation, decline, cancellation, further requests, and native outcomes. The scan
machine starts it through `PRESENT_MDOC` after its existing storage, consent-setting, Bluetooth,
nearby-device, and older-Android location checks. Receive-card startup is blocked while an mdoc
flow is active, and an active Receive-card flow blocks mdoc startup.

The invoked actor is available through `selectMdocPresentationRef` in the scan selectors. Its own
selectors expose data for the agreed draft 3 + draft 2 screens. It reads the current wallet
credentials for every request and checks the selected cards again before preparing the response.
Revoked cards cannot be selected; expired cards remain available with a warning.

`createScanMachine(serviceRefs, mdocPresentationDependencies)` accepts an optional
`prepareMdocForSharing(vc, requestedElements)` override for later integration and tests. By default,
it filters the stored selected mdoc to the approved available fields. Never enable a preparation
override whose disclosure scope conflicts with what the consent screen tells the holder.

Cancellation waits for the native presentation to settle before offering a new code. Disposing
the child also cancels native work and releases pending JS consent. Sending and final outcomes
come from native; the wallet does not infer successful delivery from a consent decision.

`screens/ShareNearby` provides the entry, live QR/progress, request/card/checkbox review,
preparation retry, optional existing selfie UI, cancellation confirmation, and outcome views.
The scanner is unmounted while the nearby entry/session is shown. Backgrounding cancels the
active presentation; transient iOS permission prompts do not. Only confirmed native delivery
populates the existing success banner, and its count covers the approved available fields.

The nearby UI directly reuses the app's `Button`, `Text`, and `Column`. The shared `Header`
uses one layout with optional `headerLeft`/`headerRight` controls, title styling, elevation,
and safe-area handling; `UpdatedModal` has an opt-in bottom-sheet
presentation. Existing header/modal defaults are preserved. `ShareScreen` owns the single safe-area/header/scroll shell for entry, readiness, and
presentation. Presentation and readiness render content using their controllers; the former
`ShareNearbyLayout` wrapper has been removed. The former feature `ui.tsx` and
`Action`/`Sheet` wrappers have been removed. Feature styles and colours live in named
`ShareNearby*` sections in `DefaultTheme.ts` and `PurpleTheme.ts`; components read them through
`Theme`. Shared header and bottom-sheet styles are in those theme files too.

The screens use scrollable content, bounded widths, font scaling, safe areas, and existing
buttons with layout supplied through their styling props. Figma assets are local. English
strings are under `ShareNearby`, with an English fallback for other supported locales pending translation.

Confirmed sharing writes the selected cards to the existing activity log when native completes,
before outcome dismissal. Each card uses its existing VC storage key, issuer, configuration ID,
reader name when supplied, and completion timestamp. Unconfirmed/failed/cancelled sessions do
not receive a successful-share entry. Dedicated mdoc outcome/history detail designs remain pending.

Remaining: finish visual verification of the remaining exact Figma frames/assets, remaining card-validity rules, telemetry, translations,
and real-device/reader validation. Functional outcome views exist; this is not a claim that all
draft 2 error/history frames have been visually matched.
The UI keeps connecting and connected phases visible for at least two seconds each, and sending
for at least one second. Failures and cancellation are displayed immediately.

Validation for this functional UI pass: 532 focused regression tests and 31 snapshots passed;
the iOS simulator native build, Android `compileResidentappDebugKotlin` using JDK 17, and both
platforms' production JavaScript bundles passed. The focused TypeScript check found no errors
in the new mdoc/screen files; existing repository type errors remain. Physical iPhone-to-reader sharing was subsequently confirmed, including a Certify card on
2026-11-07. A complete visual/device-size matrix and the earlier intermittent sending failure
remain unverified.

## Deferred: partial responses and omission errors

Before enabling partial responses:

1. Extend `MdocProximity.buildDeviceResponse` in both Kotlin and Swift OVP libraries with typed
   omission inputs, covering both raw-CBOR and base64url credential overloads. Preserve current
   callers through defaults or compatible overloads.
2. Encode `DeviceResponse.documentErrors` for entire requested documents not returned, and
   `Document.errors` for requested elements not returned from a shared document. Use data-handling
   error code `0` (Data not returned) for v1 of this extension.
3. Support errors-only responses without signing nonexistent documents. Reject contradictory
   inputs, including a returned document also marked unreturned, a returned element also marked
   omitted, and element errors attached to an unreturned document.
4. Extend the wallet decision and Android/iOS bridges to carry omission information. Calculate
   final omissions after holder consent and filtering, accounting for unavailable fields,
   deselected fields, and unreturned documents. Match results alone are insufficient.
5. Restore partial candidates and the corresponding draft 2 screens. Add an outcome for a
   response that returned only errors; it must not appear as credentials shared.
6. Decide whether declining everything should send an errors-only response before ending.
   Today's Tuvali `Decline` terminates the session and does not send a DeviceResponse.
7. Add Kotlin/Swift parity tests, shared response vectors, wallet bridge tests, and real-reader
   checks for partial documents, omitted documents, mixed results, and errors-only responses.

Tuvali's existing `Send(deviceResponse)` path can carry these response bytes. BLE/session
encryption changes are not required to add the error structures.

## Matching ownership

Proximity matching stays separate in `shared/mdocPresentation/matching.ts`. Do not adapt the
proximity request into a DCQL query (user decision, 2026-11-01). Keep retention flags, reader trust,
and consent handling in the proximity flow. Shared mdoc-reading helpers can still remove
duplication between the flows without changing the request protocol.

## Naming and design-source review: 2026-11-02

Controller objects and UI flags now distinguish presentation/readiness controllers from the
states they render. Examples include `presentationController`, `readinessController`,
`isShowingMdocContent`, `isShowingMdocReadiness`, `isSendingResponse`, `isShowingOutcome`,
`selectedCandidate`, `requestedElements`, `detailCount`, and `verifierNames`. Native payload
fields, event names, and machine state names remain stable. Candidate matching metadata is
now named `requestedElements` rather than `available`.

User confirmed the Figma comments: label the mdoc option “Proximity QR Code”, keep its mDoc
badge, and remove the QR/connection header only. Entry and request/outcome headers remain.
The engagement help link, Cancel, and hardware Back still work. The source review corrected
reference-backed line heights, Medium typography, step numbering/gradients, offline wording,
and request-help sheet affordances. See [design review](mdoc-proximity-design-review.md) for
remaining gaps. User chose source/design review only; rendered simulator and physical-reader
verification were not performed in this pass.
