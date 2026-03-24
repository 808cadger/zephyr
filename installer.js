// installer.js — PWA install prompts, install state tracking
// No app store. No gatekeeping. One tap.
// Privacy: install state stored locally only — never reported anywhere.

const ZephyrInstaller = (() => {
  let deferredPrompt = null;   // BeforeInstallPrompt event
  let zephyrInstalled = false;

  // #ASSUMPTION: BeforeInstallPrompt fires on eligible browsers (Chrome/Edge Android)
  //              iOS uses "Add to Home Screen" via Share sheet — handled separately
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    showZephyrInstallCTA();
  });

  window.addEventListener('appinstalled', () => {
    zephyrInstalled = true;
    deferredPrompt = null;
    localStorage.setItem('zephyr_installed', '1');
    ZephyrApp.showToast('Zephyr installed — tap the icon anytime', 'success');
    hideZephyrInstallCTA();
  });

  function init() {
    zephyrInstalled = !!localStorage.getItem('zephyr_installed');
    if (zephyrInstalled) hideZephyrInstallCTA();

    // Wire install-zephyr buttons
    document.querySelectorAll('[data-action="install-zephyr"]').forEach(btn => {
      btn.addEventListener('click', installZephyr);
    });
  }

  async function installZephyr() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        ZephyrApp.showToast('Installing Zephyr...', 'success');
      }
      deferredPrompt = null;
    } else if (isIOS()) {
      showIOSInstructions();
    } else {
      // Already installed or prompt not available
      ZephyrApp.showToast('Already installed — check your home screen', 'info');
    }
  }

  // Prompt install for any app in the catalog
  // For cross-origin PWAs, we open the PWA link — they handle their own install prompt
  async function promptInstall(app) {
    if (app.self) {
      // Installing Zephyr itself
      await installZephyr();
      return;
    }

    // For other apps: open their PWA link
    // Their own BeforeInstallPrompt will fire once the user visits
    const url = app.pwa;
    if (!url) {
      ZephyrApp.showToast('No PWA link for this app', 'warn');
      return;
    }

    // Show install modal
    showInstallModal(app);
  }

  function showInstallModal(app) {
    const existing = document.getElementById('install-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'install-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card" style="--accent:${escHtml(app.color || '#06B6D4')}">
        <div class="modal-header">
          <img src="${escHtml(app.icon)}" alt="${escHtml(app.name)}" class="modal-icon"
               onerror="this.src='./icons/icon-192.png'">
          <div>
            <h2>${escHtml(app.name)}</h2>
            <span class="app-category">${escHtml(app.category)}</span>
          </div>
          <button class="modal-close" id="modal-close-btn">&times;</button>
        </div>
        <p class="modal-desc">${escHtml(app.tagline)}</p>
        <div class="modal-actions">
          <a href="${escHtml(app.pwa)}" target="_blank" rel="noopener noreferrer"
             class="btn-install modal-install-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Open &amp; Install
          </a>
          ${app.apk ? `<a href="${escHtml(app.apk)}" target="_blank" rel="noopener noreferrer" class="btn-apk">Download APK</a>` : ''}
        </div>
        <p class="modal-privacy">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          No data shared. No account required.
        </p>
      </div>
    `;

    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('open'));

    modal.addEventListener('click', e => {
      if (e.target === modal) closeModal(modal);
    });
    document.getElementById('modal-close-btn')?.addEventListener('click', () => closeModal(modal));
  }

  function closeModal(modal) {
    modal.classList.remove('open');
    setTimeout(() => modal.remove(), 250);
  }

  function showIOSInstructions() {
    ZephyrApp.showToast('Tap the Share button → "Add to Home Screen"', 'info', 6000);
  }

  function showZephyrInstallCTA() {
    document.querySelectorAll('.install-zephyr-cta').forEach(el => {
      el.style.display = 'flex';
    });
  }

  function hideZephyrInstallCTA() {
    document.querySelectorAll('.install-zephyr-cta').forEach(el => {
      el.style.display = 'none';
    });
  }

  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }

  function isInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches ||
      navigator.standalone === true ||
      zephyrInstalled;
  }

  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  return { init, promptInstall, installZephyr, isInstalled };
})();

document.addEventListener('DOMContentLoaded', () => ZephyrInstaller.init());
window.ZephyrInstaller = ZephyrInstaller;
