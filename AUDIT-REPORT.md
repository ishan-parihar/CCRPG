# CCRPG Implementation Audit Report & Refactor Plan

> **Date:** 2026-05-21
> **Scope:** Full implementation vs. foundational R&D documentation
> **Method:** Line-by-line contrast of `src/` against `docs/foundations/`, `STAGE-ASSESSMENT-ARCHITECTURE.md`, and `UNIFIED-IMPLEMENTATION-PLAN.md`

---

## Executive Summary

The codebase has **250 source files** and **426 passing tests**. The type system and architectural skeleton are sound. However, a deep audit reveals that **most engines are 20-60% complete** — they have correct interfaces and basic structure but lack the intelligence specified in the foundations. The two near-complete systems (CCIEngine ~90%, AutoModeStrategy ~80%) cannot function properly because the systems they depend on (EncounterScheduler, PriorityComputation, ConsequenceEngine) are skeletal.

**The core logical fallacy:** The implementation builds the *output layer* (CCI computation, strategy generation) before the *input layer* (consequence propagation, drive-health scoring, shadow aggregation). This means the sophisticated CCI/AutoMode logic operates on data that is never properly produced.

---

## Part I: Severity Classification

| Severity | Definition | Count |
|----------|-----------|-------|
| **CRITICAL** | Blocks first-playable; violates core design principles | 12 |
| **HIGH** | Major feature gap; system produces wrong results | 14 |
| **MEDIUM** | Missing feature; workaround possible | 11 |
| **LOW** | Polish/completeness; doesn't block functionality | 8 |

---

## Part II: Critical Findings

### CRITICAL-01: Assessment Modules Lack Item Pools

**Spec:** Each module must have `itemPool: AssessmentItem[]` with ≥20 items and an `itemSelector` function.
**Reality:** Modules have 2-3 `tasks` (task definitions, not items). No `AssessmentItem` interface exists. No item selection strategy.
**Impact:** Anti-repetition impossible. Player sees same content every session. Adaptive testing impossible.
**Files:** `src/core/assessments/types.ts`, all 64 module files.

### CRITICAL-02: No Shadow Aggregation Function

**Spec:** `engine.ts` must produce `ShadowAssessmentResult` with per-drive per-domain health scores (`agency: {dark, golden}, communion: {dark, golden}, ...`).
**Reality:** No function exists to aggregate trial results into `ShadowAssessmentResult`. The type is defined but never constructed.
**Impact:** Shadow detection pipeline is broken. Drive-health is never computed from assessment data.
**Files:** `src/core/assessments/engine.ts`, `src/core/assessments/scoring.ts`

### CRITICAL-03: PriorityComputation — 6 of 7 Scoring Functions Wrong

**Spec (foundations/24 §3):** Each criterion has a specific formula:
- Theta: `decayLevel^1.5`
- Shadow: match on `line AND stage`, compound boost +0.3
- Polarity: mode-specific (diversity/challenge/depth)
- Transformation: edge-line +0.5, dual-shadow +0.5
- Drive: scores candidate if it exercises COMPLEMENT of over-expressed drive
- Narrative: beat match →1.0, holon relationship →0.4
- Session-fit: duration + energy + modality preference

**Reality:**
- Theta: uses raw staleness, no power curve
- Shadow: matches line only, ignores stage, no compound boost
- Polarity: returns 0.5 or coherence — no mode-specific logic
- Transformation: checks stage match + crystallization — completely different logic
- Drive: returns `maxFixation` for ALL candidates (same score regardless of candidate)
- Narrative: penalises same-line repetition (wrong concept entirely)
- Session-fit: maps progress to fixed value, ignores duration/energy/preference

**Impact:** Encounter selection is essentially random. The scheduler cannot prioritise correctly.
**Files:** `src/core/engines/PriorityComputation.ts`

### CRITICAL-04: EncounterScheduler — Skeleton Only

**Spec (foundations/24):** Full scheduler with avoidance handling, tie-breaking, modality rotation, energy management, transformation-mode, macro-catalyst engine, polarity-conditioned selection, shadow-targeting with escalation.
**Reality:** Calls `generateCandidates` + `computePriority`, sorts, returns top N. No avoidance, no tie-breaking, no modality constraints, no energy adjustment, no transformation mode, no macro-catalyst.
**Impact:** The encounter selection system — the game's core intelligence — is non-functional.
**Files:** `src/core/engines/EncounterScheduler.ts`

### CRITICAL-05: ConsequenceEngine — Propagation Unimplemented

