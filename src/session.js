// session.js — Mock session (no OAuth)

const SESSION_KEY = 'md_session';

export function isLoggedIn() {
  return !!localStorage.getItem(SESSION_KEY);
}

export function login() {
  localStorage.setItem(SESSION_KEY, '1');
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}
