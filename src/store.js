// store.js — In-memory state backed by Supabase
//
// Reads are synchronous (from in-memory state, populated at boot).
// Writes update in-memory state immediately and fire async Supabase persists.
//
// Keys that remain in localStorage (not app data):
//   md_user_id     — device-level user identity (UUID)
//   md_intent      — transient create/join nav state
//   md_top_artists — Spotify API cache
//   md_spotify_*   — Spotify session tokens (managed by session.js)

import * as db from './db.js';
import { scoreSeason } from './scoring.js';

const USER_ID_KEY   = 'md_user_id';
const INTENT_KEY    = 'md_intent';
const TOP_ARTISTS_KEY = 'md_top_artists';

// ── Device identity ───────────────────────────────────────────────────────────

export function getUserId() {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

export function resetUserId() {
  const id = crypto.randomUUID();
  localStorage.setItem(USER_ID_KEY, id);
  _state.profile = null;
  _state.league = null;
  _state.lineup = null;
  _state.snapshots = [];
}

// ── In-memory state ───────────────────────────────────────────────────────────

const _state = {
  profile:   null,  // { handle, photo, spotifyConnected }
  league:    null,  // { id, name, inviteCode, role, admin, startDate, scheduledStartDate, ... }
  lineup:    null,  // [{ id, name, monthlyListeners, imageUrl, savedAt }]
  snapshots: [],    // [{ week, savedAt, artists }]
};

// ── Boot ──────────────────────────────────────────────────────────────────────

export async function bootStore() {
  const userId = getUserId();

  const user = await db.dbGetUser(userId);
  if (user) {
    _state.profile = {
      handle: user.handle,
      photo: user.avatar_url,
      spotifyConnected: user.spotify_connected,
    };
  }

  const leagueRow = await db.dbGetLeagueForUser(userId);
  if (leagueRow) {
    _state.league = _mapLeague(leagueRow);
    _state.lineup = await db.dbGetLineup(leagueRow.id, userId);
    _state.snapshots = await db.dbGetSnapshots(leagueRow.id, userId);
  }
}

function _mapLeague(row) {
  return {
    id: row.id,
    name: row.name,
    inviteCode: row.invite_code,
    role: row.role,
    admin: _state.profile?.handle ?? row.admin_id,
    startDate: row.start_date ?? null,
    scheduledStartDate: row.scheduled_start_date ?? null,
    durationWeeks: row.duration_weeks ?? null,
    teamCount: row.memberCount ?? 1,
    maxTeams: row.max_teams ?? 10,
    createdAt: row.created_at,
  };
}

// ── Profile ───────────────────────────────────────────────────────────────────

export function loadProfile() { return _state.profile; }

export function saveProfile(profile) {
  _state.profile = profile;
  return db.dbUpsertUser({
    id: getUserId(),
    handle: profile.handle,
    photo: profile.photo,
    spotifyConnected: profile.spotifyConnected ?? false,
  }).catch(err => console.error('[store] saveProfile:', err));
}

// ── Intent (transient nav state — stays in localStorage) ──────────────────────

export function saveIntent(intent) { localStorage.setItem(INTENT_KEY, intent); }
export function loadIntent()       { return localStorage.getItem(INTENT_KEY); }

// ── League ────────────────────────────────────────────────────────────────────

export function getLeague() { return _state.league; }
export function clearLeague() { _state.league = null; }

export async function loadMostRecentLeague(role = 'commissioner') {
  const row = await db.dbGetMostRecentLeague();
  if (!row) return null;
  _state.league = _mapLeague({ ...row, role });
  await db.dbAddLeagueMember(row.id, getUserId(), role)
    .catch(err => console.error('[store] loadMostRecentLeague:', err));
  return _state.league;
}

export function saveLeague(league) {
  const userId = getUserId();
  const existing = _state.league;

  if (!existing) {
    // New league — create in DB
    const leagueId = crypto.randomUUID();
    const inviteCode = league.inviteCode ?? _generateInviteCode();
    _state.league = { ...league, id: leagueId, inviteCode };
    db.dbCreateLeague({
      id: leagueId,
      name: league.name,
      inviteCode,
      adminId: userId,
      scheduledStartDate: league.scheduledStartDate ?? null,
      durationWeeks: league.durationWeeks ?? null,
      maxTeams: league.maxTeams ?? league.maxParticipants ?? 10,
    })
    .then(() => db.dbAddLeagueMember(leagueId, userId, league.role ?? 'commissioner'))
    .catch(err => console.error('[store] createLeague:', err));
  } else {
    // Update existing league
    _state.league = { ...existing, ...league };
    db.dbUpdateLeague(existing.id, {
      name: league.name,
      startDate: league.startDate,
      scheduledStartDate: league.scheduledStartDate,
    }).catch(err => console.error('[store] updateLeague:', err));
  }
}

function _generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ── Join league ───────────────────────────────────────────────────────────────

export async function lookupLeague(code) {
  const row = await db.dbGetLeagueByInviteCode(code);
  if (!row) return null;

  const scheduledStart = row.scheduled_start_date ? new Date(row.scheduled_start_date) : null;
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const daysUntilStart = scheduledStart != null
    ? Math.max(0, Math.ceil((scheduledStart - todayMidnight) / (1000 * 60 * 60 * 24)))
    : '—';

  return {
    id: row.id,
    name: row.name,
    inviteCode: row.invite_code,
    admin: row.adminHandle ?? row.admin_id,
    daysUntilStart,
    teamCount: row.memberCount,
    maxTeams: row.max_teams ?? 10,
    startDate: row.start_date ?? null,
    scheduledStartDate: row.scheduled_start_date ?? null,
    durationWeeks: row.duration_weeks ?? null,
    createdAt: row.created_at,
  };
}

export async function loadOtherMembers() {
  const leagueId = _state.league?.id;
  if (!leagueId) return [];
  const [members, allLineups, allSnapshots] = await Promise.all([
    db.dbGetLeagueMembers(leagueId),
    db.dbGetAllLineups(leagueId),
    db.dbGetAllSnapshots(leagueId),
  ]);
  const lineupByUserId = Object.fromEntries(allLineups.map(l => [l.user_id, l.artists ?? []]));
  const snapshotsByUserId = {};
  for (const s of allSnapshots) {
    (snapshotsByUserId[s.user_id] ??= []).push({ week: s.week_number, artists: s.artists });
  }
  const myId = getUserId();
  const otherMembers = members.filter(m => m.userId !== myId);
  const allArtistIds = [...new Set(otherMembers.flatMap(m => (lineupByUserId[m.userId] ?? []).map(a => a.id)))];
  const artistMeta = await db.dbGetArtistsByIds(allArtistIds);
  const metaById = Object.fromEntries(artistMeta.map(a => [a.id, a]));
  return otherMembers.map(m => {
    const lineup = (lineupByUserId[m.userId] ?? []).map(a => ({
      ...a,
      imageUrl: a.imageUrl ?? metaById[a.id]?.imageUrl ?? null,
      spotifyUrl: a.spotifyUrl ?? metaById[a.id]?.spotifyUrl ?? null,
    }));
    const { totalPoints } = scoreSeason(snapshotsByUserId[m.userId] ?? []);
    return { handle: m.handle, picks: lineup, totalPoints };
  });
}

export async function getTakenArtistIds() {
  const league = _state.league;
  if (!league?.id || (league.teamCount ?? 1) <= 1) return new Map();
  const myId = getUserId();
  const [members, allLineups] = await Promise.all([
    db.dbGetLeagueMembers(league.id),
    db.dbGetAllLineups(league.id),
  ]);
  const lineupByUserId = Object.fromEntries(allLineups.map(l => [l.user_id, l.artists ?? []]));
  const taken = new Map();
  for (const m of members) {
    if (m.userId === myId) continue;
    for (const artist of lineupByUserId[m.userId] ?? []) {
      if (!taken.has(artist.id)) taken.set(artist.id, m.handle);
    }
  }
  return taken;
}

export function setPendingLeague(leagueData) {
  _state.league = { ...leagueData, role: 'member' };
  _state.lineup = null;
  _state.snapshots = [];
}

export async function commitJoin() {
  const leagueId = _state.league?.id;
  if (!leagueId) return;
  await db.dbAddLeagueMember(leagueId, getUserId(), 'member');
}

// ── Lineup ────────────────────────────────────────────────────────────────────

export function saveLineup(artists) {
  const savedAt = new Date().toISOString();
  const lineup = artists.map(({ id, name, monthlyListeners, imageUrl, spotifyUrl }) => ({
    id,
    name,
    monthlyListeners: typeof monthlyListeners === 'number' && !isNaN(monthlyListeners) ? monthlyListeners : null,
    imageUrl: imageUrl ?? null,
    spotifyUrl: spotifyUrl ?? null,
    savedAt,
  }));
  console.log('[store] saving lineup:', lineup.map(a => `${a.name}: ${a.monthlyListeners}`));
  _state.lineup = lineup;
  const league = _state.league;
  if (league) {
    db.dbSaveLineup(league.id, getUserId(), lineup)
      .catch(err => console.error('[store] saveLineup:', err));
    db.dbUpsertArtists(lineup)
      .catch(err => console.error('[store] dbUpsertArtists:', err));
  }
}

export function getLineup()   { return _state.lineup; }
export function clearLineup() { _state.lineup = null; }

// ── Snapshots ─────────────────────────────────────────────────────────────────

export function saveSnapshot(weekNumber, artists) {
  const snapshot = {
    week: weekNumber,
    savedAt: new Date().toISOString(),
    artists: artists.map(({ id, name, monthlyListeners }) => ({ id, name, monthlyListeners })),
  };
  _state.snapshots = _state.snapshots.filter(s => s.week !== weekNumber);
  _state.snapshots.push(snapshot);
  const league = _state.league;
  if (league) {
    db.dbSaveSnapshot(league.id, getUserId(), weekNumber, snapshot.artists)
      .catch(err => console.error('[store] saveSnapshot:', err));
  }
}

export function getSnapshots()   { return _state.snapshots; }
export function clearSnapshots() { _state.snapshots = []; }

// ── Clear all ─────────────────────────────────────────────────────────────────
// Clears in-memory state and Spotify session. md_user_id is preserved so the
// user's DB records can be reloaded on next boot. Data in Supabase is not deleted.
// TODO: for a true "start over", delete DB records or generate a new user UUID.

export function clearAll() {
  _state.profile   = null;
  _state.league    = null;
  _state.lineup    = null;
  _state.snapshots = [];
  localStorage.removeItem('md_spotify_tokens');
  localStorage.removeItem('md_pkce_verifier');
  localStorage.removeItem(TOP_ARTISTS_KEY);
  localStorage.removeItem(INTENT_KEY);
}

// ── Time / week utilities ─────────────────────────────────────────────────────

export function getCurrentWeekNumber(startDate) {
  if (!startDate) return null;
  const start = new Date(startDate).getTime();
  const now = Date.now();
  if (now < start) return null;
  return Math.floor((now - start) / (7 * 24 * 60 * 60 * 1000)) + 1;
}

export function hasSubmittedThisWeek(startDate) {
  const week = getCurrentWeekNumber(startDate);
  if (week == null) return false;
  return _state.snapshots.some(s => s.week === week);
}

// ── Image enrichment ──────────────────────────────────────────────────────────

export function withImages(lineup) {
  if (!lineup) return lineup;
  const cached = localStorage.getItem(TOP_ARTISTS_KEY);
  if (!cached) return lineup;
  const imageById = Object.fromEntries(JSON.parse(cached).map(a => [a.id, a.imageUrl ?? null]));
  return lineup.map(a => ({ ...a, imageUrl: a.imageUrl ?? imageById[a.id] ?? null }));
}
