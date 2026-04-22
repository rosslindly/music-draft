# spotify-top-artists

## Goal
Replace the hardcoded 30-artist roster in `src/data.js` with a live call to the Spotify API so the draft pool reflects the user's actual top artists.

## Context (added 2026-04-22)
- Fetched after OAuth callback completes; cached in `localStorage` under `md_top_artists`
- Cache persists through the full Draft → Edit Lineup → League Home flow so the same artist pool is shown every time
- `monthlyListeners` is populated from Spotify's `followers.total` (closest available proxy; real listener counts come from manual baseline entry)
- `imageUrl` populated from `images[0].url` for future use (UI still shows initials avatars)
- Mock MOCK_ARTISTS array kept as fallback when Spotify is not connected or fetch fails
- `clearTopArtistsCache()` exported and called from `clearAll()` in main.js (Start Over / Sign Out)

## Inputs
- `src/data.js` — `getTopArtists()` rewritten; `clearTopArtistsCache()` added
- `src/session.js` — `isLoggedIn()` and `getAccessToken()` used
- Spotify endpoint: `GET /v1/me/top/artists?limit=30&time_range=short_term`

## Acceptance Criteria
- [x] `getTopArtists()` calls the Spotify `/me/top/artists` endpoint with the user's access token
- [x] Returns an array of artist objects: `{ id, name, genres, monthlyListeners, imageUrl }`
- [x] If the user has fewer than 30 top artists, returns however many Spotify provides (no crash)
- [x] Artist images use the first entry of Spotify's `images` array (640px); falls back to `null` if absent
- [x] Results cached in localStorage; Edit Lineup reuses same pool without refetching
- [x] Mock artist array kept as fallback (Spotify not connected, or fetch fails)
- [x] A 401 from Spotify triggers a token refresh via `session.js` and retries once
- [ ] Draft view renders correctly with real artist data (name, monthlyListeners, genres)
  - Needs real Spotify credentials to verify end-to-end

## Output
- Implemented directly on `main` branch

## Out of Scope
- Spotify search for arbitrary artists
- Genre-based filtering of the roster
- Displaying artist images in the UI (separate UI task)
