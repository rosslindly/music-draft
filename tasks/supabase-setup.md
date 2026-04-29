# supabase-setup

## Goal
Migrate all localStorage persistence to a Supabase (Postgres) backend. This is the prerequisite for multi-player alpha: leagues, lineups, and listener snapshots need to live server-side so that invite codes work and multiple users share real data.

## Context
Do this after the solo alpha is complete and validated end-to-end. The localStorage layer established during solo alpha defines the schema; this task formalizes it in Postgres and replaces the storage calls throughout the app.

## Schema (draft)

```sql
-- Users (populated from Spotify OAuth + onboarding)
-- handle is the primary display name; spotify_connected tracks OAuth status
users (id uuid pk, spotify_id text unique, handle text, avatar_url text, spotify_connected boolean default false, created_at timestamptz)

-- Leagues
-- start_date: when the draft was first locked in (set on first saveLineup)
-- scheduled_start_date: the user-chosen date the league competition begins
-- max_teams: max number of participants (was maxParticipants in UI)
leagues (id uuid pk, name text, invite_code text unique, admin_id uuid fk users, start_date timestamptz, scheduled_start_date date, duration_weeks int, max_teams int, created_at timestamptz)

-- League membership — role is 'commissioner' or 'member'
league_members (league_id uuid fk leagues, user_id uuid fk users, role text not null, joined_at timestamptz, primary key (league_id, user_id))

-- Drafted lineups (one per user per league)
-- artists jsonb shape: [{ id, name, monthlyListeners, imageUrl, savedAt }]
lineups (id uuid pk, league_id uuid fk leagues, user_id uuid fk users, artists jsonb, created_at timestamptz, updated_at timestamptz)

-- Weekly listener snapshots
-- artists jsonb shape: [{ id, name, monthlyListeners }]
listener_snapshots (id uuid pk, league_id uuid fk leagues, user_id uuid fk users, week_number int, recorded_at timestamptz, artists jsonb)
```

## Notes on what stays in localStorage
- `md_top_artists` — Spotify API cache; not user data, stays in localStorage
- `md_oauth_next` — transient post-OAuth navigation state; stays in localStorage
- `md_pkce_verifier` / `md_spotify_tokens` — Spotify session tokens; stay in localStorage (session.js unchanged for now)

## Inputs
- `src/scoring.js` — replace localStorage helpers with Supabase client calls
- `src/session.js` — replace mock session with Supabase Auth (integrates with `spotify-oauth.md`)
- `src/league.js` — replace localStorage league helpers with Supabase queries
- `src/data.js` — `getTopArtists()` can remain mock until `spotify-top-artists.md` is done
- New: `src/supabase.js` — initialize Supabase client with env vars

## Acceptance Criteria
- [ ] Supabase project created; schema applied via migration file in `supabase/migrations/`
- [ ] `src/supabase.js` exports an initialized client using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- [ ] All `localStorage.getItem/setItem/removeItem` calls for `md_*` keys are replaced with Supabase queries
- [ ] League creation writes to `leagues` and `league_members`
- [ ] Lineup save/load reads/writes `lineups` table
- [ ] Listener snapshots read/write `listener_snapshots` table
- [ ] App works end-to-end in the browser with Supabase as the backend (solo flow)
- [ ] `.env.example` documents required env vars; `.env` is in `.gitignore`
- [ ] `localstorage-export.md` data format can be used as a one-time import seed if needed

## Output
- Branch: `feat/supabase-setup`
- Commit: `feat: migrate localStorage to Supabase backend`

## Dependencies
- All solo alpha tasks complete (`league-create`, `monthly-listeners-model`, `listener-baseline-entry`, `weekly-update-prompt`, `weekly-score-calculation`) ✓
- `localstorage-export.md` — skipped; superseded by Supabase
- `spotify-oauth.md` ✓

## Out of Scope
- Row-level security policies (add before production, not required for closed alpha)
- Real-time subscriptions (nice to have for live standings — post-alpha)
- Database backups / point-in-time recovery (Supabase handles this on paid plan)
