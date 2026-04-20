// data.js — Mock music data layer

const ARTISTS = [
  { id: 'a01', name: 'Taylor Swift',       genres: ['pop', 'country pop'],          popularity: 98 },
  { id: 'a02', name: 'Kendrick Lamar',     genres: ['hip-hop', 'rap'],              popularity: 94 },
  { id: 'a03', name: 'Sabrina Carpenter',  genres: ['pop'],                          popularity: 92 },
  { id: 'a04', name: 'Billie Eilish',      genres: ['alt pop', 'indie pop'],        popularity: 90 },
  { id: 'a05', name: 'Chappell Roan',      genres: ['indie pop', 'synth pop'],      popularity: 88 },
  { id: 'a06', name: 'SZA',               genres: ['r&b', 'soul'],                  popularity: 88 },
  { id: 'a07', name: 'Tyler, the Creator', genres: ['hip-hop', 'neo soul'],         popularity: 86 },
  { id: 'a08', name: 'Bad Bunny',          genres: ['reggaeton', 'latin trap'],     popularity: 85 },
  { id: 'a09', name: 'Olivia Rodrigo',     genres: ['pop', 'pop rock'],             popularity: 84 },
  { id: 'a10', name: 'Doechii',            genres: ['hip-hop', 'rap'],              popularity: 83 },
  { id: 'a11', name: 'Lana Del Rey',       genres: ['dream pop', 'indie pop'],      popularity: 82 },
  { id: 'a12', name: 'Charli XCX',         genres: ['pop', 'hyperpop'],             popularity: 82 },
  { id: 'a13', name: 'Hozier',             genres: ['indie folk', 'soul'],          popularity: 80 },
  { id: 'a14', name: 'Frank Ocean',        genres: ['r&b', 'indie r&b'],           popularity: 80 },
  { id: 'a15', name: 'Beyoncé',            genres: ['pop', 'r&b', 'country'],      popularity: 79 },
  { id: 'a16', name: 'Clairo',             genres: ['indie pop', 'bedroom pop'],   popularity: 75 },
  { id: 'a17', name: 'Vampire Weekend',    genres: ['indie rock', 'art rock'],      popularity: 74 },
  { id: 'a18', name: 'Mitski',             genres: ['indie rock', 'art rock'],      popularity: 72 },
  { id: 'a19', name: 'Faye Webster',       genres: ['indie pop', 'soft rock'],      popularity: 70 },
  { id: 'a20', name: 'Rex Orange County',  genres: ['indie pop', 'soft pop'],      popularity: 68 },
  { id: 'a21', name: 'Mk.gee',             genres: ['indie rock', 'art pop'],      popularity: 66 },
  { id: 'a22', name: 'Magdalena Bay',      genres: ['synth pop', 'indie pop'],     popularity: 62 },
  { id: 'a23', name: 'Ethel Cain',         genres: ['southern gothic', 'art pop'], popularity: 65 },
  { id: 'a24', name: 'Angel Olsen',        genres: ['indie rock', 'folk'],         popularity: 60 },
  { id: 'a25', name: 'Steve Lacy',         genres: ['neo soul', 'indie r&b'],     popularity: 68 },
  { id: 'a26', name: 'Yaeji',              genres: ['hyperpop', 'electronic'],     popularity: 55 },
  { id: 'a27', name: 'Amaarae',            genres: ['afropop', 'r&b'],             popularity: 52 },
  { id: 'a28', name: 'Wednesday',          genres: ['alt country', 'noise rock'],  popularity: 48 },
  { id: 'a29', name: 'Mdou Moctar',        genres: ['tuareg rock', 'desert blues'],popularity: 44 },
  { id: 'a30', name: 'Arca',               genres: ['experimental', 'electronic'], popularity: 42 },
];

export const MOCK_MEMBERS = [
  {
    name: 'Jordan K.',
    handle: '@jordanbeats',
    lineup: [
      { id: 'a01', name: 'Taylor Swift',      popularity: 98 },
      { id: 'a05', name: 'Chappell Roan',     popularity: 88 },
      { id: 'a09', name: 'Olivia Rodrigo',    popularity: 84 },
      { id: 'a15', name: 'Beyoncé',           popularity: 79 },
      { id: 'a22', name: 'Magdalena Bay',     popularity: 62 },
    ],
  },
  {
    name: 'Alex R.',
    handle: '@alexr',
    lineup: [
      { id: 'a02', name: 'Kendrick Lamar',    popularity: 94 },
      { id: 'a07', name: 'Tyler, the Creator',popularity: 86 },
      { id: 'a12', name: 'Charli XCX',        popularity: 82 },
      { id: 'a18', name: 'Mitski',            popularity: 72 },
    ],
  },
  {
    name: 'Sam T.',
    handle: '@samt',
    lineup: [
      { id: 'a03', name: 'Sabrina Carpenter', popularity: 92 },
      { id: 'a06', name: 'SZA',              popularity: 88 },
      { id: 'a11', name: 'Lana Del Rey',      popularity: 82 },
      { id: 'a20', name: 'Rex Orange County', popularity: 68 },
      { id: 'a26', name: 'Yaeji',             popularity: 55 },
    ],
  },
  {
    name: 'Priya M.',
    handle: '@priyam',
    lineup: [
      { id: 'a04', name: 'Billie Eilish',     popularity: 90 },
      { id: 'a10', name: 'Doechii',           popularity: 83 },
      { id: 'a16', name: 'Clairo',            popularity: 75 },
      { id: 'a23', name: 'Ethel Cain',        popularity: 65 },
      { id: 'a28', name: 'Wednesday',         popularity: 48 },
    ],
  },
  {
    name: 'Casey L.',
    handle: '@caseyl',
    lineup: [
      { id: 'a08', name: 'Bad Bunny',         popularity: 85 },
      { id: 'a13', name: 'Hozier',            popularity: 80 },
      { id: 'a17', name: 'Vampire Weekend',   popularity: 74 },
      { id: 'a21', name: 'Mk.gee',            popularity: 66 },
      { id: 'a25', name: 'Steve Lacy',        popularity: 68 },
    ],
  },
  {
    name: 'Dev O.',
    handle: '@devo',
    lineup: [
      { id: 'a02', name: 'Kendrick Lamar',    popularity: 94 },
      { id: 'a05', name: 'Chappell Roan',     popularity: 88 },
      { id: 'a14', name: 'Frank Ocean',       popularity: 80 },
      { id: 'a24', name: 'Angel Olsen',       popularity: 60 },
      { id: 'a29', name: 'Mdou Moctar',       popularity: 44 },
    ],
  },
];

// Seeded LCG — deterministic per artist per day
function seededRand(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function getDailyDelta(artistId) {
  const day = Math.floor(Date.now() / 86400000);
  const idHash = artistId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rand = seededRand(((day * 7919) + idHash) & 0x7fffffff);
  // Range: -10 to +10, centered at 0
  return Math.round(rand() * 20 - 10);
}

export function getTopArtists() {
  return new Promise(resolve => setTimeout(() => resolve([...ARTISTS]), 400));
}

export function getArtistsByIds(ids) {
  const byId = Object.fromEntries(ARTISTS.map(a => [a.id, a]));
  const results = ids
    .map(id => {
      const a = byId[id];
      if (!a) return null;
      const delta = getDailyDelta(id);
      return { ...a, popularity: Math.max(0, Math.min(100, a.popularity + delta)) };
    })
    .filter(Boolean);
  return new Promise(resolve => setTimeout(() => resolve(results), 600));
}
