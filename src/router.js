// router.js — Hash-based routing

import { loadProfile, getLeague, getLineup, loadIntent } from './store.js';
import { shouldSkipDraftOnJoin } from './permissions.js';

export const ROUTES = {
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

let isInitialLoad = true;
const routeHandlers = {};

export function registerRoutes(handlers) {
  Object.assign(routeHandlers, handlers);
}

// Signal that the URL has already been updated externally (e.g. after OAuth redirect).
// The next navigate() call will use pushState instead of replaceState.
export function markInitialLoadDone() {
  isInitialLoad = false;
}

export function navigate(hash, state = {}) {
  const fullState = { route: hash, ...state };
  if (isInitialLoad) {
    history.replaceState(fullState, '', hash);
    isInitialLoad = false;
  } else {
    history.pushState(fullState, '', hash);
  }
  renderRoute(hash, state);
}

export function renderRoute(hash, state = {}) {
  const handler = routeHandlers[hash];
  if (handler) {
    handler(state);
  } else {
    autoNavigate();
  }
}

export function autoNavigate() {
  const profile = loadProfile();
  if (!profile) { navigate(ROUTES.WELCOME); return; }

  const league = getLeague();
  if (!league) {
    const intent = loadIntent();
    navigate(intent === 'create' ? ROUTES.CREATE_LEAGUE : ROUTES.ENTER_INVITE_CODE);
    return;
  }

  const lineup = getLineup();
  if (!lineup) {
    const shouldPromptSpotify = loadProfile()?.spotifyConnected === undefined;
    const defaultPost = shouldSkipDraftOnJoin(league.role) ? ROUTES.LEAGUE : ROUTES.DRAFT;
    navigate(shouldPromptSpotify ? ROUTES.SPOTIFY_CONNECT : defaultPost);
    return;
  }

  navigate(ROUTES.LEAGUE);
}

window.addEventListener('popstate', (e) => {
  const route = e.state?.route;
  if (route) {
    renderRoute(route, e.state);
  } else {
    autoNavigate();
  }
});
