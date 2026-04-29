// data.js — Music data layer (Spotify API + mock fallback)

import { isLoggedIn, getAccessToken } from './session.js';
import { MOCK_ARTISTS } from './fixtures.js';

const TOP_ARTISTS_KEY = 'md_top_artists';

// Fetch the user's top 30 short-term artists from Spotify.
// Falls back to MOCK_ARTISTS if Spotify is not connected or the fetch fails.
// Results are cached in localStorage so the draft screen re-uses the same pool.
export async function getTopArtists() {
  if (!isLoggedIn()) return [...MOCK_ARTISTS];

  const cached = localStorage.getItem(TOP_ARTISTS_KEY);
  if (cached) return JSON.parse(cached);

  try {
    let token = await getAccessToken();
    let res = await fetch('https://api.spotify.com/v1/me/top/artists?limit=30&time_range=short_term', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      token = await getAccessToken({ forceRefresh: true });
      res = await fetch('https://api.spotify.com/v1/me/top/artists?limit=30&time_range=short_term', {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    if (!res.ok) throw new Error(`Spotify API ${res.status}`);

    const { items } = await res.json();
    const artists = items.map(a => ({
      id: a.id,
      name: a.name,
      // Spotify deprecated followers, genres, and popularity from this endpoint.
      // Real listener counts are entered manually at baseline entry.
      monthlyListeners: null,
      imageUrl: a.images?.at(-1)?.url ?? null,
      spotifyUrl: a.external_urls?.spotify ?? null,
    }));

    localStorage.setItem(TOP_ARTISTS_KEY, JSON.stringify(artists));
    return artists;
  } catch (err) {
    console.warn('Failed to fetch Spotify top artists, falling back to mock:', err);
    return [...MOCK_ARTISTS];
  }
}

export function clearTopArtistsCache() {
  localStorage.removeItem(TOP_ARTISTS_KEY);
}

export function getArtistsByIds(ids) {
  const cached = localStorage.getItem(TOP_ARTISTS_KEY);
  const pool = cached ? JSON.parse(cached) : MOCK_ARTISTS;
  const byId = Object.fromEntries(pool.map(a => [a.id, a]));
  return Promise.resolve(ids.map(id => byId[id] ?? null).filter(Boolean));
}
