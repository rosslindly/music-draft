// scoring.js — Fantasy draft scoring logic

const LINEUP_KEY = 'fantasy_lineup';

export function saveLineup(artists) {
  const savedAt = new Date().toISOString();
  const lineup = artists.map(({ id, name, popularity }) => ({
    id,
    name,
    // Coerce NaN/undefined/non-number to null so JSON round-trips cleanly
    popularity: typeof popularity === 'number' && !isNaN(popularity) ? popularity : null,
    savedAt,
  }));
  console.log('[scoring] saving lineup:', lineup.map(a => `${a.name}: ${a.popularity}`));
  localStorage.setItem(LINEUP_KEY, JSON.stringify(lineup));
}

export function getLineup() {
  const raw = localStorage.getItem(LINEUP_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearLineup() {
  localStorage.removeItem(LINEUP_KEY);
}

/**
 * @param {Array} savedArtists - [{id, name, popularity, savedAt}]
 * @param {Array} liveArtists  - Spotify artist objects from /artists?ids=...
 * @returns {{ results: Array, totalPoints: number }}
 */
export function scoreLineup(savedArtists, liveArtists) {
  const liveById = {};
  for (const a of liveArtists) liveById[a.id] = a;

  let totalPoints = 0;
  const results = savedArtists.map(saved => {
    const live = liveById[saved.id];
    const popularityNow = live?.popularity ?? saved.popularity;
    const change = popularityNow - saved.popularity;
    const points = change > 0 ? 3 : change === 0 ? 1 : 0;
    totalPoints += points;
    return {
      id: saved.id,
      name: saved.name,
      popularityThen: saved.popularity,
      popularityNow,
      change,
      points,
      savedAt: saved.savedAt,
    };
  });

  return { results, totalPoints };
}
