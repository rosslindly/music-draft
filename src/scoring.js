// scoring.js — Fantasy draft scoring logic (pure functions only)

function calcPoints(change, baseline) {
  if (!baseline || change == null) return 0;
  if (change > 0) return Math.max(0.01, parseFloat(((change / baseline) * 10000).toFixed(2)));
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
  return { results, totalPoints: parseFloat(totalPoints.toFixed(2)), week: currentSnap.week };
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
      points: parseFloat(t.points.toFixed(2)),
      listenersThen: latest.listenersThen ?? null,
      listenersNow: latest.listenersNow ?? null,
      change: latest.change ?? null,
    };
  });

  const totalPoints = parseFloat(results.reduce((s, r) => s + r.points, 0).toFixed(2));
  return { results, totalPoints };
}
