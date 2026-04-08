# Zephyr - Open Indie App Store (AppGrid Distribution)
Shareable PWA app store: apps.json catalog → one-tap install (PWA/APK/AppImage). No accounts, zero data saved. Distribution network for cadger808 factory apps. Stack: HTML/JS + Capacitor + Electron.

Repo: https://codeberg.org/cadger808/zephyr | PWA: https://cadger808.codeberg.page/zephyr. Dev: cadger808 (Pearl City, HI).

## Stack & Design System
- Frontend: Vanilla JS (index.html, app.js/store.js/installer.js/ambient.js/settings.js)
- Catalog: apps.json (GlowAI/AutoIQ/CourtAide/FarmSense/RepairIQ/JobHalo/HaloGuard/LifeOS/AmbientGuide/simper-decide/ModelPulse/ArcherTravel)
- Mobile: Capacitor (android/)
- Desktop: Electron (electron/)
- Widgets: share-widget.js
- PWA: sw.js, manifest.json
- Design: Claude Parchment #f5f4ed, Terracotta #c96442 Install CTAs

## Key Files & AppGrid Pipeline
apps.json (catalog) | installer.js (PWA/APK/AppImage) | store.js (search/filter)

## Commands
npm install
npx cap sync android && cd android && ./gradlew assembleDebug
npm run electron:dist

## Code Rules — AppGrid Pipeline
- **Pipeline**: apps.json → Filter/Search → One-tap install (PWA prompt/APK download/AppImage)
- **Zero Data**: No accounts, no usage tracking, fresh PWA every install
- **#ASSUMPTION**: apps.json valid JSON; TODO: schema validation + auto-update
- **Install Flow**: "Add to Home Screen" → no app store → direct from Zephyr
- **cadger808 Factory**: 14 apps auto-listed (GlowAI → ArcherTravel)
- **SRE**: 99.9% availability, <200ms P95 catalog load
- **Phases**: MVP (catalog+install) → Payments → Developer dashboard → App updates

## AI Prompts — Distribution Critical

## Claude Workflow (Auto-Debug Always On)
1. Read CLAUDE.md + apps.json FIRST
2. Run /doctor; validate JSON schema
3. Think: "All 14 factory apps? Install flows correct? Zero-data?"
4. Self-review: SRE signals, edge cases (iOS PWA), security
5. Output: Patches + "Debug complete: [apps.json valid]"
6. Commit: "feat: [catalog|install|appsjson|store] [desc]"

**Examples**:
- "Add ArcherTravel to apps.json with PWA manifest"
- "Fix iOS 'Add to Home Screen' flow in installer.js"
- "Validate all 14 cadger808 apps have valid manifests"

## Deploy Checklist

## apps.json Factory Template
```json
{
  "apps": [
    {"id": "glowai", "name": "GlowAI", "pwa": "cadger808.codeberg.page/glowai"},
    {"id": "autoiq", "name": "AutoIQ", "apk": "releases/AutoIQ.apk"},
    // ... 12 more cadger808 apps
  ]
}
```

**ZEPHYR = YOUR EMPIRE'S APP STORE**. 14 apps × identical CLAUDE.md DNA × one-tap distribution. **Commit → cadger808 factory achieves distribution independence.** No app stores needed. Your Hawaii AI dynasty is complete. 🚀🏝️
