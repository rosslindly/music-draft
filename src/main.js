// main.js — Entry point
import { login, handleCallback, logout } from './session.js';
import { getTopArtists, MOCK_MEMBERS, clearTopArtistsCache } from './data.js';
import { hasApifyToken, fetchListenerCounts } from './apify.js';
import { saveLineup, getLineup, clearLineup, scoreSeason, saveLeague, getLeague, clearLeague, saveSnapshot, getSnapshots, clearSnapshots, getCurrentWeekNumber } from './scoring.js';
import { renderWelcome, renderEnterInviteCode, renderOnboarding, renderCreateLeague, renderLeague, renderSpotifyConnect, renderDraft, renderBaselineEntry, renderWeeklyUpdate, renderScore, renderLeagueSettings, renderSettings, renderLoading } from './ui.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

// Enrich a lineup array with imageUrl from the cached top artists, so screens
// that load from localStorage still get images even if the lineup was saved
// before imageUrl was persisted.
function withImages(lineup) {
  if (!lineup) return lineup;
  const cached = localStorage.getItem('md_top_artists');
  if (!cached) return lineup;
  const imageById = Object.fromEntries(JSON.parse(cached).map(a => [a.id, a.imageUrl ?? null]));
  return lineup.map(a => ({ ...a, imageUrl: a.imageUrl ?? imageById[a.id] ?? null }));
}

// ── Persisted session state ───────────────────────────────────────────────────

const PROFILE_KEY = 'md_profile';
const INTENT_KEY  = 'md_intent';

function saveProfile(profile) { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); }
function loadProfile()        { const r = localStorage.getItem(PROFILE_KEY); return r ? JSON.parse(r) : null; }
function saveIntent(intent)   { localStorage.setItem(INTENT_KEY, intent); }
function loadIntent()         { return localStorage.getItem(INTENT_KEY); }
function clearSession()       { localStorage.removeItem(PROFILE_KEY); localStorage.removeItem(INTENT_KEY); }

function clearAll() {
  clearLineup();
  clearLeague();
  clearSnapshots();
  clearSession();
  clearTopArtistsCache();
}

// ── Handle generator ──────────────────────────────────────────────────────────

function generateHandle() {
  const adj  = ['Groovy','Smooth','Wild','Indie','Electric','Cosmic','Neon','Velvet','Echo','Sonic','Mellow','Dusty','Lunar','Fuzzy','Slick'];
  const noun = ['Beat','Wave','Tune','Vibe','Groove','Rhythm','Bass','Track','Chord','Drift','Pulse','Tempo','Haze','Bloom','Storm'];
  const a = adj[Math.floor(Math.random() * adj.length)];
  const n = noun[Math.floor(Math.random() * noun.length)];
  const num = Math.floor(Math.random() * 90) + 10;
  return `${a}${n}${num}`;
}

// ── Runtime state ─────────────────────────────────────────────────────────────

const MOCK_JOIN_LEAGUE = {
  name: 'Indie Tastemakers',
  admin: 'Jordan K.',
  daysUntilStart: 3,
  teamCount: 7,
  maxTeams: 10,
  durationWeeks: 8,
};

// ── Routes ────────────────────────────────────────────────────────────────────

const ROUTES = {
  WELCOME:           '#welcome',
  ENTER_INVITE_CODE: '#enter-invite-code',
  ONBOARDING:        '#onboarding-profile',
  CREATE_LEAGUE:     '#create-league',
  SELECT_LEAGUE:     '#select-league',
  SPOTIFY_CONNECT:   '#spotify-connect',
  DRAFT:             '#draft-lineup',
  BASELINE:          '#set-week-1-baseline',
  WEEKLY_UPDATE:     '#weekly-update',
  LEAGUE:            '#league/1',
  LEAGUE_SETTINGS:   '#league-settings',
  SETTINGS:          '#settings',
};

// ── Navigation helpers ────────────────────────────────────────────────────────

let isInitialLoad = true;

function navigate(hash, state = {}) {
  const fullState = { route: hash, ...state };
  if (isInitialLoad) {
    history.replaceState(fullState, '', hash);
    isInitialLoad = false;
  } else {
    history.pushState(fullState, '', hash);
  }
  renderRoute(hash, state);
}

