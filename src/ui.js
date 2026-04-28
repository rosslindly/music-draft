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

function userAvatarHtml(profile, cls = 'user-avatar') {
  if (profile?.photo) {
    return `<img class="${cls}" src="${escapeHtml(profile.photo)}" alt="Profile">`;
  }
  const letter = (profile?.handle ?? '@?').replace('@', '')[0]?.toUpperCase() ?? '?';
  return `<div class="${cls} ${cls}--initial">${letter}</div>`;
}

function profileChipHtml(profile) {
  const handle = profile?.handle ?? '@you';
  return `
    <button class="profile-chip" id="profile-chip-btn">
      ${userAvatarHtml(profile)}
      <span class="profile-chip-handle">${escapeHtml(handle)}</span>
    </button>
  `;
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
              <span>Pick up to 3 artists from your recent listening history.</span>
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
          <button class="btn-secondary welcome-cta-btn" id="welcome-create-btn">I'm the Commissioner</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('welcome-join-btn').addEventListener('click', onJoin);
  document.getElementById('welcome-create-btn').addEventListener('click', onCreate);
}

// --- Enter Invite Code View ---

export function renderEnterInviteCode(onContinue, onBack) {
  app.innerHTML = `
    <div class="view view-onboarding">
      <div class="onboarding-card">
        <button class="btn-back" id="invite-back-btn">← Back</button>

        <div class="onboarding-header">
          <h1 class="onboarding-title">Enter Invite Code</h1>
          <p class="onboarding-sub">Ask your league commissioner for your 6-character invite code.</p>
        </div>

        <div class="onboarding-field">
          <label class="onboarding-label" for="invite-code-input">Invite code</label>
          <div class="onboarding-handle-wrap">
            <input
              type="text"
              id="invite-code-input"
              class="onboarding-handle-input"
              placeholder="e.g. INDIE1"
              maxlength="8"
              autocomplete="off"
              spellcheck="false"
              style="text-transform:uppercase;letter-spacing:0.12em"
            />
          </div>
          <p class="onboarding-field-hint" id="invite-error" style="display:none;color:#ef4444">Invalid invite code. Please try again.</p>
        </div>

        <button class="btn-primary onboarding-continue-btn" id="invite-continue-btn" disabled>Find League →</button>
      </div>
    </div>
  `;

  const codeInput = document.getElementById('invite-code-input');
  const continueBtn = document.getElementById('invite-continue-btn');
  const errorHint = document.getElementById('invite-error');

  codeInput.addEventListener('input', () => {
    codeInput.value = codeInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    continueBtn.disabled = codeInput.value.length < 4;
    errorHint.style.display = 'none';
  });

  document.getElementById('invite-back-btn').addEventListener('click', onBack);

  continueBtn.addEventListener('click', () => {
    const code = codeInput.value.trim();
    if (code.length < 4) return;
    onContinue(code);
  });
}

// --- Onboarding View ---

function avatarColorFromString(str) {
  const sum = str.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

export function renderOnboarding(onContinue, onBack, opts = {}) {
  const { anonymous = false, defaultHandle = '' } = opts;

  const photoSection = anonymous ? `` : `
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
  `;

  app.innerHTML = `
    <div class="view view-onboarding">
      <div class="onboarding-card">
        <button class="btn-back" id="onboarding-back-btn">← Back</button>

        <div class="onboarding-header">
          <h1 class="onboarding-title">Set up your profile</h1>
          <p class="onboarding-sub">${anonymous ? 'Choose a handle to represent you in the league.' : 'Create your player profile to get started.'}</p>
        </div>

        ${photoSection}

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
              value="${escapeHtml(defaultHandle)}"
            />
          </div>
        </div>

        <button class="btn-primary onboarding-continue-btn" id="onboarding-continue-btn" ${defaultHandle.length >= 2 ? '' : 'disabled'}>Continue →</button>
      </div>
    </div>
  `;

  const handleInput = document.getElementById('handle-input');
  const continueBtn = document.getElementById('onboarding-continue-btn');

  let photoDataUrl = null;

  function updateContinue() {
    continueBtn.disabled = handleInput.value.trim().length < 2;
  }

  if (anonymous) {
    // Update avatar initial and color as handle changes
    handleInput.addEventListener('input', () => {
      handleInput.value = handleInput.value.replace(/[^a-zA-Z0-9_]/g, '');
      updateContinue();
    });
  } else {
    const photoEl = document.getElementById('onboarding-photo');
    const photoInput = document.getElementById('photo-input');

    function applyPhoto(url) {
      photoDataUrl = url;
      photoEl.style.backgroundImage = `url(${url})`;
      photoEl.style.backgroundSize = 'cover';
      photoEl.style.backgroundPosition = 'center';
      photoEl.classList.add('has-photo');
      const placeholder = document.getElementById('onboarding-photo-placeholder');
      if (placeholder) placeholder.style.display = 'none';
    }

    photoEl.addEventListener('click', () => photoInput.click());
    photoEl.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') photoInput.click(); });
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => { applyPhoto(ev.target.result); };
      reader.readAsDataURL(file);
    });

    handleInput.addEventListener('input', () => {
      handleInput.value = handleInput.value.replace(/[^a-zA-Z0-9_]/g, '');
      updateContinue();
    });
  }

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
          <h1 class="create-league-title">Create your league</h1>
          <p class="create-league-sub">Placeholder copy TBD.</p>
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