**Spec (foundations/19 §8, foundations/22):** Consequences propagate to: holon state, PESTLE tension, faction relationships, NPC relationships, drive balance, altitude shifts, narrative state.
**Reality:** Returns `world` unchanged. `holonDeltas` always `[]`. `altitudeShift` always `null`. Drive balance never updated. PESTLE tension never incremented. Shadow surfacing is generic (always `severity: 0.5`, `drive: 'Agency'`).
**Impact:** The game world never changes in response to player choices. Polarity has no consequences. The developmental loop is broken.
**Files:** `src/core/engines/ConsequenceEngine.ts`

### CRITICAL-06: No Player Choice UI (Non-Coercion Unimplemented)

**Spec (foundations/24 §4):** Player always has 2-5 encounter options. Primary (prominent), secondary (visible), ambient (discoverable). Declining is valid developmental data.
**Reality:** `EncounterScene` receives a SINGLE encounter and immediately dispatches it. No selection screen, no decline option, no choice UI.
**Impact:** Core design principle violated. Player has no agency over encounter selection. Avoidance data (critical for shadow detection) cannot be collected.
**Files:** `src/game/scenes/EncounterScene.ts`, `src/game/logic/encounterRouting.ts`

### CRITICAL-07: AssessmentScene Ignores Execution Mode

**Spec (STAGE-ASSESSMENT-ARCHITECTURE §2):** 4 modes with distinct semantics:
- Calibration: full task set, minimum trials enforced, produces confidence
- Encounter: single-trial from item pool
- Practice: player-chosen, repeatable
- Shadow: same tasks, scored via shadowScoringRubric, produces ShadowAssessmentResult

**Reality:** Mode is accepted in the interface but never read. All modes execute identically (run all tasks sequentially).
**Impact:** Shadow-work encounters don't produce shadow results. Encounter-mode doesn't do single-trial. Practice-mode can't repeat.
**Files:** `src/game/assessments/AssessmentScene.ts`

### CRITICAL-08: No Checkpoint System

**Spec (§5.7):** Infinite checkpoint model. Save state between tasks. Player can leave at any checkpoint. Resume from last checkpoint.
**Reality:** Zero checkpoint logic. Scene runs all tasks to completion with no exit path.
**Impact:** Violates session-length sovereignty. Player cannot leave mid-assessment without losing progress.
**Files:** `src/game/assessments/AssessmentScene.ts`, `src/infra/persistence/`

### CRITICAL-09: Type Mismatch — EncounterScene vs Scheduler Output

**Spec:** Scheduler produces `ScheduledEncounter` (with `moduleRef`, `holonSource`, `polarityMode`, `catalyticPurpose`).
**Reality:** `EncounterScene` accepts legacy `EncounterSpec` (with `enemy`, `taskBinds`, `narrative`). These types are incompatible.
**Impact:** The pipeline is physically broken — scheduler output cannot be consumed by the game layer.
**Files:** `src/game/scenes/EncounterScene.ts`, `src/core/domain/EncounterSpecNew.ts`

### CRITICAL-10: GameLoop Has No Module Execution Step

**Spec:** Pipeline: CCI → AutoMode → Scheduler → **Module Execution** → Significator Mutation.
**Reality:** Loop goes CCI → AutoMode → Scheduler → [GAP] → Mutation. After scheduling, it expects `response` to be provided externally. No `executeModule()` call.
**Impact:** Headless testing of full sessions is impossible. The loop cannot run autonomously.
**Files:** `src/core/GameLoop.ts`

### CRITICAL-11: TransformationDetector — Detection Only, No Process

**Spec (foundations/17):** Transformation is a 3-phase process (Unravelling → Crucible → Emergence) with knot-untying, dual-scoring, and post-transformation rebalancing.
**Reality:** Detects threshold crossing only. No phase tracking, no state machine, no knot-untying, no phase-specific encounter generation, no post-transformation logic.
**Impact:** Stage advancement cannot occur through the canonical process. The game's macro-progression is broken.
**Files:** `src/core/engines/TransformationDetector.ts`

### CRITICAL-12: No Mode-Aware Assessment Runner

**Spec:** `engine.ts` must run assessments differently per mode (calibration converges, encounter is single-trial, shadow scores drive-health).
**Reality:** `runAssessment()` doesn't accept `ModuleExecutionMode`. Always runs in implicit capacity mode.
**Impact:** The 4-mode system exists in types only, not in execution.
**Files:** `src/core/assessments/engine.ts`

---

