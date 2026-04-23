// apify.js — Live Spotify monthly listener counts via Apify Actor

const ACTOR_ID = 'augeas~spotify-monthly-listeners';
const TOKEN = import.meta.env.VITE_APIFY_TOKEN;
const BASE = 'https://api.apify.com/v2';

export function hasApifyToken() {
  return !!TOKEN;
}

// Takes an array of artists with {id} and returns a map of
// Spotify artist ID → monthlyListeners fetched from the Apify actor.
export async function fetchListenerCounts(artists) {
  if (!TOKEN) throw new Error('No Apify token configured');

  const startUrls = artists.map(a => ({
    url: `https://open.spotify.com/artist/${a.id}`,
  }));

  const runRes = await fetch(`${BASE}/acts/${ACTOR_ID}/runs?token=${TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ startUrls }),
  });

  if (!runRes.ok) {
    const text = await runRes.text();
    throw new Error(`Apify run failed (${runRes.status}): ${text}`);
  }

  const { data: run } = await runRes.json();
  await waitForRun(run.id);

  const dsRes = await fetch(`${BASE}/datasets/${run.defaultDatasetId}/items?token=${TOKEN}`);
  if (!dsRes.ok) throw new Error('Failed to fetch Apify results');

  const items = await dsRes.json();
  return Object.fromEntries(
    items
      .filter(item => item.artist_id && item.monthlyListeners != null)
      .map(item => [item.artist_id, item.monthlyListeners])
  );
}

async function waitForRun(runId) {
  const TERMINAL = new Set(['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT']);
  for (;;) {
    await new Promise(r => setTimeout(r, 5000));
    const res = await fetch(`${BASE}/actor-runs/${runId}?token=${TOKEN}`);
    const { data } = await res.json();
    if (data.status === 'SUCCEEDED') return;
    if (TERMINAL.has(data.status)) throw new Error(`Apify run ${data.status}`);
  }
}
