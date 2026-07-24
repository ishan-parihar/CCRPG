# Mysterium Curriculum Architecture Audit & Fresh-User UX Report

**Date:** July 23, 2026
**Auditor:** Buffy (AI agent) via Freebuff
**Methodology:** Codebase analysis against curriculum architecture plan (foundations/35-36), test suite verification, CLI simulation attempt, architectural gap analysis
**Test Results:** 793/793 passing | 0 failing | Workspace lint: clean

---

## 1. Executive Summary

The Mysterium curriculum system is **architecturally sophisticated and well-tested** at the engine level — 793 tests pass, the type system is comprehensive, and the integration pipeline (CurriculumRegistry → CurriculumLinter → CandidateGeneration → GameLoop → ConsequenceEngine) is fully wired. However, the system has **two critical blockers** that prevent it from being experienced by users:

1. **The CLI is broken** — syntax errors in `scripts/cli-game.ts` (stray semicolon + unescaped apostrophes) prevent the entire CLI from launching.
2. **Curriculum encounters are invisible to new players** — the `generateCurriculumCandidates()` function requires existing knowledge state, which fresh players don't have, creating a cold-start problem.

The curriculum upgrade plan (foundations/36) envisions a 5-level holarchy scaling from foundational to Ph.D.-level (~850 holons). Current seed data contains ~50 holons across CS, Math, and Physics — solid foundations but far from the graduation-level vision. The gap between architectural completeness and experiential delivery is the system's most pressing challenge.

**Verdict:** The curriculum engine is a **finished machine with no fuel**. The code works; the player never sees it.

---

## 2. Technical Soundness Assessment

### 2.1 Test Suite Health

| Metric | Value | Status |
|---|---|---|
| Total tests | 793 | ✅ |
| Passing | 793 | ✅ |
| Failing | 0 | ✅ |
| Workspace lint | 0 violations | ✅ |
| Test files | 74 | ✅ |

The test suite covers curriculum types, linter, seed, bridge, forgetting curves, knowledge graph, depth assessment, learning analytics, calibration bias, curriculum migration, adaptive difficulty, and curriculum integration. This is **excellent test coverage** for the engine layer.

### 2.2 CLI Critical Bugs (BLOCKING)

| Bug | Line | Severity | Description |
|---|---|---|---|
| **CLI-1** | 109 | 🔴 P0 | Stray semicolon after `.description('Show system diagnostics');` breaks Commander chain — `.command('curriculum')` becomes a separate statement |
| **CLI-2** | 802, 805, 806 | 🔴 P0 | Unescaped apostrophes in single-quoted strings (`don't`, `didn't`) inside `practiceMap` array — esbuild TransformError |
| **CLI-3** | 825 | 🟡 P1 | Unescaped `don't` in fallback return string (partially fixed by earlier patch) |

**Impact:** The entire CLI (`npx tsx scripts/cli-game.ts`) fails to launch. All subcommands (`status`, `diagnostic`, `curriculum lint`, `glossary`, `profile`) are unreachable. The `--help` flag itself crashes.

**Root cause:** The `generatePracticeHint()` function was added as part of a UX audit fix but introduced unescaped apostrophes in single-quoted strings. The Commander chain had a stray semicolon from a previous refactor.

### 2.3 Architecture Completeness Matrix

