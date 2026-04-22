# Task Queue — Music Draft

Prioritized by dependency order. Tasks that others depend on come first.

## Solo Alpha — Full Lifecycle (do these first, in order)

- [x] league-create.md              Replace hardcoded MOCK_LEAGUE with real create flow + localStorage
- [ ] localstorage-export.md        Export/import JSON backup as data safety net
- [x] monthly-listeners-model.md    Swap popularity (0–100) for monthlyListeners throughout data model
- [x] listener-baseline-entry.md    Manual entry of Week 1 listener counts after drafting
- [x] weekly-update-prompt.md       Friday prompt to enter updated listener counts each week
- [x] weekly-score-calculation.md   Score by listener growth; supersedes scoring-refactor.md

## Pre-Multiplayer Alpha (do before inviting friends)

- [ ] supabase-setup.md             Migrate localStorage to Supabase Postgres backend
- [ ] spotify-oauth.md              Implement OAuth2 PKCE flow for Spotify login

## Backlog

- [x] create-league-enhancements.md  Add Start Date + Max Participants fields to Create League; route to League Home (not Draft) post-creation with empty-state Draft CTA and visible Invite Code

- [x] onboarding-screen.md     Profile photo, handle, and Spotify connect screen between Welcome and Join League
- [ ] linting-setup.md         Add ESLint + Prettier with shared config
- [ ] vitest-setup.md          Configure Vitest as the test framework
- [ ] scoring-unit-tests.md    Unit tests for scoring.js point logic
- [ ] data-rng-tests.md        Unit tests for seeded RNG in data.js (superseded by monthly-listeners-model; may be removed)
- [ ] error-handling.md        Wire up renderError() and handle all failure paths
- [ ] spotify-top-artists.md   Replace mock getTopArtists() with real Spotify API
- [ ] spotify-popularity-sync.md Replace mock getArtistsByIds() with live Spotify data
- [ ] share-draft.md           Clipboard sharing of lineup and score
- [ ] draft-history.md         Persist and display past draft results
- [x] remove-league-scoring.md Remove the "Scoring" section from the league invite screen
- [ ] url-routing.md               Hash-based routing so Back button works and screens are deep-linkable
- [ ] avatar-placeholder-images.md Replace initial-letter avatars with placeholder people images throughout
- [ ] profile-header-settings.md   Show profile avatar and name in top right corner of main screens; build out a Settings screen
- [ ] draft-already-taken.md   Show some artists on the Draft screen as already claimed by other players and un-draftable
- [ ] league-start-date.md     Add a Start Date field to each league using placeholder data (superseded by league-create)
- [x] edit-draft-picks.md      Add an Edit mode on the Score page to modify draft picks until the league Start Date has elapsed
- [x] scoring-refactor.md      Proportional scoring based on monthly listeners (Alpha)
- [ ] streak-bonuses.md        Streak bonus points for consecutive weekly listener growth
- [x] pre-start-standings.md   Show empty rankings and 0 points for all players in Standings before the league has started
- [x] league-home-redesign.md  Redesign the Score page into a League Home with high-level league info, my lineup, and standings
