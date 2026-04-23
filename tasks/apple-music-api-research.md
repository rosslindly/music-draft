# apple-music-api-research — Research Apple Music API as alternative to Spotify for user listening activity

## Goal

Evaluate whether the Apple Music API can serve as an equivalent to Spotify's `/me/top/artists` endpoint — i.e. surfacing a user's personal listening history to use as the draft artist pool.

## Questions to answer

- Does Apple Music offer a developer API with user-level listening data (recently played, top artists, etc.)?
- What is the auth flow? (OAuth-style, MusicKit JS, etc.)
- What data is returned per artist — name, ID, images? Anything useful for listener counts?
- How does it compare to Spotify's PKCE OAuth flow we already have?
- Are there any restrictions (platform-only, Apple device required, etc.) that would limit our user base?

## Notes

- Spotify is currently used for listening activity via `/me/top/artists` with PKCE OAuth
- We are open to supporting Apple Music as an alternative or addition, especially for users without Spotify
