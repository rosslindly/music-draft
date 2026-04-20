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
  renderLoading('Calculating score…');

  const userIds = lineup.map(a => a.id);
  const memberIds = MOCK_MEMBERS.flatMap(m => m.lineup.map(a => a.id));
  const allIds = [...new Set([...userIds, ...memberIds])];
  const liveArtists = await getArtistsByIds(allIds);
  const liveById = Object.fromEntries(liveArtists.map(a => [a.id, a]));

  const { results, totalPoints } = scoreLineup(lineup, userIds.map(id => liveById[id]).filter(Boolean));

  const memberStandings = MOCK_MEMBERS.map(m => {
    const live = m.lineup.map(a => liveById[a.id]).filter(Boolean);
    const { totalPoints: pts } = scoreLineup(m.lineup, live);
    return { name: m.name, picks: m.lineup, totalPoints: pts };
  });

  const standings = [
    { name: 'You', picks: results, totalPoints, isYou: true },
    ...memberStandings,
  ].sort((a, b) => b.totalPoints - a.totalPoints);

  renderScore({
    results,
    totalPoints,
    standings,
    onNewDraft() { clearLineup(); welcomeSeen = false; leagueJoined = false; main(); },
    onLogout() { logout(); clearLineup(); main(); },
  });
}

main();
