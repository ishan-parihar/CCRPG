# CCRPG Frontend Audit & Refactor Plan

> **Project:** Cognitive-Capacity-Driven RPG (CCRPG)
> **Scope:** Establish a universal web-UI that works across desktop, tablet, and mobile, with a world-class visual layer relevant to the game.
> **Status:** Audit complete; refactor plan ready for execution.
> **Date:** 2026-07-09
> **Author:** AI agent (post-deep-audit)

---

## 0. TL;DR — Read This First

CCRPG's frontend is split across **two parallel UI systems** that do not share a component library, do not share a state model, and barely share a design language:

1. **Phaser 3 in-canvas UI** (`src/game/`) — ~10,900 LOC, draws everything with `0x`-prefixed hex colors and inline `fontFamily` strings. **Zero** use of the `--ccrpg-*` CSS tokens. **252 hardcoded hex colors**, **186 inline `fontFamily` strings**, **0 `getComputedStyle()` calls**.
2. **SvelteKit routes** (`src/routes/`) — ~4,200 LOC, consumes the CSS tokens correctly, but has **no shared component library** (only 5 components, of which only 2 are real UI primitives: `BackButton`, `VeiledStat`), **no layout primitives** (every route re-implements the same ~28-line route shell CSS), and **no responsive breakpoint system** (only 3 media queries in the whole Svelte layer).

The two systems are glued together by a **single Svelte component** (`PhaserGameClient.svelte`) that mounts Phaser into a fixed full-screen `<div>`, plus a **one-way event adapter** (`phaserEventAdapter.ts`) that pipes 2 of 7 EventBus events into the Svelte store. Phaser navigates back to Svelte routes via **`window.location.href`** — 5 sites, each triggering a full page reload and Phaser re-boot.

**The migration is half-finished.** The Phaser `MainMenuScene`, `SettingsScene`, `CodexScene`, `JournalScene`, `RadialChartScene` (636 LOC) are dead — they were replaced by Svelte routes but never deleted. Seven of eight assessment renderers (3,201 LOC) are dead — only `LLMDialogueRenderer` is live. Four of six Phaser accessibility modules (220 LOC) are dead. **Total dead code: 4,247 LOC, ~53% of the audited Phaser codebase.**

**Refactor verdict:** Do not attempt a big-bang rewrite. Execute a **5-phase phased refactor** that (1) deletes the dead code first, (2) bridges the design tokens into Phaser, (3) builds a real Svelte component library, (4) migrates Phaser's in-canvas UI either into Svelte overlays or into a token-driven Phaser UI kit, (5) replaces `window.location.href` with a real SvelteKit navigation bridge. Each phase is independently shippable.

**Expected effort:** 4–6 weeks of focused work for a solo developer. Phase 0 (dead-code deletion + token bridge) is a 1-day win.

---

## 1. Audit Scope & Method

### 1.1 What was audited

| Layer | Path | Files | LOC |
|---|---|---|---|
| Phaser scenes | `src/game/scenes/` | 15 | ~3,364 |
| Phaser assessments/renderers | `src/game/assessments/renderers/` | 8 | ~4,077 |
| Phaser assessments/scenes | `src/game/assessments/` (non-renderer) | 4 | ~447 |
| Phaser UI primitives | `src/game/ui/` | 4 | ~365 |
| Phaser accessibility | `src/game/accessibility/` | 6 | ~301 |
| Phaser systems | `src/game/systems/`, `src/game/onboarding/` | ~10 | ~600 |
| Phaser config/keys/textures/events/main | `src/game/{config,keys,textures,events,main}.ts` | 5 | ~360 |
| Svelte routes | `src/routes/` (8 routes × 2 files + layout + error) | 18 | ~2,500 |
| Svelte components | `src/lib/components/` | 5 | ~430 |
| Svelte stores | `src/lib/stores/` | 4 | ~280 |
| Svelte bridge | `src/lib/bridge/` | 1 | ~121 |
| Svelte capabilities | `src/lib/capabilities/` | 1 | ~230 |
| Svelte transitions | `src/lib/transitions/` | 1 | ~148 |
| CSS / design tokens | `src/styles/` | 4 | ~596 |
| Static fonts | `static/fonts/` | 54 TTF files | 5.3 MB |
| Config | `vite.config.ts`, `svelte.config.js`, `capacitor.config.json`, `tsconfig.json`, `package.json` | 5 | — |

### 1.2 What was NOT audited (out of scope for this pass)

- `src/core/` — the engine layer (assessments, engines, domain, telemetry, agent). Assumed correct; only its **consumption by the UI** was audited.
- `src/infra/` — persistence, LLM, telemetry adapters. Same as above.
- `tests/` — Vitest specs.
- `docs/` — research foundations, concept drafts.
- Backend API routes (`src/routes/api/`) — only their contract surface (POST `/api/save`, `/api/llm/*`, `/api/recovery/*`, `/api/telemetry`).

### 1.3 Method

1. **Static analysis** — read every file in scope, extract: hardcoded colors, hardcoded fonts, `window.location.href` calls, `getComputedStyle` calls, `var(--ccrpg-*)` references, scene registrations, import graphs.
2. **Dead-code detection** — for each file, grep the entire codebase for importers. Files with zero external importers (and not in `config.ts` scene list for scenes) are flagged dead.
3. **Cross-layer coupling analysis** — enumerate every site where Phaser reaches into the DOM, where Svelte reaches into Phaser, and where one navigates to the other.
4. **Design-token audit** — verify whether `tokens.css` is actually the single source of truth, or whether the truth is fragmented across `tokens.css` + hardcoded Phaser hex values + hardcoded CSS fallbacks.
5. **Component-library audit** — enumerate shared components vs inline reimplementations; map every inline `<button class="…">` to the missing primitive it represents.

---

## 2. The Fragmentation Map

### 2.1 Current architecture (the tangle)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        BROWSER (single tab, single page)                       │
│                                                                                │
│  ┌─────────────────────────────────┐    ┌─────────────────────────────────┐  │
│  │      SVELTE LAYER (DOM)         │    │      PHASER LAYER (canvas)      │  │
│  │                                  │    │                                 │  │
│  │  +layout.svelte                  │    │  BootScene                      │  │
│  │   ├─ StageTheme (sets data-stage)│    │   ├─ PreloaderScene             │  │
│  │   ├─ CapabilityProbe (data-*)    │    │   ├─ OnboardingScene            │  │
│  │   └─ {children}                  │    │   ├─ WorldScene ─────────┐      │  │
│  │                                  │    │   ├─ EncounterScene      │      │  │
│  │  Routes (each full-screen):      │    │   ├─ AssessmentScene     │      │  │
│  │   /  (menu hub)                  │    │   ├─ ReflectionScene     │      │  │
│  │   /play (mounts Phaser) ◀────────┼────┼───┼─ DilemmaScene         │      │  │
│  │   /profile                       │    │   ├─ EncounterSelection  │      │  │
│  │   /journal                       │    │   └─ UIOverlayScene       │      │  │
│  │   /codex                         │    │                           │      │  │
│  │   /settings                      │    │  Renderers (8):            │      │  │
│  │   /recover                       │    │   LLMDialogueRenderer ◀───┘      │  │
│  │   /telemetry                     │    │   (7 dead)                        │  │
│  │                                  │    │                                   │  │
│  │  Components (5):                 │    │  UI primitives (4):               │  │
│  │   BackButton, VeiledStat,        │    │   Button (dead), StatBar (dead),  │  │
│  │   PhaserGameClient, StageTheme,  │    │   CognitiveOverlay (dead),        │  │
│  │   Seo                            │    │   SceneTransitions                │  │
│  │                                  │    │                                   │  │
│  │  Stores (4):                     │    │  Accessibility (6):               │  │
│  │   gameStore, accessibilityStore, │    │   AccessibilityManager (live)     │  │
│  │   cloudSyncStore (svc),          │    │   ScreenReaderOverlay (cond.)     │  │
│  │   saveHydration (svc)            │    │   DOMOverlay, FocusManager,       │  │
│  │                                  │    │   HighContrastTheme,              │  │
│  │  CSS tokens: --ccrpg-* (8 stages)│    │   ReducedMotionGuard (4 dead)     │  │
│  │  NO component library            │    │                                   │  │
│  │  NO layout primitives            │    │  Hardcoded: 252 hex colors,        │  │
│  │  NO breakpoints                  │    │   186 fontFamily strings           │  │
│  └─────────────────────────────────┘    └─────────────────────────────────┘ │
│                  ▲                                       │                    │
│                  │                                       │                    │
│                  │  ┌────────────────────────────────┐  │                    │
│                  │  │  BRIDGE (1 file, 121 LOC)      │  │                    │
│                  │  │  phaserEventAdapter.ts         │  │                    │
│                  │  │   - encounter_completed → store│  │                    │
│                  │  │   - session_ended → flushSync  │  │                    │
│                  │  │   - changedata:Significator →  │  │                    │
│                  │  │     setSignificator            │  │                    │
│                  │  │   - 3 events DOCUMENTED but    │  │                    │
│                  │  │     NEVER subscribed:          │  │                    │
│                  │  │     shadow_surfaced,           │  │                    │
│                  │  │     shadow_resolved,           │  │                    │
│                  │  │     transformation_triggered   │  │                    │
│                  │  └────────────────────────────────┘  │                    │
│                  │                                       │                    │
│                  └─────────── window.location.href ─────┘                    │
│                  (5 sites: WorldScene ×3, main.ts ×2 — full page reload)      │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 The five fragmentation axes

#### Axis 1 — Two renderers, zero shared design language

| Concern | Svelte layer | Phaser layer | Shared? |
|---|---|---|---|
| Color palette | `var(--ccrpg-*)` from `tokens.css` | 252 hardcoded `0x` hex values | ❌ No |
| Font family | `var(--ccrpg-font-display)`, `var(--ccrpg-font-body)` | 186 inline `fontFamily` strings (`'system-ui, sans-serif'`, `'monospace'`, `'"Segoe UI", system-ui, sans-serif'`) | ❌ No |
| Spacing | ad-hoc `padding: 1rem`, `gap: 0.75rem` (no scale) | ad-hoc `0, 0` Phaser coords | ❌ No |
| Motion | `stageMotion.ts` + `--ccrpg-motion` token | `this.tweens.add(...)` ad-hoc | ❌ No |
| Radius | `--ccrpg-radius-{sm,lg}` | hardcoded `0` (Phaser rectangles) or `setCornerRadius` calls | ❌ No |
| Z-index | hardcoded `100`, `1000`, `9999` | `setDepth(100)` hardcoded | ❌ No |
| Breakpoints | 3 ad-hoc media queries | n/a (Phaser uses FIT scale mode) | ❌ No |

**The `tokens.css` comment claims** "Phaser reads these same tokens via `getComputedStyle(document.documentElement)` — single source of truth, two renderers." **This is a lie.** Grep confirms zero `getComputedStyle` calls in `src/game/`. The tokens are Svelte-only.

#### Axis 2 — Half-finished Svelte migration

The migration intent is documented in `src/game/config.ts:13-23`:

> *"Menu scenes (MainMenu, RadialChart, Codex, Journal, Settings) have been migrated to Svelte routes (/, /profile, /codex, /journal, /settings)."*

But the old Phaser files were never deleted:

| Phaser scene (DEAD) | LOC | Svelte route that replaced it |
|---|---|---|
| `MainMenuScene.ts` | 261 | `/` (root) |
| `SettingsScene.ts` | 85 | `/settings` |
| `CodexScene.ts` | 55 | `/codex` |
| `JournalScene.ts` | 119 | `/journal` |
| `RadialChartScene.ts` | 116 | `/profile` |
| **Total** | **636** | — |

Their `SceneKeys` constants are still exported in `keys.ts` (L6, 9, 10, 15, 18). They reference each other internally (`CodexScene → MainMenu`, `SettingsScene → MainMenu`, etc.) so they form a dead cluster.

#### Axis 3 — Dead assessment renderers

| Renderer | LOC | Live? | Why dead |
|---|---|---|---|
| `LLMDialogueRenderer.ts` | 876 | ✅ Live | Used by `AssessmentScene.ts:131` |
| `EmotionRenderer.ts` | 448 | ❌ Dead | Zero importers outside its own file |
| `ScenarioRenderer.ts` | 486 | ❌ Dead | Same |
| `PatternRenderer.ts` | 418 | ❌ Dead | Same |
| `ReactionTimeRenderer.ts` | 591 | ❌ Dead | Same |
| `DilemmaRenderer.ts` | 438 | ❌ Dead | Same |
| `NBackRenderer.ts` | 348 | ❌ Dead | Same |
| `HoldRenderer.ts` | 472 | ❌ Dead | Same |
| **Total dead** | **3,201** | | |

The dead renderers were built before the architecture pivoted to "the only live modality is `LLMDialogueRenderer` for narrative encounters, and `UIOverlayScene` handles cognitive tasks (N-back, Stroop) inline." The dead renderers reimplement 7 distinct button factories (`createButton`, `createChoiceButton`, `createMatchButton`, `createSymbolButton`, `createColorButton`, `createEmotionButton`, `createTapArea`) — all with the same hardcoded `0x1b2740` fill + `0x4cc9f0` stroke.

