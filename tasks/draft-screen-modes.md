# draft-screen-modes

## Goal
Split the Draft screen into three distinct modes — initial draft, weekly add (append), and edit lineup — each with appropriate data fetching and UI. In initial draft and weekly add modes, the Spotify top-artists cache is bypassed so the pool is always fresh; previously locked artists are removed from the scrollable list and displayed instead in a "Your Lineup" section in the footer above the count and CTA. In edit mode, no artist pool is shown at all: only the player's current picks are rendered with remove/reorder controls, and the footer shows a "Save Lineup →" CTA. The `md_top_artists` localStorage cache is preserved for same-session reuse on initial draft only.

## Context
Currently `showDraft` in `main.js` calls `getTopArtists()` for all three entry points. That function reads from `md_top_artists` cache if present, meaning a weekly-add player may see a stale pool that doesn't reflect recently discovered artists. Additionally, locked artists render as disabled cards inline in the list — visually cluttering the pool with picks that aren't selectable. The edit-lineup flow (`preSelected.length > 0 && lockedIds.size === 0`) has no reason to show the pool at all.

## Inputs
- `src/data.js` — add a `getTopArtistsFresh()` export that bypasses localStorage and always fetches from Spotify (no cache write); existing `getTopArtists()` unchanged
- `src/main.js` — `showDraft()`: use `getTopArtistsFresh()` for initial draft and append mode; skip artist fetch entirely for edit mode; filter locked artists out of the pool array passed to `renderDraft`
- `src/ui.js` — `renderDraft()`: add "Your Lineup" strip to the footer (above count + CTA) that renders locked artists as non-interactive chips; hide the artist list entirely in edit mode and render current picks as a reorderable/removable list instead

## Mode Logic

| Entry point | `appendMode` | `preSelected` | Fetch behavior | UI shown |
|---|---|---|---|---|
| Initial draft | `false` | `[]` | Fresh fetch, write to cache | Pool + empty footer lineup strip |
| Weekly add | `true` | current lineup | Fresh fetch, skip cache | Pool + footer lineup strip with locked artists |
| Edit lineup | `false` | current lineup | No fetch | Pick list only, no pool |

Edit mode is detected as: `preSelected.length > 0 && !appendMode`.

## Acceptance Criteria
- [ ] Opening the Draft screen in initial draft mode always triggers a Spotify API call, ignoring any existing `md_top_artists` cache entry
- [ ] Opening in weekly add (append) mode always triggers a fresh Spotify API call
- [ ] Opening in edit mode makes no Spotify API call and does not read or write `md_top_artists`
- [ ] In initial draft and weekly add modes, artists in `lockedIds` do not appear in the scrollable artist list
- [ ] A "Your Lineup" strip is visible in the footer (above the count text and CTA) in initial draft and weekly add modes
- [ ] The "Your Lineup" strip shows each locked artist's avatar and name as a non-interactive chip
- [ ] The "Your Lineup" strip is empty / hidden on initial draft when no artists are locked
- [ ] In edit mode, no scrollable artist pool is rendered
- [ ] In edit mode, the player's current picks are shown as a list with a remove control on each
- [ ] Removing a pick in edit mode updates the list immediately without navigating away
- [ ] The footer CTA in edit mode reads "Save Lineup →" and is enabled only when at least 1 pick remains
- [ ] Saving in edit mode persists the updated lineup and navigates to League Home
- [ ] The `md_top_artists` cache is written after a successful initial draft fetch (same-session reuse)
- [ ] The `md_top_artists` cache is NOT written after a weekly add fetch
- [ ] Apify listener-count enrichment still runs in initial draft and weekly add modes if a token is present; does not run in edit mode

## Out of Scope
- Reordering picks via drag-and-drop (remove-only for now)
- Manual artist search for players whose desired artist isn't in their top 30 (separate backlog task)
- Real-time pool updates if the player's Spotify listening changes mid-session
