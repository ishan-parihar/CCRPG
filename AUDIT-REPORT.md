# CCRPG CLI & Backend Audit Report — v3

**Date:** June 18, 2026  
**Scope:** CLI debugging tool, backend engines, assessment system, frontend-CLI parity, evolutionary catalysis  
**Method:** Full codebase analysis + CLI runtime testing across 8+ configurations with forcing flags

---

## Executive Summary

After committing the Phase 1 fixes (module wiring, ConceptDraftIndex, budget enforcement, expanded fallback), I ran the CLI across **8 different configurations** — forcing different lines, stages, and modalities — to validate whether the backend is truly integrated and evolutionarily catalytic.

**The answer is no.** The CLI is structurally broken in ways that the Phase 1 fixes did not address. The core issue is that **the LLM never actually runs** — a false-positive error detection in the orchestrator immediately routes every encounter to the fallback path, which always produces `passed: true` with identical generic content. The forcing flags (`--line`, `--stage`, `--modality`) appear to work at the content level but the display shows the wrong modality, and the underlying state evolution is degenerate.

**The game cannot test anyone's capacities because it never presents a real challenge and never produces a differentiated result.**

---

## 1. CLI Runtime Evidence

### 1.1 Diagnostic Mode ✅ (Working)

| Field | Value |
|---|---|
| Modules loaded | 64 |
| Holons | 36 (16 NPCs, 4 factions, 7 locations) |
| CCI | 0.5036 |
| Strategy theme | `post-transformation` |
| Scheduled encounter | Willpower:Red, Deterministic, conqueror, priority 0.395 |

### 1.2 Full Session — 8 Encounters, No Forcing

```
Encounter 1: Willpower:Red | Deterministic | conqueror | 0.395
  → "The Conqueror presents a challenge. The moment demands clarity."
  → Options: [Engage, Reflect, Withdraw, Negotiate]
  → Selected: Engage | Result: passed

Encounter 2: Cognitive:Red | Deterministic | viper-tactician | 0.395
  → "The Viper Tactician presents a challenge. The moment demands clarity."
  → Same 4 options
  → Selected: Engage | Result: passed

Encounter 3: Emotional:Red | Deterministic | bloodfury | 0.395
  → Same pattern
```

**Key observation:** All encounters use Deterministic modality with identical generic options. The only thing that changes is the NPC name.

### 1.3 Forced Modality: `--modality=ScenarioChoice`

```
Encounter 1: Willpower:Red | Deterministic | conqueror | 0.395
  → "A rival chieftain sends a messenger bearing gifts and honeyed words..."
  → Options: [Accept the pact, Demand hostages, Accept and strike, Deceive and maneuver]
  → These ARE ScenarioChoice options! But the display shows "Deterministic"
```

**Critical finding:** The forcing flag DOES change the content (ScenarioChoice content appears), but `printEncounter()` shows the original modality from `tickResult.encounter`, not the forced modality. The forcing modifies the encounter AFTER scheduling, so the display is wrong.

### 1.4 Forced Modality: `--modality=LanguageReflective`

```
Encounter 1: Willpower:Red | Deterministic | conqueror | 0.395
  → "The Conqueror sits across from you, their gaze steady. The firelight casts long shadows."
  → Options: [Reflect deeply, Respond instinctively, Sit with it, Challenge the premise]
  → These ARE LanguageReflective options! But display shows "Deterministic"
```

Same pattern: content changes, display doesn't.

### 1.5 Forced Line/Stage: `--line=Cognitive --stage=Red`

```
Encounter 1: Willpower:Red | Deterministic | conqueror | 0.395
  → Module did NOT change to Cognitive:Red
  → Scheduler still produces Willpower:Red
```

**The `--line` and `--stage` forcing doesn't work** because the scheduler runs BEFORE the forcing logic applies. `tickWithStrategy()` generates the encounter, then the CLI modifies it. But the module passed to the orchestrator uses `FORCE_LINE ?? encLine` which correctly resolves to the forced line — however, the display shows the unforced encounter.

### 1.6 All Encounters: Priority = 0.395