| Component | Plan (foundations/36) | Implementation | Status |
|---|---|---|---|
| **CurriculumHolon type (5+6 levels)** | ✅ | ✅ `types.ts` — 11 holon levels (program→instance + legacy) | Complete |
| **CurriculumRegistry singleton** | ✅ | ✅ `CurriculumRegistry.ts` — Map-based O(1) lookup | Complete |
| **CurriculumLinter (13+ checks)** | ✅ | ✅ `CurriculumLinter.ts` — structural/pedagogical/developmental/epistemic | Complete |
| **CurriculumSeed loader** | ✅ | ✅ `CurriculumSeed.ts` — idempotent, lints on seed | Complete |
| **KnowledgeGraph (DAG queries)** | ✅ | ✅ `KnowledgeGraph.ts` — topological sort, cycle detection | Complete |
| **ForgettingCurve model** | ✅ | ✅ `ForgettingCurve.ts` — Ebbinghaus exponential decay | Complete |
| **DepthAssessment (dual-depth)** | ✅ | ✅ `DepthAssessment.ts` — knowledge + developmental signal | Complete |
| **CurriculumBridge (integration)** | ✅ | ✅ `CurriculumBridge.ts` — curriculum→developmental + developmental→curriculum | Complete |
| **CandidateGeneration (scheduling)** | ✅ | ✅ `CandidateGeneration.ts` — 6 study themes, adaptive difficulty | Complete |
| **AutoModeStrategy (study themes)** | ✅ | ✅ `AutoModeStrategy.ts` — CCI-driven theme selection | Complete |
| **ConsequenceEngine (knowledge update)** | ✅ | ✅ Integrated via CurriculumBridge | Complete |
| **CCIEngine (knowledge health)** | ✅ | ✅ `CCIEngine.ts` — knowledgeHealth dimension | Complete |
| **LearningAnalytics** | ✅ | ✅ `LearningAnalytics.ts` — modality effectiveness, velocity | Complete |
| **CalibrationBias** | ✅ | ✅ `CalibrationBias.ts` — over/under-confidence detection | Complete |
| **CurriculumMigration** | ✅ | ✅ `CurriculumMigration.ts` — schema versioning | Complete |
| **KnowledgeDashboard Svelte** | ✅ | ✅ `KnowledgeDashboard.svelte` | Complete |
| **/knowledge route** | ✅ | ✅ `src/routes/knowledge/+page.svelte` | Complete |
| **/curriculum route** | ✅ | ✅ `src/routes/curriculum/+page.svelte` — tree browser | Complete |
| **/curriculum/progress route** | ✅ | ✅ `src/routes/curriculum/progress/+page.svelte` | Complete |
| **CLI curriculum subcommand** | ✅ | ⚠️ Defined but broken by CLI-1/CLI-2 | Blocked |
| **CLI --curriculum flag** | ✅ | ⚠️ `applyCurriculumMode()` exists but CLI can't launch | Blocked |
| **Seed data: CS foundations** | ✅ | ✅ `cs.foundations.json` (4 holons) | Complete |
| **Seed data: CS program** | ✅ | ✅ `cs.program.json` (full hierarchy) | Complete |
| **Seed data: Math foundations** | ✅ | ✅ `math.foundations.json` (4 holons) | Complete |
| **Seed data: Physics foundations** | ✅ | ✅ `physics.foundations.json` | Complete |
| **Seed data: Physics program** | ✅ | ✅ `physics.program.json` | Complete |
| **LLM-driven adaptive content** | Phase D | ❌ Not implemented | Gap G3 |
| **Dual-depth assessment in encounters** | Phase C | ⚠️ DepthAssessment exists but not wired to encounter scoring | Gap G4 |
| **Research pipeline** | Phase F | ❌ Not implemented | Gap G5 |
| **Cross-disciplinary integration** | Phase G | ❌ Not implemented | Gap G6 |
| **Curriculum versioning** | Phase G | ⚠️ Schema version exists, no runtime migration | Gap G10 |

### 2.4 Seed Data Scale

| Branch | Holons | Levels Used | Status |
|---|---|---|---|
| CS program | ~30 | program→degree→course→module→unit→lesson→concept | ✅ Rich |
| CS foundations | 4 | branch→concept | ✅ MVP |
| Math foundations | 4 | branch→concept | ✅ MVP |
| Physics foundations | 6 | branch→concept | ✅ MVP |
| Physics program | ~20 | program→degree→course→module→unit | ✅ Growing |
| **Total** | ~64 | — | — |
| **Plan target (Phase B)** | ~50 | 4 levels | On track |
| **Plan target (Phase F)** | ~850 | 5 levels | Far from target |

---

## 3. Fresh-User UX Audit

### 3.1 Simulation Attempt

**Status:** BLOCKED by CLI syntax errors (CLI-1, CLI-2). The CLI cannot launch at all.

