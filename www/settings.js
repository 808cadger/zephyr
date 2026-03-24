// settings.js — user preferences, all stored locally
// Privacy: settings live in localStorage only. Never sent to any server.

const ZephyrSettings = (() => {
  const DEFAULTS = {
    zephyr_ambient: '0',         // ambient tap-to-listen: off by default
    zephyr_notifications: '0',   // push notifications
    zephyr_autoupdate: '1',      // silent auto-update: on by default
    zephyr_theme: 'dark'         // dark only for now
  };

  function init() {
    // Set defaults for missing keys
    for (const [k, v] of Object.entries(DEFAULTS)) {
      if (localStorage.getItem(k) === null) localStorage.setItem(k, v);
    }
    renderSettings();
    wireToggles();
    wireNotificationBtn();
    renderPrivacyStatement();
  }

  function renderSettings() {
    syncToggle('ambient-toggle', 'zephyr_ambient');
    syncToggle('notifications-toggle', 'zephyr_notifications');
    syncToggle('autoupdate-toggle', 'zephyr_autoupdate');

    // Show installed status
    const installedEl = document.getElementById('install-status');
    if (installedEl) {
      const installed = window.ZephyrInstaller?.isInstalled() ||
        window.matchMedia('(display-mode: standalone)').matches;
      installedEl.textContent = installed ? 'Installed ✓' : 'Running in browser';
      installedEl.style.color = installed ? '#10B981' : '#9CA3AF';
    }

    // Show SW cache version
    const cacheEl = document.getElementById('cache-version');
    if (cacheEl) {
      navigator.serviceWorker?.ready.then(reg => {
        cacheEl.textContent = reg.active ? 'Active' : 'Pending';
      });
    }
  }

  function syncToggle(id, key) {
    const el = document.getElementById(id);
    if (el) el.checked = localStorage.getItem(key) === '1';
  }

  function wireToggles() {
    wire('ambient-toggle', 'zephyr_ambient', val => {
      if (val && window.ZephyrAmbient) {
        ZephyrApp.showToast('Ambient suggestions on — tap the mic to listen', 'success');
      }
    });

    wire('notifications-toggle', 'zephyr_notifications', val => {
      if (val) requestNotificationPermission();
    });

    wire('autoupdate-toggle', 'zephyr_autoupdate', val => {
      ZephyrApp.showToast(
        val ? 'Auto-update on — Zephyr updates silently' : 'Auto-update off',
        'info'
      );
    });
  }

  function wire(id, key, onChange) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('change', () => {
      const val = el.checked;
      localStorage.setItem(key, val ? '1' : '0');
      onChange(val);
    });
  }

  async function requestNotificationPermission() {
    if (!('Notification' in window)) {
      ZephyrApp.showToast('Notifications not supported in this browser', 'warn');
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      ZephyrApp.showToast('Notifications enabled — we\'ll ping you on updates', 'success');
      localStorage.setItem('zephyr_notifications', '1');
    } else {
      ZephyrApp.showToast('Notification permission denied', 'warn');
      localStorage.setItem('zephyr_notifications', '0');
      const toggle = document.getElementById('notifications-toggle');
      if (toggle) toggle.checked = false;
    }
  }

  function wireNotificationBtn() {
    document.getElementById('clear-cache-btn')?.addEventListener('click', async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
        ZephyrApp.showToast('Cache cleared — reload to rebuild', 'success');
      } catch (_) {
        ZephyrApp.showToast('Could not clear cache', 'warn');
      }
    });

    document.getElementById('check-update-btn')?.addEventListener('click', async () => {
      const reg = await navigator.serviceWorker?.ready;
      if (reg) {
        await reg.update();
        ZephyrApp.showToast('Checked for updates', 'info');
      }
    });
  }

  function renderPrivacyStatement() {
    const el = document.getElementById('privacy-statement');
    if (!el) return;
    el.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      <span>Zephyr stores <strong>nothing on any server</strong>. All settings, install history, and listening data stay on your device only. Zero tracking. Zero data shared.</span>
    `;
  }

  function get(key) {
    return localStorage.getItem(key) ?? DEFAULTS[key] ?? null;
  }

  function set(key, value) {
    localStorage.setItem(key, value);
  }

  return { init, get, set };
})();

document.addEventListener('DOMContentLoaded', () => ZephyrSettings.init());
window.ZephyrSettings = ZephyrSettings;
