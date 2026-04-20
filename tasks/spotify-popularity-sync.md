# spotify-popularity-sync

## Goal
Replace the seeded-RNG popularity simulation in `getArtistsByIds()` with live Spotify artist data so score comparisons use real popularity changes.

## Inputs
- `src/data.js` — rewrite `getArtistsByIds()` to call Spotify
- `src/session.js` — `getAccessToken()` (from spotify-oauth task)
- Spotify endpoint: `GET /v1/artists?ids=<comma-separated-ids>` (max 50 per request)
- `src/scoring.js` — `scoreLineup()` consumes the output; shape must remain compatible

## Acceptance Criteria
- [ ] `getArtistsByIds(ids)` calls `GET /v1/artists?ids=...` with the user's access token
- [ ] Returns objects with `{ id, name, currentPopularity }` — same shape `scoreLineup` expects
- [ ] Batches calls if `ids.length > 50` (Spotify's per-request limit)
- [ ] The seeded LCG / deterministic delta logic is removed from data.js
- [ ] A 401 from Spotify triggers a token refresh and retries once
- [ ] If an artist ID is not found by Spotify, it is omitted from results (no crash in `scoreLineup`)
- [ ] Score view renders with real popularity deltas (positive/negative/zero change visible)

## Output
- Branch: `feat/spotify-popularity-sync`
- Commit: `feat: fetch live popularity from Spotify for score calculation`

## Out of Scope
- Historical popularity tracking (requires a backend/database)
- Popularity change charts or graphs
- Caching popularity data between sessions
