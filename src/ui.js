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

function artistAvatar(name, id, imageUrl, extraClass = '') {
  const cls = `artist-avatar${extraClass ? ' ' + extraClass : ''}`;
  if (imageUrl) {
    return `<img class="${cls}" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(name)}" loading="lazy">`;
  }
  return `<div class="${cls}" style="background:${artistColor(id)}">${escapeHtml(initials(name))}</div>`;
}

const AVATAR_COLORS = ['#7c3aed', '#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#8b5cf6', '#0891b2'];

function artistColor(id) {
  const sum = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}


function fmtListeners(n) {
  if (n == null || isNaN(n)) return null;
  return n.toLocaleString();
}

function getGrade(pts) {
  if (pts >= 12) return { grade: 'S', cls: 'grade-s', headline: 'Perfect Scout!' };
  if (pts >= 9)  return { grade: 'A', cls: 'grade-a', headline: 'Sharp Ear' };
  if (pts >= 6)  return { grade: 'B', cls: 'grade-b', headline: 'Solid Pick' };
  return           { grade: 'C', cls: 'grade-c', headline: 'Better Luck Next Time' };
}

// --- Welcome View ---

export function renderWelcome(onJoin, onCreate) {
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
        <p class="welcome-sub">A fantasy game for music discovery. Draft a lineup, lock in scores, and see if your ear was right.</p>

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
              <strong>Snapshot their listeners</strong>
              <span>Each artist's monthly listener count is locked in the moment you submit your draft.</span>
            </div>
          </div>
          <div class="welcome-step">
            <div class="step-num">3</div>
            <div class="step-body">
              <strong>See who rose</strong>
              <span>Come back weekly. Points scale with listener growth — the bigger the climb, the bigger the score.</span>
            </div>
          </div>
        </div>

        <div class="welcome-ctas">
          <button class="btn-primary welcome-cta-btn" id="welcome-join-btn">Join a League →</button>
          <button class="btn-secondary welcome-cta-btn" id="welcome-create-btn">Create a League</button>
        </div>
        <p class="welcome-hint">Free to play · No account needed</p>
      </div>
    </div>
  `;
  document.getElementById('welcome-join-btn').addEventListener('click', onJoin);
  document.getElementById('welcome-create-btn').addEventListener('click', onCreate);
}

// --- Onboarding View ---

export function renderOnboarding(onContinue, onBack) {
  app.innerHTML = `
    <div class="view view-onboarding">
      <div class="onboarding-card">
        <button class="btn-back" id="onboarding-back-btn">← Back</button>

        <div class="onboarding-header">
          <div class="onboarding-step-label">Almost there</div>
          <h1 class="onboarding-title">Set up your profile</h1>
          <p class="onboarding-sub">Create your player profile to get started.</p>
        </div>

        <div class="onboarding-photo-wrap">
          <div class="onboarding-photo" id="onboarding-photo" role="button" tabindex="0" aria-label="Upload profile photo">
            <svg class="onboarding-photo-placeholder" id="onboarding-photo-placeholder" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="18" r="8" stroke="#7c3aed" stroke-width="2"/>
              <path d="M8 42c0-8.837 7.163-14 16-14s16 5.163 16 14" stroke="#7c3aed" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <div class="onboarding-photo-overlay">
              <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" style="flex-shrink:0">
                <path fill-rule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
              </svg>
              Upload photo
            </div>
          </div>
          <input type="file" id="photo-input" accept="image/*" style="display:none" />
          <p class="onboarding-photo-hint">Optional · Tap to change</p>
        </div>

        <div class="onboarding-field">
          <label class="onboarding-label" for="handle-input">Your handle</label>
          <div class="onboarding-handle-wrap">
            <span class="onboarding-at">@</span>
            <input
              type="text"
              id="handle-input"
              class="onboarding-handle-input"
              placeholder="placeholdername"
              maxlength="24"
              autocomplete="off"
              spellcheck="false"
            />
          </div>
          <p class="onboarding-field-hint">Letters, numbers, and underscores only.</p>
        </div>

        <button class="btn-primary onboarding-continue-btn" id="onboarding-continue-btn" disabled>Continue →</button>
      </div>
    </div>
  `;

  const photoEl = document.getElementById('onboarding-photo');
  const photoInput = document.getElementById('photo-input');
  const handleInput = document.getElementById('handle-input');
  const continueBtn = document.getElementById('onboarding-continue-btn');

  let photoDataUrl = null;

  function updateContinue() {
    continueBtn.disabled = handleInput.value.trim().length < 2;
  }

  function applyPhoto(url) {
    photoDataUrl = url;
    photoEl.style.backgroundImage = `url(${url})`;
    photoEl.style.backgroundSize = 'cover';
    photoEl.style.backgroundPosition = 'center';
    photoEl.classList.add('has-photo');
    const placeholder = document.getElementById('onboarding-photo-placeholder');
    if (placeholder) placeholder.style.display = 'none';
  }

  // Photo upload
  photoEl.addEventListener('click', () => photoInput.click());
  photoEl.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') photoInput.click(); });
  photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { applyPhoto(ev.target.result); };
    reader.readAsDataURL(file);
  });

  // Handle — alphanumeric + underscore only
  handleInput.addEventListener('input', () => {
    handleInput.value = handleInput.value.replace(/[^a-zA-Z0-9_]/g, '');
    updateContinue();
  });

  document.getElementById('onboarding-back-btn').addEventListener('click', onBack);

  continueBtn.addEventListener('click', () => {
    const handle = handleInput.value.trim();
    if (handle.length < 2) return;
    onContinue({ handle: `@${handle}`, photo: photoDataUrl });
  });
}

// --- Create League View ---

function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function renderCreateLeague(onContinue, onBack) {
  const inviteCode = generateInviteCode();
  app.innerHTML = `
    <div class="view view-create-league">
      <div class="create-league-card">
        <button class="btn-back" id="create-league-back-btn">← Back</button>

        <div class="create-league-header">
          <div class="create-league-step-label">One more step</div>
          <h1 class="create-league-title">Create your league</h1>
          <p class="create-league-sub">Name your league and set it up for your crew.</p>
        </div>

        <div class="create-league-field">
          <label class="create-league-label" for="league-name-input">League name</label>
          <input
            type="text"
            id="league-name-input"
            class="create-league-input"
            placeholder="e.g. Indie Tastemakers"
            maxlength="40"
            autocomplete="off"
            spellcheck="false"
          />
          <p class="create-league-field-hint">Up to 40 characters.</p>
        </div>

        <div class="create-league-fields-row">
          <div class="create-league-field create-league-field--half">
            <label class="create-league-label" for="league-start-date-input">Start Date</label>
            <input
              type="date"
              id="league-start-date-input"
              class="create-league-input"
            />
          </div>
          <div class="create-league-field create-league-field--half">
            <!-- POST-ALPHA: replace with editable select (4/6/8/10/12/16 weeks) -->
            <label class="create-league-label">Duration</label>
            <div class="create-league-input create-league-input--fixed">8 weeks</div>
          </div>
        </div>

        <!-- POST-ALPHA: replace with editable number input (min 2, max 50) -->
        <div class="create-league-field">
          <label class="create-league-label">Max Players</label>
          <div class="create-league-input create-league-input--fixed">8</div>
        </div>

        <button class="btn-primary create-league-btn" id="create-league-btn" disabled>Create League →</button>
      </div>
    </div>
  `;

  const nameInput = document.getElementById('league-name-input');
  const createBtn = document.getElementById('create-league-btn');

  nameInput.addEventListener('input', () => {
    createBtn.disabled = nameInput.value.trim().length === 0;
  });

  document.getElementById('create-league-back-btn').addEventListener('click', onBack);

  createBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (!name) return;
    const scheduledStartDate = document.getElementById('league-start-date-input').value || null;
    const durationWeeks = 8; // POST-ALPHA: read from duration picker
    const maxParticipants = 8; // POST-ALPHA: read from max players input
    onContinue({
      name,
      inviteCode,
      createdAt: new Date().toISOString(),
      startDate: null,
      scheduledStartDate,
      durationWeeks,
      maxParticipants,
    });
  });
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

// --- Baseline Entry View ---

export function renderBaselineEntry(lineup, existing, onSubmit) {
  app.innerHTML = `
    <div class="view view-baseline">
      <div class="baseline-card">
        <div class="baseline-header">
          <h1 class="baseline-title">Enter Starting Listener Counts</h1>
          <p class="baseline-sub">Look up each artist on Spotify and enter their current monthly listeners. This sets your Week 1 baseline for scoring.</p>
        </div>

        <ul class="baseline-list" id="baseline-list">
          ${lineup.map(a => `
            <li class="baseline-row" data-id="${escapeHtml(a.id)}">
              ${artistAvatar(a.name, a.id, a.imageUrl, 'baseline-avatar')}
              <div class="baseline-artist-info">
                <div class="artist-name">${escapeHtml(a.name)}</div>
              </div>
              <input
                type="number"
                class="baseline-input"
                data-id="${escapeHtml(a.id)}"
                placeholder="e.g. 4200000"
                min="1"
                step="1"
                ${existing[a.id] ? `value="${existing[a.id]}"` : ''}
              />
            </li>
          `).join('')}
        </ul>

        <button class="btn-primary baseline-save-btn" id="baseline-save-btn" disabled>Save Baseline →</button>
      </div>
    </div>
  `;

  const inputs = [...document.querySelectorAll('.baseline-input')];
  const saveBtn = document.getElementById('baseline-save-btn');

  function validate() {
    const allValid = inputs.every(inp => {
      const val = parseInt(inp.value, 10);
      return Number.isInteger(val) && val > 0;
    });
    saveBtn.disabled = !allValid;
  }

  inputs.forEach(inp => inp.addEventListener('input', validate));

  saveBtn.addEventListener('click', () => {
    const entries = lineup.map((a, i) => ({
      id: a.id,
      name: a.name,
      monthlyListeners: parseInt(inputs[i].value, 10),
    }));
    onSubmit(entries);
  });
}

// --- Weekly Update Entry View ---

export function renderWeeklyUpdate(lineup, weekNumber, onSubmit) {
  app.innerHTML = `
    <div class="view view-baseline">
      <div class="baseline-card">
        <div class="baseline-header">
          <h1 class="baseline-title">Week ${weekNumber} Listener Update</h1>
          <p class="baseline-sub">Look up each artist on Spotify and enter their current monthly listeners. This week's counts will be compared against last week's snapshot to calculate your score.</p>
        </div>

        <ul class="baseline-list" id="weekly-update-list">
          ${lineup.map(a => `
            <li class="baseline-row" data-id="${escapeHtml(a.id)}">
              ${artistAvatar(a.name, a.id, a.imageUrl, 'baseline-avatar')}
              <div class="baseline-artist-info">
                <div class="artist-name">${escapeHtml(a.name)}</div>
              </div>
              <input
                type="number"
                class="baseline-input weekly-update-input"
                data-id="${escapeHtml(a.id)}"
                placeholder="e.g. 4200000"
                min="1"
                step="1"
              />
            </li>
          `).join('')}
        </ul>

        <button class="btn-primary baseline-save-btn" id="weekly-update-save-btn" disabled>Save Week ${weekNumber} →</button>
      </div>
    </div>
  `;

  const inputs = [...document.querySelectorAll('.weekly-update-input')];
  const saveBtn = document.getElementById('weekly-update-save-btn');

  function validate() {
    const allValid = inputs.every(inp => {
      const val = parseInt(inp.value, 10);
      return Number.isInteger(val) && val > 0;
    });
    saveBtn.disabled = !allValid;
  }

  inputs.forEach(inp => inp.addEventListener('input', validate));

  saveBtn.addEventListener('click', () => {
    const entries = lineup.map((a, i) => ({
      id: a.id,
      name: a.name,
      monthlyListeners: parseInt(inputs[i].value, 10),
    }));
    onSubmit(entries);
  });
}

// --- Spotify Connect View ---

export function renderSpotifyConnect(onConnect, onSkip, onBack) {
  app.innerHTML = `
    <div class="view view-onboarding">
      <div class="onboarding-card">
        <button class="btn-back" id="spotify-back-btn">← Back</button>

        <div class="onboarding-header">
          <div class="onboarding-step-label">Almost ready</div>
          <h1 class="onboarding-title">Connect Spotify</h1>
          <p class="onboarding-sub">We use your Spotify listening history to build your draft roster.</p>
        </div>

        <div class="onboarding-spotify-section">
          <button class="onboarding-spotify-btn" id="spotify-connect-btn">
            <svg class="onboarding-spotify-logo" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.623.623 0 01-.857.208c-2.348-1.435-5.304-1.76-8.785-.964a.623.623 0 11-.277-1.215c3.809-.87 7.076-.496 9.712 1.115.294.18.388.565.207.856zm1.223-2.722a.78.78 0 01-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 01-.973-.519.781.781 0 01.519-.972c3.632-1.102 8.147-.568 11.234 1.328a.78.78 0 01.257 1.072zm.105-2.835C14.692 8.95 9.376 8.775 6.227 9.71a.937.937 0 11-.543-1.795c3.6-1.09 9.587-.879 13.372 1.341a.937.937 0 01-.142 1.611z"/>
            </svg>
            Connect Spotify
          </button>
          <p class="onboarding-field-hint">Your top artists from Spotify will populate your draft roster.</p>
        </div>

        <button class="btn-secondary" id="spotify-skip-btn" style="margin-top:1.25rem;width:100%">Skip for now</button>
      </div>
    </div>
  `;

  document.getElementById('spotify-back-btn').addEventListener('click', onBack);
  document.getElementById('spotify-skip-btn').addEventListener('click', onSkip);

  document.getElementById('spotify-connect-btn').addEventListener('click', () => {
    const btn = document.getElementById('spotify-connect-btn');
    btn.classList.add('spotify-connected');
    btn.innerHTML = `
      <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18" style="flex-shrink:0">
        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
      </svg>
      Spotify Connected
    `;
    setTimeout(() => onConnect(), 600);
  });
}

// --- Draft View ---

export function renderDraft(artists, onLockIn, onBack, preSelected = []) {
  const preSelectedIds = new Set(preSelected.map(a => a.id));
  const isEditing = preSelected.length > 0;
  app.innerHTML = `
    <div class="view view-draft">
      <div class="draft-container">
        <button class="btn-back" id="draft-back-btn">← Back</button>
        <h1>${isEditing ? 'Edit Your Lineup' : 'Draft Your Lineup'}</h1>
        <p class="tagline">Draft up to 5 artists from your recent listening history.</p>
        <p class="draft-count" id="draft-count">0 / 5 selected</p>
        <ul class="artist-list" id="artist-list">
          ${artists.map((a, i) => `
            <li class="artist-card${preSelectedIds.has(a.id) ? ' selected' : ''}" data-id="${escapeHtml(a.id)}">
              <div class="artist-rank">#${i + 1}</div>
              ${artistAvatar(a.name, a.id, a.imageUrl)}
              <div class="artist-info">
                <div class="artist-name">${escapeHtml(a.name)}</div>
                ${a.monthlyListeners != null ? `<div class="artist-listeners">${fmtListeners(a.monthlyListeners)} monthly listeners</div>` : ''}
              </div>
              <div class="artist-select">
                <input type="checkbox"
                  value="${escapeHtml(a.id)}"
                  data-name="${escapeHtml(a.name)}"
                  data-listeners="${a.monthlyListeners ?? ''}"
                  ${preSelectedIds.has(a.id) ? 'checked' : ''} />
              </div>
            </li>
          `).join('')}
        </ul>
      </div>
      <div class="draft-footer">
        <span class="draft-footer-count" id="draft-footer-count"></span>
        <button class="btn-primary" id="lock-in-btn" disabled>${isEditing ? 'Save Lineup →' : 'Lock In Lineup →'}</button>
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

  updateCount();

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
        const listeners = cb.dataset.listeners ? Number(cb.dataset.listeners) : null;
        return { id: cb.value, name: cb.dataset.name, monthlyListeners: listeners };
      });
    onLockIn(selected);
  });
}

