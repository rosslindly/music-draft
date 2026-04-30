# mobile-responsive-layout

## Goal
Audit and fix all mobile layout regressions in `src/style.css` so the app is fully
usable on a 375px-wide screen (iPhone SE / standard phone). The viewport meta tag is
already present. The existing `@media (max-width: 600px)` block needs to be expanded
to cover five currently-broken layouts: the Create League two-column field row, the
Baseline Entry artist row, the League Home banner, the Standings row, and the artist
stats panel indentation. Touch targets for draft checkboxes should also meet the 44px
minimum tap area.

## Inputs
- `src/style.css` — add rules to the existing `@media (max-width: 600px)` block and
  create a `@media (max-width: 400px)` block for very small phones

## Layout Fixes Required

| Component | Issue | Fix |
|---|---|---|
| `.create-league-fields-row` | Two fields side-by-side; no breakpoint | Stack to `flex-direction: column` at 600px |
| `.baseline-row` + `.baseline-input` | 130px input alongside avatar + name overflows | Reduce input to `width: 100px` at 600px; full-width stacked row at 400px |
| `.lh-banner-inner` | League name + score block squeeze at ≤375px | Stack to column at 480px, left-align score |
| `.standings-row` | Avatar picks row overflows with many picks; name min-width competes | Reduce `.standings-name` to `min-width: 0` and let it truncate at 400px |
| `.artist-stats-panel` | Fixed 74px left padding leaves little room on mobile | Reduce to 16px left padding at 600px |
| Draft checkboxes | 20×20px tap area too small on mobile | Wrap in a 44×44px tap zone or increase hit area via padding |

## Acceptance Criteria
- [ ] On a 375px-wide viewport, all six views (Welcome, Onboarding, Create League, Draft, Baseline, League Home) render without horizontal scrolling
- [ ] The Create League "Start Date" and "Max Participants" fields stack vertically on screens ≤600px
- [ ] The Baseline Entry artist rows do not overflow — the listener count input remains visible and usable
- [ ] The League Home banner (league name + score) stacks vertically on screens ≤480px with both sections left-aligned
- [ ] Standings rows do not overflow; long handles are truncated with ellipsis
- [ ] The artist stats panel is readable at 375px (no content clipped by left indent)
- [ ] Draft checkboxes are tappable without precision — effective tap target is ≥44px
- [ ] No existing desktop layout is visually changed at viewport widths ≥768px

## Out of Scope
- Gesture/swipe navigation between views (separate task)
- Redesigning any view specifically for mobile (this is a fix pass, not a redesign)
- Testing on actual devices — Chrome DevTools at 375px is the acceptance bar for this task
