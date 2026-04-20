# draft-history

## Goal
Persist up to 7 days of past drafts in localStorage and display a history view so users can review previous lineups and scores.

## Inputs
- `src/scoring.js` — extend to store scored results alongside the active lineup
- `src/ui.js` — add `renderHistory()` view
- `src/main.js` — add navigation to/from history view
- `src/style.css` — add styles for the history view

## Acceptance Criteria
- [ ] After scoring, the result (date, grade, total points, artist snapshots) is appended to a history array in localStorage under key `draft_history`
- [ ] History is capped at 7 entries; oldest entry is evicted when a new one is added beyond the cap
- [ ] A "History" link/button appears in the score view and draft view
- [ ] `renderHistory()` displays each past draft as a card with: date, grade badge, score (X/15), and the 5 artist names
- [ ] Entries are displayed newest-first
- [ ] If history is empty, a "No past drafts yet" message is shown (not a blank/broken view)
- [ ] A "Back" button in the history view returns to the score view if a scored lineup exists, otherwise to the draft view
- [ ] History survives page reload (persisted in localStorage)
- [ ] Corrupted or malformed history entries are silently skipped (no crash)

## Output
- Branch: `feat/draft-history`
- Commit: `feat: persist and display draft history`

## Out of Scope
- Syncing history across devices (requires backend)
- Exporting history as CSV or JSON
- Editing or deleting individual history entries
- Charts or trend graphs over time