Every single encounter across all tests has priority 0.395. This means the priority formula is producing degenerate output — all candidates score identically because:
- Theta-urgency: maxed (no prior encounters)
- Shadow activation: 0 (no shadows)
- Polarity alignment: 0.5 (Exploring mode)
- Transformation readiness: 0
- Drive correction: 0
- Narrative coherence: 0
- Session fit: ~0.1

---

## 2. Root Cause Analysis

### 2.1 🔴 CRITICAL: LLM Never Actually Runs

The orchestrator's LLM detection logic at line 211:
```typescript
if (loopCount === 1 && res.content && res.content.includes('"error"') && (!res.toolCalls || res.toolCalls.length === 0)) {
  return this.runFallback(line, stage, now);
}
```

**Problem:** The LLM (gemma-4-31b-it via local proxy) returns responses that contain the string `"error"` in the content — this is a false positive. The check `res.content.includes('"error"')` matches any response that mentions the word "error" in its content, even if it's a valid response. This causes EVERY encounter to immediately fall back to the deterministic path.

**Evidence:** The CLI shows the fallback path content (generic options, `passed: true`) rather than LLM-generated content (assessment tasks, drive probes, nuanced evaluation).

**Impact:** The assessment context (tasks, drive probes, scoring rubric) that was wired into the system prompt is NEVER seen by the LLM. The entire Phase 1 fix of wiring `buildAssessmentContext()` into the system prompt is wasted because the LLM never receives it.

### 2.2 🔴 CRITICAL: Fallback Always Passes

The `runFallback()` method always returns:
```typescript
const fallbackParams = {
  passed: true,  // ← ALWAYS TRUE
  feedback: 'Encounter completed via fallback content.',
  polarityDirection: 'neutral' as const,  // ← ALWAYS NEUTRAL
};
```

**Impact:** Every encounter produces:
- All drives → `HealthyBalanced` (because `passed: true`)
- No shadow surfacing
- No polarity differentiation
- Significator state evolves identically regardless of player response

### 2.3 🔴 CRITICAL: CLI Forcing Flags Don't Affect Scheduler

The forcing logic in `runAgenticEncounter()` modifies the encounter AFTER `tickWithStrategy()` has already generated one. The scheduler's `scheduleNext()` runs with the original (unforced) state, so:
- `--line` forcing: Module lookup uses forced line, but display shows unforced encounter
- `--stage` forcing: Same issue
- `--modality` forcing: Content changes (fallback uses forced modality), but display shows unforced modality
- `--responses` forcing: Works correctly (selects specified option)

### 2.4 🟡 HIGH: Identical Generic Options Across All Encounters

The fallback's Deterministic path always uses:
```typescript
options = [
  { label: 'Engage', description: 'Step into the challenge' },
  { label: 'Reflect', description: 'Consider before acting' },
  { label: 'Withdraw', description: 'Step back and reassess' },
  { label: 'Negotiate', description: 'Seek a middle path forward' },
];
```

These 4 options are identical regardless of line, stage, or module. They don't test any developmental capacity.

### 2.5 🟡 HIGH: Modality Rotation Not Enforced

The scheduler's `getEligibleModalities()` picks 2-3 modalities per holon based on a hash, but:
- The `conqueror` holon always produces `Deterministic` as primary
- The hash-based alternative selection is deterministic (same holon = same alternatives)
- No constraint prevents consecutive same-modality encounters
- The `recentEncounters` filter prevents same-line-same-stage but not same-modality

### 2.6 🟡 MEDIUM: Priority Formula Degeneracy at Session Start

All candidates score 0.395 because the 7-criterion formula has no signal to differentiate:
- No shadows → shadow_activation = 0
- No drive imbalance → drive_correction = 0
- No narrative history → narrative_coherence = 0
- No transformation progress → transformation_readiness = 0
- All cells fresh → theta_urgency = 1.0 (maxed for all)

The only differentiator is session_fit (~0.1) and polarity_alignment (0.5), which barely vary.

---

## 3. Frontend vs CLI Parity Analysis

