# CCRPG CLI & Backend Audit Report — v2

**Date:** June 18, 2026  
**Scope:** CLI debugging tool, backend engines, assessment system, frontend-CLI parity, evolutionary catalysis  
**Method:** Full codebase analysis + CLI runtime testing across diagnostic, single-encounter, and multi-encounter modes

---

## Executive Summary

The CCRPG backend has a **theoretical depth that is genuinely exceptional** — 27 foundation documents, 512 concept-drafts, and 64 assessment modules encoding developmental psychology research into game mechanics. The architectural skeleton (scheduler, CCI, auto-mode, consequence engine, theta-decay, transformation detector) is structurally sound and mostly correct in its pure-function implementations.

**But the system has a fatal gap in the middle:** the assessment pipeline defines WHAT to measure (tasks, drive probes, scoring rubrics), the consequence engine knows HOW to process results (polarity traces, drive balance, shadow updates), but nothing actually PRESENTS assessment tasks or COLLECTS responses. The AgenticOrchestrator bridges this gap with LLM-generated content, but that content is **generic narrative**, not grounded in the module specifications.

**The CLI correctly exposes this gap.** When run in headless mode, every encounter produces the same pattern: "The Conqueror presents a challenge. [generic framing]. [4 generic MCQ options]. [headless selects option 1]. Encounter passed." This is not an evolutionarily catalytic experience — it's a narrative wrapper around an empty engine.

### Severity Matrix

| Gap | Severity | Impact |
|---|---|---|
| Assessment tasks never presented to LLM | 🔴 CRITICAL | The entire measurement system is bypassed |
| Frontend AssessmentScene doesn't pass module to orchestrator | 🔴 CRITICAL | Same gap exists in both CLI and frontend |
| Concept-drafts never loaded (empty index) | 🔴 CRITICAL | 512 authored game designs are invisible to LLM |
| FallbackProvider covers only Red stage | 🔴 CRITICAL | Higher stages degrade to generic content |
| Priority formula degenerate at session start | 🟡 HIGH | Scheduler cannot differentiate encounters |
| No CLI flags for module/shadow/transformation forcing | 🟡 HIGH | AI-agent feedback loops cannot target specific scenarios |
| LLM encounter loop doesn't enforce budget | 🟡 HIGH | Encounters run until safety guard (10 loops) |
| driveSignals not enforced in schema required array | 🟡 MEDIUM | LLM may omit per-drive scoring |
| Modality rotation not enforced | 🟡 MEDIUM | Deterministic dominates early sessions |
| CCI doesn't meaningfully update | 🟡 MEDIUM | Session strategy has limited effect |
| CLI always selects first option (headless) | 🟢 LOW | No way to test write-in or alternate choices |

---

## 1. What Works ✅

### 1.1 Pure Engine Functions (Tested & Correct)

| Component | File | Status |
|---|---|---|
| ThetaDecay | `ThetaDecay.ts` | ✅ Pure, correct exponential decay |
| CandidateGeneration | `CandidateGeneration.ts` | ✅ 5-filter pipeline, modality gating |
| PriorityComputation | `PriorityComputation.ts` | ✅ 7-criterion formula, weight normalization |
| AutoModeStrategy | `AutoModeStrategy.ts` | ✅ 9 themes, weight biases, arc parameterization |
| CCIEngine | `CCIEngine.ts` | ✅ 5-dimension composite from snapshot |
| TransformationDetector | `TransformationDetector.ts` | ✅ Threshold detection + state machine |
| ConsequenceEngine | `ConsequenceEngine.ts` | ✅ Polarity traces, drive balance, shadow ledger |
| Assessment Engine | `engine.ts` | ✅ `runModeAwareAssessment()` for all modes |
| ModuleRegistry | `registry.ts` | ✅ O(1) lookup, cooldowns, filtering |
| ContextPipeline | `ContextPipeline.ts` | ✅ 7-step LLM prompt assembly |

### 1.2 CLI Infrastructure

| Feature | Status | Evidence |
|---|---|---|
| 64 modules registered | ✅ | `bootModuleRegistry()` loads all 8×8 |
| Diagnostic mode | ✅ | Reports state correctly |
| JSON event stream | ✅ | `session_started`, `ask_user`, `encounter_completed`, `session_ended` |
| Consequence propagation | ✅ | Significator updates between encounters |
| Session lifecycle | ✅ | `startSession → tickWithStrategy → endSession` |
| LLM fallback detection | ✅ | Auto-switches to `runFallback()` when LLM unavailable |
| Save-on-exit | ✅ | `beforeunload` handler |
| All 7 modalities defined | ✅ | `ALL_MODALITIES` array in `enums.ts` |

