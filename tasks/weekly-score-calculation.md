# weekly-score-calculation

## Goal
Calculate and display points based on the change in monthly listeners between the current week's snapshot and the previous week's. Update League Home to show listener counts, deltas, and total points per artist.

## Context
Supersedes the existing popularity-delta scoring in `scoring.js`. Points are based on real listener growth, not a 0–100 popularity index. Adopts the proportional scoring formula from `scoring-refactor.md` (1 pt per 1% weekly growth), with week-over-week accumulation as the core mechanic. Streak bonuses from `streak-bonuses.md` can layer on top post-alpha.

## Inputs
- `src/scoring.js` — replace `scoreLineup()` with `scoreWeek(currentSnapshot, previousSnapshot)` that returns per-artist deltas and total points
- `src/main.js` — pass the two most recent snapshots to the score renderer
- `src/ui.js` — update `renderScore()` (League Home) to display: artist name, listeners last week, listeners this week, delta (±), points
- `src/style.css` — style the listener delta display (green for growth, red for decline, neutral for flat)

## Scoring Formula (Solo Alpha)
- **Proportional growth**: `max(0.1, round((change / previousWeekListeners) * 100, 1))` — 1 pt per 1% weekly listener growth
- **0 points** for no change or listener loss
- **1 point** for flat (stability reward)
- No baseline data → 0 points
- Points from each week accumulate into a running season total
- No multipliers or streaks yet

## Acceptance Criteria
- [ ] `scoreWeek(current, previous)` computes proportional % growth per artist (1 pt per 1% growth, 1 pt for flat, 0 for decline) and total points
- [ ] If only one snapshot exists (Week 1 baseline, no update yet), League Home shows listener counts with 0 points and a "Scores update after your first weekly check-in" message
- [ ] If two or more snapshots exist, League Home shows the week-over-week delta and earned points
- [ ] Artist rows display: name | last week listeners (formatted) | this week listeners (formatted) | delta (e.g. "+120K") | points earned
- [ ] Total points are shown prominently at the top of the lineup section
- [ ] `scoreLineup()` using popularity is removed; `scoring-refactor.md` is marked superseded in the queue

## Output
- Branch: `feat/weekly-score-calculation`
- Commit: `feat: weekly listener growth scoring`

## Dependencies
- `monthly-listeners-model.md`
- `listener-baseline-entry.md`
- `weekly-update-prompt.md` (need at least two snapshots to score)

## Out of Scope
- Streak bonuses (deferred to post-alpha)
- Proportional scoring tiers (deferred to post-alpha)
- Other players' scores (no multi-player yet)
