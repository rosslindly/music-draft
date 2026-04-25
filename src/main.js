// main.js — Entry point
import { login, handleCallback, logout } from './session.js';
import { getTopArtists, MOCK_MEMBERS, clearTopArtistsCache } from './data.js';
import { hasApifyToken, fetchListenerCounts } from './apify.js';
import { saveLineup, getLineup, clearLineup, scoreSeason, saveLeague, getLeague, clearLeague, saveSnapshot, getSnapshots, clearSnapshots, getCurrentWeekNumber, hasSubmittedThisWeek } from './scoring.js';
import { renderWelcome, renderOnboarding, renderCreateLeague, renderLeague, renderSpotifyConnect, renderDraft, renderBaselineEntry, renderWeeklyUpdate, renderScore, renderSettings, renderLoading } from './ui.js';

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

// ── Runtime state ─────────────────────────────────────────────────────────────

let weeklyBannerDismissed = false;

const MOCK_JOIN_LEAGUE = {
  name: 'Indie Tastemakers',
  admin: 'Jordan K.',
  daysUntilStart: 3,
  teamCount: 7,
  maxTeams: 10,
};

// ── Routes ────────────────────────────────────────────────────────────────────

const ROUTES = {
  WELCOME:         '#welcome',
  ONBOARDING:      '#onboarding-profile',
  CREATE_LEAGUE:   '#create-league',
  SELECT_LEAGUE:   '#select-league',
  SPOTIFY_CONNECT: '#spotify-connect',
  DRAFT:           '#draft-lineup',
  BASELINE:        '#set-week-1-baseline',
  WEEKLY_UPDATE:   '#weekly-update',
  LEAGUE:          '#league/1',
  SETTINGS:        '#settings',
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
    case ROUTES.WELCOME:       return showWelcome();
    case ROUTES.ONBOARDING:    return showOnboarding();
    case ROUTES.CREATE_LEAGUE: return showCreateLeague();
    case ROUTES.SELECT_LEAGUE:   return showSelectLeague();
    case ROUTES.SPOTIFY_CONNECT: return showSpotifyConnect();
    case ROUTES.DRAFT:           return showDraft(state.preSelected ?? []);
    case ROUTES.BASELINE:      return showBaselineEntry(withImages(getLineup()));
    case ROUTES.WEEKLY_UPDATE: return showWeeklyUpdate(withImages(getLineup()), state.weekNumber);
    case ROUTES.LEAGUE:        return showScore(withImages(getLineup()));
    case ROUTES.SETTINGS:      return showSettings();
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
    navigate(intent === 'create' ? ROUTES.CREATE_LEAGUE : ROUTES.SELECT_LEAGUE);
    return;
  }

  const lineup = getLineup();
  if (!lineup) {
    navigate(shouldPromptSpotify() ? ROUTES.SPOTIFY_CONNECT : ROUTES.DRAFT);
    return;
  }

  const hasBaseline = getSnapshots().some(s => s.week === 1);
  if (!hasBaseline) {
    navigate(ROUTES.BASELINE);
    return;
  }

  navigate(ROUTES.LEAGUE);
}

// ── Screen functions ──────────────────────────────────────────────────────────

function showWelcome() {
  renderWelcome(
    () => { saveIntent('join');   navigate(ROUTES.ONBOARDING); },
    () => { saveIntent('create'); navigate(ROUTES.ONBOARDING); },
  );
}

function showOnboarding() {
  renderOnboarding(
    (profile) => {
      saveProfile(profile);
      const intent = loadIntent();
      navigate(intent === 'create' ? ROUTES.CREATE_LEAGUE : ROUTES.SELECT_LEAGUE);
    },
    () => { navigate(ROUTES.WELCOME); },
  );
}

function showCreateLeague() {
  const profile = loadProfile();
  renderCreateLeague(
    (newLeague) => {
      saveLeague({
        ...newLeague,
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
        inviteCode: 'INDIE1',
        createdAt: new Date().toISOString(),
        startDate: null,
        admin: MOCK_JOIN_LEAGUE.admin,
        teamCount: MOCK_JOIN_LEAGUE.teamCount,
        maxTeams: MOCK_JOIN_LEAGUE.maxTeams,
      });
      clearLineup();
      navigate(shouldPromptSpotify() ? ROUTES.SPOTIFY_CONNECT : ROUTES.DRAFT);
    },
    () => { navigate(ROUTES.ONBOARDING); },
  );
}

function showSpotifyConnect() {
  const intent = loadIntent();
  const backRoute = intent === 'create' ? ROUTES.LEAGUE : ROUTES.SELECT_LEAGUE;
  renderSpotifyConnect(
    async () => {
      await login(); // redirects to Spotify — execution stops here
    },
    () => {
      saveProfile({ ...loadProfile(), spotifyConnected: false });
      navigate(ROUTES.DRAFT);
    },
    () => { navigate(backRoute); },
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
      navigate(ROUTES.BASELINE);
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
  const hasBaseline = snapshots.some(s => s.week === 1);

  const weekNumber = getCurrentWeekNumber(league?.startDate);
  const updateDue = hasBaseline && weekNumber != null && weekNumber > 1 && !hasSubmittedThisWeek(league?.startDate);

  const maxSnapshotWeek = hasBaseline ? Math.max(...snapshots.map(s => s.week)) : null;
  const nextWeekNumber = maxSnapshotWeek != null ? maxSnapshotWeek + 1 : null;
  const canManuallyUpdate = hasBaseline && lineup && nextWeekNumber != null && !snapshots.some(s => s.week === nextWeekNumber);

  const weeklyUpdate = updateDue && !weeklyBannerDismissed && lineup
    ? {
        weekNumber,
        onUpdate: () => { navigate(ROUTES.WEEKLY_UPDATE, { weekNumber }); },
        onDismiss: () => { weeklyBannerDismissed = true; showScore(lineup); },
      }
    : null;

  const displayLeague = {
    name: league?.name ?? 'My League',
    admin: league?.admin ?? profile?.handle ?? '@you',
    daysUntilStart: 0,
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
      leagueStarted: false,
      weeklyUpdate: null,
      profile,
      onProfile() { navigate(ROUTES.SETTINGS); },
      onNewDraft() { clearAll(); navigate(ROUTES.WELCOME); },
      onLogout()   { logout(); clearAll(); navigate(ROUTES.WELCOME); },
      onEditLineup() {},
      onDraft()    { navigate(shouldPromptSpotify() ? ROUTES.SPOTIFY_CONNECT : ROUTES.DRAFT); },
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
    leagueStarted,
    snapshots,
    weeklyUpdate,
    manualUpdateWeek: canManuallyUpdate ? nextWeekNumber : null,
    onManualWeeklyUpdate: canManuallyUpdate
      ? () => { navigate(ROUTES.WEEKLY_UPDATE, { weekNumber: nextWeekNumber }); }
      : null,
    profile,
    onProfile() { navigate(ROUTES.SETTINGS); },
    onNewDraft()   { clearAll(); navigate(ROUTES.WELCOME); },
    onLogout()     { logout(); clearAll(); navigate(ROUTES.WELCOME); },
    onEditLineup() { navigate(ROUTES.DRAFT, { preSelected: lineup }); },
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
      renderSpotifyConnect(
        () => navigate(ROUTES.DRAFT),
        () => navigate(ROUTES.DRAFT),
        () => navigate(ROUTES.DRAFT),
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
