# Fresh-User UX Audit Report — CCRPG Curriculum Architecture

**Date:** July 23, 2026  
**Methodology:** Headless simulation of 5 encounters with 10 reflective answers, followed by post-session state inspection  
**LLM:** mimo-v2.5-free via opencode.ai  
**Test Profile:** cli-player (fresh game, --new-game flag)

---

## 1. Executive Summary

The CCRPG CLI is **technically operational** and delivers a coherent reflective experience. The LLM generates genuinely insightful narrative responses that reference the player's actual answers across encounters. The shadow-surfacing mechanism works (4 patterns surfaced in 5 encounters). The adaptive narrative memory and cross-encounter pattern recognition are functional.

**However, the experience has significant gaps** between its stated mission ("accelerate evolution and healing in the individual") and its actual delivery. The system currently operates primarily as a **reflective assessment tool** rather than a **developmental practice**. The curriculum system (the latest upgrade) is present in the codebase but **not surfaced to the player** during session play — there is no visible curriculum integration in the CLI output.

---

## 2. Technical Soundness Assessment

### ✅ What Works

| Component | Status | Evidence |
|---|---|---|
| Module Registry | ✅ 64 modules loaded | Diagnostic output confirms all 64 modules registered |
| Scheduler | ✅ Produces encounters | Warmup → peak → cooldown arc functioning |
| LLM Integration | ✅ Active, responsive | mimo-v2.5-free returns coherent, reflective narratives |
| Cross-encounter memory | ✅ Referencing earlier answers | Encounter 3 (Willpower) referenced encounter 1's "strategic observation" pattern |
| Shadow surfacing | ✅ 4 shadows in 5 encounters | Session_ended event reports shadowsSurfaced: 4 |
| Profile persistence | ✅ Save/load works | Post-session status shows correct state |
| Glossary | ✅ Progressive unlock | 1 term unlocked after session (Encounter), 5 locked |
| Integration prompt | ✅ Fires at session end | "Before you go — what surprised you in this session?" |
| Curriculum Registry | ✅ Seeds on session start | GameLoop.startSession() calls seedCurriculumRegistry() |
| Adaptive difficulty | ✅ Code complete | computeAdaptiveTargetDepth/priority implemented |

### ⚠️ Issues Found

| Issue | Severity | Description |
|---|---|---|
| **Curriculum invisible in CLI** | 🔴 Critical | The curriculum system (latest upgrade) is not surfaced to the player. No curriculum encounters, no knowledge state display, no study recommendations appear in CLI output. |
| **Integration prompt response ignored** | 🔴 Critical | The integration prompt fires ("Before you go — what surprised you?") but the response ("I value honesty but sometimes withhold it to keep peace") is **not connected** to any curriculum or developmental follow-up. It's captured but not acted upon. |
| **No curriculum encounters interleaved** | 🔴 High | GameLoop.ts has curriculum encounter interleaving code (lines 331-336), but in headless mode with no curriculum data seeded, zero curriculum encounters appear. The `new_material` study theme requires concepts in the registry, but the CLI path doesn't populate it for the player. |
| **Shadows surfaced but not actionable** | 🟡 Medium | 4 shadows were surfaced, but the player has no way to see, track, or work with them outside the narrative flow. The shadow entries exist on the Significator but are never displayed to the CLI user. |
| **Glossary lockout too aggressive** | 🟡 Medium | After 5 encounters, only 1 of 6 locked terms is unlocked. Terms like "Shadow", "CCI", "Drive" remain locked despite being referenced in the narrative. Players encounter terms they can't define. |
| **No post-session summary** | 🟡 Medium | After 5 encounters, the player gets no summary of what was explored, what patterns emerged, or what to do next. The session just ends. |
| **No curriculum progress visible** | 🟡 Medium | The KnowledgeDashboard and /curriculum/progress routes exist in the WebUI but have no CLI equivalent. CLI users cannot see their curriculum progress. |
| **Chinese character in narrative** | 🟢 Low | Encounter 3 (Willpower) contains "相反" (Chinese for "opposite") in the LLM response — a language mixing artifact from the model. |

---

## 3. Experiential Soundness Assessment

### 3.1 The Narrative Quality

**Strength:** The LLM generates genuinely reflective, non-clinical prose. The narrative voice is consistent and avoids diagnostic language. Example:

> *"Rather than examining the cost of precision—the pauses and strategic withdrawals—they revealed a相反 pattern: when stuck, they push harder. The fortress walls echo with this resolve, a testament to unwavering will."*

This is poetic, evocative, and avoids the "therapy speak" that would break immersion.

**Weakness:** The questions are **assessment-oriented**, not **practice-oriented**. Every encounter is a question that probes the player's psychology. There is no **practice** component — no exercise, no meditation, no behavioral experiment, no integration task. The game is asking "what do you notice?" but never "now try this."

