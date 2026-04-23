// data.js — Music data layer (Spotify API + mock fallback)

import { isLoggedIn, getAccessToken } from './session.js';

const TOP_ARTISTS_KEY = 'md_top_artists';

// Fallback mock roster used when Spotify is not connected
const MOCK_ARTISTS = [
  { id: 'a01', name: 'Taylor Swift',       genres: ['pop', 'country pop'],          monthlyListeners: 100_200_000 },
  { id: 'a02', name: 'Kendrick Lamar',     genres: ['hip-hop', 'rap'],              monthlyListeners:  65_400_000 },
  { id: 'a03', name: 'Sabrina Carpenter',  genres: ['pop'],                          monthlyListeners:  55_800_000 },
  { id: 'a04', name: 'Billie Eilish',      genres: ['alt pop', 'indie pop'],        monthlyListeners:  70_100_000 },
  { id: 'a05', name: 'Chappell Roan',      genres: ['indie pop', 'synth pop'],      monthlyListeners:  35_600_000 },
  { id: 'a06', name: 'SZA',               genres: ['r&b', 'soul'],                  monthlyListeners:  45_200_000 },
  { id: 'a07', name: 'Tyler, the Creator', genres: ['hip-hop', 'neo soul'],         monthlyListeners:  38_500_000 },
  { id: 'a08', name: 'Bad Bunny',          genres: ['reggaeton', 'latin trap'],     monthlyListeners:  80_300_000 },
  { id: 'a09', name: 'Olivia Rodrigo',     genres: ['pop', 'pop rock'],             monthlyListeners:  54_700_000 },
  { id: 'a10', name: 'Doechii',            genres: ['hip-hop', 'rap'],              monthlyListeners:   8_100_000 },
  { id: 'a11', name: 'Lana Del Rey',       genres: ['dream pop', 'indie pop'],      monthlyListeners:  42_300_000 },
  { id: 'a12', name: 'Charli XCX',         genres: ['pop', 'hyperpop'],             monthlyListeners:  25_600_000 },
  { id: 'a13', name: 'Hozier',             genres: ['indie folk', 'soul'],          monthlyListeners:  28_400_000 },
  { id: 'a14', name: 'Frank Ocean',        genres: ['r&b', 'indie r&b'],           monthlyListeners:  22_100_000 },
  { id: 'a15', name: 'Beyoncé',            genres: ['pop', 'r&b', 'country'],      monthlyListeners:  48_900_000 },
  { id: 'a16', name: 'Clairo',             genres: ['indie pop', 'bedroom pop'],   monthlyListeners:  12_400_000 },
  { id: 'a17', name: 'Vampire Weekend',    genres: ['indie rock', 'art rock'],      monthlyListeners:   9_200_000 },
  { id: 'a18', name: 'Mitski',             genres: ['indie rock', 'art rock'],      monthlyListeners:   8_300_000 },
  { id: 'a19', name: 'Faye Webster',       genres: ['indie pop', 'soft rock'],      monthlyListeners:   4_100_000 },
  { id: 'a20', name: 'Rex Orange County',  genres: ['indie pop', 'soft pop'],      monthlyListeners:   7_200_000 },
  { id: 'a21', name: 'Mk.gee',             genres: ['indie rock', 'art pop'],      monthlyListeners:   3_400_000 },
  { id: 'a22', name: 'Magdalena Bay',      genres: ['synth pop', 'indie pop'],     monthlyListeners:   3_100_000 },
  { id: 'a23', name: 'Ethel Cain',         genres: ['southern gothic', 'art pop'], monthlyListeners:   2_500_000 },
  { id: 'a24', name: 'Angel Olsen',        genres: ['indie rock', 'folk'],         monthlyListeners:   2_000_000 },
  { id: 'a25', name: 'Steve Lacy',         genres: ['neo soul', 'indie r&b'],     monthlyListeners:  15_300_000 },
  { id: 'a26', name: 'Yaeji',              genres: ['hyperpop', 'electronic'],     monthlyListeners:   1_200_000 },
  { id: 'a27', name: 'Amaarae',            genres: ['afropop', 'r&b'],             monthlyListeners:   1_500_000 },
  { id: 'a28', name: 'Wednesday',          genres: ['alt country', 'noise rock'],  monthlyListeners:     800_000 },
  { id: 'a29', name: 'Mdou Moctar',        genres: ['tuareg rock', 'desert blues'],monthlyListeners:     500_000 },
  { id: 'a30', name: 'Arca',               genres: ['experimental', 'electronic'], monthlyListeners:     600_000 },
];