**Attempted command:**
```bash
npx tsx scripts/cli-game.ts --new-game --encounters=5 --no-llm --headless \
  --answer "I feel restless lately" \
  --answer "I learned to hide my emotions" \
  --answer "I push through by sheer will" \
  --answer "I tell people what they want to hear" \
  --answer "I want to understand myself but fear what I might find"
```

**Result:** `TransformError: Expected "]" but found "t"` at line 802, column 106.

### 3.2 Previous Fresh-User Audit Findings (from FRESH-USER-UX-AUDIT-CURRICULUM.md)

The prior audit (same date) ran successfully with LLM enabled and found:

| Finding | Severity | Status |
|---|---|---|
| Curriculum invisible in CLI | 🔴 Critical | **Still unaddressed** |
| Integration prompt response ignored | 🔴 Critical | ⚠️ `generatePracticeHint()` exists but CLI broken |
| No curriculum encounters interleaved | 🔴 High | **Cold-start problem** — fresh players have no knowledge state |
| Shadows surfaced but not actionable | 🟡 Medium | Partially addressed (post-session summary exists) |
| Glossary lockout too aggressive | 🟡 Medium | Unchanged |
| No post-session summary | 🟡 Medium | ✅ Fixed — `renderPostSessionSummary()` exists |
| No curriculum progress in CLI | 🟡 Medium | Unchanged |
| Chinese character in LLM narrative | 🟢 Low | LLM artifact, not code bug |

### 3.3 What the Fresh User Would See (If CLI Worked)

Based on code analysis of the CLI flow:

1. **Banner:** "Mysterium — A contemplative RPG that mirrors you back to yourself..." ✅ Good
2. **Onboarding:** Altitude inference from `--answer` content (or calibration if interactive) ✅ Good
3. **Encounters:** Developmental assessment questions via AgenticOrchestrator ✅ Good
4. **Curriculum encounters:** ❌ NEVER APPEAR — `generateCurriculumEncounters()` returns empty when `sig.knowledge` is undefined or has zero concept states
5. **Post-session summary:** ✅ `renderPostSessionSummary()` shows shadows, lines explored, knowledge state
6. **Practice hints:** ✅ `generatePracticeHint()` exists but CLI can't reach it due to syntax errors
7. **Diagnostic:** ❌ Unreachable (CLI broken)
8. **Curriculum lint/list:** ❌ Unreachable (CLI broken)

---

## 4. Experiential Soundness Assessment

### 4.1 The Assessment vs. Practice Gap

The system currently operates as a **mirror** (reflecting patterns) but not as a **catalyst** (provoking behavioral change). The curriculum system was designed to bridge this gap — depth rubrics, forgetting curves, adaptive difficulty, and study themes would create structured developmental practice. But the bridge is incomplete:

**What exists (engine layer):**
- ✅ 6-level depth assessment (memorized → transformed)
- ✅ Spaced repetition via forgetting curves
- ✅ 6 study themes (review_decay, new_material, depth_push, cross_domain, misconception_repair, integration_sprint)
- ✅ Adaptive difficulty (push deeper when retention > 0.8 + reviewCount >= 3)
- ✅ Cross-branch prerequisite enforcement
- ✅ Modality effectiveness analytics

**What's missing (experience layer):**
- ❌ Curriculum encounters never appear for fresh players
- ❌ No "onboarding curriculum" that seeds initial knowledge state
- ❌ No visible connection between reflection answers and curriculum study
- ❌ No practice assignments surfaced to the player
- ❌ No integration between shadow work and curriculum study

### 4.2 The Cold-Start Problem

This is the **single most critical gap** in the entire system:

```
Fresh player → sig.knowledge = undefined
→ generateCurriculumEncounters() checks: kh.conceptCoverage === 0 && kh.averageDepth === 0
→ Returns empty array
→ Zero curriculum encounters ever appear
→ Player never experiences the curriculum system
→ All 64 seed holons, forgetting curves, depth rubrics, adaptive difficulty = invisible
```

The curriculum system requires the player to already have knowledge state to generate candidates, but new players have no knowledge state. This is a **chicken-and-egg problem** that needs an explicit onboarding curriculum path.

