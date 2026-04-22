# Scoring Refactor — Proportional Scoring

Refactor `scoreLineup()` to award points proportional to an artist's listener growth percentage, rather than flat values.

## Goals

- **Proportional scoring based on monthly listeners** — points scale with % listener growth so a small artist and a large artist are on equal footing

## Current behavior

`scoreLineup()` in `src/scoring.js` awards flat points:
- Growth → 3 pts
- Flat → 1 pt
- Decline → 0 pts

## New behavior

Replace the flat formula with percentage-based growth scoring:

| Condition | Points |
|---|---|
| No baseline data | 0 |
| Listener decline | 0 |
| Flat (0 change) | 1 (stability reward) |
| Growth | `Math.max(1, Math.round((change / baseline) * 100))` — 1 pt per 1% growth |

This normalizes scores across artist sizes (a 5% growth always earns ~5 pts whether the artist has 100K or 10M listeners).

## Notes

- Only modify `scoreLineup()` — no other storage or model changes needed
- Streak bonuses are tracked separately in `streak-bonuses.md`
- Unit test coverage should follow from `scoring-unit-tests.md`
