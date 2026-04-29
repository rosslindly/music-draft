-- Music Draft — initial schema

-- Users (populated from Spotify OAuth + onboarding)
create table users (
  id                uuid primary key default gen_random_uuid(),
  spotify_id        text unique,
  handle            text not null,
  avatar_url        text,
  spotify_connected boolean not null default false,
  created_at        timestamptz not null default now()
);

-- Leagues
create table leagues (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  invite_code           text unique not null,
  admin_id              uuid not null references users(id),
  start_date            timestamptz,
  scheduled_start_date  date,
  duration_weeks        int,
  max_teams             int not null default 10,
  created_at            timestamptz not null default now()
);

-- League membership
create table league_members (
  league_id  uuid not null references leagues(id),
  user_id    uuid not null references users(id),
  role       text not null check (role in ('commissioner', 'member')),
  joined_at  timestamptz not null default now(),
  primary key (league_id, user_id)
);

-- Drafted lineups (one per user per league)
-- artists jsonb shape: [{ id, name, monthlyListeners, imageUrl, savedAt }]
create table lineups (
  id         uuid primary key default gen_random_uuid(),
  league_id  uuid not null references leagues(id),
  user_id    uuid not null references users(id),
  artists    jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (league_id, user_id)
);

-- Weekly listener snapshots
-- artists jsonb shape: [{ id, name, monthlyListeners }]
create table listener_snapshots (
  id          uuid primary key default gen_random_uuid(),
  league_id   uuid not null references leagues(id),
  user_id     uuid not null references users(id),
  week_number int not null,
  recorded_at timestamptz not null default now(),
  artists     jsonb not null default '[]',
  unique (league_id, user_id, week_number)
);
