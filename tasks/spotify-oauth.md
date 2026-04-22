# spotify-oauth

## Goal
Replace the mock `login()` / `logout()` in `src/session.js` with a real Spotify OAuth2 PKCE flow so the app can make authenticated API calls on behalf of the user.

## Context (added 2026-04-22)
- Entry point: the "Connect Spotify" button on the Spotify Connect screen (`renderSpotifyConnect`)
- `showSpotifyConnect` in main.js calls `login()` as the `onConnect` handler — this redirects the user to Spotify
- Spotify redirects back to `VITE_SPOTIFY_REDIRECT_URI` (e.g. `http://127.0.0.1:5173/callback`)
- The callback is handled in **main.js bootstrap**: detects `?code=` in `window.location.search`, calls `handleCallback(code)`, saves `spotifyConnected: true` to profile, then navigates to Draft
- If the user denies on the Spotify page (`?error=`), profile is set to `spotifyConnected: false` and app falls back to mock artists

## Inputs
- `src/session.js` — full rewrite (done)
- `src/main.js` — callback handling in bootstrap + `showSpotifyConnect` wired to `login()`
- `.env` — `VITE_SPOTIFY_CLIENT_ID` and `VITE_SPOTIFY_REDIRECT_URI` (renamed from `VITE_REDIRECT_URI`)

## Acceptance Criteria
- [x] `login()` redirects to `accounts.spotify.com/authorize` with PKCE parameters (code_challenge, code_challenge_method=S256, scope=`user-top-read`)
- [x] On redirect back, `handleCallback()` exchanges the code for tokens and stores `access_token` and `refresh_token` in localStorage
- [x] `isLoggedIn()` returns true only when a valid (non-expired) access token exists
- [x] `logout()` clears the stored tokens and returns to the welcome view
- [x] Token refresh: if the access token is expired, `getAccessToken()` silently refreshes using `refresh_token` before returning
- [x] PKCE code verifier is generated with `crypto.getRandomValues` (not Math.random)
- [x] Client secret is never included in the frontend code
- [ ] `.env` example updated in README with correct variable names

## Output
- Implemented directly on `main` branch
- Commit: `feat: implement Spotify OAuth2 PKCE authentication`

## Out of Scope
- Backend / server-side token exchange
- Implicit grant flow
- Storing tokens anywhere other than localStorage
- Multi-account support
