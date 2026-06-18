# CCRPG CLI & Backend Audit Report — v4

**Date:** June 18, 2026
**Scope:** CLI debugging tool (`scripts/cli-game.ts`), full game backend pipeline (scheduler → orchestrator → ConsequenceEngine), 64 assessment modules, fallback system, state evolution
**Method:** Full codebase analysis + CLI runtime testing across 8+ configurations (diagnostic, headless session, forced line/stage/modality combinations)

---

## Executive Summary

I audited the CLI debugging tool and the full game backend pipeline. The architectural skeleton is solid: 64 assessment modules with genuine cognitive tasks, a complete priority-driven encounter scheduler, a modality-aware fallback provider with stage-specific content, and a consequence engine that tracks drive health, polarity, and theta decay.

**The good news:** The audit passes 72/72 checks. The CLI boots correctly, loads all 64 modules, schedules encounters with modality diversity, and displays modality-appropriate headers and content. The state machine (Significator → tick → consequences → Significator) functions at the plumbing level — `totalEncounters` increments, theta timestamps update, NPC relationships evolve.

**The bad news:** The system is **functionally degenerate** in every dimension that matters for evolutionary catalysis:

| What it claims to do | What it actually does |
|---|---|
| Present cognitive assessments (n-back, stroop, go/no-go) | Presents generic MCQ choices (Engage/Reflect/Withdraw/Negotiate) |
| Evaluate drive health across 4 drives | Keyword-matches option labels, always returns `HealthyBalanced` |
| Surface and resolve shadows | Never creates a single shadow entry |
| Evolve player stage/altitudes | Player stays at Red stage forever |
| Generate rich narrative summaries | Returns the selected option label as "narrative" |
| Adapt session strategy to player state | CCI stays at 0.5036 forever; theme always "post-transformation" |
| Use LLM for adaptive, context-aware content | LLM is attempted but fails (401), every encounter uses fallback |

**The root cause is one:** The LLM never runs, and the fallback path was never designed to replace it. The fallback provides **narrative scaffolding** but not **developmental assessment**. The 64 assessment modules with their tasks, drive probes, item pools, and scoring rubrics are only ever wired into the LLM system prompt — they are never used by the fallback. The entire Phase 1+2 wiring work (assessment context injection, ConceptDraftIndex, drive probes) is dead code.

---

## 1. CLI Runtime Behavior

### 1.1 Diagnostic Mode ✅ (Working)

```
ModuleRegistry: 64 modules loaded
Holons: 36 total (16 NPCs, 4 factions, 7 locations, 3 creatures, 3 events, 3 artifacts)
Significator: stage=Red, 8 lines at Red
CCI: 0.5036, theme: post-transformation, target: 20 encounters
Scheduler: Willpower:Red, Embodied, warlord-faction, priority 0.401
```

### 1.2 Headless Sessions — Modality-Aware Fallback Content

Forcing `--modality=ScenarioChoice`:
```
🔀 [DECISION CROSSROADS] • A path diverges •
The Conqueror confronts you. The air is tense. A choice must be made.

A rival chieftain sends a messenger bearing gifts and honeyed words...
    [1] Accept the pact and ride together against the common enemy
    [2] Demand hostages as guarantee before committing forces
    [3] Accept the gifts, then strike the rival while their guard is down
    [4] Deceive and maneuver — Use misdirection to your advantage
```

Forcing `--modality=LanguageReflective`:
```
🧘 [REFLECTION BEAT] • Tune in to your inner state •
The Conqueror sits across from you, their gaze steady. The firelight casts long shadows.

You struck first. Why?
    [1] Reflect deeply — Consider the question from multiple angles
    [2] Respond instinctively — Trust your first impulse
    [3] Sit with it — Allow the question to remain open
    [4] Challenge the premise — Question the foundation of what was asked
```

Forcing `--modality=Deterministic`:
```
⏳ [TIMED TRIAL] ▬▬▬▬▬▬▬▬▬▬▬▬▬░ (9.5s remaining)
The war-drum beats. Match its rhythm or fall.
    [1] Engage — Step into the challenge
    [2] Reflect — Consider before acting
    [3] Withdraw — Step back and reassess
    [4] Negotiate — Seek a middle path forward
```

