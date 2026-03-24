// widget.js — Zephyr embed widget
// Drop one <script> tag in ANY app and Zephyr lives there instantly.
// Self-contained IIFE. No dependencies. No data sent anywhere.
// Aloha from Pearl City! ⚡

(function ZephyrWidget() {
  'use strict';

  const REGISTRY_URL = 'https://cadger808.codeberg.page/zephyr/apps.json';
  const ZEPHYR_URL   = 'https://cadger808.codeberg.page/zephyr';
  const ZEPHYR_ICON  = 'https://cadger808.codeberg.page/zephyr/icons/icon-192.png';

  // Don't double-init
  if (document.getElementById('zephyr-widget-root')) return;

  const CYAN = '#06B6D4';
  const BG   = '#0A0F1E';
  const BG2  = '#111827';
  const BORD = '#1F2937';

  let apps = [];
  let open = false;
  let deferredPrompt = null;

  // ── Capture install prompt before we suppress it ──
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    if (badge) badge.style.display = 'flex';
  });

  // ── Styles ──
  const style = document.createElement('style');
  style.textContent = `
    #zephyr-widget-root *{box-sizing:border-box;margin:0;padding:0}
    #zephyr-fab{
      position:fixed;bottom:1.2rem;left:1.2rem;z-index:2147483646;
      width:48px;height:48px;
      background:linear-gradient(135deg,#06B6D4,#0EA5E9);
      border-radius:50%;border:none;cursor:pointer;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 4px 16px rgba(6,182,212,0.45),0 2px 6px rgba(0,0,0,0.4);
      transition:transform .18s cubic-bezier(.4,0,.2,1);
      font-size:22px;
    }
    #zephyr-fab:hover{transform:scale(1.08)}
    #zephyr-fab:active{transform:scale(0.93)}
    #zephyr-badge{
      position:absolute;top:-3px;right:-3px;
      width:16px;height:16px;
      background:#EF4444;border-radius:50%;
      display:none;align-items:center;justify-content:center;
      font-size:9px;font-weight:700;color:#fff;
    }
    #zephyr-panel{
      position:fixed;bottom:5rem;left:1.2rem;z-index:2147483645;
      width:min(290px,calc(100vw - 2.4rem));
      background:${BG2};
      border:1px solid rgba(6,182,212,0.35);
      border-radius:16px;
      box-shadow:0 16px 48px rgba(0,0,0,0.55);
      overflow:hidden;
      transform:scale(.88) translateY(12px);
      transform-origin:bottom left;
      opacity:0;pointer-events:none;
      transition:transform .2s cubic-bezier(.4,0,.2,1),opacity .2s;
      font-family:system-ui,-apple-system,'Segoe UI',sans-serif;
      color:#F3F4F6;
    }
    #zephyr-panel.zw-open{transform:scale(1) translateY(0);opacity:1;pointer-events:auto}
    .zw-head{
      display:flex;align-items:center;gap:.65rem;
      padding:.85rem 1rem;
      border-bottom:1px solid ${BORD};
      background:linear-gradient(90deg,rgba(6,182,212,.08),transparent);
    }
    .zw-head-logo{
      width:36px;height:36px;
      background:linear-gradient(135deg,#06B6D4,#0EA5E9,#8B5CF6);
      border-radius:9px;display:flex;align-items:center;justify-content:center;
      font-size:18px;flex-shrink:0;
    }
    .zw-head-name{font-size:.95rem;font-weight:800;
      background:linear-gradient(90deg,#06B6D4,#38BDF8);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
    }
    .zw-head-sub{font-size:.72rem;color:#9CA3AF;margin-top:1px}
    .zw-close{
      margin-left:auto;background:none;border:none;cursor:pointer;
      color:#9CA3AF;font-size:1.1rem;padding:.25rem .4rem;border-radius:6px;
    }
    .zw-install-cta{
      display:flex;align-items:center;gap:.6rem;
      padding:.75rem 1rem;
      background:rgba(6,182,212,.1);
      border-bottom:1px solid rgba(6,182,212,.15);
      cursor:pointer;
    }
    .zw-install-cta span{flex:1;font-size:.82rem;color:#67E8F9;font-weight:600}
    .zw-install-cta button{
      padding:.35rem .75rem;
      background:#06B6D4;color:#000;
      font-weight:700;font-size:.78rem;
      border:none;border-radius:7px;cursor:pointer;
      flex-shrink:0;
    }
    .zw-apps{padding:.5rem}
    .zw-app-row{
      display:flex;align-items:center;gap:.65rem;
      padding:.55rem .5rem;border-radius:10px;
      cursor:pointer;transition:background .12s;
    }
    .zw-app-row:hover{background:rgba(255,255,255,.05)}
    .zw-app-icon{
      width:36px;height:36px;border-radius:9px;
      object-fit:cover;flex-shrink:0;
      background:${BORD};
    }
    .zw-app-info{flex:1;min-width:0}
    .zw-app-name{font-size:.85rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .zw-app-cat{font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.04em}
    .zw-app-btn{
      padding:.32rem .65rem;
      border:none;border-radius:7px;
      font-weight:700;font-size:.76rem;cursor:pointer;
      flex-shrink:0;
      color:#000;
      transition:opacity .12s;
    }
    .zw-app-btn:active{opacity:.8}
    .zw-footer{
      padding:.55rem .85rem;
      border-top:1px solid ${BORD};
      display:flex;align-items:center;gap:.4rem;
      font-size:.72rem;color:#9CA3AF;
    }
    .zw-footer a{color:#06B6D4;text-decoration:none}
    .zw-share-row{
      display:flex;gap:.4rem;padding:.5rem 1rem .65rem;
    }
    .zw-share-btn{
      flex:1;padding:.5rem .5rem;
      background:${BORD};border:1px solid #374151;
      border-radius:8px;color:#9CA3AF;font-size:.77rem;font-weight:600;cursor:pointer;
      display:flex;align-items:center;justify-content:center;gap:.35rem;
      transition:background .12s,color .12s;
    }
    .zw-share-btn:hover{background:#253047;color:#F3F4F6}
  `;
  document.head.appendChild(style);

  // ── DOM ──
  const root = document.createElement('div');
  root.id = 'zephyr-widget-root';

  const fab = document.createElement('button');
  fab.id = 'zephyr-fab';
  fab.setAttribute('aria-label', 'Zephyr — install & share apps');
  fab.innerHTML = `⚡<span id="zephyr-badge"></span>`;
  root.appendChild(fab);

  const panel = document.createElement('div');
  panel.id = 'zephyr-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Zephyr app installer');
  root.appendChild(panel);

  document.body.appendChild(root);

  const badge = document.getElementById('zephyr-badge');

  // ── Render panel ──
  function renderPanel() {
    const hostOrigin = window.location.hostname;
    const visible = apps.filter(a => !a.self && !a.pwa?.includes(hostOrigin));

    const installSection = deferredPrompt ? `
      <div class="zw-install-cta" id="zw-install-zephyr">
        <span>⚡ Add Zephyr to home screen</span>
        <button>Install</button>
      </div>
    ` : '';

    const appRows = visible.slice(0, 6).map(a => `
      <div class="zw-app-row" data-pwa="${esc(a.pwa)}" data-apk="${esc(a.apk || '')}">
        <img class="zw-app-icon" src="${esc(a.icon)}" alt="${esc(a.name)}"
             onerror="this.src='${ZEPHYR_ICON}'">
        <div class="zw-app-info">
          <div class="zw-app-name">${esc(a.name)}</div>
          <div class="zw-app-cat" style="color:${esc(a.color || CYAN)}">${esc(a.category)}</div>
        </div>
        <button class="zw-app-btn" style="background:${esc(a.color || CYAN)}" data-pwa="${esc(a.pwa)}">
          Get
        </button>
      </div>
    `).join('');

    panel.innerHTML = `
      <div class="zw-head">
        <div class="zw-head-logo">⚡</div>
        <div>
          <div class="zw-head-name">Zephyr</div>
          <div class="zw-head-sub">The free app network</div>
        </div>
        <button class="zw-close" id="zw-close-btn" aria-label="Close">✕</button>
      </div>
      ${installSection}
      <div class="zw-apps">${appRows || '<p style="padding:.8rem;font-size:.83rem;color:#9CA3AF;text-align:center">Loading apps…</p>'}</div>
      <div class="zw-share-row">
        <button class="zw-share-btn" id="zw-share-zephyr">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          Share
        </button>
        <button class="zw-share-btn" id="zw-sms-zephyr">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Text
        </button>
        <button class="zw-share-btn" id="zw-copy-zephyr">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Copy
        </button>
      </div>
      <div class="zw-footer">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        No data shared ·
        <a href="${ZEPHYR_URL}" target="_blank" rel="noopener noreferrer">zephyr ⚡</a>
      </div>
    `;

    wirePanel();
  }

  function wirePanel() {
    document.getElementById('zw-close-btn')?.addEventListener('click', closePanel);

    // App row: open PWA
    panel.querySelectorAll('.zw-app-row').forEach(row => {
      row.addEventListener('click', e => {
        if (e.target.classList.contains('zw-app-btn')) return;
        const pwa = row.dataset.pwa;
        if (pwa) window.open(pwa, '_blank', 'noopener,noreferrer');
      });
    });
    panel.querySelectorAll('.zw-app-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const pwa = btn.dataset.pwa;
        if (pwa) window.open(pwa, '_blank', 'noopener,noreferrer');
      });
    });

    // Install Zephyr
    document.getElementById('zw-install-zephyr')?.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      if (badge) badge.style.display = 'none';
    });

    // Share buttons
    document.getElementById('zw-share-zephyr')?.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({ title: 'Zephyr', text: 'Free app store — no gatekeeping', url: ZEPHYR_URL }).catch(() => {});
      } else {
        copyToClipboard(ZEPHYR_URL);
      }
    });
    document.getElementById('zw-sms-zephyr')?.addEventListener('click', () => {
      const msg = encodeURIComponent(`Install apps free — no app store needed:\n${ZEPHYR_URL}`);
      window.location.href = `sms:?body=${msg}`;
    });
    document.getElementById('zw-copy-zephyr')?.addEventListener('click', () => copyToClipboard(ZEPHYR_URL));
  }

  function copyToClipboard(text) {
    navigator.clipboard?.writeText(text).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta); ta.focus(); ta.select();
      document.execCommand('copy'); ta.remove();
    });
  }

  function openPanel()  { renderPanel(); panel.classList.add('zw-open'); open = true; }
  function closePanel() { panel.classList.remove('zw-open'); open = false; }
  function togglePanel(){ open ? closePanel() : openPanel(); }

  fab.addEventListener('click', e => { e.stopPropagation(); togglePanel(); });
  document.addEventListener('click', e => {
    if (open && !panel.contains(e.target) && e.target !== fab) closePanel();
  });

  // ── Load app registry ──
  async function loadApps() {
    try {
      const res = await fetch(REGISTRY_URL);
      const data = await res.json();
      apps = data.apps || [];
    } catch (_) {
      // Silent fail — panel shows empty state
    }
  }

  function esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  loadApps();
})();