window.addEventListener('popstate', (e) => {
  const route = e.state?.route;
  if (route) {
    renderRoute(route, e.state);
  } else {
    autoNavigate();
  }
});

// ── Route renderer ────────────────────────────────────────────────────────────

async function renderRoute(route, state = {}) {
  switch (route) {
    case ROUTES.WELCOME:           return showWelcome();
    case ROUTES.ENTER_INVITE_CODE: return showEnterInviteCode();
    case ROUTES.ONBOARDING:        return showOnboarding();
    case ROUTES.CREATE_LEAGUE:     return showCreateLeague();
    case ROUTES.SELECT_LEAGUE:   return showSelectLeague();
    case ROUTES.SPOTIFY_CONNECT: return showSpotifyConnect(state);
    case ROUTES.DRAFT:           return showDraft(state.preSelected ?? []);
    case ROUTES.BASELINE:      return showBaselineEntry(withImages(getLineup()));
    case ROUTES.WEEKLY_UPDATE: return showWeeklyUpdate(withImages(getLineup()), state.weekNumber);
    case ROUTES.LEAGUE:          return showScore(withImages(getLineup()));
    case ROUTES.LEAGUE_SETTINGS: return showLeagueSettings();
    case ROUTES.SETTINGS:        return showSettings();
    default:                   return autoNavigate();
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Returns true if the user hasn't yet been prompted to connect Spotify.
// Once they connect or explicitly skip, spotifyConnected is set (true/false).
function shouldPromptSpotify() {
  return loadProfile()?.spotifyConnected === undefined;
}

// ── Auto-derive correct route from app state ──────────────────────────────────

async function autoNavigate() {
  const profile = loadProfile();

  if (!profile) {
    navigate(ROUTES.WELCOME);
    return;
  }

  const league = getLeague();
  if (!league) {
    const intent = loadIntent();
    navigate(intent === 'create' ? ROUTES.CREATE_LEAGUE : ROUTES.ENTER_INVITE_CODE);
    return;
  }

  const role = getLeague()?.role;
  const lineup = getLineup();
  if (!lineup) {
    if (role === 'member') {
      navigate(shouldPromptSpotify() ? ROUTES.SPOTIFY_CONNECT : ROUTES.LEAGUE);
    } else {
      navigate(shouldPromptSpotify() ? ROUTES.SPOTIFY_CONNECT : ROUTES.DRAFT);
    }
    return;
  }

  navigate(ROUTES.LEAGUE);
}

// ── Screen functions ──────────────────────────────────────────────────────────

function showWelcome() {
  renderWelcome(
    () => { saveIntent('join'); navigate(ROUTES.ENTER_INVITE_CODE); },
    () => {
      saveIntent('create');
      const profile = loadProfile();
      if (!profile) { navigate(ROUTES.ONBOARDING); return; }
      const league = getLeague();
      navigate(league ? ROUTES.LEAGUE : ROUTES.CREATE_LEAGUE);
    },
  );
}

function showEnterInviteCode() {
  renderEnterInviteCode(
    (_code) => {
      // Mock: any valid-format code resolves to the mock league
      navigate(ROUTES.SELECT_LEAGUE);
    },
    () => { navigate(ROUTES.WELCOME); },
  );
}

function showOnboarding() {
  const intent = loadIntent();
  const anonymous = intent === 'join';
  const defaultHandle = anonymous ? generateHandle() : '';

  renderOnboarding(
    (profile) => {
      saveProfile(profile);
      if (intent === 'create') {
        navigate(ROUTES.CREATE_LEAGUE);
      } else if (getLeague()) {
        navigate(shouldPromptSpotify() ? ROUTES.SPOTIFY_CONNECT : ROUTES.LEAGUE);
      } else {
        navigate(ROUTES.ENTER_INVITE_CODE);
      }
    },
    () => { navigate(ROUTES.WELCOME); },
    { anonymous, defaultHandle },
  );
}

function showCreateLeague() {
  const profile = loadProfile();
  renderCreateLeague(
    (newLeague) => {
      saveLeague({
        ...newLeague,
        role: 'commissioner',
        admin: profile?.handle ?? '@you',
        teamCount: 1,
        maxTeams: newLeague.maxParticipants ?? 10,
      });
      navigate(ROUTES.LEAGUE);
    },
    () => { navigate(ROUTES.ONBOARDING); },
  );
}

function showSelectLeague() {
  renderLeague(
    MOCK_JOIN_LEAGUE,
    () => {
      saveLeague({
        name: MOCK_JOIN_LEAGUE.name,
        role: 'member',
        inviteCode: 'INDIE1',
        createdAt: new Date().toISOString(),
        startDate: null,
        admin: MOCK_JOIN_LEAGUE.admin,
        teamCount: MOCK_JOIN_LEAGUE.teamCount,
        maxTeams: MOCK_JOIN_LEAGUE.maxTeams,
        durationWeeks: MOCK_JOIN_LEAGUE.durationWeeks,
      });
      clearLineup();
      navigate(ROUTES.ONBOARDING);
    },
    () => { navigate(ROUTES.ENTER_INVITE_CODE); },
  );
}

function showSpotifyConnect(state = {}) {
  const intent = loadIntent();
  const isJoin = intent === 'join';
  const backRoute = state.next === ROUTES.DRAFT ? ROUTES.LEAGUE : intent === 'create' ? ROUTES.LEAGUE : ROUTES.ONBOARDING;
  // Caller can pass { next: ROUTES.DRAFT } to override the default post-connect destination
  const postConnectRoute = state.next ?? (isJoin ? ROUTES.LEAGUE : ROUTES.DRAFT);
  const hideSkip = postConnectRoute === ROUTES.DRAFT;
  renderSpotifyConnect(
    async () => {
      localStorage.setItem('md_oauth_next', postConnectRoute);
      await login(); // redirects to Spotify — execution stops here
    },
    () => {
      saveProfile({ ...loadProfile(), spotifyConnected: false });
      navigate(postConnectRoute);
    },
    () => { navigate(backRoute); },
    false,
    hideSkip,
  );
}

function showSettings() {
  const profile = loadProfile();
  renderSettings(profile, {
    onBack: () => history.back(),
    onSignOut() { logout(); clearAll(); navigate(ROUTES.WELCOME); },
    onStartOver() { clearAll(); navigate(ROUTES.WELCOME); },
    onSpotifyConnect() { navigate(ROUTES.SPOTIFY_CONNECT); },
    onSaveProfile({ handle }) {
      saveProfile({ ...loadProfile(), handle });
      const league = getLeague();
      if (league) saveLeague({ ...league, admin: handle });
      showSettings();
    },
  });
}

async function showDraft(preSelected = []) {
  const intent = loadIntent();
  const backRoute = intent === 'create' ? ROUTES.CREATE_LEAGUE : ROUTES.SELECT_LEAGUE;
  renderLoading('Loading artists…');
  let topArtists = await getTopArtists();

  if (hasApifyToken() && topArtists.some(a => a.monthlyListeners == null)) {
    renderLoading('Fetching live listener counts…');
    try {
      const counts = await fetchListenerCounts(topArtists);
      if (window.location.hash !== ROUTES.DRAFT) return;
      topArtists = topArtists.map(a => ({
        ...a,
        monthlyListeners: counts[a.id] ?? a.monthlyListeners,
      }));
      localStorage.setItem('md_top_artists', JSON.stringify(topArtists));
    } catch (err) {
      console.warn('Apify enrichment failed, proceeding without listener counts:', err);
    }
  }

  const profile = loadProfile();
  renderDraft(
    topArtists,
    (selected) => {
      saveLineup(selected);
      const league = getLeague();
      if (league && !league.startDate) {
        saveLeague({ ...league, startDate: new Date().toISOString() });
      }
      navigate(ROUTES.LEAGUE);
    },
    () => { navigate(backRoute); },
    preSelected,
    profile,
    () => { navigate(ROUTES.SETTINGS); },
  );
}

function showBaselineEntry(lineup) {
  const week1 = getSnapshots().find(s => s.week === 1);
  const saved = week1 ? Object.fromEntries(week1.artists.map(a => [a.id, a.monthlyListeners])) : {};
  const existing = Object.fromEntries(
    lineup.map(a => [a.id, saved[a.id] ?? a.monthlyListeners ?? undefined])
  );
  renderBaselineEntry(lineup, existing, (entries) => {
    saveSnapshot(1, entries);
    navigate(ROUTES.LEAGUE);
  });
}

// overrideWeek lets the manual-update path bypass the date-derived week number
async function showWeeklyUpdate(lineup, overrideWeek) {
  const league = getLeague();
  const weekNumber = overrideWeek ?? getCurrentWeekNumber(league?.startDate);

  let prefilled = {};
  if (hasApifyToken()) {
    renderLoading('Fetching live listener counts…');
    try {
      prefilled = await fetchListenerCounts(lineup);
    } catch (err) {
      console.warn('Apify fetch failed, proceeding without prefill:', err);
    }
    if (window.location.hash !== ROUTES.WEEKLY_UPDATE) return;
  }

  renderWeeklyUpdate(lineup, weekNumber, prefilled, (entries) => {
    saveSnapshot(weekNumber, entries);
    navigate(ROUTES.LEAGUE);
  });
}

async function showScore(lineup) {
  const profile = loadProfile();
  const league = getLeague();
  const leagueStarted = getSnapshots().some(s => s.week > 1);
  const snapshots = getSnapshots();

  const scheduledStart = league?.scheduledStartDate ? new Date(league.scheduledStartDate) : null;
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const daysUntilStart = scheduledStart
    ? Math.max(0, Math.ceil((scheduledStart - todayMidnight) / (1000 * 60 * 60 * 24)))
    : 0;

  const currentWeek = getCurrentWeekNumber(league?.scheduledStartDate ?? league?.startDate) ?? 1;

  const role = league?.role ?? 'commissioner';

  const displayLeague = {
    name: league?.name ?? 'My League',
    admin: league?.admin ?? profile?.handle ?? '@you',
    daysUntilStart,
    currentWeek,
    durationWeeks: league?.durationWeeks ?? null,
    teamCount: league?.teamCount ?? 1,
    maxTeams: league?.maxTeams ?? 10,
    inviteCode: league?.inviteCode ?? null,
  };

  if (!lineup) {
    renderScore({
      results: [],
      totalPoints: 0,
      standings: [{ handle: profile?.handle ?? '@you', picks: [], totalPoints: 0, isYou: true }],
      league: displayLeague,
      role,
      leagueStarted: false,
      profile,
      onProfile() { navigate(ROUTES.SETTINGS); },
      onLeagueSettings: role === 'commissioner' ? () => navigate(ROUTES.LEAGUE_SETTINGS) : null,
      onNewDraft() { clearAll(); navigate(ROUTES.WELCOME); },
      onLogout()   { logout(); clearAll(); navigate(ROUTES.WELCOME); },
      onEditLineup() {},
      onDraft() {
        const spotifyReady = loadProfile()?.spotifyConnected === true;
        navigate(spotifyReady ? ROUTES.DRAFT : ROUTES.SPOTIFY_CONNECT, { next: ROUTES.DRAFT });
      },
    });
    return;
  }

  let results, totalPoints, memberStandings;
  const isSolo = league?.teamCount === 1;

  if (leagueStarted) {
    const { results: seasonResults } = scoreSeason(snapshots);
    const seasonById = Object.fromEntries(seasonResults.map(r => [r.id, r]));
    results = lineup.map(a => {
      const s = seasonById[a.id];
      return s ? { ...s, imageUrl: a.imageUrl ?? null } : { id: a.id, name: a.name, points: 0, listenersThen: null, listenersNow: null, change: null, imageUrl: a.imageUrl ?? null };
    });
    totalPoints = parseFloat(results.reduce((s, r) => s + r.points, 0).toFixed(2));
    memberStandings = isSolo ? [] : MOCK_MEMBERS.map(m => ({ handle: m.handle, picks: m.lineup, totalPoints: 0 }));
  } else {
    const week1 = snapshots.find(s => s.week === 1);
    const week1ById = week1 ? Object.fromEntries(week1.artists.map(a => [a.id, a.monthlyListeners])) : {};
    results = lineup.map(a => {
      const baseline = week1ById[a.id] ?? a.monthlyListeners;
      return { id: a.id, name: a.name, points: 0, change: null, listenersThen: baseline, listenersNow: baseline, imageUrl: a.imageUrl ?? null };
    });
    totalPoints = 0;
    memberStandings = isSolo ? [] : MOCK_MEMBERS.map(m => ({ handle: m.handle, picks: m.lineup, totalPoints: 0 }));
  }

  const standings = [
    { handle: profile?.handle ?? '@you', picks: results, totalPoints, isYou: true },
    ...memberStandings,
  ];
  if (leagueStarted) standings.sort((a, b) => b.totalPoints - a.totalPoints);

  renderScore({
    results,
    totalPoints,
    standings,
    league: displayLeague,
    role,
    leagueStarted,
    snapshots,
    profile,
    onProfile() { navigate(ROUTES.SETTINGS); },
    onLeagueSettings: role === 'commissioner' ? () => navigate(ROUTES.LEAGUE_SETTINGS) : null,
    onNewDraft()   { clearAll(); navigate(ROUTES.WELCOME); },
    onLogout()     { logout(); clearAll(); navigate(ROUTES.WELCOME); },
    onEditLineup() { navigate(ROUTES.DRAFT, { preSelected: lineup }); },
  });
}

function showLeagueSettings() {
  const league = getLeague();
  const lineup = withImages(getLineup());
  const snapshots = getSnapshots();
  const hasBaseline = snapshots.some(s => s.week === 1);
  const maxSnapshotWeek = hasBaseline ? Math.max(...snapshots.map(s => s.week)) : null;
  const nextWeekNumber = maxSnapshotWeek != null ? maxSnapshotWeek + 1 : null;
  const canEnterWeekly = hasBaseline && lineup && nextWeekNumber != null && !snapshots.some(s => s.week === nextWeekNumber);

  renderLeagueSettings(league, {
    onBack: () => history.back(),
    onSave({ name, scheduledStartDate }) {
      saveLeague({ ...league, name, scheduledStartDate });
      history.back();
    },
    hasBaseline,
    onEnterBaseline: !hasBaseline && lineup ? () => navigate(ROUTES.BASELINE) : null,
    nextWeekNumber: canEnterWeekly ? nextWeekNumber : null,
    onEnterWeekly: canEnterWeekly ? () => navigate(ROUTES.WEEKLY_UPDATE, { weekNumber: nextWeekNumber }) : null,
  });
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────

const urlParams = new URLSearchParams(window.location.search);
const oauthCode = urlParams.get('code');
const oauthError = urlParams.get('error');

if (oauthCode) {
  // Returning from Spotify OAuth — exchange code for tokens
  renderLoading('Connecting to Spotify…');
  handleCallback(oauthCode)
    .then(() => {
      saveProfile({ ...loadProfile(), spotifyConnected: true });
      history.replaceState({}, '', '/');
      isInitialLoad = false;
      const postOAuthRoute = localStorage.getItem('md_oauth_next') ?? (getLeague()?.role === 'member' ? ROUTES.LEAGUE : ROUTES.DRAFT);
      localStorage.removeItem('md_oauth_next');
      renderSpotifyConnect(
        () => navigate(postOAuthRoute),
        () => navigate(postOAuthRoute),
        () => navigate(postOAuthRoute),
        true,
      );
    })
    .catch((err) => {
      console.error('Spotify OAuth callback failed:', err);
      history.replaceState({}, '', '/');
      autoNavigate();
    });
} else if (oauthError) {
  // User denied Spotify access on the Spotify auth page
  saveProfile({ ...loadProfile(), spotifyConnected: false });
  history.replaceState({}, '', '/');
  autoNavigate();
} else {
  // Normal page load — deep-link or auto-navigate
  const initialHash = location.hash;
  if (initialHash && Object.values(ROUTES).includes(initialHash)) {
    history.replaceState({ route: initialHash }, '', initialHash);
    isInitialLoad = false;
    renderRoute(initialHash, {});
  } else {
    autoNavigate();
  }
}