// --- League Home (Score View) ---

function buildArtistStatsRows(artistId, snapshots) {
  if (!snapshots || snapshots.length === 0) return '';
  const maxWeek = Math.max(...snapshots.map(s => s.week));
  const rows = [];
  let prevListeners = null;
  for (let w = 1; w <= maxWeek; w++) {
    const snap = snapshots.find(s => s.week === w);
    const artist = snap?.artists.find(a => a.id === artistId);
    const listeners = artist?.monthlyListeners ?? null;
    let changeHtml = '';
    if (w > 1 && listeners != null && prevListeners != null) {
      const delta = listeners - prevListeners;
      const sign = delta > 0 ? '+' : '';
      const cls = delta > 0 ? 'change-up' : delta < 0 ? 'change-down' : 'change-flat';
      changeHtml = `<span class="artist-stat-change ${cls}">${sign}${fmtListeners(Math.abs(delta))}</span>`;
    }
    rows.push(`
      <div class="artist-stat-row">
        <span class="artist-stat-week">Wk ${w}</span>
        <span class="artist-stat-listeners">${listeners != null ? fmtListeners(listeners) : '—'}</span>
        ${changeHtml}
      </div>
    `);
    if (listeners != null) prevListeners = listeners;
  }
  return rows.join('');
}