### 4.3 Veil Integrity

| Aspect | Status | Notes |
|---|---|---|
| No clinical labels in output | ✅ | `describeShadowMovement()` translates codes to felt-sense |
| No numeric metrics exposed | ✅ | `cciToFeltSense()`, `saturationToFeltSense()` used |
| Glossary progressive unlock | ⚠️ | Too slow — terms referenced in narrative remain locked |
| --dev mode warning | ✅ | Clear Veil-violation warning shown |
| --verbose gated behind --dev | ✅ | Prevents accidental exposure |

---

## 5. Efficacy Assessment — "Accelerate Evolution and Healing"

### 5.1 The Law-of-One Catalyst Model

Per foundations/14, the game follows: **Catalyst → Experience → Integration**

Current flow:
```
Question → Player answer → LLM reflection → Next question
```

Efficacious flow (per plan):
```
Catalyst (provocative situation) → Player response →
  LLM assessment + shadow surfacing →
    Practice assignment (specific developmental exercise) →
      Integration checkpoint → Next catalyst
```

**Gap:** The practice assignment and integration checkpoint steps are architecturally present (`generatePracticeHint()`, `renderPostSessionSummary()`) but unreachable due to CLI bugs and the cold-start problem.

### 5.2 What the System Does Well

1. **Pattern recognition across encounters** — LLM references earlier answers
2. **Shadow surfacing** — 4 shadows in 5 encounters (high signal)
3. **Non-clinical narrative voice** — mythopoetic, not diagnostic
4. **Adaptive questioning** — questions adjust based on previous responses
5. **Somatic pushback** — LLM called out intellectualizing: "You said 'understand why' — that phrase lives entirely in the head"
6. **Post-session summary** — felt-sense language, no metrics
7. **Practice hint generation** — keyword-matched developmental exercises

### 5.3 What the System Lacks

| Missing Element | Why It Matters | Current State |
|---|---|---|
| **Curriculum encounters** | Structured learning requires sequential material | ❌ Cold-start blocks all curriculum |
| **Practice assignments visible** | Healing requires doing, not just reflecting | ⚠️ Code exists, CLI broken |
| **Integration checkpoints** | Growth happens between sessions | ⚠️ Integration prompt exists but response not acted upon |
| **Somatic practices** | Body stores trauma; cognitive reflection alone insufficient | ❌ No somatic exercises despite "Somatic" line |
| **Peer/community elements** | Healing often requires relational witness | ❌ SocialCooperative modality exists but not surfaced |
| **Cross-session continuity** | Players need to see growth over time | ⚠️ WebUI has dashboards; CLI has none |
| **Progress tracking** | Players need to see their growth to stay motivated | ⚠️ KnowledgeDashboard exists but not in CLI |

---

## 6. Gap Analysis: Curriculum Plan vs. Actual Implementation

### 6.1 Completed Phases (from foundations/36)

| Phase | Description | Status |
|---|---|---|
| **Phase A** | Prerequisite depth enforcement | ✅ `prerequisitesAtRequiredDepth()` in CandidateGeneration |
| **Phase B** | Deepen the holarchy | ⚠️ Partial — CS program has full hierarchy; others are flat |
| **Phase C** | Dual-depth assessment engine | ⚠️ `DepthAssessment` exists but not wired to encounter scoring |
| **Phase D** | LLM-driven adaptive content | ❌ Not implemented |
| **Phase E** | Analytics engine | ✅ `LearningAnalytics.ts` complete |
| **Phase F** | Research pipeline | ❌ Not implemented |
| **Phase G** | Curriculum management | ⚠️ Registry + linter exist; browse UI exists; versioning partial |

### 6.2 Critical Gaps (P0)

| # | Gap | Impact | Effort |
|---|---|---|---|
| **G0** | CLI syntax errors prevent launch | No user can experience the game | 30 min fix |
| **G1** | Cold-start: fresh players never see curriculum | 100% of curriculum investment invisible | 1-2 days |
| **G2** | Curriculum encounters not interleaved in CLI sessions | Curriculum system architecturally complete but experientially absent | 1 day |

