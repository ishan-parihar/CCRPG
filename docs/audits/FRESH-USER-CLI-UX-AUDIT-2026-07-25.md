# Fresh-User CLI UX Audit — 2026-07-25

> **Audit scope:** End-to-end CLI operationality, curriculum architecture wiring, experiential soundness, and efficacy for "accelerating evolution and healing in the individual."
> **Method:** Fresh-user simulation across all CLI entry points (help, session, glossary, status, curriculum, diagnostic, profile, setup-profile), with LLM-on and LLM-off paths, headless and dev modes.
> **No frontend-webui was tested.** This audit covers backend CLI only.

---

## 1. Executive Summary

The Mysterium CLI is **architecturally sound** — 793 tests pass, 64 assessment modules load, 48 curriculum holons seed correctly, and the LLM integration produces genuinely compelling mythopoetic reflection. The game's contemplative frame (Veil principle) is well-defended across multiple layers.

However, **5 critical gaps** and **12 UX issues** prevent the system from delivering on its promise to a fresh user:

| Severity | Count | Theme |
|----------|-------|-------|
| 🔴 Critical | 5 | LLM dependency, session timeout, curriculum sparsity, onboarding friction, missing fallback |
| 🟡 Significant | 7 | Glossary wall, feedback loop closure, practice portability, cross-session continuity |
| 🟢 Minor | 5 | Formatting polish, help text, diagnostic detail, curriculum warnings |

---

## 2. What Works Well (Experiential Wins)

### 2.1 The Veil Is Intact
Every user-facing output respects the contemplative frame:
- `--dev` is gated behind a clear warning and hidden from `--help`
- `--verbose` requires `--dev` (prevents accidental metric leakage)
- Felt-sense indicators (`cciToFeltSense`, `saturationToFeltSense`) replace raw numbers
- Shadow quadrants are described as movements ("a pull toward a familiar capacity"), not clinical labels
- Post-session summary shows patterns surfaced, not scores achieved

**Verdict:** The Veil principle is the system's strongest UX achievement. It holds under every tested path.

### 2.2 The LLM Reflection Is Genuinely Compelling
In the 1-encounter simulation, the LLM produced:
> *"Something here is being avoided; the body flinches before the mind catches up."*

This is not generic chatbot output — it's mythopoetic, psychologically precise, and non-diagnostic. The ContextPipeline, VeilFilter, and modality-specific rubrics are doing their job.

### 2.3 Subcommand Ecosystem Is Complete
`glossary`, `status`, `curriculum lint/list/progress`, `profile show`, `diagnostic` all function correctly and produce coherent output. The CLI is not just a game launcher — it's a complete system management interface.

### 2.4 Profile System Works End-to-End
After a single 1-encounter session, `profile show` returns a coherent narrative synthesis with insights, patterns, and an interpersonal edge. Data persists to `~/.mysterium/profiles/default/` with proper file structure (identity.yaml, narrative-memory.md, goals.yaml, etc.).

---

## 3. Critical Issues 🔴

### 3.1 LLM Dependency Is Absolute — No Graceful Degradation
**Impact:** Fresh user cannot play at all without LLM credentials.

When `--no-llm` is passed, the CLI exits with:
```
✗ Mysterium requires an active LLM to run reflective sessions.
The LLM is the game's therapeutic engine. Without it, encounters become
echo-only — your words returned with no reflection. This is worse than silence.
```

**The problem:** This is philosophically correct ("echo-only is worse than silence") but experientially devastating. A fresh user who:
- Has no API key
- Is on a slow connection
- Hit rate limits
- Just wants to try the game before committing to a provider

...is immediately blocked. The game that promises "no wrong answers" gives them a fatal error as their first interaction.

**Recommendation:** Implement a **deterministic reflection mode** using the existing FallbackProvider + FallbackNarratives. The system already has:
- `pickFallbackNarrative()` (R5-BUG-5)
- `FallbackProvider` with keyword-matching scoring
- `withFallbackVeil` wrapper

Instead of blocking, fall back to curated reflections that maintain the contemplative frame. Mark the session as "offline mode" in the save file so the LLM can retroactively enrich the profile on next online session.

### 3.2 Session Hangs on Slow LLM — No User Feedback
**Impact:** First impression is a frozen terminal.

The 3-encounter headless session **timed out after 300 seconds** with zero output after the boot sequence. The 1-encounter session eventually succeeded after ~120 seconds.

**Root cause:** The LLM timeout is 30 seconds per call (`LLM_TIMEOUT_MS = 30_000`), but the AgenticOrchestrator makes multiple sequential LLM calls per encounter (up to `maxLoops`). With a slow model like `mimo-v2.5-free` on opencode.ai, each call takes 20-60 seconds, and the orchestrator may make 2-5 calls per encounter.

