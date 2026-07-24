# Mysterium Re-aligned Plan — CLI is the spec, WebUI is the spec + visual layer

> **Architectural principle:** The CLI (`scripts/cli-game.ts`) is the canonical feature implementation — it was how the game was developed. The WebUI must implement **every feature the CLI has**, with a visual layer on top. No WebUI feature exists without a CLI counterpart. No CLI feature is "CLI-only" unless it's structurally terminal-specific (stdin prompts, ANSI colors, process exit).
>
> This document supersedes `Mysterium-ponytail-audit-v2.md`. The cuts are the same (dead code is dead in both UIs). The plan is re-aligned around CLI-as-spec.

---

## 0. The CLI feature inventory (the spec)

Every feature below exists in `scripts/cli-game.ts` and must have a WebUI equivalent.

### 0.1 Subcommands (CLI routes → WebUI routes)

| CLI subcommand | CLI function | WebUI equivalent | Status |
|---|---|---|---|
| `mysterium` (bare) | `runFullSession()` | `/play` | ✅ exists but incomplete |
| `mysterium session` | `runFullSession()` | `/play` | ✅ exists but incomplete |
| `mysterium encounter` | `runSingleEncounter()` | (none — single-encounter picker) | ❌ missing |
| `mysterium diagnostic` | `runDiagnostic()` | (none — system status page) | ❌ missing |
| `mysterium status` | `runStatus()` | `/profile` (partial) | ⚠️ partial |
| `mysterium setup` | `runSetup()` | `/settings` (partial — no LLM config) | ⚠️ partial |
| `mysterium setup-profile` | `runSetupProfile()` | (none — profile creation wizard) | ❌ missing |
| `mysterium profile <action> [name]` | `runProfile()` | (none — multi-profile management) | ❌ missing |
| `mysterium glossary` | `runGlossary()` | (none — glossary page) | ❌ missing |
| `mysterium new-game` | `deleteAllSaves()` + confirm | `/settings` reset button | ✅ exists |

### 0.2 Session flow features

| CLI feature | CLI function | WebUI status |
|---|---|---|
| Full session (N encounters) | `runFullSession()` | ✅ `/play` schedules 3 encounters |
| Direct Questioning mode (8-line flow) | `runDirectQuestioningSession()` | ❌ missing |
| Single encounter mode | `runSingleEncounter()` | ❌ missing |
| Diagnostic mode | `runDiagnostic()` | ❌ missing |
| `--encounters N` flag | respected in full + DQ | ❌ no encounter-count control |
| `--line <line>` flag | force specific line | ❌ no line-forcing |
| `--stage <stage>` flag | force specific stage | ❌ no stage-forcing |
| `--modality <mod>` flag | force specific modality | ❌ no modality-forcing |
| `--force-shadow <quadrant>` | inject shadow keyword | ❌ no shadow injection |
| `--skip-calibration` | skip onboarding probes | ⚠️ WebUI always skips (no calibration) |
| `--answer <text>` / `--answers <file>` | pre-supplied answers | ❌ no answer-file mode (WebUI is interactive) |
| `--headless` / `--json` | non-interactive | ❌ no automation mode (WebUI is interactive) |
| `--verbose` | full narrative + feedback | ❌ no verbose toggle |
| `--dev` | show G_z/P_z, rayProfile, phase | ❌ no dev mode |
| `--no-llm` | module assessments only | ❌ no LLM-toggle (WebUI always uses BFF) |

### 0.3 Onboarding / calibration

| CLI feature | WebUI status |
|---|---|
| `runQuickCalibration()` — 8-line probe with Fisher-Yates shuffle | ❌ WebUI onboarding creates all-Infrared Significator |
| `inferAltitudesFromAnswers()` — keyword-based stage detection from free-text | ❌ missing |
| `CALIBRATION_PROMPTS` — per-line prompts | ❌ missing |
| Hold probe (Somatic, Willpower) — timing accuracy | ❌ missing |
| LLM dialogue probe (other 6 lines) | ❌ missing |
| `createDefaultSignificator()` — with calibrated altitudes | ⚠️ WebUI creates uncalibrated |

### 0.4 Encounter execution