### 3.2 The Veil Integrity

**Strength:** No clinical labels, no stage numbers, no CCI scores, no raw metrics appear in the player-facing output. The Veil is maintained.

**Weakness:** The glossary lockout undermines the Veil in a different way — players encounter terms in the narrative (like "Shadow") that they can't look up because the term is locked. This creates confusion rather than mystery.

### 3.3 The Developmental Efficacy

**Critical Gap:** The system currently functions as a **mirror** (reflecting the player's patterns back to them) but not as a **catalyst** (actively provoking growth). The Law-of-One framework describes catalyst as something that **forces** a choice, not something that merely observes one.

The current flow is:
```
Question → Player answer → LLM reflection → Next question
```

The efficacious flow should be:
```
Catalyst (provocative situation) → Player response → 
  LLM assessment + shadow surfacing → 
    Practice assignment (specific developmental exercise) →
      Integration checkpoint → Next catalyst
```

### 3.4 The Curriculum Integration Gap

The entire curriculum system upgrade (knowledge taxonomies, depth rubrics, forgetting curves, adaptive difficulty, cross-domain isomorphisms) exists in the codebase but is **invisible to the CLI player**. The `generateCurriculumCandidates()` function is called in GameLoop.ts, but:

1. No curriculum data is seeded for the CLI player (only developmental modules exist)
2. No curriculum encounters appear in the session output
3. No knowledge state is displayed in status/diagnostic
4. No study recommendations are surfaced

---

## 4. Efficacy Assessment — "Accelerate Evolution and Healing"

### 4.1 What the System Does Well

1. **Pattern Recognition:** The LLM correctly identifies recurring patterns across answers (e.g., "strategic observation" appearing in answers 1, 2, and 3)
2. **Shadow Surfacing:** 4 shadows surfaced in 5 encounters — the system is identifying unresolved patterns
3. **Non-clinical Framing:** The narrative avoids pathologizing the player
4. **Cross-encounter Memory:** Earlier answers are referenced in later encounters

### 4.2 What the System Lacks

| Missing Element | Why It Matters | Current State |
|---|---|---|
| **Practice assignments** | Healing requires doing, not just reflecting | ❌ No practice component |
| **Integration checkpoints** | Growth happens between sessions, not during | ⚠️ Integration prompt exists but response is not acted upon |
| **Behavioral experiments** | Evolution requires testing new patterns | ❌ No experiments suggested |
| **Somatic practices** | The body stores trauma; cognitive reflection alone is insufficient | ❌ No somatic exercises despite "Somatic" line existing |
| **Peer/community elements** | Healing often requires relational witness | ❌ SocialCooperative modality exists but not surfaced |
| **Progress tracking** | Players need to see their growth to stay motivated | ⚠️ WebUI has dashboards; CLI has none |
| **Curriculum progression** | Structured learning requires sequential material | ❌ Curriculum system exists but not integrated into CLI |
| **Adaptive difficulty** | One-size-fits-all assessment misses the player's edge | ✅ Code complete but not surfaced |

---

## 5. Upgrade/Refactor/YAGNI Recommendations

### 🔴 P0 — Must Fix (Blocks Efficacy)

| # | Recommendation | Effort | Impact |
|---|---|---|---|
| **P0-1** | **Surface curriculum encounters in CLI.** Wire `generateCurriculumCandidates()` output into the CLI encounter loop so players see curriculum questions interleaved with developmental ones. | Medium | Makes the latest upgrade visible |
| **P0-2** | **Connect integration prompt to follow-up.** When the player responds to "what surprised you?", use the response to generate a specific practice assignment for the next session. | Medium | Transforms reflection into action |
| **P0-3** | **Add post-session summary.** After session end, display: shadows surfaced, patterns identified, suggested focus for next session, glossary terms unlocked. | Low | Gives player a sense of progress |

### 🟡 P1 — Should Fix (Improves Experience)

| # | Recommendation | Effort | Impact |
|---|---|---|---|
| **P1-1** | **Unlock glossary terms sooner.** After 5 encounters, at least "Shadow" and "Line" should be unlocked since they're referenced in narrative. | Low | Reduces confusion |
| **P1-2** | **Add practice assignments.** After shadow surfacing, suggest a specific somatic/reflective practice (e.g., "Tomorrow, notice when you reach for precision — pause for 3 breaths before responding"). | Medium | Adds behavioral component |
| **P1-3** | **Display knowledge health in CLI status.** Add a one-line curriculum progress indicator: "3 concepts studied, 67% average depth, 82% retention". | Low | Shows curriculum is working |
| **P1-4** | **Fix Chinese character in narrative.** The LLM occasionally outputs non-English text. Add a post-processing filter or system prompt constraint. | Low | Polish |

### 🟢 P2 — Nice to Have (Enhancement)

| # | Recommendation | Effort | Impact |
|---|---|---|---|
| **P2-1** | **Add `ccrpg curriculum` CLI command.** Show curriculum tree, progress, and study recommendations in the terminal. | Medium | CLI parity with WebUI |
| **P2-2** | **Add `ccrpg journal` CLI command.** Display shadow entries, integration notes, and practice history. | Medium | Player can review between sessions |
| **P2-3** | **Progressive narrative complexity.** As stages advance, the LLM's questions should become more challenging and nuanced. Currently all encounters feel similar regardless of stage. | High | Matches developmental edge |

### ⚪ YAGNI — Don't Build Yet

| # | Item | Why Not Yet |
|---|---|---|
| **YAGNI-1** | JSON curriculum editor UI | No one has authored a curriculum yet; wait for first real curriculum author |
| **YAGNI-2** | LLM-generated curriculum content | Static JSON is sufficient for MVP; adaptive content generation is premature |
| **YAGNI-3** | Cross-domain isomorphism surfacing | No cross-branch prerequisites exist in seed data yet |

---

## 6. Detailed Session Replay Analysis

### Encounter 1: Interpersonal (Orange)
- **Question:** "What would it cost you to let those people see you struggling?"
- **Player Answer:** "I am curious about patterns in my thinking" (answer 1 — not a direct response)
- **LLM Response:** Correctly identified the avoidance pattern: "when the interpersonal surface opens toward exposure, the mind retreats to meta-observation"
- **Assessment:** ✅ Insightful. The LLM caught the mismatch between the question and the answer.

### Encounter 2: Emotional (Orange)
- **Question:** "Before the satisfaction faded — what did the success actually feel like?"
- **Player Answer:** "I notice I tend to rush through decisions" (answer 2 — partially relevant)
- **LLM Response:** Brief but acknowledges the emotional dimension received the offering
- **Assessment:** ⚠️ Underdeveloped. The response is too short to be catalytic.

### Encounter 3: Willpower (Orange)
- **Question:** Adaptive — referenced encounter 1's "strategic observation" pattern
- **Player Answer:** "When I feel stuck, I usually try harder rather than stepping back" (answer 3 — directly relevant)
- **LLM Response:** Strong — identified the "push harder" pattern and asked "what might be gained by standing still?"
- **Assessment:** ✅ Best encounter. Cross-reference + direct relevance + provocative question.

### Encounter 4: Intrapersonal (Orange)
- **Question:** Adaptive — referenced encounter 1's "stepping back into observation"
- **Player Answer:** "My relationships sometimes feel surface-level" (answer 4 — relevant)
- **LLM Response:** Good — identified walls around relationships, but deeper question remained unexamined
- **Assessment:** ✅ Solid. Pattern recognition working well.

### Encounter 5: Somatic (Orange)
- **Question:** Asked about body's response to familiar pull
- **Player Answer:** "I want to understand why I avoid difficult emotions" (answer 5 — cognitive, not somatic)
- **LLM Response:** Excellent — called out the dodge: "You said 'understand why' — that phrase lives entirely in the head. What does the body know?"
- **Assessment:** ✅ Best for efficacy. The LLM pushed back on intellectualizing and asked for somatic awareness.

---

## 7. Key Metrics from Simulation

| Metric | Value | Assessment |
|---|---|---|
| Total encounters | 5 | ✅ As requested |
| Lines assessed | 5 (Interpersonal, Emotional, Willpower, Intrapersonal, Somatic) | ✅ Good diversity |
| Shadows surfaced | 4 | ✅ High signal |
| Sessions completed | 1 | ✅ Fresh user |
| Final stage | Orange | ⚠️ Default — no calibration |
| Glossary terms unlocked | 1 of 6 | ⚠️ Too few |
| Curriculum encounters | 0 | 🔴 Not integrated |
| Integration prompts | 1 | ✅ Fires correctly |
| LLM latency per encounter | ~15-20s | ⚠️ Acceptable for CLI, slow for Web |
| Post-session summary | None | 🔴 Missing |

---

## 8. Conclusion

The CCRPG is a **technically sophisticated reflective assessment engine** with strong LLM integration and narrative quality. The curriculum system upgrade is architecturally sound and well-tested.

However, the system is **not yet delivering on its core promise** of accelerating evolution and healing. The gap is between **assessment** (identifying patterns) and **practice** (provoking behavioral change). The curriculum system — with its depth rubrics, forgetting curves, and adaptive difficulty — is the missing bridge, but it needs to be **surfaced to the player**.

**The single most impactful change** would be connecting the curriculum system to the CLI session loop so that players experience curriculum encounters alongside developmental ones, creating a path from reflection to structured practice.

---

*Report generated from fresh-user simulation on July 23, 2026.*  
*LLM: mimo-v2.5-free | 5 encounters | 10 answers | Fresh game state.*
