# mdoc proximity sharing: design notes

How the Share nearby → Mobile ID QR code flow maps to the approved Figma (file
`F6HYVibHTUUWicHMFfBgjM`, page "mDoc Proximity Feature (BLE)": third draft for entry and QR,
second draft frames 09–62 for readiness, request, sending, outcomes and history), and where the
app deliberately differs.

## Screens

| Area              | Figma               | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entry             | NBY-01, 01b, 02, 03 | Two options: Mobile ID QR code (mdoc) and Bluetooth QR code. The Bluetooth option opens Receive card (this phone acts as the verifier); on iOS it is shown disabled with "Not available on iPhone yet." Bluetooth off before showing a code opens the NBY-03 sheet over the entry.                                                                                                                                                                                                                                                                            |
| QR and connection | MDQ-01–06           | Header titled "Mobile ID QR code". The code lives for 30 s (`ENGAGEMENT_TIMEOUT_SECONDS`); after connecting, each wait between messages allows 300 s (`INACTIVITY_TIMEOUT_SECONDS`). Connecting and connected each stay visible for at least 2 s; errors and cancel skip the wait. Screen brightness is raised while the code is shown and restored afterwards, respecting manual changes.                                                                                                                                                                    |
| Request           | 25–40               | One card is preselected per requested document (valid before expired, then the card holding most requested details); every requested detail starts ticked. Partial and empty selections use the frame 33/34 copy. Expired cards can be shared with a warning (37); revoked or suspended cards cannot. When no card answers any requested document, the frame 36 screen offers End session or Add a card. Long lists (6+ details) offer Select all / Clear all (32). A further request in the same session is introduced as "The verifier is asking for more". |
| Verifier and help | 41–45               | Trust card for verified, unverified and failed-check readers. Verified details show only the rows the reader supplies (see deviations).                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Sending           | 46, 49              | Indeterminate gradient bar (the transport reports no byte progress), shown for at least 1 s before a successful outcome; Cancel opens the stop sheet.                                                                                                                                                                                                                                                                                                                                                                                                         |
| Outcomes          | 50–58               | Shared returns Home after 10 s unless the holder stays. Each failure maps to its own outcome. A confirmed share also shows the app's success banner on Home.                                                                                                                                                                                                                                                                                                                                                                                                  |
| History           | 59–62               | Every response is logged per card as an in-person mdoc entry (shared, not confirmed, stopped, interrupted, declined, face check). The list and detail layouts from 59–62 are not built yet.                                                                                                                                                                                                                                                                                                                                                                   |

## Deviations from the design

- "Only you can end this session. The verifier can't." (MDQ-02/03) is not shown: the reader can
  end the session.
- The Bluetooth option keeps the app's wording, since in this app it makes the phone the
  verifier; the related "show the Bluetooth QR code instead" help line is not shown.
- Outcome frames say "Scan again"; this flow shows a new code instead.
- The expired-code note says 30 s rather than 5 minutes, matching the shorter code lifetime.
- Brightness help reflects whether the boost actually applied.
- Home after sharing (52) uses the existing green success banner instead of the dark toast.
- Verifier details (41) list organisation, certificate issuer, validity and trusted-list date
  only once trusted reader roots exist; today every signed reader is unverified.
- Not built, as the transport gives no signal for them: photo takes longer (47), paused,
  move closer (48), card updating (40).

## Reuse

Screens use the app's existing Header, Button, Text, Modal (bottom sheet), Badge, Checkbox,
HelpIcon, success/error banners and selfie verification. Colours come from the theme palette;
only the share-nearby success and error colours are new. Feature-specific SVGs are limited to
artwork with no existing equivalent.

## Open items

- History list and detail screens (59–62).
- Trusted reader roots, which unlock the verified-reader details.
- iOS receiving through the Bluetooth option (depends on the Tuvali iOS verifier).
- Rendered review on small screens, large text and RTL.
