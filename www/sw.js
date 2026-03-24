// Zephyr Service Worker — silent updates, offline-first, auto icon cache
// Aloha from Pearl City!

const CACHE_VERSION = 'zephyr-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './offline.html',
  './app.js',
  './store.js',
  './installer.js',
  './share-widget.js',
  './ambient.js',
  './settings.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Install: cache shell + auto-download every app icon silently
self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_VERSION);
      await cache.addAll(APP_SHELL);

      // #ASSUMPTION: apps.json is reachable at install time; icons are CORS-accessible
      try {
        const res = await fetch('./apps.json');
        const { apps } = await res.json();
        // Auto-download GlowAI, FarmSense, and all icons — no user action needed
        const iconFetches = apps.map(async app => {
          try {
            const iconRes = await fetch(app.icon, { mode: 'cors' });
            if (iconRes.ok) await cache.put(app.icon, iconRes);
          } catch (_) {
            // Non-critical — icon will load from network later
          }
        });
        await Promise.allSettled(iconFetches);
        // Also cache apps.json itself
        const appsRes = await fetch('./apps.json');
        await cache.put('./apps.json', appsRes);
      } catch (_) {
        // apps.json unreachable at install — will retry on next fetch
      }

      await self.skipWaiting();
    })()
  );
});

// Activate: clean stale caches, claim all tabs immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

// Fetch strategy:
//   apps.json → network-first (keep catalog fresh)
//   app icons (cross-origin) → cache-first with network fallback
//   everything else → cache-first
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Network-first for apps.json — always get latest catalog
  if (url.pathname.endsWith('apps.json')) {
    event.respondWith(networkFirstWithCache(request));
    return;
  }

  // Cache-first for everything else (icons, shell, scripts)
  event.respondWith(cacheFirstWithNetwork(request));
});

async function networkFirstWithCache(request) {
  try {
    const res = await fetch(request);
    if (res.ok) {
      const cache = await caches.open(CACHE_VERSION);
      await cache.put(request, res.clone());
    }
    return res;
  } catch (_) {
    const cached = await caches.match(request);
    return cached || new Response('{}', { headers: { 'Content-Type': 'application/json' } });
  }
}

async function cacheFirstWithNetwork(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const res = await fetch(request);
    if (res.ok && res.status < 400) {
      const cache = await caches.open(CACHE_VERSION);
      await cache.put(request, res.clone());
    }
    return res;
  } catch (_) {
    // Offline fallback for navigation requests
    if (request.mode === 'navigate') {
      const fallback = await caches.match('./offline.html');
      return fallback || new Response('<h1>Zephyr is offline</h1>', { headers: { 'Content-Type': 'text/html' } });
    }
    return new Response('', { status: 408 });
  }
}

// Silent auto-update: when a new SW is available, activate immediately
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

// Push notifications for app updates + ambient AI suggestions
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Zephyr';
  const options = {
    body: data.body || 'Something new is ready.',
    icon: './icons/icon-192.png',
    badge: './icons/icon-192.png',
    tag: data.tag || 'zephyr-notification',
    data: { url: data.url || './' },
    actions: data.actions || []
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || './';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url === targetUrl && 'focus' in client) return client.focus();
      }
      return clients.openWindow(targetUrl);
    })
  );
});

// Periodic update check via Background Sync
self.addEventListener('periodicsync', event => {
  if (event.tag === 'zephyr-catalog-refresh') {
    event.waitUntil(refreshCatalog());
  }
});

async function refreshCatalog() {
  try {
    const res = await fetch('./apps.json');
    if (!res.ok) return;
    const cache = await caches.open(CACHE_VERSION);
    await cache.put('./apps.json', res.clone());
    const { apps } = await res.json();
    // Refresh icons in background
    for (const app of apps) {
      try {
        const iconRes = await fetch(app.icon, { mode: 'cors' });
        if (iconRes.ok) await cache.put(app.icon, iconRes);
      } catch (_) {}
    }
  } catch (_) {}
}