| CLI feature | WebUI status |
|---|---|
| `executeEncounter()` dispatch | ✅ gameEngine.runEncounter |
| `runAgenticEncounter()` — LLM-driven via AgenticOrchestrator | ✅ LLMDialogueRunner |
| All 7 modalities (Deterministic, LanguageReflective, ScenarioChoice, Embodied, Strategic, SocialCooperative, ImmersiveRPG) | ⚠️ only LanguageReflective has a UI |
| `askUser()` handler — MCQ + write-in | ✅ LLMDialogueRunner |
| Shadow-work encounter format | ❌ no shadow-work UI |
| `complete_encounter` tool evaluation | ✅ via orchestrator |
| `--dev` primitive display (G_z/P_z, rayProfile, phase) | ❌ missing |

### 0.5 Display / visual layer (CLI = reference for what info to show)

| CLI display | CLI function | WebUI equivalent |
|---|---|---|
| Altitudes bar chart (8 lines × stages) | `renderAltitudesChart()` | ✅ `/profile` SVG radar |
| CCI display (composite + dimensions) | `renderCCIDisplay()` | ❌ missing |
| Session position (warmup/peak/cooldown) | `renderSessionPosition()` | ❌ missing |
| Shadows display (quadrant + severity) | `renderShadows()` | ❌ missing |
| Drives compass (Agency/Communion/Eros/Agape + fixation) | `renderDrives()` | ⚠️ `/profile` shows descriptor, no compass |
| Lines progress (DQ mode) | `renderLinesProgress()` | ❌ missing |
| Radar chart (ASCII) | `renderRadarChart()` | ✅ `/profile` SVG radar |
| Significator print | `printSignificator()` | ⚠️ `/profile` partial |
| Encounter header (NPC name, narrative role, arc position) | `printEncounter()` | ⚠️ `/play` shows modality badge only |
| Holon name + narrative role surfacing | in `printEncounter()` | ❌ missing |
| Shadow-work indicator (◆ SHADOW-WORK) | in `printEncounter()` | ❌ missing |

### 0.6 Profile system (long-term memory)

| CLI feature | WebUI status |
|---|---|
| Multi-profile support | ❌ WebUI is single-profile (localStorage) |
| `loadProfile()` / `buildContextInjection()` | ❌ missing |
| `migrateLegacySave()` | ❌ missing |
| `appendEncounterLog()` — persistent encounter log | ❌ missing |
| `agentReadProfileFile()` / `agentWriteProfileFile()` — narrative memory | ❌ missing |
| `synthesizeSessionInsights()` — post-session LLM synthesis (INSIGHT/PATTERN/ACTIVE) | ❌ missing |
| `updateProfileAfterSession()` | ❌ missing |
| Profile context injection into LLM system prompt | ❌ missing |

### 0.7 LLM configuration

| CLI feature | WebUI status |
|---|---|
| `runSetup()` wizard — provider selection, API key, model | ❌ WebUI `/settings` has no LLM config |
| `listProviderProfiles()` — dynamic provider registry | ❌ missing in UI (exists in `ProviderRegistry.ts`) |
| Ollama auto-detect | ❌ missing |
| `verifyProviderConnection()` | ❌ missing |
| `validateModelIfFresh()` | ❌ missing |
| Config file (`~/.mysterium/config.json`) | ❌ WebUI uses server-side BFF env vars |
| `checkLLMAvailability()` | ❌ WebUI has no availability check |

### 0.8 Glossary

| CLI feature | WebUI status |
|---|---|
| `runGlossary()` — 22 terms with 1-line definitions | ❌ missing |
| First-run inline glossary (5 key terms) | ❌ missing |

### 0.9 Telemetry / dev observability

| CLI feature | WebUI status |
|---|---|
| `emitEvent()` — JSON event stream for AI agents | ❌ missing |
| `--json` machine-readable output | ❌ missing |
| `--dev` primitive display | ❌ missing |

---

## 1. The re-aligned plan

### Phase A — Delete dead code (dead in BOTH UIs, ~4,900 LOC + 3.5 MB)

These cuts are safe because the code is dead in both the CLI and WebUI paths.

