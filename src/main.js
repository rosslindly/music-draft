// main.js — Screen orchestration and bootstrap

import { login, handleCallback, logout } from './session.js';
import { getTopArtists } from './data.js';
import { hasApifyToken, fetchListenerCounts } from './apify.js';
import { scoreSeason } from './scoring.js';
import {
  bootStore,
  saveProfile, loadProfile,
  saveIntent, loadIntent,
  saveLeague, getLeague, loadMostRecentLeague,
  lookupLeague, setPendingLeague, commitJoin,
  saveLineup, getLineup,
  saveSnapshot, getSnapshots,
  clearAll, resetUserId,
  getCurrentWeekNumber,
  withImages,
  loadOtherMembers,
  getTakenArtistIds,
} from './store.js';
import { ROUTES, navigate, renderRoute, autoNavigate, registerRoutes, markInitialLoadDone } from './router.js';
import { canManageLeague, canEditLineup, canAddWeeklyArtist, shouldSkipDraftOnJoin } from './permissions.js';
import {
  renderWelcome, renderEnterInviteCode, renderOnboarding, renderCreateLeague,
  renderLeague, renderSpotifyConnect, renderDraft, renderBaselineEntry,
  renderWeeklyUpdate, renderScore, renderLeagueSettings, renderSettings, renderLoading,
} from './ui.js';

// ── Handle generator ──────────────────────────────────────────────────────────

function generateHandle() {
  const adj  = ['Groovy','Smooth','Wild','Indie','Electric','Cosmic','Neon','Velvet','Echo','Sonic','Mellow','Dusty','Lunar','Fuzzy','Slick'];
  const noun = ['Beat','Wave','Tune','Vibe','Groove','Rhythm','Bass','Track','Chord','Drift','Pulse','Tempo','Haze','Bloom','Storm'];
  const a = adj[Math.floor(Math.random() * adj.length)];
  const n = noun[Math.floor(Math.random() * noun.length)];
  const num = Math.floor(Math.random() * 90) + 10;
  return `${a}${n}${num}`;
}

// ── Screen functions ──────────────────────────────────────────────────────────

function showWelcome() {
  renderWelcome(
    () => { saveIntent('join'); navigate(ROUTES.ENTER_INVITE_CODE); },
    async () => {
      saveIntent('create');
      const league = getLeague() ?? await loadMostRecentLeague('commissioner');
      if (league) { navigate(ROUTES.LEAGUE); return; }
      const profile = loadProfile();
      navigate(profile ? ROUTES.CREATE_LEAGUE : ROUTES.ONBOARDING);
    },
  );
}

function showEnterInviteCode() {
  renderEnterInviteCode(
    async (code) => {
      const leagueData = await lookupLeague(code);
      if (!leagueData) throw new Error('not found');
      navigate(ROUTES.SELECT_LEAGUE, { leagueData });
    },
    () => { navigate(ROUTES.WELCOME); },
  );
}