### 1.3 Module Content Quality

Each of the 64 modules contains:
- **2-3 assessment tasks** with specific task types (n_back, stroop, go_no_go, dilemma, emotion_identification, hold, etc.)
- **20-item adaptive pool** with difficulty gradient (0.2 → 0.9)
- **4 drive probes** (agency, communion, eros, agape) with:
  - Task specification (type, parameters, measures)
  - Healthy response description
  - Addiction signal description
  - Allergy signal description
- **Scoring rubric** with pass threshold and dimension weights
- **Optional llmRubric** (e.g., Moral:Red has a detailed Kohlberg Stage 1 rubric)

---

## 2. Critical Gaps — Detailed Analysis

### 2.1 The Assessment Module Disconnect 🔴

**This is the #1 problem. It exists in BOTH CLI and frontend.**

#### CLI Path
```
cli-game.ts → runAgenticEncounter()
  → AgenticOrchestrator({ encounter, module })
    → buildAssessmentContext(module)  ← ✅ Module IS passed (fixed in last session)
    → systemPrompt += assessmentContext  ← ✅ Tasks/drives ARE injected
    → LLM receives: [ASSESSMENT MODULE], [TASKS], [DRIVE PROBES], [SCORING]
    → BUT: LLM still generates generic MCQ narrative  ← ⚠️ Model-dependent
```

The previous session wired the module into the orchestrator's system prompt. However, CLI testing shows the LLM (gemma-4-31b-it via proxy) still produces generic Deterministic-framed content. This suggests either:
1. The model isn't strong enough to follow the assessment context instructions
2. The assessment context isn't prominent enough in the prompt
3. The fallback path is being triggered instead of the LLM path

**Evidence from CLI output:**
- Encounter 1 (Willpower:Red): "Enemies feint. See through deception." — generic Deterministic framing
- Encounter 2 (Cognitive:Red): "The forge awaits. Steel your mind." — same generic framing
- Encounter 3 (Emotional:Red): Same deterministic pattern
- All encounters: Options are always [Engage, Reflect, Withdraw, Negotiate]

#### Frontend Path
```
EncounterScene → creates AssessmentScene
  → AssessmentScene({ module, encounter, onComplete })
    → new AgenticOrchestrator({ encounter, module: undefined })  ← 🔴 MODULE IS UNDEFINED
    → The AssessmentScene DOES pass `module` to AgenticOrchestrator
    → BUT: The module is not passed to the ContextPipeline's ConceptDraftIndex
```

**Wait — correction from code analysis:** The `AssessmentScene.ts` at line 120 does NOT pass `module` to the orchestrator:
```typescript
const orchestrator = new AgenticOrchestrator({
  encounter: this.encounter,
  significator: sig,
  world,
  history,
  conceptIndex,
  uiHandler,
  // ← module is NOT passed here!
});
```

**This means the same gap exists in the frontend.** The frontend's AssessmentScene has access to the module (it receives it in `data.module`) but doesn't pass it to the orchestrator. The assessment context is never injected into the LLM prompt in the frontend either.

### 2.2 The ConceptDraftIndex Is Empty 🔴

**CLI passes `{ modules: {} }` to the orchestrator.**

The `ConceptDraftIndex` is designed to hold per-module metadata (line, stage, title, modalities) that the ContextPipeline queries in `injectEncounterSpec()`. With an empty index:
- `queryByLineStage()` returns `undefined`
- The `catalyticPurpose` defaults to `'catalytic engagement'`
- The LLM has no awareness of the 512 authored game designs

**The index should be built from the module registry**, as the frontend's `AssessmentScene.ts` already does at line 98:
```typescript
const conceptModules: Record<string, any> = {};
if (moduleRegistry) {
  for (const mod of moduleRegistry.getAll()) {
    const key = `${mod.line.toLowerCase()}:${mod.stage.toLowerCase()}`;
    conceptModules[key] = { line: mod.line, stage: mod.stage, ... };
  }
}
const conceptIndex = { modules: conceptModules };
```

The CLI should do the same thing. Currently it passes:
```typescript
conceptIndex: { modules: {} },
```

### 2.3 FallbackProvider Only Covers Red Stage 🔴

The `FallbackProvider.ts` has specific content for:
- `LanguageReflective:Red` — 5 authored prompts
- `ScenarioChoice:Red` — 3 authored scenarios with options
- `Deterministic:Red` — 4 authored framings