1. **delete** `src/infra/tdg/` (1,454 LOC) — TDG-Rust never started; `maybeFireHook` is a no-op in both UIs. Remove `startTDGBridge()` call in `cli-game.ts`.
2. **delete** `src/core/agent/` (1,272 LOC) — only consumer is the dead TDG subsystem.
3. **delete** 9 dead usecases (1,475 LOC) — NBackTask, StroopTask, GoNoGoTask, ReactionTimeTask, SimonTask, BreathRhythmTask, HeldInputTask, DilemmaTask, AffectRecognitionTask. Only the barrel + tests reference them. `TaskRenderers` reimplements inline. **Keep** ThresholdMaps, OnboardingCalibrator, FastStaircase, Staircase, ShadowDetector, StageSynthesizer, RegistryEngine, LineCeilings — those are live.
4. **delete** `src/core/index.ts` barrel (67 LOC) — zero importers.
5. **delete** 36 unreferenced TTF files (3.5 MB) — 54 on disk, 18 referenced.
6. **delete** 6 unused WebUI components (Grid, Accordion, Skeleton, Progress, Field, Container — 273 LOC).
7. **delete** 3 dead stores (SignificatorStore, WorldStateStore, infra/AccessibilityStore — 75 LOC).
8. **delete** 3 dead registries (Ability, Narrative, Task — 162 LOC).
9. **delete** `lifeos.config.json` + `.oh-my-opencode-pi-stats.json`.
10. **delete** stale CSS rule (`capabilities.css:89-93`) + lying comment (`StageTheme.svelte:10-11`).

**Acceptance:** `npm run build && npm test && npm run cli -- status` all pass. CLI output unchanged.

### Phase B — Fix WebUI divergences from CLI behavior (3 bugs)

The WebUI `gameEngine.ts` wrapper diverges from how the CLI uses the orchestrator directly. Fix these so the WebUI matches CLI behavior:

1. **B1 fix: expose `driveSignals` on `OrchestratorResult`.** The orchestrator already requires `driveSignals` in the `complete_encounter` tool schema — add it to the return type. `gameEngine.ts` stops re-deriving with the bad `< 0.4 = DarkAddicted` heuristic and uses the real signals. [src/core/assessments/AgenticOrchestrator.ts + src/lib/engine/gameEngine.ts]

2. **B2 fix: use real `PlayerResponse` in `gameEngine.applyEncounterResult`.** The CLI's orchestrator path produces a real `PlayerResponse` (energeticDirection, stageOrientation, sourceOfNourishment derived from the player's choice). The WebUI wrapper hardcodes `'Sovereign' / 'Homeostatic' / 'Ambivalent'`. Fix: either have the orchestrator return the full `PlayerResponse`, or read `result.consequenceRecord` (which carries the real signals) in gameEngine. The preserved `src/core/logic/dilemmaMapping.ts` has the choice→response mapping. [src/lib/engine/gameEngine.ts:229-237]

3. **B9 fix: add `AbortSignal` to `AgenticOrchestrator.run()`.** When the player exits an encounter (WebUI) or cancels (`@clack` symbol, CLI), the orchestrator should stop the LLM loop cleanly instead of consuming `[[player exited encounter]]` as a real response. Both UIs benefit. [src/core/assessments/AgenticOrchestrator.ts + src/lib/components/gameplay/LLMDialogueRunner.svelte]

**Acceptance:** WebUI encounter results match CLI encounter results for the same inputs (same drive signals, same consequence record, same narrative summary).

### Phase C — WebUI feature parity with CLI (the real work)

This is the roadmap to make the WebUI match the CLI feature-for-feature. Each item maps to a CLI feature in §0.

#### C.1 Onboarding calibration (parity with `runQuickCalibration`)
- Build a Svelte onboarding flow that runs the 8-line probe (Fisher-Yates shuffle, same as CLI).
- Implement the hold probe (Somatic, Willpower) as a Svelte component — timing-accurate, uses `FastStaircase`.
- Implement the LLM dialogue probe (other 6 lines) — uses the existing `LLMDialogueRunner` with calibration-specific prompts.
- Move `CALIBRATION_PROMPTS` from `cli-game.ts:529` to `src/core/data/calibrationPrompts.ts` so both UIs consume the same source.
- Use `OnboardingCalibrator.calibrate()` + `ThresholdMaps.thresholdToStage()` to seed the Significator.
- **Result:** WebUI onboarding produces a calibrated Significator, same as CLI.