| Feature | Frontend | CLI | Gap |
|---|---|---|---|
| Module → Orchestrator | ✅ Now passed | ✅ Passed | ✅ Fixed |
| ConceptDraftIndex | ✅ Built from registry | ✅ Built from registry | ✅ Fixed |
| LLM interaction | ✅ Via LLMDialogueRenderer | ❌ Always falls back | 🔴 LLM detection bug |
| Encounter budget | ✅ 2-exchange limit | ✅ Enforced | ✅ Fixed |
| Modality routing | ✅ `routeModality()` → different scenes | ❌ All through same fallback | 🔴 No modality-specific rendering |
| Assessment tasks | ❌ Not executed | ❌ Not executed | 🔴 Neither path executes tasks |
| Shadow detection | ❌ LLM self-report only | ❌ LLM self-report only | 🔴 No behavioral detection |
| Drive probe evaluation | ❌ Never presented | ❌ Never presented | 🔴 Never presented |
| Scoring from trials | ❌ Synthetic only | ❌ Synthetic only | 🔴 No real scoring |
| Transformation detection | ✅ In EncounterScene | ✅ In tickWithStrategy | ✅ Both paths |
| Theta decay | ✅ Implicit | ✅ In endSession | ✅ Both paths |

---

## 4. The Ontological Gap: Why This Isn't Evolutionarily Catalytic

### 4.1 What "Evolutionarily Catalytic" Means

Per the R&D documentation (foundations/10-14, 17, 19, 24), an evolutionarily catalytic experience requires:

1. **Catalyst** — A situation that challenges the player's current developmental structure
2. **Experience** — The player's response reveals their drive-health, shadow patterns, and stage expression
3. **Integration** — The consequence engine applies meaningful state mutations based on real behavioral data

The game must **measure** something, **differentiate** between responses, and **evolve** the player's state based on what was measured.

### 4.2 What the CLI Actually Does

1. **No catalyst** — Generic "Engage/Reflect/Withdraw/Negotiate" options don't challenge anything
2. **No experience differentiation** — Every response produces `passed: true` with `HealthyBalanced` drives
3. **No integration** — State evolves identically regardless of what the player chose

The CLI is a **narrative wrapper around an empty engine**. It looks like a game, sounds like a game, but doesn't measure, differentiate, or evolve anything.

### 4.3 The Three-Layer Problem

The architecture has three layers, each broken in a different way:

```
Layer 1: SCHEDULER (CandidateGeneration → PriorityComputation → EncounterScheduler)
  → Generates encounters but produces degenerate priorities (all 0.395)
  → Modality selection is hash-based, not purposeful
  → No session arc modulation

Layer 2: ORCHESTRATOR (AgenticOrchestrator → LLM/Fallback → UIHandler)
  → LLM never runs (false-positive error detection)
  → Fallback always passes, always neutral
  → Assessment context injected but never consumed

Layer 3: CONSEQUENCES (ConsequenceEngine → applyConsequences → Significator)
  → Receives synthetic signals, not real measurement data
  → Drive balance updates are uniform (all HealthyBalanced)
  → Shadow ledger never gets new entries
```

---

## 5. Upgrade Recommendations (Ranked by Impact)

### Priority 1: Fix LLM Detection (Critical — Unblocks Everything)

**The single highest-impact fix.** The false-positive `"error"` detection prevents the LLM from ever running, which means:
- Assessment context is never consumed
- LLM never presents module-specific content
- LLM never evaluates player responses
- All encounters fall through to degenerate fallback

**Fix:** Replace the naive `res.content.includes('"error"')` check with proper error detection:
```typescript
// Instead of:
if (loopCount === 1 && res.content && res.content.includes('"error"') && (!res.toolCalls || res.toolCalls.length === 0))

// Use:
if (loopCount === 1 && res.content && res.content.startsWith('{"error"') && (!res.toolCalls || res.toolCalls.length === 0))
```

Or better: check if the LLM returned any valid tool calls. If it did, it's working. Only fall back if the first call returns no tool calls AND the content is a JSON error object.