For ALL other stages, it falls back to **single generic content per modality**:
- `GENERIC_LANGUAGE_REFLECTIVE` — "What moved you to act?"
- `GENERIC_SCENARIO_CHOICE` — "A crossroads appears."
- `GENERIC_STRATEGIC` — "Resources are limited."
- etc.

**This means only 12.5% of module×modality combinations have meaningful fallback content.** The other 87.5% present identical generic content regardless of line, stage, or modality.

### 2.4 Priority Formula Degeneracy 🟡

When all lines are at Red with no encounter history:
- **Theta-urgency:** `lastTs === 0` → returns 1.0 for ALL candidates (max urgency)
- **Shadow activation:** 0 (no shadows surfaced)
- **Polarity alignment:** 0.5 (Exploring mode, no history)
- **Transformation readiness:** 0 (no lines at edge)
- **Drive correction:** 0 (no fixation risk)
- **Narrative coherence:** 0 (no relationships, no beats)
- **Session fit:** ~0.1 (minimal differentiation)

**Result:** `priority ≈ 0.25*1.0 + 0.20*0 + 0.15*0.5 + 0.15*0 + 0.10*0 + 0.10*0 + 0.05*0.1 ≈ 0.33`

This produces nearly identical scores for all candidates. The scheduler falls back to **line diversification** (no more than 2 from same line), which produces a rotation, not a purposeful sequence.

**This is architecturally correct for a fresh start** — the scheduler will become meaningful once encounters create history. But it means the first ~8 encounters (one per line) will have minimal prioritization differentiation.

### 2.5 The LLM Encounter Loop Problem 🟡

**Budget rule in system prompt:**
```
4. This encounter has a budget of 2 exchanges. After the player has responded to 2 questions, you MUST call 'complete_encounter'.
```

**Safety guard in code:** `maxLoops = 10`

**What actually happens (from CLI testing):**
- The LLM generates `ask_user_question` calls correctly
- After receiving answers, it generates another `ask_user_question` instead of `complete_encounter`
- The loop continues until the safety guard triggers at iteration 10
- At that point, the fallback termination creates a synthetic "passed" result

**The budget rule isn't effective because:**
1. The model (gemma-4-31b-it) may not reliably follow tool-calling instructions
2. There's no programmatic enforcement — the code relies on the LLM choosing to call `complete_encounter`
3. The system prompt mixes role instructions with structural rules, and the structural rules get lost

**Fix needed:** After 2 `ask_user_question` calls, programmatically inject a message forcing `complete_encounter`, or auto-complete the encounter.

### 2.6 Frontend-CLI Parity Analysis

| Feature | Frontend | CLI | Parity |
|---|---|---|---|
| Module registry | ✅ Passed to scenes | ✅ Global via `globalThis` | ✅ |
| Module → Orchestrator | ❌ NOT passed | ✅ Passed (fixed) | ❌ Frontend gap |
| ConceptDraftIndex | ✅ Built from registry | ❌ Empty `{}` | ❌ CLI gap |
| LLM interaction | ✅ LLMDialogueRenderer | ✅ readline / headless | ✅ |
| Consequence processing | ✅ Via EncounterScene | ✅ Via GameLoop | ✅ |
| Transformation detection | ✅ In EncounterScene | ✅ In tickWithStrategy | ✅ |
| Theta decay | ✅ Implicit | ✅ In endSession | ✅ |
| Session state persistence | ✅ SaveRepository | ⚠️ In-memory only | ❌ CLI gap |
| Ecological tracking | ✅ EcologicalTracker | ❌ Not present | ❌ CLI gap |
| Scene routing | ✅ routeModality() | ❌ All through orchestrator | ⚠️ Different |

---

## 3. What "Evolutionarily Catalytic" Requires

Per the R&D documentation (foundations/10-14, 17, 19, 24), an evolutionarily catalytic experience requires:

### 3.1 Catalyst → Experience → Integration Flow

For each encounter, the player must:
1. **Receive catalyst** — A situation that challenges their current developmental structure
2. **Generate experience** — Their response reveals their drive-health, shadow patterns, and stage expression
3. **Integrate** — The consequence engine applies meaningful state mutations based on real behavioral data

**Current state:** Step 1 exists (encounter is scheduled), Step 2 is synthetic (LLM evaluates, not actual task performance), Step 3 is synthetic (consequence engine receives fabricated signals).

### 3.2 Shadow Detection Through Behavioral Signals

Shadows should be detected through **drive probe evaluation**, not LLM self-report. The architecture specifies:
- Present drive probes as part of the encounter
- Score probe responses against healthy/addiction/allergy signals
- Generate shadow signals from probe results
- Feed shadow signals to the scheduler for priority adjustment

