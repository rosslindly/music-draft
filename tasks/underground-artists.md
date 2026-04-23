# Task: Underground Artists — Data Strategy

## Problem

Some artists users want to draft are genuinely too underground to appear on Spotify or Apple Music. This breaks two things:

1. **Draft screen** — artist won't appear in Spotify top artists list, so they can't be drafted via the normal flow
2. **Scoring** — we have no monthly listener count to track week-over-week growth

## Options

### A. Manual entry + SoundCloud/Bandcamp as the listener source
- Allow commissioners (or players) to add an artist manually by name
- Pull listener/play counts from SoundCloud or Bandcamp instead
- **Pro:** covers the artists that actually matter to underground fans
- **Con:** SoundCloud and Bandcamp APIs are inconsistent; Bandcamp has no public API

### B. Manual listener count entry (same as Week 1 baseline flow)
- User adds artist by name; enters a starting listener count manually each week
- No automated data fetch — fully honor system
- **Pro:** zero API dependency, works for literally any artist
- **Con:** relies on users self-reporting; open to abuse in competitive leagues

### C. Block underground artists — Spotify/Apple Music only
- Only allow artists that can be verified and auto-tracked
- Clearly communicate this constraint at draft time
- **Pro:** scoring stays clean and automated
- **Con:** limits the audience; alienates users whose taste lives outside streaming

### D. YouTube as fallback
- For artists not on Spotify, pull subscriber count or monthly view count from YouTube
- **Pro:** almost every artist has a YouTube presence
- **Con:** subscriber count is a different metric than monthly listeners; harder to normalize for scoring

### E. Last.fm as universal fallback
- Last.fm has listener data for a huge long tail of artists including very obscure acts
- API is free and well-documented
- **Pro:** consistent metric (monthly listeners / scrobbles), broad coverage
- **Con:** Last.fm counts are scrobble-based and skew toward specific demographics; less reliable for truly new artists

## Recommended Direction

**Option E (Last.fm) as the primary fallback, with Option B as the last resort.**

- Try Spotify → fall back to Last.fm → fall back to manual entry
- Normalize Last.fm listener counts to be comparable to Spotify monthly listeners (document the conversion)
- Flag on the Draft screen when an artist is using a fallback data source

## Open Questions

- Do we want underground artists to score separately or in the same pool as Spotify artists?
- Should the commissioner approve manual artist additions to prevent abuse?
- What's the minimum listener count threshold to qualify as a draftable artist at all?

## Dependencies

- `apify-error-state.md` — error state pattern is relevant here
- `spotify-top-artists-pagination.md` — upstream of how we source the draft pool
