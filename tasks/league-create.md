# league-create

## Goal
Replace the hardcoded `MOCK_LEAGUE` in `main.js` with a real league creation flow. The user names their league, an invite code is generated, and the league is persisted in localStorage. This is the foundation for every other alpha-lifecycle task.

## Inputs
- `src/main.js` — remove `MOCK_LEAGUE` constant; route through create-league screen before onboarding or after
- `src/ui.js` — add `renderCreateLeague()` screen
- `src/scoring.js` (or new `src/league.js`) — add `saveLeague()`, `getLeague()`, `clearLeague()` helpers
- `src/style.css` — styles for the create-league screen

## Acceptance Criteria
- [ ] A "Create League" screen appears after onboarding (or on first launch when no league exists in localStorage)
- [ ] User can enter a league name (required, max 40 chars)
- [ ] A unique 6-character alphanumeric invite code is auto-generated and displayed on creation
- [ ] League is saved to localStorage under key `md_league` as `{ name, inviteCode, createdAt, startDate: null }`
- [ ] `startDate` is set to the date the first draft is submitted
- [ ] On subsequent app loads, the saved league is read from localStorage — the create screen is skipped
- [ ] `MOCK_LEAGUE` constant and all references to it are removed from `main.js`
- [ ] A "Back" button returns to the onboarding screen

## Output
- Branch: `feat/league-create`
- Commit: `feat: real league creation with localStorage persistence`

## Out of Scope
- Joining someone else's league via invite code (see `league-join.md` — future task)
- Setting a manual start date (startDate auto-sets on first draft submission)
- League settings / edit after creation
- Multi-player: invite code is generated but not yet usable by others
