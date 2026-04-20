# data-rng-tests

## Goal
Write unit tests for the seeded RNG and mock data layer in `src/data.js` to verify that daily popularity deltas are deterministic and correctly bounded.

## Inputs
- `src/data.js` — `getTopArtists`, `getArtistsByIds`, and the internal seeded LCG
- `src/__tests__/` — test directory from vitest-setup
- Vitest environment (from vitest-setup)

## Acceptance Criteria
- [ ] `getTopArtists` test: resolves to an array of exactly 30 artists
- [ ] `getTopArtists` test: every artist has `id`, `name`, and `popularity` fields
- [ ] `getTopArtists` test: all popularity values are integers in [0, 100]
- [ ] `getArtistsByIds` test: calling twice with the same IDs and same date returns identical `currentPopularity` values (determinism)
- [ ] `getArtistsByIds` test: calling with the same IDs on two different dates returns different `currentPopularity` values at least sometimes (non-static)
- [ ] `getArtistsByIds` test: `currentPopularity` values are clamped to [0, 100]
- [ ] `getArtistsByIds` test: resolves only the artists whose IDs were requested (no extras, no missing)
- [ ] `getArtistsByIds` test: unknown IDs are gracefully omitted (no crash)
- [ ] All tests pass via `npm test`

## Output
- Branch: `test/data-rng-tests`
- Commit: `test: unit tests for data module and seeded RNG`

## Out of Scope
- Testing the artificial network delay (stub/skip it)
- Testing UI interactions that consume data
- Real Spotify API calls
