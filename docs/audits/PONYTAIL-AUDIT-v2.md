# CCRPG Ponytail Audit v2 — CLI + WebUI both first-class

> Revised after user directive: **the TUI (CLI) is retained as a fully operational first-class citizen alongside the WebUI.** All v1 findings re-classified.
> Audit is over-engineering only, not correctness. Whole tree scanned.
> Format: `<tag> <what to cut>. <replacement>. [path]`

---

## 0. Revision summary (what changed from v1)

| v1 cut | v1 verdict | v2 verdict | Reason |
|---|---|---|---|
| `scripts/cli-game.ts` (3,430 LOC) | shrink to ~500 | **keep, mild shrink only** | CLI is first-class — has its own onboarding, glossary, config-file system, multi-profile support |
| `src/core/assessments/cli/TaskRenderers.ts` (2,378 LOC) | delete | **keep** | Called by `AgenticOrchestrator.runModuleAssessment` which fires in the LLM-unavailable fallback path — used by BOTH CLI and WebUI |
| 9 usecase files (NBackTask, StroopTask, etc. — 1,475 LOC) | delete | **delete (still)** | Genuinely dead — `TaskRenderers` reimplements its own inline versions; only the barrel + tests reference them |
| CLI deps (`@clack`, `boxen`, `chalk`, `commander`, `ora`) | move to devDeps | **keep in deps** | CLI ships via `npm run cli` + the `bin` entry; these are runtime deps for the CLI target |
| `src/cli/LayerRenderer.ts` | (implicit) delete | **keep** | Active CLI module — `scripts/cli-game.ts:263` imports `renderLayers`/`renderLayersCompact` |
| `FallbackProvider.ts` (1,465 LOC) | shrink to ~300 | **keep, mild shrink only** | Active fallback path for both CLI and WebUI when LLM unavailable |
| `OnboardingCalibrator` + `ThresholdMaps` | (lumped with usecases) delete | **keep** | CLI imports `ThresholdMaps` directly (L249); `OnboardingCalibrator` uses it; CLI calibration path is live |

**Net change from v1 → v2:** ~8,200 LOC of "cuts" reclassified as "keep". The real cuts are smaller but safer.

---

## 1. YAGNI Cuts (re-ranked, CLI-safe)

1. **delete** entire `src/infra/tdg/` (TDGClient, TDGHooks, TDGBridge, TDGToolAdapter — 1,454 LOC). `maybeFireHook` is a no-op when TDG isn't started; `startTDGBridge()` is called only by `scripts/cli-game.ts` optionally; there is no TDG-Rust binary, no Cargo.toml, no integration. The whole subsystem is speculative. **CLI impact: `cli-game.ts` calls `startTDGBridge()` but it gracefully no-ops — safe to delete the folder and the call site.** [src/infra/tdg/]

