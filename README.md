# Zephyr — Free App Store

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
