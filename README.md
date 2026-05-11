# Zephyr

[![Release](https://img.shields.io/github/v/release/808cadger/zephyr?include_prereleases&label=release)](https://github.com/808cadger/zephyr/releases)
[![Last commit](https://img.shields.io/github/last-commit/808cadger/zephyr)](https://github.com/808cadger/zephyr/commits)
[![License](https://img.shields.io/github/license/808cadger/zephyr)](https://github.com/808cadger/zephyr/blob/HEAD/LICENSE)
![Platforms](https://img.shields.io/badge/platform-Web%2FPWA%2C%20Android-2563eb)

Open PWA app-store hub for discovering, launching, and installing the app suite without gatekeeping.

## Project Snapshot

| Area | Details |
|------|---------|
| Primary use case | Open PWA app-store hub for discovering, launching, and installing the app suite without gatekeeping. |
| Platforms | Web/PWA, Android |
| Core stack | JavaScript, Capacitor, PWA, Android |
| Review first | `www/index.html`, `index.html`, `android`, `capacitor.config.json`, `package.json` |

## Download Links

| Platform | Link |
|----------|------|
| iOS / iPhone | [Open the PWA in Safari](https://808cadger.github.io/zephyr/) and choose **Share -> Add to Home Screen** |
| Android | [Download the latest APK from GitHub Releases](https://github.com/808cadger/zephyr/releases/latest) |
| Source | [Download the GitHub source ZIP](https://github.com/808cadger/zephyr/archive/refs/heads/main.zip) |
| Repository | [View on GitHub](https://github.com/808cadger/zephyr) |

## Why This Repo Is Worth Reviewing

- Distribution layer for the broader app portfolio.
- PWA-first app discovery keeps installation low-friction.
- Android build path supports native catalog distribution.


<!-- INSTALL-START -->
## Install and run

These instructions install and run `zephyr` from a fresh clone.

### Clone
```bash
git clone https://github.com/808cadger/zephyr.git
cd zephyr
```

### Web app
```bash
npm install
npm run build
python3 -m http.server 8080
```

### Android build/open
```bash
npm run sync
npm run android
```

### Notes
- Use Node.js 22 or newer for the current package set.
- Android builds require Android Studio, a configured SDK, and Java 21 when Gradle is used.

### AI/API setup
- If the app has AI features, add the required provider key in the app settings or local `.env` file.
- Browser-only apps store user-provided API keys on the local device unless a backend endpoint is configured.

### License
- Apache License 2.0. See [`LICENSE`](./LICENSE).
<!-- INSTALL-END -->


> The open PWA network. Install, share, and discover every app — no gatekeeping, no store, no fees. No data saved. Ever.

[**PWA →**](https://cadger808.codeberg.page/zephyr) · [**Download APK →**](https://codeberg.org/cadger808/zephyr/releases) · [Codeberg](https://codeberg.org/cadger808/zephyr)

---

## What is Zephyr?

Zephyr is the distribution hub for every app in this suite. It's a PWA that lists and installs other PWAs — no app store, no account, no saved data.

**How it works:**
- Open Zephyr on any device
- Browse the app catalog
- Tap Install on any app — it opens the PWA directly and prompts "Add to Home Screen"
- That's it. The app is on your device. Zephyr is done.

Zephyr **never saves** your usage data, installed apps list, or any personal information. It's a catalog and a link — nothing more.

---

## Apps in the catalog

| App | What it does |
|-----|-------------|
| **GlowAI** | AI skin analysis — scan, routine, progress |
| **ArcherTravel** | AI travel booking + Claude Vision ID verify |
| **CourtAide** | AI legal assistant for pro se court filings |
| **FarmSense** | AI farm monitoring + crop management |

All apps: no account, API key on-device only, full PWA + Android APK available.

---

## Why Zephyr instead of a direct link?

- **One place, all apps** — share `cadger808.codeberg.page/zephyr` and people can pick what they want
- **Zero data** — Zephyr is a static PWA; there's no backend, no analytics, no tracking
- **Works offline** — service worker caches the catalog; apps are accessible even without a connection
- **Instant updates** — when a new app version ships, Zephyr's catalog reflects it automatically

---

## Can anyone use this?

**Yes — open in any browser, no install required.**

1. Open [cadger808.codeberg.page/zephyr](https://cadger808.codeberg.page/zephyr) on any device
2. Browse apps → tap any app to install it
3. Or tap "Add to Home Screen" to install Zephyr itself as a launcher

No account. No API key. No data.

---

## Dev quick start

```bash
git clone https://codeberg.org/cadger808/zephyr.git
cd zephyr && npm install

npx serve .                                            # browser dev
npx cap sync android && cd android && ./gradlew assembleDebug  # APK
```

---

## Tech stack

| Layer | Tech |
|-------|------|
| UI | Vanilla HTML/CSS/JS |
| Mobile | Capacitor → Android APK |
| Service Worker | Network-first catalog, cache-first shell, push notifications, background sync |
| CI | Forgejo Actions (APK + Pages) |

---

**Developer:** [codeberg.org/cadger808](https://codeberg.org/cadger808)
---

© 2026 cadger808 — All rights reserved.