2. **delete** entire `src/core/agent/` (PersistentAgent, PersistentAgentBridge, ToolRegistry, CCRPGTools, FallbackNarratives — 1,272 LOC). Only consumer is `src/infra/tdg/TDGBridge.ts` and `src/infra/tdg/TDGToolAdapter.ts` — which are themselves dead (cut #1). **CLI impact: none — `cli-game.ts` does not import from `src/core/agent/` directly.** [src/core/agent/]

3. **delete** 9 dead usecase files (NBackTask, StroopTask, GoNoGoTask, ReactionTimeTask, SimonTask, BreathRhythmTask, HeldInputTask, DilemmaTask, AffectRecognitionTask — ~1,475 LOC). Verified: zero importers outside `src/core/index.ts` barrel (itself dead) and 4 unit-test files. `TaskRenderers.ts` reimplements its own inline versions and does not import these. **Keep `ThresholdMaps.ts`, `FastStaircase.ts`, `Staircase.ts`, `LineCeilings.ts`, `ShadowDetector.ts`, `StageSynthesizer.ts`, `RegistryEngine.ts`, `OnboardingCalibrator.ts` — those ARE consumed.** The 4 unit tests for the dead usecases (`tests/nBackTask.test.ts`, `tests/stroopTask.test.ts`, `tests/goNoGoTask.test.ts`, `tests/simonTask.test.ts`) test pure functions — keep the tests if you want coverage of the algorithms, move them to test the `TaskRenderers` inline versions instead. [src/core/usecases/{NBackTask,StroopTask,GoNoGoTask,ReactionTimeTask,SimonTask,BreathRhythmTask,HeldInputTask,DilemmaTask,AffectRecognitionTask}.ts]

4. **delete** `src/core/index.ts` barrel (67 LOC). Re-exports 14 symbols that nobody imports via `$core` or `@core` bare specifier. All real imports use subpaths (`$core/GameLoop.js`, `$core/engines/CCIEngine.js`, etc.). The barrel exists only to re-export the dead usecases. **CLI impact: none — `cli-game.ts` imports subpaths directly.** [src/core/index.ts]

5. **delete** 36 unreferenced TTF files in `static/fonts/` (~3.5 MB). `fonts.css` references 18 font files; the directory has 54. The 36 extras (Arsenal, GeistMono, Gloock, IBMPlexSerif, etc.) are dead weight in the PWA precache. **CLI impact: none — CLI uses `chalk`, not web fonts.** [static/fonts/]

6. **delete** `src/lib/components/Grid.svelte` (43 LOC). Zero importers. The CSS uses `--cols-tablet` / `--cols-desktop` custom properties that are never set — broken even if used. WebUI-only. [src/lib/components/Grid.svelte]

7. **delete** `src/lib/components/Accordion.svelte` (88 LOC). Zero importers. `/codex` uses inline expandable cards, not this component. WebUI-only. [src/lib/components/Accordion.svelte]

8. **delete** `src/lib/components/Skeleton.svelte` (39 LOC). Zero importers. Was built "for future route-level loading states" — never wired. WebUI-only. [src/lib/components/Skeleton.svelte]

9. **delete** `src/lib/components/Progress.svelte` (32 LOC). Zero importers. WebUI-only. [src/lib/components/Progress.svelte]

10. **delete** `src/lib/components/Field.svelte` (48 LOC). Zero importers. `/settings` and `/recover` use `Input` directly. WebUI-only. [src/lib/components/Field.svelte]

11. **delete** `src/lib/components/Container.svelte` (23 LOC). Zero importers. Every route uses `RouteShell` which has its own max-width. WebUI-only. [src/lib/components/Container.svelte]

12. **delete** `src/infra/persistence/SignificatorStore.ts` + `WorldStateStore.ts` + `AccessibilityStore.ts` (75 LOC). Zero importers. `SaveRepository` + Svelte `accessibilityStore` have fully replaced them. **CLI impact: none — `cli-game.ts` uses `SaveRepository` (file-based) + the CLI's own accessibility is OS-level.** [src/infra/persistence/]

13. **delete** 3 registries: `AbilityRegistry`, `NarrativeRegistry`, `TaskRegistry` + their module files (~162 LOC + 3 registration calls in boot.ts). Registered at boot but **never queried** — `grep "AbilityRegistry\.(get|getAll|filter)"` returns zero hits outside the registration files. **CLI impact: none — CLI does not query these.** [src/core/registries/abilities/, tasks/, narrative/]

14. **delete** `lifeos.config.json` at repo root (26 lines). Zero consumers — `grep "lifeos" src/ scripts/` returns nothing. [lifeos.config.json]

15. **delete** `.oh-my-opencode-pi-stats.json` at repo root. Zero consumers. Editor artifact. [.oh-my-opencode-pi-stats.json]

16. **delete** `src/styles/capabilities.css` lines 89-93 (empty `[data-connection="2g|slow-2g"]` rule with "Phase 3 will add" comment). WebUI-only. [src/styles/capabilities.css:89-93]

17. **delete** `src/lib/components/StageTheme.svelte` lines 10-11 (misleading comment claiming "Phase 2.5: respects prefers-reduced-motion" — the code doesn't do this; `A11yApplier` does). Just delete the lying comment. WebUI-only. [src/lib/components/StageTheme.svelte:10-11]

18. **delete** `src/routes/api/telemetry/+server.ts` — the endpoint exists but `TelemetryService.flush()` only writes to local `TelemetryStore` (localStorage), never POSTs to `/api/telemetry`. The endpoint has zero callers. `hooks.client.ts:5` has a "future: POST to /api/telemetry" comment that was never wired. Either wire it (see gap G3) or delete the endpoint. WebUI-only. [src/routes/api/telemetry/+server.ts]

19. **native** `@sveltejs/adapter-auto` installed but `svelte.config.js` only uses `adapter-cloudflare` + `adapter-static`. `adapter-auto` is unused. WebUI-only. [package.json:48]

20. **native** `@capacitor/*` (4 packages: android, app, core, preferences) — there is no `android/` folder, no native build. `createKeyValueStore()` tries `Capacitor.isNativePlatform()` which always returns false. Either commit to Capacitor (generate the android project) or cut the 4 deps + `CapacitorPreferencesStore.ts`. **CLI impact: none.** [package.json + src/infra/persistence/CapacitorPreferencesStore.ts]

21. **shrink** `src/lib/components/Icon.svelte` — 18 icons hardcoded, only 7 are used (arrow-right, chevron-down, play, user, book, settings, recover — used by BottomNav/Sidebar; the rest are dead). Cut to 7 icons. WebUI-only. [src/lib/components/Icon.svelte]

22. **shrink** `src/core/assessments/AgenticOrchestrator.ts:166-198` — `SHADOW_KEYWORDS` is 41 lines of string arrays (30+ keywords × 4 quadrants). Used for keyword-based shadow detection when the LLM doesn't return a shadow signal. Move to a JSON data file (`src/core/data/shadowKeywords.json`) so the orchestrator is code, not data. **CLI + WebUI shared — both use the orchestrator.** [src/core/assessments/AgenticOrchestrator.ts:166-198]

23. **shrink** `src/infra/llm/ProviderRegistry.ts` (454 LOC) — it resolves config from 6 sources (CLI flags, provider-specific env vars, generic LLM_* env vars, MODEL env var, legacy VITE_LLM_*, ~/.ccrpg/config.json). For a solo project, `process.env.LLM_API_KEY ?? process.env.OPENCODE_API_KEY` + the config file is enough. The 5-source resolution is over-engineered. **CLI-only consumer — `LLMClient.ts` uses it, WebUI goes through the BFF.** [src/infra/llm/ProviderRegistry.ts]

24. **shrink** `src/infra/llm/FallbackProvider.ts` (1,465 LOC → ~600 LOC). 80% is duplicated narrative strings per (line × stage × modality). Collapse to a template + 8 line-templates. **CLI + WebUI shared — both hit fallback when LLM unavailable.** [src/infra/llm/FallbackProvider.ts]

25. **shrink** `scripts/cli-game.ts` (3,430 LOC → ~2,500 LOC). CLI is first-class, but it carries dead weight: the `CALIBRATION_PROMPTS` bank (L529+, ~150 LOC of hardcoded prompts) duplicates `FallbackProvider`; the banner art + boxen usage could be simpler; the `USER_ANSWERS` keyword detection (L603-665) reinvents what the orchestrator's `SHADOW_KEYWORDS` does. Keep the structure, trim the duplication. **CLI-only.** [scripts/cli-game.ts]

26. **shrink** `scripts/check-invariants.ts` (317 LOC) — runs at every build. Some checks may be stale post-Phaser-purge (e.g. registry counts that included dead registries). Audit which checks still matter. [scripts/check-invariants.ts]

---

## 2. What stays (verified live, do NOT cut)

These were flagged in v1 but are confirmed live in the CLI path and must stay:

- **`scripts/cli-game.ts`** — the CLI itself. Has its own onboarding calibration, glossary command, multi-profile support, config-file system, `--headless --json` mode. First-class.
- **`src/cli/LayerRenderer.ts`** — `cli-game.ts:263` imports `renderLayers`/`renderLayersCompact`. Live.
- **`src/core/assessments/cli/TaskRenderers.ts`** — called by `AgenticOrchestrator.runModuleAssessment` (L1269) which fires in the LLM-unavailable fallback path. Live for both CLI and WebUI.
- **`src/infra/llm/FallbackProvider.ts`** — called by `AgenticOrchestrator.runFallback` when LLM is unavailable or returns an error. Live for both CLI and WebUI.
- **`src/core/usecases/ThresholdMaps.ts`** — `cli-game.ts:249` imports `thresholdToStage`. Live.
- **`src/core/usecases/OnboardingCalibrator.ts`** — uses `ThresholdMaps`; CLI calibration path. Live.
- **`src/core/usecases/FastStaircase.ts` + `Staircase.ts`** — imported by `OnboardingCalibrator` + tests. Live.
- **`src/core/usecases/ShadowDetector.ts`** — imported by `EncounterScheduler` + `GreaterCycleEngine` + tests. Live.
- **`src/core/usecases/StageSynthesizer.ts`** — imported by `check-invariants.ts` + tests. Live.
- **`src/core/usecases/RegistryEngine.ts`** — imported by `registries/index.ts`. Live.
- **`src/core/usecases/LineCeilings.ts`** — imported by `StageSynthesizer`. Live.
- **`@clack/prompts`, `boxen`, `chalk`, `commander`, `ora`** — CLI runtime deps. Stay in `dependencies` (the CLI ships via `npm run cli` + the `bin` entry).
- **`tsup.config.ts`** — builds `dist/cli/cli-game.js` for the `bin` entry. Live.

---

## 3. Implementation Gaps & Bugs (unchanged from v1, still valid)

**B1. `gameEngine.ts` `extractDriveDirectionality` produces wrong shadow signals.** The orchestrator returns `driveScores` (0-1 floats) AND emits `driveSignals` (the pathology enum) via the `complete_encounter` tool. But `OrchestratorResult` doesn't expose `driveSignals` on its return type — the gameEngine re-derives them from scores with a hardcoded `< 0.4 = DarkAddicted, > 0.85 = GoldenAddicted` heuristic. This throws away the LLM's actual assessment. **WebUI-only bug — CLI uses the orchestrator directly and gets the real signals.** Fix: add `driveSignals` to `OrchestratorResult` return type, use it in gameEngine. [src/lib/engine/gameEngine.ts:267-283]

**B2. `gameEngine.ts` hardcodes `energeticDirection: 'Sovereign'`, `stageOrientation: 'Homeostatic'`, `sourceOfNourishment: 'Ambivalent'`** for every encounter result. The preserved `src/core/logic/dilemmaMapping.ts` has the real choice→response mapping. The CLI's `AgenticOrchestrator` path produces real `PlayerResponse` via the orchestrator; the WebUI's `gameEngine` wrapper discards it. **WebUI-only bug.** Fix: have the orchestrator return the full `PlayerResponse`, or read `result.consequenceRecord` which carries the real signals. [src/lib/engine/gameEngine.ts:229-237]

**B3. `/api/telemetry` endpoint exists but is never called.** `TelemetryService.flush()` writes to localStorage only. `hooks.client.ts` has a "future: POST to /api/telemetry" comment. Telemetry is opt-in but the opt-in toggle in `/settings` doesn't actually send anything anywhere. The transparency page (`/telemetry`) lists events that never leave the device. **WebUI-only.** [src/infra/telemetry/TelemetryService.ts:32-39 + src/routes/api/telemetry/+server.ts]

**B4. `cloudSyncStore.ts` POSTs plaintext Significator JSON to `/api/save`.** The server comments claim "END-TO-END ENCRYPTED" but the client never encrypts. `CryptoStore` exists but is unused. **WebUI-only — CLI uses file-based persistence.** [src/lib/stores/cloudSyncStore.ts:48]

**B5. `LLMDialogueRunner.svelte` `uiHandler.askUser()` renders multiple questions sequentially in a `for` loop, but the Svelte reactive state (`currentQuestion`, `selectedLabels`, `writeInValue`) is shared across iterations.** If the orchestrator sends 2 questions in one `askUser` call, the second question's state may bleed into the first. In practice the orchestrator sends 1 question per call, but the loop is a latent bug. **WebUI-only.** [src/lib/components/gameplay/LLMDialogueRunner.svelte:55-72]

**B6. `Modal.svelte` focus trap uses `setTimeout(() => modalEl?.focus(), 0)` to focus the modal container** instead of the first focusable child. Minor a11y issue. **WebUI-only.** [src/lib/components/Modal.svelte:42]

**B7. `+layout.svelte` registers `beforeunload` → `flushSync(significator)` but `gameEngine.ts` also has `flushEngine()`.** Neither calls the other. 500ms debounce race. **WebUI-only.** [src/routes/+layout.svelte:47-51 + src/lib/engine/gameEngine.ts:297-301]

**B8. `gameEngine.ts` `declineEncounter()` doesn't emit `encounter_declined` telemetry.** The CLI emits it; the WebUI doesn't. **WebUI-only.** [src/lib/engine/gameEngine.ts:289-296]

**B9. `LLMDialogueRunner.svelte` `exitEncounter()` resolves the pending Promise with `{ selectedLabels: [], writeInValue: '[[player exited encounter]]' }`.** This string leaks into the LLM conversation history. The orchestrator has no abort path — it'll try to evaluate the exit string as a real response. **WebUI-only — CLI uses `@clack` cancel which the orchestrator handles differently.** Fix: add an `AbortSignal` to `AgenticOrchestrator.run()`. [src/lib/components/gameplay/LLMDialogueRunner.svelte:117-122]

**B10. `StageTheme.svelte` comment lies** — claims "Phase 2.5: respects prefers-reduced-motion" but the code doesn't do this; `A11yApplier` does. **WebUI-only.** [src/lib/components/StageTheme.svelte:10-11]

---

## 4. What to EXPAND / develop / enhance (revised)

These are the gaps that actually matter for the game to function, now scoped per UI:

### Shared (CLI + WebUI)
1. **Wire `driveSignals` through `OrchestratorResult`** so `gameEngine` doesn't re-derive them (fixes B1). The orchestrator already requires them in the `complete_encounter` tool schema — just add them to the return type. This fixes the WebUI without affecting the CLI.
2. **Use `dilemmaMapping.ts` in `gameEngine.applyEncounterResult`** (fixes B2). The CLI's orchestrator path already produces real `PlayerResponse`; the WebUI wrapper discards it. Either have the orchestrator return the full response, or have gameEngine read `result.consequenceRecord`.
3. **Add an abort signal to `AgenticOrchestrator.run()`** (fixes B9). When the player exits an encounter (WebUI) or cancels (`@clack` symbol, CLI), the orchestrator should stop the LLM loop cleanly.

### WebUI-only
4. **Wire `/api/telemetry` or delete it** (fixes B3 + B8). If telemetry matters, `TelemetryService.flush()` should POST to `/api/telemetry`, and `gameEngine.declineEncounter()` should emit `encounter_declined`. If it doesn't matter, delete the endpoint + the transparency page's claim.
5. **Encrypt saves before POST** (fixes B4). `CryptoStore` exists. Use it. Or delete the "END-TO-END ENCRYPTED" comments from the server.
6. **Build the 6 missing assessment renderers as Svelte components** (EmotionRenderer, ScenarioRenderer, PatternRenderer, ReactionTimeRenderer, DilemmaRenderer, NBackRenderer, HoldRenderer). These were deleted with Phaser. `TaskRenderers.ts` has the CLI versions; the WebUI needs Svelte equivalents. Currently the WebUI can only run `LanguageReflective` encounters — the other 6 modalities (`Deterministic`, `ScenarioChoice`, `Embodied`, `Strategic`, `SocialCooperative`, `ImmersiveRPG`) have no UI.
7. **Build onboarding calibration for WebUI.** The current `/onboarding` creates a Significator with all lines at `Infrared` — no probing. The CLI has `OnboardingCalibrator` + per-line probes. The WebUI should run a quick probe per line to seed the starting altitudes. The `OnboardingCalibrator` + `ThresholdMaps` + `FastStaircase` usecases are ready to consume.
8. **Wire `transformation_triggered` to a visual overlay.** The `gameEngine` doesn't expose transformation events to the UI. When a stage transition fires, the player should see it (overlay, toast, something). Currently it silently mutates the Significator.

### CLI-only (already mostly working, minor enhancements)
9. **CLI: consider sharing the onboarding calibration prompts with WebUI.** Currently `CALIBRATION_PROMPTS` (L529+ in cli-game.ts) is CLI-only. If WebUI onboarding (gap #7) is built, the prompts should live in `src/core/data/` so both UIs consume them. Avoids duplication.
10. **CLI: the `USER_ANSWERS` keyword detection (L603-665) duplicates `AgenticOrchestrator.SHADOW_KEYWORDS`.** Pick one. The orchestrator's version is more complete.

---

## 5. Net Totals (revised)

**LOC removable (conservative, CLI-safe):**
| # | Cut | LOC | CLI impact |
|---|-----|-----|------------|
| 1 | `src/infra/tdg/` | 1,454 | Remove `startTDGBridge()` call in cli-game.ts (graceful no-op) |
| 2 | `src/core/agent/` | 1,272 | None |
| 3 | 9 dead usecases | ~1,475 | None (CLI uses ThresholdMaps/OnboardingCalibrator, not these) |
| 4 | `src/core/index.ts` barrel | 67 | None (CLI imports subpaths) |
| 5 | 36 unreferenced TTF files | 3.5 MB | None |
| 6-11 | Unused WebUI components (Grid, Accordion, Skeleton, Progress, Field, Container) | 273 | None (WebUI-only) |
| 12 | Dead stores | 75 | None (CLI uses SaveRepository file-based) |
| 13 | Dead registries (Ability, Narrative, Task) | 162 | None |
| 14-15 | lifeos.config.json + .oh-my-opencode-pi-stats.json | ~30 | None |
| 16-17 | Stale CSS rule + lying comment | 7 | None |
| 18 | /api/telemetry endpoint (if not wiring) | ~80 | None |
| **Total** | | **~4,900 LOC + 3.5 MB fonts** | |

**Shrink opportunities (not deletions, code stays but smaller):**
| # | Shrink | From → To | Saves |
|---|--------|-----------|-------|
| 22 | SHADOW_KEYWORDS → JSON data file | 41 LOC → 5 LOC + data | 36 LOC |
| 23 | ProviderRegistry 6-source → 2-source | 454 → ~150 | ~300 LOC |
| 24 | FallbackProvider templates | 1,465 → ~600 | ~865 LOC |
| 25 | cli-game.ts trim duplication | 3,430 → ~2,500 | ~930 LOC |
| 26 | check-invariants.ts prune stale checks | 317 → ~200 | ~117 LOC |
| **Total shrink** | | | **~2,250 LOC** |

**Grand total: ~7,150 LOC + 3.5 MB fonts removable.**

**Dependencies removable:**
| # | Dependency | Why | CLI impact |
|---|------------|-----|------------|
| 1 | `@capacitor/android`, `@capacitor/app`, `@capacitor/core`, `@capacitor/preferences`, `@capacitor/cli` | No android/ folder, no native build | None — CLI doesn't use Capacitor |
| 2 | `@sveltejs/adapter-auto` | Unused — svelte.config.js uses cloudflare + static only | None |
| (conditional) | `vite-pwa` | `@vite-pwa/sveltekit` wraps it; check if both needed | None |

**Dependencies to KEEP (v1 was wrong):**
- `@clack/prompts`, `boxen`, `chalk`, `commander`, `ora` — CLI runtime deps, stay in `dependencies`

---

## 6. Sequencing recommendation

**Phase A — zero-risk deletion (CLI-safe, ~3,000 LOC):**
1. Delete `src/infra/tdg/` + remove `startTDGBridge()` call in cli-game.ts
2. Delete `src/core/agent/`
3. Delete 9 dead usecases + `src/core/index.ts` barrel
4. Delete dead stores + dead registries
5. Delete unused WebUI components (Grid, Accordion, Skeleton, Progress, Field, Container)
6. Delete `lifeos.config.json` + `.oh-my-opencode-pi-stats.json`
7. Delete 36 unreferenced TTF files
8. Run `npm run build && npm test` — verify CLI + WebUI both still build

**Phase B — fix the WebUI functional bugs (gaps G1, G2, B9):**
1. Add `driveSignals` to `OrchestratorResult` return type
2. Use real `PlayerResponse` in `gameEngine.applyEncounterResult` (read from `result.consequenceRecord` or have orchestrator return it)
3. Add `AbortSignal` to `AgenticOrchestrator.run()`; wire `LLMDialogueRunner.exitEncounter()` to it

**Phase C — shrink the big files (~2,250 LOC):**
1. Extract `SHADOW_KEYWORDS` to JSON
2. Simplify `ProviderRegistry` (drop 4 of 6 sources)
3. Template-ize `FallbackProvider`
4. Trim `cli-game.ts` duplication (CALIBRATION_PROMPTS, USER_ANSWERS)
5. Prune `check-invariants.ts`

**Phase D — dependency cleanup:**
1. Drop `@capacitor/*` (4 deps) if no native target
2. Drop `@sveltejs/adapter-auto`
3. Move CLI deps to correct section (they're already in `dependencies` — correct)

**Phase E — WebUI feature parity with CLI (the real expansion):**
1. Build Svelte assessment renderers for the 6 missing modalities
2. Build WebUI onboarding calibration (consume `OnboardingCalibrator` + `ThresholdMaps`)
3. Wire `transformation_triggered` to a visual overlay
4. Wire `/api/telemetry` or delete the endpoint

---

## 7. Summary

The repo is **~7,150 LOC overweight** (~16% of 43,418 total), down from v1's 9,800 estimate. The v1 overcount was because it treated CLI-only modules as dead. With CLI retained as first-class:

- **Cuts are smaller but safer** — 4,900 LOC of pure deletion (zero CLI impact) + 2,250 LOC of shrink
- **The TDG + agent subsystem (2,726 LOC) is still the biggest cut** — speculative, never activated in either UI
- **The 9 dead usecases (1,475 LOC) are still dead** — TaskRenderers reimplements them inline
- **CLI deps stay in `dependencies`** — they're runtime, not dev
- **The real work is Phase E** — WebUI feature parity with CLI (6 missing renderers + onboarding calibration)

The functional bugs (B1, B2, B9) are WebUI-only — the CLI path is correct because it uses the orchestrator directly. Fixing them means making the WebUI wrapper (`gameEngine.ts`) as honest as the CLI's direct orchestrator usage.

*ponytail: CLI is not redundant — it's the reference implementation. The WebUI should match it, not replace it. Every cut in this audit is verified CLI-safe via grep.*
