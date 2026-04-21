# listener-baseline-entry

## Goal
After the user submits their draft, show a "Set Baseline" screen where they manually enter the current monthly listener count for each of their picked artists. This snapshot becomes Week 1 and is the reference point for all future scoring.

## Context
Since we're not yet pulling live data from Spotify, the user types in the numbers themselves (from Spotify's artist pages). This is intentional for the solo alpha — it keeps the loop real without requiring OAuth.

## Inputs
- `src/main.js` — after `saveLineup()`, route to baseline entry screen before going to League Home
- `src/ui.js` — add `renderBaselineEntry(lineup, onSubmit)` screen
- `src/scoring.js` — add `saveSnapshot(weekNumber, entries)` and `getSnapshots()` helpers; store under `md_snapshots`
- `src/style.css` — styles for the baseline entry form

## Acceptance Criteria
- [ ] Immediately after drafting, user sees a "Enter Starting Listener Counts" screen listing each of their 5 drafted artists
- [ ] Each artist has a text input for monthly listeners (numeric, required, no commas needed — user can type raw number)
- [ ] A "Save Baseline" button is disabled until all fields are filled with valid positive integers
- [ ] On submit, a Week 1 snapshot is saved to localStorage under `md_snapshots` as an array of `{ week: 1, savedAt: ISO string, artists: [{ id, name, monthlyListeners }] }`
- [ ] After saving, user is routed to League Home
- [ ] If a Week 1 snapshot already exists (page reload, back-navigation), the baseline entry screen is skipped
- [ ] Input fields show placeholder text like "e.g. 4200000"

## Output
- Branch: `feat/listener-baseline-entry`
- Commit: `feat: manual baseline listener entry after draft`

## Dependencies
- `monthly-listeners-model.md` (model must use `monthlyListeners`)
- `league-create.md` (league must exist to associate the snapshot)

## Out of Scope
- Editing baseline after submission (locked once saved)
- Pulling listener counts automatically from Spotify (post-alpha)
- Entering counts for other players' lineups
