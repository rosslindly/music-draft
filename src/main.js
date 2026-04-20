// main.js — Entry point
import { logout } from './session.js';
import { getTopArtists, getArtistsByIds, MOCK_MEMBERS } from './data.js';
import { saveLineup, getLineup, clearLineup, scoreLineup } from './scoring.js';
import { renderWelcome, renderLeague, renderDraft, renderScore, renderLoading } from './ui.js';

let welcomeSeen = false;
let leagueJoined = false;

const MOCK_LEAGUE = {
  name: 'Indie Tastemakers',
  admin: 'Jordan K.',
  daysUntilStart: 3,
  teamCount: 7,
  maxTeams: 10,
};

async function main() {
  if (!welcomeSeen) {
    renderWelcome(() => { welcomeSeen = true; main(); });
    return;
  }

  if (!leagueJoined) {
    renderLeague(
      MOCK_LEAGUE,
      () => { leagueJoined = true; main(); },
      () => { welcomeSeen = false; main(); },
    );
    return;
  }

  const lineup = getLineup();
  if (lineup) {
    await showScore(lineup);
  } else {
    await showDraft();
  }
}

async function showDraft() {
  renderLoading('Loading artists…');
  const topArtists = await getTopArtists();
  renderDraft(
    topArtists,
    (selected) => { saveLineup(selected); showScore(getLineup()); },
    () => { leagueJoined = false; main(); },
  );
}

async function showScore(lineup) {
  const leagueStarted = MOCK_LEAGUE.daysUntilStart <= 0;

  let results, totalPoints, memberStandings;

  if (leagueStarted) {
    renderLoading('Calculating score…');
    const userIds = lineup.map(a => a.id);
    const memberIds = MOCK_MEMBERS.flatMap(m => m.lineup.map(a => a.id));
    const allIds = [...new Set([...userIds, ...memberIds])];
    const liveArtists = await getArtistsByIds(allIds);
    const liveById = Object.fromEntries(liveArtists.map(a => [a.id, a]));

    ({ results, totalPoints } = scoreLineup(lineup, userIds.map(id => liveById[id]).filter(Boolean)));
    memberStandings = MOCK_MEMBERS.map(m => {
      const live = m.lineup.map(a => liveById[a.id]).filter(Boolean);
      const { totalPoints: pts } = scoreLineup(m.lineup, live);
      return { name: m.name, picks: m.lineup, totalPoints: pts };
    });
  } else {
    renderLoading('Loading lineup…');
    results = lineup.map(a => ({ id: a.id, name: a.name, points: 0, change: 0, popularityThen: a.popularity, popularityNow: a.popularity, savedAt: a.savedAt }));
    totalPoints = 0;
    memberStandings = MOCK_MEMBERS.map(m => ({ name: m.name, picks: m.lineup, totalPoints: 0 }));
    // small delay so the loading state is visible briefly
    await new Promise(r => setTimeout(r, 200));
  }

  const standings = [
    { name: 'You', picks: results, totalPoints, isYou: true },
    ...memberStandings,
  ];
  if (leagueStarted) standings.sort((a, b) => b.totalPoints - a.totalPoints);

  renderScore({
    results,
    totalPoints,
    standings,
    league: MOCK_LEAGUE,
    leagueStarted,
    onNewDraft() { clearLineup(); welcomeSeen = false; leagueJoined = false; main(); },
    onLogout() { logout(); clearLineup(); main(); },
  });
}

main();