**Risk:** the dead renderers may be intended for future modalities (`Deterministic`, `LanguageReflective`, `ScenarioChoice`, `Embodied`, `Strategic`, `SocialCooperative`, `ImmersiveRPG` — see `MODALITY_THEME` in `WorldScene.ts:26-34`). Before deleting, confirm with the user whether these are deferred (archive, don't delete) or abandoned (delete).

#### Axis 4 — Two parallel accessibility systems

| Layer | File | State location | Side effects |
|---|---|---|---|
| Svelte | `src/lib/stores/accessibilityStore.ts` | Svelte `writable` + `localStorage['ccrpg:accessibility']` | **None** — toggling `reducedMotion`/`highContrast` writes to localStorage but never writes `data-motion` / `data-contrast` / `.a11y-high-contrast` to the DOM |
| Phaser | `src/game/accessibility/AccessibilityManager.ts` + `src/infra/persistence/AccessibilityStore.ts` | Class instance + same `localStorage['ccrpg:accessibility']` key | Only `AccessibilityManager` is live; `HighContrastTheme.ts` palette is never consumed by any scene |

Both layers share the localStorage key but have **no runtime synchronization**. If the user toggles "Reduced Motion" in `/settings`, the Svelte store updates and persists — but the running Phaser `AccessibilityManager` instance (held by `Services.a11yManager` in `main.ts:54`) never re-reads. Phaser'scene-level code that checks `acc.isReducedMotion()` will return stale data until the next page reload.

Worse, the Svelte-side `reducedMotion` and `highContrast` toggles are **visually inert** in the Svelte layer itself: `CapabilityProbe.ts` is the only thing that writes `data-motion="reduced"` / `data-contrast="more"` to `<html>`, and it only does so by reading `prefers-reduced-motion` / `prefers-contrast` from the OS. **The user-facing toggle in `/settings` has no effect on the UI.** This is a critical a11y bug.

#### Axis 5 — Bridge is one-way and incomplete

`phaserEventAdapter.ts` documents 6 events it intends to bridge:

```typescript
// B5 fix: actually update the store on encounter_completed.
// The payload includes the encounter record; we extract the id for the HUD.
// Cloud sync: debounced POST to /api/save so /recover has data to fetch.
bus.on('encounter_completed', ...) // ✅ ACTIONED
bus.on('session_started', ...)     // ⚠️ console.debug only
bus.on('session_ended', ...)       // ✅ ACTIONED
// shadow_surfaced → "logged (future: journal updates)"     ❌ NEVER SUBSCRIBED
// shadow_resolved → "logged (future: journal updates)"     ❌ NEVER SUBSCRIBED
// transformation_triggered → "logged (future: stage-transition animation)" ❌ NEVER SUBSCRIBED
```

The three "future" events are **emitted** by `EncounterScene.ts:80, 116` and `WorldScene.ts:213`, but the corresponding `bus.on(...)` calls were never written. The Svelte journal/transformation UI has no way to react to these signals.

Meanwhile, two more events have no bridge at all: `encounter_declined` (emitted by `main.ts:96`) and `module_lifecycle_scored` (emitted by `AssessmentScene.ts:174`). Both are lost.

---

## 3. Detailed Findings

### 3.1 Phaser scenes — line-by-line issues

#### 3.1.1 `WorldScene.ts` (530 LOC, LIVE) — the worst offender

This is the main gameplay scene and the source of most cross-bridge bleed.

**Hardcoded colors (25 distinct values):**

| Color | Hex | Usage sites |
|---|---|---|
| Background | `0x05070b` | (transitive via config) |
| Companion | `0x44aacc` | L65 |
| HUD overlay | `0x000000` | L84 |
| HUD text | `0xcccccc` | L87 |
| Journal button | `0x88ccff` | L91 |
| Settings gear | `0xcccccc` | L96 |
| Menu button | (implied) | L100 |
| Volcanic red | `0xff3300` | L155, L241, L265 |
| Ember orange | `0xcc8844` | L165, L255, L287 |
| Modality: Deterministic | `0xffaa00` | L27 |
| Modality: LanguageReflective | `0xff5522` | L28 |
| Modality: ScenarioChoice | `0x333344` | L29 |
| Modality: Embodied | `0x886644` | L30 |
| Modality: Strategic | `0x556655` | L31 |
| Modality: SocialCooperative | `0x44aa88` | L32 |
| Modality: ImmersiveRPG | `0x222244` | L33 |
| Toast bg | `0x1a0a0a`, `0x2a0505`, `0x2a1515`, `0x1a0f0f` | L398-410 |

**Inline `fontFamily` strings (7 sites):** all `'monospace'` except one `'serif'`.

**`window.location.href` calls (3 sites):**

```typescript
// L93 — Journal button
.on('pointerdown', () => { window.location.href = '/journal'; });

// L98 — Settings gear
.on('pointerdown', () => { window.location.href = '/settings'; });

// L433 — Exit encounter / leave world
window.location.href = '/';
```

Each triggers a full page reload → SvelteKit re-boot → `PhaserGameClient.svelte` `onMount` → `startGame()` → Phaser re-boot → `BootScene` → `PreloaderScene` → `WorldScene`. **~3-5 second reload on a mid-tier phone.**

**Duplicated HUD:** the in-canvas HUD at L84-100 (`[Journal] [⚙] [Menu]` text buttons) duplicates the Svelte `/play` HUD overlay at `src/routes/play/+page.svelte:41-46` (which has its own BackButton). Two HUDs on the same screen, only one of which (the Phaser one) is interactive during gameplay.

#### 3.1.2 `PreloaderScene.ts` (313 LOC, LIVE)

- `0x4cc9f0` (cyan accent) hardcoded 12 times (L60, 113, 115, 125, 147, 151, 155, 166, 170, 176, 222, 249).
- `'"Segoe UI", system-ui, sans-serif'` hardcoded 4 times (L36, 58, 78, 234).
- Animated logo, octagons, loading bar, particle burst, title typewriter — all hand-drawn with `Phaser.GameObjects.Graphics`.
- **No progress reporting to the Svelte layer** — the Svelte `/play` route shows a black screen until Phaser finishes loading. No spinner, no percentage.

#### 3.1.3 `OnboardingScene.ts` (139 LOC, LIVE)

- Inline buttons at L50-54 reimplement hover/press handlers manually.
- `'monospace'` hardcoded 5 times.
- `0x88ccff`, `0xaaeeff`, `0x555577`, `0xccccee` — all drift from Red stage tokens.

#### 3.1.4 `UIOverlayScene.ts` (475 LOC, LIVE)

- Owns N-back rune pad, MATCH button, Stroop word panel, 4-color Stroop buttons.
- `0x000000` dimmer at L65 and L291 — duplicated.
- `'"system-ui, sans-serif"'` hardcoded 8 times.
- The Stroop palette is imported from `@core/usecases/StroopTask.ts:STROOP_PALETTE` ✅ (good — single source for that one palette).
- **Reimplements its own button factory** instead of using `Button.ts`.

#### 3.1.5 `ReflectionScene.ts`, `DilemmaScene.ts`, `EncounterSelectionScene.ts` (478 LOC combined, LIVE)

All three reimplement button creation inline with hardcoded `monospace` font and stage-drift colors (`0xaaccff`, `0xffcc88`, `0xffeeaa`, etc.). None use `Button.ts`. None use `var(--ccrpg-*)`.

#### 3.1.6 Dead scenes (636 LOC, deletable)

See §2.2 above.

### 3.2 Assessment renderers — line-by-line issues

#### 3.2.1 `LLMDialogueRenderer.ts` (876 LOC, LIVE) — the only live renderer

**The good:** it has a centralized theme object at L28-50:

```typescript
const C = {
  bg: 0x05070b,
  bgGradTop: 0x0c1322,
  bgGradBot: 0x05070b,
  cardBg: 0x1a2a40,
  bubbleBg: 0x1a2a40,
  accent: 0x4cc9f0,
  accentDim: 0x2a6f8a,
  accentGreen: 0x88ddaa,
  btnNormal: 0x1b2740,
  btnHover: 0x2a3b5e,
  btnSelected: 0x4cc9f0,
  btnWriteNormal: 0x2a3b5e,
  btnWriteActive: 0x4cc9f0,
  borderNormal: 0x2a3b5e,
  borderSelected: 0x4cc9f0,
  borderGreen: 0x88ddaa,
  separator: 0x2a3b5e,
};
```

**The bad:** this is a **local** constant, not imported from a shared theme module. It's also **completely disconnected** from `tokens.css` — none of these values match the Red stage's `#b8252a` accent or `#0d0a0a` background. The renderer is visually a different game.

**The ugly:** at L778-820, it injects a raw `<textarea>` directly into `document.body`, bypassing both Phaser's input system and Svelte. The textarea is manually positioned by reading `canvas.getBoundingClientRect()` and repositioned on scroll. This is the only DOM injection in the Phaser layer, and it's a fragile hack — scroll, resize, or canvas re-mount will misalign it.

**Fonts:** `'"Segoe UI", system-ui, sans-serif'` hardcoded 10 times; `'"Segoe UI Mono", "SF Mono", monospace'` once.

#### 3.2.2 Dead renderers (3,201 LOC)

All seven dead renderers follow the same pattern:
1. Local button factory (`createButton` / `createChoiceButton` / `createMatchButton` / `createSymbolButton` / `createColorButton` / `createEmotionButton` / `createTapArea`).
2. Local dimmer (`0x000000, 0.7` overlay).
3. Local trial counter + feedback text.
4. Hardcoded `0x1b2740` fill + `0x4cc9f0` stroke on every button.
5. `'system-ui, sans-serif'` or `'monospace'` font.

`ReactionTimeRenderer.ts` even **redefines the Stroop palette** at L35-40 that already exists in `@core/usecases/StroopTask.ts:STROOP_PALETTE`.

### 3.3 Phaser UI primitives — line-by-line issues

#### 3.3.1 `Button.ts` (67 LOC, **dead** — only importer is `MainMenuScene` which is itself dead)

```typescript
// L25-27 — the "default blue" that haunts the codebase
const fill = opts.fill ?? 0x1b2740;
const hover = opts.hoverFill ?? 0x2a3b5e;
const tx = opts.textColor ?? '#e7eaf2';
// L32
.setStrokeStyle(2, 0x4cc9f0, 0.6)
// L36
fontFamily: 'system-ui, sans-serif',
```

This `0x1b2740` / `0x4cc9f0` / `#e7eaf2` triple is copy-pasted into at least 8 other locations (5 dead renderers + `textures.ts:48` HeroIdle body + `LLMDialogueRenderer.ts` theme object). No shared constant.

#### 3.3.2 `StatBar.ts` (46 LOC, **dead** — zero importers)

Hardcodes `0x0f1828` track color. Natural home for any future HP/ATB bar, but currently unused.

#### 3.3.3 `CognitiveOverlay.ts` (144 LOC, **dead** — zero importers)

Hand-rolled dimmer + target indicator + feedback text. Natural home for the `GameEvents.RequestCognitiveTask` flow currently implemented inline in `UIOverlayScene.ts`.

#### 3.3.4 `SceneTransitions.ts` (108 LOC, **live** — 15 importers)

The only shared Phaser UI primitive that's actually used. Hardcodes `0x05070b` fade color, `0x0d1520` loading bg, `0x2a6f8a` stroke, `0x4cc9f0` dot, `0x8899aa` text. Fonts: `'"Segoe UI", system-ui, sans-serif'`.

### 3.4 Phaser accessibility — line-by-line issues

| File | LOC | Status | Issue |
|---|---|---|---|
| `AccessibilityManager.ts` | 47 | ✅ Live | Used by `main.ts:54`. Emits `accessibility_changed` event that no Svelte listener consumes. |
| `ScreenReaderOverlay.ts` | 34 | ✅ Conditional | Only mounted if `screenReaderEnabled` is true **at boot time** (`main.ts:124`). If the user enables screen reader mid-session, it never mounts. |
| `DOMOverlay.ts` | 113 | ❌ Dead | Zero importers. |
| `FocusManager.ts` | 48 | ❌ Dead | Zero importers. No keyboard-focus management in Phaser layer. |
| `HighContrastTheme.ts` | 46 | ❌ Dead | Defines `HIGH_CONTRAST` + `STANDARD_THEME` palettes. Never consumed by any scene — even when `acc.isHighContrast()` returns true, scenes keep rendering with their hardcoded colors. |
| `ReducedMotionGuard.ts` | 13 | ❌ Dead | Zero importers. Phaser tweens are never gated by reduced-motion preference. |

### 3.5 Phaser config & main.ts

#### 3.5.1 `config.ts` (63 LOC)

- `Phaser.Scale.FIT` mode + `CENTER_BOTH` — letterboxed to 1080×1920 portrait. On a desktop landscape monitor, this leaves huge black bars on left/right.
- `zoom: 1 / window.devicePixelRatio` — adaptive DPI.
- `backgroundColor: '#05070b'` — hardcoded, drifts from Red `#0d0a0a`.
- Scene list (L47-58): 10 scenes. The 5 dead scenes are correctly omitted.

#### 3.5.2 `main.ts` (162 LOC)

- **Two service locators**: `Services` global object (L26-33, populated L69-74) and `game.registry` (L117-122). Both point at the same instances. Scenes use them inconsistently — some read `Services.saveRepo`, others read `this.registry.get(RegistryKeys.SaveRepo)`.
- **`window.addEventListener('beforeunload', ...)` at L101-111** — persists Significator + WorldState + flushes telemetry. The only cloud-sync safety net. If Phaser crashes before this fires, data is lost.
- **`window.__ccrpg = { game, saveRepo, native }` at L155** — debug hook leaked into production global scope.
- **Android back button** (L131-152): three branches, two of which `window.location.href = '/'`.

### 3.6 Svelte routes — line-by-line issues

#### 3.6.1 Every route reimplements the same shell

Each of the 7 menu/info routes (`/`, `/profile`, `/journal`, `/codex`, `/settings`, `/recover`, `/telemetry`) starts with ~28 lines of identical CSS:

```css
.X-route {
  min-height: 100vh;
  background: var(--ccrpg-bg, #05070b);
  color: var(--ccrpg-fg, #e7eaf2);
  font-family: var(--ccrpg-font-body, system-ui);
  padding: 1rem;
  padding-top: calc(1rem + env(safe-area-inset-top, 0px));
  overflow-y: auto;
  touch-action: pan-y;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
```

Plus ~12 lines of identical `.route-header`:

```css
.route-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}
```

**Total duplicated layout CSS: ~200 LOC** across 7 routes.

#### 3.6.2 Hardcoded fallback colors drift from actual tokens

Every `var(--ccrpg-bg, #05070b)` fallback uses `#05070b` — but the Red stage's actual `--ccrpg-bg` is `#0d0a0a`. Same for `--ccrpg-fg` (`#e7eaf2` fallback vs Red `#e8d4cc`). If the CSS tokens ever fail to load (e.g. the route's `<style>` runs before `tokens.css`), the UI shows a blueish `#05070b` background instead of the warm Red palette.

