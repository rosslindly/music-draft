# Streak Bonuses

Award bonus points when an artist's listener count increases for multiple consecutive weeks in a row.

## Goals

- **Streak detection** — track consecutive weekly growth for each drafted artist
- **Bonus awards** — apply a bonus multiplier or flat bonus at streak milestones (e.g. 2-week, 4-week, 8-week streaks)

## Notes

- Requires historical listener snapshots (already stored via `saveSnapshot()` in `scoring.js`)
- Define streak thresholds and bonus values — e.g. 2-week streak: +2 bonus pts, 4-week: +5, 8-week: +10
- Consider how streaks interact with the Spotify data sync cadence (see `spotify-popularity-sync.md`)
- Streak resets on any non-growth week (decline or flat)
- Should build on top of the proportional scoring from `scoring-refactor.md`
- Unit test coverage should follow from `scoring-unit-tests.md`
