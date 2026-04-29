# draft-already-taken

## Goal
Prevent a user from drafting an artist already claimed by another member of their league. Artists taken by others should appear visually disabled on the Draft screen with a "Taken" label. The backend query is blocked on Supabase multi-user support, so this task lays the UI foundation with a stub hook for the data layer.

## Background
`renderDraft` in `src/ui.js` already supports a `lockedIds` set (artists locked into the current player's own lineup). We need a parallel `takenIds` set — artists locked by *other* league members — that renders differently: greyed out, non-selectable, and labelled with who took them.

In `showDraft` in `main.js`, the taken IDs will eventually come from a Supabase query for all other members' lineups in the same league. For now, wire in an empty set with a clearly marked TODO.

## Inputs
- `src/ui.js` — `renderDraft()`: add `takenIds` param (Map of artistId → handle) and render taken state
- `src/main.js` — `showDraft()`: add stub `getTakenArtistIds()` call with TODO comment
- `src/store.js` — add stub `getLeagueMemberLineups()` function with TODO comment pointing at Supabase

## Acceptance Criteria
- [ ] `renderDraft` accepts a new `takenIds` param: a `Map<artistId, handle>` (e.g. `{ 'abc123' => '@jordank' }`)
- [ ] Taken artist cards render with a `taken` CSS class: greyed out, checkbox disabled, not clickable
- [ ] A "Taken by @handle" label appears on each taken card in place of (or below) the listener count
- [ ] Clicking a taken card does nothing (no selection toggle)
- [ ] A player's own locked artists (`lockedIds`) are unaffected by this change
- [ ] `showDraft` in `main.js` passes `takenIds` to `renderDraft`; currently always an empty `Map` with a `// TODO` comment
- [ ] `store.js` exports a stub `getLeagueMemberLineups()` that returns `[]` with a `// TODO: query Supabase for other members' lineups in this league` comment
- [ ] Solo leagues (teamCount === 1) skip the taken check entirely (no wasted query)

## Output
- Branch: `feat/draft-already-taken`
- Commit: `feat: disable already-taken artists on Draft screen`

## Out of Scope
- Actually fetching other members' lineups from Supabase (blocked on supabase-setup + multi-user support)
- Real-time updates if another player drafts while you have the screen open
- Showing taken status on the League Home / Score screen