function showOnboarding() {
  const intent = loadIntent();
  const anonymous = intent === 'join';
  const defaultHandle = anonymous ? generateHandle() : '';

  renderOnboarding(
    async (profile) => {
      await saveProfile(profile);
      if (intent === 'create') {
        const league = getLeague() ?? await loadMostRecentLeague('commissioner');
        navigate(league ? ROUTES.LEAGUE : ROUTES.CREATE_LEAGUE);
      } else if (getLeague()) {
        await commitJoin();
        navigate(loadProfile()?.spotifyConnected === undefined ? ROUTES.SPOTIFY_CONNECT : ROUTES.LEAGUE);
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

function showSelectLeague(leagueData) {
  if (!leagueData) { navigate(ROUTES.ENTER_INVITE_CODE); return; }
  renderLeague(
    leagueData,
    async () => {
      resetUserId();
      setPendingLeague(leagueData);
      navigate(ROUTES.ONBOARDING);
    },
    () => { navigate(ROUTES.ENTER_INVITE_CODE); },
  );
}

function showSpotifyConnect(state = {}) {
  const intent = loadIntent();
  const isJoin = intent === 'join';
  const backRoute = state.next === ROUTES.DRAFT ? ROUTES.LEAGUE : intent === 'create' ? ROUTES.LEAGUE : ROUTES.ONBOARDING;
  const postConnectRoute = state.next ?? (isJoin ? ROUTES.LEAGUE : ROUTES.DRAFT);
  const hideSkip = postConnectRoute === ROUTES.DRAFT;
  renderSpotifyConnect(
    async () => {
      localStorage.setItem('md_oauth_next', postConnectRoute);
      await login();
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

async function showDraft(preSelected = [], appendMode = false) {
  const intent = loadIntent();
  const backRoute = preSelected.length > 0 ? ROUTES.LEAGUE : intent === 'create' ? ROUTES.CREATE_LEAGUE : ROUTES.SELECT_LEAGUE;
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

  const lockedIds = appendMode ? new Set(preSelected.map(a => a.id)) : new Set();
  const maxPicks = appendMode ? preSelected.length + 1 : 3;
  const profile = loadProfile();
  const takenIds = await getTakenArtistIds();
  renderDraft(
    topArtists,
    (selected) => {
      // In append mode, merge locked artists back in case any weren't in the visible list
      const merged = appendMode
        ? [...preSelected.filter(a => !selected.some(s => s.id === a.id)), ...selected]
        : selected;
      saveLineup(merged);
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
    { lockedIds, maxPicks, takenIds },
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
  const snapshots = getSnapshots();
  const otherMembers = await loadOtherMembers();

  const scheduledStart = league?.scheduledStartDate ? new Date(league.scheduledStartDate) : null;
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const leagueStarted = snapshots.some(s => s.week > 1) || (scheduledStart !== null && todayMidnight >= scheduledStart);
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
      standings: [
        { handle: profile?.handle ?? '@you', picks: [], totalPoints: 0, isYou: true },
        ...otherMembers,
      ],
      league: displayLeague,
      role,
      leagueStarted: false,
      profile,
      onProfile() { navigate(ROUTES.SETTINGS); },
      onLeagueSettings: canManageLeague(role) ? () => navigate(ROUTES.LEAGUE_SETTINGS) : null,
      onNewDraft() { clearAll(); navigate(ROUTES.WELCOME); },
      onLogout()   { logout(); clearAll(); navigate(ROUTES.WELCOME); },
      onEditLineup: null,
      onDraft() {
        const spotifyReady = loadProfile()?.spotifyConnected === true;
        navigate(spotifyReady ? ROUTES.DRAFT : ROUTES.SPOTIFY_CONNECT, { next: ROUTES.DRAFT });
      },
    });
    return;
  }

  let results, totalPoints;

  if (leagueStarted) {
    const { results: seasonResults } = scoreSeason(snapshots);
    const seasonById = Object.fromEntries(seasonResults.map(r => [r.id, r]));
    results = lineup.map(a => {
      const s = seasonById[a.id];
      return s ? { ...s, imageUrl: a.imageUrl ?? null } : { id: a.id, name: a.name, points: 0, listenersThen: null, listenersNow: null, change: null, imageUrl: a.imageUrl ?? null };
    });
    totalPoints = parseFloat(results.reduce((s, r) => s + r.points, 0).toFixed(2));
  } else {
    const week1 = snapshots.find(s => s.week === 1);
    const week1ById = week1 ? Object.fromEntries(week1.artists.map(a => [a.id, a.monthlyListeners])) : {};
    results = lineup.map(a => {
      const baseline = week1ById[a.id] ?? a.monthlyListeners;
      return { id: a.id, name: a.name, points: 0, change: null, listenersThen: baseline, listenersNow: baseline, imageUrl: a.imageUrl ?? null };
    });
    totalPoints = 0;
  }

  const standings = [
    { handle: profile?.handle ?? '@you', picks: results, totalPoints, isYou: true },
    ...otherMembers,
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
    onLeagueSettings: canManageLeague(role) ? () => navigate(ROUTES.LEAGUE_SETTINGS) : null,
    onNewDraft()   { clearAll(); navigate(ROUTES.WELCOME); },
    onLogout()     { logout(); clearAll(); navigate(ROUTES.WELCOME); },
    onEditLineup: canAddWeeklyArtist(leagueStarted, lineup.length, currentWeek)
      ? () => navigate(ROUTES.DRAFT, { preSelected: lineup, appendMode: true })
      : canEditLineup(leagueStarted, lineup.length)
        ? () => navigate(ROUTES.DRAFT, { preSelected: lineup })
        : null,
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

// ── Route registration ────────────────────────────────────────────────────────

registerRoutes({
  [ROUTES.WELCOME]:           () => showWelcome(),
  [ROUTES.ENTER_INVITE_CODE]: () => showEnterInviteCode(),
  [ROUTES.ONBOARDING]:        () => showOnboarding(),
  [ROUTES.CREATE_LEAGUE]:     () => showCreateLeague(),
  [ROUTES.SELECT_LEAGUE]:     (state) => showSelectLeague(state.leagueData),
  [ROUTES.SPOTIFY_CONNECT]:   (state) => showSpotifyConnect(state),
  [ROUTES.DRAFT]:             (state) => showDraft(state.preSelected ?? [], state.appendMode ?? false),
  [ROUTES.BASELINE]:          () => showBaselineEntry(withImages(getLineup())),
  [ROUTES.WEEKLY_UPDATE]:     (state) => showWeeklyUpdate(withImages(getLineup()), state.weekNumber),
  [ROUTES.LEAGUE]:            () => showScore(withImages(getLineup())),
  [ROUTES.LEAGUE_SETTINGS]:   () => showLeagueSettings(),
  [ROUTES.SETTINGS]:          () => showSettings(),
});

// ── Bootstrap ─────────────────────────────────────────────────────────────────

(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const oauthCode = urlParams.get('code');
  const oauthError = urlParams.get('error');

  // Load all user data from Supabase into memory before rendering anything.
  // During OAuth redirects this runs before rendering the loading screen intentionally —
  // it's fast enough on local/cloud Supabase that it's not noticeable.
  await bootStore();

  if (oauthCode) {
    // Returning from Spotify OAuth — exchange code for tokens
    renderLoading('Connecting to Spotify…');
    try {
      await handleCallback(oauthCode);
      saveProfile({ ...loadProfile(), spotifyConnected: true });
      history.replaceState({}, '', '/');
      markInitialLoadDone();
      const postOAuthRoute = localStorage.getItem('md_oauth_next') ?? (shouldSkipDraftOnJoin(getLeague()?.role) ? ROUTES.LEAGUE : ROUTES.DRAFT);
      localStorage.removeItem('md_oauth_next');
      navigate(postOAuthRoute);
    } catch (err) {
      console.error('Spotify OAuth callback failed:', err);
      history.replaceState({}, '', '/');
      autoNavigate();
    }
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
      markInitialLoadDone();
      renderRoute(initialHash, {});
    } else {
      autoNavigate();
    }
  }
})();
