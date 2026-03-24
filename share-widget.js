// share-widget.js — floating share FAB, always visible on every screen
// Shares Zephyr or any app via Web Share API, SMS, Email, or copy link.
// Privacy: nothing tracked, no server calls, pure device-to-device.

const ZephyrShare = (() => {
  const DEFAULT_CONTEXT = {
    name: 'Zephyr',
    url: 'https://cadger808.codeberg.page/zephyr',
    text: 'The free app store — no gatekeeping, no fees. Install everything in one tap.',
    icon: './icons/icon-192.png'
  };

  let context = { ...DEFAULT_CONTEXT };
  let panelOpen = false;

  function init() {
    const fab = document.getElementById('share-fab');
    if (!fab) return;

    fab.addEventListener('click', e => {
      e.stopPropagation();
      togglePanel();
    });

    document.addEventListener('click', e => {
      const panel = document.getElementById('share-panel');
      if (panel && panelOpen && !panel.contains(e.target) && e.target !== fab) {
        closePanel();
      }
    });

    // Wire static share buttons in #screen-share
    document.getElementById('btn-native-share')?.addEventListener('click', () => nativeShare());
    document.getElementById('btn-copy-link')?.addEventListener('click', () => copyLink());
    document.getElementById('btn-sms-share')?.addEventListener('click', () => smsShare());
    document.getElementById('btn-email-share')?.addEventListener('click', () => emailShare());
  }

  function togglePanel() {
    panelOpen ? closePanel() : openPanel();
  }

  function openPanel() {
    const panel = document.getElementById('share-panel');
    if (!panel) return;
    panel.innerHTML = buildPanelHTML();
    panel.classList.add('open');
    panelOpen = true;
    // Wire panel buttons
    panel.querySelector('[data-share="native"]')?.addEventListener('click', () => { nativeShare(); closePanel(); });
    panel.querySelector('[data-share="copy"]')?.addEventListener('click', () => { copyLink(); closePanel(); });
    panel.querySelector('[data-share="sms"]')?.addEventListener('click', () => { smsShare(); closePanel(); });
    panel.querySelector('[data-share="email"]')?.addEventListener('click', () => { emailShare(); closePanel(); });
  }

  function closePanel() {
    const panel = document.getElementById('share-panel');
    if (panel) panel.classList.remove('open');
    panelOpen = false;
  }

  function buildPanelHTML() {
    const hasNativeShare = !!navigator.share;
    return `
      <div class="share-panel-header">
        <img src="${escHtml(context.icon)}" alt="${escHtml(context.name)}" class="share-panel-icon"
             onerror="this.src='./icons/icon-192.png'">
        <div>
          <strong>${escHtml(context.name)}</strong>
          <p class="share-panel-url">${escHtml(shortenUrl(context.url))}</p>
        </div>
      </div>
      <div class="share-panel-btns">
        ${hasNativeShare ? `
          <button class="share-option primary" data-share="native">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            Share Now
          </button>
        ` : ''}
        <button class="share-option" data-share="copy">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Copy Link
        </button>
        <button class="share-option" data-share="sms">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Text / SMS
        </button>
        <button class="share-option" data-share="email">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          Email
        </button>
      </div>
      <p class="share-panel-privacy">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        No data shared. Zero tracking.
      </p>
    `;
  }

  async function nativeShare(overrideContext) {
    const ctx = overrideContext || context;
    if (!navigator.share) {
      copyLink(ctx);
      ZephyrApp.showToast('Link copied — paste to share!', 'success');
      return;
    }
    try {
      await navigator.share({
        title: ctx.name,
        text: ctx.text,
        url: ctx.url
      });
    } catch (e) {
      if (e.name !== 'AbortError') {
        // User cancelled — no action needed
        copyLink(ctx);
      }
    }
  }

  async function copyLink(overrideContext) {
    const ctx = overrideContext || context;
    try {
      await navigator.clipboard.writeText(ctx.url);
      ZephyrApp.showToast('Link copied!', 'success');
    } catch (_) {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = ctx.url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      ta.remove();
      ZephyrApp.showToast('Link copied!', 'success');
    }
  }

  function smsShare(overrideContext) {
    const ctx = overrideContext || context;
    const msg = encodeURIComponent(`Install ${ctx.name} free — no app store needed:\n${ctx.url}`);
    window.location.href = `sms:?body=${msg}`;
  }

  function emailShare(overrideContext) {
    const ctx = overrideContext || context;
    const subject = encodeURIComponent(`Check out ${ctx.name} — free, no app store`);
    const body = encodeURIComponent(
      `Hey!\n\nI thought you'd like this app: ${ctx.name}\n\n${ctx.text}\n\nInstall it free here (no app store needed):\n${ctx.url}\n\nShared via Zephyr — the free app network`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  // Share a specific app — called from store cards
  function shareApp(app) {
    const ctx = {
      name: app.name,
      url: app.pwa,
      text: app.tagline || `Check out ${app.name}`,
      icon: app.icon
    };
    nativeShare(ctx);
  }

  // Set context when user focuses on a specific app
  function setContext(app) {
    context = {
      name: app.name,
      url: app.pwa,
      text: app.tagline,
      icon: app.icon
    };
  }

  function resetContext() {
    context = { ...DEFAULT_CONTEXT };
  }

  function shortenUrl(url) {
    try {
      const u = new URL(url);
      return u.hostname + u.pathname;
    } catch (_) {
      return url;
    }
  }

  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  return { init, shareApp, setContext, resetContext, nativeShare, copyLink, smsShare, emailShare };
})();

document.addEventListener('DOMContentLoaded', () => ZephyrShare.init());
window.ZephyrShare = ZephyrShare;
