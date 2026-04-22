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

function calcPoints(change, baseline) {
  if (!baseline || change == null) return 0;
  if (change > 0) return Math.max(0.1, parseFloat(((change / baseline) * 100).toFixed(1)));
  if (change === 0) return 1;
  return 0;
}

/**
 * Score a single week: compare currentSnap against previousSnap.
 * @param {{ week: number, artists: Array }} currentSnap
 * @param {{ week: number, artists: Array }} previousSnap
 * @returns {{ results: Array, totalPoints: number, week: number }}
 */
export function scoreWeek(currentSnap, previousSnap) {
  const prevById = Object.fromEntries(previousSnap.artists.map(a => [a.id, a]));
  let totalPoints = 0;
  const results = currentSnap.artists.map(curr => {
    const prev = prevById[curr.id];
    const listenersThen = prev?.monthlyListeners ?? null;
    const listenersNow = curr.monthlyListeners;
    const change = listenersThen != null ? listenersNow - listenersThen : null;
    const points = calcPoints(change, listenersThen);
    totalPoints += points;
    return { id: curr.id, name: curr.name, listenersThen, listenersNow, change, points };
  });
  return { results, totalPoints: parseFloat(totalPoints.toFixed(1)), week: currentSnap.week };
}

/**
 * Accumulate points across all available week pairs.
 * @param {Array} snapshots
 * @returns {{ results: Array, totalPoints: number }}
 */
export function scoreSeason(snapshots) {
  const sorted = [...snapshots].sort((a, b) => a.week - b.week);
  if (sorted.length < 2) return { results: [], totalPoints: 0 };

  const artistTotals = {};
  for (let i = 1; i < sorted.length; i++) {
    const { results } = scoreWeek(sorted[i], sorted[i - 1]);
    for (const r of results) {
      if (!artistTotals[r.id]) artistTotals[r.id] = { id: r.id, name: r.name, points: 0 };
      artistTotals[r.id].points += r.points;
    }
  }

  // Use the latest week pair for the per-artist listener delta display
  const latestById = Object.fromEntries(
    scoreWeek(sorted[sorted.length - 1], sorted[sorted.length - 2]).results.map(r => [r.id, r])
  );

  const results = Object.values(artistTotals).map(t => {
    const latest = latestById[t.id] ?? {};
    return {
      id: t.id,
      name: t.name,
      points: parseFloat(t.points.toFixed(1)),
      listenersThen: latest.listenersThen ?? null,
      listenersNow: latest.listenersNow ?? null,
      change: latest.change ?? null,
    };
  });

  const totalPoints = parseFloat(results.reduce((s, r) => s + r.points, 0).toFixed(1));
  return { results, totalPoints };
}