#### 3.6.3 `/settings` — the danger palette is hardcoded

Lines 244, 332-345, 360-415 use `#ff6b6b`, `#ff4444`, `#ff8888`, `rgba(255,102,102,*)`, `#0c1322` (modal bg). No `--ccrpg-danger` token exists. Same for `/telemetry` line 223 `#4cc9f0` (info cyan) and `/recover` `rgba(255,77,109,*)`.

#### 3.6.4 `/settings` modal — critical a11y bugs

The reset-confirm modal (lines 172-194) has:
- ✅ `role="dialog"` `aria-modal="true"` `aria-labelledby="reset-title"`
- ❌ No `Escape` key handler
- ❌ No focus trap (Tab can escape into the page behind)
- ❌ No restore-focus on close (focus goes to `<body>` after close)
- ❌ Backdrop `onclick` closes (mouse-only — keyboard users can't dismiss)

#### 3.6.5 `/codex` — missing `aria-controls`

```svelte
<button aria-expanded={expanded}>...</button>
{#if expanded}<div>...</div>{/if}
```

The button has `aria-expanded` but no `aria-controls="panel-id"`, and the panel has no `id`. Screen readers can't associate them.

#### 3.6.6 `/journal` — semantic gaps

Fulfilled vows use `<li class="vow-item fulfilled">` with `opacity: 0.7` but no `aria-disabled="true"` or `aria-label="fulfilled"`.

#### 3.6.7 SSR is dead

`+layout.ts` sets `ssr = buildTarget !== 'static'` — but every individual `+page.ts` overrides with `ssr = false`. The SSR path is dead code. Either commit to SPA (delete the SSR branch) or commit to SSR (delete the per-route overrides and make the routes SSR-safe).

#### 3.6.8 No `aria-current="page"` anywhere

None of the nav links in `/` mark themselves as current. Screen reader users have no way to know which route they're on.

#### 3.6.9 No loading state

`gameStore.isLoaded` exists (set by `PhaserGameClient.markLoaded()`) but **no route reads it**. `PhaserGameClient.svelte:12` comment claims "the root page shows branded spinner" — it doesn't. The `/play` route shows a black screen until Phaser boots. No spinner, no skeleton, no progress bar.

#### 3.6.10 No `prefers-color-scheme` support

The only "light theme" is the White stage (`[data-stage="white"]` in `tokens.css:169`). There's no `@media (prefers-color-scheme: dark)` query, no `data-theme="light|dark"` attribute, no user toggle. The OS dark-mode preference is ignored.

#### 3.6.11 No i18n

`app.html` hardcodes `lang="en"`. All strings are English-only. No `og:locale`. The `infra/i18n/I18n.ts` module exists but is not consumed by any Svelte route.

### 3.7 Svelte components — what's missing

**Only 5 components exist:**

| Component | Purpose | Reused? |
|---|---|---|
| `BackButton.svelte` | `<a>` or `<button>` with `←` glyph | ✅ 8 importers |
| `VeiledStat.svelte` | Veil-compliant qualitative descriptor | ✅ 2 importers |
| `PhaserGameClient.svelte` | Mounts Phaser | ✅ 1 importer (` /play`) |
| `StageTheme.svelte` | Side-effect: sets `data-stage` on `<html>` | ✅ 1 importer (`+layout`) |
| `Seo.svelte` | `<svelte:head>` meta tags | ✅ 8 importers |

**Missing primitives** (in priority order):

1. **Button** — variants: `primary | default | muted | danger | ghost`; sizes: `sm | md | lg`. Replaces ~12 hand-rolled button classes across routes.
2. **Card** — replaces `.profile-card`, `.entry-card`, `.event-card`, `.setting-row`, `.vow-item`, `.summary`, `.descriptors`.
3. **Modal/Dialog** — with focus trap, Escape handler, restore-focus, backdrop click. Replaces the `/settings` hand-rolled modal.
4. **Toggle/Switch** — replaces 3 hand-rolled toggles in `/settings`.
5. **Input/Field** — replaces 12 hand-rolled inputs in `/recover`.
6. **Layout primitives**: `Container`, `Stack`, `Cluster`, `Grid`. Eliminates ~200 LOC of duplicated route CSS.
7. **RouteShell** + **RouteHeader** — eliminates 7× duplicated shell.
8. **Toast/Notification** — with `aria-live` regions. None exist.
9. **Spinner/Skeleton** — wire `gameStore.isLoaded` to actual UI.
10. **Icon set** — SVG sprite or component-per-icon. Currently only text glyphs (`→`, `←`, `⚙`).
11. **Tabs / Accordion / Dropdown** — none exist.
12. **Tooltip** — none.

### 3.8 Svelte stores — coherence issues

#### 3.8.1 `gameStore.ts` (52 LOC)

- Uses legacy `writable()` API despite `svelte.config.js` setting `compilerOptions.runes: true`. Mixed paradigm.
- `currentStage: 'Red'` hardcoded at L27 — comment says "Phase 2 reads from `sig.currentStage`" but Phase 2 never happened. So `currentStage` is duplicated: it lives both in `gameStore.currentStage` AND in `gameStore.significator.currentStage`. They can drift.
- `isLoaded` flag is set but never read by any UI.

#### 3.8.2 `accessibilityStore.ts` (60 LOC)

- Duplicates `src/infra/persistence/AccessibilityStore.ts` (Phaser-side).
- Same localStorage key `ccrpg:accessibility`.
- **No runtime sync** between the two. Toggling in `/settings` updates the Svelte store but not the Phaser `AccessibilityManager` instance until next page reload.
- **Toggles are visually inert** in Svelte layer (see §2.4).

#### 3.8.3 `cloudSyncStore.ts` (113 LOC)

- Misnamed — it's a service module, not a store. No `writable`, no `subscribe`.
- No sync status exposed to UI (no `syncing | synced | error` state, no `lastSyncedAt`).
- Save blob is plaintext JSON. Comment at L13: "Phase 3 (future) will add client-side E2E encryption" — never happened. The `/api/save` server comments claim "END-TO-END ENCRYPTED" but the client never encrypts.

#### 3.8.4 `saveHydration.ts` (53 LOC)

- Hardcodes three localStorage keys: `profile:v1`, `world:v1`, `save:v1` (L47-49). These must match `SaveRepository`'s keys or they drift silently.

### 3.9 CSS design system — missing scales

`tokens.css` has 8 stage themes ✅ but is missing:

| Scale | Status | Impact |
|---|---|---|
| Spacing (`--ccrpg-space-1..8`) | ❌ Missing | Every route hardcodes `padding: 1rem`, `gap: 0.75rem` ad-hoc |
| Typography (`--ccrpg-text-xs..3xl`) | ❌ Missing | Routes hardcode `font-size: 0.875rem`, `1rem`, `1.25rem` ad-hoc |
| Z-index (`--ccrpg-z-{base,hud,overlay,modal,toast,sr}`) | ❌ Missing | Hardcoded `100` (play HUD), `1000` (modal), `9999` (noscript) |
| Shadow (`--ccrpg-shadow-{sm,md,lg}`) | ❌ Missing | Zero `box-shadow` declarations in entire Svelte layer |
| Breakpoint (`--ccrpg-bp-{sm,md,lg,xl,2xl}`) | ❌ Missing | Only 3 ad-hoc media queries (480, 640, 1025) |
| Semantic colors (`--ccrpg-{danger,warning,success,info}`) | ❌ Missing | `/settings` and `/recover` hardcode reds; `/telemetry` hardcodes cyan |
| Layout (`--ccrpg-content-max-width`, `--ccrpg-route-padding`) | ❌ Missing | Routes hardcode `500px`, `600px`, `700px` |
| Line-height (`--ccrpg-leading-*`) | ❌ Missing | Routes hardcode `1.4`, `1.5`, `1.6` |
| Letter-spacing (`--ccrpg-tracking-*`) | ❌ Missing | Routes hardcode `0.03em`, `0.1em`, `0.15em` |

### 3.10 Fonts — performance issues

- **54 TTF files in `static/fonts/`** (5.3 MB total). Only 16 are referenced by `fonts.css`. The other 38 are dead weight.
- **All TTF, no WOFF2.** WOFF2 is ~30% smaller and has wider browser support than TTF for web fonts.
- **No `unicode-range`** — every font loads its full character set.
- **No `size-adjust`** — fonts with different x-heights (Erica One vs IBM Plex Mono) cause layout shift on stage transitions.
- **PWA precache** (`vite.config.ts:83`) globs `*.ttf` up to 4MB. The 5.3 MB of fonts exceeds this — some fonts will not be precached and will fail offline.

### 3.11 PWA & Capacitor config

#### 3.11.1 Two PWA manifests disagree

- `static/manifest.webmanifest` (40 LOC) — referenced by `app.html:15`.
- Inline manifest in `vite.config.ts:35-80` via `SvelteKitPWA` — adds a third shortcut (`Recover Save`) missing from the static file.
- The static file wins at runtime, so the vite config's `Recover Save` shortcut is silently dropped.

#### 3.11.2 No offline fallback

`SvelteKitPWA` config has no `navigateFallback`. If the user is offline and navigates to a route not in the precache, they get a browser-native "no internet" page — not a branded offline screen.

#### 3.11.3 Capacitor config is minimal

`capacitor.config.json` declares Android + iOS but **no native plugins** (no Camera, no Haptics, no Push, no Filesystem). The native bridge in `src/infra/native/NativeBridge.ts` only handles the Android back button. No haptic feedback, no native share sheet, no push notifications.

#### 3.11.4 Splash screen drifts

`capacitor.config.json` sets splash background to `#05070b` — drifts from Red stage `#0d0a0a` and from `manifest.theme_color: #0b0d12`. Three different "dark" colors for the same conceptual surface.

### 3.12 CapabilityProbe — under-utilized

`CapabilityProbe.ts` (230 LOC) is well-designed. It detects:
- Input method (`touch | mouse | gamepad | tv`)
- Motion preference (`full | reduced`)
- Contrast preference (`normal | more`)
- Connection (`4g | 3g | 2g | slow-2g | unknown`)
- WebGL support (`none | 1 | 2`)
- Device memory, hardware concurrency, screen size, orientation, gamepad presence

It writes 6 `data-*` attributes on `<html>`. But `capabilities.css` (93 LOC) only consumes 4 of them meaningfully:
- ✅ `data-input` → touch target sizing
- ✅ `data-motion` → animation duration
- ✅ `data-contrast` → border color/width
- ✅ `data-capability` → backdrop-filter
- ⚠️ `data-connection` → empty rule with "Phase 3 will add lazy-loading" comment
- ❌ `data-orientation` → no rules at all

The TV/gamepad modes are detected but barely styled. No `:hover`-only media query for touch devices. No breakpoint-based layout adaptation.

---

## 4. The Refactor Plan

### 4.1 Guiding principles

1. **Phased, not big-bang.** Each phase is independently shippable. No "freeze everything for 6 weeks."
2. **Delete before build.** Phase 0 deletes 4,247 LOC of dead code. This reduces cognitive load for everything that follows.
3. **Tokens before components.** Phase 1 completes the design-token system and bridges it into Phaser. Phase 2 builds the component library on top of the tokens.
4. **Migrate incrementally.** Phase 3 migrates Phaser's in-canvas UI either into Svelte overlays (for menus/HUDs) or into a token-driven Phaser UI kit (for gameplay-critical overlays like N-back/Stroop that need sub-frame timing).
5. **No new abstractions without need.** Don't build a "design system framework." Build the minimum components the routes actually need.

### 4.2 Phase 0 — Dead Code Purge & Token Bridge (1 day)

**Goal:** Remove all dead code, bridge the existing CSS tokens into Phaser, fix the most critical a11y bugs.

#### 4.2.1 Delete dead files

```
DELETE: src/game/scenes/MainMenuScene.ts          (261 LOC)
DELETE: src/game/scenes/SettingsScene.ts           (85 LOC)
DELETE: src/game/scenes/CodexScene.ts               (55 LOC)
DELETE: src/game/scenes/JournalScene.ts            (119 LOC)
DELETE: src/game/scenes/RadialChartScene.ts        (116 LOC)
DELETE: src/game/ui/Button.ts                       (67 LOC) — will be rebuilt in Phase 2
DELETE: src/game/ui/StatBar.ts                      (46 LOC) — dead
DELETE: src/game/ui/CognitiveOverlay.ts            (144 LOC) — dead
DELETE: src/game/assessments/renderers/EmotionRenderer.ts      (448 LOC)
DELETE: src/game/assessments/renderers/ScenarioRenderer.ts     (486 LOC)
DELETE: src/game/assessments/renderers/PatternRenderer.ts      (418 LOC)
DELETE: src/game/assessments/renderers/ReactionTimeRenderer.ts (591 LOC)
DELETE: src/game/assessments/renderers/DilemmaRenderer.ts      (438 LOC)
DELETE: src/game/assessments/renderers/NBackRenderer.ts        (348 LOC)
DELETE: src/game/assessments/renderers/HoldRenderer.ts         (472 LOC)
DELETE: src/game/accessibility/DOMOverlay.ts        (113 LOC) — dead
DELETE: src/game/accessibility/FocusManager.ts      (48 LOC) — dead
DELETE: src/game/accessibility/HighContrastTheme.ts (46 LOC) — dead
DELETE: src/game/accessibility/ReducedMotionGuard.ts (13 LOC) — dead
DELETE: src/lib/stores/accessibilityStore.ts         (60 LOC) — will be rebuilt unified in Phase 3
```

**Before deleting the 7 dead renderers**, confirm with the user whether they are:
- (a) **Abandoned** — delete permanently. The 7 modalities will be re-implemented as Svelte overlays or Phaser scenes when needed.
- (b) **Deferred** — move to `src/game/assessments/renderers/_archive/` and exclude from the build. Keep the code for reference but don't ship it.

This audit recommends (a) — the architecture has moved on, and the dead renderers encode a pre-`LLMDialogueRenderer` design that won't be revived.

**Also prune:**
- `SceneKeys` entries for the 5 dead scenes in `src/game/keys.ts` (L6, 9, 10, 15, 18).
- `static/fonts/` — keep only the 16 TTF files referenced by `fonts.css`. Delete the other 38.
- `base.css` lines 65-95 (`#game-root`, `#a11y-overlay` selectors — unused by Svelte layer).
- `base.css` lines 144-157 (`@media (min-width: 1025px) { #game-root { max-width: 480px } }` — dead).
- `vite.config.ts` lines 35-80 — the inline PWA manifest. Keep only `static/manifest.webmanifest`.

**Total deleted:** ~4,300 LOC + ~3 MB of dead font files.

#### 4.2.2 Bridge CSS tokens into Phaser

Create `src/game/ui/themeBridge.ts`:

```typescript
// src/game/ui/themeBridge.ts
// Reads --ccrpg-* CSS tokens from :root at boot and on stage change,
// exposes them as Phaser 0x-prefixed numbers + fontFamily strings.

export interface PhaserTheme {
  bg: number;
  surface: number;
  surfaceElevated: number;
  fg: string;        // Phaser text color is a string
  fgMuted: string;
  accent: number;
  accentSoft: number;
  accentFg: string;
  border: number;
  fontDisplay: string;
  fontBody: string;
  motion: 'pulse' | 'drift' | 'snap' | 'chime' | 'tick' | 'grow' | 'refract' | 'dissolve';
  // Semantic (added in Phase 1)
  danger: number;
  warning: number;
  success: number;
  info: number;
}

let current: PhaserTheme | null = null;
const listeners = new Set<(t: PhaserTheme) => void>();

function hexToNumber(hex: string): number {
  // '#0d0a0a' → 0x0d0a0a
  return parseInt(hex.replace('#', '').trim(), 16);
}

function readToken(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

export function readThemeFromDOM(): PhaserTheme {
  return {
    bg: hexToNumber(readToken('--ccrpg-bg')),
    surface: hexToNumber(readToken('--ccrpg-surface')),
    surfaceElevated: hexToNumber(readToken('--ccrpg-surface-elevated')),
    fg: readToken('--ccrpg-fg'),
    fgMuted: readToken('--ccrpg-fg-muted'),
    accent: hexToNumber(readToken('--ccrpg-accent')),
    accentSoft: hexToNumber(readToken('--ccrpg-accent-soft')),
    accentFg: readToken('--ccrpg-accent-fg'),
    border: hexToNumber(readToken('--ccrpg-border').replace(/rgba?\(([^)]+)\)/, (_, vals) => {
      const [r, g, b] = vals.split(',').map((v: string) => parseInt(v.trim()));
      return '#' + [r, g, b].map(n => n.toString(16).padStart(2, '0')).join('');
    })),
    fontDisplay: readToken('--ccrpg-font-display'),
    fontBody: readToken('--ccrpg-font-body'),
    motion: readToken('--ccrpg-motion') as PhaserTheme['motion'],
    danger: hexToNumber(readToken('--ccrpg-danger')),
    warning: hexToNumber(readToken('--ccrpg-warning')),
    success: hexToNumber(readToken('--ccrpg-success')),
    info: hexToNumber(readToken('--ccrpg-info')),
  };
}

export function getTheme(): PhaserTheme {
  if (!current) current = readThemeFromDOM();
  return current;
}

export function refreshTheme(): PhaserTheme {
  current = readThemeFromDOM();
  for (const l of listeners) l(current);
  return current;
}

export function onThemeChange(fn: (t: PhaserTheme) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Call once at boot:
// - Watch the data-stage attribute for changes
// - On change, refreshTheme() and re-render any Phaser scene that caches colors
export function initThemeBridge(): void {
  const observer = new MutationObserver(() => refreshTheme());
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-stage', 'data-contrast', 'data-motion'],
  });
  refreshTheme();
}
```

**Wire it in `main.ts`:**

```typescript
// After bootRegistries(), before new Phaser.Game():
import { initThemeBridge } from './ui/themeBridge.js';
initThemeBridge();
```

**Replace hardcoded colors in:**
- `config.ts:28` `backgroundColor: '#05070b'` → `backgroundColor: () => '#' + getTheme().bg.toString(16).padStart(6, '0')`
- `SceneTransitions.ts:9` `FADE_COLOR = 0x05070b` → `getTheme().bg`
- `BootScene.ts:17, 20` → `getTheme().bg`
- `PreloaderScene.ts` — replace all 12 `0x4cc9f0` with `getTheme().accent`
- `OnboardingScene.ts`, `WorldScene.ts`, `ReflectionScene.ts`, `DilemmaScene.ts`, `EncounterSelectionScene.ts`, `UIOverlayScene.ts` — replace all hardcoded colors with `getTheme().*`
- `LLMDialogueRenderer.ts:28-50` — replace the local `C` object with `getTheme()`
- `textures.ts:48` HeroIdle body `0x1b2740` → `getTheme().surface`

**Expected effort:** 4-6 hours of mechanical find-and-replace, plus 1 hour to verify visual parity.

#### 4.2.3 Fix the critical a11y bugs

**Bug 1: `accessibilityStore` toggles are visually inert.**

In `src/lib/components/StageTheme.svelte` (or a new `A11yApplier.svelte`), subscribe to `accessibilityStore` and write the `data-*` attributes:

```svelte
<!-- src/lib/components/A11yApplier.svelte -->
<script lang="ts">
  import { browser } from '$app/environment';
  import { accessibilityStore } from '$lib/stores/accessibilityStore.js';
  import { CapabilityProbe } from '$lib/capabilities/CapabilityProbe.js';

  $effect(() => {
    if (!browser) return;
    const s = $accessibilityStore;
    const html = document.documentElement;

    // User toggle overrides OS preference (if user explicitly sets, respect it)
    if (s.reducedMotion !== null) {
      html.setAttribute('data-motion', s.reducedMotion ? 'reduced' : 'full');
    }
    if (s.highContrast !== null) {
      html.setAttribute('data-contrast', s.highContrast ? 'more' : 'normal');
      html.classList.toggle('a11y-high-contrast', s.highContrast);
    }
  });
</script>
```

Mount in `+layout.svelte` alongside `<StageTheme />`.

**Bug 2: `/settings` modal has no focus trap, no Escape, no restore-focus.**

This will be fixed in Phase 2 when the `Modal` component is built. For now, add a minimal Escape handler:

```svelte
<!-- /settings/+page.svelte — add inside the modal {#if} block -->
<svelte:window onkeydown={(e) => e.key === 'Escape' && (showResetModal = false)} />
```

And restore focus:

```svelte
<script>
  let lastFocused: HTMLElement | null = null;
  function openModal() {
    lastFocused = document.activeElement as HTMLElement;
    showResetModal = true;
  }
  function closeModal() {
    showResetModal = false;
    lastFocused?.focus();
  }
</script>
```

**Bug 3: Save blobs are plaintext JSON.**

This is a Phase 4 concern (security hardening). For now, document it in `docs/security.md` and add a `// TODO(phase-4): encrypt before POST` comment in `cloudSyncStore.ts:48`.

**Bug 4: `StageTheme.svelte` comment lies about prefers-reduced-motion.**

Either delete the comment or implement it (handled by `A11yApplier.svelte` above).

#### 4.2.4 Wire the missing bridge events

In `src/lib/bridge/phaserEventAdapter.ts`, add the missing subscriptions:

```typescript
unsubscribers.push(
  bus.on('shadow_surfaced', (payload) => {
    // Update a future journalStore — for now, console.debug
    console.debug('[bridge] shadow_surfaced', payload.shadowId, payload.line, payload.quadrant);
    // TODO(phase-3): push to a Svelte journalStore
  }),
);

unsubscribers.push(
  bus.on('shadow_resolved', (payload) => {
    console.debug('[bridge] shadow_resolved', payload.shadowId);
  }),
);

unsubscribers.push(
  bus.on('transformation_triggered', (payload) => {
    console.debug('[bridge] transformation_triggered', payload.signal);
    // Trigger a Svelte stage-transition overlay
    // TODO(phase-3): showStageTransitionOverlay(payload.signal)
  }),
);

unsubscribers.push(
  bus.on('encounter_declined', (payload) => {
    console.debug('[bridge] encounter_declined', payload);
  }),
);

unsubscribers.push(
  bus.on('module_lifecycle_scored', (payload) => {
    console.debug('[bridge] module_lifecycle_scored', payload);
  }),
);

unsubscribers.push(
  bus.on('accessibility_changed', (payload) => {
    // Sync Phaser-side AccessibilityManager changes back to Svelte store
    import('$lib/stores/accessibilityStore.js').then(({ setAccessibilityFromPhaser }) => {
      setAccessibilityFromPhaser(payload.settings);
    });
  }),
);
```

#### 4.2.5 Phase 0 acceptance criteria

- [ ] `npm run build` passes with zero TypeScript errors after dead-code deletion.
- [ ] `npm test` passes (all existing Vitest specs green).
- [ ] `python3 skills/workspace-lint/scripts/workspace_lint.py --root .` passes.
- [ ] No `0x[0-9a-fA-F]{6}` literal in `src/game/` except in `themeBridge.ts` (test fixtures) and `textures.ts` (procedural texture colors — those are game assets, not UI).
- [ ] Stage transitions (data-stage change) visibly re-color Phaser scenes within 1 frame.
- [ ] `/settings` toggles for Reduced Motion and High Contrast now visibly affect the UI.
- [ ] `/settings` modal closes on Escape and restores focus.
- [ ] Console shows `[bridge]` debug logs for `shadow_surfaced`, `shadow_resolved`, `transformation_triggered` events during gameplay.

---

### 4.3 Phase 1 — Complete the Design Token System (2-3 days)

**Goal:** Fill in the missing token scales (spacing, typography, z-index, shadow, breakpoints, semantic colors, layout) and convert fonts to WOFF2.

#### 4.3.1 Extend `tokens.css`

Append to `src/styles/tokens.css`:

```css
/* ─── Spacing scale (8-step, 4px base) ─── */
:root {
  --ccrpg-space-0: 0;
  --ccrpg-space-1: 0.25rem;   /* 4px */
  --ccrpg-space-2: 0.5rem;    /* 8px */
  --ccrpg-space-3: 0.75rem;   /* 12px */
  --ccrpg-space-4: 1rem;      /* 16px */
  --ccrpg-space-5: 1.5rem;    /* 24px */
  --ccrpg-space-6: 2rem;      /* 32px */
  --ccrpg-space-7: 3rem;      /* 48px */
  --ccrpg-space-8: 4rem;      /* 64px */
}

/* ─── Typography scale (modular, 1.125 ratio) ─── */
:root {
  --ccrpg-text-xs: 0.75rem;     /* 12px */
  --ccrpg-text-sm: 0.875rem;    /* 14px */
  --ccrpg-text-base: 1rem;      /* 16px */
  --ccrpg-text-md: 1.125rem;    /* 18px */
  --ccrpg-text-lg: 1.25rem;     /* 20px */
  --ccrpg-text-xl: 1.5rem;      /* 24px */
  --ccrpg-text-2xl: 2rem;       /* 32px */
  --ccrpg-text-3xl: clamp(2.5rem, 6vw, 4rem); /* display */
  --ccrpg-leading-tight: 1.2;
  --ccrpg-leading-normal: 1.5;
  --ccrpg-leading-relaxed: 1.7;
  --ccrpg-tracking-tight: -0.01em;
  --ccrpg-tracking-normal: 0;
  --ccrpg-tracking-wide: 0.05em;
  --ccrpg-tracking-wider: 0.1em;
}

/* ─── Z-index scale ─── */
:root {
  --ccrpg-z-base: 0;
  --ccrpg-z-hud: 100;
  --ccrpg-z-overlay: 500;
  --ccrpg-z-modal: 1000;
  --ccrpg-z-toast: 1500;
  --ccrpg-z-sr: 9999;
}

/* ─── Shadow scale ─── */
:root {
  --ccrpg-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --ccrpg-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --ccrpg-shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.5);
  --ccrpg-shadow-glow: 0 0 24px var(--ccrpg-accent-soft);
}

/* ─── Breakpoints (as CSS custom properties for JS consumption) ─── */
:root {
  --ccrpg-bp-sm: 480px;
  --ccrpg-bp-md: 768px;
  --ccrpg-bp-lg: 1024px;
  --ccrpg-bp-xl: 1280px;
  --ccrpg-bp-2xl: 1536px;
}

/* ─── Semantic colors ─── */
:root {
  --ccrpg-danger: #b8252a;
  --ccrpg-danger-soft: #5a1318;
  --ccrpg-danger-fg: #ffffff;
  --ccrpg-warning: #d4a425;
  --ccrpg-warning-soft: #6a5215;
  --ccrpg-success: #5aa425;
  --ccrpg-success-soft: #2a5215;
  --ccrpg-info: #2590c4;
  --ccrpg-info-soft: #155068;
}

/* ─── Layout tokens ─── */
:root {
  --ccrpg-content-max-width: 640px;
  --ccrpg-route-padding: 1rem;
  --ccrpg-route-padding-top: calc(1rem + env(safe-area-inset-top, 0px));
}

/* ─── Stage-specific semantic overrides (optional) ─── */
[data-stage="white"] {
  --ccrpg-danger: #8a0000;
  --ccrpg-danger-fg: #ffffff;
}
```

#### 4.3.2 Convert fonts to WOFF2

1. Install `woff2_compress` (or use an online converter).
2. For each of the 16 referenced TTF files in `static/fonts/`, generate a `.woff2` variant.
3. Update `src/styles/fonts.css` — change every `src: url('/fonts/X.ttf')` to `src: url('/fonts/X.woff2') format('woff2')`.
4. Delete the 38 unreferenced TTF files.
5. Delete the original TTF files (keep `.woff2` only).
6. Update `vite.config.ts:83` PWA precache glob from `*.ttf` to `*.woff2`.
7. Add `unicode-range` to each `@font-face` for Latin + Latin Extended only (CJK support deferred — the game is English-only for now).

**Expected savings:** ~3.5 MB → ~1.2 MB (65% reduction).

#### 4.3.3 Add `size-adjust` to prevent layout shift

For each pair of display/body fonts that will be swapped on stage change, add `size-adjust` to equalize x-height:

```css
/* Example: Boldonse (display) vs Big Shoulders (display) — different x-heights */
@font-face {
  font-family: 'Boldonse';
  src: url('/fonts/Boldonse-Regular.woff2') format('woff2');
  font-display: swap;
  size-adjust: 95%;  /* tuned to match Big Shoulders */
}
```

This requires manual measurement per font pair. Budget 2 hours.

#### 4.3.4 Add responsive breakpoint utilities

Create `src/styles/breakpoints.css`:

```css
/* Mobile-first breakpoints — use as @media (min-width: var(--ccrpg-bp-md)) */
/* Note: CSS custom properties don't work directly in @media queries yet.
   Use the @custom-media approach or hardcode the values. */

@custom-media --bp-sm (min-width: 480px);
@custom-media --bp-md (min-width: 768px);
@custom-media --bp-lg (min-width: 1024px);
@custom-media --bp-xl (min-width: 1280px);

/* OR — use a mixin pattern in components:
   @media (min-width: 768px) { ... }
*/
```

(SvelteKit's Vite + PostCSS setup supports `@custom-media` if `postcss-preset-env` is added.)

#### 4.3.5 Phase 1 acceptance criteria

- [ ] `tokens.css` defines all 9 token scales listed in §3.9.
- [ ] All routes replace hardcoded `padding`/`gap`/`margin` with `var(--ccrpg-space-*)`.
- [ ] All routes replace hardcoded `font-size` with `var(--ccrpg-text-*)`.
- [ ] All routes replace hardcoded `z-index` with `var(--ccrpg-z-*)`.
- [ ] `/settings` danger palette uses `var(--ccrpg-danger*)`.
- [ ] `/telemetry` info color uses `var(--ccrpg-info)`.
- [ ] `static/fonts/` contains only 16 `.woff2` files (no TTF).
- [ ] `fonts.css` references only `.woff2`.
- [ ] Total font payload < 1.5 MB.
- [ ] `themeBridge.ts` reads the new semantic tokens and exposes them to Phaser.

---

### 4.4 Phase 2 — Build the Svelte Component Library (5-7 days)

**Goal:** Build the missing primitives identified in §3.7. Each component lives in `src/lib/components/` and is consumed by routes.

#### 4.4.1 Component priority & specs

**Tier 1 — Layout primitives (build first, eliminates ~200 LOC of duplication)**

| Component | Props | Slots | Notes |
|---|---|---|---|
| `Container.svelte` | `maxWidth?='content'`, `as='div'` | default | Wraps content in a max-width constrained flex column. Uses `--ccrpg-content-max-width`. |
| `Stack.svelte` | `gap?='space-4'`, `align?`, `justify?` | default | Vertical flex. |
| `Cluster.svelte` | `gap?='space-2'`, `align?`, `justify?` | default | Horizontal flex with wrap. |
| `Grid.svelte` | `cols?={mobile:1, tablet:2, desktop:3}`, `gap?='space-4'` | default | Responsive CSS grid. |
| `RouteShell.svelte` | `title?`, `back?={href}` | default | The 28-line route wrapper every route re-implements. Includes safe-area padding, scroll, BackButton. |
| `RouteHeader.svelte` | `title`, `subtitle?` | default | The 12-line header every route re-implements. |

**Tier 2 — Form & action primitives**

| Component | Props | Slots | Notes |
|---|---|---|---|
| `Button.svelte` | `variant='default|primary|muted|danger|ghost'`, `size='sm|md|lg'`, `onclick?`, `href?`, `disabled?`, `loading?`, `icon?` | default | Replaces ~12 hand-rolled button classes. |
| `IconButton.svelte` | `onclick?`, `href?`, `disabled?`, `ariaLabel` | default | For `⚙`, `←`, `→` etc. |
| `Toggle.svelte` | `checked`, `onchange`, `ariaLabel` | — | Replaces 3 hand-rolled toggles in `/settings`. `role="switch"`. |
| `Input.svelte` | `value`, `oninput`, `type='text'`, `label?`, `error?`, `ariaInvalid?`, `placeholder?`, `maxlength?` | — | Replaces 12 inputs in `/recover`. |
| `Field.svelte` | `label`, `for`, `error?` | default | Wraps Input/Select with label + error. |
| `Modal.svelte` | `open`, `onclose`, `title`, `ariaLabelledby?` | default | Focus trap, Escape handler, restore-focus, backdrop click. Replaces `/settings` hand-rolled modal. |

**Tier 3 — Content primitives**

| Component | Props | Slots | Notes |
|---|---|---|---|
| `Card.svelte` | `variant='default|elevated|accent'`, `padding?='space-5'`, `as='div'` | default | Replaces `.profile-card`, `.entry-card`, `.event-card`, `.setting-row`, `.vow-item`, `.summary`, `.descriptors`. |
| `Badge.svelte` | `variant='default|success|warning|danger|info'` | default | For fulfilled-vow badges, status indicators. |
| `Accordion.svelte` | `items={[]}`, `multiple?` | — | Replaces `/codex` hand-rolled expandable cards. `aria-expanded` + `aria-controls`. |
| `Toast.svelte` | `message`, `variant`, `duration?` | — | With `aria-live='polite'`. Mounted in `+layout.svelte`, driven by a `toastStore`. |

**Tier 4 — Feedback primitives**

| Component | Props | Slots | Notes |
|---|---|---|---|
| `Spinner.svelte` | `size?='md'` | — | Stage-aware spinner. |
| `Skeleton.svelte` | `width?`, `height?`, `variant='text|rect|circle'` | — | For loading states. |
| `Progress.svelte` | `value: number`, `max=100`, `label?` | — | For Phaser preload progress. |

**Tier 5 — Navigation primitives**

| Component | Props | Slots | Notes |
|---|---|---|---|
| `BottomNav.svelte` | `items={[]}` | — | Mobile bottom-tab bar. Hidden on desktop (`@media (min-width: 1024px)`). |
| `Sidebar.svelte` | `items={[]}` | — | Desktop sidebar. Hidden on mobile. |
| `Breadcrumb.svelte` | `items={[]}` | — | Optional. |

#### 4.4.2 Icon set

Create `src/lib/components/icons/` with one `.svelte` file per icon. Use the [Lucide](https://lucide.dev) icon set (MIT licensed, 1000+ icons, SVG-based).

```svelte
<!-- src/lib/components/icons/IconArrowLeft.svelte -->
<script lang="ts">
  let { size = 20, class: className = '' }: { size?: number; class?: string } = $props();
</script>
<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={className}>
  <path d="m12 19-7-7 7-7"/>
  <path d="M19 12H5"/>
</svg>
```

Replace the `←`, `→`, `⚙` text glyphs across routes with `<IconArrowLeft />`, `<IconArrowRight />`, `<IconSettings />`.

#### 4.4.3 Migrate routes to use the new components

For each route, replace inline implementations:

```svelte
<!-- BEFORE: /settings/+page.svelte (excerpt) -->
<div class="settings-route">
  <header class="route-header">
    <BackButton onclick={backToMenu} label="Menu" />
    <h1>Settings</h1>
  </header>
  <!-- ... -->
  <div class="setting-row">
    <span class="setting-label">Reduced Motion</span>
    <button class="toggle" role="switch" aria-checked={s.reducedMotion} onclick={toggle}>
      <span class="toggle-thumb"></span>
    </button>
  </div>
  <!-- ... -->
  {#if showResetModal}
    <div class="modal-backdrop" onclick={closeModal}>
      <div class="modal" role="dialog" aria-modal="true">
        <h2 id="reset-title">Reset all data?</h2>
        <button onclick={confirmReset}>Yes, reset</button>
        <button onclick={closeModal}>Cancel</button>
      </div>
    </div>
  {/if}
</div>

<!-- AFTER: /settings/+page.svelte -->
<RouteShell title="Settings" back="/">
  <Stack gap="space-5">
    <Card>
      <Stack gap="space-4">
        <Field label="Reduced Motion">
          <Toggle checked={s.reducedMotion} onchange={toggleReducedMotion} ariaLabel="Reduced Motion" />
        </Field>
        <Field label="High Contrast">
          <Toggle checked={s.highContrast} onchange={toggleHighContrast} ariaLabel="High Contrast" />
        </Field>
        <Field label="Telemetry Opt-In">
          <Toggle checked={s.telemetryOptIn} onchange={toggleTelemetry} ariaLabel="Telemetry Opt-In" />
        </Field>
      </Stack>
    </Card>
    <Card>
      <Button variant="danger" onclick={() => showModal = true}>Reset all data</Button>
    </Card>
  </Stack>
</RouteShell>

<Modal open={showModal} onclose={() => showModal = false} title="Reset all data?">
  <p>This will permanently delete your Significator, WorldState, and all telemetry data.</p>
  <Cluster gap="space-3" justify="end">
    <Button variant="ghost" onclick={() => showModal = false}>Cancel</Button>
    <Button variant="danger" onclick={confirmReset}>Yes, reset</Button>
  </Cluster>
</Modal>
```

**Expected LOC reduction per route:** ~40-60% (mostly from deleting inline `<style>` blocks).

#### 4.4.4 Build a `Toast` system

Create `src/lib/stores/toastStore.ts`:

```typescript
import { writable } from 'svelte/store';

export interface Toast {
  id: string;
  message: string;
  variant: 'default' | 'success' | 'warning' | 'danger' | 'info';
  duration: number;
}

export const toastStore = writable<Toast[]>([]);

export function showToast(message: string, variant: Toast['variant'] = 'default', duration = 4000): void {
  const id = crypto.randomUUID();
  toastStore.update((t) => [...t, { id, message, variant, duration }]);
  if (duration > 0) {
    setTimeout(() => dismissToast(id), duration);
  }
}

export function dismissToast(id: string): void {
  toastStore.update((t) => t.filter((x) => x.id !== id));
}
```

Mount a `<Toaster />` component in `+layout.svelte`:

```svelte
<!-- src/lib/components/Toaster.svelte -->
<script lang="ts">
  import { toastStore, dismissToast } from '$lib/stores/toastStore.js';
  import { fly } from 'svelte/transition';
  import { stageFade } from '$lib/transitions/stageMotion.js';
</script>

<div class="toaster" role="region" aria-live="polite" aria-label="Notifications">
  {#each $toastStore as toast (toast.id)}
    <div class="toast toast-{toast.variant}" in:fly={{ y: 20 }} out:stageFade={{ duration: 200 }}>
      <span>{toast.message}</span>
      <button onclick={() => dismissToast(toast.id)} aria-label="Dismiss">×</button>
    </div>
  {/each}
</div>
```

#### 4.4.5 Phase 2 acceptance criteria

- [ ] 18 new components exist in `src/lib/components/` (6 layout + 6 form + 4 content + 3 feedback + 3 nav ish + Icon set).
- [ ] All 7 routes migrated to use `RouteShell` + `RouteHeader`.
- [ ] All inline `<button class="…">` replaced with `<Button>` component.
- [ ] All inline toggles replaced with `<Toggle>`.
- [ ] All 12 inputs in `/recover` replaced with `<Input>` + `<Field>`.
- [ ] `/settings` modal replaced with `<Modal>` (focus trap, Escape, restore-focus).
- [ ] `/codex` expandable cards replaced with `<Accordion>`.
- [ ] All text glyphs (`←`, `→`, `⚙`) replaced with icon components.
- [ ] `<Toaster />` mounted in `+layout.svelte`.
- [ ] Total Svelte route LOC reduced by ≥30% (mostly `<style>` block deletion).
- [ ] All routes pass keyboard-only navigation (Tab, Shift+Tab, Enter, Escape).
- [ ] Axe DevTools reports zero critical violations on all routes.

---

### 4.5 Phase 3 — Responsive Layout & Navigation System (3-4 days)

**Goal:** Make the UI genuinely responsive across mobile, tablet, and desktop. Replace the single-column mobile-only layout with a breakpoint-aware adaptive layout.

#### 4.5.1 Define the breakpoint strategy

| Breakpoint | Min width | Target devices | Layout |
|---|---|---|---|
| `sm` | 480px | Small phones (iPhone SE) | Single column, full-width cards, bottom nav |
| `md` | 768px | Tablets (iPad), large phones | Two-column where useful, sidebar collapses to bottom nav |
| `lg` | 1024px | Small laptops, landscape tablets | Persistent sidebar, multi-column grids |
| `xl` | 1280px | Desktops | Sidebar + main content + optional right rail |
| `2xl` | 1536px | Large desktops | Constrain content max-width, center |

#### 4.5.2 Build adaptive navigation

**Mobile (`< lg`):** Bottom-tab bar with 4-5 items.
```
┌─────────────────────┐
│                     │
│   Route content     │
│                     │
├─────────────────────┤
│ ▶  ◆  ✦  ⚙  ←      │  ← BottomNav (5 items)
└─────────────────────┘
```

**Desktop (`≥ lg`):** Persistent left sidebar.
```
┌──────┬──────────────┐
│ ▶    │              │
│ ◆    │   Route      │
│ ✦    │   content    │
│ ⚙    │              │
│ ←    │              │
└──────┴──────────────┘
```

Items:
- `▶` Continue (→ `/play`)
- `◆` Profile (→ `/profile`)
- `✦` Journal (→ `/journal`)
- `⚙` Settings (→ `/settings`)
- `←` Recover (→ `/recover`, secondary — collapse into "More" menu on mobile if space-constrained)

Create `src/lib/components/BottomNav.svelte` and `src/lib/components/Sidebar.svelte`. Mount the appropriate one in `+layout.svelte` based on `CapabilityProbe`'s `data-input` and a CSS media query:

```svelte
<!-- +layout.svelte -->
<script>
  import BottomNav from '$lib/components/BottomNav.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
</script>

<StageTheme />
<A11yApplier />
<Sidebar class="nav-desktop" />
{@render children()}
<BottomNav class="nav-mobile" />

<style>
  .nav-desktop { display: none; }
  .nav-mobile { display: block; }
  @media (min-width: 1024px) {
    .nav-desktop { display: block; }
    .nav-mobile { display: none; }
  }
</style>
```

Add `aria-current="page"` to the active nav item based on `$page.url.pathname` (SvelteKit store).

#### 4.5.3 Responsive route layouts

For each route, define mobile/tablet/desktop variants:

**`/` (menu hub):**
- Mobile: vertical list of nav cards (current).
- Tablet: 2-column grid of nav cards.
- Desktop: 3-column grid + sidebar (sidebar becomes redundant with the cards, so hide the cards' labels and show only icons on desktop, or replace the cards entirely with the sidebar).

**`/profile`:**
- Mobile: stacked SVG radar + descriptors list.
- Tablet: side-by-side (radar left, descriptors right).
- Desktop: radar + descriptors + right rail with per-line breakdown.

**`/journal`, `/codex`:**
- Mobile: single column.
- Tablet: 2-column masonry.
- Desktop: 2-column + filter sidebar.

**`/settings`:**
- Mobile: single column, all cards stacked.
- Tablet: 2-column (Accessibility + Privacy on left, Account + Data on right).
- Desktop: 3-column or sidebar with sections.

**`/play`:**
- All breakpoints: full-screen Phaser canvas (no change). HUD adapts: mobile shows minimal HUD, desktop shows expanded HUD with minimap, encounter log, etc.

#### 4.5.4 Desktop-specific gameplay affordances

On desktop (`≥ lg`), the `/play` route can show a sidebar alongside the Phaser canvas:
- Encounter log (last 10 encounters)
- Active drives summary
- Quick-jump to specific lines/stages (debug-only, behind a feature flag)

This requires Phaser to either:
- (a) Resize to a smaller canvas when the sidebar is open, OR
- (b) Use `Phaser.Scale.RESIZE` mode instead of `FIT` mode.

Recommendation: switch to `RESIZE` mode for desktop, keep `FIT` for mobile. Detect via `CapabilityProbe` + media query.

#### 4.5.5 PWA improvements

1. **Single source of truth for manifest.** Delete `static/manifest.webmanifest` and let `vite.config.ts`'s `SvelteKitPWA` generate it. Add the `Recover Save` shortcut to the static file if you want to keep both.
2. **Offline fallback page.** Create `static/offline.html` (branded, "You're offline — your progress is saved locally"). Configure `navigateFallback: '/offline.html'` in `vite.config.ts`.
3. **Per-route `theme-color`.** Update `<meta name="theme-color">` in `Seo.svelte` based on `gameStore.currentStage`:
   ```svelte
   <svelte:head>
     <meta name="theme-color" content={stageAccentColor} />
   </svelte:head>
   ```

#### 4.5.6 Phase 3 acceptance criteria

- [ ] `<BottomNav>` renders on screens `< 1024px` with 5 items, `aria-current="page"` on active.
- [ ] `<Sidebar>` renders on screens `≥ 1024px` with same 5 items.
- [ ] All routes have mobile + tablet + desktop layouts verified at 375px, 768px, 1024px, 1280px widths.
- [ ] No layout shift on stage transition (fonts have `size-adjust`).
- [ ] `/play` HUD adapts: minimal on mobile, expanded on desktop.
- [ ] PWA manifest is single-sourced.
- [ ] Offline fallback page works (test by toggling DevTools → Network → Offline).
- [ ] `<meta name="theme-color">` updates per stage.

---

### 4.6 Phase 4 — Phaser ↔ Svelte Boundary Cleanup (3-4 days)

**Goal:** Eliminate `window.location.href` navigation. Unify the accessibility systems. Move non-gameplay UI out of Phaser.

#### 4.6.1 Replace `window.location.href` with SvelteKit `goto()`

**Problem:** Phaser's `WorldScene.ts:93, 98, 433` and `main.ts:142, 148` call `window.location.href = '/…'`, triggering a full page reload and Phaser re-boot (~3-5s on mid-tier phones).

**Solution:** Phaser emits a navigation event; the Svelte `PhaserGameClient.svelte` component listens and calls `goto()`.

Add a new EventBus event:

```typescript
// src/core/events/EventBus.ts — add to GameEvents
'navigate': { href: string }
```

In Phaser scenes, replace `window.location.href`:

```typescript
// WorldScene.ts:93 (before)
.on('pointerdown', () => { window.location.href = '/journal'; });

// WorldScene.ts:93 (after)
.on('pointerdown', () => {
  const bus = this.registry.get(RegistryKeys.EventBus);
  bus?.emit('navigate', { href: '/journal' });
});
```

In `phaserEventAdapter.ts`, subscribe and call `goto()`:

```typescript
import { goto } from '$app/navigation';

unsubscribers.push(
  bus.on('navigate', (payload) => {
    goto(payload.href);
  }),
);
```

This preserves the SvelteKit SPA navigation — no page reload, no Phaser re-boot, instant transition.

#### 4.6.2 Move the `/play` HUD out of Phaser

**Problem:** `WorldScene.ts:84-100` draws an in-canvas HUD (`[Journal] [⚙] [Menu]` text buttons) that duplicates the Svelte `/play` HUD overlay at `routes/play/+page.svelte:41-46`. Two HUDs on the same screen.

**Solution:** Delete the Phaser HUD. The Svelte `/play` HUD overlay is the single source of truth. Add nav items to it:

```svelte
<!-- routes/play/+page.svelte (revised) -->
<header class="play-hud">
  <BackButton onclick={backToMenu} label="Menu" />
  <span class="hud-stage">{stageAesthetic}</span>
  <nav class="hud-nav">
    <IconButton href="/journal" ariaLabel="Journal"><IconBook /></IconButton>
    <IconButton href="/settings" ariaLabel="Settings"><IconSettings /></IconButton>
  </nav>
</header>
<PhaserGameClient />
```

But wait — `IconButton href="/journal"` will trigger SvelteKit navigation, which unmounts `PhaserGameClient` (and destroys Phaser). That may be desired (leaving gameplay) or undesired (just peeking at journal).

**Decision:** Make it desired. When the user clicks Journal from `/play`, they're leaving gameplay. SvelteKit navigation is correct. Phaser should save state on `PhaserGameClient.onDestroy` (already does via `beforeunload` in `main.ts:101`).

If the user wants to "peek" at the journal without leaving gameplay, that's a Phase 5 concern (overlay panel).

#### 4.6.3 Unify the accessibility systems

**Problem:** `src/lib/stores/accessibilityStore.ts` (Svelte) and `src/game/accessibility/AccessibilityManager.ts` (Phaser) are two parallel systems sharing a localStorage key but with no runtime sync.

**Solution:** Make the Svelte store the single source of truth. Phaser's `AccessibilityManager` becomes a thin subscriber.

1. **Delete** `src/game/accessibility/AccessibilityManager.ts` (or reduce it to a read-only view).
2. **Delete** `src/infra/persistence/AccessibilityStore.ts`.
3. **Keep** `src/lib/stores/accessibilityStore.ts` as the single store.
4. In `main.ts`, replace `a11yManager` usage with a subscription to the Svelte store:

```typescript
// main.ts (revised)
import { accessibilityStore } from '$lib/stores/accessibilityStore.js';
import { get } from 'svelte/store';

// Replace Services.a11yManager with a getter:
Services.getA11ySettings = () => get(accessibilityStore);
```

5. Phaser scenes that read `Services.a11yManager.getSettings()` now read `Services.getA11ySettings()`.
6. The `accessibility_changed` EventBus event is no longer needed — the Svelte store is reactive, and `A11yApplier.svelte` writes `data-motion` / `data-contrast` to the DOM. Phaser's `themeBridge.ts` observes those attributes (via the `MutationObserver` already wired in Phase 0) and refreshes.

#### 4.6.4 Move `LLMDialogueRenderer`'s DOM `<textarea>` into Svelte

**Problem:** `LLMDialogueRenderer.ts:778-820` injects a raw `<textarea>` into `document.body`, manually positioned by reading `canvas.getBoundingClientRect()` and repositioned on scroll. Fragile.

**Solution:** Surface the "write-in" state to the Svelte layer via the EventBus. Render a Svelte `<Modal>` containing the `<textarea>`.

1. `LLMDialogueRenderer` emits `writein_requested` event with `{ questionId, currentValue, maxLength }`.
2. `phaserEventAdapter` listens and sets a `writeinStore`:
   ```typescript
   export const writeinStore = writable<{ questionId: string; value: string; maxLength: number } | null>(null);
   ```
3. A `<WriteInModal />` Svelte component in `routes/play/+page.svelte` subscribes and renders the modal:
   ```svelte
   {#if $writeinStore}
     <Modal open onclose={cancelWriteIn} title="Write your response">
       <Input type="textarea" maxlength={$writeinStore.maxLength} value={$writeinStore.value} oninput={updateWriteIn} />
       <Button onclick={submitWriteIn}>Submit</Button>
     </Modal>
   {/if}
   ```
4. On submit, Svelte emits `writein_submitted` back to Phaser via a new `SvelteToPhaserBridge`:

```typescript
// src/lib/bridge/svelteToPhaserBridge.ts
export function emitToPhaser(game: Phaser.Game, event: string, payload: unknown): void {
  const bus = game.registry.get('EventBus');
  bus?.emit(event, payload);
}
```

5. `LLMDialogueRenderer` listens for `writein_submitted` and continues.

This replaces the DOM injection with a proper Svelte modal that has focus trap, Escape handler, and stage-aware styling.

#### 4.6.5 Add a stage-transition overlay

**Problem:** `transformation_triggered` event is emitted but no UI reacts. Stage transitions just snap.

**Solution:** Add a `<StageTransitionOverlay />` in `routes/play/+page.svelte`:

```svelte
<!-- Triggered when transformation_triggered fires -->
{#if $transitionStore}
  <div class="stage-transition-overlay" in:stageDissolve={{ duration: 1200 }}>
    <h2>{$transitionStore.targetStage}</h2>
    <p>{$transitionStore.readiness >= 1 ? 'The gate opens.' : 'A threshold approaches.'}</p>
  </div>
{/if}
```

Wire the `transformation_triggered` event (already added in Phase 0) to set `transitionStore`. Auto-clear after 3s.

#### 4.6.6 Phase 4 acceptance criteria

- [ ] Zero `window.location.href` calls in `src/game/` (grep returns 0 results).
- [ ] Navigation from `/play` to `/journal`, `/settings`, `/` is instant (no page reload, no Phaser re-boot).
- [ ] `WorldScene.ts` no longer draws HUD text — the Svelte `/play` HUD is the only HUD.
- [ ] `AccessibilityManager.ts` is either deleted or reduced to a read-only subscriber of `accessibilityStore`.
- [ ] `LLMDialogueRenderer.ts` no longer injects DOM — write-in is a Svelte `<Modal>`.
- [ ] Stage transitions show a 1.2s overlay before the new stage's palette takes over.
- [ ] Accessibility toggles in `/settings` immediately affect both Svelte and Phaser layers (no reload needed).

---

### 4.7 Phase 5 — World-Class Visual Layer Polish (1-2 weeks)

**Goal:** Elevate the visual layer from "functional" to "world-class." This is the phase where the game stops looking like a prototype and starts looking like a shipped product.

#### 4.7.1 Motion language

The `--ccrpg-motion` token defines a motion language per stage (`pulse`, `drift`, `snap`, `chime`, `tick`, `grow`, `refract`, `dissolve`). Currently `stageMotion.ts` implements 3 transitions (`stageFade`, `stageScale`, `stageFly`). Expand to 8 motion registers, one per stage:

| Stage | Motion | Implementation |
|---|---|---|
| Infrared | `pulse` | Scale 0.96→1 + opacity 0→1, 540ms ease-out |
| Magenta | `drift` | Translate Y ±8px + opacity, 720ms sine |
| Red | `snap` | Scale 0.98→1 + opacity, 180ms cubic-bezier(0.22, 1, 0.36, 1) |
| Amber | `chime` | Scale 1→1.02→1 + opacity, 480ms with two keyframes |
| Orange | `tick` | Translate X 4px→0 + opacity, 160ms linear |
| Green | `grow` | Scale 0.92→1 + opacity, 640ms ease-out |
| Turquoise | `refract` | Scale 1→1.03→1 + opacity + hue-rotate 0→10deg→0, 800ms |
| White | `dissolve` | Opacity + blur(0→4px→0), 1000ms |

Use these in every Svelte transition and every Phaser tween.

#### 4.7.2 Particle & ambient effects

Add ambient particle effects to the Svelte layer (currently only Phaser has them):

- `AmbientLayer.svelte` — a `<canvas>` behind route content that renders stage-themed particles (embers for Red, motes for Magenta, pollen for Green, etc.). Lightweight (~60 FPS, ≤2% CPU).
- Tie to `data-stage` so particles change with the stage.
- Respect `data-motion="reduced"` (no particles when reduced motion is on).

#### 4.7.3 Typography refinement

- Add `font-feature-settings` to body text for ligatures, kerning, and small-caps where appropriate.
- Add `text-rendering: optimizeLegibility`.
- Add `font-variant-numeric: tabular-nums` for any numeric displays (telemetry, encounter counts).
- Add `hyphens: auto` for long-form text (journal entries, codex entries).

#### 4.7.4 Depth & elevation

Currently the Svelte layer has zero `box-shadow` declarations. Add the shadow scale (Phase 1) and apply it:
- Cards: `var(--ccrpg-shadow-sm)` at rest, `var(--ccrpg-shadow-md)` on hover.
- Modals: `var(--ccrpg-shadow-lg)`.
- Active nav items: `var(--ccrpg-shadow-glow)` using `--ccrpg-accent-soft`.

#### 4.7.5 Micro-interactions

- Button press: `scale(0.98)` + `box-shadow` reduction, 80ms.
- Card hover: `translateY(-2px)` + shadow elevation, 180ms.
- Toggle switch: thumb slides with `cubic-bezier(0.4, 0, 0.2, 1)`, 200ms.
- Route enter: stage-aware motion (Phase 5.1).
- Route exit: mirror of enter, 60% duration.

#### 4.7.6 Iconography

Commission or curate a stage-aware icon set. Lucide is fine for utility icons (settings, journal, back). But for gameplay icons (encounter types, drive symbols, shadow quadrants), consider custom SVGs that reflect the stage aesthetic:

- Red stage: sharp, angular icons (sword, shield, fire).
- Amber stage: ornate, gilded icons (chalice, candle, key).
- Green stage: organic, leaf-shaped icons (seed, branch, root).

#### 4.7.7 Sound design (out of scope but flagged)

The current codebase has zero audio. A world-class visual layer is incomplete without sound. Recommend a Phase 6 (post-this-plan) for:
- UI sounds: button press, modal open/close, toggle, toast.
- Ambient soundscapes per stage.
- Encounter sounds: success, failure, transformation.
- Music: per-stage ambient loops.

Wire via Web Audio API, respect `data-motion="reduced"` (mute non-essential sounds), respect `accessibilityStore.soundOptIn`.

#### 4.7.8 Phase 5 acceptance criteria

- [ ] All 8 motion registers implemented in `stageMotion.ts` and consumed by every Svelte transition.
- [ ] `<AmbientLayer />` renders particles on all routes, stage-themed, motion-respecting.
- [ ] All cards have stage-aware shadow elevation.
- [ ] All interactive elements have micro-interactions (press, hover, focus).
- [ ] All utility icons use Lucide; gameplay icons are custom SVG.
- [ ] Visual review by the user: "this looks world-class."

---

## 5. Migration Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Deleting dead renderers loses future-modality code | Medium | Medium | Before Phase 0, confirm with user: archive to `_archive/` if there's any chance of revival. The architecture has moved on, but the user may want to reference them. |
| R2 | `themeBridge.ts` introduces a runtime cost (getComputedStyle on every stage change) | Low | Low | `getComputedStyle` is fast (~0.1ms). Cache the result; only re-read on `data-stage` mutation. |
| R3 | Migrating routes to new components breaks SSR (if re-enabled) | Low | Medium | All routes currently have `ssr = false`. If SSR is re-enabled later, components must be SSR-safe (no `onMount` side effects, no `window` access at module top-level). Audit during Phase 2. |
| R4 | Switching Phaser from `FIT` to `RESIZE` mode for desktop breaks mobile | Medium | High | Detect breakpoint in `PhaserGameClient.svelte` and pass the scale mode as a config option. Test on both. |
| R5 | Removing `LLMDialogueRenderer`'s DOM textarea breaks the write-in flow | Medium | High | Phase 4.4 is high-risk. Implement behind a feature flag (`writein_via_svelte = false` by default). Test thoroughly before flipping. |
| R6 | Font conversion (TTF → WOFF2) drops glyphs | Low | Medium | Use `pyftsubset` to subset to Latin + Latin Extended. Verify all stage display fonts render correctly. |
| R7 | Unifying accessibility stores loses Phaser-side state | Low | Low | The Svelte store already mirrors the Phaser store's shape. Migration is mechanical. |
| R8 | Stage-transition overlay blocks gameplay at the wrong moment | Medium | Medium | Only show overlay when `transformation_triggered` fires (not on every stage change). Auto-clear after 3s. Allow dismissal. |
| R9 | Bottom-nav on mobile takes screen real estate from Phaser | High | Medium | Bottom nav is `position: fixed; height: 56px`. On `/play`, hide the bottom nav (gameplay is full-screen). Show only on menu routes. |
| R10 | Performance regression from new components / animations | Medium | Medium | Benchmark LCP, FID, CLS before and after each phase. Use `data-motion="reduced"` to gate heavy animations. |

---

## 6. File-by-File Change Inventory

### 6.1 Files to DELETE (Phase 0)

```
src/game/scenes/MainMenuScene.ts
src/game/scenes/SettingsScene.ts
src/game/scenes/CodexScene.ts
src/game/scenes/JournalScene.ts
src/game/scenes/RadialChartScene.ts
src/game/ui/Button.ts                          (rebuilt as Svelte component in Phase 2)
src/game/ui/StatBar.ts
src/game/ui/CognitiveOverlay.ts
src/game/assessments/renderers/EmotionRenderer.ts
src/game/assessments/renderers/ScenarioRenderer.ts
src/game/assessments/renderers/PatternRenderer.ts
src/game/assessments/renderers/ReactionTimeRenderer.ts
src/game/assessments/renderers/DilemmaRenderer.ts
src/game/assessments/renderers/NBackRenderer.ts
src/game/assessments/renderers/HoldRenderer.ts
src/game/accessibility/DOMOverlay.ts
src/game/accessibility/FocusManager.ts
src/game/accessibility/HighContrastTheme.ts
src/game/accessibility/ReducedMotionGuard.ts
src/lib/stores/accessibilityStore.ts           (rebuilt unified in Phase 4)
src/infra/persistence/AccessibilityStore.ts    (Phase 4 — superseded by Svelte store)

static/fonts/*.ttf                             (38 unreferenced files)
```

### 6.2 Files to CREATE

```
# Phase 0
src/game/ui/themeBridge.ts                              # CSS token → Phaser bridge

# Phase 1
src/styles/spacing.css                                  # --ccrpg-space-* scale
src/styles/typography.css                               # --ccrpg-text-*, leading, tracking
src/styles/elevation.css                                # --ccrpg-shadow-*, --ccrpg-z-*
src/styles/semantic-colors.css                          # --ccrpg-danger/warning/success/info
src/styles/breakpoints.css                              # @custom-media declarations

# Phase 2 — Layout primitives
src/lib/components/Container.svelte
src/lib/components/Stack.svelte
src/lib/components/Cluster.svelte
src/lib/components/Grid.svelte
src/lib/components/RouteShell.svelte
src/lib/components/RouteHeader.svelte

# Phase 2 — Form & action primitives
src/lib/components/Button.svelte
src/lib/components/IconButton.svelte
src/lib/components/Toggle.svelte
src/lib/components/Input.svelte
src/lib/components/Field.svelte
src/lib/components/Modal.svelte

# Phase 2 — Content primitives
src/lib/components/Card.svelte
src/lib/components/Badge.svelte
src/lib/components/Accordion.svelte
src/lib/components/Toast.svelte
src/lib/components/Toaster.svelte

# Phase 2 — Feedback primitives
src/lib/components/Spinner.svelte
src/lib/components/Skeleton.svelte
src/lib/components/Progress.svelte

# Phase 2 — Navigation primitives
src/lib/components/BottomNav.svelte
src/lib/components/Sidebar.svelte

# Phase 2 — Icons (one per icon, ~30 files)
src/lib/components/icons/IconArrowLeft.svelte
src/lib/components/icons/IconArrowRight.svelte
src/lib/components/icons/IconSettings.svelte
src/lib/components/icons/IconBook.svelte
src/lib/components/icons/IconUser.svelte
src/lib/components/icons/IconPlay.svelte
src/lib/components/icons/IconRecover.svelte
src/lib/components/icons/index.ts                       # re-exports

# Phase 2 — Stores
src/lib/stores/toastStore.ts

# Phase 3
src/lib/components/AmbientLayer.svelte                  # (or Phase 5)

# Phase 4
src/lib/bridge/svelteToPhaserBridge.ts
src/lib/components/WriteInModal.svelte
src/lib/components/StageTransitionOverlay.svelte
src/lib/stores/writeinStore.ts
src/lib/stores/transitionStore.ts
src/lib/components/A11yApplier.svelte                   # (or Phase 0)

# Phase 5
src/lib/transitions/stageMotion.ts                      # expand to 8 registers (modify existing)

# PWA
static/offline.html
```

### 6.3 Files to MODIFY (high-impact, non-exhaustive)

```
# Phase 0 — token bridge
src/game/main.ts                          # init themeBridge
src/game/config.ts                        # use theme tokens
src/game/ui/SceneTransitions.ts           # use theme tokens
src/game/scenes/BootScene.ts              # use theme tokens
src/game/scenes/PreloaderScene.ts         # use theme tokens (12 sites)
src/game/scenes/OnboardingScene.ts        # use theme tokens
src/game/scenes/WorldScene.ts             # use theme tokens (25 sites) + remove window.location.href (3 sites)
src/game/scenes/ReflectionScene.ts        # use theme tokens
src/game/scenes/DilemmaScene.ts           # use theme tokens
src/game/scenes/EncounterSelectionScene.ts # use theme tokens
src/game/scenes/UIOverlayScene.ts         # use theme tokens
src/game/assessments/AssessmentScene.ts   # use theme tokens
src/game/assessments/renderers/LLMDialogueRenderer.ts  # replace local C object with getTheme()
src/game/textures.ts                      # use theme tokens for HeroIdle/EnemyIdle
src/game/keys.ts                          # prune dead SceneKeys
src/lib/bridge/phaserEventAdapter.ts      # add 5 missing event subscriptions
src/routes/+layout.svelte                 # mount A11yApplier
src/routes/settings/+page.svelte          # Escape handler + restore focus (interim)

# Phase 1 — token scales
src/styles/tokens.css                     # append spacing/typography/z/shadow/breakpoints/semantic
src/styles/fonts.css                      # TTF → WOFF2, add size-adjust
src/styles/base.css                       # delete dead #game-root selectors
src/styles/capabilities.css               # wire data-connection rules
src/vite.config.ts                        # PWA manifest cleanup, font glob
src/lib/components/StageTheme.svelte      # fix misleading comment

# Phase 2 — component migration (all 7 routes)
src/routes/+page.svelte                   # use RouteShell, Button, Card, IconButton
src/routes/profile/+page.svelte           # use RouteShell, Card, Grid
src/routes/journal/+page.svelte           # use RouteShell, Card, Badge
src/routes/codex/+page.svelte             # use RouteShell, Accordion
src/routes/settings/+page.svelte          # use RouteShell, Card, Toggle, Modal, Button
src/routes/recover/+page.svelte           # use RouteShell, Input, Field, Button
src/routes/telemetry/+page.svelte         # use RouteShell, Card, Badge
src/routes/play/+page.svelte              # use IconButton for HUD nav
src/routes/+layout.svelte                 # mount Toaster, BottomNav/Sidebar
src/routes/+error.svelte                  # use stageFade instead of raw fade

# Phase 4 — boundary cleanup
src/game/scenes/WorldScene.ts             # delete in-canvas HUD (lines 84-100)
src/game/assessments/renderers/LLMDialogueRenderer.ts  # remove DOM textarea injection
src/game/main.ts                          # remove Services.a11yManager, add getA11ySettings
src/game/accessibility/AccessibilityManager.ts  # reduce to read-only subscriber or delete
```

---

## 7. Sequencing & Effort Estimates

| Phase | Duration (solo dev) | Dependencies | Shippable? |
|---|---|---|---|
| **Phase 0** — Dead code purge + token bridge + critical a11y fixes | 1 day | None | ✅ Yes — immediate win |
| **Phase 1** — Complete token system + WOFF2 fonts | 2-3 days | Phase 0 | ✅ Yes |
| **Phase 2** — Svelte component library + route migration | 5-7 days | Phase 1 | ✅ Yes (incremental — one route at a time) |
| **Phase 3** — Responsive layout + navigation system | 3-4 days | Phase 2 | ✅ Yes |
| **Phase 4** — Phaser ↔ Svelte boundary cleanup | 3-4 days | Phase 2, 3 | ✅ Yes |
| **Phase 5** — Visual layer polish | 1-2 weeks | Phase 4 | ✅ Yes (incremental) |
| **Total** | **4-6 weeks** | | |

**Recommended cadence:**
- Week 1: Phase 0 + start Phase 1.
- Week 2: Finish Phase 1 + start Phase 2.
- Week 3: Finish Phase 2.
- Week 4: Phase 3 + start Phase 4.
- Week 5: Finish Phase 4 + start Phase 5.
- Week 6: Finish Phase 5.

**Commit cadence:** Per the AGENTS.md iteration protocol (§7.5), every phase sub-step must: make changes → `workspace-lint` → `npm run build && npm test` → fix violations → `git commit` → `git push origin main && git push gitlab main`.

---

## 8. Open Questions for the User

These are decisions that affect the refactor and should be confirmed before/during execution:

1. **Dead renderers — archive or delete?** The 7 dead assessment renderers (3,201 LOC) encode a pre-`LLMDialogueRenderer` design. Are they (a) abandoned — delete, or (b) deferred — archive to `_archive/`?

2. **SSR — commit or kill?** `+layout.ts` claims SSR support but every route disables it. Either (a) commit to SPA — delete the SSR branch + the `adapter-cloudflare` dependency, or (b) commit to SSR — delete per-route `ssr = false` overrides and make routes SSR-safe. Recommendation: (a) — the game is a SPA; SSR adds complexity for no benefit.

3. **Dual remotes — keep both?** AGENTS.md §7.5 requires pushing to both GitHub (`origin`) and GitLab (`gitlab`). Is this still required, or has one been deprecated?

4. **Encryption — when?** `cloudSyncStore.ts:13` promises "Phase 3 (future) will add client-side E2E encryption" but it never happened. Save blobs are plaintext JSON POSTed to `/api/save`. Is this a priority for this refactor, or deferred?

5. **Audio — in scope?** The codebase has zero audio. A "world-class visual layer" arguably needs sound. Is a Phase 6 (audio) in scope for this refactor, or separate?

6. **i18n — when?** `infra/i18n/I18n.ts` exists but no route consumes it. The README mentions "globally deployable" and "linguistic localisation of narration" as a Phase 5 concern. Is i18n in scope for this refactor?

7. **Desktop gameplay — full canvas or sidebar?** On desktop, should `/play` be (a) full-screen Phaser with a minimal HUD, or (b) Phaser canvas + persistent sidebar with encounter log, drives summary, etc.? Recommendation: (b) for desktop, (a) for mobile.

8. **Stage-transition overlay — gameplay pause or non-blocking?** When `transformation_triggered` fires, should the overlay (a) pause Phaser (modal), or (b) render non-blocking on top? Recommendation: (a) — a stage transition is a significant moment.

9. **Bottom nav items — which 5?** Recommended: Continue, Profile, Journal, Settings, Recover. But Recover is rarely used — should it be (a) in the bottom nav, (b) in a "More" menu, or (c) only in the sidebar?

10. **Icon set — Lucide or custom?** Lucide is fast and complete. Custom icons can match the stage aesthetic. Recommendation: Lucide for utility icons, custom for gameplay icons.

---

## 9. Success Metrics

How to know the refactor worked:

### 9.1 Quantitative

| Metric | Current | Target | Measurement |
|---|---|---|---|
| Dead code in `src/game/` | 4,247 LOC (53%) | 0 LOC | `rg --files src/game/ \| xargs grep -L "import"` cross-ref |
| Hardcoded hex colors in `src/game/` | 252 | ≤ 10 (textures only) | `rg "0x[0-9a-fA-F]{6}" src/game/ \| wc -l` |
| Inline `fontFamily` strings in `src/game/` | 186 | 0 | `rg "fontFamily" src/game/ \| wc -l` |
| `window.location.href` calls in `src/game/` | 5 | 0 | `rg "window.location.href" src/game/` |
| `getComputedStyle` calls in `src/game/` | 0 | ≥ 1 (themeBridge) | `rg "getComputedStyle" src/game/` |
| Svelte shared components | 5 | ≥ 23 | `ls src/lib/components/*.svelte \| wc -l` |
| Duplicated route shell CSS | ~200 LOC (7×) | 0 (in `RouteShell.svelte`) | manual |
| Media queries in Svelte layer | 3 | ≥ 15 (3+ per breakpoint) | `rg "@media" src/routes src/lib src/styles` |
| Font payload size | 5.3 MB (54 TTF) | < 1.5 MB (16 WOFF2) | `du -sh static/fonts/` |
| Lighthouse Performance (mobile, /play) | unknown | ≥ 90 | Lighthouse CI |
| Lighthouse Accessibility (all routes) | unknown | ≥ 95 | Lighthouse CI |
| Axe critical violations | unknown | 0 | Axe DevTools |

### 9.2 Qualitative

- [ ] Visual parity between Svelte and Phaser layers (same stage = same palette, same fonts, same motion).
- [ ] No full-page reload when navigating between `/play` and menu routes.
- [ ] UI is genuinely usable on a 320px phone, a 768px tablet, and a 2560px desktop.
- [ ] Stage transitions feel intentional, not jarring.
- [ ] Accessibility toggles in `/settings` visibly affect the UI within 1 frame.
- [ ] The game "looks world-class" per the user's subjective review.

---

## 10. Appendix

### 10.1 Audit artifact inventory

- **Phaser audit report** (sub-agent): full per-file breakdown of all 15 scenes, 8 renderers, 4 UI primitives, 6 accessibility modules, config/keys/textures/events/main.
- **Svelte audit report** (sub-agent): full per-route breakdown of all 8 routes, 5 components, 4 stores, 4 CSS files, CapabilityProbe, Capacitor config, PWA manifest.
- **Static analysis grep results**: 252 hex colors, 186 fontFamily strings, 5 `window.location.href` calls, 0 `getComputedStyle` calls, 0 `var(--ccrpg-*)` references in `src/game/`.

### 10.2 Glossary

- **Significator** — the player's persistent soul-pattern (per `docs/foundations/16-significator-architecture.md`). The canonical state vessel.
- **Veil of Forgetting** — the canon principle that the game never reveals raw numbers/stage labels to the player (per `docs/foundations/20-veil-of-forgetting.md`). Enforced via `VeiledStat.svelte` + `veilDescriptors.ts`.
- **Stage** — one of 8 levels of consciousness (Infrared, Magenta, Red, Amber, Orange, Green, Turquoise, White). Each has its own palette, typography, and motion language in `tokens.css`.
- **Line** — one of 8 lines of intelligence (Cognitive, Emotional, Moral, Intrapersonal, Spiritual, Somatic, Willpower, Interpersonal).
- **Modality** — one of 7 game types (Deterministic, LanguageReflective, ScenarioChoice, Embodied, Strategic, SocialCooperative, ImmersiveRPG). Currently only `LLMDialogueRenderer` is live.
- **EventBus** — the typed event emitter in `src/core/events/EventBus.ts`, shared between Phaser scenes and the Svelte bridge.
- **PhaserGameClient** — the single Svelte component (`src/lib/components/PhaserGameClient.svelte`) that mounts Phaser into a `<div>`.
- **phaserEventAdapter** — the one-way bridge (`src/lib/bridge/phaserEventAdapter.ts`) that pipes Phaser EventBus events into Svelte stores.
- **themeBridge** — the proposed Phase 0 module (`src/game/ui/themeBridge.ts`) that reads CSS tokens and exposes them to Phaser as `0x` numbers + fontFamily strings.

### 10.3 References to project canon

- `AGENTS.md` §7.5 — the mandatory iteration protocol (workspace-lint → build → test → commit → push to both remotes).
- `docs/foundations/20-veil-of-forgetting.md` — the Veil canon. All UI must use `VeiledStat` + `veilDescriptors`, never raw numbers.
- `docs/foundations/26-unified-core-architecture.md` — the unified architecture spec.
- `UNIFIED-IMPLEMENTATION-PLAN.md` — the binding build plan. Phase 0–3 marked complete; "Global deploy (web + Android)" is the next planned phase.
- `MVP-BLUEPRINT.md` — vision & philosophy. Canon decision #4: "MVP = modular foundation of everything."

### 10.4 Tools used

- `rg` (ripgrep) — static analysis.
- `wc -l` — LOC counts.
- `find` + `xargs` — file inventory.
- `du -sh` — asset size.
- Manual file reading via the Read tool.
- Two sub-agent explorations (Phaser layer + Svelte layer).

---

*End of audit. Proceed to Phase 0.*
