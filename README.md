# Music Draft

Fantasy sports for music fans. Draft artists from your Spotify listening history, then score points as their popularity rises.

## How it works

1. **Join a league** — enter a league with friends (or mock members for now)
2. **Draft your roster** — pick artists from your Spotify top artists
3. **Score points** — each artist earns points based on daily popularity changes:
   - +3 points if popularity went up
   - +1 point if popularity held steady
   - 0 points if popularity dropped
4. **Standings** — compare your total against league members

Popularity is pulled live from Spotify, with a seeded daily delta applied to simulate real-world movement.

## Setup

### 1. Create a Spotify app

1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Click **Create app**
3. Add `http://127.0.0.1:5173/callback` as a Redirect URI
4. Copy your **Client ID**

### 2. Configure credentials

Create a `.env` file and fill in your Client ID:

```
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
VITE_REDIRECT_URI=http://127.0.0.1:5173/callback
```

### 3. Install and run

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser.

> **Note:** Use `127.0.0.1`, not `localhost` — the redirect URI must match exactly.

## Status

The app currently uses mock artist data and mock league members. Spotify OAuth and live API integration are on the roadmap.