## Part III: High-Severity Findings

| # | Finding | Spec Source | Files |
|---|---------|-------------|-------|
| HIGH-01 | CandidateGeneration: only 2 of 5 filters implemented (missing narrative gate, modality availability, correct cooldown) | foundations/24 §2 | CandidateGeneration.ts |
| HIGH-02 | CandidateGeneration: hardcodes `modality: 'ImmersiveRPG'` for all candidates | foundations/24 §2 | CandidateGeneration.ts |
| HIGH-03 | PolarityEngine: crystallization uses simple +0.02/-0.01 increment instead of spec formula (`coherence × sigmoid((count-5)/7)`) | foundations/19 §B2 | PolarityEngine.ts |
| HIGH-04 | PolarityEngine: no consequence propagation to world state | foundations/19 §D | PolarityEngine.ts |
| HIGH-05 | PolarityEngine: no temptation mechanic (counter-polarity challenge flagging) | foundations/19 §F3 | PolarityEngine.ts |
| HIGH-06 | ThetaDecay: no urgency power curve (`decayLevel^1.5`) | foundations/24 §3.2.1 | ThetaDecay.ts |
| HIGH-07 | Shadow scoring doesn't map trials to specific drives (no DriveProbe awareness) | foundations/12 §3 | scoring.ts |
| HIGH-08 | No addiction vs allergy discrimination in scoring output | foundations/10 §2 | scoring.ts |
| HIGH-09 | GameLoop `tick()` applies response to wrong encounter (current instead of previous) | UNIFIED-PLAN §III | GameLoop.ts |
| HIGH-10 | GameLoop: no theta-decay timestamp UPDATE after encounter completion | foundations/24 §3.2.1 | GameLoop.ts |
| HIGH-11 | GameLoop: transformation signal detected but never acted upon (no stage advancement) | foundations/17 §2 | GameLoop.ts |
| HIGH-12 | ScheduledEncounter missing `executionMode` field — AssessmentScene can't know which mode to use | STAGE-ASSESSMENT-ARCH §2 | EncounterSpecNew.ts |
| HIGH-13 | No accessibility layer (canvas-only, no ARIA, no focus management, no high-contrast) | UNIFIED-PLAN §5.2 | game/assessments/renderers/ |
| HIGH-14 | `cooperation` and `imitation` task types fall through to PatternRenderer (wrong renderer) | STAGE-ASSESSMENT-ARCH §11 | AssessmentScene.ts |

---

## Part IV: Medium & Low Findings

### Medium

| # | Finding | Files |
|---|---------|-------|
| M-01 | Onboarding doesn't seed drive weights from calibration behavior | CompositeOnboarding.ts |
| M-02 | Onboarding doesn't seed polarity traces | CompositeOnboarding.ts |
| M-03 | Onboarding doesn't detect initial shadow signals | CompositeOnboarding.ts |
| M-04 | No persistence for multi-session onboarding | CompositeOnboarding.ts |
| M-05 | AutoModeStrategy: no post-transformation weight ramp-up interpolation | AutoModeStrategy.ts |
| M-06 | AutoModeStrategy: re-evaluation interval not enforced (could fire every encounter) | AutoModeStrategy.ts |
| M-07 | `dimensionWeights` is `Partial<Record>` — allows omitting dimensions | types.ts |
| M-08 | No minimum-trials enforcement in `runAssessment()` | engine.ts |
| M-09 | PlayerProfile deprecated but still imported/used in some paths | PlayerProfile.ts |
| M-10 | No encounter preview/description UI for informed consent | game/scenes/ |
| M-11 | ConsequenceEngine parses line/stage from encounter ID string (fragile) | ConsequenceEngine.ts |

### Low

| # | Finding | Files |
|---|---------|-------|
| L-01 | Significator missing `distortionLedger` (superset of shadows) | Significator.ts |
| L-02 | No `incarnationCount` or `harvestProgress` fields | Significator.ts |
| L-03 | Lifecycle transitions have no guard logic (state machine) | Significator.ts |
| L-04 | PolarityTrace missing `moduleRef` / `line`/`stage` attribution | PolarityTrace.ts |
| L-05 | Holon missing `catalystFrequency` / `encounterTemplates` | Holon.ts |
| L-06 | No per-line theta decay rate variation | ThetaDecay.ts |
| L-07 | No decay-to-shadow escalation (extreme decay → shadow signal) | ThetaDecay.ts |
| L-08 | CCIEngine: polarity normalisation caps at 0.4 during exploration | CCIEngine.ts |

