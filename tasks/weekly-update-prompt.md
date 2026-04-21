# weekly-update-prompt

## Goal
Every Friday after the league starts, prompt the user to enter updated monthly listener counts for their artists. This drives the weekly scoring cycle. The prompt should be hard to miss but not block access to the rest of the app.

## Context
The cadence is Friday-to-Friday: user enters counts on Friday, scores are calculated against the previous Friday's snapshot. The app needs to know today's date and whether the user has already submitted this week's update.

## Inputs
- `src/main.js` — check on app load whether a weekly update is due; surface prompt
- `src/ui.js` — add `renderWeeklyUpdate(lineup, weekNumber, onSubmit)` entry screen; add `renderUpdateBanner(onDismiss, onUpdate)` banner component
- `src/scoring.js` — extend `saveSnapshot()` to handle week N (not just week 1); add `getCurrentWeekNumber()` and `hasSubmittedThisWeek()` helpers
- `src/style.css` — styles for the banner and update entry screen

## Acceptance Criteria
- [ ] On app load, if today is Friday (or later in the week with no submission yet) and at least one prior snapshot exists, a banner appears at the top of League Home: "It's time to update your listener counts — Week N is here!"
- [ ] Banner has two actions: "Update Now" (goes to entry screen) and "Remind me later" (dismisses banner for the current session only — reappears on next load until submitted)
- [ ] The update entry screen mirrors the baseline entry screen: one input per drafted artist, pre-labeled with artist name
- [ ] On submit, a new snapshot is appended to `md_snapshots` with the correct week number
- [ ] Week number is calculated from the league `startDate`: `Math.floor((today - startDate) / 7) + 1`
- [ ] Once a snapshot for the current week exists, the banner does not appear
- [ ] If the user has not yet entered a baseline (Week 1), the weekly update prompt is suppressed until baseline is complete

## Output
- Branch: `feat/weekly-update-prompt`
- Commit: `feat: Friday weekly listener update prompt and entry flow`

## Dependencies
- `listener-baseline-entry.md` (snapshot format must be established)
- `league-create.md` (need `startDate` from league record)

## Out of Scope
- Push notifications or email reminders (requires backend)
- Enforcing Friday-only submission (any day is fine for solo alpha — just check if this week's snapshot is missing)
- Editing a submitted week's snapshot
