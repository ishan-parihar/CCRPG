# Fresh-User CLI UX Audit — 2026-07-26

> **Scope:** End-to-end backend operationality of the CLI. No frontend-webui touched.
> **Method:** Fresh-user simulation + code analysis + test suite + live CLI probing.
> **Objective:** Assess whether the Mysterium system achieves its intended objective:
> *"accelerate evolution and healing in the individual, across all dimensions"*

---

## Executive Summary

The Mysterium CLI is **technically sound at the infrastructure layer** — tests pass (806/806), build succeeds, the DQ (Direct Questioning) flow produces genuinely beautiful mythopoetic reflection, and the Veil principle is rigorously enforced. However, there are **three critical gaps** that prevent the system from being operationally complete for fresh users, plus several experiential refinements needed.

**Verdict:** The game's crown jewel (DQ + LLM reflection) works brilliantly. The curriculum architecture is a well-engineered skeleton that needs its actual developmental content. The `--no-llm` path is blocked, meaning automated testing and offline play are impossible.

---

## 1. Technical Health

### 1.1 Test Suite — PASS
- **806 tests passed, 0 failures** across 77 test files
- Curriculum components tested: ProgressionValidator, RubricCalibrator, MetaCognitiveProbe, CurriculumBridge, CurriculumLinter, CurriculumSeed, AdaptiveDifficulty
- Minor warnings: `HTMLCanvasElement.getContext()` not implemented (browser-only tests), `localStorage` experimental warning (stores tests)

### 1.2 Build — PASS
- No compilation errors
- Minor warning: PWA glob pattern doesn't match prerendered assets (`.svelte-kit/output`)

### 1.3 CLI Boot — PASS
- `--help` is clean, accessible, well-organized
- Description is a hook, not a syllabus: *"A contemplative RPG that mirrors you back to yourself"*
- Subcommands discoverable: `setup`, `status`, `new-game`, `diagnostic`, `curriculum`, `session`, `glossary`, `profile`, `setup-profile`
- Hidden flags properly gated: `--verbose` requires `--dev`, `--force-shadow` and `--inject-shadow-keyword` hidden

---

## 2. Critical Findings (Blocking)

### ~~CRIT-1: `--no-llm` Blocks Encounters Entirely~~ (RESOLVED)

**Finding (RESOLVED):** The `--no-llm` flag has been removed. The system requires an LLM to operate. Running `--headless --no-llm` previously produced:
```
✗ Mysterium requires an active LLM to run reflective sessions.
  The LLM is the game's therapeutic engine. Without it, encounters become
  echo-only — your words returned with no reflection. This is worse than silence.
```

**Impact:**
- Automated CI/CD testing of encounter flow is impossible without a live LLM
- Offline play is impossible
- The `--no-llm` flag exists in `--help` but does nothing — it's a dead promise
- `--skip-calibration` does NOT bypass this check either

**Recommendation:** Either implement a fallback encounter mode that works without LLM (using module assessments only, as the flag description promises), or remove the `--no-llm` flag from `--help` to avoid misleading users.

### CRIT-2: Curriculum Content Is CS/Math/Physics — Not Developmental

**Finding:** The curriculum system loads from JSON files at `src/core/curriculum/data/`:
- `cs.foundations.json` — Computer Science Foundations (5 children)
- `cs.program.json` — CS Program
- `math.foundations.json` — Mathematics Foundations (5 children)
- `physics.foundations.json` — Physics Foundations (5 children)
- `physics.program.json` — Physics Program

The `curriculum list` command shows 48 holons across 3 branches (cs.foundations, math.foundations, physics.foundations) with 7 concepts, 8 subjects, 2 courses, 3 lessons. This is **real, structurally valid curriculum data** — but it's Computer Science, Mathematics, and Physics content, not the 512-module developmental curriculum described in the R&D docs.

The data files DO exist and ARE loaded correctly. The linter passes (0 errors, 80 warnings). The architecture works. The content is simply the wrong domain for a developmental RPG.