export function renderScore({ results, totalPoints, standings, league, leagueStarted, snapshots, weeklyUpdate, manualUpdateWeek, onManualWeeklyUpdate, onNewDraft, onLogout, onEditLineup, onDraft }) {
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

      ${weeklyUpdate ? `
      <div class="update-banner" id="update-banner">
        <div class="update-banner-inner">
          <p class="update-banner-text">Week ${weeklyUpdate.weekNumber} is here — time to update your listener counts!</p>
          <div class="update-banner-actions">
            <button class="update-banner-btn-primary" id="update-now-btn">Update Now</button>
            <button class="update-banner-btn-dismiss" id="update-dismiss-btn">Remind me later</button>
          </div>
        </div>
      </div>
      ` : ''}

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
          <div class="lh-section-header">
            <h3 class="lh-section-title">My Lineup</h3>
            <div class="lh-section-header-actions">
              ${manualUpdateWeek ? `<button class="btn-enter-week" id="manual-update-btn">Enter Week ${manualUpdateWeek}</button>` : ''}
              ${!leagueStarted && results.length > 0 ? `<button class="btn-edit-lineup" id="edit-lineup-btn">Edit Lineup</button>` : ''}
            </div>
          </div>
          ${results.length === 0 ? `
            <div class="lh-empty-lineup">
              <p class="lh-empty-lineup-text">You haven't drafted your lineup yet.</p>
              <button class="btn-primary lh-draft-cta-btn" id="lh-draft-cta-btn">Draft Lineup →</button>
            </div>
          ` : `
          <ul class="artist-list">
            ${results.map(r => {
              const ptsCls = !leagueStarted ? 'lh-pts-flat' : r.points > 1 ? 'lh-pts-up' : r.points > 0 ? 'lh-pts-flat' : 'lh-pts-zero';
              const ptsLabel = !leagueStarted ? '—' : r.points > 0 ? `+${r.points}` : '0';
              const statsRows = buildArtistStatsRows(r.id, snapshots);
              return `
                <li class="artist-card lh-artist-card">
                  <div class="lh-artist-row">
                    ${artistAvatar(r.name, r.id, r.imageUrl)}
                    <div class="artist-info">
                      <div class="artist-name">${escapeHtml(r.name)}</div>
                      ${leagueStarted && r.change != null ? (() => {
                        const deltaAbs = fmtListeners(Math.abs(r.change));
                        const deltaStr = r.change === 0 ? '0' : `${r.change > 0 ? '+' : '-'}${deltaAbs}`;
                        const deltaCls = r.change > 0 ? 'change-up' : r.change < 0 ? 'change-down' : 'change-flat';
                        return `<div class="lh-artist-listeners">${fmtListeners(r.listenersThen) ?? '—'} → ${fmtListeners(r.listenersNow) ?? '—'} <span class="${deltaCls}">(${deltaStr})</span></div>`;
                      })() : ''}
                      ${statsRows ? `<button class="btn-stats-toggle" data-id="${escapeHtml(r.id)}">Stats ▾</button>` : ''}
                    </div>
                    <div class="lh-artist-pts ${ptsCls}">${ptsLabel} <span class="lh-pts-suffix">pts</span></div>
                  </div>
                  ${statsRows ? `<div class="artist-stats-panel" id="stats-panel-${escapeHtml(r.id)}">${statsRows}</div>` : ''}
                </li>
              `;
            }).join('')}
          </ul>
          ${!leagueStarted && results.length > 0 ? `<p class="lh-scores-pending-hint">Scores update after your first weekly check-in</p>` : ''}
          `}
        </section>

        <section class="lh-section">
          <h3 class="lh-section-title">Standings</h3>
          <ul class="standings-list">
            ${standings.map((entry, i) => `
              <li class="standings-row${entry.isYou ? ' standings-row--you' : ''}">
                <span class="standings-rank">${leagueStarted ? i + 1 : '—'}</span>
                <span class="standings-name">${escapeHtml(entry.handle)}${entry.isYou ? ' <span class="standings-you-tag">you</span>' : ''}</span>
                <div class="standings-picks">
                  ${entry.picks.map(p => `
                    <div class="standings-avatar" style="background:${artistColor(p.id)}" title="${escapeHtml(p.name)}">${escapeHtml(initials(p.name))}</div>
                  `).join('')}
                </div>
                <span class="standings-pts">${entry.totalPoints} <span class="standings-pts-label">pts</span></span>
              </li>
            `).join('')}
          </ul>
          ${league.inviteCode ? `
          <div class="lh-invite-banner">
            <span class="lh-invite-banner-label">Invite Code</span>
            <span class="lh-invite-banner-code">${escapeHtml(league.inviteCode)}</span>
            <button class="btn-copy-code btn-copy-code--sm" id="lh-copy-code-btn">Copy</button>
          </div>
          ` : ''}
        </section>
      </div>

      <footer class="results-footer">
        Scores update weekly · 1 pt per 1% listener growth · +1 if unchanged · 0 if they dropped
      </footer>
    </div>
  `;

  document.getElementById('new-draft-btn').addEventListener('click', onNewDraft);
  document.getElementById('logout-btn').addEventListener('click', onLogout);
  if (weeklyUpdate) {
    document.getElementById('update-now-btn').addEventListener('click', weeklyUpdate.onUpdate);
    document.getElementById('update-dismiss-btn').addEventListener('click', weeklyUpdate.onDismiss);
  }
  if (manualUpdateWeek && onManualWeeklyUpdate) {
    document.getElementById('manual-update-btn').addEventListener('click', onManualWeeklyUpdate);
  }
  if (!leagueStarted && results.length > 0) {
    document.getElementById('edit-lineup-btn').addEventListener('click', onEditLineup);
  }
  if (results.length === 0) {
    document.getElementById('lh-draft-cta-btn').addEventListener('click', onDraft ?? onEditLineup);
  }
  document.querySelectorAll('.btn-stats-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = document.getElementById(`stats-panel-${btn.dataset.id}`);
      if (!panel) return;
      const open = panel.classList.toggle('open');
      btn.textContent = open ? 'Stats ▴' : 'Stats ▾';
    });
  });

  const copyBtn = document.getElementById('lh-copy-code-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(league.inviteCode).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy Code'; }, 2000);
      });
    });
  }
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