**Current state:** Shadows are only surfaced if the LLM explicitly reports them via `shadowSignal` in `complete_encounter`. No behavioral detection occurs.

### 3.3 Adaptive Difficulty

The 20-item pool per module should drive a staircase algorithm:
- Start at difficulty 0.2
- After correct response → increase difficulty
- After incorrect → decrease difficulty
- Track performance across encounters to select appropriate items

**Current state:** Item pools exist but are never consulted. The encounter `difficulty` field is computed from trace count (more traces = lower difficulty), but no actual item selection occurs.

### 3.4 Stage-Appropriate Content

At Red stage, encounters should probe survival/foundation capacities. At Orange, growth/expansion. At Yellow, cognition/symbolic. Etc.

**Current state:** All encounters at all stages use the same generic narrative. A Cognitive:Red encounter and a Cognitive:White encounter would present identical content.

---

## 4. CLI Upgrade Roadmap

### Phase 1: Fix the Pipeline Gaps (Critical — Must Fix)

#### 1.1 Wire Module to Frontend AssessmentScene
**File:** `src/game/assessments/AssessmentScene.ts`  
**Change:** Pass `module` to AgenticOrchestrator constructor (line ~120)
```typescript
const orchestrator = new AgenticOrchestrator({
  encounter: this.encounter,
  significator: sig,
  world,
  history,
  conceptIndex,
  uiHandler,
  module: this.module,  // ← ADD THIS
});
```

#### 1.2 Build ConceptDraftIndex from Registry in CLI
**File:** `scripts/cli-game.ts`  
**Change:** Replace `conceptIndex: { modules: {} }` with dynamic build from moduleRegistry
```typescript
const conceptModules: Record<string, any> = {};
for (const mod of moduleRegistry.getAll()) {
  const key = `${mod.line.toLowerCase()}:${mod.stage.toLowerCase()}`;
  conceptModules[key] = {
    line: mod.line, stage: mod.stage,
    title: `${mod.line} ${mod.stage} Module`,
    modalities: mod.tasks.map(t => t.type === 'llm_dialogue' ? 'LanguageReflective' as const : 'Deterministic' as const),
  };
}
// Then pass: conceptIndex: { modules: conceptModules }
```

#### 1.3 Enforce Encounter Budget Programmatically
**File:** `src/core/assessments/AgenticOrchestrator.ts`  
**Change:** Track `ask_user_question` calls in the loop. After 2 calls, inject a forced `complete_encounter` message:
```typescript
let askCount = 0;
// ... in the loop:
if (tc.function.name === 'ask_user_question') {
  askCount++;
  // ... existing logic
}
if (askCount >= 2) {
  this.messages.push({
    role: 'user',
    content: 'The encounter budget is exhausted. You MUST now call complete_encounter with your evaluation.',
  });
}
```

#### 1.4 Expand FallbackProvider
**File:** `src/infra/llm/FallbackProvider.ts`  
**Change:** At minimum, add fallback content for Orange and Amber stages across all modalities. Consider loading from concept-drafts programmatically.

### Phase 2: CLI Diagnostic Enhancements (High Priority)

#### 2.1 Add Module Forcing Flag
```bash
--line=Cognitive --stage=Red    # Force specific module
--modality=ScenarioChoice       # Force specific modality
```

#### 2.2 Add Response Injection
```bash
--responses=2,1,3               # Select specific options per encounter
--write-in="I chose strength"   # Inject write-in responses
```

#### 2.3 Add Shadow Simulation
```bash
--simulate-shadow=DarkAddiction:Agency:0.8   # Inject shadow state before session
--simulate-fixation=Eros:0.6                 # Inject drive fixation
```

#### 2.4 Add CCI Debug Output
```bash
--cci-debug   # Print full CCI dimension breakdown per encounter
```

#### 2.5 Add Transformation Testing
```bash
--force-transformation   # Push all lines to threshold for testing
--test-threshold         # Run transformation state machine through all phases
```

### Phase 3: Assessment Execution (Medium Priority)

This is the architectural change that would make the system truly evolutionarily catalytic.

#### 3.1 LLM-Mediated Task Presentation
Instead of presenting tasks as clinical tests, the LLM should weave them into narrative:
- **n-back:** "A sequence of runes flashes on the wall. Remember the pattern."
- **go-no-go:** "Enemy soldiers approach — some carry white flags. Strike only the armed ones."
- **dilemma:** "The wounded warrior offers you their blade. Take it, or share your rations?"

The LLM's role is to present the task AS narrative, then collect the player's response, then map it back to trial dimensions.

