// clock.js — centralized time source
//
// In dev, override the current time via ?devDate=YYYY-MM-DD in the URL.
// Example: http://localhost:5173/#league?devDate=2026-05-07
//
// All timing logic (week number, leagueStarted, daysUntilStart) reads from
// these functions so scenarios can be tested without changing system time.

function getDevDate() {
  if (!import.meta.env.DEV) return null;
  const param = new URLSearchParams(window.location.search).get('devDate');
  return param ? new Date(param).getTime() : null;
}

export function getNow() {
  return getDevDate() ?? Date.now();
}

export function getTodayMidnight() {
  const d = new Date(getNow());
  d.setHours(0, 0, 0, 0);
  return d;
}