#### C.2 Profile system (parity with CLI multi-profile + long-term memory)
- Build a WebUI profile system using `ProfileManager` (currently CLI-only via file I/O). For the WebUI, profiles live in localStorage + cloud sync.
- Build `/profiles` route — list, create, switch, delete profiles (parity with `mysterium profile`).
- Build profile context injection — the LLM system prompt gets the active profile's context, same as CLI's `process.env.Mysterium_PROFILE_CONTEXT`.
- Build encounter log persistence — every encounter appends to `encounter-log.md` in the profile (parity with `appendEncounterLog`).
- Build narrative memory — `narrative-memory.md` with Key Insights / Patterns / Active Work sections (parity with `agentReadProfileFile`/`agentWriteProfileFile`).
- Build session synthesis — after each session, LLM synthesizes INSIGHT/PATTERN/ACTIVE and writes to narrative memory (parity with `synthesizeSessionInsights`).

#### C.3 LLM configuration (parity with `runSetup` wizard)
- Add LLM config section to `/settings` (or a new `/setup` route).
- Provider selection — consume `listProviderProfiles()` from `ProviderRegistry.ts`.
- API key input — stored in localStorage (client-side) or server-side BFF env (current). Decide: WebUI uses BFF (current, secure) OR allows client-side config (parity with CLI, but exposes key). Recommendation: keep BFF as default, add optional client-side config for self-hosted.
- Model selection — fetch live model list from provider.
- Connection test — `verifyProviderConnection()` parity.
- Ollama auto-detect — for local dev.

#### C.4 Glossary (parity with `runGlossary`)
- Build `/glossary` route — 22 terms with 1-line definitions.
- Move glossary data from `cli-game.ts:3286` to `src/core/data/glossary.ts`.
- First-run inline glossary — show 5 key terms on the root `/` route for first-time users (parity with CLI first-run intro).

#### C.5 Status page (parity with `runStatus`)
- Expand `/profile` (or build `/status`) to show everything CLI `status` shows:
  - Current stage + aesthetic + resonance
  - Milestone descriptor (based on `totalEncounters`)
  - Altitudes chart (8 lines × stages) — already have SVG radar
  - CCI display (composite + dimensions) — **missing, build it**
  - Shadows display (quadrant + severity) — **missing, build it**
  - Drives compass (Agency/Communion/Eros/Agape + fixation risk) — **missing, build it**
  - Session position (warmup/peak/cooldown) — **missing, build it**
  - Lines progress (DQ mode) — **missing, build it**

#### C.6 Encounter display (parity with `printEncounter`)
- Expand `/play` encounter cards to show:
  - NPC name + narrative role (parity with CLI `info('encounter', ...)`)
  - Location name (if holon is a Location)
  - Shadow-work indicator (◆ SHADOW-WORK badge)
  - Session arc position (warmup/peak/cooldown)
- Currently `/play` shows only modality + executionMode badges.

#### C.7 The 6 missing assessment modalities (parity with all 7 modalities)
- The CLI runs all 7 modalities via `TaskRenderers` (fallback) + `AgenticOrchestrator` (LLM). The WebUI only has `LLMDialogueRunner` for `LanguageReflective`.
- Build Svelte renderer components for the other 6:
  - `DeterministicRenderer.svelte` — N-back, Stroop, Go/No-Go, Reaction Time (cognitive tasks)
  - `ScenarioChoiceRenderer.svelte` — dilemma scenarios with MCQ
  - `EmbodiedRenderer.svelte` — rhythm, breath, hold (somatic)
  - `StrategicRenderer.svelte` — war-table-style planning
  - `SocialCooperativeRenderer.svelte` — multi-agent cooperation
  - `ImmersiveRPGRenderer.svelte` — narrative RPG
- Each renderer consumes the same `core/usecases/` engines the CLI's `TaskRenderers` uses (NBackTask, StroopTask, etc. — but those are dead, see Phase A cut #3). **Decision point:** either keep the 9 usecases (don't cut them in Phase A) and build Svelte renderers on top, OR extract the logic from `TaskRenderers` into shared pure functions and build Svelte renderers on those. Recommendation: extract — `TaskRenderers` mixes display (CLI ASCII) with logic (scoring); split them.
- Route the encounter to the correct renderer based on `encounter.modality` in `/play`.

#### C.8 Diagnostic page (parity with `runDiagnostic`)
- Build `/diagnostic` route — system status:
  - LLM availability + model + provider
  - Modules loaded count
  - Holons count
  - Save file location + size
  - Profile info
  - VeilFilter status
  - Telemetry opt-in status