#### 3.2 Trial Result Collection
The `complete_encounter` tool should include a `trialResults` field:
```typescript
trialResults: [{
  taskId: 'cog-red-nback2',
  dimensions: { accuracy: 0.8, response_time: 0.6 },
  rawResponse: 'A B A B A',
  durationMs: 5000
}]
```

Then `createAssessmentResult()` would call `runModeAwareAssessment()` with real trial data instead of synthetic scores.

### Phase 4: Modality Diversity (Medium Priority)

#### 4.1 Enforce Modality Rotation
Add a constraint: no more than 2 consecutive encounters of the same modality. Track `recentModalities` in the session context and filter candidates accordingly.

#### 4.2 Modality-Specific Task Mapping
Each assessment task type should map to modalities:
- `n_back` → Deterministic (timed cognitive challenge)
- `dilemma` → ScenarioChoice (moral reasoning)
- `emotion_identification` → LanguageReflective (emotional awareness)
- `hold` → Embodied (somatic control)
- `cooperation` → SocialCooperative (group dynamics)
- `pattern_prediction` → Strategic (planning)
- `llm_dialogue` → ImmersiveRPG (narrative interaction)

---

## 5. Testing Matrix

### 5.1 What the CLI Can Currently Test

| Test | CLI Command | What It Verifies |
|---|---|---|
| System bootstrap | `--mode=diagnostic` | All registries load, scheduler produces encounters |
| Single encounter | `--mode=encounter --headless` | Full pipeline: schedule → orchestrate → consequence |
| Session arc | `--headless --encounters=20` | CCI evolution, strategy adjustment, theta-decay |
| JSON event stream | `--headless --json` | Structured output for AI-agent analysis |
| LLM integration | (active proxy) | LLM generates narrative, calls tools |
| Fallback path | (no proxy) | Modality-appropriate fallback content |

### 5.2 What the CLI Cannot Yet Test (Phase 2 Flags)

| Test | Required Flag | What It Would Verify |
|---|---|---|
| Specific module content | `--line=Cognitive --stage=Orange` | Module-specific tasks at higher stages |
| Shadow surfacing | `--simulate-shadow=DarkAddiction:Eros` | Shadow encounters and resolution flow |
| Transformation threshold | `--force-transformation` | Full transformation state machine |
| Write-in responses | `--write-in="..."` | Free-text response evaluation |
| Drive probe evaluation | (needs assessment execution) | Per-drive health scoring |
| Modality-specific content | `--modality=ImmersiveRPG` | ImmersiveRPG vs Deterministic vs etc. |
| CCI dimension tracking | `--cci-debug` | Per-dimension CCI evolution |

### 5.3 What Requires Architectural Changes (Phase 3)

| Test | Required Change | What It Would Verify |
|---|---|---|
| Adaptive difficulty | Item pool consultation | Staircase algorithm across encounters |
| Shadow detection | Drive probe execution | Behavioral shadow identification |
| Stage progression | Altitude advancement | Player actually moves through stages |
| Polarity deepening | Full polarity trace | STO/STS vectors accumulate meaningfully |
| Cross-line bleed-through | Theta-decay urgency | Neglected lines degrade and demand attention |

---

## 6. Recommendations Summary

### Immediate (This Session)
1. **Fix AssessmentScene.ts** — Pass `module` to AgenticOrchestrator in frontend
2. **Fix cli-game.ts** — Build ConceptDraftIndex from moduleRegistry
3. **Fix AgenticOrchestrator.ts** — Enforce 2-exchange budget programmatically

### Short-Term (Next Session)
4. **Add CLI forcing flags** — `--line`, `--stage`, `--modality`, `--responses`
5. **Expand FallbackProvider** — Add Orange/Amber stage content
6. **Enforce modality rotation** — No more than 2 consecutive same-modality

### Medium-Term (Architecture)
7. **Wire assessment task execution** — LLM presents tasks as narrative, collects trial data
8. **Build trial result collection** — `complete_encounter` includes structured trial data
9. **Connect `runModeAwareAssessment()`** — Score real trials, not synthetic signals

### Long-Term (Evolutionary Catalysis)
10. **Implement shadow detection** — Drive probe evaluation → shadow signals
11. **Implement adaptive difficulty** — Item pool → staircase → personalized challenge
12. **Implement stage progression** — Altitude advancement through genuine development

---

*This audit is based on analysis of 25+ source files, 27 foundation documents, the unified implementation plan, and CLI runtime testing across diagnostic, single-encounter, and multi-encounter configurations. The CLI is the correct tool for this feedback loop — it exposes every gap in the pipeline that the frontend would mask behind visual polish.*
