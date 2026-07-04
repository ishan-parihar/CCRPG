# Cognitive / Green — Scenario-Choice Game Concept

> **Axis:** Cognitive dilemmas requiring simultaneous perspective-holding — problems with no single right answer, requiring contextual judgement.  **Why this axis for this module:** Green cognition is defined by the capacity to act within irreducible plurality; scenario-choice forces commitment without collapsing complexity.

---

## 1. Game Identity

**Name:** The Council of Lenses
**Core loop:** Player faces a community dilemma presented through 4 stakeholder perspectives. Must choose an action that honours the complexity — not the "right" answer, but the most contextually integrated response. Scoring rewards perspective-acknowledgement AND commitment.
**Session length:** 4-8 minutes (1-2 dilemmas per session, infinite checkpoint).
**Felt experience:** Sitting at a round table where 4 advisors speak with equal authority — the player must act as the one who heard them all.

## 2. Catalyst Delivery

**Catalyst type:** Forced-choice dilemmas where all options are valid-in-context and none is universally correct.
**Shadow provocation:** DA surfaces as timeout/non-choice/excessive deliberation. DAll surfaces as instant choice without acknowledging other perspectives. GA surfaces as choosing the "meta" option that claims to transcend the dilemma. GAll surfaces as choosing "no action" or "all perspectives are equal" as a position.
**Drive engagement:** Agency = the act of choosing. Communion = the quality of perspective-acknowledgement before choosing. Eros = reaching toward the most integrative option. Agape = honouring what each perspective loses in the choice.
**Progression:** Diagnosis (choice patterns, deliberation time, perspective-acknowledgement) → Healing (shadow-targeted dilemma selection) → Evolution (fluid contextual commitment).

## 3. Game Design

**Mechanics:**
- Dilemma presented as animated vignette (30-60s)
- 4 stakeholder perspectives revealed sequentially (player can revisit)
- Player has access to "perspective map" showing relationships between viewpoints
- 4-6 action options, each aligned with different perspective combinations
- Before choosing: player marks which perspectives they considered (implicit metacognition probe)
- After choosing: brief consequence reveal showing impact on each stakeholder
- No "correct" answer — scoring based on integration quality, not option selected

**Scoring model:**
- Deliberation quality: time spent × perspectives accessed (not raw time)
- Perspective-acknowledgement: which stakeholders consulted before choice
- Choice-integration: does chosen option honour multiple perspectives or collapse to one
- Commitment clarity: decisiveness once choice is made (no waffling)
- Consequence-awareness: post-choice reflection accuracy

**Shadow-specific difficulty:**
- DA pattern: reduce available time, increase commitment reward
- DAll pattern: increase stakeholder count, penalise single-perspective choices
- GA pattern: remove "transcendent" options, require ground-level commitment
- GAll pattern: introduce consequences for non-action, reward prioritisation

## 4. Item Pool

**Dilemma domains:** Resource allocation, Policy design, Interpersonal conflict, Epistemological disputes. 12 dilemmas per domain, 48 total.
**Stakeholder archetypes:** Each dilemma has 4 stakeholders representing distinct valid frameworks (care, justice, utility, tradition — rotated and contextualised).
**Action options:** 4-6 per dilemma, pre-validated for integration quality scoring. Each option has a coded "perspective profile" indicating which viewpoints it honours/neglects.
**Consequence trees:** Each option leads to 2-3 consequence beats showing differential stakeholder impact. Total graph: ~300 nodes across 48 dilemmas.

## 5. Technical Requirements

**Branching engine:** Finite state machine per dilemma (4-6 choice nodes × 2-3 consequence nodes).
**Metrics captured:** Perspectives accessed (order, duration), deliberation time, choice selected, perspective-map interactions, post-choice reflection accuracy, shadow probability vector.
**Adaptive selection:** IRT-calibrated dilemma difficulty + shadow-targeted selection. Player never sees same dilemma twice until pool exhausted.
**Animation:** Stakeholder vignettes as illustrated panels with voice-over (text fallback). Consequence reveals as brief animated sequences.
**Storage:** ~150 bytes/dilemma-attempt (choice, timing, perspective-access pattern, scores).
**Accessibility:** Full text alternatives for all animated content, adjustable pacing, screen-reader compatible perspective map.