### 1.3 State Evolution After 1 Encounter

```
totalEncounters: 0 → 1 ✓
Altitudes: Red (unchanged) ❌
Shadows surfaced: 0 ❌
Shadows resolved: 0 ❌
narrativeSummary: "Follow the rhythm" (not a narrative) ❌
```

---

## 2. Root Cause Analysis — The Three Pipeline Breaks

### 2.1 🔴 CRITICAL: LLM Never Runs

```
LLM endpoint: http://127.0.0.1:8000/v1
LLM model: gemini/gemma-4-31b-it
Response: {"detail":"Invalid or missing API Key"}
```

The LLM endpoint is running but rejects the API key. `queryLLMWithTools()` returns `{ content: '{"error": "fetch error: 401"}' }`. The orchestrator detects the error prefix and routes to fallback. **Every single encounter uses the fallback path.**

**Impact:** The entire LLM pipeline is dead code:
- `buildAssessmentContext()` injects module tasks/drive-probes/rubrics into the LLM system prompt → never consumed
- `ASK_USER_QUESTION_TOOL` with `allowWriteIn=true` for open-ended responses → never called
- `COMPLETE_ENCOUNTER_TOOL` with per-drive scoring → never called
- 2-exchange budget enforcement → never exercised
- Rich narrative generation by LLM → never happens

### 2.2 🔴 CRITICAL: Fallback Cannot Assess — Only Scaffold

The fallback (`runFallback()`) provides **narrative scaffolding** (a scene, some options) but:
- **No assessment tasks:** Never presents n-back, stroop, go/no-go, hold, pattern prediction, or any other cognitive task. The rich module definitions (20 items per module, graded difficulty 0.2-0.9) are completely unused.
- **Keyword-based evaluation:** `evaluateFallbackResponse()` maps option labels to drive scores using string `.includes()`. The actual player response is never analyzed for depth, coherence, or developmental stage.
- **No shadow surfacing:** `shadowSurfaced` is always null. The ShadowLedger remains empty forever. The entire shadow-based development loop (surfacing → probe → resolve) cannot start.
- **No altitude evolution:** The fallback path produces no altitude shifts. The player stays at Red stage regardless of responses.

### 2.3 🔴 CRITICAL: Module Assessment Content Is Dead Code

The 64 assessment modules contain:
- **Task definitions** (n-back, stroop, go/no-go, hold, pattern prediction, emotion identification, dilemma, etc.)
- **Drive probes** (4 per module with healthyResponse/addictionSignal/allergySignal)
- **Item pools** (20 items per module with graded difficulty)
- **Scoring rubrics** (passThreshold, dimensionWeights)

This content is injected into the LLM system prompt via `buildAssessmentContext()` — but since the LLM never runs, **none of this content is ever used**. The fallback path ignores the module entirely and draws from `getFallback()` which returns generic content.

---

## 3. Detailed Subsystem Analysis

### 3.1 Encounter Scheduler

| Metric | Status | Detail |
|---|---|---|
| Candidate generation | ✅ Working | 36 holons produce candidates |
| Modality selection | ⚠️ Hash-based | No holon has a modality field |
| Priority formula | ⚠️ Degenerate | All candidates ~0.39-0.40 due to 0-signal from shadow/drive/transformation dimensions |
| Theta urgency | ✅ Working | 1.0 for unvisited cells, decays with staleness |
| Session position | ✅ Working | warmup/peak/cooldown based on session progress |

**Root cause of degeneracy:** The priority formula has 7 criteria, but at session start:
- `shadow_activation` = 0 (no shadows ever created)
- `drive_correction` = 0 (all drives HealthyBalanced)
- `narrative_coherence` = 0 (no NPC relationships yet)
- `transformation_readiness` = 0 (no lines at edge, no pending transformation)

The only non-zero signals are `theta_urgency` (1.0 for all, uniform) and `session_fit` (~0.1 based on modality). This produces uniform priorities. The hash-based tiebreaker (max 0.0099) is the only differentiator.

