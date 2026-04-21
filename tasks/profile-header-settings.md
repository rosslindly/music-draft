# Profile Header & Settings Screen

## Goal
Show the user's profile avatar and name in the top right corner of main app screens, and build out a Settings screen accessible from that area.

## Scope

### Profile Header
- Display the user's avatar (photo or initial-letter fallback) and display name in the top right corner of main screens (e.g. League Home, Draft, Score/Standings)
- Tapping the avatar/name navigates to the Settings screen

### Settings Screen
- Accessible by tapping the profile avatar in the header
- Show user info: avatar, display name, handle
- Options to include:
  - Edit profile (name, handle, photo)
  - Spotify connection status (connected / reconnect)
  - Sign out

## Notes
- Profile data already collected during onboarding (name, handle, avatar) — pull from that source
- Coordinate with `avatar-placeholder-images.md` if placeholder images are implemented first
