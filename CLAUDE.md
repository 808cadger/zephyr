# CLAUDE.md — Zephyr

Open shareable indie app store — the distribution network (appgrid).
Stack: HTML + Capacitor + Electron | Deploy: APK + PWA + Electron AppImage/RPM

## Repo Identity
- Codeberg: https://codeberg.org/cadger808/zephyr
- PWA: https://cadger808.codeberg.page/zephyr
- Releases: https://codeberg.org/cadger808/zephyr/releases

## Key Files
- `index.html` — single-page app entry point
- `app.js` / `store.js` / `installer.js` / `ambient.js` / `settings.js` — feature modules
- `share-widget.js` — floating UI widget
- `apps.json` — app catalog data
- `capacitor.config.json` — Capacitor/Android config
- `android/` — Android project (do not edit directly; sync via Capacitor)
- `sw.js` / `manifest.json` — PWA service worker and manifest

## Commands
```bash
npm install
npx cap sync android
cd android && ./gradlew assembleDebug
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
npm run electron:dist
```

## Assumption-Driven Coding

When generating or editing code:
1. Add a comment for each non-trivial assumption using `// #ASSUMPTION: ...` (or language equivalent).
2. Ask: "What test or edge case would break this assumption?"
3. Add minimal defensive checks or `// TODO: validate ...` comments where needed.
4. Before finishing, do a mental review pass on all `#ASSUMPTION` lines.

## SRE & DevOps (2026 Standards)
- **SLOs**: 99.9% availability, <200ms P95 latency, 0.1% error budget monthly.
- **SLIs**: Track uptime, latency, error rate via Prometheus/Grafana.
- **Deploy**: Zero-downtime (blue-green, canary); IaC-first (Pulumi/Terraform).
- **MCP Integration**: Use MCP for secure cloud access (AWS, Vercel).
- **Monitoring**: Golden signals + AI anomaly detection in every app.
- **Chatbot**: Embed agentic chatbot in every app (UI + API + safe prompts).

### Auto-Debug Engine (Always On)
- **Before every change**: Run tests/lint, show output, fix failures first.
- **After code**: Self-review: "Does this pass SRE checks? Edge cases? Security?"
- **Loop**: If error found → fix → retest → confirm clean → proceed.
- **Tools**: Enable Playwright MCP for UI tests; background terminal for logs.
- **Commands**: /doctor for health check; /memory to log fixes learned.
- **Never skip**: No deploy without "Debug complete: [tests passed]".

## Goal
Ship production-ready agentic AI apps with embedded chatbots, SRE-grade reliability, and Fiverr-ready polish. Every deploy <30min.

---

# Design System: Claude (Anthropic)

## 1. Visual Theme & Atmosphere

Claude's interface is a literary salon reimagined as a product page — warm, unhurried, and quietly intellectual. The entire experience is built on a parchment-toned canvas (`#f5f4ed`) that deliberately evokes the feeling of high-quality paper rather than a digital surface. Where most AI product pages lean into cold, futuristic aesthetics, Claude's design radiates human warmth, as if the AI itself has good taste in interior design.

The signature move is the custom Anthropic Serif typeface — a medium-weight serif with generous proportions that gives every headline the gravitas of a book title. Combined with organic, hand-drawn-feeling illustrations in terracotta (`#c96442`), black, and muted green, the visual language says "thoughtful companion" rather than "powerful tool." The serif headlines breathe at tight-but-comfortable line-heights (1.10–1.30), creating a cadence that feels more like reading an essay than scanning a product page.

What makes Claude's design truly distinctive is its warm neutral palette. Every gray has a yellow-brown undertone (`#5e5d59`, `#87867f`, `#4d4c48`) — there are no cool blue-grays anywhere. Borders are cream-tinted (`#f0eee6`, `#e8e6dc`), shadows use warm transparent blacks, and even the darkest surfaces (`#141413`, `#30302e`) carry a barely perceptible olive warmth. This chromatic consistency creates a space that feels lived-in and trustworthy.

**Key Characteristics:**
- Warm parchment canvas (`#f5f4ed`) evoking premium paper, not screens
- Custom Anthropic type family: Serif for headlines, Sans for UI, Mono for code
- Terracotta brand accent (`#c96442`) — warm, earthy, deliberately un-tech
- Exclusively warm-toned neutrals — every gray has a yellow-brown undertone
- Organic, editorial illustrations replacing typical tech iconography
- Ring-based shadow system (`0px 0px 0px 1px`) creating border-like depth without visible borders
- Magazine-like pacing with generous section spacing and serif-driven hierarchy

## 2. Color Palette & Roles

### Primary
- **Anthropic Near Black** (`#141413`): primary text color and dark-theme surface
- **Terracotta Brand** (`#c96442`): core brand color — CTAs, brand moments
- **Coral Accent** (`#d97757`): lighter warm variant for text accents, dark-surface links

### Secondary & Accent
- **Error Crimson** (`#b53333`): error states
- **Focus Blue** (`#3898ec`): input focus rings — the only cool color in the system

### Surface & Background
- **Parchment** (`#f5f4ed`): primary page background
- **Ivory** (`#faf9f5`): cards and elevated containers
- **Pure White** (`#ffffff`): specific button surfaces only
- **Warm Sand** (`#e8e6dc`): button backgrounds, interactive surfaces
- **Dark Surface** (`#30302e`): dark-theme containers
- **Deep Dark** (`#141413`): dark-theme page background

### Neutrals & Text
- **Charcoal Warm** (`#4d4c48`): button text on light surfaces
- **Olive Gray** (`#5e5d59`): secondary body text
- **Stone Gray** (`#87867f`): tertiary text, footnotes
- **Dark Warm** (`#3d3d3a`): dark text links
- **Warm Silver** (`#b0aea5`): text on dark surfaces