---

## Part V: Logical Fallacies

### Fallacy 1: Output Before Input

The CCI engine and AutoModeStrategy are sophisticated but operate on data that is never properly produced. The ConsequenceEngine (which PRODUCES the data CCI reads) is a skeleton. This is like building a GPS navigation system before building the road sensors.

**Fix:** Build bottom-up: ConsequenceEngine → PolarityEngine propagation → Shadow aggregation → then CCI/AutoMode can function.

### Fallacy 2: Types Without Execution

`ShadowAssessmentResult`, `ModuleExecutionMode`, `DriveProbe` — all correctly typed but never constructed or consumed. The type system promises capabilities the runtime doesn't deliver.

**Fix:** For each type, implement the function that PRODUCES it and the function that CONSUMES it.

### Fallacy 3: Scheduler Without Intelligence

The encounter scheduler calls `computePriority` but the priority function returns essentially random scores (6/7 criteria wrong). The scheduler then sorts these random scores and returns "top N" — giving the illusion of intelligent selection.

**Fix:** Rewrite PriorityComputation from scratch using the spec formulas verbatim.

### Fallacy 4: Pipeline Disconnection

The pipeline has a physical break: Scheduler produces `ScheduledEncounter` → [type mismatch] → EncounterScene expects `EncounterSpec`. Even if all logic were correct, data cannot flow through the system.

**Fix:** Unify on `ScheduledEncounter` type throughout. Delete legacy `EncounterSpec`.

### Fallacy 5: Assessment Without Adaptation

All 64 modules run identically regardless of mode. The "4 execution modes" exist only as a string enum. The assessment engine has no branching logic for mode-specific behavior.

**Fix:** Implement mode-aware runner with: calibration (converge + confidence), encounter (single-trial), practice (repeat + baseline), shadow (drive-health scoring).

---

## Part VI: Refactor Plan

### Phase R0: Foundation Repair (1 week)

**Goal:** Fix the pipeline so data can flow end-to-end.

| Task | Priority | Est. |
|------|----------|------|
| R0.1: Delete legacy `EncounterSpec`, unify on `ScheduledEncounter` with `executionMode` field | P0 | 2h |
| R0.2: Rewrite `EncounterScene` to consume `ScheduledEncounter` | P0 | 4h |
| R0.3: Add `executionMode` to `ScheduledEncounter` type | P0 | 1h |
| R0.4: Implement mode-aware `runAssessment(mode, module, trials)` in engine.ts | P0 | 4h |
| R0.5: Implement `runShadowAssessment()` → produces `ShadowAssessmentResult` | P0 | 4h |
| R0.6: Wire AssessmentScene to branch on mode (calibration/encounter/practice/shadow) | P0 | 4h |
| R0.7: Fix GameLoop `tick()` response-to-encounter mapping bug | P0 | 1h |
| R0.8: Add module execution step to GameLoop (headless runner) | P0 | 4h |

**Exit criteria:** `npm test` passes. GameLoop can run 5 encounters headlessly with correct mode dispatch.

---

### Phase R1: Consequence & Scoring Pipeline (2 weeks)

**Goal:** Build the input layer that feeds CCI/AutoMode.

| Task | Priority | Est. |
|------|----------|------|
| R1.1: Implement shadow aggregation (trials → per-drive per-domain health scores) | P0 | 8h |
| R1.2: Add DriveProbe awareness to scoring (which trial belongs to which probe) | P0 | 4h |
| R1.3: Implement addiction/allergy discrimination in shadow scoring | P0 | 4h |
| R1.4: Rewrite ConsequenceEngine with full propagation (drive balance, PESTLE, holons, narrative) | P0 | 16h |
| R1.5: Implement theta-decay timestamp update in GameLoop | P1 | 2h |
| R1.6: Implement transformation signal → stage advancement in GameLoop | P1 | 4h |
| R1.7: Add `endSession()` to GameLoop (theta-decay for unvisited, persist state) | P1 | 4h |
| R1.8: Wire PolarityEngine consequence propagation to world state | P1 | 8h |

**Exit criteria:** Full session (20 encounters) produces correct Significator mutations. Drive-health, polarity, shadows all update correctly.

---

### Phase R2: Scheduler Intelligence (2 weeks)

**Goal:** Make encounter selection actually intelligent.

