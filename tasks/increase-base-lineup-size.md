# increase-base-lineup-size

## Goal
Increase the initial draft lineup size from 3 artists to 5. Before this change, the Draft screen locks in at 3 picks and the weekly add cadence starts from a base of 3 (3 in W1, 4 in W2, etc.). After this change, the initial draft requires 5 picks and the weekly cadence starts from 5 (5 in W1, 6 in W2, 7 in W3, etc.). Three files change: the `BASE_PICKS` constant in `permissions.js`, the hardcoded `3` in `showDraft()` in `main.js`, and the `maxPicks = 3` default in `renderDraft()` in `ui.js`.

## Inputs
- `src/permissions.js` — change `BASE_PICKS` from `3` to `5`; update inline comment to reflect new cadence
- `src/main.js` — change hardcoded `3` to `5` in the `maxPicks` assignment inside `showDraft()`
- `src/ui.js` — change default parameter `maxPicks = 3` to `maxPicks = 5` in `renderDraft()`

## Acceptance Criteria
- [ ] Draft screen requires exactly 5 artists selected before the Lock In button enables
- [ ] Lock In button label and counter read `5 / 5 selected` at the point it becomes enabled
- [ ] A user on Week 1 after league start may add 1 artist (lineup cap becomes 6)
- [ ] A user on Week 2 after league start may add 1 artist (lineup cap becomes 7)
- [ ] Existing lineups with 3 picks: the Edit Lineup flow still loads and allows editing (no crash or lock-out)

## Out of Scope
- Migrating or backfilling existing users who already have 3-artist lineups to 5
- Any UI copy changes explaining the lineup size to new users

## Output
- Branch: `feat/increase-base-lineup-size`
- Commit: `feat: increase initial draft lineup size from 3 to 5`
