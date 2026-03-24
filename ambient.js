// ambient.js — tap-to-listen AI suggestions, rule-based, fully local
// Privacy: speech is processed on-device only. NOTHING sent to any server.
// #ASSUMPTION: SpeechRecognition API available in Chrome Android; graceful fallback otherwise.

const ZephyrAmbient = (() => {
  const KEYWORD_MAP = {
    // Health / beauty
    skin: 'glowai', beauty: 'glowai', face: 'glowai', acne: 'glowai',
    glow: 'glowai', moisturizer: 'glowai', sunscreen: 'glowai', dermatologist: 'glowai',
    // Travel
    travel: 'archertravel', trip: 'archertravel', flight: 'archertravel',
    hotel: 'archertravel', vacation: 'archertravel', passport: 'archertravel', visa: 'archertravel',
    // Legal
    legal: 'courtaide', court: 'courtaide', lawyer: 'courtaide', lawsuit: 'courtaide',
    attorney: 'courtaide', judge: 'courtaide', case: 'courtaide', filing: 'courtaide',
    // Farm
    farm: 'farmsense', crop: 'farmsense', plant: 'farmsense', soil: 'farmsense',
    harvest: 'farmsense', irrigation: 'farmsense', fertilizer: 'farmsense', garden: 'farmsense',
    // Shopping
    shopping: 'time-save-shopping', grocery: 'time-save-shopping', food: 'time-save-shopping',
    recipe: 'time-save-shopping', meal: 'time-save-shopping', store: 'time-save-shopping',
    market: 'time-save-shopping', buy: 'time-save-shopping'
  };

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let listening = false;
  let enabled = false;

  function init() {
    enabled = localStorage.getItem('zephyr_ambient') === '1';
    updateMicButton();

    document.getElementById('mic-btn')?.addEventListener('click', toggleListen);
    document.getElementById('ambient-toggle')?.addEventListener('change', e => {
      enabled = e.target.checked;
      localStorage.setItem('zephyr_ambient', enabled ? '1' : '0');
      if (!enabled && listening) stopListening();
      updateMicButton();
    });

    // Sync toggle state
    const toggle = document.getElementById('ambient-toggle');
    if (toggle) toggle.checked = enabled;
  }

  function toggleListen() {
    if (!enabled) {
      ZephyrApp.showToast('Enable ambient suggestions in Settings first', 'info');
      return;
    }
    if (!SpeechRecognition) {
      ZephyrApp.showToast('Speech recognition not supported in this browser', 'warn');
      return;
    }
    listening ? stopListening() : startListening();
  }

  function startListening() {
    if (listening) return;
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    recognition.continuous = false;

    recognition.onstart = () => {
      listening = true;
      updateMicButton(true);
      ZephyrApp.showToast('Listening... say what you need', 'info', 5000);
    };

    recognition.onresult = event => {
      const transcripts = Array.from(event.results[0]).map(r => r.transcript.toLowerCase());
      handleTranscript(transcripts.join(' '));
    };

    recognition.onerror = e => {
      if (e.error !== 'aborted' && e.error !== 'no-speech') {
        ZephyrApp.showToast('Could not hear you — tap mic to try again', 'warn');
      }
      stopListening();
    };

    recognition.onend = () => stopListening();
    recognition.start();
  }

  function stopListening() {
    if (recognition) {
      try { recognition.abort(); } catch (_) {}
      recognition = null;
    }
    listening = false;
    updateMicButton(false);
  }

  function handleTranscript(text) {
    // Rule-based local matching — no API call, no data sent anywhere
    const words = text.split(/\s+/);
    const matches = new Map();

    for (const word of words) {
      const clean = word.replace(/[^a-z]/g, '');
      if (KEYWORD_MAP[clean]) {
        const appId = KEYWORD_MAP[clean];
        matches.set(appId, (matches.get(appId) || 0) + 1);
      }
    }

    if (!matches.size) {
      ZephyrApp.showToast(`I heard "${text}" — try mentioning: travel, farm, legal, shopping, or skin`, 'info', 5000);
      return;
    }

    // Sort by hit count, show top suggestion
    const sorted = [...matches.entries()].sort((a, b) => b[1] - a[1]);
    const topId = sorted[0][0];
    const app = window.ZephyrStore?.getApp(topId);
    if (app) showSuggestion(app, text);
  }

  function showSuggestion(app, trigger) {
    const existing = document.getElementById('ambient-suggestion');
    if (existing) existing.remove();

    const card = document.createElement('div');
    card.id = 'ambient-suggestion';
    card.className = 'suggestion-card';
    card.style.setProperty('--accent', app.color || '#06B6D4');
    card.innerHTML = `
      <div class="suggestion-inner">
        <img src="${escHtml(app.icon)}" alt="${escHtml(app.name)}" class="suggestion-icon"
             onerror="this.src='./icons/icon-192.png'">
        <div class="suggestion-text">
          <strong>Try ${escHtml(app.name)}</strong>
          <p>${escHtml(app.tagline)}</p>
        </div>
        <div class="suggestion-actions">
          <button class="suggestion-install">Install</button>
          <button class="suggestion-dismiss">&times;</button>
        </div>
      </div>
    `;

    document.body.appendChild(card);
    requestAnimationFrame(() => card.classList.add('visible'));

    card.querySelector('.suggestion-install').addEventListener('click', () => {
      ZephyrInstaller.promptInstall(app);
      dismissSuggestion(card);
    });
    card.querySelector('.suggestion-dismiss').addEventListener('click', () => dismissSuggestion(card));

    // Auto-dismiss after 12 seconds
    setTimeout(() => dismissSuggestion(card), 12000);
  }

  function dismissSuggestion(card) {
    if (!card || !card.parentNode) return;
    card.classList.remove('visible');
    setTimeout(() => card.remove(), 300);
  }

  function updateMicButton(active = false) {
    const btn = document.getElementById('mic-btn');
    if (!btn) return;
    btn.classList.toggle('listening', active);
    btn.classList.toggle('disabled', !enabled);
    btn.setAttribute('aria-label', active ? 'Stop listening' : 'Tap to listen');
    btn.title = enabled ? (active ? 'Stop' : 'Tap to suggest apps') : 'Enable in Settings';
  }

  function isEnabled() { return enabled; }

  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  return { init, toggleListen, isEnabled };
})();

document.addEventListener('DOMContentLoaded', () => ZephyrAmbient.init());
window.ZephyrAmbient = ZephyrAmbient;