| Task | Priority | Est. |
|------|----------|------|
| R2.1: Rewrite PriorityComputation — all 7 criteria per spec formulas | P0 | 12h |
| R2.2: Implement all 5 candidate filters (narrative gate, modality availability, correct cooldown) | P0 | 8h |
| R2.3: Fix modality generation (per-holon eligible modalities, not hardcoded) | P0 | 4h |
| R2.4: Implement tie-breaking (4 levels per spec) | P1 | 4h |
| R2.5: Implement avoidance handling (record, cooldown, re-present via different modality) | P0 | 8h |
| R2.6: Implement modality rotation constraints (max 2 consecutive same) | P1 | 4h |
| R2.7: Implement energy management (intensity adjustment based on signals) | P1 | 4h |
| R2.8: Implement session arc enforcement (warmup/peak/cooldown intensity ceilings) | P1 | 4h |
| R2.9: Implement polarity-conditioned selection (exploration/crystallizing/crystallized) | P1 | 8h |
| R2.10: Implement shadow-targeting logic with escalation levels | P1 | 8h |

**Exit criteria:** Scheduler produces demonstrably different encounter sequences for different Significator states. Priority scores match spec formulas within 5%.

---

### Phase R3: Transformation Process (1 week)

**Goal:** Implement the full transformation lifecycle.

| Task | Priority | Est. |
|------|----------|------|
| R3.1: Add transformation state machine to TransformationDetector (idle → threshold → unravelling → crucible → emergence → complete) | P0 | 8h |
| R3.2: Implement threshold-mode scheduling (dark-shadow surfacing + golden invitation) | P1 | 8h |
| R3.3: Implement knot-untying pair detection and scheduling | P1 | 8h |
| R3.4: Implement post-transformation rebalancing (weight ramp-up over 5+5 sessions) | P1 | 4h |
| R3.5: Wire transformation completion → Significator altitude advancement | P0 | 4h |
| R3.6: Implement `pendingTransformation` state management | P0 | 2h |

**Exit criteria:** A Significator at threshold can enter transformation, progress through 3 phases, and emerge at new altitude.

---

### Phase R4: Player Agency & Game Layer (2 weeks)

**Goal:** Implement non-coercion and checkpoint systems.

| Task | Priority | Est. |
|------|----------|------|
| R4.1: Build encounter selection UI (2-5 options with primary/secondary/ambient tiers) | P0 | 16h |
| R4.2: Implement decline/avoidance recording + shadow signal on 3+ avoidances | P0 | 4h |
| R4.3: Implement checkpoint system (save between tasks, resume from last) | P0 | 8h |
| R4.4: Add session-length awareness (leave-at-any-time UI, pause/resume) | P1 | 4h |
| R4.5: Add encounter preview (narrative frame, estimated duration, line/stage) | P1 | 8h |
| R4.6: Implement `cooperation`/`imitation` task renderers (or mode-aware PatternRenderer) | P1 | 8h |
| R4.7: Build accessibility layer (DOM overlay, ARIA, focus management, high-contrast) | P1 | 16h |

**Exit criteria:** Player can choose from multiple encounters, decline encounters, leave mid-assessment, and resume. Screen reader can navigate all assessment UIs.

---

### Phase R5: Item Pools & Content Depth (2-3 weeks)

**Goal:** Bring modules to spec content depth.

| Task | Priority | Est. |
|------|----------|------|
| R5.1: Define `AssessmentItem` interface and `ItemSelector` strategy | P0 | 4h |
| R5.2: Add `itemPool` and `itemSelector` to `StageAssessment` type | P0 | 2h |
| R5.3: Implement adaptive item selection (CAT-style or stratified random) | P1 | 8h |
| R5.4: Expand Red stage modules to ≥20 items each (8 modules × 20 items) | P0 | 24h |
| R5.5: Expand remaining 56 modules to ≥20 items each | P2 | 80h+ |
| R5.6: Wire item lifecycle (pool → candidate → selected → active → scored → repool) | P1 | 8h |
| R5.7: Implement anti-repetition (player never sees same item twice per session) | P1 | 4h |

**Exit criteria:** Red stage modules have ≥20 items each. Item selection is adaptive. No repetition within session.

---

### Phase R6: Polish & Completeness (1 week)

**Goal:** Close remaining medium/low gaps.

