# spotify-oauth

## Goal
Replace the mock `login()` / `logout()` in `src/session.js` with a real Spotify OAuth2 PKCE flow so the app can make authenticated API calls on behalf of the user.

## Inputs
- `src/session.js` — current mock auth; rewrite this module
- `src/main.js` — update login trigger and callback handling
- `.env` — `VITE_SPOTIFY_CLIENT_ID` and `VITE_SPOTIFY_REDIRECT_URI` (rename existing keys with VITE_ prefix for Vite exposure)
- Spotify App registered at developer.spotify.com with the correct redirect URI

## Acceptance Criteria
- [ ] `login()` redirects to `accounts.spotify.com/authorize` with PKCE parameters (code_challenge, code_challenge_method=S256, scope=`user-top-read`)
- [ ] On redirect back, `handleCallback()` exchanges the code for tokens and stores `access_token` and `refresh_token` in localStorage
- [ ] `isLoggedIn()` returns true only when a valid (non-expired) access token exists
- [ ] `logout()` clears the stored tokens and returns to the welcome view
- [ ] Token refresh: if the access token is expired, `getAccessToken()` silently refreshes using `refresh_token` before returning
- [ ] PKCE code verifier is generated with `crypto.getRandomValues` (not Math.random)
- [ ] Client secret is never included in the frontend code
- [ ] `.env` example updated in README with correct variable names

## Output
- Branch: `feat/spotify-oauth`
- Commit: `feat: implement Spotify OAuth2 PKCE authentication`

## Out of Scope
- Backend / server-side token exchange
- Implicit grant flow
- Storing tokens anywhere other than localStorage
- Multi-account support
