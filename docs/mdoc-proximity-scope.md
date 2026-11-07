# mdoc proximity: v1 scope and deferred work

## Current decision: whole selected mdocs, interactive consent UI

Latest user decision on 2026-11-01: wire the functional flow and card/field selection UI now,
but send the entire selected mdoc for each requested document. Selective disclosure will be
connected later. This supersedes the earlier requirement to block Share until a filtering
hook is supplied. Partial protocol responses and document/element omission errors remain deferred.

- Offer every card whose document type matches and that holds at least one requested element;
  requested elements not on the card are listed as "Not on your card, so they won't be shared"
  (design frame 31; user decision 2026-11-03, superseding the 2026-11-01 complete-match rule).
  Share needs at least one ticked element that the selected card holds, and a filtering hook
  receives only those ticked, available elements.
- Require one selected, shareable card for every requested document. A missing document or
  incomplete card selection must not result in a partial response.
- Field checkboxes are interactive and their state is held by the mdoc machine. At least one
  requested field must remain checked per selected document to enable Share. These choices
  currently affect the UI only; they do not filter the native payload.
- Consent explicitly says that whole cards, including unticked and unrequested details, will
  be shared. The action says "Share entire selected card(s)". Other details on the selected
  card are listed separately, so requested fields are not presented as the full disclosure.
- The holder can decline the whole request. The existing decline path ends the session.
- Send the original stored base64url CBOR through the native DeviceResponse builder; do not
  reconstruct an issuer-signed credential from decoded JSON. The existing signing callback
  still signs DeviceAuthentication. Missing original credential bytes fail before sending.
- Selective disclosure belongs to the later filtering integration. When enabled, update the
  consent notice, actual disclosure counts, checkbox guards, and omission-error handling together.

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
Help copy reflects whole-card sharing; unticking fields does not exclude them yet.
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
Expired and revoked cards cannot be selected for sharing.

`createScanMachine(serviceRefs, mdocPresentationDependencies)` accepts an optional
`prepareMdocForSharing(vc, requestedElements)` override for later integration and tests. Without
it, the authorised default sends the entire stored selected mdoc. Never enable a preparation
override whose disclosure scope conflicts with what the consent screen tells the holder.

Cancellation waits for the native presentation to settle before offering a new code. Disposing
the child also cancels native work and releases pending JS consent. Sending and final outcomes
come from native; the wallet does not infer successful delivery from a consent decision.

`screens/ShareNearby` provides the entry, live QR/progress, request/card/checkbox review,
preparation retry, optional existing selfie UI, cancellation confirmation, and outcome views.
The scanner is unmounted while the nearby entry/session is shown. Backgrounding cancels the
active presentation; transient iOS permission prompts do not. Only confirmed native delivery
populates the existing success banner, and its count covers the whole selected cards.

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

Remaining: finish visual verification of the remaining exact Figma frames/assets, selective
disclosure, remaining card-validity rules, non-success history entries, telemetry, translations,
and real-device/reader validation. Functional outcome views exist; this is not a claim that all
draft 2 error/history frames have been visually matched.
The machine accepts `connecting`, but the Tuvali libraries still need to emit that new callback.

Validation for this functional UI pass: 532 focused regression tests and 31 snapshots passed;
the iOS simulator native build, Android `compileResidentappDebugKotlin` using JDK 17, and both
platforms' production JavaScript bundles passed. The focused TypeScript check found no errors
in the new mdoc/screen files; existing repository type errors remain. No physical-reader BLE
session or complete visual/device-size review has been claimed.

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
