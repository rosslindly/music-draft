// ui.js — View rendering

const app = document.getElementById('app');

// --- Helpers ---

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function initials(name) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

const AVATAR_COLORS = ['#7c3aed', '#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#8b5cf6', '#0891b2'];

function artistColor(id) {
  const sum = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function getTier(popularity) {
  if (popularity >= 85) return 'rising';
  if (popularity >= 70) return 'consistent';
  if (popularity >= 55) return 'early_bet';
  return 'deep_cut';
}

function getTierLabel(popularity) {
  if (popularity >= 85) return 'Trending';
  if (popularity >= 70) return 'Established';
  if (popularity >= 55) return 'Emerging';
  return 'Deep Cut';
}

function getGrade(pts) {
  if (pts >= 12) return { grade: 'S', cls: 'grade-s', headline: 'Perfect Scout!' };
  if (pts >= 9)  return { grade: 'A', cls: 'grade-a', headline: 'Sharp Ear' };
  if (pts >= 6)  return { grade: 'B', cls: 'grade-b', headline: 'Solid Pick' };
  return           { grade: 'C', cls: 'grade-c', headline: 'Better Luck Next Time' };
}

// --- Welcome View ---

export function renderWelcome(onStart) {
  app.innerHTML = `
    <div class="view view-welcome">
      <div class="welcome-content">
        <div class="welcome-logo">
          <svg class="welcome-logo-icon" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="28" cy="28" r="28" fill="#7c3aed" fill-opacity="0.18"/>
            <path d="M14 38 Q28 14 42 38" stroke="#7c3aed" stroke-width="3.5" stroke-linecap="round" fill="none"/>
            <circle cx="28" cy="19" r="5" fill="#7c3aed"/>
          </svg>
          <span class="welcome-logo-name">Music Draft</span>
        </div>

        <h1 class="welcome-headline">Pick artists.<br>Predict their rise.</h1>
        <p class="welcome-sub">A daily fantasy game for music discovery. Build your lineup, lock in scores, and see if your ear was right.</p>

        <div class="welcome-steps">
          <div class="welcome-step">
            <div class="step-num">1</div>
            <div class="step-body">
              <strong>Draft your lineup</strong>
              <span>Pick up to 5 artists from our roster of rising and established acts.</span>
            </div>
          </div>
          <div class="welcome-step">
            <div class="step-num">2</div>
            <div class="step-body">
              <strong>Snapshot their popularity</strong>
              <span>Each artist's score is locked in the moment you submit your draft.</span>
            </div>
          </div>
          <div class="welcome-step">
            <div class="step-num">3</div>
            <div class="step-body">
              <strong>See who rose</strong>
              <span>Come back daily. +3 pts if they climbed · +1 if steady · 0 if they dropped.</span>
            </div>
          </div>
        </div>

        <button class="btn-primary welcome-cta" id="welcome-start-btn">Get Started →</button>
        <p class="welcome-hint">Free to play · No account needed</p>
      </div>
    </div>
  `;
  document.getElementById('welcome-start-btn').addEventListener('click', onStart);
}

// --- League View ---

export function renderLeague(league, onJoin, onBack) {
  app.innerHTML = `
    <div class="view view-league">
      <div class="league-card">
        <button class="btn-back" id="league-back-btn">← Back</button>
        <div class="league-badge">
          <svg class="league-badge-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 4 L40 12 L40 26 C40 36 24 44 24 44 C24 44 8 36 8 26 L8 12 Z"
              fill="#7c3aed" fill-opacity="0.18" stroke="#7c3aed" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M18 23 L22 27 L30 19" stroke="#7c3aed" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>

        <div class="league-invite-label">You've been invited to join</div>
        <h1 class="league-name">${escapeHtml(league.name)}</h1>

        <div class="league-stats">
          <div class="league-stat">
            <span class="league-stat-value">${escapeHtml(league.admin)}</span>
            <span class="league-stat-label">Commissioner</span>
          </div>
          <div class="league-stat-divider"></div>
          <div class="league-stat">
            <span class="league-stat-value league-stat-countdown">${league.daysUntilStart}</span>
            <span class="league-stat-label">Days Until Start</span>
          </div>
          <div class="league-stat-divider"></div>
          <div class="league-stat">
            <span class="league-stat-value">${league.teamCount}<span class="league-stat-max"> / ${league.maxTeams}</span></span>
            <span class="league-stat-label">Teams Joined</span>
          </div>
        </div>

        <button class="btn-primary" id="join-league-btn">Join League →</button>
      </div>
    </div>
  `;
  document.getElementById('join-league-btn').addEventListener('click', onJoin);
  document.getElementById('league-back-btn').addEventListener('click', onBack);
}

// --- Draft View ---

export function renderDraft(artists, onLockIn, onBack) {
  app.innerHTML = `
    <div class="view view-draft">
      <div class="draft-container">
        <button class="btn-back" id="draft-back-btn">← Back</button>
        <h1>Draft Your Lineup</h1>
        <p class="tagline">Draft up to 5 artists from your recent listening history. Their popularity scores will be snapshotted now.</p>
        <p class="draft-count" id="draft-count">0 / 5 selected</p>
        <ul class="artist-list" id="artist-list">
          ${artists.map((a, i) => `
            <li class="artist-card" data-id="${escapeHtml(a.id)}">
              <div class="artist-rank">#${i + 1}</div>
              <div class="artist-avatar" style="background:${artistColor(a.id)}">${escapeHtml(initials(a.name))}</div>
              <div class="artist-info">
                <div class="artist-top-row">
                  <span class="artist-name">${escapeHtml(a.name)}</span>
                </div>
                <div class="artist-meta">
                  <span>Pop: ${a.popularity}</span>
                </div>
              </div>
              <div class="artist-select">
                <input type="checkbox"
                  value="${escapeHtml(a.id)}"
                  data-name="${escapeHtml(a.name)}"
                  data-popularity="${a.popularity}" />
              </div>
            </li>
          `).join('')}
        </ul>
      </div>
      <div class="draft-footer">
        <span class="draft-footer-count" id="draft-footer-count"></span>
        <button class="btn-primary" id="lock-in-btn" disabled>Lock In Lineup →</button>
      </div>
    </div>
  `;

  const cards = document.querySelectorAll('#artist-list .artist-card');
  const countEl = document.getElementById('draft-count');
  const footerCount = document.getElementById('draft-footer-count');
  const lockBtn = document.getElementById('lock-in-btn');

  function updateCount() {
    const n = [...cards].filter(c => c.classList.contains('selected')).length;
    countEl.textContent = `${n} / 5 selected`;
    footerCount.textContent = n > 0 ? `${n} selected` : '';
    lockBtn.disabled = n < 3;
  }

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const cb = card.querySelector('input[type="checkbox"]');
      const already = card.classList.contains('selected');
      const total = [...cards].filter(c => c.classList.contains('selected')).length;
      if (!already && total >= 5) return;
      card.classList.toggle('selected', !already);
      cb.checked = !already;
      updateCount();
    });
  });

  document.getElementById('draft-back-btn').addEventListener('click', onBack);

  lockBtn.addEventListener('click', () => {
    const selected = [...cards]
      .filter(c => c.classList.contains('selected'))
      .map(c => {
        const cb = c.querySelector('input[type="checkbox"]');
        return { id: cb.value, name: cb.dataset.name, popularity: parseInt(cb.dataset.popularity, 10) };
      });
    onLockIn(selected);
  });
}