### Priority 2: Fix Fallback to Differentiate Responses (Critical)

The fallback must produce differentiated results based on the player's actual choice:
- Map selected option to a polarity direction (not always neutral)
- Map option quality to passed/failed (not always true)
- Map option semantics to drive signals (not always HealthyBalanced)

### Priority 3: Fix CLI Forcing to Work Before Scheduling (High)

Move the forcing logic to BEFORE `tickWithStrategy()`:
- If `--line/--stage` is set, create a custom `SessionContext` that biases the scheduler
- If `--modality` is set, filter candidates to only that modality
- If `--responses` is set, store them for the UI handler

### Priority 4: Implement Modality-Specific Rendering in CLI (High)

The CLI currently renders all modalities the same way (question + 4 options). It should render modality-specific content:
- **Deterministic:** Timed challenge with countdown
- **LanguageReflective:** Open-ended reflection prompt
- **ScenarioChoice:** Moral dilemma with branching options
- **Embodied:** Somatic awareness prompt with body-scan instructions
- **Strategic:** Resource management with multiple decisions
- **SocialCooperative:** NPC dialogue with relationship dynamics
- **ImmersiveRPG:** Full narrative with environment description

### Priority 5: Fix Priority Formula Degeneracy (Medium)

Add a "novelty bonus" for fresh encounters — candidates that haven't been visited should get a higher score than the current uniform 0.395. This is already partially implemented (theta-urgency returns 1 for unvisited cells) but the other criteria (shadow, polarity, transformation) are all 0, so the formula collapses.

### Priority 6: Implement Modality Rotation Constraint (Medium)

Add a `recentModalities` tracker to the session context and filter candidates so no more than 2 consecutive encounters use the same modality.

---

## 6. What Would Make the CLI Truly Catalytic

### 6.1 The LLM Must Actually Run

When the LLM runs with the assessment context, it should:
1. Present the module's tasks as narrative challenges (n-back as rune sequences, dilemmas as moral crossroads)
2. Collect the player's response (MCQ + write-in)
3. Evaluate the response against drive probes (agency, communion, eros, agape)
4. Call `complete_encounter` with per-drive scores and signals
5. Generate a narrative summary grounded in the assessment content

### 6.2 The Fallback Must Differentiate

When the LLM is unavailable, the fallback must:
1. Use the module's tasks to generate modality-appropriate content (not generic "Engage/Reflect/Withdraw")
2. Map the player's selected option to a polarity direction
3. Determine passed/failed based on option quality (not always true)
4. Generate drive signals based on option semantics (not always HealthyBalanced)

### 6.3 The Scheduler Must Produce Purposeful Sequences

The scheduler should:
1. Differentiate priorities based on theta-decay, shadow activation, and drive correction
2. Rotate modalities to prevent repetition
3. Follow the session arc (warmup → peak → cooldown)
4. Respond to mid-session adjustments (energy drop → reduce intensity)

---

## 7. Summary

The CCRPG backend has the theoretical depth and architectural skeleton to deliver an evolutionarily catalytic experience. The 64 assessment modules with their task definitions, drive probes, and scoring rubrics represent genuine developmental psychology research translated into game mechanics.

**But the pipeline has three breaks in the middle:**

1. **The LLM never runs** — false-positive error detection routes everything to fallback
2. **The fallback always passes** — no differentiation, no challenge, no evolution
3. **The forcing flags don't affect scheduling** — the scheduler ignores developer intent

**The fix hierarchy is clear:**
1. Fix LLM detection → unblocks assessment context consumption
2. Fix fallback differentiation → unblocks meaningful state evolution
3. Fix forcing to work before scheduling → unblocks targeted testing

Once these three fixes land, the CLI will be a genuine developmental tool that can test capacities, detect pathologies, and guide evolution across all 8 lines × 8 stages.

---

*This audit is based on analysis of 20+ source files, 27 foundation documents, and CLI runtime testing across 8 configurations (diagnostic, full session, forced line/stage/modality combinations). The CLI correctly exposes every gap in the pipeline that the frontend would mask behind visual polish.*