### Borders & Rings
- **Border Cream** (`#f0eee6`): standard light-theme border
- **Border Warm** (`#e8e6dc`): prominent borders, dividers
- **Border Dark** (`#30302e`): dark-surface borders
- **Ring Warm** (`#d1cfc5`): button hover/focus ring
- **Ring Deep** (`#c2c0b6`): active/pressed states

## 3. Typography Rules

### Font Family
- **Headline**: `Anthropic Serif` / fallback: `Georgia`
- **Body / UI**: `Anthropic Sans` / fallback: `Arial`
- **Code**: `Anthropic Mono` / fallback: `Arial`

### Hierarchy

| Role | Font | Size | Weight | Line Height |
|------|------|------|--------|-------------|
| Display / Hero | Anthropic Serif | 64px | 500 | 1.10 |
| Section Heading | Anthropic Serif | 52px | 500 | 1.20 |
| Sub-heading Large | Anthropic Serif | ~36px | 500 | 1.30 |
| Sub-heading | Anthropic Serif | 32px | 500 | 1.10 |
| Feature Title | Anthropic Serif | ~21px | 500 | 1.20 |
| Body Large | Anthropic Sans | 20px | 400 | 1.60 |
| Body Standard | Anthropic Sans | 16px | 400–500 | 1.25–1.60 |
| Caption | Anthropic Sans | 14px | 400 | 1.43 |
| Label | Anthropic Sans | 12px | 400–500 | 1.25–1.60 |
| Code | Anthropic Mono | 15px | 400 | 1.60 |

### Principles
- Serif (weight 500) for all headlines — never bold, never light
- Sans for all UI/functional text
- Body line-height 1.60 — generous, editorial
- Headings 1.10–1.30 — tight but not compressed

## 4. Component Stylings

### Buttons
- **Warm Sand**: bg `#e8e6dc`, text `#4d4c48`, radius 8px, ring shadow `0px 0px 0px 1px #d1cfc5`
- **Brand Terracotta**: bg `#c96442`, text `#faf9f5`, radius 8–12px — primary CTA only
- **Dark Charcoal**: bg `#30302e`, text `#faf9f5`, radius 8px
- **White Surface**: bg `#ffffff`, text `#141413`, radius 12px
- **Dark Primary**: bg `#141413`, text `#b0aea5`, radius 12px, border `1px solid #30302e`

### Cards & Containers
- Light: bg `#faf9f5`, border `1px solid #f0eee6`, radius 8–32px
- Dark: bg `#30302e`, border `1px solid #30302e`
- Shadow: `rgba(0,0,0,0.05) 0px 4px 24px` (whisper-soft)

### Inputs
- Radius 12px, focus ring `#3898ec` (only cool color moment)

## 5. Layout Principles

- Base spacing unit: 8px
- Max container: ~1200px centered
- Section vertical spacing: 80–120px
- Card padding: 24–32px
- Alternate light/dark sections for chapter-like rhythm

### Border Radius Scale
- 4px: inline elements; 8px: standard buttons/cards; 12px: primary buttons/inputs; 16px: featured containers; 32px: hero/media

## 6. Depth & Elevation

| Level | Treatment |
|-------|-----------|
| Flat | No shadow, no border |
| Contained | `1px solid #f0eee6` or `1px solid #30302e` |
| Ring | `0px 0px 0px 1px` warm ring shadows |
| Whisper | `rgba(0,0,0,0.05) 0px 4px 24px` |
| Inset | `inset 0px 0px 0px 1px` at 15% opacity |

## 7. Do's and Don'ts

### Do
- Use Parchment (`#f5f4ed`) as primary light background
- Use Anthropic Serif weight 500 for all headlines
- Use Terracotta (`#c96442`) only for primary CTAs
- Keep all neutrals warm-toned (yellow-brown undertone)
- Use ring shadows (`0px 0px 0px 1px`) for interactive states
- Use generous body line-height (1.60)
- Alternate light/dark sections for page rhythm

### Don't
- No cool blue-grays anywhere
- No Anthropic Serif above weight 500
- No saturated colors beyond Terracotta
- No sharp corners (< 6px radius)
- No heavy drop shadows
- No pure white `#ffffff` as page background
- No body line-height below 1.40

## 8. Responsive Behavior

| Breakpoint | Width | Key Changes |
|------------|-------|-------------|
| Small Mobile | <479px | Stacked, compact typography |
| Mobile | 479–640px | Single column, hamburger nav |
| Tablet | 768–991px | 2-column grids begin |
| Desktop | 992px+ | Full layout, 64px hero text |

- Touch targets minimum 44×44px
- Hero text: 64px → 36px → 25px progressive scaling

## 9. Agent Prompt Guide

### Quick Color Reference
- Brand CTA: `#c96442` (Terracotta Brand)
- Page Background: `#f5f4ed` (Parchment)
- Card Surface: `#faf9f5` (Ivory)
- Primary Text: `#141413` (Anthropic Near Black)
- Secondary Text: `#5e5d59` (Olive Gray)
- Tertiary Text: `#87867f` (Stone Gray)
- Borders (light): `#f0eee6` (Border Cream)
- Dark Surface: `#30302e`

### Iteration Guide
1. One component at a time
2. Always name specific colors — "Olive Gray (#5e5d59)" not "gray"
3. Warm-toned variants only — no cool grays
4. Serif for headings, Sans for labels — state it explicitly
5. Ring shadows, not drop shadows
6. Always specify background context — "on Parchment" or "on Near Black"