### 6.3 Important Gaps (P1)

| # | Gap | Impact | Effort |
|---|---|---|---|
| **G3** | LLM-driven adaptive content | Cannot personalize at any level | 7-10 days |
| **G4** | Dual-depth assessment in encounters | Binary pass/fail, no real depth measurement in gameplay | 5-7 days |
| **G5** | Practice assignments not surfaced to player | Reflection without action = assessment, not healing | 1 day |
| **G6** | Integration prompt response not connected to follow-up | Player's reflection is captured but not acted upon | 1 day |

### 6.4 Nice-to-Have Gaps (P2)

| # | Gap | Impact | Effort |
|---|---|---|---|
| **G7** | Research/original contribution tracking | Cannot model Ph.D.-level work | 10-15 days |
| **G8** | Cross-disciplinary integration engine | Cannot model graduate-level synthesis | 5-7 days |
| **G9** | Mentor/advisor role | Cannot model academic social structure | 5-7 days |
| **G10** | Curriculum versioning (runtime) | Cannot iterate without breaking progress | 3-5 days |
| **G11** | Adaptive difficulty within concept | Cannot personalize within a concept | 3-5 days |
| **G12** | Study session analytics display | Cannot provide data-driven recommendations | 5-7 days |

---

## 7. Recommendations

### 🔴 P0 — Must Fix (Blocks Core Functionality)

| # | Recommendation | Effort | Impact |
|---|---|---|---|
| **R1** | **Fix CLI syntax errors.** Remove stray semicolon at line 109. Escape or convert apostrophes in practiceMap strings (lines 802, 805, 806, 825). Verify with `npx tsx scripts/cli-game.ts --help`. | 30 min | Unblocks entire CLI |
| **R2** | **Solve the cold-start problem.** When `sig.knowledge` is empty, seed it with 2-3 introductory concepts from the player's dominant line's curriculum. This could be a `seedInitialKnowledge()` function called during `createDefaultSignificator()` that picks branch-level holons matching the player's altitude. | 1 day | Makes curriculum visible to fresh players |
| **R3** | **Wire curriculum encounters into CLI session loop.** The `generateCurriculumEncounters()` function already exists in GameLoop.ts. The issue is that it returns empty when knowledge is empty. Fix R2 first, then verify curriculum encounters appear interleaved with developmental ones. | 1 day | Makes curriculum experientially real |

### 🟡 P1 — Should Fix (Improves Experience)

| # | Recommendation | Effort | Impact |
|---|---|---|---|
| **R4** | **Surface practice assignments.** After each encounter, if `generatePracticeHint()` returns non-null, display it as a "carrying forward" section. The code exists; it just needs to be called from the CLI encounter loop. | 1 day | Transforms reflection into action |
| **R5** | **Connect integration prompt to follow-up.** When the player responds to the session-end integration prompt, use the response to seed the `goals.yaml` active_focus field. The code already reads this field for the "For next time:" display. | 1 day | Creates cross-session continuity |
| **R6** | **Unlock glossary terms sooner.** After 5 encounters, at least "Shadow", "Line", and "Drive" should be unlocked since they're referenced in narrative. Current unlock rate is too slow. | 30 min | Reduces confusion |
| **R7** | **Add ESLint `no-unescaped-apostrophe` or `quotes: ['error', 'single', { avoidEscape: true }]`** to prevent CLI-2 class of bugs from recurring. | 30 min | Prevents regression |
| **R8** | **Display curriculum progress in CLI status.** Add a one-line indicator: "3 concepts studied, 67% average depth, 82% retention". The data exists in `sig.knowledge`; it just needs rendering. | 2 hours | Shows curriculum is working |

### 🟢 P2 — Enhancement (Builds Toward Vision)