// --- Listener input helper ---

// Attaches focus/input/blur handlers to a text input used for listener counts:
// focus → strips commas for editing, input → allows digits only, blur → reformats with commas.
function initListenerInput(input, onchange) {
  input.addEventListener('focus', () => {
    input.value = input.value.replace(/,/g, '');
  });
  input.addEventListener('input', () => {
    input.value = input.value.replace(/[^\d]/g, '');
    onchange();
  });
  input.addEventListener('blur', () => {
    const n = parseInt(input.value, 10);
    if (!isNaN(n) && n > 0) input.value = n.toLocaleString();
    onchange();
  });
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
                type="text"
                inputmode="numeric"
                class="baseline-input"
                data-id="${escapeHtml(a.id)}"
                ${existing[a.id] ? `value="${Number(existing[a.id]).toLocaleString()}"` : ''}
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
      const val = parseInt(inp.value.replace(/,/g, ''), 10);
      return Number.isInteger(val) && val > 0;
    });
    saveBtn.disabled = !allValid;
  }

  inputs.forEach(inp => initListenerInput(inp, validate));
  validate();

  saveBtn.addEventListener('click', () => {
    const entries = lineup.map((a, i) => ({
      id: a.id,
      name: a.name,
      monthlyListeners: parseInt(inputs[i].value.replace(/,/g, ''), 10),
    }));
    onSubmit(entries);
  });
}

// --- Weekly Update Entry View ---

export function renderWeeklyUpdate(lineup, weekNumber, prefilled = {}, onSubmit) {
  const hasPrefill = Object.keys(prefilled).length > 0;
  app.innerHTML = `
    <div class="view view-baseline">
      <div class="baseline-card">
        <div class="baseline-header">
          <h1 class="baseline-title">Week ${weekNumber} Listener Update</h1>
          <p class="baseline-sub">${hasPrefill ? 'Listener counts have been prefilled from Spotify — review and adjust if needed.' : 'Look up each artist on Spotify and enter their current monthly listeners.'} This week's counts will be compared against last week's snapshot to calculate your score.</p>
        </div>

        <ul class="baseline-list" id="weekly-update-list">
          ${lineup.map(a => `
            <li class="baseline-row" data-id="${escapeHtml(a.id)}">
              ${artistAvatar(a.name, a.id, a.imageUrl, 'baseline-avatar')}
              <div class="baseline-artist-info">
                <div class="artist-name">${escapeHtml(a.name)}</div>
              </div>
              <input
                type="text"
                inputmode="numeric"
                class="baseline-input weekly-update-input"
                data-id="${escapeHtml(a.id)}"
                ${prefilled[a.id] ? `value="${Number(prefilled[a.id]).toLocaleString()}"` : ''}
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
      const val = parseInt(inp.value.replace(/,/g, ''), 10);
      return Number.isInteger(val) && val > 0;
    });
    saveBtn.disabled = !allValid;
  }

  inputs.forEach(inp => initListenerInput(inp, validate));
  validate();

  saveBtn.addEventListener('click', () => {
    const entries = lineup.map((a, i) => ({
      id: a.id,
      name: a.name,
      monthlyListeners: parseInt(inputs[i].value.replace(/,/g, ''), 10),
    }));
    onSubmit(entries);
  });
}

