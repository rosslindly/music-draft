# error-handling

## Goal
Wire up the existing `renderError()` function and add defensive handling so the app degrades gracefully instead of silently failing when network calls or localStorage operations go wrong.

## Inputs
- `src/main.js` — orchestrates app flow; all try/catch additions go here
- `src/ui.js` — `renderError(message)` already exists but is never called
- `src/data.js` — `getTopArtists()` and `getArtistsByIds()` are the async call sites
- `src/scoring.js` — `getLineup()` and `saveLineup()` touch localStorage

## Acceptance Criteria
- [ ] If `getTopArtists()` rejects, `renderError()` is called with a user-friendly message and a retry button
- [ ] Clicking the retry button in the error view re-runs the failed operation
- [ ] If `getArtistsByIds()` rejects on the score view, `renderError()` is called (not a blank/broken screen)
- [ ] If `localStorage` is unavailable or throws (e.g., private browsing quota exceeded), `saveLineup` and `getLineup` catch the exception and return `null` / fail silently rather than crashing
- [ ] `renderError` is exported and the call sites are in `main.js`, not spread into `ui.js`
- [ ] No unhandled promise rejections remain in the app flow (verify via browser DevTools console)

## Output
- Branch: `feat/error-handling`
- Commit: `feat: wire up error handling for data fetch and localStorage failures`

## Out of Scope
- Form validation (no user-input forms in this app)
- Server-side error codes (no backend)
- Retry with exponential back-off
- Sentry / error monitoring integration
