# URL Routing

Add hash-based routing so the browser Back button works and screens are deep-linkable.

## Problem
Navigation is pure JS state in `main.js`. The browser URL never changes, so Back exits the app and screens can't be bookmarked or linked.

## Routes

| Hash | Screen |
|------|--------|
| `#welcome` | Welcome / landing |
| `#onboarding-profile` | Profile setup (handle, photo, Spotify) |
| `#create-league` | Create league form |
| `#select-league` | League preview / join screen |
| `#draft-lineup` | Draft your 5 artists |
| `#set-week-1-baseline` | Enter Week 1 listener counts |
| `#weekly-update` | Enter current week listener counts |
| `#league/1` | Main league hub (lineup + standings) |

## Approach
- Use `history.pushState` on each navigation and listen to `popstate` to re-render the correct screen
- Pass enough state via the history entry (or re-derive from localStorage) to reconstruct the screen on back-navigation
- `#league/1` is hardcoded for now — **revisit when Supabase is wired up** (`supabase-setup.md`) so the ID comes from a real database record

## Notes
- Loading is a transient overlay, not a route
- No external router library needed — the navigation graph is simple enough to hand-roll
