# CCRPG CLI & Backend Architecture Audit Report

**Date:** June 18, 2026
**Auditor:** Buffy (AI Agent)
**Scope:** Full backend architecture, CLI debugging tool, and alignment with R&D documentation

---

## Executive Summary

The CCRPG backend has a **robust theoretical foundation** (27 foundation docs + 512 concept-drafts) and a **solid architectural skeleton** (engines, domain models, types). However, there is a **critical disconnect** between what the architecture promises and what the code actually delivers at runtime. The CLI debugging tool exposes this gap clearly: encounters complete successfully but **the developmental engine is not running**. The game "acts like" it's performing developmental assessment, but it is not actually doing so.

**Bottom line:** The backend can schedule encounters and present MCQ questions, but it cannot yet deliver an evolutionarily catalytic experience because:
1. The assessment modules exist as data but are never executed during agentic encounters
2. The LLM never sees the assessment tasks, scoring rubrics, or drive probes
3. The consequence engine receives synthetic responses, not real developmental data
4. The CCI/auto-mode/scheduler pipeline runs but produces no meaningful state evolution

---

## 1. What Works ✅

### 1.1 Infrastructure Layer
| Component | Status | Evidence |
|---|---|---|
| Module Registry | ✅ 64 modules registered | `bootModuleRegistry()` loads all 8 lines × 8 stages |
| Assessment Types | ✅ Complete | `StageAssessment`, `AssessmentTask`, `DriveProbe`, `ScoringRubric` all defined |
| Module Content | ✅ Rich | Cognitive/Red has 3 tasks + 20 item pool + 4 drive probes with detailed specs |
| Drive Probes | ✅ Per module | Each module defines agency/communion/eros/agape probes with healthy/addiction/allergy signals |
| Encounter Scheduler | ✅ Operational | Generates candidates, applies 5 filters, computes 7-criterion priority |
| CCI Engine | ✅ Computes | 5-dimension composite from Significator snapshot |
| Auto-Mode Strategy | ✅ Generates | Session themes, weight biases, arc parameters |
| Consequence Engine | ✅ Processes | Polarity traces, drive balance, shadow updates, NPC relationships |
| ContextPipeline | ✅ Builds | 7-step LLM system prompt with frequency conditioning, veil filtering |
| FallbackProvider | ✅ All 7 modalities | Pre-authored content for when LLM is unavailable |
| AgenticOrchestrator | ✅ Runs | LLM + fallback detection + UI handler integration |

### 1.2 CLI Tool
| Feature | Status |
|---|---|
| Session lifecycle | Boot → encounters → endSession() ✅ |
| Encounter scheduling | CCI → AutoMode → Priority formula ✅ |
| LLM integration | gemma-4-31b-it via proxy ✅ |
| Fallback path | Modality-appropriate MCQ content ✅ |
| JSON mode | Structured events for AI-agent consumption ✅ |
| Consequence propagation | Between encounters ✅ |
| Save-on-exit | beforeunload handler ✅ |

---

## 2. Critical Gaps 🔴

### 2.1 The Assessment Module Disconnect (Severity: CRITICAL)

**The #1 problem.** The 64 assessment modules define rich task content (n-back, planning, dilemmas, drive probes), but the AgenticOrchestrator **never passes this content to the LLM**. The orchestrator builds a system prompt from the ContextPipeline, but the ContextPipeline only provides:
- Holon descriptions
- Veil-filtered player state
- Modality rubric
- Consequence history

**What's missing from the LLM context:**
- The actual assessment tasks for this module
- The scoring rubric and dimension weights
- The drive probes and their healthy/pathological response patterns
- The item pool for adaptive difficulty
- The calibration probe for stage inference

**Result:** The LLM generates generic narrative content that has no connection to the specific developmental assessment defined in the module. The encounter "feels" developmental but is not actually measuring anything.

