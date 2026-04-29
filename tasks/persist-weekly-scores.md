# persist-weekly-scores

## Goal
After each week's listener snapshot is entered and points are computed, write the locked-in scores to Supabase so they persist independently of re-calculation.

## Context
Currently, points are derived entirely client-side from raw snapshot data on every page load. This is fine for Week 1, but once Week 2+ snapshots exist we should "lock in" that week's earned points to the DB. This ensures:
- Scores are the source of truth, not a side-effect of recalculation
- Historical week scores are immutable (changing the formula later won't retroactively alter past weeks)
- Multiplayer standings can be read directly from the DB without each client re-deriving scores

## When to Write
- Trigger: immediately after a new weekly snapshot is successfully saved (i.e. the user completes the weekly check-in flow and at least one prior snapshot exists)
- Do not write for Week 1 (no prior snapshot to diff against)

## Data Shape (proposed)
A `weekly_scores` table (or equivalent) per player per league per week:

| column | type | notes |
|---|---|---|
| league_id | uuid | FK → leagues |
| user_id | uuid | FK → profiles |
| week | int | week number |
| artist_id | text | Spotify artist ID |
| points | numeric | computed pts for that artist that week |
| locked_at | timestamptz | when the row was written |

Total season points = sum of all `points` rows for a player in a league.

## Acceptance Criteria
- [ ] After week N (N ≥ 2) snapshot is saved, `scoreWeek(snapN, snapN-1)` is called and per-artist points are written to `weekly_scores`
- [ ] If a row already exists for that (league_id, user_id, week, artist_id), upsert/skip — no duplicates
- [ ] League Home standings reads from persisted scores (sum of `weekly_scores`) rather than re-deriving from snapshots
- [ ] Week 1 baseline entry does not trigger a score write

## Dependencies
- `weekly-update-prompt.md`
- `weekly-score-calculation.md`
- `supabase-setup.md`

## Out of Scope
- Retroactively back-filling scores for weeks already entered before this feature ships
- Server-side score calculation (keep it client-computed for now, just persist the result)
