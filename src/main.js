// main.js — Entry point
import { logout } from './session.js';
import { getTopArtists, getArtistsByIds, MOCK_MEMBERS } from './data.js';
import { saveLineup, getLineup, clearLineup, scoreLineup, saveLeague, getLeague, clearLeague, saveSnapshot, getSnapshots, clearSnapshots } from './scoring.js';
import { renderWelcome, renderOnboarding, renderCreateLeague, renderLeague, renderDraft, renderBaselineEntry, renderScore, renderLoading } from './ui.js';

let welcomeSeen = false;
let onboardingDone = false;
let userProfile = null;
let userIntent = null; // 'create' | 'join'

const MOCK_JOIN_LEAGUE = {
  name: 'Indie Tastemakers',
  admin: 'Jordan K.',
  daysUntilStart: 3,
  teamCount: 7,
  maxTeams: 10,
};

async function main() {
  if (!welcomeSeen) {
    renderWelcome(
      () => { welcomeSeen = true; userIntent = 'join'; main(); },
      () => { welcomeSeen = true; userIntent = 'create'; main(); },
    );
    return;
  }

  if (!onboardingDone) {
    renderOnboarding(
      (profile) => { onboardingDone = true; userProfile = profile; main(); },
      () => { welcomeSeen = false; main(); },
    );
    return;
  }

  const league = getLeague();
  if (!league) {
    if (userIntent === 'create') {
      renderCreateLeague(
        (newLeague) => {
          saveLeague({
            ...newLeague,
            admin: userProfile?.handle ?? '@you',
            teamCount: 1,
            maxTeams: newLeague.maxParticipants ?? 10,
          });
          showScore(null);
        },
        () => { onboardingDone = false; main(); },
      );
    } else {
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
          main();
        },
        () => { onboardingDone = false; main(); },
      );
    }
    return;
  }

  const lineup = getLineup();
  if (lineup) {
    const hasBaseline = getSnapshots().some(s => s.week === 1);
    if (hasBaseline) {
      await showScore(lineup);
    } else {
      showBaselineEntry(lineup);
    }
  } else {
    await showDraft();
  }
}

async function showDraft(preSelected = []) {
  renderLoading('Loading artists…');
  const topArtists = await getTopArtists();
  renderDraft(
    topArtists,
    (selected) => {
      saveLineup(selected);
      // Set startDate on first draft submission
      const league = getLeague();
      if (league && !league.startDate) {
        saveLeague({ ...league, startDate: new Date().toISOString() });
      }
      showBaselineEntry(getLineup());
    },
    () => { main(); },
    preSelected,
  );
}

function showBaselineEntry(lineup) {
  const week1 = getSnapshots().find(s => s.week === 1);
  const existing = week1 ? Object.fromEntries(week1.artists.map(a => [a.id, a.monthlyListeners])) : {};
  renderBaselineEntry(lineup, existing, (entries) => {
    saveSnapshot(1, entries);
    showScore(getLineup());
  });
}

async function showScore(lineup) {
  const league = getLeague();
  // Scoring only activates once there's a weekly update (week > 1) to compare against the baseline
  const leagueStarted = getSnapshots().some(s => s.week > 1);

  const displayLeague = {
    name: league?.name ?? 'My League',
    admin: league?.admin ?? userProfile?.handle ?? '@you',
    daysUntilStart: 0,
    teamCount: league?.teamCount ?? 1,
    maxTeams: league?.maxTeams ?? 10,
    inviteCode: league?.inviteCode ?? null,
  };

  if (!lineup) {
    renderScore({
      results: [],
      totalPoints: 0,
      standings: [{ handle: userProfile?.handle ?? '@you', picks: [], totalPoints: 0, isYou: true }],
      league: displayLeague,
      leagueStarted: false,
      onNewDraft() { clearLineup(); clearLeague(); clearSnapshots(); welcomeSeen = false; onboardingDone = false; userProfile = null; userIntent = null; main(); },
      onLogout() { logout(); clearLineup(); clearLeague(); clearSnapshots(); main(); },
      onEditLineup() {},
      onDraft() { showDraft(); },
    });
    return;
  }

  let results, totalPoints, memberStandings;

  const isSolo = league?.teamCount === 1;

  if (leagueStarted) {
    renderLoading('Calculating score…');
    const userIds = lineup.map(a => a.id);
    const memberIds = isSolo ? [] : MOCK_MEMBERS.flatMap(m => m.lineup.map(a => a.id));
    const allIds = [...new Set([...userIds, ...memberIds])];
    const liveArtists = await getArtistsByIds(allIds);
    const liveById = Object.fromEntries(liveArtists.map(a => [a.id, a]));

    ({ results, totalPoints } = scoreLineup(lineup, userIds.map(id => liveById[id]).filter(Boolean)));
    memberStandings = isSolo ? [] : MOCK_MEMBERS.map(m => {
      const live = m.lineup.map(a => liveById[a.id]).filter(Boolean);
      const { totalPoints: pts } = scoreLineup(m.lineup, live);
      return { handle: m.handle, picks: m.lineup, totalPoints: pts };
    });
  } else {
    renderLoading('Loading lineup…');
    const week1 = getSnapshots().find(s => s.week === 1);
    const week1ById = week1 ? Object.fromEntries(week1.artists.map(a => [a.id, a.monthlyListeners])) : {};
    results = lineup.map(a => {
      const baseline = week1ById[a.id] ?? a.monthlyListeners;
      return { id: a.id, name: a.name, points: 0, change: 0, listenersThen: baseline, listenersNow: baseline, savedAt: a.savedAt };
    });
    totalPoints = 0;
    memberStandings = isSolo ? [] : MOCK_MEMBERS.map(m => ({ handle: m.handle, picks: m.lineup, totalPoints: 0 }));
    await new Promise(r => setTimeout(r, 200));
  }

  const standings = [
    { handle: userProfile?.handle ?? '@you', picks: results, totalPoints, isYou: true },
    ...memberStandings,
  ];
  if (leagueStarted) standings.sort((a, b) => b.totalPoints - a.totalPoints);

  renderScore({
    results,
    totalPoints,
    standings,
    league: displayLeague,
    leagueStarted,
    onNewDraft() { clearLineup(); clearLeague(); clearSnapshots(); welcomeSeen = false; onboardingDone = false; userProfile = null; userIntent = null; main(); },
    onLogout() { logout(); clearLineup(); clearLeague(); clearSnapshots(); main(); },
    onEditLineup() { showDraft(lineup); },
  });
}

main();