### 3.2 AgenticOrchestrator

| Metric | Status | Detail |
|---|---|---|
| LLM path | 🔴 Never runs | 401 error → immediate fallback routing |
| Fallback path | ⚠️ Runs | Provides generic content per modality/stage |
| Assessment context injection | 🔴 Dead code | `buildAssessmentContext()` called but never consumed |
| Budget enforcement | ⚠️ Never tested | 2-exchange limit only applies in LLM path |
| Tool calling | 🔴 Never exercised | `ask_user_question` and `complete_encounter` tools only called by LLM |

### 3.3 Fallback Evaluation (`evaluateFallbackResponse`)

| Response Type | Polarity | Drive Signals | Notes |
|---|---|---|---|
| "attack", "betray", "raid" | STS | agency=0.8, communion=0.3, eros=0.8, agape=0.3 | Detects STS keywords |
| "alliance", "negotiate", "trust" | STO | agency=0.5, communion=0.8, eros=0.5, agape=0.8 | Detects STO keywords |
| "withdraw", "resist" | Neutral | agency=0.4, communion=0.5, eros=0.3, agape=0.5 | Withdrawal → suppressed eros |
| default | Neutral | All 0.6 | Baseline balanced |

**Limitation:** This is a **keyword lookup**, not an assessment. It cannot:
- Measure response depth or coherence
- Detect stage-appropriate responses
- Surface drive pathologies from response patterns
- Identify shadow quadrants from behavioral signals
- Generate differentiated feedback

### 3.4 Consequence Engine

| Metric | Status | Detail |
|---|---|---|
| Polarity trace recording | ✅ Working | Records energetic direction, drive directionality |
| Theta timestamp update | ✅ Working | Sets `lastEncounter[cellKey] = now` |
| Drive balance update | ✅ Working | Updates weights and fixation risk |
| Shadow entry creation | ✅ Working when triggered | But `shadowSurfaced` is always null |
| NPC relationship update | ✅ Working | Updates strength, encounters count |
| Altitude shift | 🔴 Never triggered | No `altitudeShift` in fallback records |

### 3.5 CCI Engine & Auto-Mode Strategy

| Metric | Status | Detail |
|---|---|---|
| Composite computation | ✅ Working | Normalizes 5 dimensions |
| Theme selection | 🔴 Always "post-transformation" | Bug: `sessionsSinceLastTransformation=0 < 5` for fresh players |
| Intensity budget | ✅ Working | Computes from weakest link |
| Weight adjustment | ✅ Working | Context-sensitive rebalancing |

**Theme bug root cause:** In `SignificatorSnapshot.ts` line 149:
```typescript
const sessionsSinceLastTransformation = lastTransformation
  ? sig.totalSessions
  : sig.totalSessions;
```

This is **always `sig.totalSessions`** regardless of whether `lastTransformation` is null or not! For a fresh player: `totalSessions=0`, `sessionsSinceLastTransformation=0`. In `selectSessionTheme`, 0 < 5 → returns 'post-transformation'.

### 3.6 Transformation Detector

| Metric | Status | Detail |
|---|---|---|
| Threshold detection | ✅ Working | No threshold for fresh player (expected) |
| State machine | ✅ Working | idle → threshold → unravelling → crucible → emergence → complete |
| Knot resolution | ✅ Working | Tracks resolutions in crucible phase |

### 3.7 CLI Forcing Flags

| Flag | Status | Detail |
|---|---|---|
| `--line` | ✅ Working | Filters candidates to matching holon lines |
| `--stage` | ✅ Working | Filters candidates to matching holon stages |
| `--modality` | ✅ Working | Forces modality for fallback content and display |
| `--responses` | ✅ Working | Selects specific option indices |

---

## 4. Assessment Module Depth Analysis

Each module has genuinely rich content that is **never used by the CLI fallback path**:

### Example: Cognitive:Red Module

