# Listener Portfolio

Scores your Spotify listening history like an angel investor portfolio. Early conviction in artists that later blew up = high ROI.

## Setup

### 1. Create a Spotify app

1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Click **Create app**
3. Add `http://127.0.0.1:5173/callback` as a Redirect URI
4. Copy your **Client ID**

### 2. Configure credentials

Open `.env` and fill in your Client ID:

```
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
VITE_REDIRECT_URI=http://127.0.0.1:5173/callback
```

### 3. Install dependencies

```bash
npm install
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser.

> **Note:** Use `127.0.0.1`, not `localhost` — the redirect URI must match exactly.

## How scoring works

- **Investment weight** — long-term rank position (rank 1 = highest conviction)
- **Earliness signal** — rank drift between long-term and short-term listening
- **Growth proxy** — artist popularity from Spotify (0–100)
- **ROI** = investmentWeight × earlinessScore × (popularity / 100)
- **Portfolio score** = weighted average ROI scaled to 0–999

### Artist tiers

| Tier | Meaning |
|------|---------|
| Deep Cut | In your long-term top 50 but not short-term |
| Early Bet | Significantly higher long-term rank than short-term |
| Consistent | Similar rank across both time ranges |
| Rising | Higher in short-term — a recent discovery |

### Letter grades

| Grade | Score |
|-------|-------|
| S | 700–999 |
| A | 500–699 |
| B | 300–499 |
| C | 0–299 |
