# spotify-top-artists

## Goal
Replace the hardcoded 30-artist roster in `src/data.js` with a live call to the Spotify API so the draft pool reflects the user's actual top artists.

## Inputs
- `src/data.js` — rewrite `getTopArtists()` to call Spotify
- `src/session.js` — `getAccessToken()` from spotify-oauth task (must be complete first)
- Spotify endpoint: `GET /v1/me/top/artists?limit=30&time_range=short_term`

## Acceptance Criteria
- [ ] `getTopArtists()` calls the Spotify `/me/top/artists` endpoint with the user's access token
- [ ] Returns an array of artist objects normalized to the same shape the rest of the app uses: `{ id, name, popularity, genres, imageUrl }`
- [ ] If the user has fewer than 30 top artists, returns however many Spotify provides (no crash)
- [ ] Artist images use the first entry of Spotify's `images` array (640px); falls back to `null` if absent
- [ ] The mock 30-artist array is removed from data.js
- [ ] The artificial network delay (setTimeout) is removed
- [ ] Draft view renders correctly with real artist data (name, popularity, tier badge)
- [ ] A 401 from Spotify triggers a token refresh via `session.js` and retries once

## Output
- Branch: `feat/spotify-top-artists`
- Commit: `feat: fetch draft pool from Spotify top artists API`

## Out of Scope
- Spotify search for arbitrary artists
- Genre-based filtering of the roster
- Caching artist data beyond the current session
- Displaying artist images in the UI (that's a separate UI task)