| Component | Content | Used by Fallback? |
|---|---|---|
| Task 1: n-back (n=2) | 12 trials, 1100ms stimulus, 350ms ISI | ❌ |
| Task 2: Pattern prediction | 2-step Tower of London, 3 disks | ❌ |
| Task 3: Go/No-Go | 20 trials, 70% go ratio, 500ms | ❌ |
| Drive probe: Agency | n-back without hints, independent solving | ❌ |
| Drive probe: Communion | Explain strategy to NPC companion | ❌ |
| Drive probe: Eros | Attempt n=3 (above current level) | ❌ |
| Drive probe: Agape | Do n=1 again with full engagement | ❌ |
| Scoring rubric | passThreshold=0.6, dimensionWeights | ❌ |
| Item pool | 20 items, difficulty 0.2-0.9 | ❌ |

The 64 modules collectively contain **thousands of lines** of assessment content that is structurally unreachable in the current pipeline.

---

## 5. Ontological Gap: Why This Isn't Evolutionarily Catalytic

The R&D documentation (foundations/10-14, 17, 19, 24, 25) defines an evolutionarily catalytic experience as requiring three phases:

### 5.1 Catalyst (Phase 1)

**Required:** A challenge that probes the player's current developmental structure — an n-back task for working memory, a dilemma for moral reasoning, a hold task for willpower.

**Current CLI:** "Engage/Reflect/Withdraw/Negotiate" — these options don't probe any developmental capacity. They invite narrative roleplay, not cognitive or emotional exercise.

### 5.2 Experience (Phase 2)

**Required:** The player's response reveals meaningful signals — drive health, shadow patterns, stage expression, polarity direction. The system measures depth, coherence, self-correction, transfer.

**Current CLI:** `evaluateFallbackResponse()` matches option labels against a keyword list. An "Engage" choice on Cognitive:Red produces the same drive signals as an "Engage" choice on Emotional:Red. No actual measurement occurs.

### 5.3 Integration (Phase 3)

**Required:** The ConsequenceEngine applies meaningful state mutations from real behavioral data — altitude shifts when capacity is demonstrated, shadow entries when pathology is detected, drive rebalancing when imbalance is observed.

**Current CLI:** `consequenceRecord` always has `shadowSurfaced: null`, `altitudeShift: null`, `driveShift: null`. All drives are `HealthyBalanced`. The state machine runs but detects no signals to act on.

### 5.4 The Self-Amplifying Silence

The most insidious problem is **feedback loop silence**:

```
Scheduler: no shadows → no shadow urgency → no shadow encounters
  → no shadow surfacing → no shadow entries → no shadow urgency (loop repeats)

Consequence Engine: no altitude shift signals → no altitude changes
  → player stays at Red → CCI doesn't change → strategy doesn't adapt
  → no altitude shift signals (loop repeats)

LLM: connection fails → fallback used → fallback can't assess
  → no differentiated output → no evidence LLM is needed
  → connection failure is never noticed or fixed
```

The system is "working" in the sense that no errors occur, but it's producing zero developmental value.

---

## 6. Upgrade Recommendations (Ranked by Impact)

### Priority 0: Fix the Theme Bug (5 Minutes)

```typescript
// In SignificatorSnapshot.ts, line 149:
const sessionsSinceLastTransformation = lastTransformation
  ? sig.totalSessions
  : sig.totalSessions; // BUG: both branches are identical

// Fix:
const sessionsSinceLastTransformation = lastTransformation
  ? sig.totalSessions - Math.floor(lastTransformation.triggeredAt / 3600000) // approximate
  : Infinity; // Never transformed = not in post-transformation
```

### Priority 1: Make Fallback Use Module Content (2-3 Days)

The single highest-impact change. Wire the assessment module content into the fallback path so that the CLI presents **actual assessment tasks** instead of generic MCQs:

**For Deterministic modality:** Present the actual n-back / stroop / go/no-go task with:
- Stimuli displayed as ASCII/Unicode sequences
- Player must respond within time windows (simulated with readline timeout)
- Accuracy and response time recorded as `TrialResult` objects

**For ScenarioChoice modality:** Present the module's dilemmas with narrative framing, not generic "Engage/Reflect" options