**Impact:**
- The curriculum encounter scheduling pipeline (`generateCurriculumEncounters` → `generateCurriculumCandidates` → `curriculumCandidateToEncounter`) is fully wired and functional
- The `--curriculum` flag forces curriculum encounters that study CS/Math/Physics concepts instead of developmental psychology
- The `MetaCognitiveProbe` runs against this data and produces valid health reports — but for the wrong domain
- The `devMapping` on each holon maps to CS/Math/Physics subjects, not to the 8 developmental lines (Cognitive, Emotional, Moral, etc.)
- The architecture is proven — it just needs developmental concept-holons to replace the CS/Math/Physics placeholder content

**Recommendation:** The curriculum engine is architecturally complete and tested. The bottleneck is content: the 512 concept-drafts in `docs/concept-drafts/` need to be converted into `CurriculumHolon` JSON format and loaded as the seed data. Priority: either populate with real developmental content OR clearly mark the CS/Math/Physics content as a demonstration/placeholder in `curriculum list` output.

### ~~CRIT-3: `--modality shadow` Is Not a Valid Modality~~ (RESOLVED)

**Finding (RESOLVED):** The `--force-shadow` help text was updated to remove the reference to `--modality shadow`. Shadow is an execution mode (ModuleExecutionMode), not a modality. The 7 modalities are delivery mechanisms.
```
✗ Invalid --modality: shadow
  Valid modalities: Deterministic, Strategic, Embodied, ScenarioChoice,
  LanguageReflective, SocialCooperative, ImmersiveRPG
```

The `--help` text for `--force-shadow` says "use --modality shadow for that" but `shadow` is not in `ALL_MODALITIES`. The help text is misleading.

**Impact:** Developers following the `--force-shadow` help text will hit a validation error. The shadow encounter format exists in the code but is not accessible via the documented CLI interface.

**Recommendation:** Either add `shadow` to `ALL_MODALITIES` or update the `--force-shadow` help text to not reference `--modality shadow`.

---

## 3. High-Priority Findings (Experiential)

### HIGH-1: DQ Flow Is Brilliant — The Crown Jewel Works

**Finding:** The JSON session output reveals genuinely beautiful LLM reflection:

```json
{
  "type": "dq_line_completed",
  "line": "Willpower",
  "stage": "Orange",
  "narrative": "The seeker stood before the mirror and, when asked what distinguishes
  the will that holds from the will that breaks, offered a single truth: 'I fear change.'
  The words landed like a stone dropped into still water—accurate, but barely rippling
  the surface. The fear was named but not entered. What shape does this fear take when
  it visits? What does it protect? The mirror reflected the statement back, unchanged.
  The next threshold asks not what you fear, but what the fear is doing to your will—
  whether it has become the gatekeeper you obey, or the wall you have mistaken for yourself."
}
```

This is **exceptional**. The LLM:
- Acknowledges the player's answer without judgment
- Reflects it back with precision
- Names the pattern (naming without entering)
- Deepens the question without pushing
- Uses mythopoetic language that preserves the Veil

**Assessment:** The DQ + LLM reflection pipeline is the game's strongest asset. It achieves the stated objective of "mirroring you back to yourself" with genuine depth.

### HIGH-2: Profile System Is Rich and Functional

**Finding:** `profile show` outputs a beautiful letter-format summary:
- Session count and encounter history
- Current stage and resonance description
- Synthesized insights from LLM (e.g., "The user's instinct to seek meaning through helping others may function as a sophisticated avoidance")
- Detected patterns (e.g., "The user repeatedly deflects introspection by framing avoidance as virtue")
- Active edges across dimensions
- Recent encounter narrative excerpts
- Active focus for next session

**Assessment:** The profile system is well-engineered and produces genuinely useful developmental tracking. The letter format ("Dear player, I have been holding...") is Veil-compliant and emotionally resonant.

### HIGH-3: Glossary System Is Excellent

**Finding:** 8 essential terms with poetic, Veil-compliant definitions:
- **Line:** "There are 8 lines of intelligence the game explores..."
- **Stage:** "When the game says you are at a stage... it is not a judgment. It is a name for the way you have been showing up."
- **Shadow:** "A shadow is an unresolved pattern — something that keeps showing up because it wants to be met, not because it is wrong."
- **Veil:** "A design principle: the game never shows you clinical labels about yourself."

