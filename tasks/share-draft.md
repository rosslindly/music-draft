# share-draft

## Goal
Add a "Share" button to the score view that copies a formatted text summary of the user's lineup and score to the clipboard, so users can post results to social media.

## Inputs
- `src/ui.js` — `renderScore()` is where the button is added
- `src/scoring.js` — `getLineup()` and `scoreLineup()` provide the data
- `src/main.js` — may need to pass score data into the share handler

## Acceptance Criteria
- [ ] A "Share" button appears in the score view after results are calculated
- [ ] Clicking "Share" calls `navigator.clipboard.writeText()` with a formatted string
- [ ] The copied text includes: date, grade, total points, and each artist name + change indicator (↑ / → / ↓)
- [ ] Example format:
  ```
  Music Draft — Apr 20
  Grade: A | 10/15 pts

  ↑ Taylor Swift (+4)
  → Sabrina Carpenter (0)
  ↓ Chappell Roan (-3)
  ↑ Billie Eilish (+2)
  → The Weeknd (0)
  ```
- [ ] Button label changes to "Copied!" for 2 seconds after a successful copy, then reverts
- [ ] If `navigator.clipboard` is unavailable (non-HTTPS or old browser), falls back to `document.execCommand('copy')` with a `<textarea>`; if that also fails, shows a small inline text field the user can manually copy from
- [ ] No external dependencies added

## Output
- Branch: `feat/share-draft`
- Commit: `feat: add clipboard sharing to score view`

## Out of Scope
- Native share sheet (`navigator.share`)
- URL-based sharing (would expose lineup in URL)
- Social media API integrations
- Animated share effects
