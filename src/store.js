// store.js — All localStorage persistence and derived state

const PROFILE_KEY   = 'md_profile';
const INTENT_KEY    = 'md_intent';
const LINEUP_KEY    = 'fantasy_lineup';
const LEAGUE_KEY    = 'md_league';
const SNAPSHOTS_KEY = 'md_snapshots';
const TOP_ARTISTS_KEY = 'md_top_artists';

// ── Profile ───────────────────────────────────────────────────────────────────

export function saveProfile(profile) { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); }
export function loadProfile()        { const r = localStorage.getItem(PROFILE_KEY); return r ? JSON.parse(r) : null; }

// ── Intent ────────────────────────────────────────────────────────────────────

export function saveIntent(intent) { localStorage.setItem(INTENT_KEY, intent); }
export function loadIntent()       { return localStorage.getItem(INTENT_KEY); }

// ── League ────────────────────────────────────────────────────────────────────

export function saveLeague(league) { localStorage.setItem(LEAGUE_KEY, JSON.stringify(league)); }
export function getLeague()        { const raw = localStorage.getItem(LEAGUE_KEY); return raw ? JSON.parse(raw) : null; }
export function clearLeague()      { localStorage.removeItem(LEAGUE_KEY); }

// ── Lineup ────────────────────────────────────────────────────────────────────

export function saveLineup(artists) {
  const savedAt = new Date().toISOString();
  const lineup = artists.map(({ id, name, monthlyListeners, imageUrl }) => ({
    id,
    name,
    monthlyListeners: typeof monthlyListeners === 'number' && !isNaN(monthlyListeners) ? monthlyListeners : null,
    imageUrl: imageUrl ?? null,
    savedAt,
  }));
  console.log('[store] saving lineup:', lineup.map(a => `${a.name}: ${a.monthlyListeners}`));
  localStorage.setItem(LINEUP_KEY, JSON.stringify(lineup));
}

export function getLineup()   { const raw = localStorage.getItem(LINEUP_KEY); return raw ? JSON.parse(raw) : null; }
export function clearLineup() { localStorage.removeItem(LINEUP_KEY); }

// ── Snapshots ─────────────────────────────────────────────────────────────────

export function saveSnapshot(weekNumber, artists) {
  const snapshots = getSnapshots().filter(s => s.week !== weekNumber);
  snapshots.push({
    week: weekNumber,
    savedAt: new Date().toISOString(),
    artists: artists.map(({ id, name, monthlyListeners }) => ({ id, name, monthlyListeners })),
  });
  localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(snapshots));
}

export function getSnapshots()   { const raw = localStorage.getItem(SNAPSHOTS_KEY); return raw ? JSON.parse(raw) : []; }
export function clearSnapshots() { localStorage.removeItem(SNAPSHOTS_KEY); }

// ── Clear all ─────────────────────────────────────────────────────────────────

export function clearAll() {
  localStorage.removeItem(LINEUP_KEY);
  localStorage.removeItem(LEAGUE_KEY);
  localStorage.removeItem(SNAPSHOTS_KEY);
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(INTENT_KEY);
  localStorage.removeItem(TOP_ARTISTS_KEY);
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
  return getSnapshots().some(s => s.week === week);
}

// ── Image enrichment ──────────────────────────────────────────────────────────

// Enrich a lineup with imageUrl from the cached top artists pool.
export function withImages(lineup) {
  if (!lineup) return lineup;
  const cached = localStorage.getItem(TOP_ARTISTS_KEY);
  if (!cached) return lineup;
  const imageById = Object.fromEntries(JSON.parse(cached).map(a => [a.id, a.imageUrl ?? null]));
  return lineup.map(a => ({ ...a, imageUrl: a.imageUrl ?? imageById[a.id] ?? null }));
}
