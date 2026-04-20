# scoring-unit-tests

## Goal
Write unit tests for every function in `src/scoring.js` to lock in the point-award logic and catch regressions when the Spotify integration replaces mock data.

## Inputs
- `src/scoring.js` — `saveLineup`, `getLineup`, `clearLineup`, `scoreLineup`
- `src/__tests__/` — test directory created in vitest-setup task
- Vitest + jsdom environment (from vitest-setup)

## Acceptance Criteria
- [ ] `scoreLineup` tests cover all three outcomes per artist:
  - popularity rises → 3 points
  - popularity unchanged → 1 point
  - popularity drops → 0 points
- [ ] `scoreLineup` test: full 5-artist lineup with mixed outcomes sums correctly
- [ ] `scoreLineup` test: empty lineup returns 0
- [ ] `scoreLineup` test: single artist, each of the three outcomes
- [ ] `saveLineup` stores artists + timestamp to localStorage under key `fantasy_lineup`
- [ ] `getLineup` returns `null` when nothing is saved
- [ ] `getLineup` returns the object saved by `saveLineup`
- [ ] `clearLineup` removes the stored lineup; subsequent `getLineup` returns `null`
- [ ] All tests pass via `npm test`

## Output
- Branch: `test/scoring-unit-tests`
- Commit: `test: unit tests for scoring module`

## Out of Scope
- Testing UI rendering triggered by scoring
- Integration with real Spotify popularity data
- Mocking `Date` for timestamp assertions (use approximate matching or omit timestamp assertions)