**Evidence from CLI output:**
- Encounter 1 (Willpower:Red): LLM presented "Enemies feint. See through deception." — generic Deterministic framing, not a willpower hold task
- Encounter 2 (Cognitive:Red): LLM presented "The war-drum beats. Match its rhythm or fall." — generic Deterministic framing, not an n-back task
- Encounter 3 (Emotional:Red): LLM presented "Enemies feint. See through deception." — identical to Encounter 1 (same fallback content reused)

### 2.2 The Scoring Disconnect (Severity: CRITICAL)

The `AgenticOrchestrator.finalizeEncounter()` receives the LLM's `complete_encounter` tool call and creates a `PlayerResponse`, but:

1. **All drives get the same directionality:** `params.passed ? 'HealthyBalanced' : 'DarkAddicted'` — every drive gets the same signal regardless of what actually happened
2. **Polarity direction is simplified to 3 states:** `'sto' | 'sts' | 'neutral'` — the rich polarity trace from the architecture spec is reduced to a ternary
3. **Shadow detection is binary:** Either the LLM reports a shadow signal or it doesn't — there's no drive-probe-based detection
4. **No assessment trials are collected:** The `rawTrials` array is always empty because no tasks are actually executed
5. **Confidence is always 0.8:** Hardcoded in `createAssessmentResult()`, not computed from actual data

**Result:** The Significator state evolves, but the evolution is driven by synthetic signals, not real developmental data. The game cannot distinguish between a player who engaged deeply and one who selected the first option in headless mode.

### 2.3 The Priority Formula Degeneracy (Severity: HIGH)

All encounters in the CLI session had **identical priority scores (0.395)**. This indicates the priority formula is producing degenerate output because:

1. **Theta-urgency is maxed:** All lines are at Red with no prior encounters, so `lastTs === 0` returns 1 for every candidate
2. **Shadow activation is zero:** No shadows have been surfaced yet
3. **Polarity alignment is flat:** All cells are in 'Exploring' mode with no history
4. **Transformation readiness is zero:** No lines at edge
5. **Drive correction is zero:** No fixation risk yet
6. **Narrative coherence is zero:** No narrative beats active, no NPC relationships
7. **Session fit is the only differentiator:** But with default 0.5 modality preference, it barely varies

**Result:** The scheduler cannot meaningfully differentiate between encounters. It falls back to line diversification (no more than 2 from same line) which produces a rotation, not a purposeful sequence.

### 2.4 The LLM Interaction Loop (Severity: HIGH)

The AgenticOrchestrator's agentic loop has a structural problem:

1. **First call:** LLM receives the context prompt and is asked to start the encounter
2. **LLM response:** If it calls `ask_user_question`, the CLI presents it and records the answer
3. **LLM continues:** If it calls `complete_encounter`, the encounter ends
4. **Problem:** In the CLI test with the LLM proxy, the encounter produced 3 distinct narrative phases with 4 options each — but the LLM never called `complete_encounter`. It kept generating new questions until the 10-loop safety guard triggered.

**Root cause:** The system prompt says "typically 1-3 choice cycles" but the LLM interprets this as "keep generating encounters." The `complete_encounter` tool is not being called because the LLM doesn't have enough signal to know when the encounter is "done."

**Evidence:** The single encounter test showed 3 rounds of questions before timeout. The 10-encounter session timed out after 3 encounters (the 4th was mid-LLM-call when the timeout hit).

### 2.5 The Concept Draft Disconnect (Severity: MEDIUM)

512 concept-drafts exist across 64 modules × 8 files, but:
- The `ConceptDraftIndex` is passed to the orchestrator as `{ modules: {} }` (empty)
- The ContextPipeline's `injectEncounterSpec()` queries the concept index but gets nothing
- The LLM never sees the per-module game designs that were meticulously authored

**Result:** The concept-drafts — which define the specific game mechanics, narrative themes, shadow mappings, and progression for each module — are not informing the LLM's encounter generation.

