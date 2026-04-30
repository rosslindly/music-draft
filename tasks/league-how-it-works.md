# league-how-it-works

## Goal
A "?" icon button appears inline with the "Standings" section heading in the League view (`renderScore` in `src/ui.js`). Clicking it opens a modal overlay with a "How It Works" panel explaining the draft and scoring rules. The modal is dismissible via a close button or clicking the backdrop. The content is static, hardcoded copy — no CMS or commissioner customization. All league members see it; no role restriction.

## Scoring Formula
Points are calculated per artist per week:

```
points = (listenersNow - listenersThen) / listenersThen × 10,000
```

- Only listener gains score — losses and flat weeks always return 0.
- Points accumulate across all weeks played.
- Season grade thresholds: **S** ≥ 12 pts, **A** ≥ 9, **B** ≥ 6, **C** < 6.

## Inputs
- `src/ui.js` — add `?` button to Standings header, add modal HTML and open/close logic inside `renderScore`
- `src/style.css` — add styles for the `?` button and modal overlay

## Acceptance Criteria
- [ ] A `?` button appears to the right of the "Standings" heading in the League view
- [ ] Clicking `?` opens a modal overlay with the title "How It Works"
- [ ] The modal contains three clearly labeled sections: **The Draft**, **Scoring**, and **Standings**
- [ ] **The Draft** copy explains: each player picks up to 3 artists from their Spotify listening history; each artist can only be drafted once per league
- [ ] **Scoring** copy explains: monthly listener counts are recorded each week; points are earned when an artist's listeners grow; the bigger the gain relative to their starting count, the more points scored
- [ ] **Standings** copy explains: points accumulate each week across the season; the player whose artists grew the most wins
- [ ] The modal closes when the close button ("✕" or "Close") is clicked
- [ ] The modal closes when clicking the backdrop outside the panel
- [ ] The modal does not open or close based on user role (visible to all members and commissioners equally)
- [ ] No layout shift occurs in the Standings section when the `?` button is present

## Output
- Branch: `feat/league-how-it-works`
- Commit: `feat: add How It Works modal to League Standings`

## Out of Scope
- Commissioner-editable content (deferred; hardcoded copy only for now)
- A dedicated FAQ page or route
- Deep-linking or anchoring directly to the modal
