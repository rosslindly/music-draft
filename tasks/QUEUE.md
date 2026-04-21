# Task Queue — Music Draft

Prioritized by dependency order. Tasks that others depend on come first.

## Backlog

- [x] onboarding-screen.md     Profile photo, handle, and Spotify connect screen between Welcome and Join League
- [ ] linting-setup.md         Add ESLint + Prettier with shared config
- [ ] vitest-setup.md          Configure Vitest as the test framework
- [ ] scoring-unit-tests.md    Unit tests for scoring.js point logic
- [ ] data-rng-tests.md        Unit tests for seeded RNG in data.js
- [ ] error-handling.md        Wire up renderError() and handle all failure paths
- [ ] spotify-oauth.md         Implement OAuth2 PKCE flow for Spotify login
- [ ] spotify-top-artists.md   Replace mock getTopArtists() with real Spotify API
- [ ] spotify-popularity-sync.md Replace mock getArtistsByIds() with live Spotify data
- [ ] share-draft.md           Clipboard sharing of lineup and score
- [ ] draft-history.md         Persist and display past draft results
- [x] remove-league-scoring.md Remove the "Scoring" section from the league invite screen
- [ ] avatar-placeholder-images.md Replace initial-letter avatars with placeholder people images throughout
- [ ] profile-header-settings.md   Show profile avatar and name in top right corner of main screens; build out a Settings screen
- [ ] draft-already-taken.md   Show some artists on the Draft screen as already claimed by other players and un-draftable
- [ ] league-start-date.md     Add a Start Date field to each league using placeholder data
- [x] edit-draft-picks.md      Add an Edit mode on the Score page to modify draft picks until the league Start Date has elapsed
- [ ] scoring-refactor.md     Refactor scoring with proportional monthly-listener values and streak-based bonus points
- [x] pre-start-standings.md   Show empty rankings and 0 points for all players in Standings before the league has started
- [x] league-home-redesign.md  Redesign the Score page into a League Home with high-level league info, my lineup, and standings
