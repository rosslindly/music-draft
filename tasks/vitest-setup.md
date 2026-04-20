# vitest-setup

## Goal
Add Vitest as the test framework so unit tests can be written for business logic. Vitest is already compatible with the Vite build pipeline in this project.

## Inputs
- `package.json` — add `vitest` devDependency and `test` script
- `vite.config.js` (create if absent) — add `test` block pointing at `src/`
- `src/scoring.js`, `src/data.js` — the modules under test must be importable in a Node/jsdom environment

## Acceptance Criteria
- [ ] `npm test` runs Vitest and exits 0 with at least one passing smoke-test
- [ ] `npm run test:watch` starts Vitest in watch mode
- [ ] `npm run coverage` generates a coverage report
- [ ] A `src/__tests__/` directory exists with a `smoke.test.js` that imports `scoring.js` and asserts the module loads without error
- [ ] `localStorage` is available in tests via jsdom environment (`testEnvironment: 'jsdom'` in config)
- [ ] `dist/` and `node_modules/` are excluded from coverage

## Output
- Branch: `feat/vitest-setup`
- Commit: `chore: add Vitest test framework`

## Out of Scope
- Writing substantive tests (that's covered by scoring-unit-tests and data-rng-tests)
- Integration or E2E test setup
- Coverage thresholds / CI enforcement
