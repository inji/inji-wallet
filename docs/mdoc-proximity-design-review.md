# mdoc proximity design-source review — 2026-11-02

This is a source/design review, not a rendered end-to-end or pixel comparison. The user chose
source/design review after computer access to Simulator was unavailable. Figma returned the
exact “Who is asking?” context and screenshot; subsequent context/screenshot calls hit the
View-seat quota. Chrome exposed the file/layers/comments, but captures were blank and the
comment anchor could not be resolved. The user explicitly clarified the header change.

## References and decisions

- [Draft 3 entry](https://www.figma.com/design/F6HYVibHTUUWicHMFfBgjM/Inji-Wallet-App?node-id=5606-3273),
  [QR](https://www.figma.com/design/F6HYVibHTUUWicHMFfBgjM/Inji-Wallet-App?node-id=5606-3963),
  and [draft 2 request body](https://www.figma.com/design/F6HYVibHTUUWicHMFfBgjM/Inji-Wallet-App?node-id=5550-4127):
  previously retrieved detailed contexts, retained for this review.
- [Who is asking?](https://www.figma.com/design/F6HYVibHTUUWicHMFfBgjM/Inji-Wallet-App?node-id=5550-5859):
  detailed context and screenshot retrieved in this pass.
- Other variants were checked against the cached frame/layer metadata and current implementation.
  Metadata does not establish exact typography, artwork, or rendered layout fidelity.
- User confirmed “Proximity QR Code” for the mdoc option, retaining the mDoc badge.
- User confirmed removal of the QR/connection header only; entry and request/outcome headers stay.
- Whole selected mdocs are sent, including unticked/unrequested details. Consent/help must
  explain that honestly even where Figma describes future selective disclosure.
- Use the existing app success banner instead of the dark Figma “details shared / View” toast.
- User requested a minimum two seconds each for connecting and connected before request
  review. The display sequence runs independently of native transport/consent; errors and
  cancellation bypass it, and genuinely slow connections remain visible until connected.
- Sending uses a horizontal animated gradient bar with a minimum one-second display before
  successful outcomes. It is indeterminate because native does not report byte progress;
  errors/cancellation bypass the display delay. The count includes the full selected cards.

## Corrections made

| Area             | Source-backed correction                                                                                                                                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entry            | Offline card copy now matches “Both options work offline”; option titles use 15/20 and Share title 26/32. Tinted icon surfaces reuse the app gradient.                                                                      |
| Tabs             | Unselected labels use Medium and selected labels Semibold at 14/18; the active indicator uses the existing app gradient with inset ends.                                                                                    |
| QR/connection    | Heading corrected to 20/26; the redundant header removed per user clarification; step numbers restored and active dot uses the app gradient. Generated QR remains live and container-sized, capped at 216.                  |
| Phase visibility | Connecting and connected each remain visible for at least two seconds. The shared stepper persists into request review and sharing, with Share active once connected.                                                       |
| Shared text      | Body 14/20 and secondary 12/16; matching body/border/subtle-surface roles added to both existing themes.                                                                                                                    |
| Typography       | The already-loaded Montserrat Medium face is now available through shared Text; requested fields use Medium 14/18.                                                                                                          |
| Request rows     | Card title 14/18, trust label 12/16, issuer logo slot 30×19. Checkbox remains 22×22 with a larger press target.                                                                                                             |
| Request help     | Shared Modal supports optional handle, exact 16×16 close asset, accessible close action, custom content/backdrop styles, and primary footer action. Help headings use 18/24; trust badges use 12/16 and explanations 13/18. |
| Buttons          | Existing adaptive buttons use Semibold, 8px corners, and minimum heights 52 for primary / 54 for outline, growing with font size. Legacy defaults remain unchanged.                                                         |
| Names            | Explicit controller/boolean/callback names; separate selected-card, checked-field, requested-element, and actual-disclosure count names. Native contracts and machine states are unchanged.                                 |

## Remaining gaps

| Area / Figma frames                                       | Remaining work                                                                                                                                                                                                                                                               |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Connecting / connected — draft 3 `5606:4030`, `5606:4115` | User screenshot confirms separate phone illustrations and supporting session cards. Exact assets/layout remain pending: Figma API is quota-limited and computer/browser access currently fails to start. Existing progress indicator is retained.                            |
| Sending — 46, `5550:6268`                                 | Horizontal gradient progress, actual whole-card detail count, and nearby-device guidance are implemented. Exact two-phone illustration and full rendered layout comparison remain pending asset/browser access. The bar is indeterminate; no fabricated percentage is shown. |
| Outcomes — 51, 53–58                                      | Functional generic views still reuse app success/error artwork. Figma has 80px status treatments, variant-specific layouts, time rows, and supporting cards. Exact artwork/layout matching remains pending.                                                                  |
| Request action area — 25–40                               | Actions currently sit within the shared scroll content. Figma has a separate pinned footer. Need rendered short/tall-screen and large-font verification before deciding final footer geometry.                                                                               |
| Verifier details — 41/42                                  | Native ReaderTrust supplies status, name, and reason, not organisation/certificate issuer/expiry/trusted-list refresh data. Those rows are intentionally absent.                                                                                                             |
| Help — 41–45                                              | Routes and shared affordances exist. Only frame 43 received fresh full design context in this pass. Exact content/layout of the other variants still needs full-frame verification; retention/privacy wording intentionally reflects whole-card sharing.                     |
| Entry help — draft 3 `5606:3564`                          | Existing help is a general explanation. Figma contains a richer code-comparison sheet; exact source/assets are still needed. The BLE receive option also reflects the app's current Android-only capability.                                                                 |
| Readiness — draft 3 `5606:3728`                           | Current readiness is full content; Figma's Bluetooth-off state is an overlay on entry. Exact overlay treatment needs its detailed context and rendered review.                                                                                                               |
| History — 59–62                                           | Confirmed mdoc sharing now writes one existing VC_SHARED activity per selected card immediately on native completion. Global/card history reuse those entries. Dedicated Figma history detail layouts and non-success mdoc outcome entries remain deferred.                  |
| Themes and accessibility                                  | Values and layout are adaptive in source, but neither theme, RTL, larger text, rotation, nor device-size composition was visually verified here. Existing app gradient colours are reused rather than creating an independent gradient system.                               |

## Asset and behavior checks

All 20 local SVGs were parsed and confirmed nonempty. New assets are exact downloads from
frame 43: close 16×16, verified badge 14×14, failed-check badge 14×14. Their callsites do not
override root dimensions. This checks source geometry, not effective rendered geometry.

Focused tests exercise entry/card/field selection, QR sizing/expiry, actor-driven outcomes,
header removal, contextual help navigation, closing help without cancelling, stop confirmation,
background cancellation, listener cleanup, and native/matching/state-machine behavior.
Physical BLE transport, real-reader acceptance, and delivered on-device disclosure have not
been validated by these tests.

Validation in this pass: 349 tests across 37 suites and 23 snapshots passed. After the final
readiness flag rename, the 22 screen tests passed again. Scoped feature/modal TypeScript
checks passed; the pre-existing shared Text diagnostic is unchanged from the repository
baseline. Lint has no errors in the touched feature/common components, with existing warnings.

## Design pass, 2026-11-03 (supersedes the rows above where they differ)

Checked on an Android phone against MATTR GO Verify (iPhone) and the PNG export:
entry (NBY-01/01b/02/03), QR and connection (MDQ-01–06), request and help sheets (25–45),
sending and shared (46, 50). Built and unit-tested but not yet seen on a device: stop sheet
(49), declined/stopped/interrupted/timed-out/verifier-problem/connection-lost outcomes (53–58),
Bluetooth turned off mid-session (23).

Decisions (user):

- The request screen uses the design copy ("Share N details", no whole-card warnings) although
  whole cards are sent until the filtering hook lands.
- "Share with selfie verification" stays (same rule as online sharing).
- The QR/connection screens keep no header; request and outcome screens keep theirs.

Open:

- Home after sharing (52): the design shows a dark bottom toast with View; the app's existing
  green top banner is kept for now (shared component).
- History (59–62): mdoc shares still log the generic VC_SHARED entry; no mdoc-specific list
  entries, detail screens, or entries for declined/stopped/interrupted sessions yet.
- Copy for design to fix: "Only you can end this session. The verifier can't." (MDQ-02/03; the
  reader can end it); the "Both of them" panel in NBY-02 (two items don't fit the Bluetooth
  receive option); MDQ-05's "Brightness is already turned up" (not implemented) and "show the
  Bluetooth QR code instead" (that option makes this phone the verifier); outcome frames say
  "Scan again", our flow shows a new code.
- Montserrat 500 renders as the system font on Android app-wide; these screens use 400 instead.

## Asset reuse audit, 2026-11-06

Reviewed all 34 added SVGs against their production imports and existing wallet assets.
Seven files were removed; all 27 remaining SVGs have production consumers.

| Removed asset                                        | Reused asset                                                   |
| ---------------------------------------------------- | -------------------------------------------------------------- |
| `shareNearby/info.svg`                               | Existing `Info.svg`, with grey palette and 16px size           |
| `shareNearby/help.svg`                               | Existing `Colored_Info.svg`, with theme gradient and 16px size |
| `shareNearby/tick.svg`, `shareNearby/tick-green.svg` | `shareNearby/check.svg`, with a color prop                     |
| `shareNearby/lock-white.svg`                         | `shareNearby/lock.svg`, with a white color prop                |
| `shareNearby/bluetooth-off-grey.svg`                 | `shareNearby/bluetooth-off.svg`, with a grey color prop        |
| `shareNearby/verified-badge.svg`                     | Identical badge geometry in `shareNearby/verified.svg`         |

Retained assets cover navigation, QR/nearby/Bluetooth options, connection/privacy indicators,
trust status, and outcomes. Existing alternatives differ in geometry or include extra artwork:
`questionIcon.svg` has no enclosing circle; `file_copy.svg` depicts a folded page;
`Warning_Icon.svg` includes a tile/shadow; `Outlined_Schedule_Icon.svg` is a clock rather than
a stopwatch; existing identity, lock, and success illustrations include different proportions
or backgrounds. White Bluetooth badges and grey scan icons also differ from the existing
gradient artwork. No existing wallet asset was modified.

Validation: 81 tests across five header/nearby suites and two snapshots passed. All retained
SVGs parse, their imports resolve, and the SVG transformer preserves palette overrides.
This source audit does not replace on-device visual verification.

## Shared UI reuse audit, 2026-11-07

Reviewed existing components alongside the nearby feature. The initial review added
consolidation notes; the subsequent badge/checkbox reuse is recorded below.

| Pattern                       | Existing implementations / nearby counterpart                                                    | Reuse assessment                                                                                                                                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bottom-sheet container        | `UpdatedModal`, `ExpandableListSheetView`, `StatusInfoModal`, `KebabPopUp`, `ShareableInfoModal` | Five separate containers. Extract common presentation, safe-area handling, scrolling, and dismissal; retain list/menu/status/disclosure content and caller-specific actions.                                   |
| Field checkbox and card radio | `ui/checkbox/Checkbox`, now used by `RequestedField` and `CardChoices`                           | Reused for multiple/single selection with labels/state, card content, layout overrides, theme color, and existing size support. Field touch targets remain at least 44px; disabled choices cannot be selected. |
| Issuer logo                   | `ui/AdaptiveImage` versus `request/IssuerLogo`'s native `Image`                                  | Reuse candidate that also supports SVG URLs. First allow the nearby 30x19 dimensions; existing SVG rendering passes fixed 60x60 dimensions.                                                                    |
| Trust/status badge            | `ui/badge/Badge`, now used by `VerifierTrustBadge`                                               | Reused with an optional custom icon and container/text style overrides. Existing DCQL defaults are preserved.                                                                                                  |
| Header                        | `ui/Header` versus the header markup in `ui/Modal` and fullscreen `UpdatedModal`                 | Existing modal headers can eventually use shared header primitives. Preserve their subtitles, device information, and close/back behavior.                                                                     |
| Message dialogs               | `MessageOverlay`, `DualMessageOverlay`, `TrustModalVerifier`                                     | Similar centered dialog shells; not bottom sheets. `DualMessageOverlay` already warns that it needs refactoring before reuse.                                                                                  |

Similar appearance alone is insufficient for replacement: `SharingStatusModal` contains
navigation/app-exit behavior unsuitable for nearby outcomes; the generic progress indicators
use solid-color bars rather than the agreed nearby gradient animation; `InfoBox` lacks the
icon/action slots used by the inline session-ended notice. Keep those feature compositions
until the shared components support the required behavior and design.

Already reused by nearby: app buttons, text/layout primitives, shared header, HelpIcon, Badge, Checkbox,
success/error banners, existing selfie verification, and the shared modal's sheet presentation.
