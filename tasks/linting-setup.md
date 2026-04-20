# linting-setup

## Goal
Add ESLint and Prettier to enforce consistent code style and catch common bugs. This is foundational — it gates all future feature work.

## Inputs
- `package.json` — add devDependencies and lint/format scripts
- `src/` — all JS source files must pass on first run without changes

## Acceptance Criteria
- [ ] `npm run lint` runs ESLint on `src/**/*.js` and exits 0
- [ ] `npm run format` runs Prettier on `src/**/*.js` and `src/style.css`
- [ ] `npm run lint:fix` auto-fixes fixable issues
- [ ] ESLint config uses `eslint:recommended` + browser globals (no `window is not defined` errors)
- [ ] Prettier config enforces: 2-space indent, single quotes, no semicolons, 100-char line width
- [ ] `.eslintignore` excludes `dist/`
- [ ] Existing source files pass lint without modification (or are auto-fixed cleanly)

## Output
- Branch: `feat/linting-setup`
- Commit: `chore: add ESLint and Prettier`

## Out of Scope
- TypeScript migration
- Husky / lint-staged pre-commit hooks
- Changing any business logic during the format pass