3 terms locked behind play: "Play more sessions to unlock them."

**Assessment:** The glossary breaches the vocabulary wall without breaking the contemplative frame. The lock mechanism is clever gamification.

### HIGH-4: Diagnostic Command Is Informative

**Finding:** `diagnostic` shows:
- 64 assessment modules loaded
- 36 holons (16 NPCs, 4 factions, 7 locations, 9 others)
- Current save state (2 encounters, stage: Orange)
- Resonance description: "mechanism-precise, steel-glass, with the flinch remembering"
- Session strategy: "growth-edge-push"
- LLM config: active, endpoint, model

**Assessment:** Clean, informative, Veil-compliant. The resonance description is poetic rather than clinical.

---

## 4. Medium-Priority Findings

### MED-1: Status Command Uses Felt-Sense Language Well

**Finding:** The `status` output uses qualitative descriptors:
- "trajectory: something is approaching"
- "lines explored: ready to shift"
- "depth at current stage: holding"
- "shadows: 2 patterns surfaced, working through"

**Assessment:** Successfully avoids RPG-style numeric displays. The felt-sense vocabulary (`arriving`, `working`, `integrating`, `transforming`, `embodying`) is well-chosen.

### MED-2: Post-Session Summary Is Veil-Compliant

**Finding:** The `renderPostSessionSummary` function:
- Shows count of explored aspects (not line names)
- Describes shadows qualitatively ("a pull toward a familiar capacity")
- Shows knowledge state in felt-sense ("well-held", "developing", "fading")
- Displays glossary terms unlocked
- Shows suggested focus for next session

**Assessment:** Good implementation of the Veil principle. The shadow movement descriptions are particularly effective.

### MED-3: Practice Hints Are Contextually Aware

**Finding:** `generatePracticeHint` uses:
- Keyword matching from integration responses
- Shadow-quadrant-specific practices (DarkAddiction → hand on chest, DarkAllergy → breathe into tension)
- Somatic-line-specific body practices
- Default practice for any response

**Assessment:** The practice system bridges the game-to-life gap. Shadow-aware hints are a strong touch.

---

## 5. Low-Priority Findings (YAGNI Candidates)

### LOW-1: `--agent` Path Removed but Comments Remain

**Finding:** YAGNI-EFF-3 removed the PersistentAgent path, but extensive comments about it remain throughout `cli-game.ts`. The `SessionAgent` import is still present.

**Recommendation:** Clean up dead comments and unused imports in a future pass.

### LOW-2: Legacy VITE_LLM_* Env Var Seeding

**Finding:** The CLI seeds `process.env.VITE_LLM_*` for backwards compat, but the `ProviderRegistry` is the authoritative config source. This creates two paths that could drift.

**Recommendation:** YAGNI — remove VITE_LLM_* seeding when all call sites migrate to ProviderRegistry.

### LOW-3: `inferAltitudesFromAnswers` Is Lightweight

**Finding:** The binary-search altitude inference from `--answer` content uses keyword matching (Red: "survival, power, fight"; Orange: "achieve, system, strategy"; etc.). It's a rough heuristic.

**Assessment:** Acceptable for headless mode. The interactive calibration (`runQuickCalibration`) is more rigorous with timing probes and multiple-choice probes per line.

---

## 6. Experiential Soundness Assessment

### Does the game achieve "accelerate evolution and healing"?

| Dimension | Status | Evidence |
|-----------|--------|----------|
| **Cognitive** | ✅ Wired | DQ questions probe thinking patterns; LLM reflects cognitive style |
| **Emotional** | ✅ Wired | "What does the body know? Not what you believe about it, but what it feels like" |
| **Moral** | ✅ Wired | "Name a principle held at real cost" |
| **Intrapersonal** | ✅ Wired | Pattern detection, self-reflection prompts |
| **Spiritual** | ✅ Wired | Meaning/purpose probes, veil-compliant language |
| **Somatic** | ✅ Wired | Body-awareness practices, timing probes |
| **Willpower** | ✅ Wired | Commitment vs interest, resistance probes |
| **Interpersonal** | ✅ Wired | Connection/relationship probes |

