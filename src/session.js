// session.js — Spotify OAuth2 PKCE

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

const TOKEN_KEY = 'md_spotify_tokens';
const VERIFIER_KEY = 'md_pkce_verifier';

function getTokens() {
  const raw = localStorage.getItem(TOKEN_KEY);
  return raw ? JSON.parse(raw) : null;
}

function setTokens({ accessToken, refreshToken, expiresIn }) {
  localStorage.setItem(TOKEN_KEY, JSON.stringify({
    accessToken,
    refreshToken,
    expiresAt: Date.now() + expiresIn * 1000,
  }));
}

export function isLoggedIn() {
  const tokens = getTokens();
  if (!tokens) return false;
  return tokens.expiresAt > Date.now() + 60_000 || !!tokens.refreshToken;
}

function base64urlEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export async function login() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const verifier = base64urlEncode(array);
  localStorage.setItem(VERIFIER_KEY, verifier);

  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  const challenge = base64urlEncode(digest);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    scope: 'user-top-read',
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

export async function handleCallback(code) {
  const verifier = localStorage.getItem(VERIFIER_KEY);
  if (!verifier) throw new Error('No PKCE verifier found');

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      code_verifier: verifier,
    }),
  });

  if (!res.ok) throw new Error(`Token exchange failed: ${await res.text()}`);

  const data = await res.json();
  setTokens({ accessToken: data.access_token, refreshToken: data.refresh_token, expiresIn: data.expires_in });
  localStorage.removeItem(VERIFIER_KEY);
}

async function refreshAccessToken() {
  const tokens = getTokens();
  if (!tokens?.refreshToken) throw new Error('No refresh token');

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: tokens.refreshToken,
      client_id: CLIENT_ID,
    }),
  });

  if (!res.ok) throw new Error('Token refresh failed');

  const data = await res.json();
  setTokens({
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? tokens.refreshToken,
    expiresIn: data.expires_in,
  });
  return data.access_token;
}

export async function getAccessToken({ forceRefresh = false } = {}) {
  const tokens = getTokens();
  if (!tokens) throw new Error('Not authenticated');
  if (!forceRefresh && tokens.expiresAt > Date.now() + 60_000) return tokens.accessToken;
  return refreshAccessToken();
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(VERIFIER_KEY);
}