**For LanguageReflective modality:** Present the module's genuine open-ended prompts and evaluate response depth via keyword/pattern analysis

**For Embodied modality:** Present the module's somatic awareness prompts with timing

This requires:
1. A `renderAssessmentTask()` function that translates each `TaskType` to CLI-appropriate prompts
2. A `collectTrialResults()` function that records responses with timing
3. A `runModuleAssessment()` function that executes a module's tasks sequentially
4. Wired into `runFallback()` as the default path

### Priority 2: Add Fallback Altitude Shifting (1 Day)

The consequence engine already has the `altitudeShift` field. Wire a heuristic:
- After N encounters on a line: check if `HealthyBalanced` drive signals are consistent
- If consistent, advance `stageOrdinal(sig.altitudes[line])` by 1
- This gives the player a growth trajectory even without the LLM

### Priority 3: Add Fallback Shadow Surfacing (1 Day)

Add heuristic shadow detection to `evaluateFallbackResponse()`:
- Consistently selecting STS options across 3+ encounters → surface `DarkAddiction` shadow
- Consistently withdrawing → surface `DarkAversion` shadow  
- Inconsistent patterns → surface `GoldenAllergy` shadow (reaching beyond capacity)
- Record `shadowSurfaced` in the response → ShadowLedger entries get created

### Priority 4: Fix Priority Formula Degeneracy (1 Day)

Add a "novelty bonus" that differentiates candidates:
- Weight theta-urgency by the number of encounters since last visit
- Add a session-arc modifier: early session favors familiar cells, late session favors novel cells
- Ensure different candidates get meaningfully different scores (>0.01 delta)

### Priority 5: Add Holon Modality Assignment (Half Day)

Assign explicit modalities to the 36 holons in `red-layer-holons.json`. Currently all are hash-based. This would give each holon a distinctive assessment character:
- `viper-tactician` → Deterministic (cognitive speed tasks)
- `conqueror` → ScenarioChoice (moral dilemmas)
- `bloodfury` → Embodied (somatic awareness)

### Priority 6: Fix the LLM Connection (Ongoing)

- Check that the API key is correctly configured in `.env`
- The LLM proxy at `http://127.0.0.1:8000/v1` needs the right API key
- Once connected, the entire LLM pipeline activates immediately

---

## 7. Summary

```
Pipeline Layer          Status    Blocked By
─────────────────────────────────────────────────
Encounter Scheduler     ⚠️        Degenerate priorities (no shadow/drive signal)
↓
AgenticOrchestrator     🔴        LLM connection fails (401)
  → LLM path            🔴        Never reached, assessment context dead code
  → Fallback path        ⚠️       Generic content, no module tasks
↓
Fallback Evaluation      ⚠️       Keyword lookup, not real assessment
↓
Consequence Engine       ⚠️       Receives no altitude/shadow signals
↓
Significator             🔴        Altitudes frozen, shadows empty
↓
CCI/Strategy             🔴        Theme always "post-transformation" (bug)
```

**The fix hierarchy is clear:**

1. **Fix the theme bug** (5 mins) — stop telling fresh players they're in post-transformation
2. **Wire module content into fallback** (2-3 days) — the key unlock: turns the CLI from a narrative toy into a real assessment tool
3. **Add fallback altitude shifting** (1 day) — gives growth trajectory
4. **Add fallback shadow surfacing** (1 day) — enables shadow-based development loops
5. **Fix priority degeneracy** (1 day) — makes scheduling purposeful
6. **Connect the LLM** (ongoing) — activates the full adaptive pipeline

Once fixes 1-4 land, the CLI becomes a genuine developmental tool that can test capacities, detect pathologies, and guide evolution — fulfilling the core architectural promise without requiring the LLM for basic operation. The LLM becomes the **enhancer**, not the **necessity**.

---

*This audit is based on analysis of 30+ source files, 8 CLI runtime tests (diagnostic, full session, forced line/stage/modality combinations), 64 assessment module definitions, and the complete game pipeline code (scheduler → orchestrator → ConsequenceEngine → Significator → CCI).*