**Assessment:** All 8 lines are wired into the DQ flow. The LLM reflection quality is high enough to create genuine developmental catalysis. The game IS a practice, not just a test.

### Veil Principle Compliance

| Output Type | Veil Status | Notes |
|-------------|-------------|-------|
| `--help` | ✅ Compliant | No clinical labels |
| `diagnostic` | ✅ Compliant | Poetic resonance descriptions |
| `glossary` | ✅ Compliant | "A shadow is an unresolved pattern" |
| `profile show` | ✅ Compliant | Letter format, qualitative insights |
| `status` | ✅ Compliant | Felt-sense language throughout |
| DQ encounters | ✅ Compliant | Mythopoetic prose, no diagnoses |
| `--verbose` | ⚠️ Gated | Requires `--dev`; shows XP bars, drive mappings |
| `--dev` | ⚠️ Warning | Shows G_z/P_z, CCI, rayProfile with warning |
| Post-session summary | ✅ Compliant | Qualitative shadows, felt-sense knowledge |

**Assessment:** The Veil is rigorously maintained in all user-facing paths. Developer mode is properly gated behind `--dev` with explicit warnings.

---

## 7. Curriculum Architecture Assessment

### What's Wired (Infrastructure)

| Component | Status | Notes |
|-----------|--------|-------|
| CurriculumRegistry | ✅ Working | Seeds from JSON, supports CRUD |
| CurriculumLinter | ✅ Working | Validates holon structure, prerequisites |
| CurriculumSeed | ⚠️ Skeleton | Loads CS/Math/Physics, not developmental content |
| CurriculumBridge | ✅ Working | Bidirectional: curriculum ↔ developmental signals |
| MetaCognitiveProbe | ✅ Working | Combines ProgressionValidator + RubricCalibrator + Linter |
| ProgressionValidator | ✅ Working | Checks depth advancement, retention health |
| RubricCalibrator | ✅ Working | Validates threshold monotonicity, discrimination |
| ForgettingCurve | ✅ Working | Retention decay across sessions |
| LearningAnalytics | ✅ Working | Modality effectiveness, velocity tracking |
| CandidateGeneration | ✅ Working | Priority-based candidate selection |
| GameLoop integration | ✅ Working | Curriculum encounters interleaved with developmental |
| `--curriculum` flag | ✅ Working | Forces curriculum slots |
| `--audit` flag | ✅ Working | Runs MetaCognitiveProbe at session end |

### What's Missing (Content)

| Component | Status | Notes |
|-----------|--------|-------|
| Developmental concept-holons | ❌ Missing | 512 modules × 8 files described in R&D docs |
| Per-line×stage rubrics | ❌ Missing | Actual depth rubrics for each of 64 cells |
| Cross-branch prerequisites | ❌ Missing | Real prerequisite relationships |
| Dev mappings | ⚠️ Placeholder | Maps to CS/Math/Physics, not developmental lines |

**Assessment:** The curriculum engine is a sophisticated, well-tested skeleton. It needs its actual content to fulfill its purpose. The architecture is ready — the content pipeline is the bottleneck.

---

## 8. Prioritized Recommendations

### P0 — Critical (Must Fix)

1. **Resolve `--no-llm` blocking** — Either implement a fallback encounter mode or remove the flag from `--help`. Current state: flag exists, promises functionality, delivers nothing.

2. **Add `shadow` to `ALL_MODALITIES`** — The `--force-shadow` help text references `--modality shadow` which doesn't exist. Quick fix: add `'shadow'` to the enum.

### P1 — High Priority (Should Fix)

3. **Populate curriculum with developmental content** — The 512-module concept-draft set exists in `docs/concept-drafts/`. The curriculum engine is ready. The bottleneck is converting concept-drafts into `CurriculumHolon` JSON format.

4. **Mark curriculum as experimental** — Until developmental content is loaded, add a note to `curriculum list` output: "Content is placeholder. Developmental curriculum pending."