| # | Recommendation | Effort | Impact |
|---|---|---|---|
| **R9** | **Wire DepthAssessment into encounter scoring** (Phase C of foundations/36). Replace binary pass/fail with dual-depth assessment during gameplay. | 5-7 days | Enables real depth measurement |
| **R10** | **Build onboarding curriculum path.** Create a "first 5 concepts" curriculum sequence that introduces the game's developmental framework through structured learning, not just reflection. | 3-5 days | Onboards players into curriculum system |
| **R11** | **Add `mysterium curriculum browse` CLI command.** Show the curriculum tree, progress, and study recommendations in the terminal (CLI parity with WebUI). | 2-3 days | CLI users can discover curriculum |
| **R12** | **Progressive narrative complexity.** As stages advance, encounters should become more challenging and nuanced. Currently all encounters feel similar regardless of stage. | 5-7 days | Matches developmental edge |

### ⚪ YAGNI — Don't Build Yet

| # | Item | Why Not Yet |
|---|---|---|
| **Y1** | JSON curriculum editor UI | No one has authored a curriculum yet; wait for first real curriculum author |
| **Y2** | LLM-generated curriculum content (Phase D) | Static JSON is sufficient for MVP; adaptive content generation is premature |
| **Y3** | Cross-domain isomorphism surfacing | No cross-branch prerequisites exist in seed data yet |
| **Y4** | Research pipeline (Phase F) | Core curriculum must work first; Ph.D.-level features are years away |
| **Y5** | Mentor/advisor NPC system | Requires LLM content generation (Phase D) to be functional first |

---

## 8. Priority Roadmap

### Immediate (This Session)
1. Fix CLI syntax errors (R1) — 30 min
2. Verify CLI launches and runs (R1 continued)
3. Run fresh-user simulation with working CLI

### This Week
4. Solve cold-start problem (R2) — 1 day
5. Wire curriculum encounters into CLI (R3) — 1 day
6. Surface practice assignments (R4) — 1 day

### This Month
7. Connect integration prompt (R5) — 1 day
8. Add ESLint guard (R7) — 30 min
9. Display curriculum progress in CLI (R8) — 2 hours
10. Unlock glossary sooner (R6) — 30 min

### Next Phase
11. Wire DepthAssessment into encounters (R9) — 5-7 days
12. Build onboarding curriculum (R10) — 3-5 days
13. CLI curriculum browse (R11) — 2-3 days

---

## 9. Key Metrics

| Metric | Value | Target | Gap |
|---|---|---|---|
| Tests passing | 793/793 (100%) | 100% | ✅ None |
| Workspace lint | 0 violations | 0 | ✅ None |
| CLI launchable | ❌ Broken | Working | 🔴 Critical |
| Curriculum holons seeded | ~64 | ~50 (Phase B) | ✅ On track |
| Holon levels used | 7 of 11 | 4 (Phase B) | ✅ Exceeds |
| Curriculum encounters visible | 0 | All sessions | 🔴 Cold-start |
| Practice assignments surfaced | 0 | Every session | ⚠️ Code exists |
| Post-session summary | ✅ Working | Working | ✅ Complete |
| Forgetting curves | ✅ Working | Working | ✅ Complete |
| Adaptive difficulty | ✅ Working | Working | ✅ Complete |
| Learning analytics | ✅ Working | Working | ✅ Complete |

---

## 10. Conclusion

The Mysterium curriculum system is a **remarkably complete engine** hiding behind a **broken door**. The type system, linter, seed data, forgetting curves, adaptive difficulty, learning analytics, and cross-branch prerequisite enforcement are all implemented and tested. The architectural vision in foundations/35-36 is being faithfully realized at the code level.

But the system fails its most basic test: **can a new user experience it?** The answer today is no — the CLI can't launch, and even if it could, fresh players would never see a curriculum encounter because of the cold-start problem.

**The single most impactful change** is solving the cold-start problem (R2) and wiring curriculum encounters into the CLI session loop (R3). This would transform the curriculum system from an invisible engine into an experiential reality, fulfilling the promise of foundations/36: *"a full graduation-level architecture that scales from foundational concepts through Ph.D.-level research."*

The machine is built. It needs fuel and a key.

---

*Report generated July 23, 2026.*  
*793 tests passing | CLI blocked by 2 syntax errors | Curriculum engine complete but invisible to players.*
