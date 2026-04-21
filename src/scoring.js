// scoring.js — Fantasy draft scoring logic

const LINEUP_KEY = 'fantasy_lineup';
const LEAGUE_KEY = 'md_league';
const SNAPSHOTS_KEY = 'md_snapshots';

export function saveLeague(league) {
  localStorage.setItem(LEAGUE_KEY, JSON.stringify(league));
}

export function getLeague() {
  const raw = localStorage.getItem(LEAGUE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearLeague() {
  localStorage.removeItem(LEAGUE_KEY);
}

export function saveLineup(artists) {
  const savedAt = new Date().toISOString();
  const lineup = artists.map(({ id, name, monthlyListeners }) => ({
    id,
    name,
    monthlyListeners: typeof monthlyListeners === 'number' && !isNaN(monthlyListeners) ? monthlyListeners : null,
    savedAt,
  }));
  console.log('[scoring] saving lineup:', lineup.map(a => `${a.name}: ${a.monthlyListeners}`));
  localStorage.setItem(LINEUP_KEY, JSON.stringify(lineup));
}

export function getLineup() {
  const raw = localStorage.getItem(LINEUP_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearLineup() {
  localStorage.removeItem(LINEUP_KEY);
}

export function saveSnapshot(weekNumber, artists) {
  const snapshots = getSnapshots().filter(s => s.week !== weekNumber);
  snapshots.push({
    week: weekNumber,
    savedAt: new Date().toISOString(),
    artists: artists.map(({ id, name, monthlyListeners }) => ({ id, name, monthlyListeners })),
  });
  localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(snapshots));
}

export function getSnapshots() {
  const raw = localStorage.getItem(SNAPSHOTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function clearSnapshots() {
  localStorage.removeItem(SNAPSHOTS_KEY);
}

/**
 * @param {Array} savedArtists - [{id, name, monthlyListeners, savedAt}]
 * @param {Array} liveArtists  - artist objects with current monthlyListeners
 * @returns {{ results: Array, totalPoints: number }}
 */
export function scoreLineup(savedArtists, liveArtists) {
  const liveById = {};
  for (const a of liveArtists) liveById[a.id] = a;

  let totalPoints = 0;
  const results = savedArtists.map(saved => {
    const live = liveById[saved.id];
    const listenersNow = live?.monthlyListeners ?? saved.monthlyListeners;
    const change = listenersNow - saved.monthlyListeners;
    const points = change > 0 ? 3 : change === 0 ? 1 : 0;
    totalPoints += points;
    return {
      id: saved.id,
      name: saved.name,
      listenersThen: saved.monthlyListeners,
      listenersNow,
      change,
      points,
      savedAt: saved.savedAt,
    };
  });

  return { results, totalPoints };
}