#### C.9 Session control (parity with CLI flags)
- Add session control UI to `/play`:
  - Encounter count selector (parity with `--encounters N`)
  - Line forcing (parity with `--line`) — optional, behind "advanced" toggle
  - Stage forcing (parity with `--stage`) — optional, behind "advanced" toggle
  - Modality forcing (parity with `--modality`) — optional, behind "advanced" toggle
- These let the player (or a researcher) target specific encounters.

#### C.10 Dev mode (parity with `--dev`)
- Add a dev-mode toggle in `/settings` (off by default).
- When on, `/play` and `/profile` show G_z/P_z, rayProfile, phase position — the "holistic primitives" the CLI shows in `--dev` mode.
- Useful for development + research.

#### C.11 Telemetry wiring (parity with CLI `emitEvent`)
- Wire `TelemetryService.flush()` to POST to `/api/telemetry` (currently writes to localStorage only).
- Emit `encounter_declined` from `gameEngine.declineEncounter()` (currently silent).
- Or: if telemetry isn't a real feature, delete the `/api/telemetry` endpoint + the `/telemetry` transparency page's claims. **Decision:** the CLI emits events, so the WebUI should too — wire it.

#### C.12 Save encryption (parity with CLI's secure file-based saves)
- The CLI saves to `~/.mysterium/saves/` (file-system, owner-only). The WebUI POSTs plaintext JSON to `/api/save`. `CryptoStore` exists but is unused.
- Wire `CryptoStore` into `cloudSyncStore.ts` — encrypt before POST, decrypt in `/api/save` server-side OR encrypt client-side and store encrypted blobs (server can't read).
- This is a real gap — the server comments claim "END-TO-END ENCRYPTED" but it's a lie.

### Phase D — Visual layer (the "world-class" part, on top of parity)

Only after Phase C (parity) is complete. The visual layer is what makes the WebUI better than the CLI, not what replaces CLI features.

1. **Stage-themed ambient layer** — ✅ already built (`AmbientLayer.svelte`). Extend per-stage particle configs.
2. **8-stage motion language** — ✅ already built (`stageMotion.ts`). Keep all 8 registers even though only Red is playable (they're cheap and future-proof).
3. **8-stage typography + palette** — ✅ already built (`tokens.css`). Keep all 8 stages.
4. **Micro-interactions** — button press, card hover, toggle slide. ✅ already in components.
5. **Stage-transition overlay** — when `transformation_triggered` fires, show a 1.2s overlay before the new stage's palette takes over. **Build this** (gap from v1).
6. **Sound design** — UI sounds, ambient soundscapes, encounter sounds, music. **New work** (out of scope for this plan, flag for Phase E).
7. **Iconography** — commission stage-aware icon set. ✅ have utility icons (Lucide), need gameplay icons.
8. **Responsive layout** — ✅ BottomNav (mobile) + Sidebar (desktop) built. Verify all new routes (Phase C) are responsive.

### Phase E — Shrink genuine duplication (~2,250 LOC)

Only after Phase C (parity) is complete, so we don't shrink something we're about to need.

1. **Extract `SHADOW_KEYWORDS` to `src/core/data/shadowKeywords.json`** — 41 LOC → 5 LOC + data file. Both UIs consume the same data.
2. **Extract `CALIBRATION_PROMPTS` to `src/core/data/calibrationPrompts.ts`** — from `cli-game.ts:529`. Both UIs consume (Phase C.1 needs this).
3. **Extract glossary data to `src/core/data/glossary.ts`** — from `cli-game.ts:3286`. Both UIs consume (Phase C.4 needs this).
4. **Simplify `ProviderRegistry`** — 6 sources → 2 (env vars + config file). Only if Phase C.3 doesn't need all 6.
5. **Template-ize `FallbackProvider`** — 1,465 → ~600 LOC. Both UIs use it.
6. **Extract `TaskRenderers` logic from display** — split scoring (shared pure functions) from CLI ASCII rendering. Enables Phase C.7 Svelte renderers.
7. **Trim `cli-game.ts` duplication** — `USER_ANSWERS` keyword detection (L603-665) duplicates `SHADOW_KEYWORDS`. Pick one (the orchestrator's version is more complete).

---

## 2. Sequencing

```
Phase A (1 day) — delete dead code (CLI-safe, zero-risk)
  └─ build + test + cli status all pass

Phase B (1-2 days) — fix 3 WebUI divergences
  └─ WebUI encounter results == CLI encounter results

Phase C (3-4 weeks) — WebUI feature parity with CLI
  ├─ C.1 Onboarding calibration (3-4 days)
  ├─ C.2 Profile system (5-7 days)
  ├─ C.3 LLM config (2-3 days)
  ├─ C.4 Glossary (1 day)
  ├─ C.5 Status page expansion (2-3 days)
  ├─ C.6 Encounter display (1 day)
  ├─ C.7 6 missing modalities (7-10 days) ← biggest item
  ├─ C.8 Diagnostic page (1 day)
  ├─ C.9 Session control (1-2 days)
  ├─ C.10 Dev mode (1 day)
  ├─ C.11 Telemetry wiring (1 day)
  └─ C.12 Save encryption (1-2 days)

Phase D (1-2 weeks) — visual layer on top of parity
  └─ stage-transition overlay, sound, iconography

Phase E (2-3 days) — shrink duplication
  └─ extract data files, simplify, template-ize
```

**Total: 5-7 weeks** for full CLI parity + visual layer.

---

## 3. Decision points (need user input before Phase C)

1. **Phase A cut #3 (9 dead usecases):** if Phase C.7 builds Svelte renderers that consume `NBackTask`/`StroopTask`/etc., then these files are NOT dead — they're the engines the new renderers will use. **Two options:**
   - (a) Cut them now (Phase A), then re-extract the logic from `TaskRenderers` into new shared pure functions during Phase C.7.
   - (b) Keep them now, build Svelte renderers on top during Phase C.7, cut `TaskRenderers` instead.
   - **Recommendation: (b)** — the usecases are the clean pure-logic versions; `TaskRenderers` mixes logic with CLI display. Keep the usecases, cut TaskRenderers' display layer.

2. **Phase C.3 (LLM config):** should the WebUI allow client-side LLM config (API key in localStorage, parity with CLI) or stick with server-side BFF (current, more secure)? **Recommendation:** BFF default + optional client-side config for self-hosted/local-dev.

3. **Phase C.11 (telemetry):** wire it or delete it? The CLI emits events; for parity, the WebUI should too. But telemetry is opt-in and the transparency page exists. **Recommendation:** wire it — the infrastructure is there, it just needs the POST call.

4. **Phase C.7 (6 modalities):** are all 6 modalities in scope for the first parity pass, or should we ship LanguageReflective + ScenarioChoice + Deterministic first (the 3 most-used) and defer the other 3? **Recommendation:** ship 3 first, defer 3.

---

## 4. What stays unchanged (CLI is the reference, do not touch)

- `scripts/cli-game.ts` — the CLI itself. First-class. Phase E trims duplication but does not remove features.
- `src/cli/LayerRenderer.ts` — CLI display module.
- `src/core/assessments/cli/TaskRenderers.ts` — CLI fallback path. **Stays unless Phase A cut #3 decision is (b)**, in which case its logic is extracted and the CLI display layer is trimmed.
- `src/infra/llm/FallbackProvider.ts` — active fallback for both UIs. Phase E shrinks it.
- `src/infra/profiles/ProfileManager.ts` — CLI profile system. Phase C.2 builds a WebUI equivalent; the CLI version stays.
- All `core/` engines, domain, registries (except the 3 dead ones in Phase A).
- All `infra/` modules (except TDG in Phase A).
- CLI deps (`@clack`, `boxen`, `chalk`, `commander`, `ora`) stay in `dependencies`.

---

## 5. Summary

The CLI is the spec. The WebUI is the spec + visual layer. The plan:

1. **Phase A:** delete ~4,900 LOC of code dead in BOTH UIs (TDG, agent, dead usecases, dead stores, dead registries, unused WebUI components, unreferenced fonts).
2. **Phase B:** fix 3 WebUI bugs where it diverges from CLI behavior (drive signals, player response, abort signal).
3. **Phase C:** build WebUI parity with CLI — onboarding calibration, profile system, LLM config, glossary, status page, encounter display, 6 missing modalities, diagnostic page, session control, dev mode, telemetry, save encryption. **This is the real work.**
4. **Phase D:** visual layer on top — stage transitions, sound, iconography.
5. **Phase E:** shrink genuine duplication — extract data files, template-ize, simplify.

**The CLI stays operational throughout. The WebUI catches up to it. No CLI feature is cut.**

*ponytail: the CLI is the reference implementation. Every WebUI feature must trace to a CLI feature. Every cut must be dead in both UIs. Every shrink must not break parity.*