export const MOCK_MEMBERS = [
  {
    name: 'Jordan K.',
    handle: '@jordanbeats',
    lineup: [
      { id: 'a01', name: 'Taylor Swift',      monthlyListeners: 100_200_000 },
      { id: 'a05', name: 'Chappell Roan',     monthlyListeners:  35_600_000 },
      { id: 'a09', name: 'Olivia Rodrigo',    monthlyListeners:  54_700_000 },
      { id: 'a15', name: 'Beyoncé',           monthlyListeners:  48_900_000 },
      { id: 'a22', name: 'Magdalena Bay',     monthlyListeners:   3_100_000 },
    ],
  },
  {
    name: 'Alex R.',
    handle: '@alexr',
    lineup: [
      { id: 'a02', name: 'Kendrick Lamar',    monthlyListeners:  65_400_000 },
      { id: 'a07', name: 'Tyler, the Creator',monthlyListeners:  38_500_000 },
      { id: 'a12', name: 'Charli XCX',        monthlyListeners:  25_600_000 },
      { id: 'a18', name: 'Mitski',            monthlyListeners:   8_300_000 },
    ],
  },
  {
    name: 'Sam T.',
    handle: '@samt',
    lineup: [
      { id: 'a03', name: 'Sabrina Carpenter', monthlyListeners:  55_800_000 },
      { id: 'a06', name: 'SZA',              monthlyListeners:  45_200_000 },
      { id: 'a11', name: 'Lana Del Rey',      monthlyListeners:  42_300_000 },
      { id: 'a20', name: 'Rex Orange County', monthlyListeners:   7_200_000 },
      { id: 'a26', name: 'Yaeji',             monthlyListeners:   1_200_000 },
    ],
  },
  {
    name: 'Priya M.',
    handle: '@priyam',
    lineup: [
      { id: 'a04', name: 'Billie Eilish',     monthlyListeners:  70_100_000 },
      { id: 'a10', name: 'Doechii',           monthlyListeners:   8_100_000 },
      { id: 'a16', name: 'Clairo',            monthlyListeners:  12_400_000 },
      { id: 'a23', name: 'Ethel Cain',        monthlyListeners:   2_500_000 },
      { id: 'a28', name: 'Wednesday',         monthlyListeners:     800_000 },
    ],
  },
  {
    name: 'Casey L.',
    handle: '@caseyl',
    lineup: [
      { id: 'a08', name: 'Bad Bunny',         monthlyListeners:  80_300_000 },
      { id: 'a13', name: 'Hozier',            monthlyListeners:  28_400_000 },
      { id: 'a17', name: 'Vampire Weekend',   monthlyListeners:   9_200_000 },
      { id: 'a21', name: 'Mk.gee',            monthlyListeners:   3_400_000 },
      { id: 'a25', name: 'Steve Lacy',        monthlyListeners:  15_300_000 },
    ],
  },
  {
    name: 'Dev O.',
    handle: '@devo',
    lineup: [
      { id: 'a02', name: 'Kendrick Lamar',    monthlyListeners:  65_400_000 },
      { id: 'a05', name: 'Chappell Roan',     monthlyListeners:  35_600_000 },
      { id: 'a14', name: 'Frank Ocean',       monthlyListeners:  22_100_000 },
      { id: 'a24', name: 'Angel Olsen',       monthlyListeners:   2_000_000 },
      { id: 'a29', name: 'Mdou Moctar',       monthlyListeners:     500_000 },
    ],
  },
];

// Fetch the user's top 30 short-term artists from Spotify.
// Falls back to MOCK_ARTISTS if Spotify is not connected or the fetch fails.
// Results are cached in localStorage so Edit Lineup re-uses the same pool.
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