### 2.6 The Modality Rotation Problem (Severity: MEDIUM)

The scheduler should rotate modalities to prevent repetition (foundations/24 §7.2), but:
- Encounters 1-3 all used "Deterministic" modality
- The `getEligibleModalities()` function in `CandidateGeneration.ts` selects 2-3 modalities per holon, but the scheduler's line-diversification rule (no more than 2 from same line) interacts poorly with modality selection
- The modality rotation constraint ("no more than 2 consecutive same-modality") is defined in the spec but not implemented in the code

---

## 3. What the Architecture Promises vs What the Code Delivers

| Architectural Promise | Code Status | Gap |
|---|---|---|
| 64 assessment modules with tasks | ✅ Data exists | Tasks are defined but never executed |
| Adaptive staircase (item pool) | ✅ Data exists | Item pool defined but never consulted |
| Drive probes per module | ✅ Data exists | Probes defined but never presented |
| Shadow detection via drive probes | ❌ Not implemented | Shadows only detected if LLM reports them |
| Scoring from actual trials | ❌ Not implemented | Scores are synthetic, not data-driven |
| CCI drives session strategy | ⚠️ Partial | CCI computes but strategy has limited effect |
| Auto-mode weight biasing | ⚠️ Partial | Weights are biased but candidates are degenerate |
| Polarity trace from encounter | ⚠️ Simplified | Ternary (sto/sts/neutral) instead of full trace |
| Transformation detection | ✅ Implemented | `detectThreshold()` runs but never triggers |
| Theta-decay maintenance | ⚠️ Partial | Detects bleed-through but doesn't adjust scheduling |
| Macro-catalyst events | ⚠️ Partial | PESTLE tension accumulates randomly |
| Session arc (warmup/peak/cooldown) | ❌ Not implemented | Session position is computed but not used |
| Non-coercion (player choice) | ❌ Not implemented | CLI auto-selects first option; no encounter offers |
| Infinite checkpoint | ❌ Not implemented | No checkpoint save during encounter |
| Veil enforcement | ✅ Enforced | ContextPipeline filters scores from LLM prompt |

---

## 4. The Evolutionarily Catalytic Assessment

### 4.1 Can the game currently help users evolve their intelligence?

**No.** The game can:
- Schedule encounters across lines and stages ✅
- Present narrative MCQ questions ✅
- Track Significator state across sessions ✅
- Detect transformation thresholds ✅

But it cannot:
- Actually measure cognitive/emotional/moral capacity ❌
- Detect shadow pathology through behavioral signals ❌
- Adapt difficulty based on performance ❌
- Provide developmental feedback grounded in actual assessment ❌
- Guide the player through catalyst→experience→integration ❌
- Distinguish genuine development from superficial engagement ❌

### 4.2 What would make it catalytic?

The missing piece is the **assessment execution pipeline**. The architecture specifies:

```
Module Selection → Task Presentation → Player Response Collection → Trial Scoring → Drive Probe Evaluation → Shadow Detection → Consequence Application → State Mutation
```

Currently, only the first and last steps exist. The entire middle section (task presentation through shadow detection) is bypassed by the AgenticOrchestrator's LLM-driven flow.

---

## 5. Upgrade Recommendations

### Priority 1: Wire Assessment Modules into the Orchestrator (Critical)

**What:** The AgenticOrchestrator must receive the module's tasks, drive probes, and scoring rubric, and incorporate them into the LLM interaction.

**How:**
1. Pass the `StageAssessment` to the orchestrator constructor
2. Include task descriptions and drive probe specs in the system prompt
3. Have the LLM present actual assessment tasks (n-back, dilemmas, etc.) rather than generic narrative
4. Collect structured trial results from the LLM's evaluation of player responses
5. Use `runModeAwareAssessment()` to score actual trials

**Impact:** This single change would connect 90% of the disconnected pipeline.

