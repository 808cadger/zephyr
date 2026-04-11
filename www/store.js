// store.js — Zephyr app catalog, auto-renders with cached icons
// Privacy-first: apps.json fetched from Codeberg public API only, nothing tracked.

const ZephyrStore = (() => {
  const APPS_URL = './apps.json';
  let allApps = [];
  let activeCategory = 'All';
  let searchQuery = '';

  async function init() {
    await loadApps();
    setupSearch();
    setupCategories();
  }

  async function loadApps() {
    try {
      // SW serves from cache-first; network-first for apps.json keeps catalog fresh
      const res = await fetch(APPS_URL);
      const data = await res.json();
      allApps = data.apps || [];
    } catch (_) {
      // Offline — use whatever SW cached
      allApps = getFallbackApps();
      ZephyrApp.showToast('Showing cached catalog — offline mode', 'warn');
    }
    renderGrid('catalog-grid', allApps);
    renderFeatured();
    updateStats();
  }

  function renderFeatured() {
    const featured = allApps.filter(a => a.featured && !a.self);
    renderGrid('featured-grid', featured.slice(0, 4));
  }

  function renderGrid(containerId, apps) {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (!apps.length) {
      el.innerHTML = '<p class="empty-state">No apps found.</p>';
      return;
    }
    el.innerHTML = apps.map(buildCard).join('');
    // Wire up buttons after render
    el.querySelectorAll('[data-install]').forEach(btn => {
      btn.addEventListener('click', () => {
        const appId = btn.dataset.install;
        const app = allApps.find(a => a.id === appId);
        if (app) ZephyrInstaller.promptInstall(app);
      });
    });
    el.querySelectorAll('[data-share-app]').forEach(btn => {
      btn.addEventListener('click', () => {
        const appId = btn.dataset.shareApp;
        const app = allApps.find(a => a.id === appId);
        if (app && window.ZephyrShare) ZephyrShare.shareApp(app);
      });
    });
    el.querySelectorAll('[data-apk]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const url = link.dataset.apk;
        window.open(url, '_blank', 'noopener,noreferrer');
      });
    });
  }

  function buildCard(app) {
    // #ASSUMPTION: icon URL is reachable or cached by SW
    const safeIcon = escHtml(app.icon);
    const safeName = escHtml(app.name);
    const safeTagline = escHtml(app.tagline);
    const safeColor = escHtml(app.color || '#06B6D4');
    const safePwa = escHtml(app.pwa);
    return `
      <div class="app-card" data-id="${escHtml(app.id)}" style="--accent:${safeColor}">
        <div class="app-card-top">
          <img class="app-icon"
               src="${safeIcon}"
               alt="${safeName} icon"
               loading="lazy"
               onerror="this.src='./icons/icon-192.png'">
          <div class="app-info">
            <h3 class="app-name">${safeName}</h3>
            <span class="app-category">${escHtml(app.category)}</span>
          </div>
          <button class="icon-btn share-card-btn" data-share-app="${escHtml(app.id)}" title="Share ${safeName}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          </button>
        </div>
        <p class="app-tagline">${safeTagline}</p>
        <div class="app-card-actions">
          <button class="btn-install" data-install="${escHtml(app.id)}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Install Free
          </button>
          ${app.apk ? `<button class="btn-apk" data-apk="${escHtml(app.apk)}">APK</button>` : ''}
        </div>
      </div>
    `;
  }

  function setupSearch() {
    const input = document.getElementById('search-input');
    if (!input) return;
    input.addEventListener('input', e => {
      searchQuery = e.target.value.trim().toLowerCase();
      applyFilters();
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') { input.value = ''; searchQuery = ''; applyFilters(); }
    });
  }

  function setupCategories() {
    document.querySelectorAll('[data-category]').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('[data-category]').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeCategory = pill.dataset.category;
        applyFilters();
      });
    });
  }

  function applyFilters() {
    let filtered = allApps.filter(a => !a.self); // don't show Zephyr in its own catalog
    if (activeCategory !== 'All') {
      filtered = filtered.filter(a => a.category === activeCategory);
    }
    if (searchQuery) {
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(searchQuery) ||
        a.tagline.toLowerCase().includes(searchQuery) ||
        a.category.toLowerCase().includes(searchQuery)
      );
    }
    renderGrid('catalog-grid', filtered);
  }

  function updateStats() {
    const nonSelf = allApps.filter(a => !a.self);
    const el = document.getElementById('app-count');
    if (el) el.textContent = nonSelf.length;
    const heroEl = document.getElementById('app-count-hero');
    if (heroEl) heroEl.textContent = nonSelf.length;
  }

  function getApp(id) { return allApps.find(a => a.id === id); }
  function getAll() { return allApps; }

  // Hardcoded fallback — shown if SW cache also misses (first load, no network)
  function getFallbackApps() {
    return [
      { id: 'glowai', name: 'GlowAI', tagline: 'AI skin analysis', category: 'Health',
        icon: './icons/icon-192.png', pwa: 'https://cadger808.codeberg.page/glowai',
        apk: 'https://codeberg.org/cadger808/glowai/releases', color: '#C4788A', featured: true },
      { id: 'farmsense', name: 'FarmSense', tagline: 'AI crop monitoring', category: 'Agriculture',
        icon: './icons/icon-192.png', pwa: 'https://cadger808.codeberg.page/farmsense',
        apk: 'https://codeberg.org/cadger808/farmsense/releases', color: '#22C55E', featured: true }
    ];
  }

  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  return { init, getApp, getAll, renderGrid };
})();

document.addEventListener('DOMContentLoaded', () => ZephyrStore.init());
window.ZephyrStore = ZephyrStore;