// --- Spotify Connect View ---

export function renderSpotifyConnect(onConnect, onSkip, onBack, showConnected = false, hideSkip = false) {
  app.innerHTML = `
    <div class="view view-onboarding">
      <div class="onboarding-card">
        <button class="btn-back" id="spotify-back-btn">← Back</button>

        <div class="onboarding-header">
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

        ${hideSkip ? '' : `<button class="btn-secondary" id="spotify-skip-btn" style="margin-top:1.25rem;width:100%">Skip for now</button>`}
      </div>
    </div>
  `;

  document.getElementById('spotify-back-btn').addEventListener('click', onBack);
  document.getElementById('spotify-skip-btn')?.addEventListener('click', onSkip);

  const connectBtn = document.getElementById('spotify-connect-btn');

  function showConnectedState(cb) {
    connectBtn.classList.add('spotify-connected');
    connectBtn.innerHTML = `
      <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18" style="flex-shrink:0">
        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
      </svg>
      Spotify Connected
    `;
    setTimeout(cb, 900);
  }

  if (showConnected) {
    showConnectedState(onConnect);
    return;
  }

  connectBtn.addEventListener('click', () => onConnect());
}

// --- Draft View ---

export function renderDraft(artists, onLockIn, onBack, preSelected = [], profile = null, onProfile = null) {
  const preSelectedIds = new Set(preSelected.map(a => a.id));
  const isEditing = preSelected.length > 0;
  app.innerHTML = `
    <div class="view view-draft">
      <div class="draft-topbar">
        <button class="btn-back draft-topbar-back" id="draft-back-btn">← Back</button>
        ${profile ? profileChipHtml(profile) : ''}
      </div>
      <div class="draft-container">
        <h1>${isEditing ? 'Edit Your Lineup' : 'Draft Your Lineup'}</h1>
        <p class="tagline">Draft up to 3 artists from your recent listening history.</p>
        <p class="draft-count" id="draft-count">0 / 3 selected</p>
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
    countEl.textContent = `${n} / 3 selected`;
    footerCount.textContent = `${n} / 3 selected`;
    lockBtn.disabled = n < 3;
  }

  updateCount();

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const cb = card.querySelector('input[type="checkbox"]');
      const already = card.classList.contains('selected');
      const total = [...cards].filter(c => c.classList.contains('selected')).length;
      if (!already && total >= 3) return;
      card.classList.toggle('selected', !already);
      cb.checked = !already;
      updateCount();
    });
  });

  document.getElementById('draft-back-btn').addEventListener('click', onBack);
  if (onProfile) {
    document.getElementById('profile-chip-btn')?.addEventListener('click', onProfile);
  }

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
    rows.push(`
      <div class="artist-stat-row">
        <span class="artist-stat-week">Wk ${w}</span>
        <span class="artist-stat-listeners">${listeners != null ? fmtListeners(listeners) : '—'}</span>
      </div>
    `);
    if (listeners != null) prevListeners = listeners;
  }
  return rows.join('');
}

export function renderScore({ results, totalPoints, standings, league, role, leagueStarted, snapshots, onNewDraft, onLogout, onEditLineup, onDraft, profile, onProfile, onLeagueSettings }) {
  const isCommissioner = role === 'commissioner';
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
          ${profile ? profileChipHtml(profile) : ''}
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
              <div class="lh-league-meta-row">
                <div class="lh-role-badge lh-role-badge--${isCommissioner ? 'commissioner' : 'member'}">${isCommissioner ? 'Commissioner' : 'Member'}</div>
                ${isCommissioner ? `<button class="lh-settings-link" id="lh-settings-btn">League Settings</button>` : ''}
              </div>
            </div>
          </div>
          <div class="lh-score-block">
            ${leagueStarted
              ? `<div class="lh-score-pts">${totalPoints}<span class="lh-score-pts-label"> pts</span></div>
            <div class="lh-score-rank">#${userRank} of ${standings.length}</div>`
              : league.daysUntilStart > 0
                ? `<div class="lh-score-pts lh-score-pts--pending">—</div>
            <div class="lh-score-rank">Starts in ${league.daysUntilStart}d</div>`
                : `<div class="lh-score-pts lh-score-pts--pending">—</div>
            <div class="lh-score-rank">Week ${league.currentWeek}${league.durationWeeks ? ' of ' + league.durationWeeks : ''}</div>`
            }
          </div>
        </div>
      </div>

      <div class="lh-content">

        <section class="lh-section">
          <div class="lh-section-header">
            <h3 class="lh-section-title">My Lineup</h3>
            <div class="lh-section-header-actions">
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
              const ptsCls = !leagueStarted ? 'lh-pts-flat' : r.points > 0 ? 'lh-pts-up' : 'lh-pts-zero';
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
                        const deltaStr = r.change === 0 ? '±0' : `${r.change > 0 ? '+' : '-'}${deltaAbs}`;
                        const deltaCls = r.change > 0 ? 'change-up' : r.change < 0 ? 'change-down' : 'change-flat';
                        return `<div class="lh-artist-listeners"><span class="${deltaCls}">${deltaStr}</span> monthly listeners</div>`;
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
          `}
        </section>

        <section class="lh-section">
          <h3 class="lh-section-title">Standings</h3>
          <ul class="standings-list">
            ${standings.map((entry, i) => `
              <li class="standings-row${entry.isYou ? ' standings-row--you' : ''}">
                <span class="standings-rank">${leagueStarted ? i + 1 : '—'}</span>
                <span class="standings-name">${escapeHtml(entry.handle)}${entry.isYou ? ' <span class="standings-you-tag">you</span>' : ''}</span>
                <span class="standings-pts">${entry.totalPoints} <span class="standings-pts-label">pts</span></span>
              </li>
            `).join('')}
          </ul>
        </section>
      </div>
    </div>
  `;

  if (onProfile) {
    document.getElementById('profile-chip-btn')?.addEventListener('click', onProfile);
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

  if (isCommissioner && onLeagueSettings) {
    document.getElementById('lh-settings-btn')?.addEventListener('click', onLeagueSettings);
  }
}