// --- League Home (Score View) ---

export function renderScore({ results, totalPoints, standings, league, leagueStarted, onNewDraft, onLogout }) {
  const userRank = standings.findIndex(e => e.isYou) + 1;

  app.innerHTML = `
    <div class="view-league-home">
      <header class="results-header">
        <div class="header-brand">
          <svg class="logo-icon-sm" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="11" fill="#7c3aed" fill-opacity="0.15"/>
            <path d="M6 15 Q11 6 16 15" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" fill="none"/>
            <circle cx="11" cy="8" r="2" fill="#7c3aed"/>
          </svg>
          Music Draft
        </div>
        <div class="header-user">
          <button class="btn-logout" id="new-draft-btn">Start Over</button>
          <button class="btn-logout" id="logout-btn">Sign Out</button>
        </div>
      </header>

      <div class="lh-banner">
        <div class="lh-banner-inner">
          <div class="lh-banner-left">
            <div class="lh-league-badge-wrap">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
                <path d="M24 4 L40 12 L40 26 C40 36 24 44 24 44 C24 44 8 36 8 26 L8 12 Z"
                  fill="#7c3aed" fill-opacity="0.3" stroke="#7c3aed" stroke-width="1.5" stroke-linejoin="round"/>
                <path d="M18 23 L22 27 L30 19" stroke="#7c3aed" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="lh-league-info">
              <div class="lh-league-name">${escapeHtml(league.name)}</div>
              <div class="lh-league-meta">${escapeHtml(league.admin)}, Commissioner · ${league.teamCount} / ${league.maxTeams} teams</div>
            </div>
          </div>
          <div class="lh-score-block">
            ${leagueStarted
              ? `<div class="lh-score-pts">${totalPoints}<span class="lh-score-pts-label"> pts</span></div>
            <div class="lh-score-rank">#${userRank} of ${standings.length}</div>`
              : `<div class="lh-score-pts lh-score-pts--pending">—</div>
            <div class="lh-score-rank">Starts in ${league.daysUntilStart}d</div>`
            }
          </div>
        </div>
      </div>

      <div class="lh-content">
        <section class="lh-section">
          <h3 class="lh-section-title">My Lineup</h3>
          <ul class="artist-list">
            ${results.map(r => {
              const ptsCls = !leagueStarted ? 'lh-pts-flat' : r.points > 1 ? 'lh-pts-up' : r.points === 1 ? 'lh-pts-flat' : 'lh-pts-zero';
              const ptsLabel = !leagueStarted ? '—' : r.points > 0 ? `+${r.points}` : '0';
              return `
                <li class="artist-card lh-artist-card">
                  <div class="artist-avatar" style="background:${artistColor(r.id)}">${escapeHtml(initials(r.name))}</div>
                  <div class="artist-info">
                    <div class="artist-name">${escapeHtml(r.name)}</div>
                  </div>
                  <div class="lh-artist-pts ${ptsCls}">${ptsLabel} <span class="lh-pts-suffix">pts</span></div>
                </li>
              `;
            }).join('')}
          </ul>
        </section>

        <section class="lh-section">
          <h3 class="lh-section-title">Standings</h3>
          <ul class="standings-list">
            ${standings.map((entry, i) => `
              <li class="standings-row${entry.isYou ? ' standings-row--you' : ''}">
                <span class="standings-rank">${leagueStarted ? i + 1 : '—'}</span>
                <span class="standings-name">${escapeHtml(entry.name)}${entry.isYou ? ' <span class="standings-you-tag">you</span>' : ''}</span>
                <div class="standings-picks">
                  ${entry.picks.map(p => `
                    <div class="standings-avatar" style="background:${artistColor(p.id)}" title="${escapeHtml(p.name)}">${escapeHtml(initials(p.name))}</div>
                  `).join('')}
                </div>
                <span class="standings-pts">${entry.totalPoints} <span class="standings-pts-label">pts</span></span>
              </li>
            `).join('')}
          </ul>
        </section>
      </div>

      <footer class="results-footer">
        Scores update daily · +3 if popularity rises · +1 if unchanged · 0 if it drops
      </footer>
    </div>
  `;

  document.getElementById('new-draft-btn').addEventListener('click', onNewDraft);
  document.getElementById('logout-btn').addEventListener('click', onLogout);
}

// --- Loading View ---

export function renderLoading(message = 'Loading…') {
  app.innerHTML = `
    <div class="view view-loading">
      <div class="loading-card">
        <div class="spinner"></div>
        <p class="loading-message">${escapeHtml(message)}</p>
      </div>
    </div>
  `;
}

// --- Error View ---

export function renderError(message, onRetry) {
  app.innerHTML = `
    <div class="view view-error">
      <div class="error-card">
        <div class="error-icon">⚠️</div>
        <p class="error-message">${escapeHtml(message)}</p>
        <button class="btn-secondary" id="retry-btn">Try again</button>
      </div>
    </div>
  `;
  document.getElementById('retry-btn').addEventListener('click', onRetry);
}
