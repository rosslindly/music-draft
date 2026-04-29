// permissions.js — Role-based access control
//
// All role checks and gameplay eligibility live here so they can be tested
// independently and changed in one place as multiplayer rules evolve.
//
// Convention: functions return boolean. Callers decide what to do with the result.

export const ROLES = {
  COMMISSIONER: 'commissioner',
  MEMBER: 'member',
};

// ── League management (commissioner only) ─────────────────────────────────────

// Access to League Settings: name, start date, invite code, etc.
export function canManageLeague(role) {
  return role === ROLES.COMMISSIONER;
}

// Enter Week 1 baseline listener counts to start scoring.
export function canEnterBaseline(role) {
  return role === ROLES.COMMISSIONER;
}

// Enter weekly listener count updates to advance scoring.
export function canEnterWeeklyUpdate(role) {
  return role === ROLES.COMMISSIONER;
}

// ── Draft routing ─────────────────────────────────────────────────────────────

// After joining or completing OAuth, members go straight to League Home
// rather than the Draft screen (the commissioner sets up the draft).
// TODO: when members can self-draft, remove or loosen this.
export function shouldSkipDraftOnJoin(role) {
  return role === ROLES.MEMBER;
}

// ── Lineup actions (all players) ─────────────────────────────────────────────

// Free editing of the full lineup is allowed before the league starts.
export function canEditLineup(leagueStarted, lineupSize) {
  return !leagueStarted && lineupSize > 0;
}

// Each week after the league starts, a player may add one new artist.
// Max lineup size grows by 1 per week: 3 in W1, 4 in W2, 5 in W3, etc.
const BASE_PICKS = 3;
export function canAddWeeklyArtist(leagueStarted, lineupSize, currentWeek) {
  return leagueStarted && lineupSize < BASE_PICKS + (currentWeek - 1);
}

// The maximum number of picks allowed in a given week.
export function maxLineupSize(currentWeek) {
  return BASE_PICKS + (currentWeek - 1);
}