| Task | Priority | Est. |
|------|----------|------|
| R6.1: PolarityEngine crystallization formula (spec: `coherence × sigmoid((count-5)/7)`) | P1 | 4h |
| R6.2: ThetaDecay urgency power curve (`decayLevel^1.5`) | P1 | 2h |
| R6.3: AutoModeStrategy post-transformation ramp-up interpolation | P1 | 4h |
| R6.4: Onboarding: seed drive weights, polarity traces, initial shadows from calibration | P1 | 8h |
| R6.5: Multi-session onboarding persistence | P2 | 4h |
| R6.6: Remove all PlayerProfile usage, complete migration to Significator | P1 | 4h |
| R6.7: Add lifecycle state machine guards to Significator | P2 | 4h |
| R6.8: Macro-catalyst engine (PESTLE tension accumulation + threshold + event generation) | P2 | 16h |

---

## Part VII: Dependency Graph

```
Phase R0 (Foundation Repair)
    │
    ├──→ Phase R1 (Consequence & Scoring)
    │        │
    │        ├──→ Phase R2 (Scheduler Intelligence)
    │        │        │
    │        │        └──→ Phase R3 (Transformation Process)
    │        │
    │        └──→ Phase R6 (Polish)
    │
    └──→ Phase R4 (Player Agency & Game Layer)
              │
              └──→ Phase R5 (Item Pools & Content)
```

**Critical path:** R0 → R1 → R2 → R3 (7 weeks)
**Parallel track:** R0 → R4 → R5 (5 weeks, can run alongside R1-R3)
**Total estimated:** 8-10 weeks to full spec compliance

---

## Part VIII: What's Working Well (Preserve)

| System | Completeness | Notes |
|--------|-------------|-------|
| CCIEngine | ~90% | 5 dimensions, normalisation, weight adjustment, session signals all correct |
| AutoModeStrategy | ~80% | Strategy generation, weight bias, mid-session adjustment functional |
| Assessment type system | ~85% | DriveProbe, ShadowAssessmentResult, MeasureDimension all correctly defined |
| Module structure (64 modules) | ~70% | All registered, correct drive probes, correct rubrics — just need item pools |
| CompositeOnboarding | ~75% | Binary search correct, convergence correct — needs seeding |
| ThetaDecay | ~75% | Core formula correct — needs urgency curve |
| Registries | ~90% | All 8 registries functional |
| Persistence layer | ~85% | KeyValueStore, SignificatorStore, WorldStateStore all functional |
| LLM infrastructure | ~80% | ContextPipeline, VeilFilter, FrequencyConditioner, FallbackProvider all functional |
| Telemetry | ~90% | Encrypted storage, opt-in collector, developmental reports |
| Build/CI | 100% | TypeScript strict, Vitest, invariant checks, GitHub Actions |

---

## Part IX: Recommended Execution Order

1. **Start with R0** — unblock the pipeline (1 week)
2. **R1 + R4 in parallel** — consequence pipeline + player agency (2 weeks)
3. **R2** — scheduler intelligence (2 weeks)
4. **R3 + R5 in parallel** — transformation + content depth (2 weeks)
5. **R6** — polish (1 week)

After R0+R1+R2, the game will have a functioning developmental loop for the first time. After R4, the player will have agency. After R5, the content will be deep enough for real sessions.

---

## Appendix: Files Requiring Changes

### Must Rewrite (>50% new code)
- `src/core/engines/PriorityComputation.ts`
- `src/core/engines/ConsequenceEngine.ts`
- `src/core/engines/EncounterScheduler.ts`
- `src/core/engines/CandidateGeneration.ts`
- `src/game/scenes/EncounterScene.ts`

### Must Significantly Extend (30-50% new code)
- `src/core/assessments/engine.ts`
- `src/core/assessments/scoring.ts`
- `src/core/engines/TransformationDetector.ts`
- `src/core/engines/PolarityEngine.ts`
- `src/core/GameLoop.ts`
- `src/game/assessments/AssessmentScene.ts`

### Must Moderately Extend (10-30% new code)
- `src/core/assessments/types.ts`
- `src/core/assessments/lifecycle.ts`
- `src/core/engines/ThetaDecay.ts`
- `src/core/engines/AutoModeStrategy.ts`
- `src/core/domain/EncounterSpecNew.ts`
- `src/game/assessments/CompositeOnboarding.ts`
- All 64 module files (add item pools)

### Must Create (new files)
- `src/game/scenes/EncounterSelectionScene.ts` (player choice UI)
- `src/core/assessments/itemSelection.ts` (CAT/adaptive selector)
- `src/core/assessments/shadowAggregation.ts` (trials → ShadowAssessmentResult)
- `src/game/accessibility/AccessibilityOverlay.ts` (DOM-based ARIA layer)
- `src/core/engines/MacroCatalystEngine.ts` (PESTLE tension + events)

---

*End of audit report.*
