# Scoring Refactor

Refactor the scoring system to use more nuanced point calculations.

## Goals

- **Proportional scoring based on monthly listeners** — point values should scale relative to an artist's monthly listener count rather than using flat values
- **Streak bonuses** — award bonus points when an artist's listener count increases for multiple consecutive days or weeks in a row

## Notes

- Define streak thresholds (e.g. 3-day streak, 7-day streak, multi-week streak) and decide on bonus multipliers or flat bonuses
- May require storing historical listener snapshots to detect streaks
- Consider how streaks interact with the Spotify data sync cadence (see `spotify-popularity-sync.md`)
- Unit test coverage should follow from `scoring-unit-tests.md`
