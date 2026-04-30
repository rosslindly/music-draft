# Music Draft

Fantasy sports for music fans. Draft artists from your Spotify listening history, then score points as their popularity rises.

## How it works

1. **Join a league** — enter a league with friends using an invite code
2. **Draft your roster** — pick artists from your Spotify top artists
3. **Score points** — each week, artists earn points based on growth in monthly listeners (tracked via Spotify/Apify)
4. **Add artists** — each week after the league starts, you can add one new artist to your roster
5. **Standings** — compare your total against league members

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

## Dev tips

### Time-based scenario testing

To simulate a different date without changing your system clock, add `?devDate=YYYY-MM-DD` to the URL (dev builds only):

```
http://127.0.0.1:5173/?devDate=2026-05-07#league
```

| Scenario | devDate |
|---|---|
| Before league starts (edit lineup) | a date before scheduled start |
| Week 1 | league's scheduled start date |
| Week 2 (can add 1 artist) | start date + 7 days |
| Week 3 (can add 2nd artist) | start date + 14 days |

This is stripped out in production builds.