### Priority 2: Implement Real Shadow Detection (Critical)

**What:** Shadow signals should emerge from drive probe evaluation, not LLM self-report.

**How:**
1. Present drive probes as part of the encounter
2. Score probe responses against healthy/addiction/allergy signals
3. Generate `ShadowSignal` from probe results
4. Feed shadow signals to the scheduler for priority adjustment

### Priority 3: Implement Adaptive Difficulty (High)

**What:** The item pool should be consulted to select appropriate difficulty.

**How:**
1. After each encounter, record performance metrics
2. Use staircase algorithm to select next difficulty level from item pool
3. Update `difficulty` field in subsequent encounter specs

### Priority 4: Fix the LLM Completion Loop (High)

**What:** The LLM should call `complete_encounter` after 1-3 meaningful exchanges.

**How:**
1. Add encounter progress tracking to the system prompt
2. Include a turn counter in the messages
3. Add explicit "encounter budget" to the system prompt rules
4. Consider a simpler completion heuristic: after 2 ask_user responses, auto-complete

### Priority 5: Load Concept Drafts (Medium)

**What:** The 512 concept-drafts should inform LLM encounter generation.

**How:**
1. Build the `ConceptDraftIndex` properly (currently `{ modules: {} }`)
2. Include relevant concept-draft content in the context pipeline
3. Let the LLM draw from the authored game designs

### Priority 6: Implement Session Arc (Medium)

**What:** The warmup/peak/cooldown arc should modulate encounter intensity.

**How:**
1. Use `sessionPosition` from the scheduler to adjust intensity targets
2. Warmup: low-intensity, familiar modalities
3. Peak: high-intensity, priority encounters
4. Cooldown: reflective, integration-focused

---

## 6. CLI as AI-Agent Feedback Loop

### 6.1 Current Capabilities
- ✅ `--headless` mode for automated testing
- ✅ `--json` mode for structured event output
- ✅ `--verbose` mode for narrative flow visibility
- ✅ Consequence history tracking between encounters
- ✅ Session end with theta-decay and summary

### 6.2 Missing for AI-Agent Loops
- ❌ No way to inject custom player responses (always selects first option)
- ❌ No way to test specific line×stage combinations
- ❌ No way to simulate drive pathologies
- ❌ No way to test shadow surfacing/integration flows
- ❌ No way to verify CCI computation correctness at runtime
- ❌ No way to test transformation threshold crossing

### 6.3 Recommended CLI Enhancements
1. `--line=Cognitive --stage=Red` flags to force specific module selection
2. `--responses=2,1,3,4` flag to specify exact option selections per encounter
3. `--simulate-shadow=DarkAddiction:Agency` flag to inject shadow state
4. `--cci-debug` flag to print full CCI dimension breakdown per encounter
5. `--encounter-count=N --pause-after=M` for breakpoint-style debugging

---

## 7. Summary

The CCRPG backend has the theoretical depth and architectural骨架 to deliver an evolutionarily catalytic experience. The 64 assessment modules with their task definitions, drive probes, and scoring rubrics represent years of developmental psychology research translated into game mechanics. The scheduler, CCI, auto-mode, and consequence engines form a coherent pipeline.

**But the pipeline has a hole in the middle.** The assessment modules define WHAT to measure, the consequence engine knows HOW to process results, but nothing actually PRESENTS the assessment tasks or COLLECTS the responses. The AgenticOrchestrator bridges this gap with LLM-generated content, but that content is generic rather than grounded in the module specifications.

**The fix is architectural, not incremental.** The orchestrator needs to be refactored from a "generate narrative encounters" tool into a "execute assessment modules through LLM-mediated interaction" tool. This is the single change that would make the entire system evolutionarily catalytic.

---

*This audit is based on analysis of 15+ source files, 5 foundation documents, the unified implementation plan, and CLI runtime testing across multiple session configurations.*
