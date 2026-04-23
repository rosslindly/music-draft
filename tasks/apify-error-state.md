# apify-error-state — Surface Apify listener count fetch failures in the Draft UI

## Problem

When the Apify token is invalid or the trial has expired, `fetchListenerCounts()` throws
and the error is silently swallowed. The Draft screen renders without listener counts and
the user has no indication that anything went wrong or why the counts are missing.

Additionally, the loading screen shows "Fetching live listener counts…" for the full
duration of the failed request before silently dropping into the draft — which feels broken.

## Desired behaviour

- If Apify enrichment fails, show a small non-blocking notice on the Draft screen
  (e.g. a banner or subtitle under the heading) that says something like
  "Listener counts unavailable — using Spotify data only."
- The draft should still be fully usable; this is purely informational.
- Do not show the notice when Apify is not configured at all (no token), only when a
  token is present but the call failed.

## Implementation notes

- Catch the error in `showDraft()` in `main.js` and pass a flag (e.g. `listenerCountsUnavailable`) to `renderDraft()`.
- `renderDraft()` in `ui.js` conditionally renders the notice when that flag is true.