// --- League Settings View ---

export function renderLeagueSettings(league, { onBack, onSave, hasBaseline, onEnterBaseline, nextWeekNumber, onEnterWeekly }) {
  const currentName = league?.name ?? '';
  const currentStartDate = league?.scheduledStartDate ?? '';

  app.innerHTML = `
    <div class="view view-settings">
      <div class="settings-card">
        <button class="btn-back" id="ls-back-btn">← Back</button>

        <h1 class="settings-title">League Settings</h1>

        <div class="settings-section">
          <div class="settings-section-title">Details</div>
          <div class="settings-field">
            <label class="settings-field-label" for="ls-name-input">League Name</label>
            <input
              type="text"
              id="ls-name-input"
              class="settings-handle-input-field"
              value="${escapeHtml(currentName)}"
              maxlength="40"
              autocomplete="off"
              spellcheck="false"
            />
          </div>
          <div class="settings-field">
            <label class="settings-field-label" for="ls-start-date-input">Start Date</label>
            <input
              type="date"
              id="ls-start-date-input"
              class="settings-handle-input-field"
              value="${escapeHtml(currentStartDate)}"
            />
          </div>
          <button class="settings-save-btn" id="ls-save-btn" disabled>Save Changes</button>
        </div>

        <div class="settings-section">
          <div class="settings-section-title">Listener Data</div>
          ${onEnterBaseline ? `
            <p class="settings-invite-hint">Enter Week 1 listener counts to start scoring.</p>
            <button class="settings-save-btn" id="ls-baseline-btn">Enter Week 1 Baseline →</button>
          ` : onEnterWeekly ? `
            <p class="settings-invite-hint">Week ${nextWeekNumber} data is ready to enter.</p>
            <button class="settings-save-btn" id="ls-weekly-btn">Enter Week ${nextWeekNumber} →</button>
          ` : `
            <p class="settings-invite-hint">All listener data is up to date.</p>
          `}
        </div>

        <div class="settings-section">
          <div class="settings-section-title">Invite Others</div>
          <p class="settings-invite-hint">Share this code with friends to invite them to your league.</p>
          <div class="settings-invite-row">
            <span class="settings-invite-code">${escapeHtml(league?.inviteCode ?? '—')}</span>
            <button class="btn-copy-code" id="ls-copy-code-btn">Copy</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('ls-back-btn').addEventListener('click', onBack);

  const nameInput = document.getElementById('ls-name-input');
  const startDateInput = document.getElementById('ls-start-date-input');
  const saveBtn = document.getElementById('ls-save-btn');

  function checkDirty() {
    saveBtn.disabled = nameInput.value.trim() === currentName && startDateInput.value === currentStartDate;
  }
  nameInput.addEventListener('input', checkDirty);
  startDateInput.addEventListener('change', checkDirty);

  saveBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (!name) return;
    onSave({ name, scheduledStartDate: startDateInput.value || null });
  });

  if (onEnterBaseline) {
    document.getElementById('ls-baseline-btn')?.addEventListener('click', onEnterBaseline);
  }
  if (onEnterWeekly) {
    document.getElementById('ls-weekly-btn')?.addEventListener('click', onEnterWeekly);
  }

  const copyBtn = document.getElementById('ls-copy-code-btn');
  if (copyBtn && league?.inviteCode) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(league.inviteCode).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
      });
    });
  }
}

// --- Settings View ---

export function renderSettings(profile, { onBack, onSignOut, onStartOver, onSpotifyConnect, onSaveProfile }) {
  const spotifyConnected = profile?.spotifyConnected === true;
  const currentHandle = (profile?.handle ?? '@').replace('@', '');
  app.innerHTML = `
    <div class="view view-settings">
      <div class="settings-card">
        <button class="btn-back" id="settings-back-btn">← Back</button>

        <div class="settings-profile-block">
          ${userAvatarHtml(profile, 'settings-avatar')}
          <div class="settings-handle">${escapeHtml(profile?.handle ?? '@you')}</div>
        </div>

        <div class="settings-section">
          <div class="settings-section-title">Profile</div>
          <div class="settings-field">
            <label class="settings-field-label" for="settings-handle-input">Handle</label>
            <div class="settings-handle-wrap">
              <span class="settings-at">@</span>
              <input
                type="text"
                id="settings-handle-input"
                class="settings-handle-input-field"
                value="${escapeHtml(currentHandle)}"
                maxlength="24"
                autocomplete="off"
                spellcheck="false"
              />
            </div>
          </div>
          <button class="settings-save-btn" id="settings-save-btn" disabled>Save changes</button>
        </div>

        <div class="settings-section">
          <div class="settings-section-title">Spotify</div>
          <div class="settings-row">
            <span class="settings-row-label">Connection</span>
            ${spotifyConnected
              ? `<span class="settings-row-value settings-spotify-status--connected">Connected</span>`
              : `<button class="settings-row-action" id="settings-spotify-btn">Connect</button>`
            }
          </div>
        </div>

        <div class="settings-section">
          <div class="settings-section-title">Account</div>
          <button class="settings-danger-btn" id="settings-signout-btn">Sign Out</button>
          <button class="settings-danger-btn settings-danger-btn--destructive" id="settings-startover-btn">Start Over (erase all data)</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('settings-back-btn').addEventListener('click', onBack);
  document.getElementById('settings-signout-btn').addEventListener('click', onSignOut);
  document.getElementById('settings-startover-btn').addEventListener('click', onStartOver);
  if (!spotifyConnected) {
    document.getElementById('settings-spotify-btn')?.addEventListener('click', onSpotifyConnect);
  }

  const handleInput = document.getElementById('settings-handle-input');
  const saveBtn = document.getElementById('settings-save-btn');

  handleInput.addEventListener('input', () => {
    handleInput.value = handleInput.value.replace(/[^a-zA-Z0-9_]/g, '');
    saveBtn.disabled = handleInput.value.trim() === currentHandle;
  });

  saveBtn.addEventListener('click', () => {
    const handle = handleInput.value.trim();
    if (handle.length < 2) return;
    onSaveProfile({ handle: `@${handle}` });
  });
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