5. **Remove dead `--agent` code paths** — YAGNI-EFF-3 removed the PersistentAgent but left imports and comments. Clean up.

### P2 — Medium Priority (Nice to Have)

6. **Add `curriculum status` subcommand** — Show how many concepts are seeded, what branches exist, whether content is placeholder or real.

7. **Wire `--no-llm` to module-assessment-only mode** — The AgenticOrchestrator already has fallback logic. Make `--no-llm` use it.

8. **Add integration test for DQ flow** — The JSON session output shows the flow works, but there's no automated test that verifies the DQ pipeline end-to-end.

### P3 — Low Priority (YAGNI)

9. **Clean up VITE_LLM_* env var seeding** — Two config paths could drift.

10. **Remove unused `SessionAgent` import** — Dead code from PersistentAgent removal.

---

## 9. Fresh-User Journey Simulation Results

### Step 1: First Contact (`--help`)
- ✅ Clear, inviting description
- ✅ Subcommands discoverable
- ✅ No jargon in default view
- ⚠️ `--no-llm` promise is misleading

### Step 2: System Check (`diagnostic`)
- ✅ Shows 64 modules loaded
- ✅ Shows saved progress state
- ✅ LLM config visible
- ✅ Poetic resonance description

### Step 3: Learning Terms (`glossary`)
- ✅ 8 essential terms with beautiful definitions
- ✅ Terms locked behind play (gamification)
- ✅ Veil-compliant language throughout

### Step 4: Profile Review (`profile show`)
- ✅ Rich letter-format summary
- ✅ Synthesized insights from LLM
- ✅ Pattern detection working
- ✅ Active focus for next session

### Step 5: Game Play (DQ flow)
- ✅ Questions are deep and probing
- ✅ LLM reflection is mythopoetic and precise
- ✅ Pattern detection works across encounters
- ✅ Integration prompt at session end
- ⚠️ Requires live LLM (no offline mode)

### Step 6: Session End
- ✅ Post-session summary is Veil-compliant
- ✅ Shadows described qualitatively
- ✅ Glossary terms unlocked
- ✅ Suggested focus for next time

### Step 7: Curriculum Exploration
- ⚠️ Content is CS/Math/Physics placeholder
- ⚠️ Not developmental content
- ✅ Lint passes (structural correctness)
- ✅ Architecture is sound

---

## 10. Conclusion

The Mysterium CLI is a **well-engineered, beautifully designed contemplative game** with one critical gap: its curriculum content pipeline is empty. The DQ flow — the game's primary interaction mode — works brilliantly and achieves genuine developmental catalysis. The Veil principle is rigorously enforced. The profile system is rich and functional.

The system is ready for its content. The architecture is sound. The content pipeline is the bottleneck.

**Overall Grade: B+** — Technically excellent, experientially brilliant in DQ mode, but curriculum content is placeholder and `--no-llm` is a dead promise.

---

*Generated by Buffy (Freebuff AI) — Fresh-User CLI UX Audit*
*Date: 2026-07-26*
*Method: Live CLI probing + code analysis + test suite execution*

---

## Resolution Notes (2026-07-26)

### Implemented Fixes

1. **Removed `--no-llm` flag** — The system requires an LLM to operate. The flag, all `NO_LLM` references, `setLLMDisabled` calls, and related error handling were stripped from `cli-game.ts`.

2. **Fixed `--force-shadow` help text** — Removed the reference to `--modality shadow` (which was never a valid modality). Shadow is an execution mode (`ModuleExecutionMode = 'shadow'`), not a modality. The 7 modalities are delivery mechanisms; shadow work is triggered by the scheduler.

3. **Verified architecture** — Read `architecture/00-mysterium-identity.md`, `architecture/01-overview.md`, and `foundations/26-unified-core-architecture.md` to confirm the correct architecture before making changes.

### Remaining YAGNI Items

- Dead `noLlm` code in `AgenticOrchestrator` (parameter + branching logic)
- Unused `setLLMDisabled` function in `LLMClient.ts`
- Local `ALL_MODALITIES` in `CandidateGeneration.ts` duplicates centralized version from `enums.ts`

