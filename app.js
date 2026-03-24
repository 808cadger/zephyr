// app.js — Zephyr router, state, SW registration
// Aloha from Pearl City! Privacy-first: zero data leaves this device.

const ZephyrApp = (() => {
  // #ASSUMPTION: SW is supported; degrades gracefully if not
  let currentScreen = 'home';
  let swRegistration = null;
  let updateAvailable = false;

  async function init() {
    registerSW();
    setupNav();
    setupUpdateBanner();
    // Register periodic background sync for catalog refresh
    if ('periodicSync' in (await navigator.serviceWorker?.ready || {})) {
      try {
        await (await navigator.serviceWorker.ready).periodicSync.register('zephyr-catalog-refresh', {
          minInterval: 6 * 60 * 60 * 1000 // 6 hours
        });
      } catch (_) {
        // periodicSync not granted — silent fail
      }
    }
  }

  async function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    try {
      swRegistration = await navigator.serviceWorker.register('./sw.js', { scope: './' });
      swRegistration.addEventListener('updatefound', () => {
        const newWorker = swRegistration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            updateAvailable = true;
            showUpdateBanner();
          }
        });
      });
      // When SW takes over, reload for the new version — silent
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    } catch (err) {
      console.warn('dev note: SW registration failed', err);
    }
  }

  function setupNav() {
    document.querySelectorAll('[data-nav]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.nav;
        showScreen(target);
      });
    });
  }

  function showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('[data-nav]').forEach(b => b.classList.remove('active'));
    const screen = document.getElementById(`screen-${name}`);
    if (screen) {
      screen.classList.add('active');
      currentScreen = name;
    }
    const navBtn = document.querySelector(`[data-nav="${name}"]`);
    if (navBtn) navBtn.classList.add('active');
    // Update share widget context on screen change
    if (window.ZephyrShare) window.ZephyrShare.resetContext();
  }

  function setupUpdateBanner() {
    const banner = document.getElementById('update-banner');
    if (!banner) return;
    banner.querySelector('[data-action="update"]')?.addEventListener('click', () => {
      if (swRegistration?.waiting) {
        swRegistration.waiting.postMessage('SKIP_WAITING');
      }
      banner.style.display = 'none';
    });
    banner.querySelector('[data-action="dismiss"]')?.addEventListener('click', () => {
      banner.style.display = 'none';
    });
  }

  function showUpdateBanner() {
    const banner = document.getElementById('update-banner');
    if (banner) {
      banner.style.display = 'flex';
      showToast('Zephyr update ready — tap to apply', 'info', 8000);
    }
  }

  // Toast system — all screens, no blocking
  function showToast(msg, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = msg;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('visible'));
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  function getCurrentScreen() { return currentScreen; }
  function getSWRegistration() { return swRegistration; }

  return { init, showScreen, showToast, getCurrentScreen, getSWRegistration };
})();

// Boot on DOM ready
document.addEventListener('DOMContentLoaded', () => ZephyrApp.init());
window.ZephyrApp = ZephyrApp;
