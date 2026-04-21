# monthly-listeners-model

## Goal
Replace the Spotify `popularity` field (0–100 integer) with `monthlyListeners` (real listener counts like 1,234,567) as the core data unit throughout the app. This makes scoring meaningful and matches the real metric users will track.

## Inputs
- `src/data.js` — add realistic `monthlyListeners` values to all 30 mock artists; update `getTopArtists()` and `getArtistsByIds()` to return `monthlyListeners` instead of `popularity`
- `src/scoring.js` — update `saveLineup()` to store `monthlyListeners` instead of `popularity`; update `scoreLineup()` signature (actual calculation lives in `weekly-score-calculation.md`)
- `src/ui.js` — update draft screen to display monthly listeners (formatted as "1.2M", "840K", etc.) instead of a popularity bar
- `src/style.css` — adjust any styles tied to the popularity display

## Acceptance Criteria
- [ ] Each artist in `ARTISTS` has a `monthlyListeners` integer (use realistic but rough values — doesn't need to be exact)
- [ ] `getTopArtists()` returns artists with `monthlyListeners`; `popularity` field is removed
- [ ] `getArtistsByIds()` returns artists with `monthlyListeners`; the seeded daily delta is removed (listener counts are now entered manually)
- [ ] `saveLineup()` stores `monthlyListeners` per artist, not `popularity`
- [ ] Draft screen shows each artist's monthly listeners formatted (e.g. "42.3M", "1.1M", "840K")
- [ ] No references to `popularity` remain in `data.js`, `scoring.js`, or `main.js`
- [ ] `MOCK_MEMBERS` lineups also updated to use `monthlyListeners` (or removed if superseded by league-create)

## Output
- Branch: `feat/monthly-listeners-model`
- Commit: `feat: replace popularity with monthly listeners throughout data model`

## Dependencies
- Should follow `league-create.md` (which may remove `MOCK_MEMBERS`)

## Out of Scope
- Manual entry UI for listener counts (see `listener-baseline-entry.md`)
- Scoring logic changes (see `weekly-score-calculation.md`)
- Live Spotify monthly listener sync (future task, post-alpha)