**The problem:** During this entire wait, the user sees nothing. No spinner, no progress indicator, no "the game is reflecting on your words..." message. The terminal appears frozen.

**Recommendation:**
1. Add a spinning indicator during LLM calls: `ora('The game is reflecting...').start()`
2. Show encounter-level progress: `Encounter 1/3 — asking the question...`
3. Add a per-encounter timeout that falls back to deterministic reflection if LLM takes >60s
4. Show elapsed time in headless mode for debugging

### 3.3 Curriculum Is Sparse — 48 Holons Across Only 3 Branches
**Impact:** The curriculum system is architecturally complete but content-poor.

The curriculum has:
- 48 holons total
- 3 branches: `cs.foundations`, `math.foundations`, `physics.foundations`
- 7 concepts, 8 subjects, 2 courses, 3 lessons
- 80 lint warnings (unspecified)

**The problem:** The architecture doc (`04-curriculum-system.md`) promises "a complete education replacement with 5-level knowledge hierarchy." The reality is 3 CS/Math/Physics foundations with minimal depth. The curriculum cannot yet serve as a developmental practice because there's not enough content to create meaningful study sequences, spaced repetition cycles, or cross-domain isomorphisms.

**Recommendation:**
1. Triage the 80 lint warnings — are they missing prerequisites, incomplete metadata, or structural issues?
2. Prioritize filling the 64 module slots (8 lines × 8 stages) with at least observation-depth content
3. Implement the cross-domain isomorphisms (the architecture's most unique promise)
4. Add curriculum content for Emotional, Moral, Intrapersonal, Spiritual, Somatic, Willpower, Interpersonal lines (currently only Cognitive-adjacent content exists)

### 3.4 Onboarding Friction — 8 Calibration Probes Before First Encounter
**Impact:** Fresh user must answer 8 questions before seeing any gameplay.

The interactive calibration (`runQuickCalibration`) presents:
- 6 multiple-choice probes (Cognitive, Emotional, Moral, Intrapersonal, Spiritual, Interpersonal)
- 2 timing probes (Somatic, Willpower — press Enter after X seconds)

Each probe shows a progress bar and confidence score. Total time: ~5-10 minutes.

**The problem:** This feels like a psychometric intake, not a game. The progress bars with stage names (`Infrared ■■○○○○○ Red`) and confidence scores (`confidence: 0.52`) break the Veil principle. A fresh user doesn't know what "Infrared" means yet — the glossary hasn't been introduced.

**The `--skip-calibration` flag exists** but defaults to Red for all lines, which the audit found causes experts (therapists, monks, scientists) to bounce because the content is too easy.

**Recommendation:**
1. Move calibration AFTER the first encounter (let the user taste the game first)
2. Use the existing `inferAltitudesFromAnswers()` heuristic for initial seeding — it already works for headless mode
3. Replace the progress bar with felt-sense language: `Cognitive: sensing → Red` instead of `■■○○○○○`
4. Remove confidence scores from user-facing output (they're for `--dev` only)
5. Consider a "quick start" that seeds at Amber (the median stage) and refines through play

### 3.5 No Feedback Loop Closure — Practice Hints Don't Connect to Next Session
**Impact:** The game tells you what to practice but never checks if you did.

The `generatePracticeHint()` function produces specific, actionable practices:
> *"Tomorrow, notice the moment you feel surprised. Pause for 3 breaths before responding."*

But there's no mechanism to:
- Ask "did you notice the surprise?" at the start of the next session
- Track whether the practice was attempted
- Adjust future practices based on engagement
- Connect the practice to the encounter that generated it

**The `goals.yaml` has `active_focus`** but it's write-only — the next session never reads it to condition the encounter selection.

**Recommendation:**
1. At session start, surface the previous session's practice hint: *"Last time, you were invited to notice surprise. Did anything arise?"*
2. Add the practice response as a data point for the encounter scheduler
3. If the player says "I didn't do it," that's valuable data (avoidance pattern)
4. If the player says "I did it and noticed X," feed that into the synthesis

---

## 4. Significant Issues 🟡

### 4.1 Glossary Shows Only 3 Terms — Vocabulary Wall Remains
The glossary shows 3 Tier 1 terms (Line, Stage, Shadow) with 6 more locked behind gameplay. But the CLI output already uses terms like "Significator," "Holon," "CCI," "rayProfile" that aren't in the Tier 1 glossary.

**Fix:** Expand Tier 1 to include the 5-6 terms that appear in normal (non-dev) CLI output.

### 4.2 `setup-profile` Requires Interactive Mode — Cannot Be Scripted
The `setup-profile` command fails in headless mode with `setup-profile requires interactive mode`. This prevents automated onboarding for testing or CI.

**Fix:** Add a `--headless` path that accepts answers from `--answer` flags, or auto-generate a default profile.

### 4.3 Diagnostic Shows "Ironjaw · Gladiator Champion" as NPC
The diagnostic output references game entities ("Ironjaw · Gladiator Champion") that sound like a combat RPG, not a contemplative practice. This leaks the ATB combat legacy into the UX.

**Fix:** Review all holon/NPC names for Veil compliance. Replace combat-themed names with contemplative ones.

### 4.4 Post-Session Summary Doesn't Show What Changed
The summary says "1 pattern surfaced" but doesn't show the pattern's name or description. The player has no sense of what the game "saw" in them.

**Fix:** Show the surfaced pattern's description (in Veil-compliant language): *"A pull toward a familiar capacity was noticed in your responses."*

### 4.5 Cross-Session De-duplication Is Invisible
The system tracks asked prompts (`asked-prompts.json`) to avoid repetition, but the player never knows this is happening. If the same question appears in Session 3 that appeared in Session 1, the player loses trust.

**Fix:** Add a subtle indicator: *"This question has surfaced before — notice if your relationship to it has changed."*

### 4.6 `--answers` File Consumed Silently
When using `--answers <file>`, the file is consumed one line per question. If the file has fewer lines than questions, remaining questions get empty answers. If it has more, extra lines are silently ignored.

**Fix:** Warn when answer count doesn't match question count: `"Warning: file has 5 answers but 8 questions. Remaining questions will be unanswered."`

### 4.7 Integration Ritual Is Not Visible
The code calls `runIntegrationRitual()` and generates practice hints, but in the headless output, the ritual's reflection prompt and the player's response to it are not shown. The player sees the practice hint but not the reflection that generated it.

**Fix:** In headless mode, log the integration ritual's question and the LLM's synthesis.

---

## 5. Minor Issues 🟢

### 5.1 Help Text Has 20+ Options — Overwhelming for Fresh User
The `--help` output shows 20+ flags including `--force-shadow`, `--inject-shadow-keyword`, `--skip-calibration`, `--answers`, `--answer`. Most are testing/debugging flags hidden behind `.hideHelp()` but the visible list is still long.

**Fix:** Group options into "Essential" and "Advanced" sections in help output.

### 5.2 Curriculum Lint Shows 80 Warnings But Not What They Are
The lint command reports "80 warnings" but doesn't show them by default. A developer running `curriculum lint` has no idea what's wrong.

**Fix:** Show warning summaries by default, full details with `--verbose`.

### 5.3 `--new-game` Deletes Save Without Confirmation
In interactive mode, `--new-game` immediately deletes the save file. A misclick destroys all progress.

**Fix:** Add a confirmation prompt in interactive mode: `"This will delete all progress. Are you sure? (y/N)"`

### 5.4 Status Shows "64 loaded modules" — Technical Detail
The status command shows "64 loaded modules" which is an implementation detail, not player-facing information.

**Fix:** Replace with "Your inner landscape spans 8 dimensions, each at a different depth."

### 5.5 Node.js Version Shown in Status
Status shows `Node v26.4.0` — useful for debugging but not for players.

**Fix:** Move to `--dev` output only.

---

## 6. Experiential Soundness Assessment

### 6.1 Does the Game Accelerate Evolution and Healing?

**Partial yes.** The LLM reflection is genuinely evocative and non-diagnostic. The Veil principle prevents the game from becoming a psychometric instrument. The practice hints are actionable and somatic.

**But:** The game cannot deliver on its promise without:
1. **Sufficient curriculum content** to create genuine learning sequences
2. **Cross-session continuity** to track growth over time (the practice hint gap)
3. **Graceful degradation** so the game works without LLM (offline mode)
4. **Faster feedback loops** — 2+ minutes per encounter kills flow state

### 6.2 Does the Game Maintain the Holonic Principle?

**Yes.** The encounter scheduler correctly:
- Surfaces shadows from earlier stages (holonic return)
- Balances across all 8 lines
- Prevents stage advancement with unresolved shadows
- Tracks CCI across sessions

### 6.3 Does the Game Respect the Veil?

**Mostly.** The Veil holds in:
- Normal CLI output (--dev gated, --verbose gated)
- Post-session summary (felt-sense language)
- Profile synthesis (narrative, not diagnostic)
- Glossary (progressive unlocking)

**Veil leaks in:**
- Calibration progress bars (stage names + confidence scores)
- Diagnostic output (NPC names, "Ironjaw · Gladiator Champion")
- Status output ("64 loaded modules", Node.js version)
- `--dev` warning shown in interactive mode but not gateable

---

## 7. YAGNI Candidates (What to Remove)

### 7.1 PersistentAgent Path — Already Disabled, Dead Code
`USE_PERSISTENT_AGENT = false` is hardcoded. The entire `PersistentAgent` import, `PersistentAgentBridge` import, and Story-Driven mode branch are dead code. The DQ path is the proven architecture.

**YAGNI:** Remove `PersistentAgent`, `PersistentAgentBridge`, `runPersistentAgentEncounter`, and the Story-Driven mode branch from the CLI. Keep the source files in `src/core/agent/` for reference but don't import them into the CLI.

### 7.2 TDG Bridge — Always a No-Op
`startSessionWithTDG` now delegates to sync `startSession()`. `getTDGTransformationPressure` always returns null. The TDG import comment says "removed from CLI."

**YAGNI:** Remove `startSessionWithTDG` and `getTDGTransformationPressure` from GameLoop.ts exports. The CLI never calls them meaningfully.

### 7.3 Macro-Catalyst Engine in endSyncSession
The sync `endSession` uses `require('./engines/MacroCatalystEngine.js')` (dynamic require) to advance macro events. This is the only use of `require()` in the codebase — everything else uses ESM imports.

**YAGNI:** Either convert to static import or remove macro-event advancement from the sync path (it's only meaningful in the async path).

### 7.4 `FORCE_RESPONSES` Constant
`const FORCE_RESPONSES = undefined;` with comment "ponytail: --responses removed, wasn't in commander spec." This is a dead constant.

**YAGNI:** Remove it.

---

## 8. Upgrade Roadmap (Prioritized)

### Phase 1: Critical Fixes (This Week)
1. **Add LLM timeout handling with spinner** — ora spinner during LLM calls, 60s per-encounter timeout with fallback
2. **Implement deterministic fallback mode** — use FallbackProvider when LLM is unavailable
3. **Move calibration after first encounter** — let users taste the game before measuring them
4. **Surface practice hints across sessions** — read `goals.yaml` at session start

### Phase 2: UX Polish (Next Week)
5. **Expand Tier 1 glossary** to cover all terms that appear in normal output
6. **Add answer count warning** to `--answers` file consumption
7. **Show surfaced patterns in post-session summary**
8. **Add cross-session de-duplication indicator**

### Phase 3: Curriculum Fill (This Month)
9. **Triage 80 lint warnings** and fix structural issues
10. **Add content for all 8 lines** (currently only CS/Math/Physics foundations)
11. **Implement cross-domain isomorphisms**
12. **Fill 64 module slots with observation-depth content**

### Phase 4: YAGNI Cleanup (When Convenient)
13. **Remove PersistentAgent imports** from CLI
14. **Remove dead TDG exports** from GameLoop
15. **Remove FORCE_RESPONSES constant**
16. **Convert require() to ESM import** in endSession

---

## 9. Comparison: Architecture Promise vs. Implementation Reality

| Architecture Doc | Promise | Reality | Gap |
|---|---|---|---|
| 04-curriculum-system.md | "Complete education replacement" | 48 holons across 3 branches | Content sparse |
| 03-encounter-system.md | "7 modalities" | Only LanguageReflective + ScenarioChoice functional in DQ mode | 5 modalities unused |
| 10-stage-assessment-architecture.md | "64 assessment modules" | 64 modules loaded ✓ | All load correctly |
| 02-core-engine.md | "5 engines" | All 5 wired ✓ | GameLoop connects them |
| ONBOARDING-REDESIGN-PLAN.md | "Binary-search composite assessment" | Quick calibration with 8 probes | Functional but friction-heavy |
| foundations/21-master-synthesis.md | "Every encounter is a catalyst" | DQ encounters produce genuine reflection | ✓ Delivered |

---

## 10. Conclusion

The Mysterium CLI is a **functioning contemplative game** with a genuinely compelling LLM reflection engine and a well-defended Veil principle. The architecture is sound, the test suite is green, and the profile system works end-to-end.

The critical gaps are:
1. **The game doesn't work without LLM** (absolute dependency, no graceful degradation)
2. **The game is too slow** (2+ minutes per encounter with no user feedback)
3. **The curriculum is architecturally complete but content-poor** (48 holons, 3 branches)
4. **Cross-session continuity is broken** (practice hints don't connect to next session)
5. **Onboarding feels like a psychometric intake** (8 probes before first encounter)

None of these are architectural problems — they're all implementable within the existing architecture. The system is ready for the upgrades; it just needs them.

---

*Audit conducted by Buffy (strategic coding assistant) on 2026-07-25.*
*Simulation data: 10 CLI commands tested, 4 session simulations run, 793 tests verified passing.*
